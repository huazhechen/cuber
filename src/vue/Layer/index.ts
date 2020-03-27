import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import cuber from "../../cuber";

@Component({
  template: require("./index.html"),
  components: {}
})
export default class Layer extends Vue {
  @Prop({ required: true })
  value: boolean;

  get show() {
    return this.value;
  }

  set show(value) {
    this.$emit("input", value);
  }

  @Prop({ required: false })
  callback: Function | undefined;

  width: number = 0;
  height: number = 0;
  size: number = 0;
  constructor() {
    super();
  }

  mounted() {
    this.resize();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.size = Math.ceil(Math.min(this.width / 6, this.height / 12)) * 0.95;
  }

  tap(index: number) {
    if (cuber.preferance.order != index) {
      cuber.preferance.order = index;
      if (this.callback) {
        this.callback();
      }
    }
    this.show = false;
  }
}
