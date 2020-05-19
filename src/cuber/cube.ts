import { GroupTable } from "./group";
import Cubelet from "./cubelet";
import { FACE } from "./define";
import { Group, Euler } from "three";
import { TwistAction } from "./twister";
import History from "./history";

export default class Cube extends Group {
  public dirty = true;
  public lock = false;
  public cubelets: Cubelet[] = [];
  public initials: Cubelet[] = [];
  public groups: GroupTable;
  public complete = false;
  public order: number;
  public callback: Function | undefined;
  public history: History;

  constructor(order: number, callback: Function | undefined = undefined) {
    super();
    this.order = order;
    this.callback = callback;
    this.scale.set(3 / order, 3 / order, 3 / order);
    for (let i = 0; i < order * order * order; i++) {
      const cubelet = new Cubelet(order, i);
      this.cubelets.push(cubelet);
      this.initials.push(cubelet);
      if (cubelet.exist) {
        this.add(cubelet);
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
      const color = this.cubelets[group.indices[0]].getColor(face);
      const same = group.indices.every((idx) => {
        return color == this.cubelets[idx].getColor(face);
      });
      return same;
    });
    this.complete = complete;
    if (this.callback) {
      this.callback();
    }
  }

  index(value: number): number {
    return this.initials[value].index;
  }

  reset(): void {
    for (const cubelet of this.cubelets) {
      cubelet.setRotationFromEuler(new Euler(0, 0, 0));
      cubelet.index = cubelet.initial;
      cubelet.updateMatrix();
    }
    this.cubelets.sort((left, right) => {
      return left.index - right.index;
    });
  }

  stick(index: number, face: number, value: string): void {
    const cubelet = this.initials[index];
    if (!cubelet) {
      throw Error("invalid cubelet index: " + index);
    }
    cubelet.stick(face, value);
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
    this.dirty = true;
  }
}
