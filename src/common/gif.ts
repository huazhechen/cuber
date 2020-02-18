import { COLORS, RGB, RGB2HSV, HSV2RGB, RGBD } from "./define";

class ByteArray {
  static SIZE = 4096;
  static CHAR_MAP = (() => {
    let map = [];
    for (var i = 0; i < 256; i++) {
      map[i] = String.fromCharCode(i);
    }
    return map;
  })();

  pages: Uint8Array[] = [];
  cursor: number = 0;
  constructor() {
    this.newPage();
  }

  newPage() {
    this.pages.push(new Uint8Array(ByteArray.SIZE));
    this.cursor = 0;
  }

  getData() {
    let length = (this.pages.length - 1) * ByteArray.SIZE + this.cursor;
    let data = new Uint8Array(length);
    let index = 0;
    for (var p = 0; p < this.pages.length; p++) {
      for (var i = 0; i < ByteArray.SIZE; i++) {
        data[index++] = this.pages[p][i];
        if (index == data.length) {
          break;
        }
      }
    }
    return data;
  }

  writeByte(value: number) {
    if (this.cursor >= ByteArray.SIZE) {
      this.newPage();
    }
    this.pages[this.pages.length - 1][this.cursor++] = value;
  }

  writeBytes(array: Uint8Array, length: number | null = null) {
    for (var i = 0; i < (length == null ? array.length : length); i++) {
      this.writeByte(array[i]);
    }
  }

  writeString(value: string) {
    for (var l = value.length, i = 0; i < l; i++) {
      this.writeByte(value.charCodeAt(i));
    }
  }
}

export class LZW {
  static MAXCODE(bits: number) {
    return (1 << bits) - 1;
  }
  static EOF = -1;
  static BITS = 12;
  static HSIZE = 5003;
  static MASKS = [0x0000, 0x0001, 0x0003, 0x0007, 0x000f, 0x001f, 0x003f, 0x007f, 0x00ff, 0x01ff, 0x03ff, 0x07ff, 0x0fff, 0x1fff, 0x3fff, 0x7fff, 0xffff];

  width: number;
  height: number;
  depth: number;
  constructor(width: number, height: number, depth: number) {
    this.width = width;
    this.height = height;
    this.depth = depth;
  }
  accum = new Uint8Array(256);
  htab = new Int32Array(LZW.HSIZE);
  codetab = new Int32Array(LZW.HSIZE);

  pixels: Uint8Array;
  outs: ByteArray;
  cur_accum: number;
  cur_bits: number;
  a_count: number;
  free_ent: number;
  maxcode: number;
  clear_flg: boolean;
  g_init_bits: number;
  n_bits: number;
  ClearCode: number;
  EOFCode: number;
  remaining: number;
  curPixel: number;

  flush_char() {
    if (this.a_count > 0) {
      this.outs.writeByte(this.a_count);
      this.outs.writeBytes(this.accum, this.a_count);
      this.a_count = 0;
    }
  }

  char_out(c: number) {
    this.accum[this.a_count++] = c;
    if (this.a_count >= 254) this.flush_char();
  }

  cl_block() {
    this.cl_hash(LZW.HSIZE);
    this.free_ent = this.ClearCode + 2;
    this.clear_flg = true;
    this.output(this.ClearCode);
  }

  cl_hash(hsize: number) {
    for (var i = 0; i < hsize; ++i) this.htab[i] = -1;
  }

  nextPixel() {
    if (this.remaining === 0) return LZW.EOF;
    --this.remaining;
    var pix = this.pixels[this.curPixel++];
    return pix & 0xff;
  }

  compress(init_bits: number) {
    var fcode, c, i, ent, disp, hsize_reg, hshift;
    this.g_init_bits = init_bits;
    this.n_bits = this.g_init_bits;
    this.clear_flg = false;
    this.maxcode = LZW.MAXCODE(this.n_bits);

    this.ClearCode = 1 << (init_bits - 1);
    this.EOFCode = this.ClearCode + 1;
    this.free_ent = this.ClearCode + 2;

    this.a_count = 0;

    ent = this.nextPixel();

    hshift = 0;
    for (fcode = LZW.HSIZE; fcode < 65536; fcode *= 2) ++hshift;
    hshift = 8 - hshift;
    hsize_reg = LZW.HSIZE;
    this.cl_hash(hsize_reg);

    this.output(this.ClearCode);

    outer_loop: while ((c = this.nextPixel()) != LZW.EOF) {
      fcode = (c << LZW.BITS) + ent;
      i = (c << hshift) ^ ent;
      if (this.htab[i] === fcode) {
        ent = this.codetab[i];
        continue;
      } else if (this.htab[i] >= 0) {
        disp = hsize_reg - i;
        if (i === 0) disp = 1;
        do {
          if ((i -= disp) < 0) i += hsize_reg;
          if (this.htab[i] === fcode) {
            ent = this.codetab[i];
            continue outer_loop;
          }
        } while (this.htab[i] >= 0);
      }
      this.output(ent);
      ent = c;
      if (this.free_ent < 1 << LZW.BITS) {
        this.codetab[i] = this.free_ent++;
        this.htab[i] = fcode;
      } else {
        this.cl_block();
      }
    }

    this.output(ent);
    this.output(this.EOFCode);
  }

