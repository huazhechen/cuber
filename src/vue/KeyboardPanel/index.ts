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
    ["L'", "U'", "B", "B'", "U", "R", "L", "F'", "D", "D'", "F", "R'"],
    ["M'", "E", "S'", "S", "E'", "M'", "M", "S'", "E", "E'", "S", "M"],
    ["l'", "u'", "b", "b'", "u", "r", "l", "f'", "d", "d'", "f", "r'"],
    ["x", "y'", "z'", "z", "y", "x", "x'", "z'", "y'", "y", "z", "x'"]
  ];

  get exps() {
    return this.operations[this.layers];
  }

  twist(exp: string) {
    this.game.twister.twist(exp);
  }
}
