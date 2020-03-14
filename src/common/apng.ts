import Util from "./util"
import ByteArray from "./bytes";
export class APNG {

  private _canvas: HTMLCanvasElement;
  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
  }

  public repeat = 0;
  public delay_num = 2;
  public delay_den = 100;
  public dispose = 1;
  public blend = 1;

  private _frames = -1;
  private _seq = -1
  data: ByteArray;
  encoding = false;

  start() {
    this.encoding = true;
    this.data = new ByteArray();
    this._frames = -1;
    this._seq = -1;
    return 0;
  }

  addFrame() {
    if ((this._canvas === null) || !this.encoding || this.data === null) {
      throw new Error();
    }
    this._frames += 1;
    let png = this._canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, "");
    let bytes = base64ToBytes(png);
    let chunk: Chunk;

    if (this._frames == 0) {
      let signature = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      this.data.writeBytes(signature);

      let chunk = findChunk(bytes, "IHDR");
      if (chunk == null) {
        throw new Error();
      }
      let slice = bytes.slice(chunk.idx, chunk.idx + 12 + chunk.len);
      this.data.writeBytes(slice);

      let acTL = new Uint8Array(0);
      acTL = concat(acTL, new Uint8Array([0, 0, 0, 8]));
      acTL = concat(acTL, str4ToBytes4("acTL"));
      acTL = concat(acTL, new Uint8Array([0, 0, 0, 1]));
      acTL = concat(acTL, int32ToBytes4(this.repeat));
      let crc = Util.CRC32(acTL.slice(4, 4 + 4 + 8));
      acTL = concat(acTL, int32ToBytes4(crc));

      this.data.writeBytes(acTL);

      let chunks = findChunkAll(bytes, "IDAT");
      for (let i = 0; i < chunks.length; i++) {
        if (i == 0) {
          this._seq += 1;
          let fcTL = new Uint8Array(0);
          fcTL = concat(fcTL, int32ToBytes4(26))
          fcTL = concat(fcTL, str4ToBytes4("fcTL"))
          fcTL = concat(fcTL, int32ToBytes4(this._seq))
          fcTL = concat(fcTL, int32ToBytes4(this._canvas.width))
          fcTL = concat(fcTL, int32ToBytes4(this._canvas.height))
          fcTL = concat(fcTL, int32ToBytes4(0))
          fcTL = concat(fcTL, int32ToBytes4(0))
          fcTL = concat(fcTL, int16ToBytes2(this.delay_num))
          fcTL = concat(fcTL, int16ToBytes2(this.delay_den))
          fcTL = concat(fcTL, new Uint8Array([this.dispose]))
          fcTL = concat(fcTL, new Uint8Array([this.blend]))

          let crc = Util.CRC32(fcTL.slice(4, 4 + 4 + 26));
          fcTL = concat(fcTL, int32ToBytes4(crc))
          this.data.writeBytes(fcTL);
        }

        chunk = chunks[i];  // copy complete IDAT chunk
        let slice = bytes.slice(chunk.idx, chunk.idx + 12 + chunk.len);
        this.data.writeBytes(slice);
      }  // for

    }  // first frame

    if (this._frames > 0) {
      let chunks = findChunkAll(bytes, "IDAT");
      for (let i = 0; i < chunks.length; i++) {
        if (i == 0) {
          this._seq += 1;
          let fcTL = new Uint8Array(0);
          fcTL = concat(fcTL, int32ToBytes4(26));
          fcTL = concat(fcTL, str4ToBytes4("fcTL"));
          fcTL = concat(fcTL, int32ToBytes4(this._seq));
          fcTL = concat(fcTL, int32ToBytes4(this._canvas.width));
          fcTL = concat(fcTL, int32ToBytes4(this._canvas.height));
          fcTL = concat(fcTL, int32ToBytes4(0));
          fcTL = concat(fcTL, int32ToBytes4(0));
          fcTL = concat(fcTL, int16ToBytes2(this.delay_num));
          fcTL = concat(fcTL, int16ToBytes2(this.delay_den));
          fcTL = concat(fcTL, new Uint8Array([this.dispose]));
          fcTL = concat(fcTL, new Uint8Array([this.blend]));

          let crc = Util.CRC32(fcTL.slice(4, 4 + 4 + 26));
          fcTL = concat(fcTL, int32ToBytes4(crc))
          this.data.writeBytes(fcTL);
        }

        chunk = chunks[i];
        let chunk_IDAT_data = bytes.slice(chunk.idx + 8, chunk.idx + 8 + chunk.len);
        let len_fdAT = chunk.len + 4;

        this._seq += 1;
        let fdAT = new Uint8Array(0);
        fdAT = concat(fdAT, int32ToBytes4(len_fdAT))
        fdAT = concat(fdAT, str4ToBytes4("fdAT"))
        fdAT = concat(fdAT, int32ToBytes4(this._seq))
        fdAT = concat(fdAT, chunk_IDAT_data)
        let crc = Util.CRC32(fdAT.slice(4, 4 + 4 + len_fdAT));
        fdAT = concat(fdAT, int32ToBytes4(crc))

        this.data.writeBytes(fdAT);
      }

    }

    return 0;
  }

  finish() {
    if (!this.encoding) {
      throw new Error();
    };
    let suffix = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]);
    this.data.writeBytes(suffix);
    let output = this.data.getData();

    let chunk = findChunk(output, "acTL");
    if (chunk == null) {
      throw new Error();
    }
    let frames = int32ToBytes4(this._frames + 1);
    output[chunk.idx + 8] = frames[0];
    output[chunk.idx + 8 + 1] = frames[1];
    output[chunk.idx + 8 + 2] = frames[2];
    output[chunk.idx + 8 + 3] = frames[3];

    let actl = output.slice(chunk.idx + 4, chunk.idx + 4 + 4 + 8);
    let crc = Util.CRC32(actl);
    let bytes = int32ToBytes4(crc);
    output[chunk.idx + 4 + 4 + 8] = bytes[0];
    output[chunk.idx + 4 + 4 + 8 + 1] = bytes[1];
    output[chunk.idx + 4 + 4 + 8 + 2] = bytes[2];
    output[chunk.idx + 4 + 4 + 8 + 3] = bytes[3];

    this.encoding = false;
    return output;
  }
}
class Chunk {
  idx: number;
  len: number;
  type: string;
  constructor(idx: number, len: number, type: string) {
    this.idx = idx;
    this.len = len;
    this.type = type;
  }
}

