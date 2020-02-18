import Vue from "vue";
import { Component, Inject, Watch, Prop } from "vue-property-decorator";
import Context from "../../common/context";

@Component({
  template: require("./index.html")
})
export default class Tune extends Vue {
  @Inject("context")
  context: Context;

  @Prop({ required: true })
  value: boolean;

  @Watch("value")
  onValueChange(value: boolean) {
    this.$emit("input", value);
  }
}
