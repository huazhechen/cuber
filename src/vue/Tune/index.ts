import Vue from "vue";
import { Component, Inject, Watch, Prop } from "vue-property-decorator";
import Option from "../../common/option";

@Component({
  template: require("./index.html")
})
export default class Tune extends Vue {
  @Inject("option")
  option: Option;

  @Prop({ required: true })
  value: boolean;

  @Watch("value")
  onValueChange(value: boolean) {
    this.$emit("input", value);
  }
}
