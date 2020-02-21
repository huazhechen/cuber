import Vue from "vue";
import { Component, Inject, Watch, Prop } from "vue-property-decorator";
import Tune from "../Tune";
import Preferance from "../../cuber/preferance";
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

  @Watch("value")
  onValueChange(value: boolean) {
    this.$emit("input", value);
  }

  tune: boolean = false;

  mode(value: number) {
    this.context.mode = value;
    this.$emit("input", false);
  }

  reset() {
    let storage = window.localStorage;
    storage.clear();
    window.location.reload();
  }
}
