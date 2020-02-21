import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { ICONS } from "../../common/icons";
import { COLORS } from "../../common/color";

@Component({
  template: require("./index.html")
})
export default class Icon extends Vue {
  @Prop()
  color: string;
  get fill() {
    let color = (<any>COLORS)[this.color];
    if (color) {
      return color;
    }
    return this.color;
  }

  @Prop()
  size: number;

  @Prop()
  name: string;
  get svg() {
    return (<any>ICONS)[this.name];
  }
}
