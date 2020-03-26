import Vue from "vue";
import { Component } from "vue-property-decorator";
import { WebGLRenderer } from "three";
import cuber from "../../cuber";
import { COLORS } from "../../cuber/define";
import Toucher from "../../common/toucher";

@Component({
  template: require("./index.html"),
  components: {}
})
export default class Viewport extends Vue {
  renderer: WebGLRenderer;
  constructor() {
    super();
    let canvas = document.createElement("canvas");
    canvas.style.outline = "none";
    this.renderer = new WebGLRenderer({
      canvas: canvas,
      antialias: true
    });
    this.renderer.autoClear = false;
    this.renderer.setClearColor(COLORS.BACKGROUND);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    let toucher = new Toucher();
    toucher.init(canvas, cuber.controller.touch);
  }

  resize(width: number, height: number) {
    cuber.world.width = width;
    cuber.world.height = height;
    cuber.world.resize();
    this.renderer.setSize(width, height, true);
    let view = this.$refs.cuber;
    if (view instanceof HTMLElement) {
      view.style.width = width + "px";
      view.style.height = height + "px";
    }
    cuber.world.dirty = true;
  }

  mounted() {
    if (this.$refs.canvas instanceof Element) {
      this.$refs.canvas.appendChild(this.renderer.domElement);
    }
  }

  draw() {
    if (cuber.world.dirty || cuber.world.cube.dirty) {
      this.renderer.clear();
      this.renderer.render(cuber.world.scene, cuber.world.camera);
      cuber.world.dirty = false;
      cuber.world.cube.dirty = false;
    }
  }
}
