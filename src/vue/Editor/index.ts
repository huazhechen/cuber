import Vue from "vue";
import { Component, Watch, Inject } from "vue-property-decorator";
import Cuber from "../../cuber/cuber";
import Context from "../../common/context";
import { COLORS, FACE, DOWNLOAD } from "../../common/define";
import Cubelet from "../../cuber/cubelet";
import GIF from "../../common/gif";
import Base64 from "../../common/base64";
import * as THREE from "three";
import { TwistAction, TwistNode } from "../../cuber/twister";

@Component({
  template: require("./index.html")
})
export default class Editor extends Vue {
  @Inject("cuber")
  cuber: Cuber;

  @Inject("context")
  context: Context;

  quality: boolean = false;
  width: number = 0;
  height: number = 0;
  size: number = 0;
  snaper: THREE.WebGLRenderer;
  filmer: THREE.WebGLRenderer;
  gif: GIF;
  pixel: number = 512;
  @Watch("pixel")
  onPixelChange() {
    window.localStorage.setItem("director.pixel", String(this.pixel));
  }
  delay: number = 2;
  @Watch("delay")
  onDelayChange() {
    window.localStorage.setItem("director.delay", String(this.delay));
  }

  frames: number = 30;
  set duration(value: number) {
    this.frames = value;
    this.cuber.cube.duration = value;
    window.localStorage.setItem("director.duration", String(value));
  }

  get duration() {
    return this.frames;
  }

  constructor() {
    super();
    this.snaper = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
    this.snaper.setPixelRatio(1);
    this.snaper.setClearColor(COLORS.BACKGROUND, 0);
    this.filmer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
    this.filmer.setPixelRatio(1);
    this.filmer.setClearColor(COLORS.BACKGROUND, 1);
  }

  resize(width: number, height: number) {
    this.size = Math.min(width / 8, height / 14);
    this.width = width;
    this.height = 260;
  }

  mounted() {
    let save = window.localStorage.getItem("director.action");
    this.action = save != null ? save : "RUR'U'-";
    save = window.localStorage.getItem("director.scene");
    this.scene = save != null ? save : "^";
    let search = window.location.search.toString().substr(1);
    if (search.length > 0) {
      try {
        let string = Base64.decode(search);
        let init = JSON.parse(string);
        this.scene = init.scene || "";
        this.action = init.action || "";
        this.stickers = init.stickers || [];
        if (init.option) {
          this.context.scale = init.option[0];
          this.context.perspective = init.option[1];
          this.context.angle = init.option[2];
          this.context.gradient = init.option[3];
        }
        history.replaceState({}, "Cuber", window.location.origin + window.location.pathname);
      } catch (error) {
        console.log(error);
      }
    }

    this.cuber.cube.twister.callbacks.push(() => {
      this.callback();
    });
    this.cuber.controller.taps.push(this.tap);
    this.delay = Number(window.localStorage.getItem("director.delay") || 2);
    this.pixel = Number(window.localStorage.getItem("director.pixel") || 512);
  }

  init() {
    this.playing = false;
    this.progress = 0;
    this.cuber.controller.disable = false;
    this.cuber.cube.twister.finish();
    this.cuber.cube.twister.twist("#");
    let scene = this.scene == "^" ? "(" + this.action + ")'" : this.scene;
    this.cuber.cube.twister.twist(scene, false, 1, true);
    this.cuber.cube.history.clear();
  }

  end() {
    this.init();
    this.cuber.cube.twister.twist(this.action, false, 1, true);
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
    this.cuber.controller.lock = this.progress > 0;
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
    if (this.context.mode != "director") {
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
      this.cuber.cube.twister.twist(action.exp, action.reverse, action.times, false);
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
    this.cuber.cube.twister.twist(action.exp, action.reverse, action.times);
  }

  backward() {
    if (this.progress == 0) {
      return;
    }
    this.playing = false;
    this.progress--;
    let action = this.actions[this.progress];
    this.cuber.cube.twister.twist(action.exp, !action.reverse, action.times);
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
    let width = this.cuber.width;
    let height = this.cuber.height;
    this.cuber.width = size;
    this.cuber.height = size;
    this.cuber.resize();
    this.filmer.clear();
    this.filmer.render(this.cuber.scene, this.cuber.camera);
    let content = this.filmer.getContext();
    let pixels = new Uint8Array(size * size * 4);
    content.readPixels(0, 0, size, size, content.RGBA, content.UNSIGNED_BYTE, pixels);
    this.gif.add(pixels);
    this.cuber.width = width;
    this.cuber.height = height;
    this.cuber.resize();
  }

  finish() {
    this.recording = false;
    this.cuber.controller.disable = false;
    this.gif.finish();
    let data = this.gif.out.getData();
    let blob = new Blob([data], { type: "image/gif" });
    let url = URL.createObjectURL(blob);
    DOWNLOAD("cuber.gif", url);
  }

  film() {
    if (this.recording) {
      this.recording = false;
      this.cuber.controller.disable = false;
      this.gif.finish();
      return;
    }
    this.init();
    this.recording = true;
    this.cuber.controller.disable = true;
    let size = this.pixel;
    this.gif = new GIF(size, size, this.delay);
    this.filmer.setSize(size, size, true);
    this.gif.start();
    this.record();
    this.callback();
  }

  snap() {
    let size = this.pixel;
    let width = this.cuber.width;
    let height = this.cuber.height;
    this.cuber.width = size;
    this.cuber.height = size;
    this.cuber.resize();
    this.snaper.setSize(size, size, true);
    this.snaper.clear();
    this.snaper.render(this.cuber.scene, this.cuber.camera);
    this.cuber.width = width;
    this.cuber.height = height;
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
    let url = URL.createObjectURL(blob);
    DOWNLOAD("cuber.png", url);
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

  tap = (index: number, face: number) => {
    if (this.context.mode != "director") {
      return;
    }
    if (index < 0) {
      return;
    }
    let cubelet: Cubelet = this.cuber.cube.cubelets[index];
    face = cubelet.getColor(face);
    index = this.cuber.cube.groups[FACE[face]].indices.indexOf(cubelet.initial);
    let arr = this.stickers[FACE[face]];
    if (arr == undefined) {
      arr = [];
      this.stickers[FACE[face]] = arr;
    }
    if (arr[index] != this.color) {
      arr[index] = this.color;
      this.cuber.cube.stick(face, index + 1, this.colors[this.color]);
    } else {
      arr[index] = -1;
      this.cuber.cube.stick(face, index + 1, "");
    }
    window.localStorage.setItem("director.stickers", JSON.stringify(this.stickers));
  };

  clear() {
    this.colord = false;
    this.stickers = {};
    window.localStorage.setItem("director.stickers", JSON.stringify(this.stickers));
    this.cuber.cube.strip({});
  }

  @Watch("context.mode")
  onModeChange(to: string) {
    if (to == "director") {
      this.$nextTick(() => {
        this.duration = Number(window.localStorage.getItem("director.duration") || 30);
        for (const face of [FACE.L, FACE.R, FACE.D, FACE.U, FACE.B, FACE.F]) {
          let stickers = this.stickers[FACE[face]];
          if (!stickers) {
            continue;
          }
          for (let index = 0; index < 9; index++) {
            let sticker = stickers[index];
            if (sticker && sticker >= 0) {
              this.cuber.cube.stick(face, index + 1, this.colors[sticker]);
            } else {
              this.cuber.cube.stick(face, index + 1, "");
            }
          }
        }
        this.init();
      });
    } else {
      this.cuber.cube.strip({});
      this.duration = 30;
    }
  }
}
