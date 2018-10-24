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
  public width: number = 0;
  public height: number = 0;
  public scale: number = 1;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.rotation.x = Math.PI / 8;
    this.scene.rotation.y = Math.PI / 16 - Math.PI / 4;
    this.camera = new THREE.PerspectiveCamera(50, 1, 1, Game.SIZE * 2);
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = Game.SIZE * 2 / 3;
    this.tweener = new Tweener();
    this.twister = new Twister(this);
    this.cube = new Cube();

    this.scene.add(this.cube);
    for (let key in CubeletGroup.GROUPS) {
      this.scene.add(CubeletGroup.GROUPS[key]);
    }

    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.setClearColor(0xffffff);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.canvas = this.renderer.domElement;
    this.controller = new Controller(this);

    this.loop();
  }

  resize() {
    this.camera.aspect = this.width / this.height;
    let min = ((this.height / Math.min(this.width, this.height)) * Game.SIZE) * 2 / 3;
    let fov = (Math.atan(min / Game.SIZE) * 180) / Math.PI;
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
}
