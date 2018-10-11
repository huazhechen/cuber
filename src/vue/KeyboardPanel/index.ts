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

  layers: number = 0;

  operations: string[][] = [
    ["L'", "B", "U'", "U", "B'", "R", "L", "D", "F'", "F", "D'", "R'"],
    ["M'", "S'", "E", "E'", "S", "M'", "M", "E", "S'", "S", "E'", "M"],
    ["l'", "b", "u'", "u", "b'", "r", "l", "d", "f'", "f", "d'", "r'"],
    ["x", "z'", "y'", "y", "z", "x", "x'", "y'", "z'", "z", "y", "x'"]
  ];

  get exps() {
    return this.operations[this.layers];
  }

  twist(exp: string) {
    this.game.twister.twist(exp);
  }
}
