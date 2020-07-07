import { GroupTable } from "./group";
import Cubelet from "./cubelet";
import { FACE } from "./define";
import * as THREE from "three";
import { TwistAction, TwistNode } from "./twister";
import History from "./history";
import tweener from "./tweener";

class Container extends THREE.Group {
  dirty = false;
  updateMatrixWorld(force: boolean): void {
    if (this.dirty) {
      super.updateMatrixWorld(force);
    }
  }
}

export default class Cube extends THREE.Group {
  public dirty = true;
  public locks: Map<string, Set<number>>;
  public cubelets: Cubelet[] = [];
  public initials: Cubelet[] = [];
  public groups: GroupTable;
  public order: number;
  public callback: Function | undefined;
  public history: History;
  public container: Container;

  scrambler(): string {
    let result = "";
    const exps = [];
    let last = -1;
    const actions = ["U", "D", "R", "L", "F", "B"];
    let axis = -1;
    for (let i = 0; i < 3 * 3 * this.order; i++) {
      const exp = [];
      while (axis == last) {
        axis = Math.floor(Math.random() * 3);
      }
      const side = Math.floor(Math.random() * 2);
      let action = actions[axis * 2 + side];
      const prefix = Math.ceil(Math.random() * Math.floor(this.order / 2));
      if (prefix === 1) {
        action = action[0];
      }
      if (prefix > 2) {
        exp.push(prefix);
      }
      exp.push(action);
      const suffix = Math.random();
      if (suffix < 0.4) {
        exp.push("2");
      } else if (suffix < 0.7) {
        exp.push("'");
      }
      exps.push(exp.join(""));
      last = axis;
    }
    result = exps.join(" ");
    return result;
  }

  constructor(order: number, callback: Function | undefined = undefined) {
    super();
    this.order = order;
    this.callback = callback;
    this.container = new Container();
    this.add(this.container);
    this.scale.set(3 / order, 3 / order, 3 / order);
    for (let i = 0; i < order * order * order; i++) {
      const cubelet = new Cubelet(order, i);
      this.cubelets.push(cubelet);
      this.initials.push(cubelet);
      if (cubelet.exist) {
        this.container.add(cubelet);
      }
    }
    this.locks = new Map();
    this.locks.set("x", new Set());
    this.locks.set("y", new Set());
    this.locks.set("z", new Set());
    this.locks.set("a", new Set());
    this.history = new History();
    this.groups = new GroupTable(this);
    this.matrixAutoUpdate = false;
    this.updateMatrix();
  }

  lock(axis: string, layers: number[]): boolean {
    const tmp = this.locks.get(axis);
    if (tmp == undefined) {
      return false;
    }
    // 有其他轴上锁了
    for (const lock of this.locks.values()) {
      if (lock != tmp && lock.size > 0) {
        return false;
      }
    }
    // 层冲突
    for (const layer of layers) {
      if (tmp.has(layer)) {
        return false;
      }
    }
    for (const layer of layers) {
      tmp.add(layer);
    }
    return true;
  }

  unlock(axis: string, layers: number[]): void {
    const tmp = this.locks.get(axis);
    for (const layer of layers) {
      tmp?.delete(layer);
    }
  }

  record(action: TwistAction): void {
    this.history.record(action);
  }

  get complete(): boolean {
    const complete = [FACE.U, FACE.D, FACE.L, FACE.R, FACE.F, FACE.B].every((face) => {
      const group = this.groups.get(FACE[face]);
      if (!group) {
        throw Error();
      }
      let cubelet = this.cubelets[group.indices[0]];
      const color = cubelet.getColor(face);
      if (this.arrow) {
        const q1 = this.cubelets[group.indices[0]].rotation;
        const same = group.indices.every((idx) => {
          cubelet = this.cubelets[idx];
          const q2 = cubelet.rotation;
          return color == cubelet.getColor(face) && (q1.x - q2.x) ** 2 + (q1.y - q2.y) ** 2 + (q1.z - q2.z) ** 2 < 0.1;
        });
        return same;
      } else {
        const same = group.indices.every((idx) => {
          cubelet = this.cubelets[idx];
          return color == cubelet.getColor(face);
        });
        return same;
      }
    });
    return complete;
  }

  index(value: number): number {
    return this.initials[value].index;
  }

  public _arrow = false;
  set arrow(value: boolean) {
    this._arrow = value;
    for (const cubelet of this.cubelets) {
      cubelet.arrow = value;
    }
  }

  get arrow(): boolean {
    return this._arrow;
  }

  reset(): void {
    tweener.finish();
    for (const cubelet of this.cubelets) {
      cubelet.setRotationFromEuler(new THREE.Euler(0, 0, 0));
      cubelet.index = cubelet.initial;
      cubelet.updateMatrix();
    }
    this.cubelets.sort((left, right) => {
      return left.index - right.index;
    });
    this.container.dirty = true;
  }

  stick(index: number, face: number, value: string): void {
    const cubelet = this.initials[index];
    if (!cubelet) {
      throw Error("invalid cubelet index: " + index);
    }
    cubelet.stick(face, value);
    this.container.dirty = true;
    this.dirty = true;
  }

  strip(strip: { [face: string]: number[] | undefined }): void {
    for (const face of [FACE.L, FACE.R, FACE.D, FACE.U, FACE.B, FACE.F]) {
      const key = FACE[face];
      const group = this.groups.get(key);
      if (!group) {
        throw Error();
      }
      for (const index of group.indices) {
        this.initials[index].stick(face, "");
      }
      const indexes = strip[key];
      if (indexes == undefined) {
        continue;
      }
      for (const index of indexes) {
        const cubelet = this.initials[index];
        if (!cubelet) {
          throw Error("invalid cubelet index: " + index);
        }
        cubelet.stick(face, "remove");
      }
    }
    this.container.dirty = true;
    this.dirty = true;
  }

  twist(exp: string, reverse = false, times = 1, fast = false, force = false): boolean {
    const node = new TwistNode(exp, reverse, times);
    const list = node.parse();
    if (list.length > 1) {
      fast = true;
    }
    for (const action of list) {
      let success = this.execute(action, fast);
      if (!success && !fast && !force) {
        return false;
      }
      while (!success) {
        tweener.finish();
        success = this.execute(action, fast);
      }
    }
    return true;
  }

  private execute(action: TwistAction, fast: boolean): boolean {
    if (action.group == "#") {
      this.reset();
      this.dirty = true;
      this.history.clear();
      if (this.callback) {
        this.callback();
      }
      return true;
    }
    if (action.group == "*") {
      this.reset();
      this.dirty = true;
      const exp = this.scrambler();
      const node = new TwistNode(exp, false, 1);
      const list = node.parse();
      for (const action of list) {
        this.execute(action, true);
      }
      this.history.clear();
      this.history.init = exp;
      return true;
    }
    let angle = -Math.PI / 2;
    if (action.reverse) {
      angle = -angle;
    }
    if (action.times) {
      angle = angle * action.times;
    }
    const group = this.groups.get(action.group);
    if (group === undefined) {
      return true;
    }
    return group.twist(angle, fast);
  }

  undo(): void {
    if (this.history.length == 0) {
      return;
    }
    const last = this.history.last;
    this.twist(last.exp, true, 1, false, true);
  }
}
