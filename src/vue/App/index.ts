import Vue from "vue";
import { Component, Provide, Watch } from "vue-property-decorator";
import Game from "../../cube/game";
import KeyboardPanel from "../KeyboardPanel";
import ScriptPanel from "../ScriptPanel";
import TimerPanel from "../TimerPanel";

@Component({
  template: require("./index.html"),
  components: {
    "keyboard-panel": KeyboardPanel,
    "script-panel": ScriptPanel,
    "timer-panel": TimerPanel
  }
})
export default class App extends Vue {
  @Provide("game")
  game: Game = new Game();
  angle: number = 1;

  @Watch("angle")
  onAngleChange() {
    let storage = window.localStorage;
    storage.setItem("angle", String(this.angle));
    this.game.scene.rotation.y = -Math.PI / 4 + (this.angle * Math.PI) / 16;
    this.game.dirty = true;
  }

  size: number = 0;

  @Watch("size")
  onSizeChange() {
    let storage = window.localStorage;
    storage.setItem("size", String(this.size));
    this.game.scale = Math.pow(2, -this.size / 8);
    this.resize();
  }

  get duration() {
    return this.game.duration;
  }

  @Watch("duration")
  onDurationChange() {
    let storage = window.localStorage;
    storage.setItem("duration", String(this.duration));
  }

  resize() {
    if (
      this.$refs.cuber instanceof HTMLElement &&
      this.$refs.panel instanceof HTMLElement
    ) {
      let cuber = this.$refs.cuber;
      let panel = this.$refs.panel;
      let panelHeight = panel.clientHeight;
      let cuberHeight = window.innerHeight - panelHeight;
      this.game.resize(cuber.clientWidth, cuberHeight);
    }
  }

  exp: string = "";
  expTask = 0;
  mode: string = "";
  keyboard: boolean = false;
  mounted() {
    if (this.$refs.cuber instanceof Element) {
      let cuber = this.$refs.cuber;
      cuber.appendChild(this.game.canvas);
      this.resize();
    }
    let storage = window.localStorage;
    this.game.duration = Number(storage.getItem("duration") || 45);
    this.mode = window.localStorage.getItem("mode") || "play";
    this.keyboard = Boolean(window.localStorage.getItem("mode") || false);
    this.angle = Number(window.localStorage.getItem("angle") || 1);
    this.size = Number(window.localStorage.getItem("size") || 2);
    this.game.callbacks.push(this.onTwist);
  }

  onTwist(exp: string) {
    this.exp = exp;
    clearTimeout(this.expTask);
    this.expTask = setTimeout(() => {
      this.exp = "";
    }, 500);
  }

  menu: boolean = false;
  about: boolean = false;
  tune: boolean = false;

  @Watch("keyboard")
  onKeyboardChange() {
    let storage = window.localStorage;
    storage.setItem("keyboard", String(this.keyboard));
    this.game.enable = this.mode == "play" && !this.keyboard;
    this.$nextTick(this.resize);
  }

  @Watch("mode")
  onModeChange(to: string, from: string) {
    let storage = window.localStorage;
    storage.setItem("mode", this.mode);
    this.game.enable = this.mode == "play" && !this.keyboard;
    this.menu = false;
    this.$nextTick(this.resize);
  }

  get lock() {
    return this.game.lock || this.game.twister.length != 0;
  }

  reset() {
    let storage = window.localStorage;
    storage.clear();
    window.location.reload();
  }
}
