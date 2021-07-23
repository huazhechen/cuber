import Cube from "./cube";
import tweener from "./tweener";
import CubeGroup from "./group";

export class TwistAction {
  sign: string;
  reverse: boolean;
  times: number;
  constructor(exp: string, reverse = false, times = 1) {
    const values = exp.match(/([\*\#~;.#xyz]|[0123456789-]*[bsfdeulmr][w]*)('?)(\d*)('?)/i);
    if (values) {
      exp = values[1];
      reverse = reverse !== ((values[2] + values[4]).length == 1);
      times = times * (values[3].length == 0 ? 1 : parseInt(values[3]));
    }
    if (/[XYZ]/.test(exp)) {
      exp = exp.toLowerCase();
    }
    if (/[Ww]/.test(exp)) {
      exp = exp.toUpperCase();
      exp = exp.replace("W", "w");
    }
    this.sign = exp;
    this.reverse = reverse;
    this.times = times;
  }

  get value(): string {
    if (this.times == 0) {
      return "";
    }
    return this.sign + (this.times == 1 ? "" : String(this.times)) + (this.reverse ? "'" : "");
  }
}

export class TwistNode {
  static AFFIX = "'Ww0123456789-";
  children: TwistNode[];
  twist: TwistAction;
  static SPLIT_SEGMENT(exp: string): string[] {
    const list = [];
    let buffer = "";
    let stack = 0;
    let ready = false;
    let note = false;
    for (let i = 0; i < exp.length; i++) {
      const c = exp.charAt(i);
      if (c === " " && buffer.length == 0) {
        continue;
      }
      if (c === "/" && exp.charAt(i + 1) === "/") {
        i++;
        note = true;
        continue;
      }
      if (c === "\n") {
        note = false;
        continue;
      }
      if (note) {
        continue;
      }
      // 后缀可以持续增加
      if (TwistNode.AFFIX.indexOf(c) >= 0) {
        buffer = buffer.concat(c);
        continue;
      }
      // 非后缀检查是否可以中断
      if (buffer.length > 0 && stack == 0 && ready) {
        list.push(buffer);
        buffer = "";
        i--;
        ready = false;
        continue;
      }
      //  如果有括号 记录stack
      if (c === "(" || c === "[") {
        buffer = buffer.concat(c);
        stack++;
        continue;
      }
      if (c === ")" || c === "]") {
        buffer = buffer.concat(c);
        stack--;
        continue;
      }
      ready = true;
      buffer = buffer.concat(c);
    }
    if (buffer.length > 0) {
      list.push(buffer);
    }
    return list;
  }

  static SPLIT_BRACKET(exp: string): string[] {
    const list = [];
    let buffer = "";
    let stack = 0;
    for (let i = 0; i < exp.length; i++) {
      const c = exp.charAt(i);
      // 非后缀检查是否可以中断
      if (stack == 0 && (c === "," || c === ":")) {
        list.push(buffer);
        list.push(c);
        buffer = "";
        continue;
      }
      //  如果有括号 记录stack
      if (c === "(" || c === "[") {
        buffer = buffer.concat(c);
        stack++;
        continue;
      }
      if (c === ")" || c === "]") {
        buffer = buffer.concat(c);
        stack--;
        continue;
      }
      buffer = buffer.concat(c);
    }
    if (buffer.length > 0) {
      list.push(buffer);
    }
    return list;
  }

  constructor(exp: string, reverse = false, times = 1) {
    this.children = [];
    // '符号处理
    exp = exp.replace(/[‘＇’]/g, "'");
    // 不用解析场景
    if (exp.match(/^([\*\#~;.#xyz]|[0123456789-]*[bsfdeulmr][w]*)$/gi)) {
      this.twist = new TwistAction(exp, reverse, times);
      return;
    }
    this.twist = new TwistAction("", reverse, times);
    if (exp.length == 0) {
      return;
    }
    const list = TwistNode.SPLIT_SEGMENT(exp);
    for (const item of list) {
      let values;
      // 只有[]
      values = item.match(/^\[(.+[:|,].+)\]$/i);
      if (values) {
        values = TwistNode.SPLIT_BRACKET(values[1]);
        switch (values[1]) {
          case ",":
            this.children.push(new TwistNode(values[0], false, 1));
            this.children.push(new TwistNode(values[2], false, 1));
            this.children.push(new TwistNode(values[0], true, 1));
            this.children.push(new TwistNode(values[2], true, 1));
            break;
          case ":":
            this.children.push(new TwistNode(values[0], false, 1));
            this.children.push(new TwistNode(values[2], false, 1));
            this.children.push(new TwistNode(values[0], true, 1));
            break;
          default:
            break;
        }
        continue;
      }
      // []'2
      values = item.match(/^(\[.+[:|,].+\])('?)(\d*)('?)$/i);
      if (values === null) {
        // 拆解括号
        values = item.match(/^\((.+)\)('?)(\d*)('?)$/i);
      }
      // 无括号
      if (values === null) {
        values = item.match(/([\*\#~;.#xyz]|[0123456789-]*[bsfdeulmr][w]*)('?)(\d*)('?)/i);
      }
      // 异常情况
      if (null === values) {
        continue;
      }
      const reverse = (values[2] + values[4]).length == 1;
      const times = values[3].length == 0 ? 1 : parseInt(values[3]);
      this.children.push(new TwistNode(values[1], reverse, times));
    }
  }

  parse(reverse = false): TwistAction[] {
    reverse = this.twist.reverse !== reverse;
    const result: TwistAction[] = [];
    if (0 !== this.children.length) {
      for (let i = 0; i < this.twist.times; i++) {
        for (let j = 0; j < this.children.length; j++) {
          let n;
          if (reverse) {
            n = this.children[this.children.length - j - 1];
          } else {
            n = this.children[j];
          }
          const list = n.parse(reverse);
          for (const element of list) {
            result.push(element);
          }
        }
      }
    } else if (this.twist.sign != "" && !this.twist.sign.startsWith("//")) {
      const action = new TwistAction(this.twist.sign, reverse, this.twist.times);
      result.push(action);
    }
    return result;
  }
}

export default class Twister {
  private cube: Cube;
  private queue: TwistAction[] = [];
  constructor(cube: Cube) {
    this.cube = cube;
    this.cube.callbacks.push(this.update);
  }

  scrambler(): string {
    let result = "";
    const exps = [];
    let last = -1;
    const actions = ["U", "D", "R", "L", "F", "B"];
    let axis = -1;
    for (let i = 0; i < 3 * 3 * this.cube.order; i++) {
      const exp = [];
      while (axis == last) {
        axis = Math.floor(Math.random() * 3);
      }
      const side = Math.floor(Math.random() * 2);
      const action = actions[axis * 2 + side];
      const prefix = Math.ceil(Math.random() * Math.floor(this.cube.order / 2));
      if (prefix !== 1) {
        exp.push(prefix);
      }
      exp.push(action);
      const suffix = Math.random();
      if (suffix < 0.4) {
        exp.push("2");
      } else if (suffix < 0.7) {
        exp.push("'");
      }
      exps.push(exp.join(""));
      last = axis;
    }
    result = exps.join(" ");
    return result;
  }

  get length(): number {
    return this.queue.length;
  }

  finish(): void {
    while (this.queue.length > 0) {
      tweener.finish();
    }
    tweener.finish();
  }

  setup(exp: string, reverse = false, times = 1): void {
    this.finish();
    this.cube.reset();
    const node = new TwistNode(exp, reverse, times);
    const list = node.parse();
    for (const action of list) {
      this.twist(action, true, true);
    }
    this.cube.dirty = true;
    this.cube.history.clear();
    this.cube.history.init = exp;
    this.cube.callback();
  }

  push(exp: string, reverse = false, times = 1): void {
    const node = new TwistNode(exp, reverse, times);
    const list = node.parse();
    if (list.length == 0) {
      return;
    }
    for (const action of list) {
      this.queue.push(action);
    }
    this.update();
  }

  update = (): void => {
    while (true) {
      const action = this.queue.shift();
      if (action == undefined) {
        return;
      }
      const success = this.twist(action, false, false);
      if (!success) {
        this.queue.unshift(action);
        return;
      }
    }
  };

  twist(action: TwistAction, fast: boolean, force: boolean): boolean {
    let success = false;
    if (action.sign == "#") {
      this.setup("");
      return true;
    }
    if (action.sign == "*") {
      const exp = this.scrambler();
      this.setup(exp);
      return true;
    }
    if (action.sign == "." || action.sign == "~") {
      if (fast || force) {
        this.cube.callback();
        return true;
      }
      success = this.cube.lock("a", 1);
      if (success) {
        tweener.tween(0, 1, CubeGroup.frames * action.times, (value: number) => {
          if (value == 1) {
            this.cube.unlock("a", 1);
            this.cube.callback();
            return true;
          }
          return false;
        });
      }
      return success;
    }
    if (action.sign == ";") {
      if (fast || force) {
        this.cube.callback();
        return true;
      }
      success = this.cube.lock("a", 1);
      if (success) {
        this.cube.unlock("a", 1);
        this.cube.callback();
      }
      return success;
    }
    const list = this.cube.table.convert(action);
    if (list.length == 0) {
      return true;
    }
    for (const rotate of list) {
      success = rotate.group.twist((Math.PI / 2) * rotate.twist, fast);
      while (!success && force) {
        tweener.finish();
        success = rotate.group.twist((Math.PI / 2) * rotate.twist, fast);
      }
    }
    if (success) {
      this.cube.record(action);
    }
    return success;
  }

  undo(): void {
    if (this.cube.history.length == 0) {
      return;
    }
    const last = this.cube.history.last;
    const reverse = new TwistAction(last.sign, !last.reverse, 1);
    this.twist(reverse, false, true);
  }
}
