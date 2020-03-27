import Vue from "vue";
import { Component, Inject, Prop } from "vue-property-decorator";
import Tune from "../Tune";
import Context from "../context";
import Player1 from "../Player1";
import { Panel } from "../panel";
import cuber from "../../cuber";

@Component({
  template: require("./index.html"),
  components: {
    tune: Tune
  }
})
export default class Algs extends Vue implements Panel {
  @Inject("context")
  context: Context;

  capture() {
    this.context.pics.some((group, idx) => {
      if (this.context.algs[idx].algs.length == group.length) {
        return false;
      }
      let save = window.localStorage.getItem("algs.exp." + this.context.algs[idx].algs[group.length].name);
      let origin = this.context.algs[idx].algs[group.length].default;
      let exp = save ? save : origin;
      this.context.algs[idx].algs[group.length].exp = exp;
      group.push(cuber.capture.snap(this.context.algs[idx].strip, exp));
      return true;
    });
  }
  loop() {
    for (let i = 0; i < 4; i++) {
      this.capture();
    }
  }

  tab = null;
  width: number = 0;
  height: number = 0;
  resize(width: number, height: number) {
    let size = Math.ceil(Math.min(width / 8.6, height / 14));
    this.width = size * 8;
    this.height = height;
  }

  constructor() {
    super();
  }
  mounted() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  tap(i: number, j: number) {
    (<Player1>this.context.panels[1]).index = { group: i, index: j };
    this.context.mode = 1;
  }
}
