import Vue from "vue";
import { Component, Provide, Watch } from "vue-property-decorator";
import Game from "../../cube/game";
import KeyboardPanel from "../KeyboardPanel";
import ScriptPanel from "../ScriptPanel";
import AppMenu from "../AppMenu";
import TimerPanel from "../TimerPanel";
import Database from "../../common/Database";
import { FACES } from "../../cube/cubelet";

@Component({
  template: require("./index.html"),
  components: {
    "keyboard-panel": KeyboardPanel,
    "script-panel": ScriptPanel,
    "timer-panel": TimerPanel,
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
    this.game.controller.taps.push(this.onTap);
  }

  onTap(index: number, face: number) {
    console.log(FACES[this.game.cube.cubelets[index].getColor(face)])
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
