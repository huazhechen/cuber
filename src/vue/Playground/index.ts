import Vue from "vue";
import { Component, Provide, Watch, Ref } from "vue-property-decorator";

import Viewport from "../Viewport";
import Setting from "../Setting";
import World from "../../cuber/world";
import pako from "pako";
import { PaletteData, PreferanceData } from "../../data";
import { TwistAction, TwistNode } from "../../cuber/twister";
import Cubelet from "../../cuber/cubelet";

class KeyHandle {
  width = 2;
  display = false;

  public disable = false;

  callback: Function;
  keymap: { [key: number]: string } = {
    73: "R", //I R
    75: "R'", //K R'
    87: "B", //W B
    79: "B'", //O B'
    83: "D", //S D
    76: "D'", //L D'
    68: "L", //D L
    69: "L'", //E L'
    74: "U", //J U
    70: "U'", //F U'
    72: "F", //H F
    71: "F'", //G F'
    186: "y", //; y
    59: "y", //; y
    65: "y'", //A y'
    85: "r", //U r
    82: "l'", //R l'
    77: "r'", //M r'
    86: "l", //V l
    84: "x", //T x
    89: "x", //Y x
    78: "x'", //N x'
    66: "x'", //B x'
    190: "M'", //. M'
    88: "M'", //X M'
    53: "M", //5 M
    54: "M", //6 M
    80: "z", //P z
    81: "z'", //Q z'
    90: "d", //Z d
    191: "d'", /// d'
    67: "u'", //C u'
    188: "u", //, u
    37: "U", //← U
    38: "R", //↑ R
    39: "U'", //→ U'
    40: "R'", //↓ R'
  };

  constructor(callback: Function) {
    this.callback = callback;
    document.addEventListener("keydown", this.keydown, false);
  }

  keydown = (event: KeyboardEvent): boolean => {
    if (this.disable) {
      return false;
    }
    const id = event.keyCode | event.which;

    if (id == 51 || id == 55) {
      this.width = Math.max(2, this.width - 1);
      this.display = true;
    } else if (id == 52 || id == 56) {
      this.width = this.width + 1;
      this.display = true;
    }
    if (id === 8) {
      this.callback("^");
      event.preventDefault();
      return false;
    }
    const key = this.keymap[id];
    if (key) {
      event.preventDefault();
      let exp = "";
      if (this.width != 2 && ["l", "r", "f", "b", "d", "u"].indexOf(key[0]) >= 0) {
        exp = this.width + key;
      } else {
        exp = key;
      }
      this.callback(exp);
      this.display = false;
    }
    return false;
  };
}

export class PlaygroundData {
  private values = {
    version: "0.3",
    order: 3,
    scrambler: "*",
    history: "",
    scene: "*",
    start: 0,
    now: 0,
    complete: false,
  };

  constructor() {
    this.load();
  }

  load(): void {
    const save = window.localStorage.getItem("playground");
    if (save) {
      const data = JSON.parse(save);
      if (data.version != this.values.version) {
        this.save();
        return;
      }
      this.values = data;
    }
  }

  save(): void {
    window.localStorage.setItem("playground", JSON.stringify(this.values));
  }

  get order(): number {
    return this.values.order;
  }

  set order(value: number) {
    this.values.order = value;
  }

  get scrambler(): string {
    return this.values.scrambler;
  }

  set scrambler(value: string) {
    this.values.scrambler = value;
  }

  get history(): string {
    return this.values.history;
  }

  set history(value: string) {
    this.values.history = value;
  }

  get scene(): string {
    return this.values.scene;
  }

  set scene(value: string) {
    this.values.scene = value;
  }

  get start(): number {
    return this.values.start;
  }

  set start(value: number) {
    this.values.start = value;
  }

  get now(): number {
    return this.values.now;
  }

  set now(value: number) {
    this.values.now = value;
  }

  get complete(): boolean {
    return this.values.complete;
  }

  set complete(value: boolean) {
    this.values.complete = value;
  }
}

@Component({
  template: require("./index.html"),
  components: {
    viewport: Viewport,
    setting: Setting,
  },
})
export default class Playground extends Vue {
  @Provide("world")
  world: World = new World();

  @Provide("preferance")
  preferance: PreferanceData = new PreferanceData(this.world);

  @Provide("palette")
  palette: PaletteData = new PaletteData(this.world);

  data: PlaygroundData = new PlaygroundData();

  width = 0;
  height = 0;
  size = 0;

  @Ref("viewport")
  viewport: Viewport;
  keyboard: KeyHandle;

  constructor() {
    super();
    this.keyboard = new KeyHandle((exp: string) => {
      if (exp === "^") {
        this.world.cube.twister.undo();
      } else {
        this.world.cube.twister.twist(new TwistAction(exp), false, true);
      }
    });
  }

  resize(): void {
    this.width = document.documentElement.clientWidth;
    this.height = document.documentElement.clientHeight;
    this.size = Math.ceil(Math.min(this.width / 6, this.height / 12));
    this.viewport?.resize(this.width, this.height - this.size * 1.5);
  }

  mounted(): void {
    this.load();
    this.$nextTick(this.resize);
    this.$nextTick(() => {
      this.preferance.refresh();
      this.palette.refresh();
    });
    this.world.callbacks.push(() => {
      this.callback();
    });
    this.loop();
  }

