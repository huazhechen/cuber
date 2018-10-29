import Vue from "vue";
import { Component, Provide, Watch } from "vue-property-decorator";
import Game from "../../cube/game";
import KeyboardPanel from "../KeyboardPanel";
import ScriptPanel from "../ScriptPanel";
import AppMenu from "../AppMenu";
import CoursePanel from "../CoursePanel";
import Database from "../../common/Database";

@Component({
  template: require("./index.html"),
  components: {
    "keyboard-panel": KeyboardPanel,
    "course-panel": CoursePanel,
    "script-panel": ScriptPanel,
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
    let body = document.getElementsByTagName("body")[0];
    if (body.clientHeight / body.clientWidth < 4 / 3) {
      this.width = body.clientHeight / (16 / 9) + "px";
      body.style.width = this.width;
      this.$nextTick(this.resize);
      return;
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

  @Watch("database.option.mode")
  onModeChange(to: string, from: string) {
    this.$nextTick(this.resize);
  }

  @Watch("database.option.keyboard")
  onKeyboardChange(to: string, from: string) {
    this.$nextTick(this.resize);
  }
}