function findChunk(bytes: Uint8Array, type: string) {
  let offset = 8;
  let chunk = null;
  while (offset < bytes.length) {
    let chunk1 = bytes.slice(offset, offset + 4);
    let chunk2 = bytes.slice(offset + 4, offset + 8);
    let chunkLength = bytes4ToInt32(chunk1);
    let chunkType = bytes4ToStr4(chunk2);
    if (chunkType === type) {
      chunk = new Chunk(offset, chunkLength, chunkType);
      return chunk;
    }
    offset += 4 + 4 + chunkLength + 4;
  }
  return chunk;
}

function findChunkAll(bytes: Uint8Array, type: string) {
  let offset = 8;
  let chunk = null;
  let chunkArray = [];
  while (offset < bytes.length) {
    let chunk1 = bytes.slice(offset, offset + 4);
    let chunk2 = bytes.slice(offset + 4, offset + 8);
    let chunkLength = bytes4ToInt32(chunk1);
    let chunkType = bytes4ToStr4(chunk2);
    if (chunkType === type) {
      chunk = new Chunk(offset, chunkLength, chunkType);
      chunkArray.push(chunk);
    }
    offset += 4 + 4 + chunkLength + 4;
  }

  return chunkArray;
}

function concat(a: Uint8Array, b: Uint8Array) {
  let c = new Uint8Array(a.length + b.length);
  c.set(a);
  c.set(b, a.length);
  return c;
}

function base64ToBytes(value: string) {
  let decoded = atob(value);
  let len = decoded.length;
  let arr = new Uint8Array(len);
  for (let i = 0; i < len; ++i) {
    arr[i] = decoded.charCodeAt(i);
  }
  return arr;
}

function str4ToBytes4(value: string) {
  let cc = new Uint8Array(4);
  cc[0] = value.charCodeAt(0);
  cc[1] = value.charCodeAt(1);
  cc[2] = value.charCodeAt(2);
  cc[3] = value.charCodeAt(3);
  return cc;
}

function bytes4ToStr4(bytes: Uint8Array) {
  let cc =
    String.fromCharCode(bytes[0]) +
    String.fromCharCode(bytes[1]) +
    String.fromCharCode(bytes[2]) +
    String.fromCharCode(bytes[3]);
  return cc;
}

function int32ToBytes4(value: number) {
  let int32 = value;
  let arr = new Uint8Array([0, 0, 0, 0]);
  for (let idx = 0; idx < arr.length; idx++) {
    let byte = int32 & 0xff;
    arr[idx] = byte;
    int32 = (int32 - byte) / 256;
  }
  return arr.reverse();
}

function bytes4ToInt32(bytes: Uint8Array) {
  let num = (bytes[0] << 24) + (bytes[1] << 12) + (bytes[2] << 8) + bytes[3];
  return num;
}

function int16ToBytes2(value: number) {
  let int16 = value;
  let arr = new Uint8Array([0, 0]);
  for (let idx = 0; idx < arr.length; idx++) {
    let byte = int16 & 0xff;
    arr[idx] = byte;
    int16 = (int16 - byte) / 256;
  }
  return arr.reverse();
}
