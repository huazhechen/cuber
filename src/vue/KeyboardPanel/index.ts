import Vue from "vue";
import { Component, Prop, Inject } from "vue-property-decorator";
import App from "../App";
import Game from "../../cube/game";

@Component({
  template: require("./index.html")
})
export default class KeyboardPanel extends Vue {
  queue: string[] = [];

  @Inject("game")
  game: Game;

  @Prop({ default: false })
  show: boolean;

  twice: boolean = false;
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
      exp = exp.concat(this.twice ? "2" : "");
      exps.push(exp);
    }
    return exps;
  }

  twist(exp: string) {
    this.queue.push(exp);
    this.game.twister.twist(exp, false, 1, this.callback, false);
  }

  callback() {
    this.queue.shift();
  }
}
