import Cubelet from "./cubelet";
import { TwistAction } from "./twister";
import Cube from "./cube";
import { Group, Vector3 } from "three";
import tweener from "./tweener";

export default class CubeGroup extends Group {
  public static frames: number = 30;
  cube: Cube;
  cubelets: Cubelet[];
  name: string;
  indices: number[];
  axis: Vector3;

  _angle: number;
  set angle(angle) {
    this.setRotationFromAxisAngle(this.axis, angle);
    this._angle = angle;
    this.updateMatrix();
    this.cube.dirty = true;
  }
  get angle() {
    return this._angle;
  }

  constructor(cube: Cube, name: string, indices: number[], axis: Vector3) {
    super();
    this.cube = cube;
    this._angle = 0;
    this.cubelets = [];
    this.name = name;
    this.indices = indices;
    this.axis = axis;
    this.matrixAutoUpdate = false;
    this.updateMatrix();
  }

  exp(reverse: boolean, times: number) {
    let exp = this.name;
    let values = this.name.match(/(^-?[xyz]):(\d*):(\d*$)/i);
    if (values?.length == 4) {
      let axis = values[1];
      let layer = Number(values[2]);
      if (layer == Number(values[3])) {
        let half = (this.cube.order + 1) / 2;
        if (axis.length == 1 && layer < half) {
          axis = "-" + axis;
          reverse = !reverse;
        } else if (axis.length == 2 && layer > half) {
          axis = axis[1];
          reverse = !reverse;
        }
        if (axis.length == 1) {
          layer = this.cube.order - layer + 1;
        }
        switch (axis) {
          case "x":
            exp = layer === half ? "M'" : "R";
            break;
          case "y":
            exp = layer === half ? "E'" : "U";
            break;
          case "z":
            exp = layer === half ? "S" : "F";
            break;
          case "-x":
            exp = layer === half ? "M" : "L";
            break;
          case "-y":
            exp = layer === half ? "E" : "D";
            break;
          case "-z":
            exp = layer === half ? "S'" : "B";
            break;
        }
        if (exp.length == 2) {
          exp = exp[0];
          reverse = !reverse;
        }
        exp = (layer === 1 || layer === half ? "" : String(layer)) + exp;
      }
    }
    return new TwistAction(exp, reverse, times);
  }

  hold() {
    this.angle = 0;
    for (let i of this.indices) {
      let cubelet = this.cube.cubelets[i];
      this.cubelets.push(cubelet);
      this.cube.remove(cubelet);
      this.add(cubelet);
    }
    this.cube.lock = true;
  }

  drop() {
    this.angle = Math.round(this.angle / (Math.PI / 2)) * (Math.PI / 2);
    while (true) {
      let cubelet = this.cubelets.pop();
      if (undefined === cubelet) {
        break;
      }
      this.rotate(cubelet);
      this.remove(cubelet);
      this.cube.add(cubelet);
      this.cube.cubelets[cubelet.index] = cubelet;
    }
    this.cube.lock = false;
    if (this.angle != 0) {
      this.cube.update();
    }
    this.angle = 0;
  }

  twist(angle = this.angle) {
    angle = Math.round(angle / (Math.PI / 2)) * (Math.PI / 2);
    let reverse = angle > 0;
    let times = Math.round(Math.abs(angle) / (Math.PI / 2));
    if (times != 0) {
      this.cube.record(this.exp(reverse, times));
    }
    let delta = angle - this.angle;
    if (delta === 0) {
      this.drop();
    } else {
      let d = Math.abs(delta) / (Math.PI / 2);
      var duration = CubeGroup.frames * (2 - 2 / (d + 1));
      tweener.tween(this.angle, angle, duration, (value: number) => {
        this.angle = value;
        if (Math.abs(this.angle - angle) < 1e-6) {
          this.drop();
        }
      });
    }
  }

  rotate(cubelet: Cubelet) {
    cubelet.rotateOnWorldAxis(this.axis, this.angle);
    cubelet.vector = cubelet.vector.applyAxisAngle(this.axis, this.angle);
    cubelet.updateMatrix();
  }
}

export class GroupTable {
  private order: number;
  private groups: Map<string, CubeGroup> = new Map();

  public static FORMAT(axis: string, from: number, to: number) {
    return axis + ":" + from + ":" + to;
  }

