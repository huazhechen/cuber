import Vue from "vue";
import { Component, Watch } from "vue-property-decorator";

import Viewport from "../Viewport";
import cuber from "../../cuber";
import Tune from "../Tune";
import Setting from "../Setting";
import Player from "../Player";
import { WebGLRenderer, Vector3 } from "three";
import { SVGRenderer } from "three/examples/jsm/renderers/SVGRenderer";
import GIF from "../../common/gif";
import { APNG } from "../../common/apng";
import ZIP from "../../common/zip";
import { COLORS, FACE } from "../../cuber/define";
import Cubelet from "../../cuber/cubelet";
import Util from "../../common/util";
import Dash from "../Dash";
import Layer from "../Layer";

@Component({
  template: require("./index.html"),
  components: {
    viewport: Viewport,
    dash: Dash,
    tune: Tune,
    setting: Setting,
    player: Player,
    layer: Layer
  }
})
export default class Director extends Vue {
  width: number = 0;
  height: number = 0;
  size: number = 0;
  viewport: Viewport;
  player: Player;

  filmer: WebGLRenderer;
  svger: SVGRenderer;
  gif: GIF;
  apng: APNG;
  zip: ZIP;
  pixel: number = 512;
  @Watch("pixel")
  onPixelChange() {
    window.localStorage.setItem("director.pixel", String(this.pixel));
  }
  delay: number = 2;
  @Watch("delay")
  onDelayChange() {
    window.localStorage.setItem("director.delay", String(this.delay));
    this.apng.delay_num = this.delay;
  }

  filmt: string = "gif";
  @Watch("filmt")
  onFilmtChange() {
    window.localStorage.setItem("director.filmt", this.filmt);
  }

  snapt: string = "png";
  @Watch("snapt")
  onSnaptChange() {
    window.localStorage.setItem("director.snapt", this.snapt);
  }

  constructor() {
    super();
    this.filmer = new WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
    this.filmer.setPixelRatio(1);
    this.filmer.setClearColor(COLORS.BACKGROUND, 0);
    this.svger = new SVGRenderer();
    this.gif = new GIF();
    this.apng = new APNG(this.filmer.domElement);
    this.zip = new ZIP();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.size = Math.ceil(Math.min(this.width / 6, this.height / 12));
    this.viewport?.resize(this.width, this.height - this.size * 4.4 - 32);
    this.player?.resize(this.size);
  }

  mounted() {
    cuber.preferance.load("director");
    let view = this.$refs.viewport;
    if (view instanceof Viewport) {
      this.viewport = view;
    }
    view = this.$refs.player;
    if (view instanceof Player) {
      this.player = view;
    }

    this.reload();
    cuber.controller.taps.push((index: number, face: number) => {
      this.stick(index, face);
    });
    this.delay = Number(window.localStorage.getItem("director.delay") || 2);
    this.pixel = Number(window.localStorage.getItem("director.pixel") || 512);
    this.filmt = window.localStorage.getItem("director.filmt") || "gif";
    this.snapt = window.localStorage.getItem("director.snapt") || "png";

    cuber.world.callbacks.push(() => {
      this.callback();
    });
    this.$nextTick(this.resize);
    this.loop();
  }

  callback() {
    if (this.recording && this.player.playing == false) {
      this.finish();
    }
  }

  reload() {
    let save;
    let order = cuber.preferance.order;
    save = window.localStorage.getItem("director.action." + order);
    this.action = save != null ? save : "RUR'U'~";
    save = window.localStorage.getItem("director.scene." + order);
    this.scene = save != null ? save : "^";

    save = window.localStorage.getItem("director.stickers." + order);
    this.stickers = {};
    if (save) {
      try {
        let data = JSON.parse(save);
        for (const face of [FACE.L, FACE.R, FACE.D, FACE.U, FACE.B, FACE.F]) {
          this.stickers[FACE[face]] = data[FACE[face]];
        }
      } catch (error) {
        console.log(error);
      }
    }

    for (const face of [FACE.L, FACE.R, FACE.D, FACE.U, FACE.B, FACE.F]) {
      let stickers = this.stickers[FACE[face]];
      if (!stickers) {
        continue;
      }
      for (let index = 0; index < stickers.length; index++) {
        let sticker = stickers[index];
        if (sticker && sticker >= 0) {
          cuber.world.cube.stick(index, face, this.colors[sticker]);
        } else {
          cuber.world.cube.stick(index, face, "");
        }
      }
    }
  }

