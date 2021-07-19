import Cube from "../../cuber/cube";
import Cubelet from "../../cuber/cubelet";
import * as THREE from "three";
import { TwistNode } from "../../cuber/twister";

export default class Capture {
  public canvas: HTMLCanvasElement;
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  private cubes: Cube[] = [];
  private cube: Cube;

  constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
    this.renderer.setClearColor(0, 0);
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(256, 256, true);

    this.scene = new THREE.Scene();
    this.scene.rotation.x = Math.PI / 6;
    this.scene.rotation.y = Math.PI / 16 - Math.PI / 4;

    this.camera = new THREE.PerspectiveCamera(50, 1, 1, Cubelet.SIZE * 32);
    const fov = (2 * Math.atan(1 / 4) * 180) / Math.PI;
    this.camera.aspect = 1;
    this.camera.fov = fov;
    this.camera.position.z = Cubelet.SIZE * 3 * 4;
    this.camera.lookAt(this.scene.position);
    this.camera.updateProjectionMatrix();

    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambient);
    const directional = new THREE.DirectionalLight(0xffffff, 0.2);
    directional.position.set(Cubelet.SIZE, Cubelet.SIZE * 4, Cubelet.SIZE * 2);
    this.scene.add(directional);
  }

  set order(value: number) {
    this.scene.remove(this.cube);
    if (this.cubes[value] == undefined) {
      this.cubes[value] = new Cube(value);
      for (const cubelet of this.cubes[value].cubelets) {
        cubelet.mirror = false;
      }
    }
    this.cube = this.cubes[value];
    this.scene.add(this.cube);
  }

  get order(): number {
    return this.cube.order;
  }

  snap(strip: { [face: string]: number[] | undefined }, exp: string, order: number): string {
    this.order = order;
    this.cube.strip(strip);
    this.cube.reset();

    this.twist(exp);

    this.camera.aspect = 1;
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
    const content = this.renderer.domElement.toDataURL("image/png");
    return content;
  }

  twist(exp: string): void {
    const actions = new TwistNode(exp).parse();
    for (const action of actions) {
      let angle = -Math.PI / 2;
      if (action.reverse) {
        angle = -angle;
      }
      if (action.times) {
        angle = angle * action.times;
      }
      const list = this.cube.table.convert(action);
      for (const rotate of list) {
        rotate.group.twist((Math.PI / 2) * rotate.twist, true);
      }
    }
  }
}
