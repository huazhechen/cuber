import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";

@Component({
  template: require("./index.html")
})
export default class FastButton extends Vue {
  @Prop({ default: false })
  disabled: boolean;

  @Prop({ default: false })
  ripple: boolean;

  @Prop({ default: false })
  flat: boolean;

  @Prop({ default: false })
  block: boolean;

  @Prop({ default: false })
  icon: boolean;

  @Prop({ default: false })
  large: boolean;

  @Prop({ default: false })
  outline: boolean;

  @Prop({ default: false })
  color: string;

  @Prop({ default: false })
  fixed: boolean;

  @Prop({ default: false })
  top: boolean;

  @Prop({ default: false })
  bottom: boolean;
  @Prop({ default: false })
  left: boolean;

  @Prop({ default: false })
  right: boolean;

  @Prop({ default: false })
  depressed: boolean;

  @Prop({ default: false })
  fab: boolean;
}
