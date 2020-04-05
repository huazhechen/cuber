import Vue from "vue";
import { Component, Watch, Provide } from "vue-property-decorator";

import Viewport from "../Viewport";
import Playbar from "../Playbar";
import { WebGLRenderer, Vector3 } from "three";
import { SVGRenderer } from "three/examples/jsm/renderers/SVGRenderer";
import GIF from "../../common/gif";
import { APNG } from "../../common/apng";
import ZIP from "../../common/zip";
import { COLORS, FACE } from "../../cuber/define";
import Cubelet from "../../cuber/cubelet";
import Util from "../../common/util";
import Setting from "../Setting";
import World from "../../cuber/world";
import Database from "../../database";
import Base64 from "../../common/base64";
import pako from "pako";

@Component({
  template: require("./index.html"),
  components: {
    viewport: Viewport,
    setting: Setting,
    playbar: Playbar,
  },
})
export default class Director extends Vue {
  @Provide("world")
  world: World = new World();

  @Provide("database")
  database: Database = new Database("director", this.world);

  public static COLORS = [
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
    COLORS.PINK,
  ];

  get colors() {
    return Director.COLORS;
  }

  width: number = 0;
  height: number = 0;
  size: number = 0;
  viewport: Viewport;
  playbar: Playbar;

  filmer: WebGLRenderer;
  svger: SVGRenderer;
  gif: GIF;
  apng: APNG;
  zip: ZIP;

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
    this.playbar?.resize(this.size);
  }

  mounted() {
    this.database.load();
    let view = this.$refs.viewport;
    if (view instanceof Viewport) {
      this.viewport = view;
    }
    view = this.$refs.playbar;
    if (view instanceof Playbar) {
      this.playbar = view;
    }

    this.reload();
    this.world.controller.taps.push((index: number, face: number) => {
      this.stick(index, face);
    });

    this.world.callbacks.push(() => {
      this.callback();
    });
    this.$nextTick(this.resize);
    this.loop();
  }

  callback() {
    if (this.recording && this.playbar.playing == false) {
      this.finish();
    }
  }

  reload() {
    let save;
    let order = this.world.order;
    save = this.database.director.dramas[order];
    if (!save) {
      save = { scene: "^", action: "RUR'U'~", stickers: {} };
      this.database.director.dramas[order] = save;
    }
    this.scene = save.scene;
    this.action = save.action;
    this.stickers = save.stickers;
    for (const face of [FACE.L, FACE.R, FACE.D, FACE.U, FACE.B, FACE.F]) {
      let stickers = this.stickers[FACE[face]];
      if (!stickers) {
        continue;
      }
      for (let index = 0; index < stickers.length; index++) {
        let sticker = stickers[index];
        if (sticker && sticker >= 0) {
          this.world.cube.stick(index, face, Director.COLORS[sticker]);
        } else {
          this.world.cube.stick(index, face, "");
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
      flex: 1,
    };
  }

  colord: boolean = false;
  outputd: boolean = false;
  tap(key: string) {
    switch (key) {
      case "color":
        this.colord = true;
        break;
      case "output":
        this.outputd = true;
        break;
      case "snap":
        let snapt = this.database.director.snapt;
        if (snapt == "png") {
          this.png();
        } else if (snapt == "svg") {
          this.svg();
        }
        break;
      case "film":
        this.film();
        break;
      case "save":
        this.save();
        break;
      default:
        break;
    }
  }

  save() {
    let data: { [key: string]: any } = {};
    let order = this.world.order;
    data["order"] = order;
    data["drama"] = this.database.director.dramas[order];
    data["preferance"] = this.database.preferance.value;
    let string = JSON.stringify(data);
    string = pako.deflate(string, { to: "string" });
    string = Base64.encode(string);
    let search = "mode=player&data=" + string;
    window.location.search = search;
  }

  order() {
    this.database.director.order = this.world.order;
    this.database.save();
    this.reload();
    this.playbar.init();
  }

  scene: string = "";
  @Watch("scene")
  onSceneChange() {
    this.playbar.scene = this.scene;
    this.database.director.dramas[this.world.order].scene = this.scene;
    this.database.save();
  }

  action: string = "";
  @Watch("action")
  onActionChange() {
    this.playbar.action = this.action;
    this.database.director.dramas[this.world.order].action = this.action;
    this.database.save();
  }

  recording: boolean = false;

  color = 6;
  stickers: { [face: string]: number[] | undefined };
  stick(index: number, face: number) {
    if (index < 0) {
      return;
    }
    let cubelet: Cubelet = this.world.cube.cubelets[index];
    index = cubelet.initial;
    face = cubelet.getColor(face);
    let arr = this.stickers[FACE[face]];
    if (arr == undefined) {
      arr = [];
      this.stickers[FACE[face]] = arr;
    }
    if (arr[index] != this.color) {
      arr[index] = this.color;
      this.world.cube.stick(index, face, Director.COLORS[this.color]);
    } else {
      arr[index] = -1;
      this.world.cube.stick(index, face, "");
    }
    this.database.director.dramas[this.world.order].stickers = this.stickers;
    this.database.save();
  }

  clear() {
    this.colord = false;
    this.color = 6;
    this.stickers = {};
    this.database.director.dramas[this.world.order].stickers = this.stickers;
    this.database.save();
    this.world.cube.strip({});
  }

  pixels: Uint8Array;
  film() {
    if (this.recording) {
      this.recording = false;
      this.world.controller.disable = false;
      this.playbar.toggle();
      return;
    }
    this.world.controller.disable = true;
    let pixel = this.database.director.pixel;
    let filmt = this.database.director.filmt;
    let delay = this.database.director.delay;
    this.filmer.setSize(pixel, pixel, true);
    if (filmt == "gif") {
      this.pixels = new Uint8Array(pixel * pixel * 4);
      this.gif.start(pixel, pixel, delay);
    } else if (filmt == "apng") {
      this.apng.delay_num = delay;
      this.apng.start();
    } else if (filmt == "pngs") {
      this.zip.init();
    }
    this.record();
    this.playbar.init();
    this.playbar.toggle();
    this.recording = true;
  }

  png() {
    let pixel = this.database.director.pixel;
    let width = this.world.width;
    let height = this.world.height;
    this.world.width = pixel;
    this.world.height = pixel;
    this.world.resize();
    this.filmer.setSize(pixel, pixel, true);
    this.filmer.clear();
    this.filmer.render(this.world.scene, this.world.camera);
    this.world.width = width;
    this.world.height = height;
    this.world.resize();
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
    for (const cubelet of this.world.cube.cubelets) {
      if (cubelet === undefined || cubelet.frame === undefined) {
        continue;
      }
      distance = cubelet.frame.getWorldPosition(position).distanceTo(this.world.camera.position);
      cubelet.frame.renderOrder = 1 / distance;
      for (const sticker of cubelet.stickers) {
        if (sticker === undefined) {
          continue;
        }
        distance = sticker.getWorldPosition(position).distanceTo(this.world.camera.position);
        sticker.renderOrder = 1 / distance;
      }
      for (const mirror of cubelet.mirrors) {
        if (mirror === undefined) {
          continue;
        }
        distance = mirror.getWorldPosition(position).distanceTo(this.world.camera.position);
        mirror.renderOrder = 1 / distance;
      }
    }
    this.world.camera.aspect = 1;
    this.world.camera.updateProjectionMatrix();
    let pixel = this.database.director.pixel;
    this.svger.setSize(pixel, pixel);
    this.svger.clear();
    this.svger.overdraw = 0;
    this.svger.render(this.world.scene, this.world.camera);
    this.world.resize();
    var serializer = new XMLSerializer();
    var content = serializer.serializeToString(this.svger.domElement);
    let url = "data:image/svg+xml;base64," + btoa(content);
    Util.DOWNLOAD("cuber", "svg", url);
  }

  record() {
    let pixel = this.database.director.pixel;
    let filmt = this.database.director.filmt;
    let width = this.world.width;
    let height = this.world.height;
    this.world.width = pixel;
    this.world.height = pixel;
    this.world.resize();
    this.filmer.clear();
    this.filmer.render(this.world.scene, this.world.camera);
    if (filmt == "gif") {
      let content = this.filmer.getContext();
      content.readPixels(0, 0, pixel, pixel, content.RGBA, content.UNSIGNED_BYTE, this.pixels);
      this.gif.add(this.pixels);
    } else if (filmt == "apng") {
      this.apng.addFrame();
    } else if (filmt == "pngs") {
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
    this.world.width = width;
    this.world.height = height;
    this.world.resize();
  }

  finish() {
    let filmt = this.database.director.filmt;
    this.recording = false;
    this.world.controller.disable = false;
    let data;
    let blob;
    let url;
    this.playbar.init();
    if (filmt == "gif") {
      this.gif.finish();
      data = this.gif.out.getData();
      blob = new Blob([data], { type: "image/gif" });
      url = URL.createObjectURL(blob);
      Util.DOWNLOAD("cuber", "gif", url);
    } else if (filmt == "apng") {
      data = this.apng.finish();
      blob = new Blob([data], { type: "image/png" });
      url = URL.createObjectURL(blob);
      Util.DOWNLOAD("cuber", "png", url);
    } else if (filmt == "pngs") {
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
