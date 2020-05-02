import tweener from "./tweener";
import World from "./world";

export class TwistAction {
  group: string;
  reverse: boolean;
  times: number;
  fast: boolean;
  constructor(exp: string, reverse = false, times = 1, fast = false) {
    this.group = exp;
    this.reverse = reverse;
    this.times = times;
    this.fast = fast;
  }

  get exp(): string {
    let times = this.times;
    let reverse = this.reverse;
    if (times === 3) {
      times = 1;
      reverse = !reverse;
    }
    if (times === 2) {
      reverse = false;
    }
    return times == 0 ? "" : this.group + (reverse ? "'" : "") + (times == 1 ? "" : String(times));
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
    this.twist = new TwistAction(exp, reverse, times);
    if (exp.length == 0) {
      return;
    }
    // '符号处理
    exp = exp.replace(/[‘＇’]/g, "'");
    // 不用解析场景
    if (exp.match(/^[0123456789-]*[\*~.#xyzbsfdeulmr][w]*$/gi)) {
      if (/[XYZ]/.test(this.twist.group)) {
        this.twist.group = this.twist.group.toLowerCase();
      }
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
        values = item.match(/([0123456789-]*[\*\#~.xyzbsfdeulmr][w]*)('?)(\d*)('?)/i);
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
    } else if (this.twist.group != "") {
      const action = new TwistAction(this.twist.group, reverse, this.twist.times);
      result.push(action);
    }
    return result;
  }
}

export default class Twister {
  world: World;
  queue: TwistAction[];
  constructor(world: World) {
    this.world = world;
    this.queue = [];
    this.world.callbacks.push(() => {
      this.update();
    });
  }

  static scramble(order: number): string {
    let result = "";
    const exps = [];
    let last = -1;
    const actions = ["Uw", "Dw", "Rw", "Lw", "Fw", "Bw"];
    let axis = -1;
    for (let i = 0; i < 3 * 3 * order; i++) {
      const exp = [];
      while (axis == last) {
        axis = Math.floor(Math.random() * 3);
      }
      const side = Math.floor(Math.random() * 2);
      let action = actions[axis * 2 + side];
      const prefix = Math.ceil(Math.random() * Math.floor(order / 2));
      if (prefix === 1) {
        action = action[0];
      }
      if (prefix > 2) {
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
    for (const action of this.queue) {
      action.fast = true;
    }
    tweener.finish();
  }

  twist(exp: string, reverse = false, times = 1, fast = false): void {
    if (this.queue.length > 0) {
      tweener.finish();
      this.update();
    }
    tweener.speedup();
    const node = new TwistNode(exp, reverse, times);
    const list = node.parse();
    for (const element of list) {
      element.fast = fast;
      this.queue.push(element);
    }
    this.update();
  }

  push(action: TwistAction): void {
    this.queue.push(action);
    this.update();
  }

  update(): void {
    if (this.queue.length === 0) {
      return;
    }
    if (this.world.cube.lock) {
      return;
    }
    const twist = this.queue.shift();
    if (undefined == twist) {
      return;
    }
    this.start(twist);
  }

  start(action: TwistAction): void {
    if (action.group == "#") {
      this.world.cube.reset();
      this.world.cube.dirty = true;
      this.world.cube.history.clear();
      this.world.callback();
      return;
    }
    if (action.group == "*") {
      this.world.cube.reset();
      this.world.cube.dirty = true;
      const exp = Twister.scramble(this.world.cube.order);
      this.twist(exp, false, 1, true);
      this.world.cube.history.clear();
      this.world.cube.history.init = exp;
      return;
    }
    let angle = -Math.PI / 2;
    if (action.reverse) {
      angle = -angle;
    }
    if (action.times) {
      angle = angle * action.times;
    }
    const part = this.world.cube.groups.get(action.group);
    if (part === undefined) {
      this.update();
      return;
    }
    part.angle = 0;
    part.hold();

    if (action.fast) {
      part.angle = angle;
    }
    part.twist(angle);
    return;
  }

  undo(): void {
    if (this.world.cube.history.length == 0) {
      return;
    }
    this.finish();
    if (this.world.cube.history.length == 0) {
      return;
    }
    const last = this.world.cube.history.last;
    const action = new TwistAction(last.group, !last.reverse, last.times);
    this.push(action);
  }
}
