import Cube from "./cube";
import Cubelet from "./cubelet";
import { Scene, PerspectiveCamera, AmbientLight, DirectionalLight } from "three";
import Twister from "./twister";
import Controller from "./controller";

export default class World {
  public width: number = 1;
  public height: number = 1;
  public dirty: boolean = false;

  public scene: Scene;
  public camera: PerspectiveCamera;

  public cube: Cube;

  public ambient: AmbientLight;
  public directional: DirectionalLight;

  private cubes: Cube[] = [];
  public callbacks: Function[] = [];

  public twister: Twister;
  public controller: Controller;

  constructor() {
    this.scene = new Scene();
    this.scene.rotation.x = Math.PI / 6;
    this.scene.rotation.y = -Math.PI / 4 + Math.PI / 16;

    this.ambient = new AmbientLight(0xffffff, 0.8);
    this.scene.add(this.ambient);
    this.directional = new DirectionalLight(0xffffff, 0.2);
    this.directional.position.set(Cubelet.SIZE, Cubelet.SIZE * 4, Cubelet.SIZE * 2);
    this.scene.add(this.directional);

    this.camera = new PerspectiveCamera(50, 1, 1, Cubelet.SIZE * 32);
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 0;

    this.twister = new Twister(this);
    this.controller = new Controller(this);
    this.order = 3;
  }

  set order(value: number) {
    this.scene.remove(this.cube);
    if (this.cubes[value] == undefined) {
      this.cubes[value] = new Cube(value, this.callback);
    }
    this.cube = this.cubes[value];
    this.scene.add(this.cube);
    this.dirty = true;
  }

  get order() {
    return this.cube.order;
  }

  callback = () => {
    for (let callback of this.callbacks) {
      callback();
    }
  };

  scale: number = 1;
  perspective: number = 5;
  resize() {
    let min = this.height / Math.min(this.width, this.height) / this.scale / this.perspective;
    let fov = (2 * Math.atan(min) * 180) / Math.PI;

    this.camera.aspect = this.width / this.height;
    this.camera.fov = fov;
    let distance = Cubelet.SIZE * 3 * this.perspective;
    this.camera.position.z = distance;
    this.camera.near = distance - Cubelet.SIZE * 3;
    this.camera.far = distance + Cubelet.SIZE * 4;
    this.camera.lookAt(this.scene.position);
    this.camera.updateProjectionMatrix();
    this.dirty = true;
  }
}
