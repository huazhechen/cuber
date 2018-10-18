import Vue from "vue";
import { Component, Inject, Watch, Prop } from "vue-property-decorator";
import Game from "../../cube/game";
import Option from "../Option"
import TuneMenu from "../TuneMenu";
import ToolMenu from "../ToolMenu";

@Component({
  template: require("./index.html"),
  components: {
    "tune-menu": TuneMenu,
    "tool-menu": ToolMenu
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
    this.$emit('input', value)
  }

  mode(value: string) {
    this.option.mode = value;
    this.$emit('input', false);
  }

  tune: boolean = false;
  tool: boolean = false;
}
