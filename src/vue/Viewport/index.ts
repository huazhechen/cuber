import Vue from "vue";
import { Component, Inject } from "vue-property-decorator";
import { WebGLRenderer } from "three";
import { COLORS } from "../../cuber/define";
import Toucher from "../../common/toucher";
import World from "../../cuber/world";

@Component({
  template: require("./index.html"),
  components: {},
})
export default class Viewport extends Vue {
  @Inject("world")
  world: World;

  renderer: WebGLRenderer;
  constructor() {
    super();
    let canvas = document.createElement("canvas");
    canvas.style.outline = "none";
    this.renderer = new WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.autoClear = false;
    this.renderer.setClearColor(COLORS.BACKGROUND, 0);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    let toucher = new Toucher();
    toucher.init(canvas, this.world.controller.touch);
  }

  resize(width: number, height: number) {
    this.world.width = width;
    this.world.height = height;
    this.world.resize();
    this.renderer.setSize(width, height, true);
    let view = this.$refs.cuber;
    if (view instanceof HTMLElement) {
      view.style.width = width + "px";
      view.style.height = height + "px";
    }
    this.world.dirty = true;
  }

  mounted() {
    if (this.$refs.canvas instanceof Element) {
      this.$refs.canvas.appendChild(this.renderer.domElement);
    }
  }

  draw() {
    if (this.world.dirty || this.world.cube.dirty) {
      this.renderer.clear();
      this.renderer.render(this.world.scene, this.world.camera);
      this.world.dirty = false;
      this.world.cube.dirty = false;
      return true;
    }
    return false;
  }
}
