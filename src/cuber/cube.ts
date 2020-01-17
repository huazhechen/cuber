import * as THREE from "three";
import Group from "./group";
import Cubelet from "./cubelet";
import History from "./history";
import { FACES, COLORS } from "../common/define";
import Twister from "./twister";

export default class Cube extends THREE.Group {
  public dirty: boolean = true;
  public lock: boolean = false;
  public history: History = new History();
  public twister: Twister;
  public cubelets: Cubelet[] = [];
  public initials: Cubelet[] = [];
  public groups: { [key: string]: Group };
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
      L: new Group(this, "L", [6, 15, 24, 3, 12, 21, 0, 9, 18], new THREE.Vector3(-1, 0, 0)),
      D: new Group(this, "D", [18, 19, 20, 9, 10, 11, 0, 1, 2], new THREE.Vector3(0, -1, 0)),
      B: new Group(this, "B", [8, 7, 6, 5, 4, 3, 2, 1, 0], new THREE.Vector3(0, 0, -1)),
      R: new Group(this, "R", [26, 17, 8, 23, 14, 5, 20, 11, 2], new THREE.Vector3(+1, 0, 0)),
      U: new Group(this, "U", [6, 7, 8, 15, 16, 17, 24, 25, 26], new THREE.Vector3(0, +1, 0)),
      F: new Group(this, "F", [24, 25, 26, 21, 22, 23, 18, 19, 20], new THREE.Vector3(0, 0, +1)),
      l: new Group(this, "l", [0, 3, 6, 9, 12, 15, 18, 21, 24, 1, 4, 7, 10, 13, 16, 19, 22, 25], new THREE.Vector3(-1, 0, 0)),
      d: new Group(this, "d", [0, 1, 2, 9, 10, 11, 18, 19, 20, 3, 4, 5, 12, 13, 14, 21, 22, 23], new THREE.Vector3(0, -1, 0)),
      b: new Group(this, "b", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], new THREE.Vector3(0, 0, -1)),
      r: new Group(this, "r", [2, 5, 8, 11, 14, 17, 20, 23, 26, 1, 4, 7, 10, 13, 16, 19, 22, 25], new THREE.Vector3(+1, 0, 0)),
      u: new Group(this, "u", [6, 7, 8, 15, 16, 17, 24, 25, 26, 3, 4, 5, 12, 13, 14, 21, 22, 23], new THREE.Vector3(0, +1, 0)),
      f: new Group(this, "f", [18, 19, 20, 21, 22, 23, 24, 25, 26, 9, 10, 11, 12, 13, 14, 15, 16, 17], new THREE.Vector3(0, 0, +1)),
      M: new Group(this, "M", [1, 4, 7, 10, 13, 16, 19, 22, 25], new THREE.Vector3(-1, 0, 0)),
      E: new Group(this, "E", [3, 4, 5, 12, 13, 14, 21, 22, 23], new THREE.Vector3(0, -1, 0)),
      S: new Group(this, "S", [9, 10, 11, 12, 13, 14, 15, 16, 17], new THREE.Vector3(0, 0, +1)),
      x: new Group(this, "x", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26], new THREE.Vector3(+1, 0, 0)),
      y: new Group(this, "y", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26], new THREE.Vector3(0, +1, 0)),
      z: new Group(this, "z", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26], new THREE.Vector3(0, 0, +1))
    };
    for (let key in this.groups) {
      this.add(this.groups[key]);
    }
    this.matrixAutoUpdate = false;
    this.updateMatrix();
  }

  index(value: number) {
    return this.initials[value].index;
  }

  reset() {
    for (let cubelet of this.cubelets) {
      cubelet.setRotationFromEuler(new THREE.Euler(0, 0, 0));
      cubelet.index = cubelet.initial;
      cubelet.updateMatrix();
    }
    this.cubelets.sort((left, right) => {
      return left.index - right.index;
    });
  }

  stick() {
    for (let i = 0; i < 27; i++) {
      for (let face = 0; face < 6; face++) {
        this.initials[i].stick(face, "");
      }
    }
    this.dirty = true;
  }

  strip(strips: { indexes: number[]; faces: number[] }[]) {
    this.stick();
    for (let strip of strips) {
      for (let index of strip.indexes) {
        for (let face of strip.faces) {
          this.initials[index].stick(face, COLORS.GRAY);
        }
      }
    }
    this.dirty = true;
  }

  get complete(): boolean {
    let complete = [0, 1, 2, 3, 4, 5].every(face => {
      let color = this.cubelets[this.groups[FACES[face]].indices[0]].getColor(face);
      let same = this.groups[FACES[face]].indices.every(idx => {
        return color == this.cubelets[idx].getColor(face);
      });
      return same;
    });
    return complete;
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
      result.push(this.cubelets[i].getColor(FACES.U));
    }
    for (let i of this.groups.R.indices) {
      result.push(this.cubelets[i].getColor(FACES.R));
    }
    for (let i of this.groups.F.indices) {
      result.push(this.cubelets[i].getColor(FACES.F));
    }
    for (let i of this.groups.D.indices) {
      result.push(this.cubelets[i].getColor(FACES.D));
    }
    for (let i of this.groups.L.indices) {
      result.push(this.cubelets[i].getColor(FACES.L));
    }
    for (let i of this.groups.B.indices) {
      result.push(this.cubelets[i].getColor(FACES.B));
    }
    return result.join("");
  }
}
