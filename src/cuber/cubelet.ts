import * as THREE from "three";
import { COLORS, FACES } from "../common/define";

class Frame extends THREE.Geometry {
  private static readonly _INDICES = [
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
      this.vertices.push(new THREE.Vector3(_vert[0], _vert[1], _vert[2]));
    }
    for (let i = 0; i < Frame._INDICES.length; i++) {
      let _indice = Frame._INDICES[i];
      let _face = new THREE.Face3(_indice[0], _indice[1], _indice[2]);
      this.faces.push(_face);
    }
    this.computeFaceNormals();
  }
}

class Sticker extends THREE.ShapeGeometry {
  constructor(size: number, edge: number) {
    size = size / 2;
    size = size - edge;
    let left = -size;
    let bottom = size;
    let top = -size;
    let right = size;
    let radius = size / 4;

    let shape = new THREE.Shape();
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

class Edge extends THREE.ShapeGeometry {
  constructor(size: number, edge: number) {
    let shape = new THREE.Shape();
    size = size / 2;
    shape.moveTo(-size, -size);
    shape.lineTo(-size, size);
    shape.lineTo(size, size);
    shape.lineTo(size, -size);
    shape.closePath();

    size = size - edge;
    let left = -size;
    let bottom = size;
    let top = -size;
    let right = size;
    let radius = size / 4;

    let hole = new THREE.Shape();
    hole.moveTo(left, top + radius);
    hole.quadraticCurveTo(left, top, left + radius, top);
    hole.lineTo(right - radius, top);
    hole.quadraticCurveTo(right, top, right, top + radius);
    hole.lineTo(right, bottom - radius);
    hole.quadraticCurveTo(right, bottom, right - radius, bottom);
    hole.lineTo(left + radius, bottom);
    hole.quadraticCurveTo(left, bottom, left, bottom - radius);
    hole.lineTo(left, top + radius);
    hole.closePath();

    shape.holes.push(hole);
    super(shape);
  }
}

export default class Cubelet extends THREE.Group {
  public static readonly SIZE: number = 64;
  private static readonly _BORDER_WIDTH: number = 3;
  private static readonly _EDGE_WIDTH: number = 2;
  private static readonly _FRAME: Frame = new Frame(Cubelet.SIZE, Cubelet._BORDER_WIDTH);
  private static readonly _EDGE: Edge = new Edge(Cubelet.SIZE - 2 * Cubelet._BORDER_WIDTH, Cubelet._EDGE_WIDTH);
  private static readonly _STICKER: Sticker = new Sticker(Cubelet.SIZE - 2 * Cubelet._BORDER_WIDTH, Cubelet._EDGE_WIDTH);

  private static _MATERIALS = {
    green: new THREE.MeshBasicMaterial({ color: COLORS.GREEN }),
    orange: new THREE.MeshBasicMaterial({ color: COLORS.ORANGE }),
    blue: new THREE.MeshBasicMaterial({ color: COLORS.BLUE }),
    yellow: new THREE.MeshBasicMaterial({ color: COLORS.YELLOW }),
    white: new THREE.MeshBasicMaterial({ color: COLORS.WHITE }),
    red: new THREE.MeshBasicMaterial({ color: COLORS.RED }),
    gray: new THREE.MeshBasicMaterial({ color: COLORS.GRAY }),
    black: new THREE.MeshBasicMaterial({ color: COLORS.BLACK }),
    purple: new THREE.MeshBasicMaterial({ color: COLORS.PURPLE }),
    lime: new THREE.MeshBasicMaterial({ color: COLORS.LIME }),
    cyan: new THREE.MeshBasicMaterial({ color: COLORS.CYAN })
  };

  _vector: THREE.Vector3;

  set vector(vector) {
    this._vector.set(Math.round(vector.x), Math.round(vector.y), Math.round(vector.z));
    this._index = (this._vector.z + 1) * 9 + (this._vector.y + 1) * 3 + (this._vector.x + 1);
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
    this.vector = new THREE.Vector3(_x, _y, _z);
  }

  get index(): number {
    return this._index;
  }

  mirrors: THREE.Mesh[];
  materials: THREE.MeshBasicMaterial[];
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

  getColor(face: FACES) {
    let position = new THREE.Vector3(0, 0, 0);
    switch (face) {
      case FACES.L:
        position.x = -1;
        break;
      case FACES.R:
        position.x = 1;
        break;
      case FACES.D:
        position.y = -1;
        break;
      case FACES.U:
        position.y = 1;
        break;
      case FACES.B:
        position.z = -1;
        break;
      case FACES.F:
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
      color = FACES.L;
    } else if (x > 0) {
      color = FACES.R;
    } else if (y < 0) {
      color = FACES.D;
    } else if (y > 0) {
      color = FACES.U;
    } else if (z < 0) {
      color = FACES.B;
    } else if (z > 0) {
      color = FACES.F;
    }
    return color;
  }

  initial: number;
  stickers: THREE.Mesh[];
  edges: THREE.Mesh[];
  _quaternion: THREE.Quaternion;
  frame: THREE.Mesh;

  constructor(index: number) {
    super();
    this.initial = index;
    this._vector = new THREE.Vector3();
    this.stickers = [];
    this.edges = [];
    this._quaternion = new THREE.Quaternion();
    this.mirrors = [];

    let _x = (index % 3) - 1;
    let _y = Math.floor((index % 9) / 3) - 1;
    let _z = Math.floor(index / 9) - 1;
    this.vector = new THREE.Vector3(_x, _y, _z);

    this.materials = [
      this.vector.x < 0 ? Cubelet._MATERIALS.orange : Cubelet._MATERIALS.gray,
      this.vector.x > 0 ? Cubelet._MATERIALS.red : Cubelet._MATERIALS.gray,
      this.vector.y < 0 ? Cubelet._MATERIALS.white : Cubelet._MATERIALS.gray,
      this.vector.y > 0 ? Cubelet._MATERIALS.yellow : Cubelet._MATERIALS.gray,
      this.vector.z < 0 ? Cubelet._MATERIALS.green : Cubelet._MATERIALS.gray,
      this.vector.z > 0 ? Cubelet._MATERIALS.blue : Cubelet._MATERIALS.gray
    ];

    this.frame = new THREE.Mesh(Cubelet._FRAME, Cubelet._MATERIALS.black);
    this.add(this.frame);

    for (let i = 0; i < 6; i++) {
      let _edge = new THREE.Mesh(Cubelet._EDGE, Cubelet._MATERIALS.black);
      let _sticker = new THREE.Mesh(Cubelet._STICKER, this.materials[i]);
      switch (i) {
        case FACES.L:
          _edge.rotation.y = -Math.PI / 2;
          _edge.position.x = -Cubelet.SIZE / 2;
          _sticker.rotation.y = -Math.PI / 2;
          _sticker.position.x = -Cubelet.SIZE / 2;
          _sticker.name = "L";
          break;
        case FACES.R:
          _edge.rotation.y = Math.PI / 2;
          _edge.position.x = Cubelet.SIZE / 2;
          _sticker.rotation.y = Math.PI / 2;
          _sticker.position.x = Cubelet.SIZE / 2;
          _sticker.name = "R";
          break;
        case FACES.D:
          _edge.rotation.x = Math.PI / 2;
          _edge.position.y = -Cubelet.SIZE / 2;
          _sticker.rotation.x = Math.PI / 2;
          _sticker.position.y = -Cubelet.SIZE / 2;
          _sticker.name = "D";
          break;
        case FACES.U:
          _edge.rotation.x = -Math.PI / 2;
          _edge.position.y = Cubelet.SIZE / 2;
          _sticker.rotation.x = -Math.PI / 2;
          _sticker.position.y = Cubelet.SIZE / 2;
          _sticker.name = "U";
          break;
        case FACES.B:
          _edge.rotation.x = Math.PI;
          _edge.position.z = -Cubelet.SIZE / 2;
          _sticker.rotation.x = Math.PI;
          _sticker.position.z = -Cubelet.SIZE / 2;
          _sticker.name = "B";
          break;
        case FACES.F:
          _edge.rotation.z = 0;
          _edge.position.z = Cubelet.SIZE / 2;
          _sticker.rotation.x = 2 * Math.PI;
          _sticker.position.z = Cubelet.SIZE / 2;
          _sticker.name = "F";
          break;
        default:
          break;
      }
      this.add(_edge);
      this.edges.push(_edge);
      this.add(_sticker);
      this.stickers.push(_sticker);
      if (this.materials[i] != Cubelet._MATERIALS.gray) {
        let _mirror = new THREE.Mesh(Cubelet._STICKER, this.materials[i]);
        _mirror.rotation.x = _sticker.rotation.x == 0 ? 0 : _sticker.rotation.x + Math.PI;
        _mirror.rotation.y = _sticker.rotation.y == 0 ? 0 : _sticker.rotation.y + Math.PI;
        _mirror.rotation.z = _sticker.rotation.z == 0 ? 0 : _sticker.rotation.z + Math.PI;
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
    let material;
    if (color.length > 0) {
      material = new THREE.MeshBasicMaterial({ color: color });
    } else {
      material = this.materials[face];
    }
    this.stickers[face].material = material;
    if (this.mirrors[face] instanceof THREE.Mesh) {
      this.mirrors[face].material = material;
    }
  }
}
