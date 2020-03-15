import Vue from "vue";
import { Component, Watch, Inject } from "vue-property-decorator";
import Cubelet from "../../cuber/cubelet";
import GIF from "../../common/gif";
import Base64 from "../../common/base64";

import { TwistAction, TwistNode } from "../../cuber/twister";
import Context from "../context";
import { FACE, COLORS } from "../../cuber/define";
import Util from "../../common/util";
import { WebGLRenderer } from "three";
import Icon from "../Icon";
import { APNG } from "../../common/apng";
import ZIP from "../../common/zip";

@Component({
  template: require("./index.html"),
  components: {
    icon: Icon
  }
})
export default class Editor extends Vue {
  @Inject("context")
  context: Context;

  quality: boolean = false;
  filmer: WebGLRenderer;
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

  output: string = "gif";
  @Watch("output")
  onOutputChange() {
    window.localStorage.setItem("director.output", this.output);
  }

  constructor() {
    super();
    this.filmer = new WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
    this.filmer.setPixelRatio(1);
    this.filmer.setClearColor(COLORS.BACKGROUND, 0);
    this.apng = new APNG(this.filmer.domElement);
    this.zip = new ZIP();
  }

  width: number = 0;
  height: number = 0;
  size: number = 0;
  resize(width: number, height: number) {
    this.size = Math.ceil(Math.min(width / 8.6, height / 14));
    this.width = width;
    this.height = this.size * 2.6 + 112;
  }

  get style() {
    return {
      width: ((this.size * 8) / 5) * 1 + "px",
      height: this.size * 1.1 + "px",
      "min-width": "0%",
      "min-height": "0%",
      "text-transform": "none"
    };
  }

  mounted() {
    let save = window.localStorage.getItem("director.action");
    this.action = save != null ? save : "RUR'U'-";
    save = window.localStorage.getItem("director.scene");
    this.scene = save != null ? save : "^";

    this.context.cuber.cube.twister.callbacks.push(() => {
      this.callback();
    });
    this.context.cuber.controller.taps.push((index: number, face: number) => {
      this.stick(index, face);
    });
    this.delay = Number(window.localStorage.getItem("director.delay") || 2);
    this.pixel = Number(window.localStorage.getItem("director.pixel") || 512);
    this.output = window.localStorage.getItem("director.output") || "gif";
  }

  init() {
    this.playing = false;
    this.progress = 0;
    this.context.cuber.controller.disable = false;
    this.context.cuber.cube.twister.finish();
    this.context.cuber.cube.twister.twist("#");
    let scene = this.scene == "^" ? "(" + this.action + ")'" : this.scene;
    this.context.cuber.cube.twister.twist(scene, false, 1, true);
    this.context.cuber.cube.history.clear();
  }

  end() {
    this.init();
    this.context.cuber.cube.twister.twist(this.action, false, 1, true);
    this.progress = this.actions.length;
  }

  scene: string = "";
  @Watch("scene")
  onSceneChange() {
    window.localStorage.setItem("director.scene", this.scene);
    this.init();
  }

  progress: number = 0;
  @Watch("progress")
  onProgressChange() {
    this.context.cuber.controller.lock = this.progress > 0;
  }
  actions: TwistAction[] = [];
  action: string = "";
  @Watch("action")
  onActionChange() {
    window.localStorage.setItem("director.action", this.action);
    this.actions = new TwistNode(this.action).parse();
    this.init();
  }

  stickers: { [face: string]: number[] | undefined } = (() => {
    let save = window.localStorage.getItem("director.stickers");
    if (save) {
      try {
        let data = JSON.parse(save);
        let stickers: { [face: string]: number[] | undefined } = {};
        for (let face = 0; face < 6; face++) {
          stickers[FACE[face]] = data[FACE[face]];
        }
        return stickers;
      } catch (error) {
        console.log(error);
      }
    }
    return {};
  })();

  callback() {
    if (this.context.mode != 2) {
      return;
    }
    if (this.recording || this.playing) {
      if (this.progress == this.actions.length) {
        if (this.playing) {
          this.playing = false;
        }
        if (this.recording) {
          this.finish();
        }
        return;
      }
      let action = this.actions[this.progress];
      this.progress++;
      this.context.cuber.cube.twister.twist(action.exp, action.reverse, action.times, false);
    }
  }

  toggle() {
    if (this.playing) {
      this.playing = false;
    } else {
      this.forward();
      this.playing = true;
    }
  }

  forward() {
    if (this.progress == this.actions.length) {
      return;
    }
    if (this.progress == 0) {
      this.init();
    }
    this.playing = false;
    let action = this.actions[this.progress];
    this.progress++;
    this.context.cuber.cube.twister.twist(action.exp, action.reverse, action.times);
  }

  backward() {
    if (this.progress == 0) {
      return;
    }
    this.playing = false;
    this.progress--;
    let action = this.actions[this.progress];
    this.context.cuber.cube.twister.twist(action.exp, !action.reverse, action.times);
  }

  recording: boolean = false;
  playing: boolean = false;
  loop() {
    if (this.recording) {
      this.record();
    }
  }

