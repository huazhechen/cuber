import * as THREE from "three";

import Cube from "./cube";
import Controller from "./controller";
import Cubelet from "./cubelet";
import { TouchAction } from "../common/define";

export default class Cuber {
  public width: number;
  public height: number;
  public dirty: boolean = false;

  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;

  public controller: Controller;
  public cube: Cube;

  private _mirror: boolean;
  get mirror() {
    return this._mirror;
  }
  set mirror(value: boolean) {
    this._mirror = value;
    for (let cubelet of this.cube.cubelets) {
      cubelet.mirror = value;
    }
    this.dirty = true;
  }

  private _scale: number;
  get scale() {
    return this._scale;
  }
  set scale(value) {
    this._scale = value;
    this.resize();
  }

  private _angle: number;
  get angle() {
    return this._angle;
  }
  set angle(value) {
    this._angle = value;
    this.scene.rotation.y = value;
    this.dirty = true;
  }

  private _gradient: number = Math.PI / 6;
  get gradient() {
    return this._gradient;
  }
  set gradient(value) {
    this._gradient = value;
    this.scene.rotation.x = value;
    this.dirty = true;
  }

  private _perspective: number = 1;
  get perspective() {
    return this._perspective;
  }
  set perspective(value) {
    this._perspective = value;
    this.resize();
  }

  private ambient: THREE.AmbientLight;
  private _brightness: number;
  get brightness() {
    return this._brightness;
  }
  set brightness(value) {
    this._brightness = value;
    this.ambient.intensity = value;
    this.dirty = true;
  }
  private directional: THREE.DirectionalLight;
  private _intensity: number;
  get intensity() {
    return this._intensity;
  }
  set intensity(value) {
    this._intensity = value;
    this.directional.intensity = value;
    this.dirty = true;
  }

  constructor() {
    this.controller = new Controller(this);
    this.cube = new Cube();

    this.scene = new THREE.Scene();
    this.scene.rotation.x = Math.PI / 6;
    this.scene.rotation.y = -Math.PI / 4 + Math.PI / 16;
    this.scene.add(this.cube);

    this.ambient = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(this.ambient);
    this.directional = new THREE.DirectionalLight(0xffffff, 0.2);
    this.directional.position.set(Cubelet.SIZE, Cubelet.SIZE * 4, Cubelet.SIZE * 2);
    this.scene.add(this.directional);

    this.camera = new THREE.PerspectiveCamera(50, 1, 1, Cubelet.SIZE * 32);
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 0;
    this.mirror = false;
    this.scale = 1;
    this.angle = -Math.PI / 8;
  }

  resize() {
    let min = this.height / Math.min(this.width, this.height) / this.scale / this.perspective;
    let fov = (2 * Math.atan(min) * 180) / Math.PI;

    this.camera.aspect = this.width / this.height;
    this.camera.fov = fov;
    let distance = Cubelet.SIZE * 3 * this.perspective;
    this.camera.position.z = distance;
    this.camera.near = distance - Cubelet.SIZE * 3;
    this.camera.far = distance + Cubelet.SIZE * 3;
    this.camera.lookAt(this.scene.position);
    this.camera.updateProjectionMatrix();
    this.dirty = true;
  }

  touch = (action: TouchAction) => {
    return this.controller.touch(action);
  };
}
