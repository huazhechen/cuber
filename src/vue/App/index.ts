import Vue from "vue";
import { Component, Provide, Watch } from "vue-property-decorator";
import Game from "../../cube/game";
import KeyboardPanel from "../KeyboardPanel";
import ScriptPanel from "../ScriptPanel";
import AppMenu from "../AppMenu";
import MoviePanel from "../MoviePanel";
import Option from "../../common/option";

@Component({
  template: require("./index.html"),
  components: {
    "keyboard-panel": KeyboardPanel,
    "script-panel": ScriptPanel,
    "movie-panel": MoviePanel,
    "app-menu": AppMenu
  }
})
export default class App extends Vue {
  @Provide("game")
  game: Game = new Game();

  @Provide("option")
  option: Option = new Option(this.game);

  menu: boolean = false;

  width: number = 0;

  fixed: boolean = false;

  resize() {
    if (this.$refs.cuber instanceof HTMLElement && this.$refs.panel instanceof HTMLElement) {
      let cuber = this.$refs.cuber;
      let panel = this.$refs.panel;
      if (cuber.clientWidth > window.innerWidth) {
        this.$el.style.width = window.innerWidth + "px";
        cuber.style.width = window.innerWidth + "px";
        panel.style.width = window.innerWidth + "px";
        this.$nextTick(this.resize);
        return;
      }
      let width = Math.min(window.innerWidth, this.width);
      if (cuber.clientWidth != width) {
        this.$el.style.width = this.width + "px";
        cuber.style.width = this.width + "px";
        panel.style.width = this.width + "px";
        this.$nextTick(this.resize);
        return;
      }
      let panelHeight = panel.clientHeight;
      let cuberHeight = Math.max(window.innerHeight - panelHeight, 0);
      cuber.style.height = cuberHeight + "px";
      panel.style.position = "fixed";
      panel.style.width = cuber.clientWidth + "px";
      panel.style.bottom = "0px";
      this.game.width = cuber.clientWidth;
      this.game.height = cuberHeight;
      this.game.resize();
      if (!this.fixed) {
        this.fixed = true;
        this.$nextTick(this.resize);
      } else {
        this.fixed = false;
      }
    }
    window.scrollTo(1, 0);
  }

  mounted() {
    if (this.$refs.cuber instanceof Element) {
      let cuber = this.$refs.cuber;
      cuber.appendChild(this.game.canvas);
      this.resize();
    }
    document.onfullscreenchange = () => {
      this.$nextTick(this.resize);
    };

    if (window.innerWidth > window.innerHeight / (4 / 3)) {
      this.width = Math.floor(Math.max(window.innerHeight / (16 / 9), 320));
      this.$el.style.width = this.width + "px";
      this.$nextTick(this.resize);
    } else {
      this.width = window.innerWidth;
    }
  }

  @Watch("option.mode")
  onModeChange(to: string, from: string) {
    this.$nextTick(this.resize);
  }
}
