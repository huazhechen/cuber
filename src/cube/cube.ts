import * as THREE from "three";
import { Euler } from "three";
import Cubelet, { FACES } from "./cubelet";
import CubeletGroup from "./group";
export default class Cube extends THREE.Group {
  public cubelets: Cubelet[] = [];
  private _initial: Cubelet[] = [];

  constructor() {
    super();
    for (var i = 0; i < 27; i++) {
      let cubelet = new Cubelet(i);
      this.cubelets.push(cubelet);
      this._initial.push(cubelet);
      this.add(cubelet);
    }
    this.matrixAutoUpdate = false;
    this.updateMatrix();
  }

  compare(left: Cubelet, right: Cubelet) {
    return left.index - right.index;
  }

  index(value: number) {
    return this._initial[value].index;
  }

  reset() {
    for (let cubelet of this.cubelets) {
      cubelet.setRotationFromEuler(new Euler(0, 0, 0));
      cubelet.index = cubelet.initial;
      cubelet.updateMatrix();
    }
    this.cubelets.sort(this.compare);
  }

  stick() {
    for (let cubelet of this.cubelets) {
      cubelet.stick();
    }
  }

  strip(index: number, faces: number[]) {
    for (let face of faces) {
      this._initial[index].strip(face);
    }
  }

  highlight(index: number) {
    this._initial[index].highlight();
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
    let result: string[] = [];
    for (let i of CubeletGroup.GROUPS.U.indices) {
      result.push(this.cubelets[i].getColor(FACES.U));
    }
    for (let i of CubeletGroup.GROUPS.R.indices) {
      result.push(this.cubelets[i].getColor(FACES.R));
    }
    for (let i of CubeletGroup.GROUPS.F.indices) {
      result.push(this.cubelets[i].getColor(FACES.F));
    }
    for (let i of CubeletGroup.GROUPS.D.indices) {
      result.push(this.cubelets[i].getColor(FACES.D));
    }
    for (let i of CubeletGroup.GROUPS.L.indices) {
      result.push(this.cubelets[i].getColor(FACES.L));
    }
    for (let i of CubeletGroup.GROUPS.B.indices) {
      result.push(this.cubelets[i].getColor(FACES.B));
    }
    return result.join("");
  }
}
