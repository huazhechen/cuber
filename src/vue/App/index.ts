import Vue from "vue";
import { Component, Provide, Watch } from "vue-property-decorator";
import Keyboard from "../Keyboard";
import Player from "../Player";
import Editor from "../Editor";
import * as THREE from "three";
import Dash from "../Dash";
import Context from "../context";
import { COLORS } from "../../cuber/cuber";

@Component({
  template: require("./index.html"),
  components: {
    keyboard: Keyboard,
    player: Player,
    editor: Editor,
    dash: Dash
  }
})
export default class App extends Vue {
  @Provide("context")
  context: Context;

  dash: boolean = false;
  width: number = 0;
  height: number = 0;
  size: number = 0;

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

    this.context = new Context();
    this.context.controller.control(canvas, this.context.cuber.controller.touch);
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.size = Math.ceil(Math.min(this.width / 8, this.height / 14));

    let panel = this.context.panels[this.context.mode];
    if (!panel) {
      return;
    }
    panel.resize(this.width, this.height);
    this.context.cuber.width = this.width;
    this.context.cuber.height = this.height - panel.height;
    this.context.cuber.resize();
    this.renderer.setSize(this.context.cuber.width, this.context.cuber.height, true);
    let cuber = this.$refs.cuber;
    if (cuber instanceof HTMLElement) {
      cuber.style.width = this.context.cuber.width + "px";
      cuber.style.height = this.context.cuber.height + "px";
    }
  }

  mounted() {
    if (this.$refs.keyboard instanceof Keyboard) {
      this.context.panels[0] = this.$refs.keyboard;
    }
    if (this.$refs.player instanceof Player) {
      this.context.panels[1] = this.$refs.player;
    }
    if (this.$refs.editor instanceof Editor) {
      this.context.panels[2] = this.$refs.editor;
    }

    if (this.$refs.cuber instanceof Element) {
      let cuber = this.$refs.cuber;
      cuber.appendChild(this.renderer.domElement);
    }
    this.loop();
  }

  loop() {
    requestAnimationFrame(this.loop.bind(this));
    if (this.context.cuber.dirty || this.context.cuber.cube.dirty) {
      this.renderer.clear();
      this.renderer.render(this.context.cuber.scene, this.context.cuber.camera);
      this.context.cuber.dirty = false;
      this.context.cuber.cube.dirty = false;
    }
    let panel = this.context.panels[this.context.mode];
    if (panel) {
      panel.loop();
    }
  }

  @Watch("context.mode")
  onModeChange() {
    this.$nextTick(this.resize);
  }
}
