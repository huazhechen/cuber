import Cuber from "../../cuber/cuber";
import { Component } from "./component";
import { TouchAction } from "../../common/toucher";
import Cubelet from "../../cuber/cubelet";

export default class Wecuber extends Cuber implements Component {
  x: number;
  y: number;
  display: boolean = true;
  disable: boolean = false;
  constructor(x: number, y: number, width: number, height: number) {
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.loop();
  }
  touch(action: TouchAction) {
    return this.controller.touch(action);
  }

  loop() {
    requestAnimationFrame(this.loop.bind(this));
    let tick = new Date().getTime();
    tick = (tick / 1600) * Math.PI;
    tick = Math.sin(tick) / 32;
    this.cube.position.y = tick * Cubelet.SIZE;
    this.cube.rotation.y = (tick / 10) * Math.PI;
    this.cube.updateMatrix();
    this.dirty = true;
  }
}
