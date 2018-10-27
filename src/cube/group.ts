import * as THREE from "three";

import Game from "./game";
import Cubelet from "./cubelet";
import { TwistAction } from "./twister";

export default class CubeletGroup extends THREE.Group {
  public static readonly GROUPS: { [key: string]: CubeletGroup } = {
    L: new CubeletGroup("L", [6, 15, 24, 3, 12, 21, 0, 9, 18], new THREE.Vector3(-1, 0, 0)),
    D: new CubeletGroup("D", [18, 19, 20, 9, 10, 11, 0, 1, 2], new THREE.Vector3(0, -1, 0)),
    B: new CubeletGroup("B", [8, 7, 6, 5, 4, 3, 2, 1, 0], new THREE.Vector3(0, 0, -1)),
    R: new CubeletGroup("R", [26, 17, 8, 23, 14, 5, 20, 11, 2], new THREE.Vector3(+1, 0, 0)),
    U: new CubeletGroup("U", [6, 7, 8, 15, 16, 17, 24, 25, 26], new THREE.Vector3(0, +1, 0)),
    F: new CubeletGroup("F", [24, 25, 26, 21, 22, 23, 18, 19, 20], new THREE.Vector3(0, 0, +1)),
    l: new CubeletGroup("l", [0, 3, 6, 9, 12, 15, 18, 21, 24, 1, 4, 7, 10, 13, 16, 19, 22, 25], new THREE.Vector3(-1, 0, 0)),
    d: new CubeletGroup("d", [0, 1, 2, 9, 10, 11, 18, 19, 20, 3, 4, 5, 12, 13, 14, 21, 22, 23], new THREE.Vector3(0, -1, 0)),
    b: new CubeletGroup("b", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], new THREE.Vector3(0, 0, -1)),
    r: new CubeletGroup("r", [2, 5, 8, 11, 14, 17, 20, 23, 26, 1, 4, 7, 10, 13, 16, 19, 22, 25], new THREE.Vector3(+1, 0, 0)),
    u: new CubeletGroup("u", [6, 7, 8, 15, 16, 17, 24, 25, 26, 3, 4, 5, 12, 13, 14, 21, 22, 23], new THREE.Vector3(0, +1, 0)),
    f: new CubeletGroup("f", [18, 19, 20, 21, 22, 23, 24, 25, 26, 9, 10, 11, 12, 13, 14, 15, 16, 17], new THREE.Vector3(0, 0, +1)),
    M: new CubeletGroup("M", [1, 4, 7, 10, 13, 16, 19, 22, 25], new THREE.Vector3(-1, 0, 0)),
    E: new CubeletGroup("E", [3, 4, 5, 12, 13, 14, 21, 22, 23], new THREE.Vector3(0, -1, 0)),
    S: new CubeletGroup("S", [9, 10, 11, 12, 13, 14, 15, 16, 17], new THREE.Vector3(0, 0, +1)),
    x: new CubeletGroup("x", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26], new THREE.Vector3(+1, 0, 0)),
    y: new CubeletGroup("y", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26], new THREE.Vector3(0, +1, 0)),
    z: new CubeletGroup("z", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26], new THREE.Vector3(0, 0, +1))
  };

  private _cubelets: Cubelet[] = [];
  private _angle: number;
  public indices: number[];
  public axis: THREE.Vector3;
  public name: string;

  constructor(name: string, indices: number[], axis: THREE.Vector3) {
    super();
    this.name = name;
    this.indices = indices;
    this.axis = axis;
    this.matrixAutoUpdate = false;
    this.updateMatrix();
  }

  set angle(angle: number) {
    this.setRotationFromAxisAngle(this.axis, angle);
    this._angle = angle;
    this.updateMatrix();
  }
  get angle() {
    return this._angle;
  }

  get exp() {
    let reverse = this._angle > 0;
    let times = Math.round(Math.abs(this._angle) / (Math.PI / 2));
    let action = new TwistAction();
    action.exp = this.name;
    action.times = times;
    action.reverse = reverse;
    return action.format;
  }

  hold(game: Game): void {
    this._angle = 0;
    for (let i of this.indices) {
      let cubelet = game.cube.cubelets[i];
      this._cubelets.push(cubelet);
      game.cube.remove(cubelet);
      this.add(cubelet);
    }
    game.lock = true;
  }

  revert(game: Game) {
    let angle = -this._angle;
    if (angle === 0) {
      while (true) {
        let cubelet = this._cubelets.pop();
        if (undefined === cubelet) {
          break;
        }
        this.remove(cubelet);
        game.cube.add(cubelet);
        game.cube.cubelets[cubelet.index] = cubelet;
      }
      this._angle = 0;
      game.lock = false;
      game.dirty = true;
    } else {
      var duration = game.duration * Math.min(1, Math.abs(angle) / Math.PI);
      duration = duration / 2;
      game.tweener.tween(
        this.angle,
        this.angle + angle,
        duration,
        (value: number) => {
          this.angle = value;
          game.dirty = true;
        },
        () => {
          this.revert(game);
        }
      );
    }
  }

  adjust(game: Game, angle: number = this._angle) {
    angle = Math.round(angle / (Math.PI / 2)) * (Math.PI / 2);
    let delta = angle - this._angle;

    if (delta === 0) {
      while (true) {
        let cubelet = this._cubelets.pop();
        if (undefined === cubelet) {
          break;
        }
        this.rotate(cubelet);
        this.remove(cubelet);
        game.cube.add(cubelet);
        game.cube.cubelets[cubelet.index] = cubelet;
      }
      game.lock = false;
      game.dirty = true;
      this._angle = 0;
    } else {
      var duration = game.duration * Math.min(1, Math.abs(delta) / Math.PI);
      game.tweener.tween(
        this.angle,
        this.angle + delta,
        duration,
        (value: number) => {
          this.angle = value;
          game.dirty = true;
        },
        () => {
          this.adjust(game, this.angle);
        }
      );
    }
  }
  rotate(cubelet: Cubelet) {
    cubelet.rotateOnWorldAxis(this.axis, this._angle);
    cubelet.vector = cubelet.vector.applyAxisAngle(this.axis, this._angle);
    cubelet.updateMatrix();
  }
}
