import cuber from ".";

export default class Preferance {
  private _storage = window.localStorage;
  constructor() {}

  public mode: string;

  load() {
    let version = "0.0.3";
    if (this._storage.getItem("version") != version) {
      this._storage.clear();
      this._storage.setItem("version", version);
    }
    this.order = Number(this._storage.getItem("setting.order") || 3);
    this.scale = Number(this._storage.getItem("setting.scale") || 50);
    this.perspective = Number(this._storage.getItem("setting.perspective") || 50);
    this.angle = Number(this._storage.getItem("setting.angle") || 63);
    this.gradient = Number(this._storage.getItem("setting.gradient") || 67);
    this.brightness = Number(this._storage.getItem("setting.brightness") || 80);
    this.frames = Number(this._storage.getItem("setting.frames") || 30);
    this.mirror = false;
    this.hollow = false;
    this.mode = "";
  }

  private _order: number;
  get order() {
    return this._order;
  }
  set order(value) {
    this._storage.setItem("setting.order", String(value));
    cuber.world.order = value;
    if (this._order != value) {
      this._order = value;
      this.load();
    }
  }

  private _scale: number;
  get scale() {
    return this._scale;
  }
  set scale(value) {
    this._scale = value;
    this._storage.setItem("setting.scale", String(value));
    cuber.world.resize();
  }

  private _perspective: number;
  get perspective() {
    return this._perspective;
  }
  set perspective(value) {
    this._perspective = value;
    this._storage.setItem("setting.perspective", String(value));
    cuber.world.resize();
  }

  private _angle: number;
  get angle() {
    return this._angle;
  }
  set angle(value) {
    this._angle = value;
    this._storage.setItem("setting.angle", String(value));
    cuber.world.scene.rotation.y = ((value / 100 - 1) * Math.PI) / 2;
    cuber.world.dirty = true;
  }

  private _gradient: number;
  get gradient() {
    return this._gradient;
  }
  set gradient(value) {
    this._gradient = value;
    this._storage.setItem("setting.gradient", String(value));
    cuber.world.scene.rotation.x = ((1 - value / 100) * Math.PI) / 2;
    cuber.world.dirty = true;
  }

  private _brightness: number;
  get brightness() {
    return this._brightness;
  }
  set brightness(value) {
    this._brightness = value;
    this._storage.setItem("setting.brightness", String(value));
    let light = value / 100;
    cuber.world.ambient.intensity = light;
    let d = light / 2;
    if (d > 1 - light) {
      d = 1 - light;
    }
    cuber.world.directional.intensity = d;
    cuber.world.dirty = true;
  }

  private _frames: number;
  get frames() {
    return this._frames;
  }
  set frames(value) {
    this._frames = value;
    this._storage.setItem("setting.frames", String(value));
  }

  private _mirror: boolean;
  get mirror() {
    return this._mirror;
  }
  set mirror(value) {
    this._mirror = value;
    for (let cubelet of cuber.world.cube.cubelets) {
      cubelet.mirror = value;
    }
    cuber.world.dirty = true;
  }

  private _hollow: boolean;
  get hollow() {
    return this._hollow;
  }
  set hollow(value: boolean) {
    this._hollow = value;
    for (let cubelet of cuber.world.cube.cubelets) {
      cubelet.hollow = value;
    }
    cuber.world.dirty = true;
  }
}
