import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import Preferance from "../../cuber/preferance";
import cuber from "../../cuber";

@Component({
  template: require("./index.html")
})
export default class Appear extends Vue {
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
  size: number = 0;
  preferance: Preferance;
  constructor() {
    super();
    this.preferance = cuber.preferance;
  }

  mounted() {
    this.resize();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.size = Math.ceil(Math.min(this.width / 6, this.height / 12));
  }

  reset() {
    this.preferance.scale = 50;
    this.preferance.perspective = 50;
    this.preferance.angle = 63;
    this.preferance.gradient = 67;
    this.preferance.mirror = false;
    this.preferance.hollow = false;
    this.preferance.shadow = true;
  }
}
