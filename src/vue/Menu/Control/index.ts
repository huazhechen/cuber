import Vue from "vue";
import { Component, Prop, Inject } from "vue-property-decorator";
import World from "../../../cuber/world";
import { PreferanceData } from "../../../data";

@Component({
  template: require("./index.html"),
})
export default class Control extends Vue {
  @Inject("world")
  world: World;

  @Inject("preferance")
  preferance: PreferanceData;

  @Prop({ required: true })
  value: boolean;
  get show(): boolean {
    return this.value;
  }
  set show(value) {
    if (!value) {
      this.preferance.save();
    }
    this.$emit("input", value);
  }

  width = 0;
  height = 0;
  size = 0;
  constructor() {
    super();
  }

  mounted(): void {
    this.resize();
  }

  resize(): void {
    this.width = document.documentElement.clientWidth;
    this.height = document.documentElement.clientHeight;
    this.size = Math.ceil(Math.min(this.width / 6, this.height / 12));
  }
}
