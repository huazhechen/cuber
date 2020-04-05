import Vue from "vue";
import { Component, Prop, Inject } from "vue-property-decorator";
import World from "../../cuber/world";
import Database from "../../database";

@Component({
  template: require("./index.html")
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
}
