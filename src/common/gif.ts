import Color from "./color";
import { COLORS } from "../cuber/define";
import ByteArray from "./bytes";

export class LZW {
  static MAXCODE(bits: number) {
    return (1 << bits) - 1;
  }
  static EOF = -1;
  static BITS = 12;
  static HSIZE = 5003;
  static MASKS = [
    0x0000,
    0x0001,
    0x0003,
    0x0007,
    0x000f,
    0x001f,
    0x003f,
    0x007f,
    0x00ff,
    0x01ff,
    0x03ff,
    0x07ff,
    0x0fff,
    0x1fff,
    0x3fff,
    0x7fff,
    0xffff,
  ];

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
  data: Uint8Array;
  last: Uint8Array;
  dispose: number;
  out: ByteArray;
  transparent: boolean = true;

  private static DEEP = 8;
  private static HASH_SIZE = 12;
  private static HASH_MASK = 0xfff;
  private static HASH: { RGB: number[]; index: number }[] = new Array(Math.pow(2, GIF.HASH_SIZE));

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
      let rgb = Color.RGB((<any>COLORS)[key]);
      let hsv = Color.RGB2HSV(rgb);
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
        let drgb = Color.HSV2RGB(dhsv);
        colors[i++] = drgb[0];
        colors[i++] = drgb[1];
        colors[i++] = drgb[2];
      }
      if (hsv[1] >= 9) {
        for (let d = 0; d < 2; d++) {
          let dhsv = [hsv[0], (hsv[1] / 3) * (d + 1), hsv[2]];
          let drgb = Color.HSV2RGB(dhsv);
          colors[i++] = drgb[0];
          colors[i++] = drgb[1];
          colors[i++] = drgb[2];
        }
      }
    }
    GIF.COLORN = i;
    if (GIF.COLORN > 3 * Math.pow(2, GIF.DEEP)) {
      throw "too many colors: " + GIF.COLORN / 3;
    }
    return colors;
  })();

  constructor() {
    this.dispose = 0;
    this.frames = 0;
  }

  frames: number;
  enc: LZW;
  start(width: number, height: number, delay: number) {
    this.width = ~~width;
    this.height = ~~height;
    this.enc = new LZW(this.width, this.height, GIF.DEEP);
    this.data = new Uint8Array(this.width * this.height);
    this.last = new Uint8Array(this.width * this.height);
    this.frames = 0;
    this.delay = delay;
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
      let cr = GIF.COLORS[i++];
      let cg = GIF.COLORS[i++];
      let cb = GIF.COLORS[i++];
      let d = Color.RGBD([r, g, b], [cr, cg, cb]);
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
    let w = this.width;
    let h = this.height;
    let a;
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
        a = this.image[offset + 3];
        index = 0;
        if (a == 0) {
          index = 1;
        } else {
          r = this.image[offset + 0];
          g = this.image[offset + 1];
          b = this.image[offset + 2];
          hash = (r * 31 + g) * 31 + b;
          hash = hash & GIF.HASH_MASK;
          if (
            GIF.HASH[hash] &&
            GIF.HASH[hash].RGB[0] == r &&
            GIF.HASH[hash].RGB[1] == g &&
            GIF.HASH[hash].RGB[2] == b
          ) {
            index = GIF.HASH[hash].index;
          } else {
            index = this.getColor(r, g, b);
            GIF.HASH[hash] = { RGB: [r, g, b], index: index };
          }
        }
        if (this.last[to] == index) {
          this.data[to] = 0;
        } else {
          this.data[to] = index;
          this.last[to] = index;
        }
      }
    }
  }

  add(image: Uint8Array) {
    this.image = image;
    this.getPixels();
    this.writeGraphicCtrlExt();
    this.writeImageDesc();
    this.writePixels();
    this.frames++;
  }

  finish() {
    this.out.writeByte(0x3b);
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

    this.out.writeShort(this.delay); // delay x 1/100 sec
    this.out.writeByte(0); // transparent color index
    this.out.writeByte(0); // block terminator
  }

  writeImageDesc() {
    this.out.writeByte(0x2c); // image separator
    this.out.writeShort(0); // image position x,y = 0,0
    this.out.writeShort(0);
    this.out.writeShort(this.width); // image size
    this.out.writeShort(this.height);
    this.out.writeByte(0);
  }

  writeLSD() {
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

  writeNetscapeExt() {
    this.out.writeByte(0x21); // extension introducer
    this.out.writeByte(0xff); // app extension label
    this.out.writeByte(11); // block size
    this.out.writeString("NETSCAPE2.0"); // app id + auth code
    this.out.writeByte(3); // sub-block size
    this.out.writeByte(1); // loop sub-block id
    this.out.writeShort(0); // loop count (extra iterations, 0=repeat forever)
    this.out.writeByte(0); // block terminator
  }

  writePalette() {
    this.out.writeBytes(GIF.COLORS);
  }

  writePixels() {
    this.enc.encode(this.data, this.out);
  }
}
