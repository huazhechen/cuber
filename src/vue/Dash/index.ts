import Vue from "vue";
import { Component, Inject, Prop } from "vue-property-decorator";
import Tune from "../Tune";
import Context from "../context";

@Component({
  template: require("./index.html"),
  components: {
    tune: Tune
  }
})
export default class Dash extends Vue {
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
  constructor() {
    super();
  }
  mounted() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  tune: boolean = false;
  resetd: boolean = false;

  reset() {
    let storage = window.localStorage;
    storage.clear();
    window.location.reload();
  }

  tap(key: string) {
    switch (key) {
      case "playground":
        this.context.mode = 0;
        break;
      case "algs":
        this.context.mode = 1;
        break;
      case "director":
        this.context.mode = 2;
        break;
      case "tune":
        this.tune = true;
        break;
      case "code":
        window.location.href = "https://gitee.com/huazhechen/cuber";
        break;
      default:
        break;
    }
    this.$emit("input", false);
  }
}
