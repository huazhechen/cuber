import * as THREE from "three";

import Cube from "./cube";
import Tweener from "./tweener";
import Controller from "./controller";
import Twister from "./twister";
import CubeletGroup from "./group";
import Cubelet from "./cubelet";

export default class Game {
  public container: Element;
  public canvas: HTMLCanvasElement;
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public lock: boolean = false;
  public enable: boolean = true;

  public cube: Cube;
  public tweener: Tweener;
  public twister: Twister;
  public controller: Controller;
  public camera: THREE.PerspectiveCamera;

  public dirty: boolean = true;
  public duration: number = 60;
  public width: number = 0;
  public height: number = 0;
  public scale: number = 1;
  public history: string[] = [];

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.rotation.x = Math.PI / 6;
    this.scene.rotation.y = -Math.PI * 3 / 16;
    this.camera = new THREE.PerspectiveCamera(50, 1, 1, Cubelet.SIZE * 32);
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = Cubelet.SIZE * 3 * 4;
    this.tweener = new Tweener();
    this.twister = new Twister(this);
    this.cube = new Cube();

    this.scene.add(this.cube);
    for (let key in CubeletGroup.GROUPS) {
      this.scene.add(CubeletGroup.GROUPS[key]);
    }

    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.setClearColor(0xe0e0e0);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.canvas = this.renderer.domElement;
    this.controller = new Controller(this);

    this.loop();
  }

  resize() {
    this.camera.aspect = this.width / this.height;
    let min = this.height / Math.min(this.width, this.height) / 4;
    let fov = (2 * Math.atan(min) * 180) / Math.PI;
    this.camera.fov = fov * this.scale;
    this.camera.lookAt(this.scene.position);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height, true);
    this.dirty = true;
  }

  render() {
    if (this.dirty) {
      this.renderer.render(this.scene, this.camera);
      this.dirty = false;
    }
  }

  loop() {
    requestAnimationFrame(this.loop.bind(this));
    this.render();
  }

  random() {
    let result = "";
    let exps: string[] = [];
    let last = -1;
    let actions = ["U", "D", "R", "L", "F", "B"];
    let axis = -1;
    for (let i = 0; i < 24; i++) {
      let exp: string[] = [];
      while (axis == last) {
        axis = Math.floor(Math.random() * 3);
      }
      let side = Math.floor(Math.random() * 2);
      exp.push(actions[axis * 2 + side]);
      let suffix = Math.random();
      if (suffix < 0.2) {
        exp.push("2");
      } else if (suffix < 0.6) {
        exp.push("'");
      }
      exps.push(exp.join(""));
      last = axis;
    }
    result = exps.join(" ");
    return result;
  }
}
