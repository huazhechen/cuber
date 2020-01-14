import Cuber from "../cuber/cuber";

export default class Option {

  private _storage = window.localStorage;
  private cuber: Cuber;
  constructor(cuber: Cuber) {
    this.cuber = cuber;
    this.load();
  }

  load() {
    this.mirror = Boolean(this._storage.getItem("setting.mirror") || false);
    this.scale = Number(this._storage.getItem("setting.scale") || 1);
    this.perspective = Number(this._storage.getItem("setting.perspective") || 1);
    this.angle = Number(this._storage.getItem("setting.angle") || Math.PI / 16);
    this.gradient = Number(this._storage.getItem("setting.gradient") || Math.PI / 6);
  }

  reset() {
    this.mirror = false;
    this.scale = 1;
    this.perspective = 1;
    this.angle = Math.PI / 16;
    this.gradient = Math.PI / 6;
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
    this.cuber.scale = value;
  }

  private _perspective: number;
  get perspective() {
    return this._perspective;
  }
  set perspective(value) {
    this._perspective = value;
    this._storage.setItem("setting.perspective", String(value));
    this.cuber.perspective = value;
  }

  private _angle: number;
  get angle() {
    return this._angle;
  }
  set angle(value) {
    this._angle = value;
    this._storage.setItem("setting.angle", String(value));
    this.cuber.angle = value;
  }

  private _gradient: number;
  get gradient() {
    return this._gradient;
  }
  set gradient(value) {
    this._gradient = value;
    this._storage.setItem("setting.gradient", String(value));
    this.cuber.gradient = value;
  }
}
