import Vue from "vue";
import { Component, Prop, Inject } from "vue-property-decorator";
import World from "../../cuber/world";
import Database from "../../database";
import { COLORS } from "../../cuber/define";

@Component({
  template: require("./index.html"),
})
export default class Theme extends Vue {
  @Inject("world")
  world: World;

  @Inject("database")
  database: Database;

  @Prop({ required: true })
  value: boolean;
  get show() {
    return this.value;
  }
  set show(value) {
    this.$emit("input", value);
  }

  width: number = 0;
  height: number = 0;
  size: number = 0;

  colors: { [key: string]: string }
  constructor() {
    super();
    this.colors = COLORS;
  }

  mounted() {
    this.resize();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.size = Math.ceil(Math.min(this.width / 6, this.height / 12));
  }

  colord: boolean = false;
  face: string;
  tap(face: string) {
    this.face = face;
    this.colord = true;
  }

  color(color: string) {
    this.colord = false;
    this.database.theme.color(this.face, color);
    this.database.save();
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
    "#000000",
    "#606060",
    "#A0A0A0",
    "#D0D0D0",
    "#FFFFFF",
  ];

  reset() {
    this.database.theme.reset();
    this.database.save();
  }
}
