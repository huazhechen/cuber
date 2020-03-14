import Cuber from "./cuber";

export default class Preferance {
  private _storage = window.localStorage;
  private cuber: Cuber;
  constructor(cuber: Cuber) {
    this.cuber = cuber;
  }

  public mode: string;

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
    this.frames = Number(this._storage.getItem("setting.frames") || 30);
    this.lock = false;
    this.mirror = false;
    this.hollow = false;
    this.mode = "";
  }

  reset = () => {
    this.scale = 50;
    this.perspective = 50;
    this.angle = 25;
    this.gradient = 67;
    this.brightness = 80;
    this.frames = 30;
  };

  private _frames: number;
  get frames() {
    return this._frames;
  }
  set frames(value) {
    this._frames = value;
    this._storage.setItem("setting.frames", String(value));
    this.cuber.cube.duration = value;
  }

  private _scale: number;
  get scale() {
    return this._scale;
  }
  set scale(value) {
    this._scale = value;
    this._storage.setItem("setting.scale", String(value));
    this.cuber.resize();
  }

  private _perspective: number;
  get perspective() {
    return this._perspective;
  }
  set perspective(value) {
    this._perspective = value;
    this._storage.setItem("setting.perspective", String(value));
    this.cuber.resize();
  }

  private _angle: number;
  get angle() {
    return this._angle;
  }
  set angle(value) {
    this._angle = value;
    this._storage.setItem("setting.angle", String(value));
    this.cuber.scene.rotation.y = ((value / 100 - 1) * Math.PI) / 4;
    this.cuber.dirty = true;
  }

  private _gradient: number;
  get gradient() {
    return this._gradient;
  }
  set gradient(value) {
    this._gradient = value;
    this._storage.setItem("setting.gradient", String(value));
    this.cuber.scene.rotation.x = ((1 - value / 100) * Math.PI) / 2;
    this.cuber.dirty = true;
  }

  private _brightness: number;
  get brightness() {
    return this._brightness;
  }
  set brightness(value) {
    this._brightness = value;
    this._storage.setItem("setting.brightness", String(value));
    let light = value / 100;
    this.cuber.ambient.intensity = light;
    let d = light / 2;
    if (d > 1 - light) {
      d = 1 - light;
    }
    this.cuber.directional.intensity = d;
    this.cuber.dirty = true;
  }

  private _mirror: boolean;
  get mirror() {
    return this._mirror;
  }
  set mirror(value) {
    this._mirror = value;
    for (let cubelet of this.cuber.cube.cubelets) {
      cubelet.mirror = value;
    }
    this.cuber.dirty = true;
  }

  private _hollow: boolean;
  get hollow() {
    return this._hollow;
  }
  set hollow(value: boolean) {
    this._hollow = value;
    for (let cubelet of this.cuber.cube.cubelets) {
      cubelet.hollow = value;
    }
    this.cuber.dirty = true;
  }

  get lock() {
    return this.cuber.controller.lock;
  }
  set lock(value) {
    this.cuber.controller.lock = value;
  }
}
