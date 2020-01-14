import * as THREE from "three";

import Cube from "./cube";
import Controller from "./controller";
import Twister from "./twister";
import Tweener from "./tweener";
import Cubelet from "./cubelet";
import History from "./history";
import { COLORS } from "../common/define";

export default class Cuber {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public dirty: boolean = false;

  public canvas: HTMLCanvasElement;
  public renderer: THREE.WebGLRenderer;
  public capture: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public display: boolean = true;

  public lock: boolean = false;
  public duration: number = 30;
  public history: History;
  public controller: Controller;
  public twister: Twister;
  public tweener: Tweener;
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

  stick() {
    for (let i = 0; i < 27; i++) {
      for (let face = 0; face < 6; face++) {
        this.cube.stick(i, face, "");
      }
    }
    this.dirty = true;
  }

  strip(strips: { indexes: number[]; faces: number[] }[]) {
    this.stick();
    for (let strip of strips) {
      for (let index of strip.indexes) {
        for (let face of strip.faces) {
          this.cube.stick(index, face, COLORS.GRAY);
        }
      }
    }
    this.dirty = true;
  }

  private _scale: number = 1;
  get scale() {
    return this._scale;
  }
  set scale(value) {
    this._scale = value;
    this.resize();
  }

  private _angle: number = Math.PI / 16;
  get angle() {
    return this._angle;
  }
  set angle(value) {
    this._angle = value;
    this.scene.rotation.y = -Math.PI / 4 + value;
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
    this.twister = new Twister(this);
    this.tweener = new Tweener(this);
    this.cube = new Cube(this);
    this.history = new History();

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true
    });
    this.renderer.autoClear = false;
    this.renderer.setClearColor(COLORS.BACKGROUND);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height, true);

    this.capture = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
    this.capture.setClearColor(0, 0);
    this.capture.setPixelRatio(1);
    this.capture.setSize(128, 128, true);

    this.scene = new THREE.Scene();
    this.scene.rotation.x = Math.PI / 6;
    this.scene.rotation.y = -Math.PI / 4 + Math.PI / 16;
    this.scene.add(this.cube);

    this.camera = new THREE.PerspectiveCamera(50, 1, 1, Cubelet.SIZE * 32);
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 0;

    this.loop();
  }

  resize() {
    let min = this.height / Math.min(this.width, this.height / 1.2) / 4;
    let fov = (2 * Math.atan((min * this.scale) / this.perspective) * 180) / Math.PI;

    this.camera.aspect = this.width / this.height;
    this.camera.fov = fov;
    this.camera.position.z = Cubelet.SIZE * 3 * 4 * this.perspective;
    this.camera.lookAt(this.scene.position);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height, true);
    this.dirty = true;
  }

  render() {
    if (this.dirty) {
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
      this.dirty = false;
    }
  }

  loop() {
    requestAnimationFrame(this.loop.bind(this));
    this.render();
  }

  blob() {
    this.camera.aspect = 1;
    this.camera.updateProjectionMatrix();
    this.capture.render(this.scene, this.camera);
    let content = this.capture.domElement.toDataURL("image/png");
    let parts = content.split(";base64,");
    let type = parts[0].split(":")[1];
    let raw = window.atob(parts[1]);
    let length = raw.length;
    let data = new Uint8Array(length);
    for (let i = 0; i < length; ++i) {
      data[i] = raw.charCodeAt(i);
    }
    let blob = new Blob([data], { type: type });
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    return blob;
  }
}
