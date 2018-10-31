import CubeletGroup from "./group";
import Game from "./game";

export default class Twister {
  public queue: TwistAction[] = [];
  private _game: Game;

  constructor(game: Game) {
    this._game = game;
  }

  get length() {
    return this.queue.length;
  }

  finish() {
    for (const action of this.queue) {
      action.fast = true;
    }
    this._game.tweener.finish();
    this.update();
  }

  twist(exp: string, reverse: boolean = false, times: number = 1, callback: Function | null = null, fast: boolean = false) {
    this.finish();
    let list = new TwistNode(exp, reverse, times).parse();
    if (list.length > 0) {
      list[list.length - 1].callback = callback;
    }
    for (let element of list) {
      element.fast = fast;
      this.queue.push(element);
    }
    this.update();
  }

  update(): boolean {
    if (this.queue.length === 0 || this._game.lock) {
      return false;
    }
    let twist = this.queue.shift();
    if (undefined == twist) {
      return false;
    }
    this.start(twist);
    return true;
  }

  start(action: TwistAction) {
    if (action.exp == "-") {
      this._game.tweener.tween(
        0,
        1,
        this._game.duration / 2,
        (value: number) => { },
        () => {
          if (action.callback) {
            action.callback();
          }
          this.update();
          return;
        }
      );
      return;
    }
    if (action.exp == "#") {
      this._game.cube.reset();
      this._game.dirty = true;
      if (action.callback) {
        action.callback();
      }
      this.update();
      return;
    }
    if (action.exp == "*") {
      this._game.cube.reset();
      this._game.dirty = true;
      let exp = this._game.random();
      let list = new TwistNode(exp).parse();
      list[list.length - 1].callback = action.callback;
      for (let element of list) {
        element.fast = true;
        this.queue.unshift(element);
      }
      this.update();
      return;
    }
    let angle = -Math.PI / 2;
    if (action.reverse) {
      angle = -angle;
    }
    if (action.times) {
      angle = angle * action.times;
    }
    let part = CubeletGroup.GROUPS[action.exp];
    if (part === undefined) {
      this.update();
      return;
    }
    part.hold(this._game);

    if (action.fast) {
      part.angle = angle;
      part.adjust(this._game);
      if (action.callback) {
        action.callback();
      }
      this.update();
      return;
    } else {
      let duration = this._game.duration * Math.min(1, Math.abs(angle) / Math.PI);
      this._game.tweener.tween(
        part.angle,
        part.angle + angle,
        duration,
        (value: number) => {
          part.angle = value;
          this._game.dirty = true;
        },
        () => {
          part.adjust(this._game);
          if (action.callback) {
            action.callback();
          }
          this.update();
          return;
        }
      );
    }
  }
}

export class TwistAction {
  public exp: string = "";
  public reverse: boolean = false;
  public times: number = 1;
  public fast: boolean = false;
  public callback: Function | null = null;

  get format() {
    if (this.fast) {
      return "";
    }
    return this.times == 0
      ? ""
      : (this.exp.length > 1 ? "(" : "") +
      this.exp +
      (this.exp.length > 1 ? ")" : "") +
      (this.reverse ? "'" : "") +
      (this.times == 1 ? "" : String(this.times));
  }
}

export class TwistNode {
  private _children: TwistNode[] = [];
  private _twist: TwistAction = new TwistAction();
  constructor(exp: string, reverse: boolean = false, times: number = 1) {
    let list = exp
      .replace(/[^\*#-xyzbsfdeulmr\(\)'0123456789]/gi, "")
      .match(/\([\*#-xyzbsfdeulmr'\d]+\)('\d*|\d*'|\d*)|[\*#-xyzbsfdeulmr]('\d*|\d*'|\d*)/gi);
    if (null === list) {
      return;
    }
    if (list.length == 1) {
      var values = list[0].match(/^\((\S+)\)('?)(\d*)('?)$/i);
      if (values === null) {
        values = list[0].match(/([\*#-xyzbsfdeulmr])('?)(\d*)('?)/i);
        if (null === values) {
          return;
        }
        this._twist.exp = values[1];
        if (/[XYZ]/.test(this._twist.exp)) {
          this._twist.exp = this._twist.exp.toLowerCase();
        }
        if (/[mes]/.test(this._twist.exp)) {
          this._twist.exp = this._twist.exp.toUpperCase();
        }
      } else {
        this._children.push(new TwistNode(values[1]));
      }
      this._twist.reverse = (values[2] + values[4]).length == 0 ? false : true;
      this._twist.times = values[3].length == 0 ? 1 : parseInt(values[3]);
      this._twist.reverse = this._twist.reverse !== reverse;
      this._twist.times = this._twist.times * times;
    } else {
      this._twist.exp = exp;
      this._twist.reverse = reverse;
      this._twist.times = times;
      for (let element of list) {
        var node = new TwistNode(element);
        this._children.push(node);
      }
    }
  }
  parse(reverse: boolean = false): TwistAction[] {
    reverse = this._twist.reverse !== reverse;
    let _result: TwistAction[] = [];
    if (0 !== this._children.length) {
      for (var i = 0; i < this._twist.times; i++) {
        for (var j = 0; j < this._children.length; j++) {
          var n;
          if (reverse) {
            n = this._children[this._children.length - j - 1];
          } else {
            n = this._children[j];
          }
          var list = n.parse(reverse);
          for (let element of list) {
            _result.push(element);
          }
        }
      }
    } else if (this._twist.exp != "") {
      let action = new TwistAction();
      action.exp = this._twist.exp;
      action.reverse = reverse;
      action.times = this._twist.times;
      _result.push(action);
    }
    return _result;
  }
}
