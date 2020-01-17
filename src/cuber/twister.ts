import Cube from "./cube";
import { tweener } from "./tweener";
import { DURATION } from "../common/define";

export default class Twister {
  cube: Cube;
  queue: TwistAction[];
  constructor(cube: Cube) {
    this.cube = cube;
    this.queue = [];
  }

  static shuffle() {
    let result = "";
    let exps = ["x2"];
    let last = -1;
    let actions = ["U", "D", "R", "L", "F", "B"];
    let axis = -1;
    for (let i = 0; i < 24; i++) {
      let exp = [];
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

  get length() {
    return this.queue.length;
  }

  finish() {
    for (const action of this.queue) {
      action.fast = true;
    }
    tweener.finish();
  }

  twist(exp: string, reverse = false, times = 1, fast = false) {
    if (this.queue.length > 0) {
      tweener.finish();
      this.update();
    }
    tweener.speedup();
    let node = new TwistNode(exp, reverse, times);
    let list = node.parse();
    for (let element of list) {
      element.fast = fast;
      this.queue.push(element);
    }
    this.update();
  }

  update() {
    if (this.queue.length === 0 || this.cube.lock) {
      return false;
    }
    let twist = this.queue.shift();
    if (undefined == twist) {
      return false;
    }
    this.start(twist);
  }

  start(action: TwistAction) {
    if (action.exp == "-") {
      if (action.fast) {
        this.update();
        return;
      }
      tweener.tween(0, 1, DURATION * action.times, (value: number) => {
        if (value === 1 || value === 0) {
          this.update();
          return;
        }
      });
      return;
    }
    if (action.exp == "#") {
      this.cube.history.clear();
      this.cube.reset();
      this.cube.dirty = true;
      this.update();
      return;
    }
    if (action.exp == "*") {
      let exp = Twister.shuffle();
      this.twist(exp, false, 1, true);
      this.cube.history.clear();
      return;
    }
    let angle = -Math.PI / 2;
    if (action.reverse) {
      angle = -angle;
    }
    if (action.times) {
      angle = angle * action.times;
    }
    let part = this.cube.groups[action.exp];
    if (part === undefined) {
      this.update();
      return;
    }
    part.angle = 0;
    part.hold();

    if (action.fast) {
      part.angle = angle;
    }
    part.twist(angle, this.update.bind(this));
    return;
  }
}

export class TwistAction {
  exp: string;
  reverse: boolean;
  times: number;
  fast: boolean;
  constructor(exp: string, reverse: boolean = false, times: number = 1, fast: boolean = false) {
    this.exp = exp;
    this.reverse = reverse;
    this.times = times;
    this.fast = fast;
  }

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
  static _ACTIONS = "*#-xyzbsfdeulmrXYZBFSDEULMR";
  static _SUFFIX = "'0123456789";
  children: TwistNode[];
  twist: TwistAction;
  constructor(exp: string, reverse = false, times = 1) {
    // 合法性校验
    this.children = [];
    exp = exp.replace(/[^\*#\-xyzbsfdeulmr\(\)'0123456789]/gi, "");
    this.twist = new TwistAction(exp, reverse, times);
    // 不用解析场景
    if (exp.length == 1) {
      if (/[XYZ]/.test(this.twist.exp)) {
        this.twist.exp = this.twist.exp.toLowerCase();
      }
      if (/[mes]/.test(this.twist.exp)) {
        this.twist.exp = this.twist.exp.toUpperCase();
      }
      return;
    }
    // 先分段
    let list = [];
    let buffer = "";
    let stack = 0;
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
      this.children.push(new TwistNode(values[1], reverse, times));
    }
  }

  parse(reverse = false) {
    reverse = this.twist.reverse !== reverse;
    let _result: TwistAction[] = [];
    if (0 !== this.children.length) {
      for (var i = 0; i < this.twist.times; i++) {
        for (var j = 0; j < this.children.length; j++) {
          var n;
          if (reverse) {
            n = this.children[this.children.length - j - 1];
          } else {
            n = this.children[j];
          }
          var list = n.parse(reverse);
          for (let element of list) {
            _result.push(element);
          }
        }
      }
    } else if (this.twist.exp != "") {
      let action = new TwistAction(this.twist.exp, reverse, this.twist.times);
      _result.push(action);
    }
    return _result;
  }

  get value() {
    return this.twist.value;
  }
}
