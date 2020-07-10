import Vue from "vue";
import { Component, Prop, Inject } from "vue-property-decorator";
import World from "../../../cuber/world";
import { PreferanceData, PaletteData } from "../../../data";

@Component({
  template: require("./index.html"),
})
export default class About extends Vue {
  @Inject("world")
  world: World;

  @Inject("preferance")
  preferance: PreferanceData;

  @Inject("palette")
  palette: PaletteData;

  @Prop({ required: true })
  value: boolean;

  get show(): boolean {
    return this.value;
  }

  set show(value) {
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

  reset(): void {
    window.localStorage.clear();
    window.location.reload();
  }

  clear(): void {
    this.palette.reset();
    this.preferance.reset();
  }

  resetd = false;
  tap(key: string): void {
    switch (key) {
      case "help":
        window.open("https://gitee.com/huazhechen/cuber/blob/master/README.md");
        break;
      case "reset":
        this.resetd = true;
        break;
      default:
        break;
    }
    this.show = false;
  }
}