  record() {
    let size = this.pixel;
    let width = this.context.cuber.width;
    let height = this.context.cuber.height;
    this.context.cuber.width = size;
    this.context.cuber.height = size;
    this.context.cuber.resize();
    this.filmer.clear();
    this.filmer.render(this.context.cuber.scene, this.context.cuber.camera);
    if (this.output == "gif") {
      let content = this.filmer.getContext();
      let pixels = new Uint8Array(size * size * 4);
      content.readPixels(0, 0, size, size, content.RGBA, content.UNSIGNED_BYTE, pixels);
      this.gif.add(pixels);
    } else if (this.output == "apng") {
      this.apng.addFrame();
    } else if (this.output == "pngs") {
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
    this.context.cuber.width = width;
    this.context.cuber.height = height;
    this.context.cuber.resize();
  }

  finish() {
    this.recording = false;
    this.context.cuber.controller.disable = false;
    let data;
    let blob;
    let url;
    if (this.output == "gif") {
      this.gif.finish();
      data = this.gif.out.getData();
      blob = new Blob([data], { type: "image/gif" });
      url = URL.createObjectURL(blob);
      Util.DOWNLOAD("cuber.gif", url);
    } else if (this.output == "apng") {
      data = this.apng.finish();
      blob = new Blob([data], { type: "image/png" });
      url = URL.createObjectURL(blob);
      Util.DOWNLOAD("cuber.png", url);
    } else if (this.output == "pngs") {
      this.zip.finish();
      data = this.zip.out.getData();
      let b = new Blob([data], { type: "application/zip" });
      let u = URL.createObjectURL(b);
      Util.DOWNLOAD("cuber.zip", u);
    }
  }

  film() {
    if (this.recording) {
      this.recording = false;
      this.context.cuber.controller.disable = false;
      return;
    }
    this.init();
    this.recording = true;
    this.context.cuber.controller.disable = true;
    let size = this.pixel;
    this.gif = new GIF(size, size, this.delay);
    this.filmer.setSize(size, size, true);
    if (this.output == "gif") {
      this.gif.start();
    } else if (this.output == "apng") {
      this.apng.start();
    } else if (this.output == "pngs") {
      this.zip.init();
    }
    this.record();
    this.callback();
  }

  snap() {
    let size = this.pixel;
    let width = this.context.cuber.width;
    let height = this.context.cuber.height;
    this.context.cuber.width = size;
    this.context.cuber.height = size;
    this.context.cuber.resize();
    this.filmer.setSize(size, size, true);
    this.filmer.clear();
    this.filmer.render(this.context.cuber.scene, this.context.cuber.camera);
    this.context.cuber.width = width;
    this.context.cuber.height = height;
    this.context.cuber.resize();
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
    Util.DOWNLOAD("cuber.png", url);
  }

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
  colord = false;

  stick(index: number, face: number) {
    if (this.context.mode != 2) {
      return;
    }
    if (index < 0) {
      return;
    }
    let cubelet: Cubelet = this.context.cuber.cube.cubelets[index];
    face = cubelet.getColor(face);
    index = this.context.cuber.cube.groups[FACE[face]].indices.indexOf(cubelet.initial);
    let arr = this.stickers[FACE[face]];
    if (arr == undefined) {
      arr = [];
      this.stickers[FACE[face]] = arr;
    }
    if (arr[index] != this.color) {
      arr[index] = this.color;
      this.context.cuber.cube.stick(face, index + 1, this.colors[this.color]);
    } else {
      arr[index] = -1;
      this.context.cuber.cube.stick(face, index + 1, "");
    }
    window.localStorage.setItem("director.stickers", JSON.stringify(this.stickers));
  }

  clear() {
    this.colord = false;
    this.stickers = {};
    window.localStorage.setItem("director.stickers", JSON.stringify(this.stickers));
    this.context.cuber.cube.strip({});
  }

  @Watch("context.mode")
  onModeChange(to: number) {
    if (to == 2) {
      this.$nextTick(() => {
        for (const face of [FACE.L, FACE.R, FACE.D, FACE.U, FACE.B, FACE.F]) {
          let stickers = this.stickers[FACE[face]];
          if (!stickers) {
            continue;
          }
          for (let index = 0; index < 9; index++) {
            let sticker = stickers[index];
            if (sticker && sticker >= 0) {
              this.context.cuber.cube.stick(face, index + 1, this.colors[sticker]);
            } else {
              this.context.cuber.cube.stick(face, index + 1, "");
            }
          }
        }
        this.init();
      });
    } else {
      this.context.cuber.cube.strip({});
      this.playing = false;
      this.recording = false;
    }
  }

  tap(key: string) {
    switch (key) {
      case "mirror":
        this.context.cuber.preferance.mirror = !this.context.cuber.preferance.mirror;
        break;
      case "hollow":
        this.context.cuber.preferance.hollow = !this.context.cuber.preferance.hollow;
        break;
      case "film":
        if (this.actions.length == 0) {
          this.snap();
        } else {
          this.film();
        }
        break;
      default:
        break;
    }
  }
}
