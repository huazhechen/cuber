import Vue from "vue";
import { Component, Inject, Watch, Prop } from "vue-property-decorator";
import Game from "../../cube/game";
import Option from "../Option"

@Component({
  template: require("./index.html")
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
}
