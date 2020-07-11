import Vue from "vue";
import { Component, Prop, Inject } from "vue-property-decorator";
import World from "../../../cuber/world";
import { COLORS } from "../../../cuber/define";
import { PaletteData } from "../../../data";

@Component({
  template: require("./index.html"),
})
export default class Palette extends Vue {
  @Inject("world")
  world: World;

  @Inject("palette")
  data: PaletteData;

  @Prop({ required: true })
  value: boolean;
  get show(): boolean {
    return this.value;
  }
  set show(value) {
    if (!value) {
      this.data.save();
    }
    this.$emit("input", value);
  }

  width = 0;
  height = 0;
  size = 0;

  colors: { [key: string]: string };
  constructor() {
    super();
    this.colors = COLORS;
  }

  mounted(): void {
    this.resize();
  }

  resize(): void {
    this.width = document.documentElement.clientWidth;
    this.height = document.documentElement.clientHeight;
    this.size = Math.ceil(Math.min(this.width / 6, this.height / 12));
  }

  colord = false;
  face: string;
  tap(face: string): void {
    this.face = face;
    this.colord = true;
  }

  color(color: string): void {
    this.colord = false;
    this.data.color(this.face, color);
  }

  palette: string[] = [
    // DEFAULT
    "#B71C1C",
    "#FF6D00",
    "#0D47A1",
    "#00A020",
    "#FFD600",
    "#F8F8F8",
    // DARK
    "#A81010",
    "#E85B00",
    "#1A237E",
    "#004D40",
    "#E8C000",
    "#D0D0D0",
    // NORMAL
    "#FF0000",
    "#FFA100",
    "#0000FF",
    "#00FF00",
    "#FFFF00",
    "#A0A0A0",
    // LIGHT
    "#FF6060",
    "#FFCC80",
    "#18FFFF",
    "#B2FF59",
    "#FFFF8D",
    "#808080",
    // MACAROON
    "#F8BBD0",
    "#FFAB91",
    "#B2EBF2",
    "#B9F6CA",
    "#FFF59D",
    "#505050",
    // OTHER
    "#A83DD9",
    "#FF99FF",
    "#607D8B",
    "#885500",
    "#EEE8AA",
    "#202020",
  ];
}