  loop() {
    requestAnimationFrame(this.loop.bind(this));
    this.viewport.draw();
    if (this.recording) {
      this.record();
    }
  }

  get style() {
    return {
      width: this.size + "px",
      height: this.size + "px",
      "min-width": "0%",
      "min-height": "0%",
      "text-transform": "none",
      flex: 1
    };
  }

  layerd: boolean = false;
  tuned: boolean = false;
  colord: boolean = false;
  outputd: boolean = false;
  settingd: boolean = false;
  tap(key: string) {
    switch (key) {
      case "layers":
        this.layerd = true;
        break;
      case "tune":
        this.tuned = true;
        break;
      case "settings":
        this.settingd = true;
        break;
      case "color":
        this.colord = true;
        break;
      case "output":
        this.outputd = true;
        break;
      case "film":
        if (this.action.length == 0) {
          if (this.snapt == "png") {
            this.snap();
          } else if (this.snapt == "svg") {
            this.svg();
          }
        } else {
          this.film();
        }
        break;
      default:
        break;
    }
  }

  order() {
    this.reload();
    this.player.init();
  }

  scene: string = "";
  @Watch("scene")
  onSceneChange() {
    this.player.scene = this.scene;
    window.localStorage.setItem("director.scene." + cuber.preferance.order, this.scene);
  }

  action: string = "";
  @Watch("action")
  onActionChange() {
    this.player.action = this.action;
    window.localStorage.setItem("director.action." + cuber.preferance.order, this.action);
  }

  recording: boolean = false;

  colors = [
    COLORS.YELLOW,
    COLORS.WHITE,
    COLORS.BLUE,
    COLORS.GREEN,
    COLORS.RED,
    COLORS.ORANGE,
    COLORS.BLACK,
    COLORS.GRAY,
    COLORS.CYAN,
    COLORS.LIME,
    COLORS.PINK
  ];
  color = 6;
  stickers: { [face: string]: number[] | undefined };
  stick(index: number, face: number) {
    if (index < 0) {
      return;
    }
    let cubelet: Cubelet = cuber.world.cube.cubelets[index];
    index = cubelet.initial;
    face = cubelet.getColor(face);
    let arr = this.stickers[FACE[face]];
    if (arr == undefined) {
      arr = [];
      this.stickers[FACE[face]] = arr;
    }
    if (arr[index] != this.color) {
      arr[index] = this.color;
      cuber.world.cube.stick(index, face, this.colors[this.color]);
    } else {
      arr[index] = -1;
      cuber.world.cube.stick(index, face, "");
    }
    window.localStorage.setItem("director.stickers." + cuber.preferance.order, JSON.stringify(this.stickers));
  }

  clear() {
    this.colord = false;
    this.color = 6;
    this.stickers = {};
    window.localStorage.setItem("director.stickers." + cuber.preferance.order, JSON.stringify(this.stickers));
    cuber.world.cube.strip({});
  }

  pixels: Uint8Array;
  film() {
    if (this.recording) {
      this.recording = false;
      cuber.controller.disable = false;
      this.player.toggle();
      return;
    }
    cuber.controller.disable = true;
    let size = this.pixel;
    this.filmer.setSize(size, size, true);
    if (this.filmt == "gif") {
      this.pixels = new Uint8Array(size * size * 4);
      this.gif.start(size, size, this.delay);
    } else if (this.filmt == "apng") {
      this.apng.start();
    } else if (this.filmt == "pngs") {
      this.zip.init();
    }
    this.record();
    this.player.init();
    this.player.toggle();
    this.recording = true;
  }

