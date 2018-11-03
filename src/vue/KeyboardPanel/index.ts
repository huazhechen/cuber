import Vue from "vue";
import { Component, Inject, Prop } from "vue-property-decorator";
import Game from "../../cube/game";
import Option from "../../common/option";

@Component({
  template: require("./index.html")
})
export default class KeyboardPanel extends Vue {
  @Inject("game")
  game: Game;

  @Inject("option")
  option: Option;

  @Prop({ default: false })
  show: boolean;

  layers: number = 0;

  operations: string[][] = [
    ["L", "D", "B", "F", "U", "R", "L'", "D'", "B'", "F'", "U'", "R'"],
    ["l", "d", "b", "f", "u", "r", "l'", "d'", "b'", "f'", "u'", "r'"],
    ["M", "E", "S'", "z", "y", "x", "M'", "E'", "S", "z'", "y'", "x'"]
  ];

  get exps() {
    return this.operations[this.layers];
  }

  twist(exp: string) {
    this.game.twister.twist(exp);
    this.layers = 0;
  }
}
