import Cuber from "../../cuber/cuber";
import { Component } from "./component";
import { TouchAction } from "../../common/toucher";

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
  }
  touch(action: TouchAction) {
    this.controller.touch(action);
  }
}
