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

  double: boolean = false;
  reverse: boolean = false;

  operations: string[] = [
    "L",
    "D",
    "B",
    "R",
    "U",
    "F",
    "l",
    "d",
    "b",
    "r",
    "u",
    "f",
    "M",
    "E",
    "S",
    "x",
    "y",
    "z"
  ];

  get suffix() {
    let result: string = "";
    result = result.concat(this.reverse ? "'" : "");
    result = result.concat(this.double ? "2" : "");
    return result;
  }

  twist(operation: string) {
    this.queue.push(operation);
    this.game.twister.twist(operation, false, 1, this.callback, false);
  }

  callback() {
    this.queue.shift();
  }
}
