import Vue from "vue";
import { Component, Inject, Watch } from "vue-property-decorator";
import { TwistAction, TwistNode } from "../../cuber/twister";
import Context from "../context";

@Component({
  template: require("./index.html")
})
export default class Player extends Vue {
  @Inject("context")
  context: Context;

  progress: number = 0;

  tab = null;
  mounted() {
    for (let i = 0; i < this.context.algs.length; i++) {
      this.context.pics.push([]);
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
    this.context.cuber.cube.twister.callbacks.push(() => {
      this.play();
    });
  }

  loop() {}

  width: number = 0;
  height: number = 0;
  size: number = 0;
  resize(width: number, height: number) {
    this.size = Math.ceil(Math.min(width / 8.6, height / 14));
    this.width = width;
    this.height = this.size * 2.2 + 112;
  }

  get style() {
    return {
      width: ((this.size * 8) / 5) * 1 + "px",
      height: this.size * 0.9 + "px",
      "min-width": "0%",
      "min-height": "0%",
      "text-transform": "none"
    };
  }

  playing: boolean = false;
  @Watch("playing")
  onPlayingChange() {
    this.context.cuber.controller.disable = this.playing;
  }

  index: { group: number; index: number } = { group: 0, index: 0 };
  @Watch("index")
  onIndexChange() {
    if (this.context.mode != 1) {
      return;
    }
    this.strip();
    this.name = this.context.algs[this.index.group].algs[this.index.index].name;
    this.origin = this.context.algs[this.index.group].algs[this.index.index].default;
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
    if (this.context.pics[this.index.group][this.index.index]) {
      this.context.pics[this.index.group][this.index.index] = this.context.capture.snap(this.context.algs[this.index.group].strip, this.exp);
    }
    this.context.algs[this.index.group].algs[this.index.index].exp = this.exp;
    this.actions = new TwistNode(this.exp).parse();
    this.init();
  }

  play() {
    if (this.context.mode != 1) {
      return;
    }
    if (this.progress == this.actions.length) {
      this.playing = false;
    }
    if (this.playing) {
      let action = this.actions[this.progress];
      this.progress++;
      this.context.cuber.cube.twister.twist(action.exp, action.reverse, action.times, false);
    }
  }

  forward() {
    if (this.progress == this.actions.length) {
      return;
    }
    this.playing = false;
    let action = this.actions[this.progress];
    this.progress++;
    this.context.cuber.cube.twister.twist(action.exp, action.reverse, action.times);
  }

  backward() {
    if (this.progress == 0) {
      return;
    }
    this.playing = false;
    this.progress--;
    let action = this.actions[this.progress];
    this.context.cuber.cube.twister.twist(action.exp, !action.reverse, action.times);
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

  strip() {
    if (this.colorize) {
      this.context.cuber.cube.strip({});
    } else {
      let strip: { [face: string]: number[] | undefined } = this.context.algs[this.index.group].strip;
      this.context.cuber.cube.strip(strip);
    }
  }

  colorize: boolean = false;
  init() {
    this.context.cuber.controller.lock = true;
    this.playing = false;
    this.progress = 0;
    this.context.cuber.cube.twister.finish();
    this.context.cuber.cube.twister.twist("#");
    this.context.cuber.cube.twister.twist(this.exp, true, 1, true);
  }

  end() {
    this.init();
    this.context.cuber.cube.twister.twist(this.exp, false, 1, true);
    this.progress = this.actions.length;
  }

  @Watch("context.mode")
  onModeChange(to: number) {
    if (to == 1) {
      this.$nextTick(() => {
        this.onIndexChange();
        this.init();
      });
    } else {
      this.context.cuber.cube.strip({});
    }
  }

  move(step: number) {
    let group = this.index.group;
    let index = this.index.index + this.context.algs[group].algs.length + step;
    index = index % this.context.algs[group].algs.length;
    this.index = { group: group, index: index };
  }

  tap(key: string) {
    switch (key) {
      case "mirror":
        this.context.cuber.preferance.mirror = !this.context.cuber.preferance.mirror;
        break;
      case "hollow":
        this.context.cuber.preferance.hollow = !this.context.cuber.preferance.hollow;
        break;
      case "colorize":
        this.colorize = !this.colorize;
        this.strip();
        break;
      default:
        break;
    }
  }
}
