import Vue from "vue";
import Component from "vue-class-component";
import Game from "../cube/game";

@Component({
  template: require("./app.html")
})
export default class App extends Vue {
  game: Game = new Game();

  mounted() {
    let cuber = document.querySelector("#cuber");
    if (null != cuber) {
      this.game.attach(cuber);
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
  onModeSelect(mode: string) {
    this.modeDialog = false;
    this.mode = mode;
  }
}
