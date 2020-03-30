import Vue from "vue";
import { Component } from "vue-property-decorator";

import Viewport from "../Viewport";
import cuber, { Cuber } from "../../cuber";
import Tune from "../Tune";
import Setting from "../Setting";
import Dash from "../Dash";
import Cubelet from "../../cuber/cubelet";

@Component({
  template: require("./index.html"),
  components: {
    viewport: Viewport,
    dash: Dash,
    tune: Tune,
    setting: Setting
  }
})
export default class Playground extends Vue {
  width: number = 0;
  height: number = 0;
  size: number = 0;
  viewport: Viewport;

  cuber: Cuber;

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
    cuber.twister.twist("#x2" + this.shuffler, false, 1, true);
    cuber.history.clear();    
    this.complete = cuber.world.cube.complete;
    this.start = 0;
    this.now = 0;
  }

  order() {
    this.shuffle();
    this.restrip();
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

  tuned: boolean = false;
  settingd: boolean = false;
  shuffled: boolean = false;
  stripd: boolean = false;
  tap(key: string) {
    switch (key) {
      case "shuffle":
        this.shuffled = true;
        break;
      case "tune":
        this.tuned = true;
        break;
      case "settings":
        this.settingd = true;
        break;
      case "strip":
        this.stripd = true;
        break;
      case "undo":
        cuber.history.undo();
        break;
      default:
        break;
    }
  }

  strips: { [key: string]: boolean } = {
    U: false,
    F: false,
    R: false,
    B: false,
    L: false,
    D: false,
    m: false,
    e: false,
    s: false,
    Center: false,
    Edge: false,
    Corner: false
  };
  strip(group: string) {
    this.strips[group] = !this.strips[group];
    this.restrip();
  }

  restrip() {
    cuber.world.cube.strip({});
    let indices: number[] = [];
    for (let group in this.strips) {
      if (this.strips[group]) {
        if (group.length > 1) {
          group = group.toLocaleLowerCase();
        }
        let g = cuber.world.cube.groups.get(group);
        if (g) {
          indices.push(...g.indices);
        }
      }
    }
    let strips: { [face: string]: number[] | undefined } = {
      U: indices,
      F: indices,
      R: indices,
      B: indices,
      L: indices,
      D: indices
    };
    cuber.world.cube.strip(strips);
  }
}
