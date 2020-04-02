import Vue from "vue";
import { Component } from "vue-property-decorator";

import Viewport from "../Viewport";
import cuber, { Cuber } from "../../cuber";
import Tune from "../Tune";
import Setting from "../Setting";
import Dash from "../Dash";
import Cubelet from "../../cuber/cubelet";
import Layer from "../Layer";

@Component({
  template: require("./index.html"),
  components: {
    viewport: Viewport,
    dash: Dash,
    tune: Tune,
    setting: Setting,
    layer: Layer
  }
})
export default class Playground extends Vue {
  width: number = 0;
  height: number = 0;
  size: number = 0;
  viewport: Viewport;

  cuber: Cuber;
  history: string = "";

  constructor() {
    super();
    this.cuber = cuber;
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.size = Math.ceil(Math.min(this.width / 6, this.height / 12)) * 0.95;
    this.viewport?.resize(this.width, this.height - this.size * 1.5);
  }

  mounted() {
    cuber.preferance.load("playground");
    let view = this.$refs.viewport;
    if (view instanceof Viewport) {
      this.viewport = view;
    }
    this.resize();
    this.shuffle();
    this.loop();
  }

  complete: boolean = false;
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
    return time + "/" + cuber.history.moves;
  }

  completed: boolean = false;

  loop() {
    requestAnimationFrame(this.loop.bind(this));
    let tick = new Date().getTime();
    tick = (tick / 2000) * Math.PI;
    tick = Math.sin(tick) / 64;
    this.cuber.world.cube.position.y = tick * Cubelet.SIZE;
    this.cuber.world.cube.rotation.y = (tick / 12) * Math.PI;
    this.cuber.world.cube.updateMatrix();
    this.cuber.world.cube.dirty = true;
    this.viewport.draw();
    if (this.complete) {
      return;
    }
    if (cuber.history.moves == 0) {
      this.start = 0;
      this.now = 0;
    } else {
      if (this.start == 0) {
        this.start = new Date().getTime();
      }
      if (!cuber.world.cube.complete) {
        this.now = new Date().getTime();
      } else {
        if (!this.complete) {
          this.completed = true;
          this.complete = true;
        }
      }
    }
  }

  shuffler = "*";

  shuffle() {
    cuber.twister.twist("# x2 " + this.shuffler, false, 1, true);
    cuber.history.clear();
    this.complete = cuber.world.cube.complete;
    this.start = 0;
    this.now = 0;
  }

  order() {
    this.shuffle();
  }

  get style() {
    return {
      width: this.size + "px",
      height: this.size + "px",
      "min-width": "0%",
      "min-height": "0%",
      "text-transform": "none",
      flex: 1
    };
  }

  layerd: boolean = false;
  tuned: boolean = false;
  settingd: boolean = false;
  shuffled: boolean = false;
  historyd: boolean = false;
  tap(key: string) {
    switch (key) {
      case "layers":
        this.layerd = true;
        break;
      case "shuffle":
        this.shuffled = true;
        break;
      case "tune":
        this.tuned = true;
        break;
      case "settings":
        this.settingd = true;
        break;
      case "undo":
        cuber.history.undo();
        break;
      case "history":
        this.history = this.cuber.history.exp.substring(1);
        this.historyd = true;
        break;
      default:
        break;
    }
  }
}
