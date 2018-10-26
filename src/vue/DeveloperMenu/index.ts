import Vue from "vue";
import { Component, Inject, Watch, Prop } from "vue-property-decorator";
import Game from "../../cube/game";
import Database from "../../common/Database";
import TuneMenu from "../TuneMenu";

@Component({
  template: require("./index.html"),
  components: {
    "tune-menu": TuneMenu
  }
})
export default class DeveloperMenu extends Vue {
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

  reset() {
    let storage = window.localStorage;
    storage.clear();
    window.location.reload();
  }

  code() {
    window.open("https://gitee.com/huazhechen/cuber");
  }

  download() {
    let blob = new Blob([JSON.stringify(this.database, null, 2)], { type: "json" });

    let link = document.createElement("a");
    let evt = document.createEvent("MouseEvents");
    evt.initEvent("click", false, false);
    link.download = "data.json";
    link.href = URL.createObjectURL(blob);
    link.dispatchEvent(evt);
  }

  upload() {
    let input = document.createElement('input');
    input.setAttribute('type', 'file');
    let evt = document.createEvent("MouseEvents");
    evt.initEvent("click", false, false);
    input.dispatchEvent(evt);
    input.onchange = () => {
      if (input! instanceof HTMLFormElement) {
        return;
      }
      if (input.files == null) {
        return;
      }
      var reader = new FileReader();
      reader.onload = () => {
        let text = reader.result;
        if (text == null || text instanceof ArrayBuffer) {
          return;
        }
        this.database.load(text);
      }
      reader.readAsText(input.files[0]);
    };
  }
}
