import Vue from "vue";
import { Component, Provide, Watch } from "vue-property-decorator";
import Game from "../../cube/game";
import KeyboardPanel from "../KeyboardPanel";
import ScriptPanel from "../ScriptPanel";
import AppMenu from "../AppMenu";
import MoviePanel from "../MoviePanel";
import Database from "../../common/Database";
import { FACES } from "../../cube/cubelet";

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

  @Provide("database")
  database: Database = new Database(this.game);

  menu: boolean = false;

  @Watch("database.option.speed")
  onSpeedChange() {
    this.game.twister.twist("UU'");
  }

  width: string = "100%";

  resize() {
    let el = this.$el;
    if (window.innerWidth > window.innerHeight / (4 / 3)) {
      if (this.width == "100%") {
        this.width = window.innerHeight / (16 / 9) + "px";
        el.style.width = this.width;
        this.$nextTick(this.resize);
        console.log("limit");
        return;
      }
    } else {
      if (this.width != "100%") {
        this.width = "100%";
        el.style.width = this.width;
        this.$nextTick(this.resize);
        console.log("100%");
        return;
      }
    }

    if (this.$refs.cuber instanceof HTMLElement && this.$refs.panel instanceof HTMLElement) {
      let cuber = this.$refs.cuber;
      let panel = this.$refs.panel;
      let panelHeight = panel.clientHeight;
      let cuberHeight = window.innerHeight - panelHeight;
      this.game.width = cuber.clientWidth;
      this.game.height = cuberHeight;
      this.game.resize();
    }
  }

  mounted() {
    if (this.$refs.cuber instanceof Element) {
      let cuber = this.$refs.cuber;
      cuber.appendChild(this.game.canvas);
      this.resize();
    }
  }

  @Watch("database.option.mode")
  onModeChange(to: string, from: string) {
    this.$nextTick(this.resize);
  }

  @Watch("database.option.keyboard")
  onKeyboardChange(to: string, from: string) {
    this.$nextTick(this.resize);
  }
}
