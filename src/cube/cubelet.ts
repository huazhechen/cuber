import * as THREE from "three";

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
    let _O = size / 2;
    let _I = _O - border;
    let _verts = [
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

export enum FACES {
  L,
  R,
  D,
  U,
  B,
  F
}

export default class Cubelet extends THREE.Group {
  public static readonly SIZE: number = 64;
  private static readonly _BORDER_WIDTH: number = 3;
  private static readonly _EDGE_WIDTH: number = 2;
  private static readonly _FRAME: Frame = new Frame(Cubelet.SIZE, Cubelet._BORDER_WIDTH);
  private static readonly _EDGE: Edge = new Edge(Cubelet.SIZE - 2 * Cubelet._BORDER_WIDTH, Cubelet._EDGE_WIDTH);
  private static readonly _STICKER: Sticker = new Sticker(Cubelet.SIZE - 2 * Cubelet._BORDER_WIDTH, Cubelet._EDGE_WIDTH);

  public static readonly COLORS = {
    g: "#009D54",
    o: "#FF6C00",
    b: "#3D81F6",
    y: "#FDCC09",
    w: "#FFFFFF",
    r: "#DC422F",
    i: "#808080",
    p: "#202020",
    h: "#EA80FC",
  }

  private static readonly _MATERIALS = {
    g: new THREE.MeshBasicMaterial({ color: Cubelet.COLORS.g }),
    o: new THREE.MeshBasicMaterial({ color: Cubelet.COLORS.o }),
    b: new THREE.MeshBasicMaterial({ color: Cubelet.COLORS.b }),
    y: new THREE.MeshBasicMaterial({ color: Cubelet.COLORS.y }),
    w: new THREE.MeshBasicMaterial({ color: Cubelet.COLORS.w }),
    r: new THREE.MeshBasicMaterial({ color: Cubelet.COLORS.r }),
    i: new THREE.MeshBasicMaterial({ color: Cubelet.COLORS.i }),
    p: new THREE.MeshPhongMaterial({ color: Cubelet.COLORS.p, specular: "#080808" }),
    h: new THREE.MeshBasicMaterial({ color: Cubelet.COLORS.h }),
    n: new THREE.MeshNormalMaterial(),
  };
  public initial: number;
  private _index: number;
  private _vector: THREE.Vector3 = new THREE.Vector3();
  private _stickers: THREE.Mesh[] = [];
  private _edges: THREE.Mesh[] = [];
  private _frame: THREE.Mesh;
  private _quaternion: THREE.Quaternion = new THREE.Quaternion();

  set vector(vector) {
    this._vector.set(Math.round(vector.x), Math.round(vector.y), Math.round(vector.z));
    this._index = (this.vector.z + 1) * 9 + (this.vector.y + 1) * 3 + (this.vector.x + 1);
    this.position.x = Cubelet.SIZE * this._vector.x;
    this.position.y = Cubelet.SIZE * this._vector.y;
    this.position.z = Cubelet.SIZE * this._vector.z;
  }
  get vector() {
    return this._vector;
  }

  set index(index) {
    let _x = (index % 3) - 1;
    let _y = Math.floor((index % 9) / 3) - 1;
    let _z = Math.floor(index / 9) - 1;
    this.vector = new THREE.Vector3(_x, _y, _z);
  }

  get index() {
    return this._index;
  }

  private _materials: THREE.MeshBasicMaterial[];

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

  constructor(index: number) {
    super();
    this.initial = index;
    let _x = (index % 3) - 1;
    let _y = Math.floor((index % 9) / 3) - 1;
    let _z = Math.floor(index / 9) - 1;
    this.vector = new THREE.Vector3(_x, _y, _z);

    this._materials = [
      this._vector.x < 0 ? Cubelet._MATERIALS.o : Cubelet._MATERIALS.i,
      this._vector.x > 0 ? Cubelet._MATERIALS.r : Cubelet._MATERIALS.i,
      this._vector.y < 0 ? Cubelet._MATERIALS.w : Cubelet._MATERIALS.i,
      this._vector.y > 0 ? Cubelet._MATERIALS.y : Cubelet._MATERIALS.i,
      this._vector.z < 0 ? Cubelet._MATERIALS.g : Cubelet._MATERIALS.i,
      this._vector.z > 0 ? Cubelet._MATERIALS.b : Cubelet._MATERIALS.i
    ];

    this._frame = new THREE.Mesh(Cubelet._FRAME, Cubelet._MATERIALS.p);
    this.add(this._frame);

    for (let i = 0; i < 6; i++) {
      let _edge = new THREE.Mesh(Cubelet._EDGE, Cubelet._MATERIALS.p);
      let _sticker = new THREE.Mesh(Cubelet._STICKER, this._materials[i]);
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
      this._edges.push(_edge);
      this.add(_sticker);
      this._stickers.push(_sticker);
      if (this.initial == 13) {
        this.children = [];
        let geometry = new THREE.CylinderGeometry(Cubelet.SIZE / 6, Cubelet.SIZE / 6, Cubelet.SIZE, 16);
        let material = Cubelet._MATERIALS.n;
        let mesh: THREE.Mesh;
        mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = Math.PI / 2;
        this.add(mesh);
        mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.y = Math.PI / 2;
        this.add(mesh);
        mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.z = Math.PI / 2;
        this.add(mesh);
        mesh = new THREE.Mesh(new THREE.SphereGeometry(Cubelet.SIZE / 3.2, 16, 16), material);
        this.add(mesh);
      }
      this.matrixAutoUpdate = false;
      this.updateMatrix();
    }
  }

  stick(face: number, color: string) {
    switch (color) {
      case Cubelet.COLORS.y:
        this._stickers[face].material = Cubelet._MATERIALS.y;
        break;
      case Cubelet.COLORS.w:
        this._stickers[face].material = Cubelet._MATERIALS.w;
        break;
      case Cubelet.COLORS.b:
        this._stickers[face].material = Cubelet._MATERIALS.b;
        break;
      case Cubelet.COLORS.g:
        this._stickers[face].material = Cubelet._MATERIALS.g;
        break;
      case Cubelet.COLORS.r:
        this._stickers[face].material = Cubelet._MATERIALS.r;
        break;
      case Cubelet.COLORS.o:
        this._stickers[face].material = Cubelet._MATERIALS.o;
        break;
      case Cubelet.COLORS.i:
        this._stickers[face].material = Cubelet._MATERIALS.i;
        break;
      case Cubelet.COLORS.h:
        this._stickers[face].material = Cubelet._MATERIALS.h;
        break;
      default:
        this._stickers[face].material = this._materials[face];
        break;
    }
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }
}
