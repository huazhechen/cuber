import Vue from "vue";
import { Component, Inject, Watch } from "vue-property-decorator";
import Cuber from "../../cuber/cuber";
import Context from "../../common/context";
import Icon from "../Icon";
import { Panel } from "../panel";

@Component({
  template: require("./index.html"),
  components: {
    icon: Icon
  }
})
export default class Keyboard extends Vue implements Panel {
  @Inject("cuber")
  cuber: Cuber;

  @Inject("context")
  context: Context;

  width: number = 0;
  height: number = 0;
  size: number = 0;
  resize(width: number, height: number) {
    this.size = Math.ceil(Math.min(width / 8.6, height / 14));
    this.width = width;
    this.height = this.size * 4.2;
  }

  loop() {
    if (this.cuber.cube.history.moves == 0) {
      this.start = 0;
      this.now = 0;
    } else {
      if (this.start == 0) {
        this.start = new Date().getTime();
      }
      if (!this.cuber.cube.complete) {
        this.now = new Date().getTime();
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
    this.cuber.cube.strip(this.strips[this.cfops]);
  }

  get style() {
    return {
      "margin-left": this.height / 48 + "px",
      "margin-bottom": this.height / 32 + "px",
      width: (this.height / 32) * 9 + "px",
      height: (this.height / 32) * 9 + "px",
      "min-width": "0%",
      "min-height": "0%",
      "text-transform": "none"
    };
  }

  get exps() {
    return this.operations[this.layers];
  }

  twist(exp: string) {
    this.cuber.cube.twister.twist(exp);
  }

  reverse() {
    if (this.cuber.cube.history.length == 0) {
      return;
    }
    this.cuber.cube.twister.twist(this.cuber.cube.history.last.value, true, 1, false);
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
    return time + "/" + this.cuber.cube.history.moves;
  }

  @Watch("context.mode")
  onModeChange(to: string) {
    if (to == "playground") {
      this.$nextTick(() => {
        this.shuffle();
      });
    }
  }

  shuffle() {
    this.cuber.cube.twister.twist("*");
    this.context.lock = false;
    this.start = 0;
    this.now = 0;
  }
}
