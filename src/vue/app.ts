import { Component, Vue, Watch } from "vue-property-decorator";
import Game from "../cube/game";

@Component({
  template: require("./app.html")
})
export default class App extends Vue {
  game: Game = new Game();

  resize() {
    if (
      this.$refs.view instanceof Element &&
      this.$refs.cuber instanceof Element &&
      this.$refs.panel instanceof Element
    ) {
      let view = this.$refs.view;
      let cuber = this.$refs.cuber;
      let panel = this.$refs.panel;
      let viewHeight = view.clientHeight;
      let panelHeight = panel.clientHeight;
      let cuberHeight = viewHeight - panelHeight;
      this.game.resize(cuber.clientWidth, cuberHeight);
    }
  }

  mounted() {
    if (this.$refs.cuber instanceof Element) {
      let cuber = this.$refs.cuber;
      this.resize();
      cuber.appendChild(this.game.canvas);
    }
  }

  menu: boolean = false;
  onMenuClick() {
    this.menu = !this.menu;
  }

  mode: string = "touch";

  @Watch("mode")
  onModeChange(to: string, from: string) {
    if (from != "touch" && to == "touch") {
      this.game.controller.enable();
    }
    if (from == "touch" && to != "touch") {
      this.game.controller.disable();
    }
    this.$nextTick(this.resize);
  }

  shift: string[] = [];
  operations: string[] = [
    "L",
    "D",
    "B",
    "R",
    "U",
    "F",
    "l",
    "d",
    "b",
    "r",
    "u",
    "f",
    "M",
    "E",
    "S",
    "x",
    "y",
    "z"
  ];

  get suffix() {
    let result: string = "";
    result = result.concat(this.shift.indexOf("reverse") == -1 ? "" : "'");
    result = result.concat(this.shift.indexOf("double") == -1 ? "" : "2");
    return result;
  }

  script: string =
    "(RUR'U')(RUR'U')(RUR'U')(RUR'U')(RUR'U')(RUR'U')(RUR'U')(RUR'U')(RUR'U')(RUR'U')(RUR'U')(RUR'U')";
  progress: number = 0;

  operate(operation: string) {
    this.game.twist(operation);
  }

  reset() {
    this.game.reset();
  }
}
