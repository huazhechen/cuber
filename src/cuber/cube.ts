import { GroupTable } from "./group";
import Cubelet from "./cubelet";
import { FACE } from "./define";
import * as THREE from "three";
import Twister, { TwistAction } from "./twister";
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
  public table: GroupTable;
  public order: number;
  public callbacks: Function[] = [];
  public history: History;
  public container: Container;
  public twister: Twister = new Twister(this);

  constructor(order: number) {
    super();
    this.order = order;
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
    this.table = new GroupTable(this);
    this.matrixAutoUpdate = false;
    this.updateMatrix();
  }

  callback(): void {
    for (const callback of this.callbacks) {
      callback();
    }
  }

  lock(axis: string, layer: number): boolean {
    if (this.locks.get("a")?.has(1)) {
      return false;
    }
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
    tmp.add(layer);
    return true;
  }

  unlock(axis: string, layer: number): void {
    const tmp = this.locks.get(axis);
    tmp?.delete(layer);
  }

  record(action: TwistAction): void {
    this.history.record(action);
  }

  get complete(): boolean {
    const complete = [FACE.U, FACE.D, FACE.L, FACE.R, FACE.F, FACE.B].every((face) => {
      const group = this.table.face(FACE[face]);
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
      const group = this.table.face(key);
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
}
