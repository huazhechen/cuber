import Cube from "./cube";
import Cubelet from "./cubelet";
import { Scene, PerspectiveCamera, AmbientLight, DirectionalLight } from "three";
import Controller from "./controller";

export default class World {
  public width = 1;
  public height = 1;

  public scene: Scene;
  public camera: PerspectiveCamera;

  public cube: Cube;

  public ambient: AmbientLight;
  public directional: DirectionalLight;

  private cubes: Cube[] = [];
  public callbacks: Function[] = [];

  public controller: Controller;

  constructor() {
    this.scene = new Scene();
    this.scene.matrixAutoUpdate = false;
    this.scene.rotation.x = Math.PI / 6;
    this.scene.rotation.y = -Math.PI / 4 + Math.PI / 16;

    this.ambient = new AmbientLight(0xffffff, 1);
    this.scene.add(this.ambient);
    this.directional = new DirectionalLight(0xffffff, 0);
    this.directional.position.set(Cubelet.SIZE, Cubelet.SIZE * 3, Cubelet.SIZE * 2);
    this.scene.add(this.directional);
    this.scene.updateMatrix();

    this.camera = new PerspectiveCamera(50, 1, 1, Cubelet.SIZE * 32);
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 0;

    this.controller = new Controller(this);
    this.order = 3;
  }

  set dirty(value: boolean) {
    this.cube.dirty = value;
    this.cube.container.dirty = value;
  }

  get dirty(): boolean {
    return this.cube.dirty;
  }

  set order(value: number) {
    this.scene.remove(this.cube);
    if (this.cubes[value] == undefined) {
      this.cubes[value] = new Cube(value);
      this.cubes[value].callbacks.push(this.callback);
    }
    this.cube = this.cubes[value];
    this.scene.add(this.cube);
    this.dirty = true;
  }

  get order(): number {
    return this.cube.order;
  }

  callback = (): void => {
    for (const callback of this.callbacks) {
      callback();
    }
  };

  scale = 1;
  perspective = 5;
  resize(): void {
    const min = this.height / Math.min(this.width, this.height) / this.scale / this.perspective;
    const fov = (2 * Math.atan(min) * 180) / Math.PI;

    this.camera.aspect = this.width / this.height;
    this.camera.fov = fov;
    const distance = Cubelet.SIZE * 3 * this.perspective;
    this.camera.position.z = distance;
    this.camera.near = distance - Cubelet.SIZE * 3;
    this.camera.far = distance + Cubelet.SIZE * 8;
    this.camera.lookAt(this.scene.position);
    this.camera.updateProjectionMatrix();
    this.dirty = true;
  }
}
