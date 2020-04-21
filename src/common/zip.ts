import ByteArray from "./bytes";
import Util from "./util";

// 根据zip格式定义实现: https://pkware.cachefly.net/webdocs/APPNOTE/APPNOTE-6.2.0.txt
export default class ZIP {
  out: ByteArray;
  files: { name: string; length: number; crc: number; offset: number }[] = [];
  num: number;

  init(): void {
    this.out = new ByteArray();
    this.files = [];
    this.num = 0;
  }

  add(name: string, data: Uint8Array): void {
    const crc = Util.CRC32(data);
    this.files.push({ name: name, length: data.length, crc: crc, offset: this.out.length });
    // local file header signature     4 bytes  (0x04034b50)
    this.out.writeLong(0x04034b50);
    // version needed to extract       2 bytes
    this.out.writeShort(0x0a);
    // general purpose bit flag        2 bytes
    this.out.writeShort(0);
    // compression method              2 bytes
    this.out.writeShort(0);
    // last mod file time              2 bytes
    this.out.writeShort(0x2222);
    // last mod file date              2 bytes
    this.out.writeShort(0x2222);
    // crc-32                          4 bytes
    this.out.writeLong(crc);
    // compressed size                 4 bytes
    this.out.writeLong(data.length);
    // uncompressed size               4 bytes
    this.out.writeLong(data.length);
    // file name length                2 bytes
    this.out.writeShort(name.length);
    // extra field length              2 bytes
    this.out.writeShort(0);
    // file name
    this.out.writeString(name);
    // file data
    this.out.writeBytes(data);

    this.num++;
  }

  dir(): void {
    for (const file of this.files) {
      // central file header signature   4 bytes  (0x02014b50)
      this.out.writeLong(0x02014b50);
      // version made by                 2 bytes
      this.out.writeShort(0x3f);
      // version needed to extract       2 bytes
      this.out.writeShort(0x0a);
      // general purpose bit flag        2 bytes
      this.out.writeShort(0);
      // compression method              2 bytes
      this.out.writeShort(0);
      // last mod file time              2 bytes
      this.out.writeShort(0x2222);
      // last mod file date              2 bytes
      this.out.writeShort(0x2222);
      // crc-32                          4 bytes
      this.out.writeLong(file.crc);
      // compressed size                 4 bytes
      this.out.writeLong(file.length);
      // uncompressed size               4 bytes
      this.out.writeLong(file.length);
      // file name length                2 bytes
      this.out.writeShort(file.name.length);
      // extra field length              2 bytes
      this.out.writeShort(0);
      // file comment length             2 bytes
      this.out.writeShort(0);
      // disk number start               2 bytes
      this.out.writeShort(0);
      // internal file attributes        2 bytes
      this.out.writeShort(0);
      // external file attributes        4 bytes
      this.out.writeLong(0x20);
      // relative offset of local header 4 bytes
      this.out.writeLong(file.offset);
      // file name
      this.out.writeString(file.name);
    }
  }

  finish(): void {
    const offset = this.out.length;
    this.dir();
    const length = this.out.length - offset;

    // End of central directory record(EOCD)
    // end of central dir signature    4 bytes  (0x06054b50)
    this.out.writeLong(0x06054b50);
    // number of this disk             2 bytes
    this.out.writeShort(0);
    // number of the disk with the
    // start of the central directory  2 bytes
    this.out.writeShort(0);
    // total number of entries in the
    // central directory on this disk  2 bytes
    this.out.writeShort(this.num);
    // total number of entries in
    // the central directory           2 bytes
    this.out.writeShort(this.num);
    // size of the central directory   4 bytes
    this.out.writeLong(length);
    // offset of start of central
    // directory with respect to
    // the starting disk number        4 bytes
    this.out.writeLong(offset);
    // .ZIP file comment length        2 bytes
    this.out.writeShort(0);
  }
}
