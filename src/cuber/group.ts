import * as THREE from "three";
import Cubelet from "./cubelet";
import Cuber from "./cuber";
import { TwistAction } from "./twister";

export default class Group extends THREE.Group {
  cuber: Cuber;
  cubelets: Cubelet[];
  name: string;
  indices: number[];
  axis: THREE.Vector3;

  _angle: number;
  set angle(angle) {
    this.setRotationFromAxisAngle(this.axis, angle);
    this._angle = angle;
    this.updateMatrix();
    this.cuber.dirty = true;
  }
  get angle() {
    return this._angle;
  }

  constructor(cuber: Cuber, name: string, indices: number[], axis: THREE.Vector3) {
    super();
    this.cuber = cuber;
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
      let cubelet = this.cuber.cube.cubelets[i];
      this.cubelets.push(cubelet);
      this.cuber.cube.remove(cubelet);
      this.add(cubelet);
    }
    this.cuber.lock = true;
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
      this.cuber.cube.add(cubelet);
      this.cuber.cube.cubelets[cubelet.index] = cubelet;
    }
    this.cuber.lock = false;
    this.angle = 0;
  }

  twist(angle = this.angle, callback: Function | null = null) {
    angle = Math.round(angle / (Math.PI / 2)) * (Math.PI / 2);
    let exp = this.name;
    let reverse = angle > 0;
    let times = Math.round(Math.abs(angle) / (Math.PI / 2));
    if (times != 0) {
      this.cuber.history.record(new TwistAction(exp, reverse, times));
    }
    let delta = angle - this.angle;

    if (delta === 0) {
      this.drop();
      if (callback) {
        callback();
      }
    } else {
      var duration = this.cuber.duration * Math.min(1, Math.abs(delta) / (Math.PI / 2));
      this.cuber.tweener.tween(this.angle, angle, duration, (value: number) => {
        this.angle = value;
        if (this.angle === angle || this.angle === 0) {
          this.drop();
          if (callback) {
            callback();
          }
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
