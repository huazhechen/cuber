import Vue from "vue";
import { Component, Inject, Watch, Prop } from "vue-property-decorator";
import Game from "../../cube/game";
import Option from "../../common/option";
import TuneMenu from "../TuneMenu";

@Component({
  template: require("./index.html"),
  components: {
    "tune-menu": TuneMenu
  }
})
export default class AppMenu extends Vue {
  @Inject("game")
  game: Game;

  @Inject("option")
  option: Option;

  @Prop({ required: true })
  value: boolean;

  @Watch("value")
  onValueChange(value: boolean) {
    this.$emit("input", value);
  }

  tune: boolean = false;
  data: boolean = false;

  mode(value: string) {
    this.option.mode = value;
    this.$emit("input", false);
  }
  
  reset() {
    let storage = window.localStorage;
    storage.clear();
    window.location.reload();
  }
}
