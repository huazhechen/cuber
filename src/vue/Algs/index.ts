import Vue from "vue";
import { Component, Inject, Prop } from "vue-property-decorator";
import Tune from "../Tune";
import Context from "../context";
import Player from "../Player";
import { Panel } from "../panel";

@Component({
  template: require("./index.html"),
  components: {
    tune: Tune
  }
})
export default class Algs extends Vue implements Panel {
  @Inject("context")
  context: Context;

  resize() {}
  loop() {
    this.context.pics.some((group, idx) => {
      if (this.context.algs[idx].algs.length == group.length) {
        return false;
      }
      let save = window.localStorage.getItem("algs.exp." + this.context.algs[idx].algs[group.length].name);
      let origin = this.context.algs[idx].algs[group.length].default;
      let exp = save ? save : origin;
      this.context.algs[idx].algs[group.length].exp = exp;
      group.push(this.context.capture.snap(this.context.algs[idx].strip, exp));
      return true;
    });
  }

  tab = null;
  width: number = 0;
  height: number = 0;
  constructor() {
    super();
  }
  mounted() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  tap(i: number, j: number) {
    (<Player>this.context.panels[1]).index = { group: i, index: j };
    this.context.mode = 1;
  }
}