  get score(): string {
    let diff = this.data.now - this.data.start;
    const hour = Math.floor(diff / 1000 / 60 / 60);
    diff = diff % (1000 * 60 * 60);
    const minute = Math.floor(diff / 1000 / 60);
    diff = diff % (1000 * 60);
    const second = Math.floor(diff / 1000);
    diff = diff % 1000;
    const ms = Math.floor(diff / 100);
    const time =
      (hour > 0 ? hour + ":" : "") +
      (minute > 0 ? (Array(2).join("0") + minute).slice(-2) + ":" : "") +
      (Array(2).join("0") + second).slice(-2) +
      "." +
      ms;
    return time + "/" + this.world.cube.history.moves;
  }

  get key(): string {
    let exp = "";
    if (this.keyboard.display) {
      exp = this.keyboard.width.toString();
    }
    return exp;
  }

  completed = false;
  callback(): void {
    this.data.scene = this.world.cube.history.init;
    this.data.history = this.world.cube.history.exp.substring(1);
    if (this.data.complete) {
      this.data.save();
      return;
    }
    this.data.complete = this.world.cube.complete;
    this.data.save();
    if (this.data.complete) {
      this.completed = true;
    }
  }

  breath(): void {
    if (this.world.order < 10) {
      let tick = new Date().getTime();
      tick = (tick / 2000) * Math.PI;
      tick = Math.sin(tick);
      this.world.cube.position.y = (tick * Cubelet.SIZE) / 64;
      this.world.cube.rotation.y = (tick / 768) * Math.PI;
      this.world.cube.dirty = true;
      this.world.cube.container.dirty = true;
      this.world.cube.updateMatrix();
    }
  }

  loop(): void {
    requestAnimationFrame(this.loop.bind(this));
    this.breath();
    this.viewport.draw();
    if (this.data.complete) {
      return;
    }
    if (this.world.cube.history.moves == 0) {
      this.data.start = 0;
      this.data.now = 0;
    } else {
      if (this.data.start == 0) {
        this.data.start = new Date().getTime();
      }
      if (!this.data.complete) {
        this.data.now = new Date().getTime();
      }
    }
  }

  load(): void {
    // 未初始化
    if (this.data.scene === "*") {
      this.scramble();
      return;
    }
    const order = this.data.order;
    const scene = this.data.scene;
    const history = this.data.history;
    this.world.order = order;
    this.world.cube.twister.setup(scene);
    const node = new TwistNode(history);
    const list = node.parse();
    for (const action of list) {
      this.world.cube.twister.twist(action, true, true);
    }
    this.callback();
  }

  scramble(): void {
    this.data.complete = true;
    if (this.data.scrambler === "*") {
      this.world.cube.twister.twist(new TwistAction("*"), true, true);
    } else {
      this.world.cube.twister.setup(this.data.scrambler);
    }
    this.data.complete = this.world.cube.complete;
    this.callback();
    this.data.start = 0;
    this.data.now = 0;
    this.data.save();
  }

  order(): void {
    this.data.order = this.world.order;
    this.data.save();
    this.scramble();
  }

  get style(): {} {
    return {
      width: this.size + "px",
      height: this.size + "px",
      "min-width": "0%",
      "min-height": "0%",
      "text-transform": "none",
      flex: 1,
    };
  }

  scrambled = false;
  @Watch("scrambled")
  onscrambledChange(): void {
    this.keyboard.disable = this.scrambled;
    if (this.scrambled === false) {
      this.data.save();
    }
  }

  historyd = false;
  tap(key: string): void {
    switch (key) {
      case "scramble":
        this.scrambled = true;
        break;
      case "undo":
        this.world.cube.twister.undo();
        break;
      case "history":
        this.historyd = true;
        break;
      case "share":
        this.share();
        break;
      case "open":
        window.open(this.link);
        this.shared = false;
        break;
      default:
        break;
    }
  }

  shared = false;
  link = "";
  share(): void {
    const data: { [key: string]: {} } = {};
    const order = this.world.order;
    data["order"] = order;
    const drama = { scene: this.data.scene, action: this.data.history };
    data["drama"] = drama;
    let string = JSON.stringify(data);
    string = pako.deflate(string, { to: "string" });
    string = window.btoa(string);
    const search = "mode=player&data=" + string;
    this.link = window.location.origin + window.location.pathname + "?" + search;
    this.shared = true;
  }

  adjust(): void {
    // 高阶暂未实现
    if (this.world.order > 3) {
      return;
    }
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
    let origin = this.world.cube.history.exp;
    origin = origin.replace(/u/g, "(UE')");
    origin = origin.replace(/f/g, "(FS)");
    origin = origin.replace(/r/g, "(RM')");
    origin = origin.replace(/b/g, "(BS')");
    origin = origin.replace(/l/g, "(LM)");
    origin = origin.replace(/d/g, "(DE)");

    // 清理MES
    origin = origin.replace(/M/g, "(x' L' R)");
    origin = origin.replace(/E/g, "(y' D' U)");
    origin = origin.replace(/S/g, "(z F' B)");

    let temp: TwistAction[] = new TwistNode(origin).parse();

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
    this.data.history = string.substring(1);
    this.data.save();
    this.load();
  }

  split(exp: string): string[] {
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

  niss(): void {
    this.adjust();
    const scene = this.data.scene;
    const history = this.data.history;
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

    const segments = this.split(scene).reverse();
    this.data.history = "";
    if (empty && segments.length > 0) {
      const segment = segments.pop() as string;
      if (segment.indexOf("(") >= 0) {
        list = new TwistNode(segment, true).parse();
        for (const item of list) {
          this.data.history = this.data.history + item.value + " ";
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

    this.data.scene = string;
    this.data.save();
    this.load();
  }
}
