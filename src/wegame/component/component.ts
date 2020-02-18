export interface Component {
  x: number;
  y: number;
  width: number;
  height: number;
  dirty: boolean;
  display: boolean;
  disable: boolean;
  camera: THREE.Camera;
  scene: THREE.Scene;
  touch: Function;
  resize: Function;
}