  snap() {
    let size = this.pixel;
    let width = cuber.world.width;
    let height = cuber.world.height;
    cuber.world.width = size;
    cuber.world.height = size;
    cuber.world.resize();
    this.filmer.setSize(size, size, true);
    this.filmer.clear();
    this.filmer.render(cuber.world.scene, cuber.world.camera);
    cuber.world.width = width;
    cuber.world.height = height;
    cuber.world.resize();
    let content = this.filmer.domElement.toDataURL("image/png");
    let parts = content.split(";base64,");
    let type = parts[0].split(":")[1];
    let raw = window.atob(parts[1]);
    let length = raw.length;
    let data = new Uint8Array(length);
    for (let i = 0; i < length; ++i) {
      data[i] = raw.charCodeAt(i);
    }
    let blob = new Blob([data], { type: type });
    let url = URL.createObjectURL(blob);
    Util.DOWNLOAD("cuber", "png", url);
  }

  svg() {
    let position: Vector3 = new Vector3();
    let distance;
    for (const cubelet of cuber.world.cube.cubelets) {
      distance = cubelet.frame.getWorldPosition(position).distanceTo(cuber.world.camera.position);
      cubelet.frame.renderOrder = 1 / distance;
      for (const sticker of cubelet.stickers) {
        if (sticker === undefined) {
          continue;
        }
        distance = sticker.getWorldPosition(position).distanceTo(cuber.world.camera.position);
        sticker.renderOrder = 1 / distance;
      }
      for (const mirror of cubelet.mirrors) {
        if (mirror === undefined) {
          continue;
        }
        distance = mirror.getWorldPosition(position).distanceTo(cuber.world.camera.position);
        mirror.renderOrder = 1 / distance;
      }
    }
    cuber.world.camera.aspect = 1;
    cuber.world.camera.updateProjectionMatrix();
    this.svger.setSize(this.pixel, this.pixel);
    this.svger.clear();
    this.svger.overdraw = 0;
    this.svger.render(cuber.world.scene, cuber.world.camera);
    cuber.world.resize();
    var serializer = new XMLSerializer();
    var content = serializer.serializeToString(this.svger.domElement);
    let url = "data:image/svg+xml;base64," + btoa(content);
    Util.DOWNLOAD("cuber", "svg", url);
  }

  record() {
    let size = this.pixel;
    let width = cuber.world.width;
    let height = cuber.world.height;
    cuber.world.width = size;
    cuber.world.height = size;
    cuber.world.resize();
    this.filmer.clear();
    this.filmer.render(cuber.world.scene, cuber.world.camera);
    if (this.filmt == "gif") {
      let content = this.filmer.getContext();
      content.readPixels(0, 0, size, size, content.RGBA, content.UNSIGNED_BYTE, this.pixels);
      this.gif.add(this.pixels);
    } else if (this.filmt == "apng") {
      this.apng.addFrame();
    } else if (this.filmt == "pngs") {
      let content = this.filmer.domElement.toDataURL("image/png");
      let parts = content.split(";base64,");
      let raw = window.atob(parts[1]);
      let length = raw.length;
      let data = new Uint8Array(length);
      for (let i = 0; i < length; ++i) {
        data[i] = raw.charCodeAt(i);
      }
      this.zip.add("cuber" + this.zip.num + ".png", data);
    }
    cuber.world.width = width;
    cuber.world.height = height;
    cuber.world.resize();
  }

  finish() {
    this.recording = false;
    cuber.controller.disable = false;
    let data;
    let blob;
    let url;
    this.player.init();
    if (this.filmt == "gif") {
      this.gif.finish();
      data = this.gif.out.getData();
      blob = new Blob([data], { type: "image/gif" });
      url = URL.createObjectURL(blob);
      Util.DOWNLOAD("cuber", "gif", url);
    } else if (this.filmt == "apng") {
      data = this.apng.finish();
      blob = new Blob([data], { type: "image/png" });
      url = URL.createObjectURL(blob);
      Util.DOWNLOAD("cuber", "png", url);
    } else if (this.filmt == "pngs") {
      this.zip.finish();
      data = this.zip.out.getData();
      let blob = new Blob([data], { type: "application/zip" });
      let url = URL.createObjectURL(blob);
      Util.DOWNLOAD("cuber", "zip", url);
    }
  }

  scened: boolean = false;
  actiond: boolean = false;
}
