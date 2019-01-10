import Game from "../cube/game";

export default class Option {
  private _game: Game;
  private _mode: string = "";
  private _size: number = 0;
  private _speed: number = 0;
  private _pose: number = 1;
  private _mirror: boolean = false;
  private _storage = window.localStorage;
  get mode() {
    return this._mode;
  }

  set mode(value: string) {
    this._mode = value;
    this._storage.setItem("option.mode", value);
    this._game.enable = this.mode == "play" || this.mode == "movie";
  }

  get size() {
    return this._size;
  }

  set size(value: number) {
    if (value < -4) {
      value = -4;
    }
    if (value > 4) {
      value = 4;
    }
    this._size = value;
    this._storage.setItem("option.size", String(value));
    this._game.scale = Math.pow(2, -this.size / 8);
    this._game.resize();
  }

  get speed() {
    return this._speed;
  }

  set speed(value: number) {
    if (value < -4) {
      value = -4;
    }
    if (value > 4) {
      value = 4;
    }
    this._speed = value;
    this._storage.setItem("option.speed", String(value));
    this._game.duration = 50 - 10 * this.speed;
  }

  get pose() {
    return this._pose;
  }

  set pose(value: number) {
    if (this._pose < -2) {
      this._pose = -2;
    }
    if (this._pose > 2) {
      this._pose = 2;
    }
    this._pose = value;
    this._storage.setItem("option.pose", String(value));
    this._game.scene.rotation.y = -Math.PI / 4 + (this._pose * Math.PI) / 16;
    this._game.dirty = true;
  }

  get mirror() {
    return this._mirror;
  }

  set mirror(value: boolean) {
    this._mirror = value;
    for (let cubelet of this._game.cube.cubelets) {
      cubelet.mirror = value;
    }
    this._game.dirty = true;
  }

  constructor(game: Game) {
    this._game = game;
    this.mode = this._storage.getItem("option.mode") || "play";
    this.speed = Number(this._storage.getItem("option.speed") || 0);
    this.size = Number(this._storage.getItem("option.size") || 0);
    this.pose = Number(this._storage.getItem("option.pose") || 1);
    this.mirror = Boolean(this._storage.getItem("option.mirror") || false);
  }
}
