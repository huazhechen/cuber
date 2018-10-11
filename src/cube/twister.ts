import CubeletGroup from "./group";
import Game from "./game";
import Holder from "./holder";

export default class Twister {
  public queue: TwistAction[] = [];
  private _game: Game;

  constructor(game: Game) {
    this._game = game;
  }

  get length() {
    return this.queue.length;
  }

  get buffer() {
    let buffer: string[] = [];
    for (let action of this.queue) {
      buffer.push(action.format);
    }
    return buffer.join(" ");
  }

  clear() {
    for (const queue of this.queue) {
      queue.fast = true;
    }
    this.update();
    this._game.tweener.clear();
  }

  twist(
    exp: string,
    reverse: boolean = false,
    times: number = 1,
    callback: Function | null = null,
    fast: boolean = false
  ) {
    let list = new TwistNode(exp, reverse, times).parse();
    list[list.length - 1].callback = callback;
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

  random() {
    let result = "";
    let exps: string[] = [];
    let last = -1;
    let actions = ["U", "D", "R", "L", "F", "B"];
    let axis = -1;
    for (let i = 0; i < 20; i++) {
      let exp: string[] = [];
      while (axis == last) {
        axis = Math.floor(Math.random() * 3);
      }
      let side = Math.floor(Math.random() * 2);
      exp.push(actions[axis * 2 + side]);
      let suffix = Math.random();
      if (suffix < 0.2) {
        exp.push("2");
      } else if (suffix < 0.6) {
        exp.push("'");
      }
      exps.push(exp.join(""));
      last = axis;
    }
    result = exps.join(" ");
    return result;
  }

  start(action: TwistAction) {
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
      let exp = this.random();
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
      for (let callback of this._game.callbacks) {
        callback(action.format);
      }
      let duration =
        this._game.duration * Math.min(1, Math.abs(angle) / Math.PI);
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

  match(holder: Holder): CubeletGroup[] {
    let g: CubeletGroup;
    let result: CubeletGroup[] = [];

    var index = holder.index;
    if (holder.index === -1) {
      g = CubeletGroup.GROUPS.x;
      if (g.axis.dot(holder.plane.normal) === 0) {
        result.push(g);
      }
      g = CubeletGroup.GROUPS.y;
      if (g.axis.dot(holder.plane.normal) === 0) {
        result.push(g);
      }
      g = CubeletGroup.GROUPS.z;
      if (g.axis.dot(holder.plane.normal) === 0) {
        result.push(g);
      }
      return result;
    }
    var x = (index % 3) - 1;
    var y = Math.floor((index % 9) / 3) - 1;
    var z = Math.floor(index / 9) - 1;
    switch (x) {
      case -1:
        g = CubeletGroup.GROUPS.L;
        if (g.axis.dot(holder.plane.normal) === 0) {
          result.push(g);
        }
        break;
      case 0:
        g = CubeletGroup.GROUPS.M;
        if (g.axis.dot(holder.plane.normal) === 0) {
          result.push(g);
        }
        break;
      case 1:
        g = CubeletGroup.GROUPS.R;
        if (g.axis.dot(holder.plane.normal) === 0) {
          result.push(g);
        }
        break;
      default:
        break;
    }
    switch (y) {
      case -1:
        g = CubeletGroup.GROUPS.D;
        if (g.axis.dot(holder.plane.normal) === 0) {
          result.push(g);
        }
        break;
      case 0:
        g = CubeletGroup.GROUPS.E;
        if (g.axis.dot(holder.plane.normal) === 0) {
          result.push(g);
        }
        break;
      case 1:
        g = CubeletGroup.GROUPS.U;
        if (g.axis.dot(holder.plane.normal) === 0) {
          result.push(g);
        }
        break;
      default:
        break;
    }
    switch (z) {
      case -1:
        g = CubeletGroup.GROUPS.B;
        if (g.axis.dot(holder.plane.normal) === 0) {
          result.push(g);
        }
        break;
      case 0:
        g = CubeletGroup.GROUPS.S;
        if (g.axis.dot(holder.plane.normal) === 0) {
          result.push(g);
        }
        break;
      case 1:
        g = CubeletGroup.GROUPS.F;
        if (g.axis.dot(holder.plane.normal) === 0) {
          result.push(g);
        }
        break;
      default:
        break;
    }
    return result;
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
      .replace(/[^\*#xyzbsfdeulmr\(\)'0123456789]/gi, "")
      .match(
        /\([\*#xyzbsfdeulmr'\d]+\)('\d*|\d*'|\d*)|[\*#xyzbsfdeulmr]('\d*|\d*'|\d*)/gi
      );
    if (null === list) {
      return;
    }
    if (list.length == 1) {
      var values = list[0].match(/^\((\S+)\)('?)(\d*)('?)$/i);
      if (values === null) {
        values = list[0].match(/([\*#xyzbsfdeulmr])('?)(\d*)('?)/i);
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
    } else {
      let action = new TwistAction();
      action.exp = this._twist.exp;
      action.reverse = reverse;
      action.times = this._twist.times;
      _result.push(action);
    }
    return _result;
  }
}
