import Vue from "vue";
import { Component, Prop, Watch, Inject } from "vue-property-decorator";
import { TwistAction, TwistNode } from "../../cuber/twister";
import World from "../../cuber/world";

@Component({
  template: require("./index.html"),
  components: {},
})
export default class Playbar extends Vue {
  @Inject("world")
  world: World;

  @Prop({ required: false, default: false })
  disable: boolean;

  size = 0;
  constructor() {
    super();
  }

  mounted(): void {
    this.world.callbacks.push(() => {
      this.callback();
    });
  }

  resize(size: number): void {
    this.size = size;
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

  playing = false;
  @Watch("playing")
  onPlayingChange(): void {
    this.world.controller.disable = this.playing;
  }

  pprogress = 0;

  get progress(): number {
    return this.pprogress;
  }
  set progress(value) {
    this.init();
    for (let i = 0; i < value; i++) {
      const action = this.actions[i];
      this.world.cube.twister.twist(action, true, true);
    }
    this.pprogress = value;
  }

  @Watch("progress")
  onProgressChange(): void {
    this.world.controller.lock = this.progress > 0;
  }

  scene = "";
  @Watch("scene")
  onSceneChange(): void {
    this.init();
  }

  action = "";
  actions: TwistAction[] = [];
  @Watch("action")
  onActionChange(): void {
    this.actions = new TwistNode(this.action).parse();
    this.init();
  }

  init(): void {
    this.world.controller.lock = false;
    this.playing = false;
    this.pprogress = 0;
    const scene = this.scene.replace("^", "(" + this.action + ")'");
    this.world.cube.twister.setup(scene);
  }

  finish(): void {
    this.init();
    for (const action of this.actions) {
      this.world.cube.twister.twist(action, true, true);
    }
    this.pprogress = this.actions.length;
  }

  callback(): void {
    if (this.playing) {
      if (this.pprogress == this.actions.length) {
        this.playing = false;
        return;
      }
      let success;
      do {
        const action = this.actions[this.pprogress++];
        success = this.world.cube.twister.twist(action, false, false);
        if (success) {
          if (this.pprogress == this.actions.length) {
            break;
          }
        } else {
          this.pprogress--;
          break;
        }
      } while (this.pprogress < this.actions.length);
    }
  }

  toggle(): void {
    if (this.playing) {
      this.playing = false;
    } else {
      if (this.pprogress == 0) {
        this.init();
      }
      this.playing = true;
      this.callback();
    }
  }

  forward(): void {
    if (this.pprogress == this.actions.length) {
      return;
    }
    if (this.pprogress == 0) {
      this.init();
    }
    this.playing = false;
    const action = this.actions[this.pprogress];
    this.pprogress++;
    this.world.cube.twister.twist(action, false, true);
  }

  backward(): void {
    if (this.pprogress == 0) {
      return;
    }
    this.playing = false;
    this.pprogress--;
    const action = this.actions[this.pprogress];
    this.world.cube.twister.twist(new TwistAction(action.sign, !action.reverse, action.times), false, true);
  }

  get chaos(): boolean {
    return this.progress == 0 && this.world.cube.history.length != 0;
  }
}
