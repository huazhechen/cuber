import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { ICONS } from "../../common/icons";
import Color from "../../common/color";

@Component({
  template: require("./index.html")
})
export default class Icon extends Vue {
  @Prop({ required: true })
  color: string;
  get fill() {
    let color = (<any>Color.COLORS)[this.color];
    if (color) {
      return color;
    }
    return this.color;
  }

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  name: string;
  get svg() {
    return (<any>ICONS)[this.name];
  }
}
