import { GroupTable } from "./group";
import Cubelet from "./cubelet";
import { FACE } from "./define";
import * as THREE from "three";
import { TwistAction } from "./twister";
import History from "./history";

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
  public lock = false;
  public cubelets: Cubelet[] = [];
  public initials: Cubelet[] = [];
  public groups: GroupTable;
  public complete = false;
  public order: number;
  public callback: Function | undefined;
  public history: History;
  public container: Container;

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
    this.history = new History();
    this.groups = new GroupTable(this);
    this.matrixAutoUpdate = false;
    this.updateMatrix();
  }

  record(action: TwistAction): void {
    this.history.record(action);
  }

  update(): void {
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
    this.complete = complete;
    if (this.callback) {
      this.callback();
    }
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
}
