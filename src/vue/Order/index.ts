import Vue from "vue";
import { Component, Prop, Inject } from "vue-property-decorator";
import World from "../../cuber/world";
import Database from "../../database";

@Component({
  template: require("./index.html"),
})
export default class Order extends Vue {
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

  order(order: number): void {
    if (this.world.order != order) {
      this.world.order = order;
      this.database.preferance.refresh();
      this.$emit("order");
      this.show = false;
    }
  }
}
