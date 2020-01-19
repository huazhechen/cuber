import Vue from "vue";
import { Component, Watch, Inject } from "vue-property-decorator";
import Capture from "../../cuber/capture";
import Option from "../../common/option";

@Component({
  template: require("./index.html")
})
export default class Alg extends Vue {
  @Inject("option")
  option: Option;

  tab = null;

  capture: Capture = new Capture();
  pics: string[][] = [];
  algs = require("./algs.json");

  mounted() {
    for (let i = 0; i < this.algs.length; i++) {
      this.pics.push([]);
    }
    this.loop();
  }

  loop() {
    if (this.option.page == "alg") {
      let ret = this.pics.some((group, idx) => {
        if (this.algs[idx].algs.length == group.length) {
          return false;
        }
        group.push(this.capture.snap(this.algs[idx].strips, this.algs[idx].algs[group.length].exp));
        return true;
      });
      if (!ret) {
        return;
      }
    }
    requestAnimationFrame(this.loop.bind(this));
  }
}
