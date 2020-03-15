import Vue from "vue";
import { Component, Provide, Watch } from "vue-property-decorator";
import Keyboard from "../Keyboard";
import Player from "../Player";
import Editor from "../Editor";

import Dash from "../Dash";
import Context from "../context";
import { COLORS } from "../../cuber/define";
import Algs from "../Algs";
import { WebGLRenderer } from "three";
import Cubelet from "../../cuber/cubelet";

@Component({
  template: require("./index.html"),
  components: {
    keyboard: Keyboard,
    player: Player,
    editor: Editor,
    dash: Dash,
    algs: Algs
  }
})
export default class App extends Vue {
  @Provide("context")
  context: Context;

  dash: boolean = false;
  width: number = 0;
  height: number = 0;
  size: number = 0;

  renderer: WebGLRenderer;
  constructor() {
    super();
    let canvas = document.createElement("canvas");
    this.context = new Context();
    this.context.toucher.init(canvas, this.context.cuber.controller.touch);
    canvas.style.outline = "none";
    this.renderer = new WebGLRenderer({
      canvas: canvas,
      antialias: true
    });
    this.renderer.autoClear = false;
    this.renderer.setClearColor(COLORS.BACKGROUND);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.size = Math.ceil(Math.min(this.width / 8, this.height / 14));
    if (this.size < 40) {
      this.size = 40;
    }

    if (this.$refs.dash instanceof Dash) {
      this.$refs.dash.resize(this.width, this.height);
    }

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
    if (this.$refs.algs instanceof Algs) {
      this.context.panels[3] = this.$refs.algs;
    }

    if (this.$refs.cuber instanceof Element) {
      let cuber = this.$refs.cuber;
      cuber.appendChild(this.renderer.domElement);
    }
    let hashs = location.hash.substr(1).split(";");
    for (const hash of hashs) {
      let kv = hash.split("=");
      if (kv[0] == "mode" && kv[1]) {
        this.context.mode = Number(kv[1] || 0);
      }
    }
    if (!(this.context.mode >= 0 && this.context.mode < 4)) {
      this.context.mode = Number(window.localStorage.getItem("context.mode") || 0);
    }
    this.resize();
    this.loop();
  }

  loop() {
    requestAnimationFrame(this.loop.bind(this));
    if (this.context.mode == 0) {
      let tick = new Date().getTime();
      tick = (tick / 1600) * Math.PI;
      tick = Math.sin(tick) / 32;
      this.context.cuber.cube.position.y = tick * Cubelet.SIZE;
      this.context.cuber.cube.rotation.y = (tick / 10) * Math.PI;
      this.context.cuber.cube.updateMatrix();
      this.context.cuber.cube.dirty = true;
    }
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
  onModeChange(mode: number) {
    window.localStorage.setItem("context.mode", String(mode));
    window.location.hash = mode == 0 ? "" : "mode=" + mode + ";";
    this.$nextTick(this.resize);
    if (mode != 0) {
      this.context.cuber.cube.position.y = 0;
      this.context.cuber.cube.rotation.y = 0;
      this.context.cuber.cube.updateMatrix();
      this.context.cuber.cube.dirty = true;
    }
  }
}
