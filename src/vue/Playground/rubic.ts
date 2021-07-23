import { TwistAction, TwistNode } from "../../cuber/twister";

export default class Rubic {
  static minify(exp: string): string {
    return exp.replace(/3'/g, "").replace(/3/g, "'").replace(/2'/g, "2");
  }

  static adjust(exp: string): string {
    const om = ["U", "F", "R", "B", "L", "D"];
    const tm = {
      x: [1, 5, 2, 0, 4, 3],
      y: [0, 2, 3, 4, 1, 5],
      z: [4, 1, 0, 3, 5, 2],
    };
    const am: { [key: string]: string } = {
      R: "x",
      L: "x",
      U: "y",
      D: "y",
      F: "z",
      B: "z",
    };
    const o = om.slice();

    // 清理ufrbld
    exp = exp.replace(/u/g, "(UE')");
    exp = exp.replace(/f/g, "(FS)");
    exp = exp.replace(/r/g, "(RM')");
    exp = exp.replace(/b/g, "(BS')");
    exp = exp.replace(/l/g, "(LM)");
    exp = exp.replace(/d/g, "(DE)");

    // 清理MES
    exp = exp.replace(/M/g, "(x' L' R)");
    exp = exp.replace(/E/g, "(y' D' U)");
    exp = exp.replace(/S/g, "(z F' B)");

    let temp: TwistAction[] = new TwistNode(exp).parse();

    const list: TwistAction[] = [];
    // 清理xyz
    for (const item of temp) {
      if (item.sign == "x" || item.sign == "y" || item.sign == "z") {
        const map = tm[item.sign];
        let times = item.times;
        if (item.reverse) {
          times = 4 - times;
        }
        for (let i = 0; i < times; i++) {
          const last = o.slice();
          o.length = 0;
          for (const j of map) {
            o.push(last[j]);
          }
        }
        continue;
      }
      const index = om.indexOf(item.sign);
      item.sign = o[index];
      list.push(item);
    }
    // 清理R L R'
    temp = list.slice();
    list.length = 0;
    for (const item of temp) {
      let last: TwistAction | null = null;
      for (let i = 0; i < list.length; i++) {
        const prev = list[list.length - 1 - i];
        if (prev.sign == item.sign) {
          last = prev;
          break;
        }
        if (am[prev.sign] != am[item.sign]) {
          break;
        }
      }
      if (last) {
        last.times = last.times + item.times * (last.reverse == item.reverse ? 1 : -1);
        last.times = last.times % 4;
        if (last.times == 0) {
          list.splice(list.indexOf(last), 1);
        }
      } else {
        list.push(item);
      }
    }
    // 第四步 生成string
    let string = "";
    for (const item of list) {
      string = string + " " + item.value;
    }
    return Rubic.minify(string.substring(1));
  }

  static split(exp: string): string[] {
    const list = [];
    let buffer = "";
    let stack = 0;
    for (let i = 0; i < exp.length; i++) {
      const c = exp.charAt(i);
      if (c === " " && buffer.length == 0) {
        continue;
      }
      //  如果有括号 记录stack
      if (c === "(") {
        if (stack == 0 && buffer.length > 0) {
          list.push(buffer);
          buffer = "";
          i--;
        } else {
          buffer = buffer.concat(c);
          stack++;
        }
        continue;
      }
      if (c === ")") {
        buffer = buffer.concat(c);
        stack--;
        if (stack == 0) {
          list.push(buffer);
          buffer = "";
        }
        continue;
      }
      buffer = buffer.concat(c);
    }
    if (buffer.length > 0) {
      list.push(buffer);
    }
    return list;
  }

  static niss(scene: string, history: string): { scene: string; history: string } {
    history = Rubic.adjust(history);
    let string = "";
    let list: TwistAction[];

    list = new TwistNode(history, true).parse();
    const empty = list.length == 0;
    if (!empty) {
      string = string + "(";
      for (const item of list) {
        string = string + item.value + " ";
      }
      string = string.substr(0, string.length - 1);
      string = string + ") ";
    }

    const segments = Rubic.split(scene).reverse();
    history = "";
    if (empty && segments.length > 0) {
      const segment = segments.pop() as string;
      if (segment.indexOf("(") >= 0) {
        list = new TwistNode(segment, true).parse();
        for (const item of list) {
          history = history + item.value + " ";
        }
      } else {
        segments.push(segment);
      }
    }
    for (const segment of segments) {
      list = new TwistNode(segment, true).parse();
      if (list.length == 0) {
        continue;
      }
      if (segment.indexOf("(") >= 0) {
        string = string + "(";
      }
      for (const item of list) {
        string = string + item.value + " ";
      }
      if (segment.indexOf("(") >= 0) {
        string = string.substr(0, string.length - 1);
        string = string + ") ";
      }
    }

    if (!scene.includes("// niss")) {
      string = string + "// niss";
    }

    return {
      scene: Rubic.minify(string),
      history: Rubic.minify(history),
    };
  }
}
