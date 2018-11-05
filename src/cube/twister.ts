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

  twist(exp: string, reverse: boolean = false, times: number = 1, callback: Function | null = null, fast: boolean = false, history: boolean = true) {
    this.finish();
    let node = new TwistNode(exp, reverse, times);
    if (history) {
      this._game.history.push(node.value);
    }
    let list = node.parse();
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
      if (action.fast) {
        this.update();
        return;
      }
      this._game.tweener.tween(
        0,
        1,
        (this._game.duration * action.times) / 2,
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
      this._game.history = [];
      this._game.cube.reset();
      this._game.dirty = true;
      if (action.callback) {
        action.callback();
      }
      this.update();
      return;
    }
    if (action.exp == "*") {
      this._game.history = [];
      let exp = this._game.random();
      this.twist(exp, false, 1, action.callback, true, false);
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

  get value() {
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
  private static readonly _ACTIONS = "*#-xyzbsfdeulmrXYZBFSDEULMR";
  private static readonly _SUFFIX = "'0123456789";
  constructor(exp: string, reverse: boolean = false, times: number = 1) {
    // 合法性校验
    exp = exp.replace(/[^\*#\-xyzbsfdeulmr\(\)'0123456789]/gi, "");
    this._twist.exp = exp;
    this._twist.reverse = reverse;
    this._twist.times = times;
    // 不用解析场景
    if (exp.length == 1) {
      if (/[XYZ]/.test(this._twist.exp)) {
        this._twist.exp = this._twist.exp.toLowerCase();
      }
      if (/[mes]/.test(this._twist.exp)) {
        this._twist.exp = this._twist.exp.toUpperCase();
      }
      return;
    }
    // 先分段
    let list: string[] = [];
    let buffer: string = "";
    let stack: number = 0;
    for (let i = 0; i < exp.length; i++) {
      let c = exp.charAt(i);
      // 起始字符
      if (buffer.length == 0) {
        if (TwistNode._ACTIONS.indexOf(c) >= 0) {
          buffer = buffer.concat(c);
          continue;
        } else if (c === "(") {
          buffer = buffer.concat(c);
          stack++;
          continue;
        } else {
          return;
        }
      }
      // 后续字符
      else {
        // 非括号场景
        if (stack == 0) {
          // 后缀追加到buff中
          if (TwistNode._SUFFIX.indexOf(c) >= 0) {
            buffer = buffer.concat(c);
            continue;
          }
          // 处理完一组
          else {
            list.push(buffer);
            buffer = "";
            i--;
          }
        } else {
          if (c === "(") {
            stack++;
          } else if (c === ")") {
            stack--;
          }
          buffer = buffer.concat(c);
          continue;
        }
      }
    }
    if (buffer.length > 0) {
      list.push(buffer);
    }
    if (list.length == 0) {
      return;
    }
    for (let item of list) {
      // 拆解括号
      var values = item.match(/^\((\S+)\)('?)(\d*)('?)$/i);
      // 无括号
      if (null === values) {
        values = item.match(/([\*#\-xyzbsfdeulmr])('?)(\d*)('?)/i);
      }
      // 异常情况
      if (null === values) {
        return;
      }
      let reverse = (values[2] + values[4]).length == 1;
      let times = values[3].length == 0 ? 1 : parseInt(values[3]);
      this._children.push(new TwistNode(values[1], reverse, times));
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

  get value() {
    return this._twist.value;
  }
}
