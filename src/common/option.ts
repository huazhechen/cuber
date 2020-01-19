import Cuber from "../cuber/cuber";

export default class Option {
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
    this.lock = false;
    this.mirror = false;
  }

  reset() {
    this.scale = 50;
    this.perspective = 50;
    this.angle = 25;
    this.gradient = 67;
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
    this.cuber.perspective = Math.exp((1 - value / 50) / 1.2);
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

  get mirror() {
    return this.cuber.mirror;
  }
  set mirror(value) {
    this.cuber.mirror = value;
  }

  get lock() {
    return this.cuber.controller.lock;
  }
  set lock(value) {
    this.cuber.controller.lock = value;
  }

  page: string = "cuber";
}
