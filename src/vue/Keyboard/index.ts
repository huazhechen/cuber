import Vue from "vue";
import { Component, Inject, Watch } from "vue-property-decorator";
import { Panel } from "../panel";
import Context from "../context";
import Icon from "../Icon";

@Component({
  template: require("./index.html"),
  components: {
    icon: Icon
  }
})
export default class Keyboard extends Vue implements Panel {
  @Inject("context")
  context: Context;

  constructor() {
    super();
    document.addEventListener("keypress", this.keyPress, false);
    document.addEventListener("keydown", this.keyDown, false);
    document.addEventListener("keyup", this.keyUp, false);
  }

  width: number = 0;
  height: number = 0;
  size: number = 0;
  resize(width: number, height: number) {
    this.size = Math.ceil(Math.min(width / 8.6, height / 14));
    this.width = width;
    this.height = this.size * 4.2;
  }

  completed: boolean = false;
  complete: boolean = false;
  loop() {
    if (this.context.cuber.cube.history.moves == 0) {
      this.start = 0;
      this.now = 0;
    } else {
      if (this.start == 0) {
        this.start = new Date().getTime();
      }
      if (!this.context.cuber.cube.complete) {
        this.now = new Date().getTime();
      } else {
        if (!this.complete) {
          this.context.cuber.preferance.lock = true;
          this.completed = true;
          this.complete = true;
        }
      }
    }
  }

  layers: number = 0;
  operations: string[][] = [
    ["L", "D", "B", "F", "U", "R", "L'", "D'", "B'", "F'", "U'", "R'"],
    ["l", "d", "b", "f", "u", "r", "l'", "d'", "b'", "f'", "u'", "r'"],
    ["M", "E", "S", "z", "y", "x", "M'", "E'", "S'", "z'", "y'", "x'"]
  ];

  strips = (() => {
    let list: { [face: string]: number[] | undefined }[][] = [];
    let item: { [face: string]: number[] | undefined }[];
    for (let order = 2; order < 8; order++) {
      item = new Array();
      item.push({});
      let c: { [face: string]: number[] | undefined } = {};
      let f: { [face: string]: number[] | undefined } = {};
      item.push(c);
      item.push(f);
      let indices: number[] = [];
      for (let i = 0; i < order; i++) {
        for (let j = 0; j < order; j++) {
          indices.push(order * order * (i + 1) - j - 1);
        }
      }
      for (let face of ["U", "R", "F", "L", "B"]) {
        f[face] = indices.slice();
      }
      for (let i = 0; i < order - 1; i++) {
        indices.push(order * i);
        indices.push(order * i + order - 1);
        indices.push(order * order * (order - 1) + order * i);
        indices.push(order * order * (order - 1) + order * i + order - 1);
      }
      for (let face of ["U", "R", "F", "L", "B", "D"]) {
        c[face] = indices.slice();
      }
      list[order] = item;
    }
    return list;
  })();
  cfops: number = 0;
  strip() {
    this.cfops = (this.cfops + 1) % 3;
    console.log();
    this.context.cuber.cube.strip(this.strips[this.context.cuber.preferance.order][this.cfops] || {});
  }

  get style() {
    return {
      "margin-left": ((this.size * 8) / 6) * 0.06 + "px",
      "margin-bottom": ((this.size * 8) / 6) * 0.1 + "px",
      width: ((this.size * 8) / 6) * 0.88 + "px",
      height: ((this.size * 8) / 6) * 0.88 + "px",
      "min-width": "0%",
      "min-height": "0%",
      "text-transform": "none"
    };
  }

  get exps() {
    return this.operations[this.layers];
  }

  tap(key: string) {
    switch (key) {
      case "layer":
        this.layers = (this.layers + 1) % 3;
        break;
      case "mirror":
        this.context.cuber.preferance.mirror = !this.context.cuber.preferance.mirror;
        break;
      case "hollow":
        this.context.cuber.preferance.hollow = !this.context.cuber.preferance.hollow;
        break;
      case "lock":
        this.context.cuber.preferance.lock = !this.context.cuber.preferance.lock;
        break;
      default:
        this.context.cuber.twister.twist(key);
        break;
    }
  }

  undo() {
    this.context.cuber.undo();
  }

  start: number = 0;
  now: number = 0;
  get score() {
    let diff = this.now - this.start;
    let minute = Math.floor(diff / 1000 / 60);
    diff = diff % (1000 * 60);
    let second = Math.floor(diff / 1000);
    diff = diff % 1000;
    let ms = Math.floor(diff / 100);
    let time = (minute > 0 ? minute + ":" : "") + (Array(2).join("0") + second).slice(-2) + "." + ms;
    return time + "/" + this.context.cuber.cube.history.moves;
  }

  @Watch("context.mode")
  onModeChange(to: number) {
    if (to == 0) {
      this.$nextTick(() => {
        this.shuffle();
      });
    }
  }

  shuffled: boolean = false;

  shuffle() {
    this.complete = false;
    this.context.cuber.twister.twist("*");
    this.context.cuber.preferance.lock = false;
    this.start = 0;
    this.now = 0;
    this.cfops = 0;
    this.context.cuber.cube.strip({});
  }

  reverse: boolean = false;
  keyPress = (event: KeyboardEvent) => {
    if (this.context.mode != 0 || this.context.cuber.preferance.lock) {
      return false;
    }
    var key = String.fromCharCode(event.which);
    if ("XxRrMmLlYyUuEeDdZzFfSsBb".indexOf(key) >= 0) {
      event.preventDefault();
      this.context.cuber.twister.twist(key, this.reverse);
      return false;
    }
  };

  keyDown = (event: KeyboardEvent) => {
    if (this.context.mode != 0 || this.context.cuber.preferance.lock) {
      return false;
    }
    var key = event.which;
    if (key === 222) {
      event.preventDefault();
      this.reverse = true;
      return false;
    }
    if (key === 8) {
      event.preventDefault();
      this.context.cuber.undo();
      return false;
    }
  };

  keyUp = (event: KeyboardEvent) => {
    if (this.context.mode != 0 || this.context.cuber.preferance.lock) {
      return false;
    }
    var key = event.which;
    if (key === 222) {
      event.preventDefault();
      this.reverse = false;
      return false;
    }
  };
}
