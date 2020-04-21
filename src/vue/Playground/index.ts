import Vue from "vue";
import { Component, Provide, Watch, Ref } from "vue-property-decorator";

import Viewport from "../Viewport";
import Setting from "../Setting";
import Cubelet from "../../cuber/cubelet";
import World from "../../cuber/world";
import Database from "../../database";
import pako from "pako";

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

  @Provide("database")
  database: Database = new Database("playground", this.world);

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
      this.database.refresh();
    });
    this.world.callbacks.push(() => {
      this.callback();
    });
    this.loop();
  }

  get score(): string {
    let diff = this.database.playground.now - this.database.playground.start;
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
    this.database.playground.scene = this.world.cube.history.init;
    this.database.playground.history = this.world.cube.history.exp.substring(1);
    if (this.database.playground.complete) {
      this.database.save();
      return;
    }
    this.database.playground.complete = this.world.cube.complete;
    this.database.save();
    if (this.database.playground.complete) {
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
    if (this.database.playground.complete) {
      return;
    }
    if (this.world.cube.history.moves == 0) {
      this.database.playground.start = 0;
      this.database.playground.now = 0;
      this.database.save();
    } else {
      if (this.database.playground.start == 0) {
        this.database.playground.start = new Date().getTime();
        this.database.save();
      }
      if (!this.database.playground.complete) {
        this.database.playground.now = new Date().getTime();
      }
    }
  }

  load(): void {
    // 未初始化
    if (this.database.playground.scene === "*") {
      this.shuffle();
      return;
    }
    this.world.twister.twist("# " + this.database.playground.scene, false, 1, true);
    this.world.cube.history.clear();
    this.world.cube.history.init = this.database.playground.scene;
    this.world.twister.twist(this.database.playground.history, false, 1, true);
    this.callback();
  }

  shuffle(): void {
    if (this.database.playground.shuffler === "*") {
      this.world.twister.twist("*");
    } else {
      this.world.twister.twist("# " + this.database.playground.shuffler, false, 1, true);
      this.world.cube.history.clear();
      this.world.cube.history.init = this.database.playground.shuffler;
    }
    this.callback();
    this.database.playground.complete = this.world.cube.complete;
    this.database.playground.start = 0;
    this.database.playground.now = 0;
    this.database.save();
  }

  order(): void {
    this.database.playground.order = this.world.order;
    this.database.save();
    this.shuffle();
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

  shuffled = false;
  @Watch("shuffled")
  onShuffledChange(): void {
    this.keyboard.disable = this.shuffled;
    if (this.shuffled === false) {
      this.database.save();
    }
  }

  historyd = false;
  tap(key: string): void {
    switch (key) {
      case "shuffle":
        this.shuffled = true;
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
    const drama = { scene: this.database.playground.scene, action: this.database.playground.history };
    data["drama"] = drama;
    let string = JSON.stringify(data);
    string = pako.deflate(string, { to: "string" });
    string = window.btoa(string);
    const search = "mode=player&data=" + string;
    const link = window.location.origin + window.location.pathname + "?" + search;
    window.open(link);
  }
}
