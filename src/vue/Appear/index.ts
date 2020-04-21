import Vue from "vue";
import { Component, Prop, Inject } from "vue-property-decorator";
import Database from "../../database";
import World from "../../cuber/world";

@Component({
  template: require("./index.html"),
})
export default class Appear extends Vue {
  @Inject("world")
  world: World;
  @Inject("database")
  database: Database;

  @Prop({ required: true })
  value: boolean;

  get show(): boolean {
    return this.value;
  }

  set show(value) {
    if (!value) {
      this.database.preferance.save();
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
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.size = Math.ceil(Math.min(this.width / 6, this.height / 12));
  }

  reset(): void {
    this.database.preferance.scale = 50;
    this.database.preferance.perspective = 50;
    this.database.preferance.angle = 60;
    this.database.preferance.gradient = 65;
    this.database.preferance.mirror = false;
    this.database.preferance.hollow = false;
    this.database.preferance.shadow = true;
  }
}
