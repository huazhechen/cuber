import Vue from "vue";
import { Component, Provide, Watch, Ref } from "vue-property-decorator";

import Viewport from "../Viewport";
import Setting from "../Setting";
import Cubelet from "../../cuber/cubelet";
import World from "../../cuber/world";
import pako from "pako";
import { ThemeData, PreferanceData } from "../../data";

class KeyHandle {
  reverse = false;
  prefix = 1;

  public disable = false;

  callback: Function;
  keymap: { [key: string]: string } = {
    U: "U",
    I: "R",
    O: "B",
    J: "F",
    K: "D",
    L: "L",
    u: "u",
    i: "r",
    o: "b",
    j: "f",
    k: "d",
    l: "l",
  };

  constructor(callback: Function) {
    this.callback = callback;
    document.addEventListener("keydown", this.keydown, false);
  }

  keydown = (event: KeyboardEvent): boolean => {
    if (this.disable) {
      return false;
    }
    const id = event.which;
    if (id === 8) {
      this.callback("^");
      event.preventDefault();
      return false;
    }
    if (id === 96) {
      event.preventDefault();
      this.reverse = !this.reverse;
      return false;
    }
    let key = String.fromCharCode(event.which);
    if ("123456789".indexOf(key) >= 0) {
      event.preventDefault();
      this.prefix = Number(key);
      return false;
    }
    if (this.keymap[key]) {
      key = this.keymap[key];
      event.preventDefault();
      let exp = "";
      if (this.prefix == 1) {
        key = key.toUpperCase();
      } else {
        exp = exp + this.prefix;
      }
      exp = exp + key;
      if (this.reverse) {
        exp = exp + "'";
      }
      this.callback(exp);
      this.prefix = 1;
      this.reverse = false;
      return false;
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

  @Provide("themes")
  theme: ThemeData = new ThemeData(this.world);

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
        this.world.twister.undo();
      } else {
        this.world.twister.twist(exp);
      }
    });
  }

  resize(): void {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.size = Math.ceil(Math.min(this.width / 6, this.height / 12));
    this.viewport?.resize(this.width, this.height - this.size * 1.5);
  }

  mounted(): void {
    this.load();
    this.$nextTick(this.resize);
    this.$nextTick(() => {
      this.preferance.refresh();
      this.theme.refresh();
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
    let exp = "(_)";
    if (this.keyboard.prefix > 1) {
      exp = this.keyboard.prefix + exp;
    }
    if (this.keyboard.reverse) {
      exp = exp + "'";
    }
    return exp === "(_)" ? "" : exp;
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

  loop(): void {
    requestAnimationFrame(this.loop.bind(this));
    let tick = new Date().getTime();
    tick = (tick / 2000) * Math.PI;
    tick = Math.sin(tick) / 64;
    this.world.cube.position.y = tick * Cubelet.SIZE;
    this.world.cube.rotation.y = (tick / 12) * Math.PI;
    this.world.cube.updateMatrix();
    this.world.cube.dirty = true;
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
    this.world.order = this.data.order;
    this.world.twister.twist("# " + this.data.scene, false, 1, true);
    this.world.cube.history.clear();
    this.world.cube.history.init = this.data.scene;
    this.world.twister.twist(this.data.history, false, 1, true);
    this.callback();
  }

  scramble(): void {
    if (this.data.scrambler === "*") {
      this.world.twister.twist("*");
    } else {
      this.world.twister.twist("# " + this.data.scrambler, false, 1, true);
      this.world.cube.history.clear();
      this.world.cube.history.init = this.data.scrambler;
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
        this.world.twister.undo();
        break;
      case "history":
        this.historyd = true;
        break;
      default:
        break;
    }
  }

  replay(): void {
    const data: { [key: string]: {} } = {};
    const order = this.world.order;
    data["order"] = order;
    const drama = { scene: this.data.scene, action: this.data.history };
    data["drama"] = drama;
    let string = JSON.stringify(data);
    string = pako.deflate(string, { to: "string" });
    string = window.btoa(string);
    const search = "mode=player&data=" + string;
    const link = window.location.origin + window.location.pathname + "?" + search;
    window.open(link);
  }
}
