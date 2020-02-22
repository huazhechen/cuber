import Cubelet from "./cubelet";
import { TwistAction } from "./twister";
import Cube from "./cube";
import { tweener } from "./tweener";
import { Group, Vector3 } from "three";

export default class CubeGroup extends Group {
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
      for (const callback of this.cube.callbacks) {
        callback();
      }
    }
    this.angle = 0;
  }

  twist(angle = this.angle) {
    angle = Math.round(angle / (Math.PI / 2)) * (Math.PI / 2);
    let exp = this.name;
    let reverse = angle > 0;
    let times = Math.round(Math.abs(angle) / (Math.PI / 2));
    if (times != 0) {
      this.cube.history.record(new TwistAction(exp, reverse, times));
    }
    let delta = angle - this.angle;
    if (delta === 0) {
      this.drop();
    } else {
      let d = Math.abs(delta) / (Math.PI / 2);
      var duration = this.cube.duration * (2 - 2 / (d + 1));
      tweener.tween(this.angle, angle, duration, (value: number) => {
        this.angle = value;
        if (this.angle === angle || this.angle === 0) {
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
