import Game from "../cube/game";

export default class Option {
  private _game: Game;
  private _mode: string = "";
  private _keyboard: boolean = false;
  private _size: number = 0;
  private _speed: number = 0;
  private _storage = window.localStorage;
  get mode() {
    return this._mode;
  }

  set mode(value: string) {
    this._mode = value;
    this._storage.setItem("option.mode", value);
    this._game.enable = this.mode == "play" || this.mode == "movie";
  }

  get keyboard() {
    return this._keyboard;
  }

  set keyboard(value: boolean) {
    this._keyboard = value;
    this._storage.setItem("option.keyboard", String(value));
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

  constructor(game: Game) {
    this._game = game;
    this.mode = this._storage.getItem("option.mode") || "play";
    this.keyboard = this._storage.getItem("option.keyboard") == "true";
    this.speed = Number(this._storage.getItem("option.speed") || 0);
    this.size = Number(this._storage.getItem("option.size") || 0);
  }
}
