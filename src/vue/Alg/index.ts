import Vue from "vue";
import { Component, Inject, Watch, Prop } from "vue-property-decorator";
import Capture from "../../cuber/capture";

@Component({
  template: require("./index.html")
})
export default class Alg extends Vue {
  @Prop({ required: true })
  value: boolean;

  @Watch("value")
  onValueChange(value: boolean) {
    this.$emit("input", value);
  }

  capture: Capture = new Capture();
  blobs: Blob[] = [];
  algs = require("../../common/algs.json");

  mounted() {
    this.loop();
  }

  loop() {
    requestAnimationFrame(this.loop.bind(this));
    if (!this.value) {
      return;
    }
    let idx = this.blobs.length;
    if (idx < 119) {
      let gdx = 0;
      while (idx >= this.algs[gdx].algs.length) {
        idx = idx - this.algs[gdx].algs.length;
        gdx++;
      }
      this.blobs.push(this.capture.snap(this.algs[gdx].strips, this.algs[gdx].algs[idx].alg));
    }
  }
}
