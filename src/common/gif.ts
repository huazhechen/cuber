import Color from "./color";
import ByteArray from "./bytes";

export class LZW {
  static MAXCODE(bits: number): number {
    return (1 << bits) - 1;
  }
  static EOF = -1;
  static BITS = 12;
  static HSIZE = 5003;
  static MASKS = [
    0x0000, 0x0001, 0x0003, 0x0007, 0x000f, 0x001f, 0x003f, 0x007f, 0x00ff, 0x01ff, 0x03ff, 0x07ff, 0x0fff, 0x1fff,
    0x3fff, 0x7fff, 0xffff,
  ];

  accum = new Uint8Array(256);
  htab = new Int32Array(LZW.HSIZE);
  codetab = new Int32Array(LZW.HSIZE);

  pixels: Uint8Array;
  outs: ByteArray;
  curAccum: number;
  curBits: number;
  aCount: number;
  freeEnt: number;
  maxcode: number;
  clearFlag: boolean;
  initBits: number;
  nBits: number;
  ClearCode: number;
  EOFCode: number;
  remaining: number;
  curPixel: number;

  flushChar(): void {
    if (this.aCount > 0) {
      this.outs.writeByte(this.aCount);
      this.outs.writeBytes(this.accum, this.aCount);
      this.aCount = 0;
    }
  }

  pushChar(c: number): void {
    this.accum[this.aCount++] = c;
    if (this.aCount >= 254) this.flushChar();
  }

  clearBlock(): void {
    this.clearHash(LZW.HSIZE);
    this.freeEnt = this.ClearCode + 2;
    this.clearFlag = true;
    this.output(this.ClearCode);
  }

  clearHash(hsize: number): void {
    for (let i = 0; i < hsize; ++i) this.htab[i] = -1;
  }

  nextPixel(): number {
    if (this.remaining === 0) return LZW.EOF;
    --this.remaining;
    const pix = this.pixels[this.curPixel++];
    return pix & 0xff;
  }

  compress(bits: number): void {
    let fcode, c, i, ent, disp, hshift;
    this.initBits = bits;
    this.nBits = this.initBits;
    this.clearFlag = false;
    this.maxcode = LZW.MAXCODE(this.nBits);

    this.ClearCode = 1 << (bits - 1);
    this.EOFCode = this.ClearCode + 1;
    this.freeEnt = this.ClearCode + 2;

    this.aCount = 0;

    ent = this.nextPixel();

    hshift = 0;
    for (fcode = LZW.HSIZE; fcode < 65536; fcode *= 2) ++hshift;
    hshift = 8 - hshift;
    this.clearHash(LZW.HSIZE);

    this.output(this.ClearCode);

    oloop: while ((c = this.nextPixel()) != LZW.EOF) {
      fcode = (c << LZW.BITS) + ent;
      i = (c << hshift) ^ ent;
      if (this.htab[i] === fcode) {
        ent = this.codetab[i];
        continue;
      } else if (this.htab[i] >= 0) {
        disp = LZW.HSIZE - i;
        if (i === 0) disp = 1;
        do {
          if ((i -= disp) < 0) i += LZW.HSIZE;
          if (this.htab[i] === fcode) {
            ent = this.codetab[i];
            continue oloop;
          }
        } while (this.htab[i] >= 0);
      }
      this.output(ent);
      ent = c;
      if (this.freeEnt < 1 << LZW.BITS) {
        this.codetab[i] = this.freeEnt++;
        this.htab[i] = fcode;
      } else {
        this.clearBlock();
      }
    }

    this.output(ent);
    this.output(this.EOFCode);
  }

  output(code: number): void {
    this.curAccum &= LZW.MASKS[this.curBits];

    if (this.curBits > 0) this.curAccum |= code << this.curBits;
    else this.curAccum = code;

    this.curBits += this.nBits;

    while (this.curBits >= 8) {
      this.pushChar(this.curAccum & 0xff);
      this.curAccum >>= 8;
      this.curBits -= 8;
    }

    if (this.freeEnt > this.maxcode || this.clearFlag) {
      if (this.clearFlag) {
        this.maxcode = LZW.MAXCODE((this.nBits = this.initBits));
        this.clearFlag = false;
      } else {
        ++this.nBits;
        if (this.nBits == LZW.BITS) this.maxcode = 1 << LZW.BITS;
        else this.maxcode = LZW.MAXCODE(this.nBits);
      }
    }

    if (code == this.EOFCode) {
      while (this.curBits > 0) {
        this.pushChar(this.curAccum & 0xff);
        this.curAccum >>= 8;
        this.curBits -= 8;
      }
      this.flushChar();
    }
  }

