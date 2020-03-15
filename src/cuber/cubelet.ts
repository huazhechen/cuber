import { FACE, COLORS } from "./define";
import {
  Vector3,
  Group,
  Geometry,
  Face3,
  ExtrudeGeometry,
  Shape,
  ShapeGeometry,
  MeshPhongMaterial,
  MeshNormalMaterial,
  MeshLambertMaterial,
  MeshBasicMaterial,
  Mesh,
  Quaternion
} from "three";

class Frame extends Geometry {
  private static readonly _INDICES = [
    [0, 2, 1],
    [0, 3, 2],
    [4, 6, 5],
    [4, 7, 6],
    [8, 10, 9],
    [8, 11, 10],
    [12, 14, 13],
    [12, 15, 14],
    [16, 18, 17],
    [16, 19, 18],
    [20, 22, 21],
    [20, 23, 22],
    [1, 6, 7],
    [0, 1, 7],
    [3, 0, 10],
    [11, 3, 10],
    [17, 2, 3],
    [16, 17, 3],
    [23, 20, 1],
    [2, 23, 1],
    [5, 12, 13],
    [4, 5, 13],
    [9, 13, 14],
    [8, 9, 14],
    [22, 15, 12],
    [21, 22, 12],
    [19, 14, 15],
    [18, 19, 15],
    [7, 4, 9],
    [10, 7, 9],
    [11, 8, 19],
    [16, 11, 19],
    [23, 17, 18],
    [22, 23, 18],
    [20, 21, 5],
    [6, 20, 5],
    [20, 6, 1],
    [10, 0, 7],
    [21, 12, 5],
    [13, 9, 4],
    [23, 2, 17],
    [11, 16, 3],
    [22, 18, 15],
    [8, 14, 19]
  ];

  constructor(size: number, border: number) {
    super();
    const _O = size / 2;
    const _I = _O - border;
    const _verts = [
      //0: F Face
      [-_I, +_I, +_O],
      [+_I, +_I, +_O],
      [+_I, -_I, +_O],
      [-_I, -_I, +_O],
      //4: U Face
      [-_I, +_O, -_I],
      [+_I, +_O, -_I],
      [+_I, +_O, +_I],
      [-_I, +_O, +_I],
      //8: L Face
      [-_O, -_I, -_I],
      [-_O, +_I, -_I],
      [-_O, +_I, +_I],
      [-_O, -_I, +_I],
      //12: B Face
      [+_I, +_I, -_O],
      [-_I, +_I, -_O],
      [-_I, -_I, -_O],
      [+_I, -_I, -_O],
      //16: D Face
      [-_I, -_O, +_I],
      [+_I, -_O, +_I],
      [+_I, -_O, -_I],
      [-_I, -_O, -_I],
      //20: R Face
      [+_O, +_I, +_I],
      [+_O, +_I, -_I],
      [+_O, -_I, -_I],
      [+_O, -_I, +_I]
    ];

    for (let i = 0; i < _verts.length; i++) {
      let _vert = _verts[i];
      this.vertices.push(new Vector3(_vert[0], _vert[1], _vert[2]));
    }
    for (let i = 0; i < Frame._INDICES.length; i++) {
      let _indice = Frame._INDICES[i];
      let _face = new Face3(_indice[0], _indice[1], _indice[2]);
      this.faces.push(_face);
    }
    this.computeFaceNormals();
  }
}

class Sticker extends ExtrudeGeometry {
  constructor(size: number, depth: number) {
    size = size / 2;
    let left = -size;
    let bottom = size;
    let top = -size;
    let right = size;
    let radius = size / 4;

    let shape = new Shape();
    shape.moveTo(left, top + radius);
    shape.lineTo(left, bottom - radius);
    shape.quadraticCurveTo(left, bottom, left + radius, bottom);
    shape.lineTo(right - radius, bottom);
    shape.quadraticCurveTo(right, bottom, right, bottom - radius);
    shape.lineTo(right, top + radius);
    shape.quadraticCurveTo(right, top, right - radius, top);
    shape.lineTo(left + radius, top);
    shape.quadraticCurveTo(left, top, left, top + radius);
    shape.closePath();

    super(shape, { bevelEnabled: false, depth: depth });
  }
}

class Mirror extends ShapeGeometry {
  constructor(size: number) {
    size = size / 2;
    let left = -size;
    let bottom = size;
    let top = -size;
    let right = size;
    let radius = size / 4;

    let shape = new Shape();
    shape.moveTo(left, top + radius);
    shape.lineTo(left, bottom - radius);
    shape.quadraticCurveTo(left, bottom, left + radius, bottom);
    shape.lineTo(right - radius, bottom);
    shape.quadraticCurveTo(right, bottom, right, bottom - radius);
    shape.lineTo(right, top + radius);
    shape.quadraticCurveTo(right, top, right - radius, top);
    shape.lineTo(left + radius, top);
    shape.quadraticCurveTo(left, top, left, top + radius);
    shape.closePath();

    super(shape);
  }
}

