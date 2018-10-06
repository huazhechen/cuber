import Vue from "vue";
import { Component, Watch, Provide } from "vue-property-decorator";
import KeyboardPanel from "../KeyboardPanel";
import ScriptPanel from "../ScriptPanel";
import Game from "../../cube/game";

@Component({
  template: require("./index.html"),
  components: {
    "keyboard-panel": KeyboardPanel,
    "script-panel": ScriptPanel
  }
})
export default class App extends Vue {
  @Provide("app")
  app: App = this;

  game: Game = new Game();

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
  mounted() {
    if (this.$refs.cuber instanceof Element) {
      let cuber = this.$refs.cuber;
      cuber.appendChild(this.game.canvas);
      this.resize();
    }
    let storage = window.localStorage;
    this.game.duration = Number(storage.getItem("duration") || 30);
    this.mode = storage.getItem("mode") || "touch";
    this.game.controller.addCallback((exp: string) => {
      this.exp = exp;
      clearTimeout(this.expTask);
      this.expTask = setTimeout(() => {
        this.exp = "";
      }, 500);
    });
  }

  menu: boolean = false;
  onMenuClick() {
    this.menu = !this.menu;
  }

  mode: string = "touch";

  @Watch("mode")
  onModeChange(to: string, from: string) {
    let storage = window.localStorage;
    storage.setItem("mode", this.mode);
    if (from != "touch" && to == "touch") {
      this.game.enable = true;
    }
    if (from == "touch" && to != "touch") {
      this.game.enable = false;
    }
    this.$nextTick(this.resize);
  }

  get lock() {
    return this.game.lock || this.game.twister.length != 0;
  }
}
