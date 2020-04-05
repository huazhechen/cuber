import Vue from "vue";
import { Component, Provide } from "vue-property-decorator";

import Viewport from "../Viewport";
import Setting from "../Setting";
import Cubelet from "../../cuber/cubelet";
import World from "../../cuber/world";
import Database from "../../database";
import pako from "pako";
import Base64 from "../../common/base64";

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

  width: number = 0;
  height: number = 0;
  size: number = 0;
  viewport: Viewport;

  constructor() {
    super();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.size = Math.ceil(Math.min(this.width / 6, this.height / 12));
    this.viewport?.resize(this.width, this.height - this.size * 1.5);
  }

  mounted() {
    this.database.load();
    let view = this.$refs.viewport;
    if (view instanceof Viewport) {
      this.viewport = view;
    }
    this.shuffle();
    this.$nextTick(this.resize);
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
    return time + "/" + this.world.cube.history.moves;
  }

  completed: boolean = false;

  loop() {
    requestAnimationFrame(this.loop.bind(this));
    let tick = new Date().getTime();
    tick = (tick / 2000) * Math.PI;
    tick = Math.sin(tick) / 64;
    this.world.cube.position.y = tick * Cubelet.SIZE;
    this.world.cube.rotation.y = (tick / 12) * Math.PI;
    this.world.cube.updateMatrix();
    this.world.cube.dirty = true;
    this.viewport.draw();
    if (this.complete) {
      return;
    }
    if (this.world.cube.history.moves == 0) {
      this.start = 0;
      this.now = 0;
    } else {
      if (this.start == 0) {
        this.start = new Date().getTime();
      }
      if (!this.world.cube.complete) {
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
    if (this.shuffler === "*") {
      this.world.twister.twist("*");
    } else {
      this.world.twister.twist("# x2 " + this.shuffler, false, 1, true);
      this.world.cube.history.clear();
      this.world.cube.history.init = "x2 " + this.shuffler;
    }
    this.complete = this.world.cube.complete;
    this.start = 0;
    this.now = 0;
  }

  order() {
    this.database.playground.order = this.world.order;
    this.database.save();
    this.shuffle();
  }

  get style() {
    return {
      width: this.size + "px",
      height: this.size + "px",
      "min-width": "0%",
      "min-height": "0%",
      "text-transform": "none",
      flex: 1,
    };
  }

  shuffled: boolean = false;
  historyd: boolean = false;
  history: string = "";
  scene: string = "";
  tap(key: string) {
    switch (key) {
      case "shuffle":
        this.shuffled = true;
        break;
      case "undo":
        this.world.twister.undo();
        break;
      case "history":
        this.history = this.world.cube.history.exp.substring(1);
        this.scene = this.world.cube.history.init;
        this.historyd = true;
        break;
      default:
        break;
    }
  }

  replay() {
    let data: { [key: string]: any } = {};
    let order = this.world.order;
    data["order"] = order;
    let drama = { scene: this.world.cube.history.init, action: this.world.cube.history.exp.substring(1) };
    data["drama"] = drama;
    data["preferance"] = this.database.preferance.value;
    let string = JSON.stringify(data);
    string = pako.deflate(string, { to: "string" });
    string = Base64.encode(string);
    let search = "mode=player&data=" + string;
    window.location.search = search;
  }
}
