import Vue from "vue";
import { Component, Inject, Prop, Watch } from "vue-property-decorator";
import Tune from "../Tune";
import Context from "../context";
import Preferance from "../../cuber/preferance";

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
  preferance: Preferance;
  constructor() {
    super();
    this.preferance = this.context.cuber.preferance;
    this.context.cuber.cube.twister.callbacks.push(this.demo);
  }

  @Watch("value")
  onValueChange(value: boolean) {
    if (value) {
      this.demo();
    }
    else {
      this.context.cuber.cube.twister.finish();
    }
  }


  demo = () => {
    if (this.value) {
      this.context.cuber.cube.twister.twist("RR'-UU'-FF'-");
    }
  }

  mounted() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }
}
