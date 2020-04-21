import Vue from "vue";
import { Component, Inject, Ref } from "vue-property-decorator";
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

  @Ref("canvas")
  canvas: HTMLElement;

  renderer: WebGLRenderer;
  constructor() {
    super();
    const canvas = document.createElement("canvas");
    canvas.style.outline = "none";
    this.renderer = new WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.autoClear = false;
    this.renderer.setClearColor(COLORS.WHITE, 0);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    const toucher = new Toucher();
    toucher.init(canvas, this.world.controller.touch);
  }

  resize(width: number, height: number): void {
    this.world.width = width;
    this.world.height = height;
    this.world.resize();
    this.renderer.setSize(width, height, true);
    this.world.dirty = true;
  }

  mounted(): void {
    this.canvas.appendChild(this.renderer.domElement);
  }

  draw(): boolean {
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