export default class Cubelet extends Group {
  public static readonly SIZE: number = 64;
  private static readonly _BORDER_WIDTH: number = 3;
  private static readonly _STICKER_DEPTH: number = 3;
  private static readonly _FRAME: Frame = new Frame(
    Cubelet.SIZE,
    Cubelet._BORDER_WIDTH
  );
  private static readonly _STICKER: Sticker = new Sticker(
    Cubelet.SIZE - 2 * Cubelet._BORDER_WIDTH - Cubelet._STICKER_DEPTH,
    Cubelet._STICKER_DEPTH
  );
  private static readonly _MIRROR: Mirror = new Mirror(
    Cubelet.SIZE - 2 * Cubelet._BORDER_WIDTH - Cubelet._STICKER_DEPTH
  );

  private static LAMBERS = (() => {
    let result: any = {};
    for (const key in COLORS) {
      let color = (<any>COLORS)[key];
      if (key == "BLACK") {
        result[key] = new MeshPhongMaterial({
          color: color,
          specular: COLORS.GRAY,
          shininess: 8
        });
      } else {
        result[key] = new MeshLambertMaterial({ color: color });
      }
    }
    return result;
  })();

  private static BASICS = (() => {
    let result: any = {};
    for (const key in COLORS) {
      let color = (<any>COLORS)[key];
      result[key] = new MeshBasicMaterial({ color: color });
    }
    return result;
  })();

  _vector: Vector3;

  set vector(vector) {
    this._vector.set(
      Math.round(vector.x),
      Math.round(vector.y),
      Math.round(vector.z)
    );
    this._index =
      (this._vector.z + 1) * 9 +
      (this._vector.y + 1) * 3 +
      (this._vector.x + 1);
    this.position.x = Cubelet.SIZE * this._vector.x;
    this.position.y = Cubelet.SIZE * this._vector.y;
    this.position.z = Cubelet.SIZE * this._vector.z;
  }
  get vector() {
    return this._vector;
  }

  _index: number;

  set index(index) {
    let _x = (index % 3) - 1;
    let _y = Math.floor((index % 9) / 3) - 1;
    let _z = Math.floor(index / 9) - 1;
    this.vector = new Vector3(_x, _y, _z);
  }

  get index(): number {
    return this._index;
  }

  mirrors: Mesh[];
  lambers: MeshLambertMaterial[];
  basics: MeshBasicMaterial[];
  set mirror(value: boolean) {
    if (value) {
      for (let i = 0; i < 6; i++) {
        if (
          this.mirrors[i] instanceof Mesh &&
          this.children.indexOf(this.mirrors[i]) < 0
        ) {
          this.add(this.mirrors[i]);
        }
      }
    } else {
      for (let i = 0; i < 6; i++) {
        if (
          this.mirrors[i] instanceof Mesh &&
          this.children.indexOf(this.mirrors[i]) >= 0
        ) {
          this.remove(this.mirrors[i]);
        }
      }
    }
  }

  set hollow(value: boolean) {
    if (value) {
      if (
        this.frame instanceof Mesh &&
        this.children.indexOf(this.frame) >= 0
      ) {
        this.remove(this.frame);
      }
    } else {
      if (this.frame instanceof Mesh && this.children.indexOf(this.frame) < 0) {
        this.add(this.frame);
      }
    }
  }

  getColor(face: FACE) {
    let position = new Vector3(0, 0, 0);
    switch (face) {
      case FACE.L:
        position.x = -1;
        break;
      case FACE.R:
        position.x = 1;
        break;
      case FACE.D:
        position.y = -1;
        break;
      case FACE.U:
        position.y = 1;
        break;
      case FACE.B:
        position.z = -1;
        break;
      case FACE.F:
        position.z = 1;
        break;
      default:
        break;
    }
    this._quaternion.copy(this.quaternion);
    position.applyQuaternion(this._quaternion.inverse());
    let x = Math.round(position.x);
    let y = Math.round(position.y);
    let z = Math.round(position.z);
    let color = 0;
    if (x < 0) {
      color = FACE.L;
    } else if (x > 0) {
      color = FACE.R;
    } else if (y < 0) {
      color = FACE.D;
    } else if (y > 0) {
      color = FACE.U;
    } else if (z < 0) {
      color = FACE.B;
    } else if (z > 0) {
      color = FACE.F;
    }
    return color;
  }

  initial: number;
  stickers: Mesh[];
  _quaternion: Quaternion;
  frame: Mesh;

