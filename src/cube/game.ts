import * as THREE from "three";

import Cube from "./cube";
import Tweener from "./tweener";
import Controller from "./controller";
import Twister from "./twister";
import CubeletGroup from "./group";

export default class Game {
  public static readonly SIZE: number = 1024;
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
  public callbacks: Function[] = [];

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.rotation.x = Math.PI / 8;
    this.scene.rotation.y = Math.PI / 16 - Math.PI / 4;
    this.camera = new THREE.PerspectiveCamera(50, 1, 1, Game.SIZE);
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = Game.SIZE / 3;
    this.tweener = new Tweener();
    this.twister = new Twister(this);
    this.cube = new Cube();

    this.scene.add(this.cube);
    for (let key in CubeletGroup.GROUPS) {
      this.scene.add(CubeletGroup.GROUPS[key]);
    }

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0xffffff);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.canvas = this.renderer.domElement;
    this.controller = new Controller(this);

    this.loop();
  }

  random() {
    let result = "";
    if (!this.lock) {
      let exps: string[] = [];
      let last = -1;
      let actions = ["U", "D", "R", "L", "F", "B"];
      let axis = -1;
      for (let i = 0; i < 20; i++) {
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
      this.twister.twist(result, false, 1, null, true);
      this.dirty = true;
    }
    return result;
  }

  reset() {
    if (!this.lock) {
      this.cube.reset();
      this.dirty = true;
    }
  }

  resize(width: number, height: number) {
    this.camera.aspect = width / height;
    let min = ((height / Math.min(width, height)) * Game.SIZE) / 4;
    let fov = (2 * Math.atan(min / Game.SIZE) * 180) / Math.PI;
    this.camera.fov = fov;
    this.camera.lookAt(this.scene.position);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, true);
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
}