  public static readonly AXIS_VECTOR: { [key: string]: Vector3 } = {
    a: new Vector3(1, 1, 1),
    x: new Vector3(1, 0, 0),
    y: new Vector3(0, 1, 0),
    z: new Vector3(0, 0, 1),
    "-x": new Vector3(-1, 0, 0),
    "-y": new Vector3(0, -1, 0),
    "-z": new Vector3(0, 0, -1),
  };
  constructor(cube: Cube) {
    this.order = cube.order;
    // 根据魔方阶数生成所有正向group
    for (let axis of ["x", "y", "z"]) {
      for (let from = 1; from <= this.order; from++) {
        for (let to = from; to <= this.order; to++) {
          let name = GroupTable.FORMAT(axis, from, to);
          this.groups.set(name, new CubeGroup(cube, name, [], GroupTable.AXIS_VECTOR[axis]));
        }
      }
    }
    // 块类型group
    for (let type of ["center", "edge", "corner"]) {
      this.groups.set(type, new CubeGroup(cube, type, [], GroupTable.AXIS_VECTOR["a"]));
    }
    // 将每个块索引放入x y z的每层中
    for (const cubelet of cube.initials) {
      let index = cubelet.initial;
      let axis;
      let layer;
      let group;
      let faces = 0;

      axis = "x";
      layer = (index % this.order) + 1;
      if (layer == 1 || layer == this.order) {
        faces++;
      }
      group = this.groups.get(GroupTable.FORMAT(axis, layer, layer));
      if (!group) {
        throw Error();
      }
      group.indices.push(cubelet.index);

      axis = "y";
      layer = Math.floor((index % (this.order * this.order)) / this.order) + 1;
      if (layer == 1 || layer == this.order) {
        faces++;
      }
      group = this.groups.get(GroupTable.FORMAT(axis, layer, layer));
      if (!group) {
        throw Error();
      }
      group.indices.push(cubelet.index);
      axis = "z";
      layer = Math.floor(index / (this.order * this.order)) + 1;
      if (layer == 1 || layer == this.order) {
        faces++;
      }
      group = this.groups.get(GroupTable.FORMAT(axis, layer, layer));
      if (!group) {
        throw Error();
      }
      group.indices.push(cubelet.index);

      group = this.groups.get(["", "center", "edge", "corner"][faces]);
      if (group) {
        group.indices.push(cubelet.index);
      }
    }
    // x y z的多层
    for (let axis of ["x", "y", "z"]) {
      for (let from = 1; from <= this.order; from++) {
        for (let to = from + 1; to <= this.order; to++) {
          let dst = this.groups.get(GroupTable.FORMAT(axis, from, to));
          if (!dst) {
            throw Error();
          }
          for (let i = from; i <= to; i++) {
            let src = this.groups.get(GroupTable.FORMAT(axis, i, i));
            if (!src) {
              throw Error();
            }
            dst.indices.push(...src.indices);
          }
        }
      }
    }
    // 通过正向group拷贝反向group
    for (let axis of ["-x", "-y", "-z"]) {
      for (let from = 1; from <= this.order; from++) {
        for (let to = from; to <= this.order; to++) {
          let template = this.groups.get(GroupTable.FORMAT(axis.replace("-", ""), from, to));
          if (!template) {
            throw Error();
          }
          let name = GroupTable.FORMAT(axis, from, to);
          this.groups.set(name, new CubeGroup(cube, name, template.indices, GroupTable.AXIS_VECTOR[axis]));
        }
      }
    }
    // 特殊处理整体旋转
    for (let axis of ["x", "y", "z"]) {
      let template = this.groups.get(GroupTable.FORMAT(axis.replace("-", ""), 1, this.order));
      if (!template) {
        throw Error();
      }
      this.groups.set(axis, new CubeGroup(cube, axis, template.indices, GroupTable.AXIS_VECTOR[axis]));
    }
    for (const group of this.groups.values()) {
      cube.add(group);
    }
    this.groups.set(".", new CubeGroup(cube, name, [], GroupTable.AXIS_VECTOR["a"]));
    this.groups.set("~", new CubeGroup(cube, name, [], GroupTable.AXIS_VECTOR["a"]));
  }

  private static AXIS_MAP: any = {
    R: "x",
    L: "-x",
    U: "y",
    D: "-y",
    F: "z",
    B: "-z",
    M: "-x",
    E: "-y",
    S: "z",
  };

  get(name: string) {
    let axis: string = "";
    let from: number = 0;
    let to: number = 0;
    if (this.groups.get(name)) {
      return this.groups.get(name);
    }
    if (name.match(/.[Ww]/)) {
      name = name.toLowerCase().replace("w", "");
    }
    if (/[XYZ]/.test(name)) {
      name = name.toLowerCase();
    }
    if (name.length === 1) {
      switch (name) {
        case "x":
        case "y":
        case "z":
          return this.groups.get(name);
        case "R":
        case "L":
        case "U":
        case "D":
        case "F":
        case "B":
          axis = GroupTable.AXIS_MAP[name];
          from = axis.length == 2 ? 1 : this.order;
          to = from;
          break;
        case "r":
        case "l":
        case "u":
        case "d":
        case "f":
        case "b":
          axis = GroupTable.AXIS_MAP[name.toUpperCase()];
          from = axis.length == 2 ? 1 : this.order;
          to = axis.length == 2 ? 2 : this.order - 1;
          break;
        case "E":
        case "M":
        case "S":
          axis = GroupTable.AXIS_MAP[name];
          from = Math.floor((this.order + 1) / 2);
          to = Math.ceil((this.order + 1) / 2);
          break;
        case "e":
        case "m":
        case "s":
          axis = GroupTable.AXIS_MAP[name.toUpperCase()];
          from = 2;
          to = this.order - 1;
          break;
      }
    } else {
      let list = name.match(/([0123456789]*)(-?)([0123456789]*)([lrudfb])/i);
      if (list == null) {
        return undefined;
      }
      from = Number(list[1]);
      to = Number(list[3]);
      if (to === NaN || to === 0) {
        if (/[lrudfb]/.test(list[4])) {
          to = 1;
        } else {
          to = from;
        }
      }
      axis = GroupTable.AXIS_MAP[list[4].toUpperCase()];
      from = axis.length == 2 ? from : this.order - from + 1;
      to = axis.length == 2 ? to : this.order - to + 1;
    }
    if (from > to) {
      [from, to] = [to, from];
    }
    return this.groups.get(GroupTable.FORMAT(axis, from, to));
  }
}
