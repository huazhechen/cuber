import Game from "../cube/game";

export default class Option {
  private _game: Game;
  private _mode: string = "";
  private _keyboard: boolean = false;
  private _angle: number = 1;
  private _size: number = 0;
  private _speed: number = 0;
  private _storage = window.localStorage;

  get mode() {
    return this._mode;
  }

  set mode(value: string) {
    this._mode = value;
    this._storage.setItem("option.mode", this._mode);
  }

  get keyboard() {
    return this._keyboard;
  }

  set keyboard(value: boolean) {
    this._keyboard = value;
    this._storage.setItem("option.keyboard", String(this._keyboard));
  }

  get angle() {
    return this._angle;
  }

  set angle(value: number) {
    this._angle = value;
    this._storage.setItem("option.angle", String(this._angle));
    this._game.scene.rotation.y = -Math.PI / 4 + (this._angle * Math.PI) / 16;
    this._game.dirty = true;
  }

  get size() {
    return this._size;
  }

  set size(value: number) {
    this._size = value;
    this._storage.setItem("option.size", String(this._size));
    this._game.scale = Math.pow(2, -this.size / 8);
    this._game.resize();
  }

  get speed() {
    return this._speed;
  }

  set speed(value: number) {
    this._speed = value;
    this._storage.setItem("option.speed", String(this._speed));
    this._game.duration = 50 - 10 * this.speed;
  }

  constructor(game: Game) {
    this._game = game;
    this.mode = this._storage.getItem("option.mode") || "play";
    this.keyboard = this._storage.getItem("option.keyboard") == "true";
    this.speed = Number(this._storage.getItem("option.speed") || 0);
    this.angle = Number(this._storage.getItem("option.angle") || 1);
    this.size = Number(this._storage.getItem("option.size") || 2);
  }
}