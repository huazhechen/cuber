import Vue from "vue";
import { Component, Provide, Watch } from "vue-property-decorator";
import Cuber from "../../cuber/cuber";
import Keyboard from "../Keyboard";
import Option from "../../common/option";

@Component({
  template: require("./index.html"),
  components: {
    keyboard: Keyboard
  }
})
export default class App extends Vue {
  @Provide("cuber")
  cuber: Cuber;

  @Provide("option")
  option: Option;

  keyboard: Keyboard = new Keyboard();
  menu: boolean = true;
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
    this.size = Math.min(this.width / 8, this.height / 15);
    
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
      keyboard.width = this.size * 8 - this.size / 4;
      keyboard.height = this.size * 4;
    }
  }

  mounted() {
    if (this.$refs.cuber instanceof Element) {
      let cuber = this.$refs.cuber;
      cuber.appendChild(this.cuber.canvas);
      this.$nextTick(this.resize);
    }
  }

  @Watch("option.mode")
  onModeChange(to: string, from: string) {
    this.$nextTick(this.resize);
  }
}
