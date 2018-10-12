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
    ["L'", "U'", "F'", "F", "U", "R", "L", "D", "B", "B'", "D'", "R'"],
    ["M'", "E", "S'", "S", "E'", "M'", "M", "E", "S'", "S", "E'", "M"],
    ["l'", "u'", "f'", "f", "u", "r", "l", "d", "b", "b'", "d'", "r'"],
    ["x", "y'", "z'", "z", "y", "x", "x'", "y'", "z'", "z", "y", "x'"]
  ];

  get exps() {
    return this.operations[this.layers];
  }

  twist(exp: string) {
    this.game.twister.twist(exp);
  }
}
