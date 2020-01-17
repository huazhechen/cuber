import Vue from "vue";
import { Component, Provide, Watch } from "vue-property-decorator";
import Cuber from "../../cuber/cuber";
import Keyboard from "../Keyboard";
import Option from "../../common/option";
import Tune from "../Tune";
import Alg from "../Alg";

@Component({
  template: require("./index.html"),
  components: {
    keyboard: Keyboard,
    tune: Tune,
    alg: Alg
  }
})
export default class App extends Vue {
  @Provide("cuber")
  cuber: Cuber;

  @Provide("option")
  option: Option;

  keyboard: Keyboard = new Keyboard();
  menu: boolean = false;
  tune: boolean = false;
  width: number = 0;
  height: number = 0;
  size: number = 0;

  constructor() {
    super();
    let canvas = document.createElement("canvas");
    this.cuber = new Cuber(canvas);
    this.option = new Option(this.cuber);
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.size = Math.min(this.width / 8, this.height / 14);

    this.cuber.width = this.width;
    this.cuber.height = this.height - this.size * 4;
    this.cuber.resize();
    let cuber = this.$refs.cuber;
    if (cuber instanceof HTMLElement) {
      cuber.style.width = this.width + "px";
      cuber.style.height = this.height - this.size * 4 + "px";
    }

    let keyboard = this.$refs.keyboard;
    if (keyboard instanceof Keyboard) {
      keyboard.width = this.size * 8 - this.size / 8;
      keyboard.height = this.size * 4;
    }
  }

  mounted() {
    if (this.$refs.cuber instanceof Element) {
      this.cuber.cube.twister.twist("*");
      let cuber = this.$refs.cuber;
      cuber.appendChild(this.cuber.canvas);
      this.$nextTick(this.resize);
    }
    this.loop();
  }

  alg: boolean = true;

  loop() {
    requestAnimationFrame(this.loop.bind(this));
    this.cuber.render();
  }
}