  encode(pixels: Uint8Array, size: number, depth: number, outs: ByteArray): void {
    this.pixels = pixels;
    this.outs = outs;
    this.curAccum = 0;
    this.curBits = 0;
    this.aCount = 0;
    this.freeEnt = 0;
    this.maxcode = 0;
    this.clearFlag = false;
    this.initBits = 0;
    this.ClearCode = 0;
    this.EOFCode = 0;
    this.outs.writeByte(depth);
    this.remaining = size;
    this.curPixel = 0;
    this.compress(depth + 1);
    this.outs.writeByte(0);
  }
}

export default class GIF {
  width: number;
  height: number;
  delay: number;
  image: Uint8Array;
  data: Uint8Array;
  last: Uint8Array;
  real: Uint8Array;
  dispose: number;
  out: ByteArray;
  transparent = true;
  x0: number;
  x1: number;
  y0: number;
  y1: number;

  private static DEEP = 8;
  private static HASH_SIZE = 12;
  private static HASH_MASK = 0xfff;

  private hash: { rgb: number[]; index: number }[] = new Array(Math.pow(2, GIF.HASH_SIZE));
  private colorn = 0;
  private colors: Uint8Array;
  private preset: { [key: string]: string };

  constructor(preset: { [key: string]: string }) {
    this.dispose = 0;
    this.frames = 0;
    this.preset = preset;
  }

  frames: number;
  enc: LZW;
  start(width: number, height: number, delay: number): void {
    this.width = ~~width;
    this.height = ~~height;
    this.enc = new LZW();
    this.data = new Uint8Array(this.width * this.height);
    this.last = new Uint8Array(this.width * this.height);
    this.real = new Uint8Array(this.width * this.height);
    this.frames = 0;
    this.delay = delay;
    this.out = new ByteArray();
    this.genColorTable();
    this.writeHeader();
    this.writeLSD();
    this.writePalette();
    this.writeNetscapeExt();
  }

  addColor(r: number, g: number, b: number): void {
    const best = this.getColor(r, g, b);
    if (best == 0) {
      this.colors[this.colorn++] = r;
      this.colors[this.colorn++] = g;
      this.colors[this.colorn++] = b;
      return;
    }
    let i = best * 3;
    const cr = this.colors[i++];
    const cg = this.colors[i++];
    const cb = this.colors[i++];
    const d = Color.RGBD([r, g, b], [cr, cg, cb]);
    if (d > 3) {
      this.colors[this.colorn++] = r;
      this.colors[this.colorn++] = g;
      this.colors[this.colorn++] = b;
    }
  }

  genColorTable(): void {
    this.colors = new Uint8Array(3 * Math.pow(2, GIF.DEEP));
    this.colorn = 0;
    this.addColor(0, 0, 0);
    this.addColor(255, 255, 255);
    const max = 3 * Math.pow(2, GIF.DEEP);
    // 原色
    for (const key in this.preset) {
      const rgb = Color.HEX2RGB(this.preset[key]);
      this.addColor(rgb[0], rgb[1], rgb[2]);
    }
    // 黑白
    for (let v = 0; v < 255; v = v + 8) {
      this.addColor(v, v, v);
    }
    // 饱和度
    for (const key in this.preset) {
      const rgb = Color.HEX2RGB(this.preset[key]);
      const hsv = Color.RGB2HSV(rgb);
      let delta = 10;
      let s = hsv[1];
      while (this.colorn < max) {
        s = s - delta;
        delta = delta * 1.25;
        if (s < 0) {
          break;
        }
        const dhsv = [hsv[0], s, hsv[2]];
        const drgb = Color.HSV2RGB(dhsv);
        this.addColor(drgb[0], drgb[1], drgb[2]);
      }
    }
    // 亮度
    for (const key in this.preset) {
      const rgb = Color.HEX2RGB(this.preset[key]);
      const hsv = Color.RGB2HSV(rgb);
      let delta = 10;
      let v = hsv[2];
      while (this.colorn < max) {
        v = v - delta;
        delta = delta * 1.25;
        if (v < 0) {
          break;
        }
        const dhsv = [hsv[0], hsv[1], v];
        const drgb = Color.HSV2RGB(dhsv);
        this.addColor(drgb[0], drgb[1], drgb[2]);
      }
    }
    // 阴影
    for (let delta = 0; this.colorn < max; delta++) {
      for (const key in this.preset) {
        const rgb = Color.HEX2RGB(this.preset[key]);
        const hsv = Color.RGB2HSV(rgb);
        const v = hsv[2] - delta;
        if (v < 0) {
          continue;
        }
        const dhsv = [hsv[0], hsv[1], v];
        const drgb = Color.HSV2RGB(dhsv);
        this.addColor(drgb[0], drgb[1], drgb[2]);
      }
    }
    if (this.colorn > 3 * Math.pow(2, GIF.DEEP)) {
      this.colorn = 3 * Math.pow(2, GIF.DEEP);
    }
    return;
  }

