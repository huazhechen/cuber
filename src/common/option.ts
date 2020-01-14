import Cuber from "../cuber/cuber";

export default class Option {
  private _storage = window.localStorage;
  private cuber: Cuber;
  constructor(cuber: Cuber) {
    this.cuber = cuber;
    this.load();
  }

  load() {
    this.mirror = this._storage.getItem("setting.mirror") == "true";
    this.scale = Number(this._storage.getItem("setting.scale") || 80);
    this.perspective = Number(this._storage.getItem("setting.perspective") || 50);
    this.angle = Number(this._storage.getItem("setting.angle") || 20);
    this.gradient = Number(this._storage.getItem("setting.gradient") || 50);
  }

  reset() {
    this.mirror = false;
    this.scale = 80;
    this.perspective = 50;
    this.angle = 20;
    this.gradient = 50;
  }

  private _mirror: boolean;
  get mirror() {
    return this._mirror;
  }
  set mirror(value) {
    this._mirror = value;
    this._storage.setItem("setting.mirror", String(value));
    this.cuber.mirror = value;
  }

  private _scale: number;
  get scale() {
    return this._scale;
  }
  set scale(value) {
    this._scale = value;
    this._storage.setItem("setting.scale", String(value));
    value = 0.8 - value / 100;
    this.cuber.scale = Math.exp(value);
  }

  private _perspective: number;
  get perspective() {
    return this._perspective;
  }
  set perspective(value) {
    this._perspective = value;
    this._storage.setItem("setting.perspective", String(value));

    value = 1 - Math.sqrt(value / 100);
    this.cuber.perspective = value * 2 + 0.4;
  }

  private _angle: number;
  get angle() {
    return this._angle;
  }
  set angle(value) {
    this._angle = value;
    this._storage.setItem("setting.angle", String(value));

    value = value / 100;
    this.cuber.angle = value;
  }

  private _gradient: number;
  get gradient() {
    return this._gradient;
  }
  set gradient(value) {
    this._gradient = value;
    this._storage.setItem("setting.gradient", String(value));

    value = value / 100;
    this.cuber.gradient = 1 - value * 1.2;
  }
}
