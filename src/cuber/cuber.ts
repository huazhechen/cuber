import * as THREE from "three";

import Cube from "./cube";
import Controller from "./controller";
import Cubelet from "./cubelet";
import Preferance from "./preferance";

export default class Cuber {
  public preferance: Preferance;
  public width: number;
  public height: number;
  public dirty: boolean = false;

  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;

  public controller: Controller;
  public cube: Cube;

  public ambient: THREE.AmbientLight;
  public directional: THREE.DirectionalLight;

  constructor() {
    this.cube = new Cube();
    this.preferance = new Preferance(this);
    this.controller = new Controller(this);

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
    this.preferance.load();
  }

  resize() {
    let scale = this.preferance.scale / 100 + 0.5;
    let perspective = (100.1 / (this.preferance.perspective + 0.01)) * 4 - 3;
    let min = this.height / Math.min(this.width, this.height) / scale / perspective;
    let fov = (2 * Math.atan(min) * 180) / Math.PI;

    this.camera.aspect = this.width / this.height;
    this.camera.fov = fov;
    let distance = Cubelet.SIZE * 3 * perspective;
    this.camera.position.z = distance;
    this.camera.near = distance - Cubelet.SIZE * 3;
    this.camera.far = distance + Cubelet.SIZE * 3;
    this.camera.lookAt(this.scene.position);
    this.camera.updateProjectionMatrix();
    this.dirty = true;
  }
}
