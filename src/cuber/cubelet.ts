import { FACE, COLORS } from "./define";
import * as THREE from "three";

class Frame extends THREE.BufferGeometry {
  private static readonly _INDICES = [
    0, 2, 1,
    0, 3, 2,
    4, 6, 5,
    4, 7, 6,
    8, 10, 9,
    8, 11, 10,
    12, 14, 13,
    12, 15, 14,
    16, 18, 17,
    16, 19, 18,
    20, 22, 21,
    20, 23, 22,
    1, 6, 7,
    0, 1, 7,
    3, 0, 10,
    11, 3, 10,
    17, 2, 3,
    16, 17, 3,
    23, 20, 1,
    2, 23, 1,
    5, 12, 13,
    4, 5, 13,
    9, 13, 14,
    8, 9, 14,
    22, 15, 12,
    21, 22, 12,
    19, 14, 15,
    18, 19, 15,
    7, 4, 9,
    10, 7, 9,
    11, 8, 19,
    16, 11, 19,
    23, 17, 18,
    22, 23, 18,
    20, 21, 5,
    6, 20, 5,
    20, 6, 1,
    10, 0, 7,
    21, 12, 5,
    13, 9, 4,
    23, 2, 17,
    11, 16, 3,
    22, 18, 15,
    8, 14, 19,
  ];

  constructor(size: number, border: number) {
    super();
    const _O = size / 2;
    const _I = _O - border;
    const _verts = [
      -_I, +_I, +_O, // 0: F Face
      +_I, +_I, +_O,
      +_I, -_I, +_O,
      -_I, -_I, +_O,
      -_I, +_O, -_I, // 4: U Face
      +_I, +_O, -_I,
      +_I, +_O, +_I,
      -_I, +_O, +_I,
      -_O, -_I, -_I, //8: L Face
      -_O, +_I, -_I,
      -_O, +_I, +_I,
      -_O, -_I, +_I,
      +_I, +_I, -_O, //12: B Face
      -_I, +_I, -_O,
      -_I, -_I, -_O,
      +_I, -_I, -_O,
      -_I, -_O, +_I, //16: D Face
      +_I, -_O, +_I,
      +_I, -_O, -_I,
      -_I, -_O, -_I,
      +_O, +_I, +_I, //20: R Face
      +_O, +_I, -_I,
      +_O, -_I, -_I,
      +_O, -_I, +_I,
    ];
    this.setAttribute("position", new THREE.Float32BufferAttribute(_verts, 3));
    this.setIndex(Frame._INDICES);
    this.computeVertexNormals();
  }
}

class Sticker extends THREE.ExtrudeGeometry {
  constructor(size: number, depth: number, arrow: boolean) {
    size = size / 2;
    const left = -size;
    const bottom = size;
    const top = -size;
    const right = size;
    const radius = size / 4;

    const shape = new THREE.Shape();
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

    if (arrow) {
      const h = size * 0.6;
      const w = h * 0.8;
      const arrow = new THREE.Path();
      arrow.moveTo(0, h);
      arrow.lineTo(-w, 0);
      arrow.lineTo(-w / 2, 0);
      arrow.lineTo(-w / 2, -h);
      arrow.lineTo(w / 2, -h);
      arrow.lineTo(w / 2, 0);
      arrow.lineTo(w, 0);
      arrow.closePath();
      shape.holes.push(arrow);
    }

    super(shape, { bevelEnabled: false, depth: depth });
  }
}

