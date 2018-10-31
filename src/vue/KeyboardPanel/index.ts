import Vue from "vue";
import { Component, Inject, Prop } from "vue-property-decorator";
import Game from "../../cube/game";
import Database from "../../common/database";

@Component({
  template: require("./index.html")
})
export default class KeyboardPanel extends Vue {
  @Inject("game")
  game: Game;

  @Inject("database")
  database: Database;

  @Prop({ default: false })
  show: boolean;

  layers: number = 0;

  operations: string[][] = [
    ["L", "D", "B", "F", "U", "R", "L'", "D'", "B'", "F'", "U'", "R'"],
    ["M", "E", "S'", "S", "E'", "M'", "M'", "E'", "S", "S'", "E", "M"],
    ["l", "d", "b", "f", "u", "r", "l'", "d'", "b'", "f'", "u'", "r'"],
    ["x'", "y'", "z'", "z", "y", "x", "x", "y", "z", "z'", "y'", "x'"]
  ];

  get exps() {
    return this.operations[this.layers];
  }

  twist(exp: string) {
    this.game.twister.twist(exp);
    this.layers = 0;
  }
}
