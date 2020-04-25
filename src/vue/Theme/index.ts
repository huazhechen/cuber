import Vue from "vue";
import { Component, Prop, Inject } from "vue-property-decorator";
import World from "../../cuber/world";
import { COLORS } from "../../cuber/define";
import { ThemeData } from "../../data";

@Component({
  template: require("./index.html"),
})
export default class Theme extends Vue {
  @Inject("world")
  world: World;

  @Inject("themes")
  data: ThemeData;

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
    this.data.save();
  }

  palette: string[] = [
    // YELLOW
    "#FFD600",
    "#FFFF00",
    "#FFFF8D",
    "#FEFE00",
    "#FDD835",
    "#FFC107",
    // ORANGE
    "#FF6D00",
    "#FFA100",
    "#FB8C00",
    "#F57C00",
    "#EF6C00",
    "#E65100",
    // RED
    "#B71C1C",
    "#FF0000",
    "#EE0000",
    "#DD0000",
    "#CC0000",
    "#BF360C",
    // BLUE
    "#0D47A1",
    "#0000FF",
    "#88DDFF",
    "#03A9F4",
    "#1976D2",
    "#1A237E",
    // GREEN
    "#00A020",
    "#00FF00",
    "#76FF03",
    "#00D800",
    "#00A000",
    "#006600",
    // P
    "#FF4081",
    "#EEE8AA",
    "#FF99FF",
    "#A83DD9",
    "#607D8B",
    "#885500",
    // WB
    "#202020",
    "#505050",
    "#808080",
    "#A0A0A0",
    "#D0D0D0",
    "#F0F0F0",
  ];

  reset(): void {
    this.data.reset();
    this.data.save();
  }
}
