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
import cuber from "../../cuber";

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
    this.context.toucher.init(canvas, cuber.controller.touch);
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
    cuber.world.width = this.width;
    cuber.world.height = this.height - panel.height;
    cuber.world.resize();
    this.renderer.setSize(cuber.world.width, cuber.world.height, true);
    let element = this.$refs.cuber;
    if (element instanceof HTMLElement) {
      element.style.width = cuber.world.width + "px";
      element.style.height = cuber.world.height + "px";
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
      cuber.world.cube.position.y = tick * Cubelet.SIZE;
      cuber.world.cube.rotation.y = (tick / 12) * Math.PI;
      cuber.world.cube.updateMatrix();
      cuber.world.cube.dirty = true;
    }
    if (cuber.world.dirty || cuber.world.cube.dirty) {
      this.renderer.clear();
      this.renderer.render(cuber.world.scene, cuber.world.camera);
      cuber.world.dirty = false;
      cuber.world.cube.dirty = false;
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
      cuber.world.cube.position.y = 0;
      cuber.world.cube.rotation.y = 0;
      cuber.world.cube.updateMatrix();
      cuber.world.cube.dirty = true;
    }
  }

  @Watch("context.cuber.preferance.order")
  onOrderChange() {
    let mode = this.context.mode;
    this.context.mode = -1;
    this.$nextTick(() => {
      this.context.mode = mode;
    });
  }
}
