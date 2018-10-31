export class Encoder {

  private _canvas: HTMLCanvasElement;
  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
  }

  public repeat = 0;
  public delay = 1
  public dispose = 0;
  public blend = 1;

  private _frames = -1;
  private _seq = -1
  data: Uint8Array;
  encoding = false;

  start() {
    this.encoding = true;
    this.data = new Uint8Array(0);
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
      this.data = concat(this.data, signature);

      let chunk = findChunk(bytes, "IHDR");
      if (chunk == null) {
        throw new Error();
      }
      let slice = bytes.slice(chunk.idx, chunk.idx + 12 + chunk.len);
      this.data = concat(this.data, slice)

      let acTL = new Uint8Array(0);
      acTL = concat(acTL, new Uint8Array([0, 0, 0, 8]));
      acTL = concat(acTL, str4ToBytes4("acTL"));
      acTL = concat(acTL, new Uint8Array([0, 0, 0, 1]));
      acTL = concat(acTL, int32ToBytes4(this.repeat));
      let crc = crc32b(acTL.slice(4, 4 + 4 + 8));
      acTL = concat(acTL, int32ToBytes4(crc));
      this.data = concat(this.data, acTL);

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
          fcTL = concat(fcTL, int16ToBytes2(this.delay))
          fcTL = concat(fcTL, int16ToBytes2(100))
          fcTL = concat(fcTL, new Uint8Array([this.dispose]))
          fcTL = concat(fcTL, new Uint8Array([this.blend]))

          let crc = crc32b(fcTL.slice(4, 4 + 4 + 26));
          fcTL = concat(fcTL, int32ToBytes4(crc))
          this.data = concat(this.data, fcTL)
        }

        chunk = chunks[i];  // copy complete IDAT chunk
        let slice = bytes.slice(chunk.idx, chunk.idx + 12 + chunk.len);
        this.data = concat(this.data, slice)  // push to main stream
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
          fcTL = concat(fcTL, int16ToBytes2(this.delay));
          fcTL = concat(fcTL, int16ToBytes2(100));
          fcTL = concat(fcTL, new Uint8Array([this.dispose]));
          fcTL = concat(fcTL, new Uint8Array([this.blend]));

          let crc = crc32b(fcTL.slice(4, 4 + 4 + 26));
          fcTL = concat(fcTL, int32ToBytes4(crc))
          this.data = concat(this.data, fcTL)
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
        let crc = crc32b(fdAT.slice(4, 4 + 4 + len_fdAT));
        fdAT = concat(fdAT, int32ToBytes4(crc))

        this.data = concat(this.data, fdAT)
      }

    }

    return 0;
  }

  finish() {
    if (!this.encoding) {
      throw new Error();
    };
    let suffix = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]);
    this.data = concat(this.data, suffix)

    let chunk = findChunk(this.data, "acTL");
    if (chunk == null) {
      throw new Error();
    }
    let frames = int32ToBytes4(this._frames + 1);
    this.data[chunk.idx + 8] = frames[0];
    this.data[chunk.idx + 8 + 1] = frames[1];
    this.data[chunk.idx + 8 + 2] = frames[2];
    this.data[chunk.idx + 8 + 3] = frames[3];

    let actl = this.data.slice(chunk.idx + 4, chunk.idx + 4 + 4 + 8);
    let crc = crc32b(actl);
    let bytes = int32ToBytes4(crc);
    this.data[chunk.idx + 4 + 4 + 8] = bytes[0];
    this.data[chunk.idx + 4 + 4 + 8 + 1] = bytes[1];
    this.data[chunk.idx + 4 + 4 + 8 + 2] = bytes[2];
    this.data[chunk.idx + 4 + 4 + 8 + 3] = bytes[3];

    this.encoding = false;
    return this.data;
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

let TABLE_A = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";
let TABLE_B = TABLE_A.split(' ').map(function (s) { return parseInt(s, 16) });

function crc32b(arr: Uint8Array) {
  let crc = -1;
  for (let i = 0; i < arr.length; i++) {
    crc = (crc >>> 8) ^ TABLE_B[(crc ^ arr[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

