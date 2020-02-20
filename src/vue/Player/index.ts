import Vue from "vue";
import { Component, Inject, Watch } from "vue-property-decorator";
import Cuber from "../../cuber/cuber";
import Context from "../../common/context";
import { TwistAction, TwistNode } from "../../cuber/twister";
import Capture from "../../cuber/capture";

@Component({
  template: require("./index.html")
})
export default class Player extends Vue {
  @Inject("cuber")
  cuber: Cuber;

  @Inject("context")
  context: Context;

  algs = require("./algs.json");

  list: boolean = false;
  width: number = 0;
  height: number = 0;
  size: number = 0;

  progress: number = 0;

  tab = null;
  capture: Capture = new Capture();
  pics: string[][] = [];

  mounted() {
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
    this.cuber.cube.twister.callbacks.push(() => {
      this.play();
    });
  }

  loop() {
    this.pics.some((group, idx) => {
      if (this.algs[idx].algs.length == group.length) {
        return false;
      }
      let save = window.localStorage.getItem("algs.exp." + this.algs[idx].algs[group.length].name);
      let origin = this.algs[idx].algs[group.length].default;
      let exp = save ? save : origin;
      this.algs[idx].algs[group.length].exp = exp;
      group.push(this.capture.snap(this.algs[idx].strip, exp));
      return true;
    });
  }

  resize(width: number, height: number) {
    this.size = Math.min(width / 8, height / 14);
    this.width = width;
    this.height = 210;
  }

  playing: boolean = false;
  @Watch("playing")
  onPlayingChange() {
    this.cuber.controller.disable = this.playing;
  }

  index: { group: number; index: number } = { group: 0, index: 0 };
  @Watch("index")
  onIndexChange() {
    if (this.context.mode != "algs") {
      return;
    }
    let strip: { [face: string]: number[] | undefined } = this.algs[this.index.group].strip;
    this.cuber.cube.strip(strip);
    this.name = this.algs[this.index.group].algs[this.index.index].name;
    this.origin = this.algs[this.index.group].algs[this.index.index].default;
    let exp = window.localStorage.getItem("algs.exp." + this.name);
    if (exp) {
      this.exp = exp;
    } else {
      this.exp = this.origin;
    }
    window.localStorage.setItem("algs.index", JSON.stringify(this.index));
  }

  actions: TwistAction[] = [];
  name: string = "";
  origin: string = "";
  exp: string = "";
  @Watch("exp")
  onExpChange() {
    window.localStorage.setItem("algs.exp." + this.name, this.exp);
    if (this.pics[this.index.group][this.index.index]) {
      this.pics[this.index.group][this.index.index] = this.capture.snap(this.algs[this.index.group].strip, this.exp);
    }
    this.algs[this.index.group].algs[this.index.index].exp = this.exp;
    this.actions = new TwistNode(this.exp).parse();
    this.init();
  }

  play() {
    if (this.context.mode != "algs") {
      return;
    }
    if (this.progress == this.actions.length) {
      this.playing = false;
    }
    if (this.playing) {
      let action = this.actions[this.progress];
      this.progress++;
      this.cuber.cube.twister.twist(action.exp, action.reverse, action.times, false);
    }
  }

  forward() {
    if (this.progress == this.actions.length) {
      return;
    }
    this.playing = false;
    let action = this.actions[this.progress];
    this.progress++;
    this.cuber.cube.twister.twist(action.exp, action.reverse, action.times);
  }

  backward() {
    if (this.progress == 0) {
      return;
    }
    this.playing = false;
    this.progress--;
    let action = this.actions[this.progress];
    this.cuber.cube.twister.twist(action.exp, !action.reverse, action.times);
  }

  toggle() {
    if (this.playing) {
      this.playing = false;
    } else {
      this.playing = true;
      this.play();
    }
  }

  tabs(tab: number) {
    if (tab == this.index.group) {
      this.init();
    } else {
      this.index = { group: tab, index: 0 };
    }
  }

  init() {
    this.playing = false;
    this.progress = 0;
    this.cuber.cube.twister.finish();
    this.cuber.cube.twister.twist("#");
    this.cuber.cube.twister.twist(this.exp, true, 1, true);
  }

  @Watch("context.mode")
  onModeChange(to: string) {
    if (to == "algs") {
      this.$nextTick(() => {
        this.onIndexChange();
        this.init();
      });
    } else {
      this.cuber.cube.strip({});
    }
  }
}
