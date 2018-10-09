import Vue from "vue";
import { Component, Inject, Prop } from "vue-property-decorator";
import Game from "../../cube/game";

@Component({
  template: require("./index.html")
})
export default class KeyboardPanel extends Vue {
  @Inject("game")
  game: Game;

  @Prop({ default: false })
  show: boolean;

  double: boolean = false;
  reverse: boolean = false;

  operations: string[] = [
    "L",
    "D",
    "B",
    "R",
    "U",
    "F",
    "M",
    "E",
    "S",
    "x",
    "y",
    "z"
  ];

  get exps() {
    let exps: string[] = [];
    for (let i = 0; i < this.operations.length; i++) {
      let exp: string = this.operations[i];
      if (i < 6 && this.double) {
        exp = exp.toLowerCase();
      }
      exp = exp.concat(this.reverse ? "'" : "");
      exps.push(exp);
    }
    return exps;
  }

  twist(exp: string) {
    this.game.twister.twist(exp);
  }
}