class Mirror extends THREE.ShapeGeometry {
  constructor(size: number) {
    size = size / 2;
    const left = -size;
    const bottom = size;
    const top = -size;
    const right = size;
    const radius = size / 4;

    const shape = new THREE.Shape();
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

export default class Cubelet extends THREE.Group {
  public static readonly SIZE: number = 64;
  private static readonly _BORDER_WIDTH: number = 3;
  private static readonly _EDGE_WIDTH: number = 2;
  private static readonly _STICKER_DEPTH: number = 0.1;
  private static readonly _FRAME: Frame = new Frame(Cubelet.SIZE, Cubelet._BORDER_WIDTH);
  private static readonly _STICKER: Sticker = new Sticker(
    Cubelet.SIZE - 2 * Cubelet._BORDER_WIDTH - Cubelet._EDGE_WIDTH,
    Cubelet._STICKER_DEPTH,
    false
  );
  private static readonly _ARROW: Sticker = new Sticker(
    Cubelet.SIZE - 2 * Cubelet._BORDER_WIDTH - Cubelet._EDGE_WIDTH,
    Cubelet._STICKER_DEPTH,
    true
  );
  private static readonly _MIRROR: Mirror = new Mirror(
    Cubelet.SIZE - 2 * Cubelet._BORDER_WIDTH - Cubelet._STICKER_DEPTH
  );

  public static LAMBERS = ((): { [key: string]: THREE.MeshLambertMaterial } => {
    const result: { [key: string]: THREE.MeshLambertMaterial } = {};
    for (const key in COLORS) {
      const color = COLORS[key];
      result[key] = new THREE.MeshLambertMaterial({ color: color });
    }
    return result;
  })();

  public static CORE = new THREE.MeshPhongMaterial({
    color: COLORS.Core,
    specular: COLORS.Gray,
    shininess: 2,
  });

  public static TRANS = new THREE.MeshBasicMaterial({
    color: COLORS.Gray,
    transparent: true,
    opacity: 0.1,
    depthWrite: false,
  });

  public static BASICS = ((): { [key: string]: THREE.MeshBasicMaterial } => {
    const result: { [key: string]: THREE.MeshBasicMaterial } = {};
    for (const key in COLORS) {
      const color = COLORS[key];
      result[key] = new THREE.MeshBasicMaterial({ color: color });
    }
    return result;
  })();

  _vector: THREE.Vector3;

  set vector(vector: THREE.Vector3) {
    const half = (this.order - 1) / 2;
    let x = Math.round(vector.x * 2) / 2;
    let y = Math.round(vector.y * 2) / 2;
    let z = Math.round(vector.z * 2) / 2;
    this._vector.set(x, y, z);
    x = Math.round(x + half);
    y = Math.round(y + half);
    z = Math.round(z + half);
    this._index = z * this.order * this.order + y * this.order + x;
    this.position.x = Cubelet.SIZE * this._vector.x;
    this.position.y = Cubelet.SIZE * this._vector.y;
    this.position.z = Cubelet.SIZE * this._vector.z;
  }
  get vector(): THREE.Vector3 {
    return this._vector;
  }

  _index: number;

  set index(index: number) {
    const half = (this.order - 1) / 2;
    const _x = (index % this.order) - half;
    const _y = Math.floor((index % (this.order * this.order)) / this.order) - half;
    const _z = Math.floor(index / (this.order * this.order)) - half;
    this.vector = new THREE.Vector3(_x, _y, _z);
  }

  get index(): number {
    return this._index;
  }

  mirrors: THREE.Mesh[];
  lamberts: (THREE.MeshLambertMaterial | undefined)[];
  basics: (THREE.MeshBasicMaterial | undefined)[];
  set mirror(value: boolean) {
    if (value) {
      for (let i = 0; i < 6; i++) {
        if (this.mirrors[i] instanceof THREE.Mesh && this.children.indexOf(this.mirrors[i]) < 0) {
          this.add(this.mirrors[i]);
        }
      }
    } else {
      for (let i = 0; i < 6; i++) {
        if (this.mirrors[i] instanceof THREE.Mesh && this.children.indexOf(this.mirrors[i]) >= 0) {
          this.remove(this.mirrors[i]);
        }
      }
    }
  }

  set hollow(value: boolean) {
    if (this.frame) {
      this.frame.material = value ? Cubelet.TRANS : Cubelet.CORE;
    }
  }

  getFace(face: FACE): number {
    const position = new THREE.Vector3(0, 0, 0);
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
    position.applyQuaternion(this._quaternion.invert());
    const x = Math.round(position.x);
    const y = Math.round(position.y);
    const z = Math.round(position.z);
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

  getColor(face: FACE): string {
    const sticker = this.stickers[this.getFace(face)];
    if (!sticker || !sticker.visible) {
      return "?";
    }
    switch (sticker.material) {
      case Cubelet.LAMBERS.L:
        return "L";
      case Cubelet.LAMBERS.R:
        return "R";
      case Cubelet.LAMBERS.F:
        return "F";
      case Cubelet.LAMBERS.B:
        return "B";
      case Cubelet.LAMBERS.U:
        return "U";
      case Cubelet.LAMBERS.D:
        return "D";
    }
    return "?";
  }

  initial: number;
  stickers: THREE.Mesh[];
  set thickness(value: boolean) {
    const scale = value ? Cubelet.SIZE / 2 : 1;
    for (const sticker of this.stickers) {
      if (sticker) {
        sticker.scale.z = scale;
      }
    }
  }

  set arrow(value: boolean) {
    for (const sticker of this.stickers) {
      if (sticker) {
        sticker.geometry = value ? Cubelet._ARROW : Cubelet._STICKER;
      }
    }
  }

  _quaternion: THREE.Quaternion;
  frame: THREE.Mesh;
  order: number;
  exist = false;

  constructor(order: number, index: number) {
    super();
    this.order = order;
    this.initial = index;
    this._vector = new THREE.Vector3();
    this.index = index;
    this.stickers = [];
    this._quaternion = new THREE.Quaternion();
    this.mirrors = [];

    const xx = this.position.x * this.position.x;
    const yy = this.position.y * this.position.y;
    const zz = this.position.z * this.position.z;
    let d = xx + yy + zz - Math.min(xx, yy, zz);
    d = Math.sqrt(d) + (Math.sqrt(2) * Cubelet.SIZE) / 2 - (order * Cubelet.SIZE) / 2;
    if (d < 0) {
      return;
    }
    this.exist = true;
    const half = (order - 1) / 2;

    this.lamberts = [
      this.vector.x == -half ? Cubelet.LAMBERS.L : undefined,
      this.vector.x == half ? Cubelet.LAMBERS.R : undefined,
      this.vector.y == -half ? Cubelet.LAMBERS.D : undefined,
      this.vector.y == half ? Cubelet.LAMBERS.U : undefined,
      this.vector.z == -half ? Cubelet.LAMBERS.B : undefined,
      this.vector.z == half ? Cubelet.LAMBERS.F : undefined,
    ];

    this.basics = [
      this.vector.x == -half ? Cubelet.BASICS.L : undefined,
      this.vector.x == half ? Cubelet.BASICS.R : undefined,
      this.vector.y == -half ? Cubelet.BASICS.D : undefined,
      this.vector.y == half ? Cubelet.BASICS.U : undefined,
      this.vector.z == -half ? Cubelet.BASICS.B : undefined,
      this.vector.z == half ? Cubelet.BASICS.F : undefined,
    ];

    this.frame = new THREE.Mesh(Cubelet._FRAME, Cubelet.CORE);
    this.add(this.frame);

    for (let i = 0; i < 6; i++) {
      if (this.lamberts[i] != undefined) {
        const _sticker = new THREE.Mesh(Cubelet._STICKER, this.lamberts[i]);
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
        this.add(_sticker);
        this.stickers[i] = _sticker;
        const _mirror = new THREE.Mesh(Cubelet._MIRROR, this.basics[i]);
        _mirror.rotation.x = _sticker.rotation.x == 0 ? 0 : _sticker.rotation.x + Math.PI;
        _mirror.rotation.y = _sticker.rotation.y == 0 ? 0 : _sticker.rotation.y + Math.PI;
        _mirror.rotation.z = _sticker.rotation.z == 0 ? 0 : _sticker.rotation.z + Math.PI;
        if (_mirror.rotation.x + _mirror.rotation.y + _mirror.rotation.z == 0) {
          _mirror.rotation.y = Math.PI;
        }

        _mirror.position.x = _sticker.position.x * (order + 1);
        _mirror.position.y = _sticker.position.y * (order + 1);
        _mirror.position.z = _sticker.position.z * (order + 1);
        this.mirrors[i] = _mirror;
      }
    }
    this.matrixAutoUpdate = false;
    this.updateMatrix();
  }

  stick(face: number, value: string): void {
    let lamber;
    let basic;
    if (this.stickers[face] === undefined) {
      return;
    }
    if (value == "remove") {
      this.stickers[face].visible = false;
      this.mirrors[face].visible = false;
      return;
    }
    this.stickers[face].visible = true;
    this.mirrors[face].visible = true;
    if (value && value.length > 0) {
      lamber = Cubelet.LAMBERS[value];
      basic = Cubelet.BASICS[value];
    } else {
      lamber = this.lamberts[face];
      basic = this.basics[face];
    }
    if (lamber === undefined || basic === undefined) {
      return;
    }
    this.stickers[face].material = lamber;
    if (this.mirrors[face] instanceof THREE.Mesh) {
      this.mirrors[face].material = basic;
    }
  }
}