  output(code: number) {
    this.cur_accum &= LZW.MASKS[this.cur_bits];

    if (this.cur_bits > 0) this.cur_accum |= code << this.cur_bits;
    else this.cur_accum = code;

    this.cur_bits += this.n_bits;

    while (this.cur_bits >= 8) {
      this.char_out(this.cur_accum & 0xff);
      this.cur_accum >>= 8;
      this.cur_bits -= 8;
    }

    if (this.free_ent > this.maxcode || this.clear_flg) {
      if (this.clear_flg) {
        this.maxcode = LZW.MAXCODE((this.n_bits = this.g_init_bits));
        this.clear_flg = false;
      } else {
        ++this.n_bits;
        if (this.n_bits == LZW.BITS) this.maxcode = 1 << LZW.BITS;
        else this.maxcode = LZW.MAXCODE(this.n_bits);
      }
    }

    if (code == this.EOFCode) {
      while (this.cur_bits > 0) {
        this.char_out(this.cur_accum & 0xff);
        this.cur_accum >>= 8;
        this.cur_bits -= 8;
      }
      this.flush_char();
    }
  }

  encode(pixels: Uint8Array, outs: ByteArray) {
    this.pixels = pixels;
    this.outs = outs;
    this.cur_accum = 0;
    this.cur_bits = 0;
    this.a_count = 0;
    this.free_ent = 0;
    this.maxcode = 0;
    this.clear_flg = false;
    this.g_init_bits = 0;
    this.ClearCode = 0;
    this.EOFCode = 0;
    this.outs.writeByte(this.depth);
    this.remaining = this.width * this.height;
    this.curPixel = 0;
    this.compress(this.depth + 1);
    this.outs.writeByte(0);
  }
}

export default class GIF {
  width: number;
  height: number;
  delay: number;
  image: Uint8Array;
  pre: Uint8Array | null = null;
  data: Uint8Array;
  last: Uint8Array;
  real: Uint8Array;
  dispose: number;
  out: ByteArray;
  transparent: boolean = true;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  private static DEEP = 8;
  private static COLORN = 0;

  private static COLORS: Uint8Array = (() => {
    let colors = new Uint8Array(3 * Math.pow(2, GIF.DEEP));
    let i = 0;
    // TRANSPARENT
    colors[i++] = 0xff;
    colors[i++] = 0x00;
    colors[i++] = 0x00;
    // BLACK-WHITE
    colors[i++] = 0xff;
    colors[i++] = 0xff;
    colors[i++] = 0xff;
    for (let v = 0; v < 255; v = v + 4) {
      colors[i++] = v;
      colors[i++] = v;
      colors[i++] = v;
    }
    // LIGHT
    for (const key in COLORS) {
      let rgb = RGB((<any>COLORS)[key]);
      let hsv = RGB2HSV(rgb);
      if (hsv[1] == 0 || hsv[2] == 0) {
        continue;
      }
      let value = hsv[2];
      for (let d = 0; d < 24; d++) {
        value = value - 2 ** Math.ceil(d / 8);
        if (value < 0) {
          break;
        }
        let dhsv = [hsv[0], hsv[1], value];
        let drgb = HSV2RGB(dhsv);
        colors[i++] = drgb[0];
        colors[i++] = drgb[1];
        colors[i++] = drgb[2];
      }
      if (hsv[1] >= 9) {
        for (let d = 0; d < 2; d++) {
          let dhsv = [hsv[0], (hsv[1] / 3) * (d + 1), hsv[2]];
          let drgb = HSV2RGB(dhsv);
          colors[i++] = drgb[0];
          colors[i++] = drgb[1];
          colors[i++] = drgb[2];
        }
      }
    }
    GIF.COLORN = i;
    if (GIF.COLORN > 3 * Math.pow(2, GIF.DEEP)) {
      throw "too many colors";
    }
    return colors;
  })();

