import Cuber from "../cuber/cuber";
import { TouchAction } from "./define";

export default class Context {
  private _storage = window.localStorage;
  private cuber: Cuber;
  constructor(cuber: Cuber) {
    this.cuber = cuber;
    this.load();
  }

  load() {
    let version = "0.0.1";
    if (this._storage.getItem("version") != version) {
      this._storage.clear();
      this._storage.setItem("version", version);
    }
    this.scale = Number(this._storage.getItem("setting.scale") || 50);
    this.perspective = Number(this._storage.getItem("setting.perspective") || 50);
    this.angle = Number(this._storage.getItem("setting.angle") || 25);
    this.gradient = Number(this._storage.getItem("setting.gradient") || 67);
    this.brightness = Number(this._storage.getItem("setting.brightness") || 80);
    this.lock = false;
    this.mirror = false;
    this.hollow = false;
  }

  reset() {
    this.scale = 50;
    this.perspective = 50;
    this.angle = 25;
    this.gradient = 67;
    this.brightness = 80;
  }

  private _scale: number;
  get scale() {
    return this._scale;
  }
  set scale(value) {
    this._scale = value;
    this._storage.setItem("setting.scale", String(value));
    this.cuber.scale = value / 100 + 0.5;
  }

  private _perspective: number;
  get perspective() {
    return this._perspective;
  }
  set perspective(value) {
    this._perspective = value;
    this._storage.setItem("setting.perspective", String(value));
    this.cuber.perspective = (100.1 / (value + 0.01)) * 4 - 3;
  }

  private _angle: number;
  get angle() {
    return this._angle;
  }
  set angle(value) {
    this._angle = value;
    this._storage.setItem("setting.angle", String(value));
    this.cuber.angle = ((value / 100 - 1) * Math.PI) / 4;
  }

  private _gradient: number;
  get gradient() {
    return this._gradient;
  }
  set gradient(value) {
    this._gradient = value;
    this._storage.setItem("setting.gradient", String(value));
    this.cuber.gradient = ((1 - value / 100) * Math.PI) / 2;
  }

  private _brightness: number;
  get brightness() {
    return this._brightness;
  }
  set brightness(value) {
    this._brightness = value;
    this._storage.setItem("setting.brightness", String(value));
    this.cuber.brightness = value / 100;
    this.cuber.intensity = 1 - value / 100;
  }

  get mirror() {
    return this.cuber.mirror;
  }
  set mirror(value) {
    this.cuber.mirror = value;
  }

  get hollow() {
    return this.cuber.hollow;
  }
  set hollow(value) {
    this.cuber.hollow = value;
  }

  get lock() {
    return this.cuber.controller.lock;
  }
  set lock(value) {
    this.cuber.controller.lock = value;
  }

  control(canvas: HTMLCanvasElement, callback: Function) {
    this.canvas = canvas;
    this.callback = callback;
    canvas.addEventListener("touchstart", this.touch);
    canvas.addEventListener("touchmove", this.touch);
    canvas.addEventListener("touchend", this.touch);
    canvas.addEventListener("touchcancel", this.touch);

    canvas.addEventListener("mousedown", this.mouse);
    canvas.addEventListener("mousemove", this.mouse);
    canvas.addEventListener("mouseup", this.mouse);
    canvas.addEventListener("mouseout", this.mouse);
  }
  canvas: HTMLCanvasElement;
  callback: Function;
  mouse = (event: MouseEvent) => {
    this.canvas.tabIndex = 1;
    this.canvas.focus();
    let action = new TouchAction(event.type, event.clientX, event.clientY);
    this.callback(action);
    event.returnValue = false;
    return false;
  };

  touch = (event: TouchEvent) => {
    this.canvas.tabIndex = 1;
    this.canvas.focus();
    let touches = event.changedTouches;
    let first = touches[0];
    let action = new TouchAction(event.type, first.clientX, first.clientY);
    this.callback(action);
    event.preventDefault();
    return true;
  };
}
