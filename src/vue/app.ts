import Vue from "vue";
import Component from "vue-class-component";
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

  drawer: boolean = false;
  onMenuClick() {
    this.drawer = !this.drawer;
  }

  modeDialog: boolean = false;
  onModeClick() {
    this.drawer = false;
    this.modeDialog = true;
  }

  optionDialog: boolean = false;
  onOptionClick() {
    this.drawer = false;
    this.optionDialog = true;
  }

  actionDialog: boolean = false;
  onActionClick() {
    this.drawer = false;
    this.actionDialog = true;
  }

  mode: string = "touch";

  get buttonPanel() {
    return this.mode == "button";
  }

  get scriptPanel() {
    return this.mode == "script";
  }

  onModeSelect(mode: string) {
    this.modeDialog = false;
    this.mode = mode;
    this.$nextTick(this.resize);
  }

  operations: string[] = [
    "L",
    "R",
    "D",
    "U",
    "B",
    "F",
    "l",
    "r",
    "d",
    "u",
    "b",
    "f",
    "M",
    "x",
    "E",
    "y",
    "S",
    "z"
  ];

  toggle_multiple: number[] = [1];

  operate(operation: string) {
    console.log(operation);
    this.game.twist(operation);
  }
}
