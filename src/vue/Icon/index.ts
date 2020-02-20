import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { colors } from "../../common/define";
import { ICONS } from "../../common/icons";

@Component({
  template: require("./index.html")
})
export default class Icon extends Vue {
  @Prop({ required: false })
  color: string = "#FFFFFF";
  get fill() {
    let color = (<any>colors)[this.color];
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
