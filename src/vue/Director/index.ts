import Vue from "vue";
import { Component, Provide, Watch } from "vue-property-decorator";
import Cuber from "../../cuber/cuber";
import Keyboard from "../Keyboard";
import Option from "../../common/option";
import Tune from "../Tune";
import { COLORS, FACE, download } from "../../common/define";
import Cubelet from "../../cuber/cubelet";
import GIF from "../../common/gif";
import Base64 from "../../common/base64";
import * as THREE from "three";

@Component({
  template: require("./index.html"),
  components: {
    tune: Tune
  }
})
export default class Director extends Vue {
  @Provide("cuber")
  cuber: Cuber;

  @Provide("option")
  option: Option;

  tune: boolean = false;
  width: number = 0;
  height: number = 0;
  size: number = 0;
  playing: boolean = false;
  snaper: THREE.WebGLRenderer;
  filmer: THREE.WebGLRenderer;
  sized: boolean = false;
  gif: GIF;
  pixel: number = 9;

  constructor() {
    super();
    let canvas = document.createElement("canvas");
    this.cuber = new Cuber(canvas);
    this.option = new Option(this.cuber);
    this.cuber.cube.twister.callbacks.push(() => {
      this.triger();
    });
    this.snaper = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
    this.snaper.setPixelRatio(1);
    this.snaper.setClearColor(COLORS.BACKGROUND, 0);
    this.filmer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true, alpha: true });
    this.filmer.setPixelRatio(1);
    this.filmer.setClearColor(COLORS.BACKGROUND, 1);
  }

  triger() {
    if (this.cuber.cube.twister.length == 0) {
      if (this.playing) {
        this.init();
      } else if (this.recording) {
        this.finish();
      }
    }
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.size = 43;
    this.cuber.width = this.width;
    this.cuber.height = this.height - this.size * 4;
    this.cuber.resize();
    let cuber = this.$refs.cuber;
    if (cuber instanceof HTMLElement) {
      cuber.style.width = this.width + "px";
      cuber.style.height = this.height - this.size * 4 + "px";
    }
  }

  mounted() {
    let search = window.location.search.toString().substr(1);
    if (search.length > 0) {
      let string = Base64.decode(search);
      let init = JSON.parse(string);
      this.scene = init.scene || "";
      this.action = init.action || "";
      this.strips = init.strips || [];
      history.replaceState({}, "Cuber", window.location.origin + window.location.pathname);
    }

    if (this.$refs.cuber instanceof Element) {
      let cuber = this.$refs.cuber;
      cuber.appendChild(this.cuber.canvas);
      this.$nextTick(this.resize);
    }
    this.cuber.controller.taps.push(this.tap);
    this.cuber.cube.strip(this.strips);
    this.init();
    this.loop();
  }

  init() {
    this.cuber.controller.disable = false;
    this.playing = false;
    this.cuber.cube.twister.finish();
    this.cuber.cube.twister.twist("#");
    this.cuber.cube.twister.twist(this.scene, false, 1, true);
  }

  scene: string = window.localStorage.getItem("director.scene") || "";
  @Watch("scene")
  onSceneChange() {
    window.localStorage.setItem("director.scene", this.scene);
    this.init();
  }

  action: string = window.localStorage.getItem("director.action") || "";
  @Watch("action")
  onActionChange() {
    window.localStorage.setItem("director.action", this.action);
  }

  strips: { [face: string]: number[] | undefined } = (() => {
    let save = window.localStorage.getItem("director.strips");
    if (save) {
      let data = JSON.parse(save);
      let strips: { [face: string]: number[] | undefined } = {};
      for (let face = 0; face < 6; face++) {
        strips[FACE[face]] = data[FACE[face]];
      }
      return strips;
    }
    return {};
  })();

  play() {
    this.init();
    this.cuber.controller.disable = true;
    this.playing = true;
    this.cuber.cube.twister.twist("-" + this.action + "--", false, 1);
  }

  toggle() {
    if (this.playing) {
      this.init();
    } else {
      this.playing = true;
      this.play();
    }
  }

  recording: boolean = false;
  loop() {
    requestAnimationFrame(this.loop.bind(this));
    if (this.recording) {
      this.record();
    }
    this.cuber.render();
  }

  record() {
    this.cuber.camera.aspect = 1;
    this.cuber.camera.updateProjectionMatrix();
    this.filmer.clear();
    this.filmer.render(this.cuber.scene, this.cuber.camera);
    let content = this.filmer.getContext();
    let size = Math.pow(2, this.pixel);
    let pixels = new Uint8Array(size * size * 4);
    content.readPixels(0, 0, size, size, content.RGBA, content.UNSIGNED_BYTE, pixels);
    this.gif.add(pixels);
    this.cuber.resize();
  }

  finish() {
    this.recording = false;
    this.cuber.controller.disable = false;
    this.cuber.resize();
    this.gif.finish();
    this.init();
    let data = this.gif.out.getData();
    let blob = new Blob([data], { type: "image/gif" });
    download("cuber.gif", blob);
  }

  film() {
    this.init();
    this.recording = true;
    this.cuber.controller.disable = true;
    let size = Math.pow(2, this.pixel);
    this.gif = new GIF(size, size);
    this.filmer.setSize(size, size, true);
    this.gif.start();
    this.record();
    this.cuber.cube.twister.twist("-" + this.action + "-", false, 1);
  }

  snap() {
    this.cuber.camera.aspect = 1;
    this.cuber.camera.updateProjectionMatrix();
    let size = Math.pow(2, this.pixel);
    this.snaper.setSize(size, size, true);
    this.snaper.clear();
    this.snaper.render(this.cuber.scene, this.cuber.camera);
    this.cuber.resize();
    let content = this.snaper.domElement.toDataURL("image/png");
    let parts = content.split(";base64,");
    let type = parts[0].split(":")[1];
    let raw = window.atob(parts[1]);
    let length = raw.length;
    let data = new Uint8Array(length);
    for (let i = 0; i < length; ++i) {
      data[i] = raw.charCodeAt(i);
    }
    let blob = new Blob([data], { type: type });
    download("cuber.png", blob);
  }

  tap(index: number, face: number) {
    if (index < 0) {
      return;
    }
    this.cuber.cube.cubelets[index];
    let cubelet: Cubelet = this.cuber.cube.cubelets[index];
    face = cubelet.getColor(face);
    index = this.cuber.cube.groups[FACE[face]].indices.indexOf(cubelet.initial);
    let arr = this.strips[FACE[face]];
    if (arr == undefined) {
      this.strips[FACE[face]] = [index + 1];
    } else {
      let i = arr.indexOf(index + 1);
      if (i > -1) {
        arr.splice(i, 1);
      } else {
        arr.push(index + 1);
      }
    }
    this.cuber.cube.strip(this.strips);
    window.localStorage.setItem("director.strips", JSON.stringify(this.strips));
  }
}