  constructor(index: number) {
    super();
    this.initial = index;
    this._vector = new Vector3();
    this.stickers = [];
    this._quaternion = new Quaternion();
    this.mirrors = [];

    let _x = (index % 3) - 1;
    let _y = Math.floor((index % 9) / 3) - 1;
    let _z = Math.floor(index / 9) - 1;
    this.vector = new Vector3(_x, _y, _z);

    this.lambers = [
      this.vector.x < 0 ? Cubelet.LAMBERS.ORANGE : Cubelet.LAMBERS.GRAY,
      this.vector.x > 0 ? Cubelet.LAMBERS.RED : Cubelet.LAMBERS.GRAY,
      this.vector.y < 0 ? Cubelet.LAMBERS.WHITE : Cubelet.LAMBERS.GRAY,
      this.vector.y > 0 ? Cubelet.LAMBERS.YELLOW : Cubelet.LAMBERS.GRAY,
      this.vector.z < 0 ? Cubelet.LAMBERS.GREEN : Cubelet.LAMBERS.GRAY,
      this.vector.z > 0 ? Cubelet.LAMBERS.BLUE : Cubelet.LAMBERS.GRAY
    ];

    this.basics = [
      this.vector.x < 0 ? Cubelet.BASICS.ORANGE : Cubelet.BASICS.GRAY,
      this.vector.x > 0 ? Cubelet.BASICS.RED : Cubelet.BASICS.GRAY,
      this.vector.y < 0 ? Cubelet.BASICS.WHITE : Cubelet.BASICS.GRAY,
      this.vector.y > 0 ? Cubelet.BASICS.YELLOW : Cubelet.BASICS.GRAY,
      this.vector.z < 0 ? Cubelet.BASICS.GREEN : Cubelet.BASICS.GRAY,
      this.vector.z > 0 ? Cubelet.BASICS.BLUE : Cubelet.BASICS.GRAY
    ];

    this.frame = new Mesh(Cubelet._FRAME, Cubelet.LAMBERS.BLACK);
    this.add(this.frame);

    for (let i = 0; i < 6; i++) {
      let _sticker = new Mesh(Cubelet._STICKER, this.lambers[i]);
      _sticker.name = FACE[i];
      switch (i) {
        case FACE.L:
          _sticker.rotation.y = -Math.PI / 2;
          _sticker.position.x = -Cubelet.SIZE / 2;
          break;
        case FACE.R:
          _sticker.rotation.y = Math.PI / 2;
          _sticker.position.x = Cubelet.SIZE / 2;
          break;
        case FACE.D:
          _sticker.rotation.x = Math.PI / 2;
          _sticker.position.y = -Cubelet.SIZE / 2;
          break;
        case FACE.U:
          _sticker.rotation.x = -Math.PI / 2;
          _sticker.position.y = Cubelet.SIZE / 2;
          break;
        case FACE.B:
          _sticker.rotation.x = Math.PI;
          _sticker.position.z = -Cubelet.SIZE / 2;
          break;
        case FACE.F:
          _sticker.rotation.x = 2 * Math.PI;
          _sticker.position.z = Cubelet.SIZE / 2;
          break;
        default:
          break;
      }
      this.stickers.push(_sticker);
      if (this.lambers[i] != Cubelet.LAMBERS.GRAY) {
        this.add(_sticker);
        let _mirror = new Mesh(Cubelet._MIRROR, this.basics[i]);
        _mirror.rotation.x =
          _sticker.rotation.x == 0 ? 0 : _sticker.rotation.x + Math.PI;
        _mirror.rotation.y =
          _sticker.rotation.y == 0 ? 0 : _sticker.rotation.y + Math.PI;
        _mirror.rotation.z =
          _sticker.rotation.z == 0 ? 0 : _sticker.rotation.z + Math.PI;
        if (_mirror.rotation.x + _mirror.rotation.y + _mirror.rotation.z == 0) {
          _mirror.rotation.y = Math.PI;
        }

        _mirror.position.x = _sticker.position.x * 3;
        _mirror.position.y = _sticker.position.y * 3;
        _mirror.position.z = _sticker.position.z * 3;
        this.add(_mirror);
        this.mirrors[i] = _mirror;
      }
      this.matrixAutoUpdate = false;
      this.updateMatrix();
    }
  }

  stick(face: number, color: string) {
    let lamber;
    let basic;
    let index = null;
    if (color && color.length > 0) {
      for (const key in COLORS) {
        let c = (<any>COLORS)[key];
        if (c == color) {
          index = key;
          break;
        }
      }
    }
    if (index) {
      lamber = Cubelet.LAMBERS[index];
      basic = Cubelet.LAMBERS[index];
    } else {
      lamber = this.lambers[face];
      basic = this.basics[face];
    }
    if (index == "BLACK") {
      this.stickers[face].visible = false;
    } else {
      this.stickers[face].visible = true;
    }
    this.stickers[face].material = lamber;
    if (this.mirrors[face] instanceof Mesh) {
      this.mirrors[face].material = basic;
    }
  }
}
