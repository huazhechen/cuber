import { Camera, Scene } from "three";

export interface Component {
  x: number;
  y: number;
  width: number;
  height: number;
  dirty: boolean;
  display: boolean;
  disable: boolean;
  camera: Camera;
  scene: Scene;
  touch: Function;
  resize: Function;
}
