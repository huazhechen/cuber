import Vue from "vue";
import { Component, Inject } from "vue-property-decorator";
import Cuber from "../../cuber/cuber";
import Option from "../../common/option";
import { FACES } from "../../common/define";

@Component({
  template: require("./index.html")
})
export default class Keyboard extends Vue {
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
    [{ indexes: [], faces: [] }],
    [{ indexes: [0, 2, 3, 5, 6, 7, 8, 15, 17, 18, 20, 21, 23, 24, 25, 26], faces: [0, 1, 2, 3, 4, 5] }],
    [{ indexes: [6, 7, 8, 15, 16, 17, 24, 25, 26], faces: [0, 1, 2, 3, 4, 5] }]
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
