import * as THREE from "three";

import Cube from "./cube";
import Controller from "./controller";
import { tweener } from "./tweener";
import Cubelet from "./cubelet";
import { COLORS } from "../common/define";

export default class Cuber {
  public width: number;
  public height: number;
  public dirty: boolean = false;

  public canvas: HTMLCanvasElement;
  public renderer: THREE.WebGLRenderer;
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

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.controller = new Controller(this);
    this.cube = new Cube();

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true
    });
    this.renderer.autoClear = false;
    this.renderer.setClearColor(COLORS.BACKGROUND);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height, true);

    this.scene = new THREE.Scene();
    this.scene.rotation.x = Math.PI / 6;
    this.scene.rotation.y = -Math.PI / 4 + Math.PI / 16;
    this.scene.add(this.cube);

    let light;
    light = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(light);
    light = new THREE.DirectionalLight(0xffffff, 0.2);
    light.position.set(0, Cubelet.SIZE * 4, 0);
    this.scene.add(light);
    light = new THREE.DirectionalLight(0xffffff, 0.1);
    light.position.set(0, 0, Cubelet.SIZE * 4);
    this.scene.add(light);

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
    this.renderer.setSize(this.width, this.height, true);
    this.dirty = true;
  }

  render() {
    if (this.dirty || this.cube.dirty) {
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
      this.dirty = false;
      this.cube.dirty = false;
      return true;
    }
    return false;
  }
}
