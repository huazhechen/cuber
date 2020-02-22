import CubeGroup from "./group";
import Cubelet from "./cubelet";
import History from "./history";
import Twister from "./twister";
import { FACE, COLORS } from "./define";
import { Vector3, Group, Euler } from "three";

export default class Cube extends Group {
  public dirty: boolean = true;
  public lock: boolean = false;
  public history: History = new History();
  public twister: Twister;
  public cubelets: Cubelet[] = [];
  public initials: Cubelet[] = [];
  public callbacks: Function[] = [];
  public groups: { [key: string]: CubeGroup };
  public complete: boolean = false;
  public duration: number;

  constructor() {
    super();
    this.twister = new Twister(this);
    for (var i = 0; i < 27; i++) {
      let cubelet = new Cubelet(i);
      this.cubelets.push(cubelet);
      this.initials.push(cubelet);
      this.add(cubelet);
    }
    this.groups = {
      L: new CubeGroup(this, "L", [6, 15, 24, 3, 12, 21, 0, 9, 18], new Vector3(-1, 0, 0)),
      D: new CubeGroup(this, "D", [18, 19, 20, 9, 10, 11, 0, 1, 2], new Vector3(0, -1, 0)),
      B: new CubeGroup(this, "B", [8, 7, 6, 5, 4, 3, 2, 1, 0], new Vector3(0, 0, -1)),
      R: new CubeGroup(this, "R", [26, 17, 8, 23, 14, 5, 20, 11, 2], new Vector3(+1, 0, 0)),
      U: new CubeGroup(this, "U", [6, 7, 8, 15, 16, 17, 24, 25, 26], new Vector3(0, +1, 0)),
      F: new CubeGroup(this, "F", [24, 25, 26, 21, 22, 23, 18, 19, 20], new Vector3(0, 0, +1)),
      l: new CubeGroup(this, "l", [0, 3, 6, 9, 12, 15, 18, 21, 24, 1, 4, 7, 10, 13, 16, 19, 22, 25], new Vector3(-1, 0, 0)),
      d: new CubeGroup(this, "d", [0, 1, 2, 9, 10, 11, 18, 19, 20, 3, 4, 5, 12, 13, 14, 21, 22, 23], new Vector3(0, -1, 0)),
      b: new CubeGroup(this, "b", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], new Vector3(0, 0, -1)),
      r: new CubeGroup(this, "r", [2, 5, 8, 11, 14, 17, 20, 23, 26, 1, 4, 7, 10, 13, 16, 19, 22, 25], new Vector3(+1, 0, 0)),
      u: new CubeGroup(this, "u", [6, 7, 8, 15, 16, 17, 24, 25, 26, 3, 4, 5, 12, 13, 14, 21, 22, 23], new Vector3(0, +1, 0)),
      f: new CubeGroup(this, "f", [18, 19, 20, 21, 22, 23, 24, 25, 26, 9, 10, 11, 12, 13, 14, 15, 16, 17], new Vector3(0, 0, +1)),
      M: new CubeGroup(this, "M", [1, 4, 7, 10, 13, 16, 19, 22, 25], new Vector3(-1, 0, 0)),
      E: new CubeGroup(this, "E", [3, 4, 5, 12, 13, 14, 21, 22, 23], new Vector3(0, -1, 0)),
      S: new CubeGroup(this, "S", [9, 10, 11, 12, 13, 14, 15, 16, 17], new Vector3(0, 0, +1)),
      x: new CubeGroup(this, "x", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26], new Vector3(+1, 0, 0)),
      y: new CubeGroup(this, "y", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26], new Vector3(0, +1, 0)),
      z: new CubeGroup(this, "z", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26], new Vector3(0, 0, +1))
    };
    for (let key in this.groups) {
      this.add(this.groups[key]);
    }
    this.callbacks.push(() => {
      let complete = [0, 1, 2, 3, 4, 5].every(face => {
        let color = this.cubelets[this.groups[FACE[face]].indices[0]].getColor(face);
        let same = this.groups[FACE[face]].indices.every(idx => {
          return color == this.cubelets[idx].getColor(face);
        });
        return same;
      });
      this.complete = complete;
    });
    this.matrixAutoUpdate = false;
    this.updateMatrix();
    this.duration = 30;
  }

  index(value: number) {
    return this.initials[value].index;
  }

  reset() {
    for (let cubelet of this.cubelets) {
      cubelet.setRotationFromEuler(new Euler(0, 0, 0));
      cubelet.index = cubelet.initial;
      cubelet.updateMatrix();
    }
    this.cubelets.sort((left, right) => {
      return left.index - right.index;
    });
  }

  stick(face: number, index: number, color: string) {
    let group = this.groups[FACE[face]];
    this.initials[group.indices[index - 1]].stick(face, color);
    this.dirty = true;
  }

  strip(strip: { [face: string]: number[] | undefined }) {
    for (const face of [FACE.L, FACE.R, FACE.D, FACE.U, FACE.B, FACE.F]) {
      let key = FACE[face];
      let group = this.groups[FACE[face]];
      for (let i = 0; i < 9; i++) {
        this.initials[group.indices[i]].stick(face, "");
      }
      let indexes = strip[key];
      if (indexes == undefined) {
        continue;
      }
      for (const index of indexes) {
        this.initials[group.indices[index - 1]].stick(face, COLORS.BLACK);
      }
    }
    this.dirty = true;
  }

  //                +------------+
  //                | U1  U2  U3 |
  //                |            |
  //                | U4  U5  U6 |
  //                |            |
  //                | U7  U8  U9 |
  //   +------------+------------+------------+------------+
  //   | L1  L2  L3 | F1  F2  F3 | R1  R2  R3 | B1  B2  B3 |
  //   |            |            |            |            |
  //   | L4  L5  L6 | F4  F5  F6 | R4  R5  R6 | B4  B5  B6 |
  //   |            |            |            |            |
  //   | L7  L8  L9 | F7  F8  F9 | R7  R8  R9 | B7  B8  B9 |
  //   +------------+------------+------------+------------+
  //                | D1  D2  D3 |
  //                |            |
  //                | D4  D5  D6 |
  //                |            |
  //                | D7  D8  D9 |
  //                +------------+
  get state() {
    let result = [];
    for (let i of this.groups.U.indices) {
      result.push(this.cubelets[i].getColor(FACE.U));
    }
    for (let i of this.groups.R.indices) {
      result.push(this.cubelets[i].getColor(FACE.R));
    }
    for (let i of this.groups.F.indices) {
      result.push(this.cubelets[i].getColor(FACE.F));
    }
    for (let i of this.groups.D.indices) {
      result.push(this.cubelets[i].getColor(FACE.D));
    }
    for (let i of this.groups.L.indices) {
      result.push(this.cubelets[i].getColor(FACE.L));
    }
    for (let i of this.groups.B.indices) {
      result.push(this.cubelets[i].getColor(FACE.B));
    }
    return result.join("");
  }
}
