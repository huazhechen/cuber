import { Component, Inject, Ref, Vue } from "vue-facing-decorator";
import template from "./index.html?raw";
import { markRaw } from "vue";
import * as THREE from "three";
import { COLORS } from "../../cuber/define";
import Toucher from "./toucher";
import World from "../../cuber/world";
import { PreferanceData } from "../../data";
import { configureRenderer } from "../../cuber/three-compat";

@Component({
  template,
  components: {},
})
export default class Viewport extends Vue {
  @Inject({ from: "world" })
  world: World;

  @Inject({ from: "preferance" })
  preferance: PreferanceData;

  @Ref("canvas")
  canvas: HTMLElement;

  renderer: THREE.WebGLRenderer;
  toucher: Toucher;

  constructor() {
    super();
    const canvas = document.createElement("canvas");
    canvas.style.outline = "none";
    this.renderer = markRaw(configureRenderer(new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
    })));
    this.renderer.autoClear = false;
    this.renderer.setClearColor(COLORS.White, 0);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.toucher = markRaw(new Toucher());
  }

  wheel(e: WheelEvent): void {
    if (e.target != this.renderer.domElement) {
      return;
    }
    let scale = this.preferance.scale;
    if (e.deltaY > 0) {
      scale = scale - 10;
    } else if (e.deltaY < 0) {
      scale = scale + 10;
    }
    scale = scale < 0 ? 0 : scale;
    scale = scale > 100 ? 100 : scale;
    this.preferance.scale = scale;
    this.preferance.save();
  }

  resize(width: number, height: number): void {
    this.world.width = width;
    this.world.height = height;
    this.world.resize();
    this.renderer.setSize(width, height, true);
    this.world.dirty = true;
  }

  mounted(): void {
    this.toucher.init(this.renderer.domElement, this.world.controller.touch);
    document.addEventListener("wheel", this.wheel, false);
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
