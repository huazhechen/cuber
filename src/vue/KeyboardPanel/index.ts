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
    ["x", "y", "z", "z", "y", "x", "x'", "y'", "z'", "z'", "y'", "x'"],
    ["M", "E", "S", "S", "M", "E", "M'", "E'", "S'", "S'", "M'", "E'"]
  ];

  get exps() {
    return this.operations[this.layers];
  }

  twist(exp: string) {
    this.game.twister.twist(exp);
  }

  reverse() {
    if (this.game.history.length == 0) {
      return;
    }
    let exp = this.game.history.pop() || "";
    let fast = false;
    console.log(exp);
    if (exp.length > 3) {
      fast = true;
    }
    this.game.twister.twist(exp, true, 1, null, fast, false);
  }

  random() {
    this.game.twister.twist("*", false, 1, null, true);
  }
}
