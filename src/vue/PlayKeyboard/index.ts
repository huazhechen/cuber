import Vue from "vue";
import { Component, Inject } from "vue-property-decorator";
import Cuber from "../../cuber/cuber";
import Option from "../../common/option";

@Component({
  template: require("./index.html")
})
export default class PlayKeyboard extends Vue {
  @Inject("cuber")
  cuber: Cuber;

  @Inject("option")
  option: Option;

  width: number = 0;
  height: number = 0;

  layers: number = 0;
  operations: string[][] = [
    ["L", "D", "B", "F", "U", "R", "L'", "D'", "B'", "F'", "U'", "R'"],
    ["l", "d", "b", "f", "u", "r", "l'", "d'", "b'", "f'", "u'", "r'"],
    ["M", "E", "S", "z", "y", "x", "M'", "E'", "S'", "z'", "y'", "x'"]
  ];

  strips = [
    {},
    { U: [1, 2, 3, 4, 6, 7, 8, 9], F: [1, 2, 3, 4, 6, 7, 9], R: [1, 2, 3, 4, 6, 7, 9], B: [1, 2, 3, 4, 6, 7, 9], L: [1, 2, 3, 4, 6, 7, 9], D: [1, 3, 7, 9] },
    { U: [1, 2, 3, 4, 5, 6, 7, 8, 9], F: [1, 2, 3], R: [1, 2, 3], B: [1, 2, 3], L: [1, 2, 3] }
  ];
  colors: number = 0;
  strip() {
    this.colors = (this.colors + 1) % this.strips.length;
    this.cuber.cube.strip(this.strips[this.colors]);
  }

  get style() {
    return {
      margin: this.height / 48 + "px",
      width: (this.height / 32) * 9 + "px",
      height: (this.height / 32) * 9 + "px",
      "min-width": "0%",
      "min-height": "0%",
      "text-transform": "none"
    };
  }

  get exps() {
    return this.operations[this.layers];
  }

  twist(exp: string) {
    this.cuber.cube.twister.twist(exp);
  }

  reverse() {
    if (this.cuber.cube.history.last == undefined) {
      return;
    }
    this.cuber.cube.twister.twist(this.cuber.cube.history.last.value, true, 1, false);
  }
}
