import Vue from "vue";
import { Component, Watch, Provide, Ref } from "vue-property-decorator";
import Viewport from "../Viewport";
import Setting from "../Setting";
import Playbar from "../Playbar";
import World from "../../cuber/world";
import Database from "../../database";
import Capture from "./capture";

@Component({
  template: require("./index.html"),
  components: {
    viewport: Viewport,
    setting: Setting,
    playbar: Playbar,
  },
})
export default class Algs extends Vue {
  @Provide("world")
  world: World = new World();

  @Provide("database")
  database: Database = new Database("algs", this.world);

  capture: Capture = new Capture();

  algs = require("./algs.json");

  width = 0;
  height = 0;
  size = 0;

  @Ref("viewport")
  viewport: Viewport;

  @Ref("playbar")
  playbar: Playbar;

  @Ref("setting")
  setting: Setting;

  constructor() {
    super();
  }

  tab = "tab-0";
  pics: string[][] = [];

  mounted(): void {
    this.setting.items["order"].disable = true;
    for (let i = 0; i < this.algs.length; i++) {
      this.pics.push([]);
    }
    const index = window.localStorage.getItem("algs.index");
    if (index) {
      try {
        const data = JSON.parse(index);
        this.index = { group: data.group, index: data.index };
      } catch (error) {
        this.index = { group: 0, index: 0 };
      }
    } else {
      this.index = { group: 0, index: 0 };
    }
    this.$nextTick(this.resize);
    this.$nextTick(() => {
      this.database.refresh();
    });
    this.loop();
  }

  loop(): void {
    requestAnimationFrame(this.loop.bind(this));
    if (this.viewport?.draw()) {
      return;
    }
    this.pics.some((group, idx) => {
      if (this.algs[idx].algs.length == group.length) {
        return false;
      }
      const save = window.localStorage.getItem("algs.exp." + this.algs[idx].algs[group.length].name);
      const origin = this.algs[idx].algs[group.length].default;
      const exp = save ? save : origin;
      this.algs[idx].algs[group.length].exp = exp;
      group.push(this.capture.snap(this.algs[idx].strip, exp));
      return true;
    });
  }

  resize(): void {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.size = Math.ceil(Math.min(this.width / 6, this.height / 12));
    this.viewport?.resize(this.width, this.height - this.size * 2.6 - 32);
    this.playbar?.resize(this.size);
  }

  get grid(): number {
    return Math.min(this.width / 4 - 2, this.height / 6);
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

  listd = false;
  tap(key: string): void {
    switch (key) {
      case "list":
        this.listd = true;
        break;
      default:
        break;
    }
  }

  index: { group: number; index: number } = { group: 0, index: 0 };
  @Watch("index")
  onIndexChange(): void {
    const strip: { [face: string]: number[] | undefined } = this.algs[this.index.group].strip;
    this.world.cube.strip(strip);
    this.name = this.algs[this.index.group].algs[this.index.index].name;
    this.origin = this.algs[this.index.group].algs[this.index.index].default;
    const action = window.localStorage.getItem("algs.exp." + this.name);
    if (action) {
      this.action = action;
    } else {
      this.action = this.origin;
    }
    this.playbar.scene = "x2^";
    window.localStorage.setItem("algs.index", JSON.stringify(this.index));
  }

  name = "";
  origin = "";
  action = "";
  @Watch("action")
  onActionChange(): void {
    window.localStorage.setItem("algs.exp." + this.name, this.action);
    if (this.pics[this.index.group][this.index.index]) {
      this.pics[this.index.group][this.index.index] = this.capture.snap(this.algs[this.index.group].strip, this.action);
    }
    this.algs[this.index.group].algs[this.index.index].exp = this.action;
    this.playbar.action = this.action;
  }

  select(i: number, j: number): void {
    this.index = { group: i, index: j };
    this.listd = false;
  }
}