  constructor(width: number, height: number, delay: number) {
    this.width = ~~width;
    this.height = ~~height;
    this.delay = delay;
    this.data = new Uint8Array(this.width * this.height);
    this.last = new Uint8Array(this.width * this.height);
    this.real = new Uint8Array(this.width * this.height);
    this.dispose = 0;
  }

  start() {
    this.out = new ByteArray();
    this.writeHeader();
    this.writeLSD();
    this.writePalette();
    this.writeNetscapeExt();
  }

  getColor(r: number, g: number, b: number) {
    let index = 0;
    let dmin = 256 * 256 * 256;
    let best = 0;
    for (let i = 0; i < GIF.COLORN; index++) {
      let dr = r - GIF.COLORS[i++];
      let dg = g - GIF.COLORS[i++];
      let db = b - GIF.COLORS[i++];
      let d = Math.abs(dr) * 0.297 + Math.abs(dg) * 0.593 + Math.abs(db) * 0.11;
      if (d == 0) {
        return index;
      }
      if (d < dmin) {
        dmin = d;
        best = index;
      }
    }
    return best;
  }

  getPixels() {
    var w = this.width;
    var h = this.height;
    let lr = -1;
    let lg = -1;
    let lb = -1;
    let li = -1;
    this.x0 = w;
    this.x1 = 0;
    this.y0 = h;
    this.y1 = 0;
    for (var i = 0; i < h; i++) {
      for (var j = 0; j < w; j++) {
        let from = i * w + j;
        let to = (h - i - 1) * w + j;
        let r = this.image[from * 4 + 0];
        let g = this.image[from * 4 + 1];
        let b = this.image[from * 4 + 2];
        let index;
        if (r == lr && g == lg && b == lb) {
          index = li;
        } else {
          if (this.pre && r == this.pre[from * 4 + 0] && g == this.pre[from * 4 + 1] && b == this.pre[from * 4 + 2]) {
            index = this.last[to];
          } else {
            index = this.getColor(r, g, b);
          }
          lr = r;
          lg = g;
          lb = b;
          li = index;
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

  add(image: Uint8Array) {
    this.image = image;
    this.getPixels();
    this.writeGraphicCtrlExt();
    this.writeImageDesc();
    this.writePixels();
    this.pre = image;
  }

  finish() {
    this.out.writeByte(0x3b);
  }
  writeShort(value: number) {
    this.out.writeByte(value & 0xff);
    this.out.writeByte((value >> 8) & 0xff);
  }

  writeHeader() {
    this.out.writeString("GIF89a");
  }

  writeGraphicCtrlExt() {
    this.out.writeByte(0x21); // extension introducer
    this.out.writeByte(0xf9); // GCE label
    this.out.writeByte(4); // data block size

    var transp = this.transparent ? 1 : 0;
    let disp = this.dispose & 7;
    disp <<= 2;

    // packed fields
    this.out.writeByte(
      0 | // 1:3 reserved
      disp | // 4:6 disposal
      0 | // 7 user input - 0 = none
        transp // 8 transparency flag
    );

    this.writeShort(this.delay); // delay x 1/100 sec
    this.out.writeByte(0); // transparent color index
    this.out.writeByte(0); // block terminator
  }

  writeImageDesc() {
    this.out.writeByte(0x2c); // image separator
    this.writeShort(this.x0); // image position x,y = 0,0
    this.writeShort(this.y0);
    this.writeShort(this.x1 - this.x0); // image size
    this.writeShort(this.y1 - this.y0);
    this.out.writeByte(0);
  }

  writeLSD() {
    // logical screen size
    this.writeShort(this.width);
    this.writeShort(this.height);

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

  writeNetscapeExt() {
    this.out.writeByte(0x21); // extension introducer
    this.out.writeByte(0xff); // app extension label
    this.out.writeByte(11); // block size
    this.out.writeString("NETSCAPE2.0"); // app id + auth code
    this.out.writeByte(3); // sub-block size
    this.out.writeByte(1); // loop sub-block id
    this.writeShort(0); // loop count (extra iterations, 0=repeat forever)
    this.out.writeByte(0); // block terminator
  }

  writePalette() {
    this.out.writeBytes(GIF.COLORS);
  }

  writePixels() {
    let width = this.x1 - this.x0;
    let height = this.y1 - this.y0;
    var enc = new LZW(width, height, GIF.DEEP);
    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        this.real[j * width + i] = this.data[(j + this.y0) * this.width + i + this.x0];
      }
    }
    enc.encode(this.real, this.out);
  }
}
