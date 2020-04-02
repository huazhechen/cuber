import Vue from "vue";
import { Component, Watch } from "vue-property-decorator";
import Tune from "../Tune";
import Viewport from "../Viewport";
import Dash from "../Dash";
import Setting from "../Setting";
import Player from "../Player";
import cuber from "../../cuber";

@Component({
  template: require("./index.html"),
  components: {
    viewport: Viewport,
    dash: Dash,
    tune: Tune,
    setting: Setting,
    player: Player
  }
})
export default class Algs extends Vue {
  algs = require("./algs.json");

  width: number = 0;
  height: number = 0;
  size: number = 0;
  viewport: Viewport;
  player: Player;

  constructor() {
    super();
  }

  tab = "tab-0";
  pics: string[][] = [];

  mounted() {
    cuber.preferance.load("director");
    let view = this.$refs.viewport;
    if (view instanceof Viewport) {
      this.viewport = view;
    }
    view = this.$refs.player;
    if (view instanceof Player) {
      this.player = view;
    }
    this.resize();

    for (let i = 0; i < this.algs.length; i++) {
      this.pics.push([]);
    }
    let index = window.localStorage.getItem("algs.index");
    if (index) {
      try {
        let data = JSON.parse(index);
        this.index = { group: data.group, index: data.index };
      } catch (error) {
        console.log(error);
        this.index = { group: 0, index: 0 };
      }
    } else {
      this.index = { group: 0, index: 0 };
    }
    this.loop();
  }

  loop() {
    requestAnimationFrame(this.loop.bind(this));
    if (this.viewport?.draw()) {
      return;
    }
    this.pics.some((group, idx) => {
      if (this.algs[idx].algs.length == group.length) {
        return false;
      }
      let save = window.localStorage.getItem("algs.exp." + this.algs[idx].algs[group.length].name);
      let origin = this.algs[idx].algs[group.length].default;
      let exp = save ? save : origin;
      this.algs[idx].algs[group.length].exp = exp;
      group.push(cuber.capture.snap(this.algs[idx].strip, exp));
      return true;
    });
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.size = Math.ceil(Math.min(this.width / 6, this.height / 12)) * 0.95;
    this.viewport?.resize(this.width, this.height - this.size * 3.6 - 32);
    this.player?.resize(this.size);
  }

  get grid() {
    let width = this.size * 12;
    return Math.min(this.width, width);
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

  menu: boolean = false;
  tuned: boolean = false;
  settingd: boolean = false;
  listd: boolean = false;
  tap(key: string) {
    switch (key) {
      case "tune":
        this.tuned = true;
        break;
      case "settings":
        this.settingd = true;
        break;
      case "list":
        this.tab = "tab-" + this.index.group;
        this.listd = true;
        break;
      default:
        break;
    }
  }

  index: { group: number; index: number } = { group: 0, index: 0 };
  @Watch("index")
  onIndexChange() {
    let strip: { [face: string]: number[] | undefined } = this.algs[this.index.group].strip;
    cuber.world.cube.strip(strip);
    this.name = this.algs[this.index.group].algs[this.index.index].name;
    this.origin = this.algs[this.index.group].algs[this.index.index].default;
    let action = window.localStorage.getItem("algs.exp." + this.name);
    if (action) {
      this.action = action;
    } else {
      this.action = this.origin;
    }
    this.player.scene = "^";
    window.localStorage.setItem("algs.index", JSON.stringify(this.index));
  }

  name: string = "";
  origin: string = "";
  action: string = "";
  @Watch("action")
  onActionChange() {
    window.localStorage.setItem("algs.exp." + this.name, this.action);
    if (this.pics[this.index.group][this.index.index]) {
      this.pics[this.index.group][this.index.index] = cuber.capture.snap(
        this.algs[this.index.group].strip,
        this.action
      );
    }
    this.algs[this.index.group].algs[this.index.index].exp = this.action;
    this.player.action = this.action;
  }

  select(i: number, j: number) {
    this.index = { group: i, index: j };
    this.listd = false;
  }

  move(step: number) {
    let group = this.index.group;
    let index = this.index.index + this.algs[group].algs.length + step;
    index = index % this.algs[group].algs.length;
    this.index = { group: group, index: index };
  }
}
