import { Component, Prop, Inject, Vue } from "vue-facing-decorator";
import template from "./index.html?raw";
import World from "../../../cuber/world";
import { PreferanceData, PaletteData } from "../../../data";

@Component({
  template,
})
export default class About extends Vue {
  @Inject({ from: "world" })
  world: World;

  @Inject({ from: "preferance" })
  preferance: PreferanceData;

  @Inject({ from: "palette" })
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
    window.addEventListener("resize", () => this.resize());
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
        this.show = false;
        break;
      case "reset":
        this.resetd = true;
        break;
      default:
        break;
    }
  }
}
