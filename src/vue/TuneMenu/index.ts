import Vue from "vue";
import { Component, Inject, Watch, Prop } from "vue-property-decorator";
import Game from "../../cube/game";
import Option from "../../common/option";

@Component({
  template: require("./index.html")
})
export default class AppMenu extends Vue {
  @Inject("game")
  game: Game;

  @Inject("option")
  option: Option;

  @Prop({ default: "100%" })
  width: string;

  @Prop({ required: true })
  value: boolean;

  @Watch("value")
  onValueChange(value: boolean) {
    this.$emit("input", value);
  }

  demo() {
    this.game.twister.twist("UU'");
  }
}
