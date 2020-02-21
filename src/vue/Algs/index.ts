import Vue from "vue";
import { Component, Inject, Prop } from "vue-property-decorator";
import Tune from "../Tune";
import Context from "../context";
import Player from "../Player";

@Component({
  template: require("./index.html"),
  components: {
    tune: Tune
  }
})
export default class Algs extends Vue {
  @Inject("context")
  context: Context;

  tab = null;
  algs = require("./algs.json");
  width: number = 0;
  height: number = 0;
  constructor() {
    super();
  }
  mounted() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  tap(i: number, j: number) {
    (<Player>this.context.panels[1]).index = { group: i, index: j };
    this.context.mode = 1;
  }
}
