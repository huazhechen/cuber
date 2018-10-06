import * as THREE from "three";
import Cubelet from "./cubelet";
import Game from "./game";
import { Euler } from "three";

export default class Cube extends THREE.Group {
  public cubelets: Cubelet[] = [];
  private _initial: Cubelet[] = [];

  constructor(game: Game) {
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
}
