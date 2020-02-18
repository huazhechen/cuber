import Cuber from "../../cuber/cuber";
import { Component } from "./component";

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
}
