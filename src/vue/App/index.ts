import Vue from "vue";
import { Component, Provide, Watch } from "vue-property-decorator";
import Cuber from "../../cuber/cuber";
import Keyboard from "../Keyboard";
import Player from "../Player";
import Editor from "../Editor";
import Context from "../../common/context";
import * as THREE from "three";
import { COLORS } from "../../common/define";
import { Panel } from "../panel";
import Dash from "../Dash";

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
  @Provide("cuber")
  cuber: Cuber;

  @Provide("context")
  context: Context;

  dash: boolean = false;
  width: number = 0;
  height: number = 0;
  size: number = 0;

  renderer: THREE.WebGLRenderer;
  panels: { [key: string]: Panel } = {};
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
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.size = Math.ceil(Math.min(this.width / 8, this.height / 14));

    let panel = this.panels[this.context.mode];
    if (!panel) {
      return;
    }
    panel.resize(this.width, this.height);
    this.cuber.width = this.width;
    this.cuber.height = this.height - panel.height;
    this.cuber.resize();
    this.renderer.setSize(this.cuber.width, this.cuber.height, true);
    let cuber = this.$refs.cuber;
    if (cuber instanceof HTMLElement) {
      cuber.style.width = this.cuber.width + "px";
      cuber.style.height = this.cuber.height + "px";
    }
  }

  mounted() {
    if (this.$refs.keyboard instanceof Keyboard) {
      this.panels["playground"] = this.$refs.keyboard;
    }
    if (this.$refs.player instanceof Player) {
      this.panels["algs"] = this.$refs.player;
    }
    if (this.$refs.editor instanceof Editor) {
      this.panels["director"] = this.$refs.editor;
    }

    if (this.$refs.cuber instanceof Element) {
      let cuber = this.$refs.cuber;
      cuber.appendChild(this.renderer.domElement);
    }
    this.context.mode = "playground";
    this.loop();
  }

  loop() {
    requestAnimationFrame(this.loop.bind(this));
    if (this.cuber.dirty || this.cuber.cube.dirty) {
      this.renderer.clear();
      this.renderer.render(this.cuber.scene, this.cuber.camera);
      this.cuber.dirty = false;
      this.cuber.cube.dirty = false;
    }
    let panel = this.panels["playground"];
    if (panel) {
      panel.loop();
    }
  }

  @Watch("context.mode")
  onModeChange() {
    this.$nextTick(this.resize);
  }
}
