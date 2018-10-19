import Vue from "vue";
import { Component, Provide, Watch } from "vue-property-decorator";
import Game from "../../cube/game";
import KeyboardPanel from "../KeyboardPanel";
import ScriptPanel from "../ScriptPanel";
import TimerPanel from "../TimerPanel";
import Option from "../Option"
import AppMenu from "../AppMenu";
import CoursePanel from "../CoursePanel";

@Component({
  template: require("./index.html"),
  components: {
    "keyboard-panel": KeyboardPanel,
    "course-panel": CoursePanel,
    "script-panel": ScriptPanel,
    "timer-panel": TimerPanel,
    "app-menu": AppMenu
  }
})
export default class App extends Vue {
  @Provide("game")
  game: Game = new Game();

  @Provide("option")
  option: Option = new Option(this.game);

  menu: boolean = false;

  @Watch("option.speed")
  onSpeedChange() {
    this.game.twister.twist("R", false, 1, () => { this.game.twister.twist("R", true, 1, null, true) }, false);
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
      this.game.width = cuber.clientWidth;
      this.game.height = cuberHeight;
      this.game.resize();
    }
  }

  exp: string = "";
  task = 0;

  mounted() {
    if (this.$refs.cuber instanceof Element) {
      let cuber = this.$refs.cuber;
      cuber.appendChild(this.game.canvas);
      this.resize();
    }
    this.game.callbacks.push(this.onTwist);
  }

  onTwist(exp: string) {
    this.exp = exp;
    clearTimeout(this.task);
    this.task = setTimeout(() => {
      this.exp = "";
    }, 500);
  }

  @Watch("option.mode")
  onModeChange(to: string, from: string) {
    this.$nextTick(this.resize);
  }

  @Watch("option.keyboard")
  onKeyboardChange(to: string, from: string) {
    this.$nextTick(this.resize);
  }
}