  getColor(r: number, g: number, b: number): number {
    let index = 1;
    let dmin = 256 * 256 * 256;
    let best = 0;
    for (let i = 3; i < this.colorn; index++) {
      const cr = this.colors[i++];
      const cg = this.colors[i++];
      const cb = this.colors[i++];
      const d = Color.RGBD([r, g, b], [cr, cg, cb]);
      if (d < 2) {
        return index;
      }
      if (d < dmin) {
        dmin = d;
        best = index;
      }
    }
    return best;
  }

  getPixels(): void {
    const w = this.width;
    const h = this.height;
    this.x0 = w;
    this.x1 = 0;
    this.y0 = h;
    this.y1 = 0;
    let r;
    let g;
    let b;
    let from;
    let to;
    let index;
    let hash;
    let offset;
    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        from = i * w + j;
        to = (h - i - 1) * w + j;
        offset = from * 4;
        r = this.image[offset + 0];
        g = this.image[offset + 1];
        b = this.image[offset + 2];
        hash = (r * 31 + g) * 31 + b;
        hash = hash & GIF.HASH_MASK;
        if (
          this.hash[hash] &&
          this.hash[hash].rgb[0] == r &&
          this.hash[hash].rgb[1] == g &&
          this.hash[hash].rgb[2] == b
        ) {
          index = this.hash[hash].index;
        } else {
          index = this.getColor(r, g, b);
          this.hash[hash] = { rgb: [r, g, b], index: index };
        }
        if (this.last[to] == index) {
          this.data[to] = 0;
        } else {
          this.x0 = Math.min(this.x0, j);
          this.x1 = Math.max(this.x1, j + 1);
          this.y0 = Math.min(this.y0, h - i - 1);
          this.y1 = Math.max(this.y1, h - i);
          this.data[to] = index;
          this.last[to] = index;
        }
      }
    }
    if (this.x0 >= this.x1 || this.y0 >= this.y1) {
      this.x0 = 0;
      this.x1 = 1;
      this.y0 = 0;
      this.y1 = 1;
    }
  }

  add(image: Uint8Array): void {
    this.image = image;
    this.getPixels();
    this.writeGraphicCtrlExt();
    this.writeImageDesc();
    this.writePixels();
    this.frames++;
  }

  finish(): void {
    this.out.writeByte(0x3b);
  }

  writeHeader(): void {
    this.out.writeString("GIF89a");
  }

  writeGraphicCtrlExt(): void {
    this.out.writeByte(0x21); // extension introducer
    this.out.writeByte(0xf9); // GCE label
    this.out.writeByte(4); // data block size

    const transp = this.transparent ? 1 : 0;
    let disp = this.dispose & 7;
    disp <<= 2;

    // packed fields
    this.out.writeByte(
      0 | // 1:3 reserved
        disp | // 4:6 disposal
        0 | // 7 user input - 0 = none
        transp // 8 transparency flag
    );

    this.out.writeShort(this.delay); // delay x 1/100 sec
    this.out.writeByte(0); // transparent color index
    this.out.writeByte(0); // block terminator
  }

  writeImageDesc(): void {
    this.out.writeByte(0x2c); // image separator
    this.out.writeShort(this.x0); // image position x,y = 0,0
    this.out.writeShort(this.y0);
    this.out.writeShort(this.x1 - this.x0); // image size
    this.out.writeShort(this.y1 - this.y0);
    this.out.writeByte(0);
  }

  writeLSD(): void {
    // logical screen size
    this.out.writeShort(this.width);
    this.out.writeShort(this.height);

    // packed fields
    this.out.writeByte(
      0x80 | // 1 : global color table flag = 1 (gct used)
        ((GIF.DEEP - 1) << 4) | // 2-4 : color resolution = 7
        0x00 | // 5 : gct sort flag = 0
        (GIF.DEEP - 1) // 6-8 : gct size
    );

    this.out.writeByte(0); // background color index
    this.out.writeByte(0); // pixel aspect ratio - assume 1:1
  }

  writeNetscapeExt(): void {
    this.out.writeByte(0x21); // extension introducer
    this.out.writeByte(0xff); // app extension label
    this.out.writeByte(11); // block size
    this.out.writeString("NETSCAPE2.0"); // app id + auth code
    this.out.writeByte(3); // sub-block size
    this.out.writeByte(1); // loop sub-block id
    this.out.writeShort(0); // loop count (extra iterations, 0=repeat forever)
    this.out.writeByte(0); // block terminator
  }

  writePalette(): void {
    this.out.writeBytes(this.colors);
  }

  writePixels(): void {
    const width = this.x1 - this.x0;
    const height = this.y1 - this.y0;
    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        this.real[j * width + i] = this.data[(j + this.y0) * this.width + i + this.x0];
      }
    }
    this.enc.encode(this.real, width * height, GIF.DEEP, this.out);
  }
}
