import Vue from "vue";
import { Component, Inject, Watch, Prop } from "vue-property-decorator";
import Game from "../../cube/game";
import Database from "../../common/Database";
import TuneMenu from "../TuneMenu";
import DeveloperMenu from "../DeveloperMenu";

@Component({
  template: require("./index.html"),
  components: {
    "tune-menu": TuneMenu,
    "developer-menu": DeveloperMenu
  }
})
export default class AppMenu extends Vue {
  @Inject("game")
  game: Game;

  @Inject("database")
  database: Database;

  @Prop({ required: true })
  value: boolean;

  @Watch("value")
  onValueChange(value: boolean) {
    this.$emit("input", value);
  }

  tune: boolean = false;
  developer: boolean = false;

  mode(value: string) {
    this.database.option.mode = value;
    this.$emit("input", false);
  }

  png() {
    let content = this.game.canvas.toDataURL("image/png");
    let parts = content.split(";base64,");
    let type = parts[0].split(":")[1];
    let raw = window.atob(parts[1]);
    let length = raw.length;
    let data = new Uint8Array(length);
    for (let i = 0; i < length; ++i) {
      data[i] = raw.charCodeAt(i);
    }
    let blob = new Blob([data], { type: type });

    let link = document.createElement("a");
    let evt = document.createEvent("MouseEvents");
    evt.initEvent("click", false, false);
    link.download = "cuber.png";
    link.href = URL.createObjectURL(blob);
    link.dispatchEvent(evt);
  }

  snackbar: boolean = false;

  unfinished() {
    this.snackbar = true;
  }
}
