import Vue from "vue";
import { Component, Inject, Prop, Watch } from "vue-property-decorator";
import Cuber from "../../cuber/cuber";
import Option from "../../common/option";

@Component({
  template: require("./index.html")
})
export default class Keyboard extends Vue {
  @Inject("cuber")
  cuber: Cuber;

  @Inject("option")
  option: Option;

  layers: number = 0;
  width: number = 0;
  height: number = 0;

  operations: string[][] = [
    ["L", "D", "B", "F", "U", "R", "L'", "D'", "B'", "F'", "U'", "R'"],
    ["l", "d", "b", "f", "u", "r", "l'", "d'", "b'", "f'", "u'", "r'"],
    ["M", "E", "S", "z", "y", "x", "M'", "E'", "S'", "z'", "y'", "x'"]
  ];

  get exps() {
    return this.operations[this.layers];
  }

  twist(exp: string) {
    this.cuber.twister.twist(exp);
  }

  reverse() {
    if (this.cuber.history.last == undefined) {
      return;
    }
    this.cuber.twister.twist(this.cuber.history.last.value, true, 1, false);
  }
}
