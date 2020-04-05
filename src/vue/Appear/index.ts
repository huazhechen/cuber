import Vue from "vue";
import { Component, Prop, Inject } from "vue-property-decorator";
import Database from "../../database";
import World from "../../cuber/world";

@Component({
  template: require("./index.html")
})
export default class Appear extends Vue {
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
  constructor() {
    super();
  }

  mounted() {
    this.resize();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.size = Math.ceil(Math.min(this.width / 6, this.height / 12));
  }

  reset() {
    this.database.scale = 50;
    this.database.perspective = 50;
    this.database.angle = 63;
    this.database.gradient = 67;
    this.database.mirror = false;
    this.database.hollow = false;
    this.database.shadow = true;
  }
}
