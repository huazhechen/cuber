import Cube from "./cube";
import Cubelet from "./cubelet";
import { WebGLRenderer, Scene, PerspectiveCamera, AmbientLight, DirectionalLight } from "three";

export default class Capture {
  public canvas: HTMLCanvasElement;
  public renderer: WebGLRenderer;
  public scene: Scene;
  public camera: PerspectiveCamera;
  public cube: Cube;

  constructor() {
    this.cube = new Cube();
    for (let cubelet of this.cube.cubelets) {
      cubelet.mirror = false;
    }
    this.renderer = new WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
    this.renderer.setClearColor(0, 0);
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(512, 512, true);

    this.scene = new Scene();
    this.scene.rotation.x = Math.PI / 6;
    this.scene.rotation.y = Math.PI / 16 - Math.PI / 4;
    this.scene.add(this.cube);

    this.camera = new PerspectiveCamera(50, 1, 1, Cubelet.SIZE * 32);
    let fov = (2 * Math.atan(1 / 4) * 180) / Math.PI;
    this.camera.aspect = 1;
    this.camera.fov = fov;
    this.camera.position.z = Cubelet.SIZE * 3 * 4;
    this.camera.lookAt(this.scene.position);
    this.camera.updateProjectionMatrix();

    let ambient = new AmbientLight(0xffffff, 0.8);
    this.scene.add(ambient);
    let directional = new DirectionalLight(0xffffff, 0.2);
    directional.position.set(Cubelet.SIZE, Cubelet.SIZE * 4, Cubelet.SIZE * 2);
    this.scene.add(directional);
  }

  snap(strip: { [face: string]: number[] | undefined }, exp: string) {
    this.cube.strip(strip);
    this.cube.reset();
    this.cube.twister.twist(exp, true, 1, true);

    this.camera.aspect = 1;
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
    let content = this.renderer.domElement.toDataURL("image/png");
    return content;
  }
}
