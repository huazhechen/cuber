import Vue from "vue";
import { Component, Provide } from "vue-property-decorator";
import Cuber from "../../cuber/cuber";
import Keyboard from "../Keyboard";
import Context from "../../common/context";
import Tune from "../Tune";
import * as THREE from "three";
import { COLORS } from "../../common/define";
import Icon from "../Icon";

@Component({
  template: require("./index.html"),
  components: {
    icon: Icon,
    keyboard: Keyboard,
    tune: Tune
  }
})
export default class Playground extends Vue {
  @Provide("cuber")
  cuber: Cuber;

  @Provide("context")
  context: Context;

  keyboard: Keyboard = new Keyboard();

  menu: boolean = false;
  tune: boolean = false;
  width: number = 0;
  height: number = 0;
  size: number = 0;

  start: number = 0;
  now: number = 0;
  get score() {
    let diff = this.now - this.start;
    let minute = Math.floor(diff / 1000 / 60);
    diff = diff % (1000 * 60);
    let second = Math.floor(diff / 1000);
    diff = diff % 1000;
    let ms = Math.floor(diff / 100);
    let time = (minute > 0 ? minute + ":" : "") + (Array(2).join("0") + second).slice(-2) + "." + ms;
    return time + "/" + this.cuber.cube.history.moves;
  }

  renderer: THREE.WebGLRenderer;
  constructor() {
    super();
    let canvas = document.createElement("canvas");
    canvas.style.outline = "none";
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true
    });
    this.renderer.autoClear = false;
    this.renderer.setClearColor(COLORS.BACKGROUND);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.cuber = new Cuber();
    this.context = new Context(this.cuber);
    this.context.control(canvas, this.cuber.touch);
    this.cuber.cube.callbacks.push(() => {
      if (this.cuber.cube.complete) {
        this.context.lock = true;
      }
    });
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.size = Math.ceil(Math.min(this.width / 8, this.height / 14));

    this.cuber.width = this.width;
    this.cuber.height = this.height - this.size * 4;
    this.cuber.resize();
    this.renderer.setSize(this.cuber.width, this.cuber.height, true);
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
    this.shuffle();
    if (this.$refs.cuber instanceof Element) {
      let cuber = this.$refs.cuber;
      cuber.appendChild(this.renderer.domElement);
      this.$nextTick(this.resize);
    }
    this.loop();
  }

  loop() {
    requestAnimationFrame(this.loop.bind(this));
    if (this.cuber.cube.history.moves == 0) {
      this.start = 0;
      this.now = 0;
    } else {
      if (this.start == 0) {
        this.start = new Date().getTime();
      }
      if (!this.cuber.cube.complete) {
        this.now = new Date().getTime();
      }
    }
    if (this.cuber.dirty || this.cuber.cube.dirty) {
      this.renderer.clear();
      this.renderer.render(this.cuber.scene, this.cuber.camera);
      this.cuber.dirty = false;
      this.cuber.cube.dirty = false;
    }
  }

  shuffle() {
    this.cuber.cube.twister.twist("*");
    this.menu = false;
    this.context.lock = false;
    this.start = 0;
    this.now = 0;
  }
}
