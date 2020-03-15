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

  strips = [
    {},
    { U: [1, 2, 3, 4, 6, 7, 8, 9], F: [1, 2, 3, 4, 6, 7, 9], R: [1, 2, 3, 4, 6, 7, 9], B: [1, 2, 3, 4, 6, 7, 9], L: [1, 2, 3, 4, 6, 7, 9], D: [1, 3, 7, 9] },
    { U: [1, 2, 3, 4, 5, 6, 7, 8, 9], F: [1, 2, 3], R: [1, 2, 3], B: [1, 2, 3], L: [1, 2, 3] }
  ];
  cfops: number = 0;
  strip() {
    this.cfops = (this.cfops + 1) % this.strips.length;
    this.context.cuber.cube.strip(this.strips[this.cfops]);
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
        this.context.cuber.cube.twister.twist(key);
        break;
    }
  }

  reverse() {
    this.context.cuber.cube.undo();
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
    this.context.cuber.cube.twister.twist("*");
    this.context.cuber.preferance.lock = false;
    this.start = 0;
    this.now = 0;
  }
}
