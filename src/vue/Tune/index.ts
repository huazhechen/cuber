import Vue from "vue";
import { Component, Inject, Prop } from "vue-property-decorator";
import Context from "../context";
import Preferance from "../../cuber/preferance";
import cuber from "../../cuber";

@Component({
  template: require("./index.html")
})
export default class Tune extends Vue {
  @Inject("context")
  context: Context;

  @Prop({ required: true })
  value: boolean;

  get show() {
    return this.value;
  }

  set show(value) {
    this.$emit("input", value);
  }

  width: number = 0;
  height: number = 0;
  preferance: Preferance;
  constructor() {
    super();
    this.preferance = cuber.preferance;
  }

  mounted() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  reset() {
    this.preferance.scale = 50;
    this.preferance.perspective = 50;
    this.preferance.angle = 63;
    this.preferance.gradient = 67;
    this.preferance.brightness = 80;
  }
}
