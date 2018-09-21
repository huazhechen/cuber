import * as THREE from "three";

import Cube from "./cube";
import Tweener from "./tweener";
import Controller from "./controller";
import Twister from "./twister";
import Group from "./group";

export default class Game {
  public static readonly SIZE: number = 1024;
  public container: Element;
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public lock: boolean = false;

  public cube: Cube;
  public tweener: Tweener;
  public twister: Twister;
  public controller: Controller;
  public camera: THREE.PerspectiveCamera;

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 1, Game.SIZE);
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = Game.SIZE / 3;
    this.tweener = new Tweener();
    this.twister = new Twister(this);
    this.controller = new Controller(this);
    this.cube = new Cube(this);

    this.scene.add(this.cube);
    for (let key in Group.GROUPS) {
      this.scene.add(Group.GROUPS[key]);
    }

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0xffffff);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.loop();
  }

  attach(container: Element) {
    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    if (!container.contains(this.renderer.domElement)) {
      container.appendChild(this.renderer.domElement);
    }
  }

  render() {
    this.twister.update();
    this.tweener.update();
    this.controller.update();
    this.camera.lookAt(this.scene.position);
    this.camera.updateMatrixWorld(true);
    this.renderer.render(this.scene, this.camera);
  }

  loop() {
    requestAnimationFrame(this.loop.bind(this));
    this.render();
  }

  twist(key: string, reverse: boolean = false, times: number = 1) {
    this.twister.twist(key, reverse, times);
  }
}
