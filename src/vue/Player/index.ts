import Vue from "vue";
import { Component, Prop, Watch } from "vue-property-decorator";
import cuber from "../../cuber";
import { TwistAction, TwistNode } from "../../cuber/twister";

@Component({
  template: require("./index.html"),
  components: {}
})
export default class Player extends Vue {
  @Prop({ required: false, default: false })
  disable: boolean;

  size: number = 0;
  constructor() {
    super();
  }

  mounted() {
    cuber.world.callbacks.push(() => {
      this.callback();
    });
  }

  resize(size: number) {
    this.size = size;
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

  playing: boolean = false;
  progress: number = 0;
  @Watch("progress")
  onProgressChange() {
    cuber.controller.lock = this.progress > 0;
  }

  scene: string = "";
  @Watch("scene")
  onSceneChange() {
    this.init();
  }

  action: string = "";
  actions: TwistAction[] = [];
  @Watch("action")
  onActionChange() {
    this.actions = new TwistNode(this.action).parse();
    this.init();
  }

  init() {
    cuber.controller.lock = false;
    this.playing = false;
    this.progress = 0;
    cuber.controller.disable = false;
    cuber.twister.finish();
    cuber.twister.twist("#");
    let scene = this.scene == "^" ? "(" + this.action + ")'" : this.scene;
    cuber.twister.twist(scene, false, 1, true);
    cuber.history.clear();
  }

  finish() {
    this.init();
    cuber.twister.twist(this.action, false, 1, true);
    this.progress = this.actions.length;
  }

  callback() {
    if (this.playing) {
      if (this.progress == this.actions.length) {
        if (this.playing) {
          this.playing = false;
        }
        return;
      }
      let action = this.actions[this.progress];
      this.progress++;
      cuber.twister.twist(action.exp, action.reverse, action.times, false);
    }
  }

  toggle() {
    if (this.playing) {
      this.playing = false;
    } else {
      if (this.progress == 0) {
        this.init();
      }
      this.playing = true;
      this.callback();
    }
  }

  forward() {
    if (this.progress == this.actions.length) {
      return;
    }
    if (this.progress == 0) {
      this.init();
    }
    this.playing = false;
    let action = this.actions[this.progress];
    this.progress++;
    cuber.twister.twist(action.exp, action.reverse, action.times);
  }

  backward() {
    if (this.progress == 0) {
      return;
    }
    this.playing = false;
    this.progress--;
    let action = this.actions[this.progress];
    cuber.twister.twist(action.exp, !action.reverse, action.times);
  }
}
