import Vue from "vue";
import { Component, Watch, Provide, Ref } from "vue-property-decorator";

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
import pako from "pako";
import ClipboardJS from "clipboard";
import { PreferanceData, ThemeData } from "../../data";

export class DirectorData {
  private values = {
    version: "0.2",
    order: 3,
    delay: 4,
    pixel: 512,
    filmt: "gif",
    snapt: "png",
    dramas: [],
  };

  constructor() {
    this.load();
  }

  load(): void {
    const save = window.localStorage.getItem("director");
    if (save) {
      const data = JSON.parse(save);
      if (data.version != this.values.version) {
        this.save();
        return;
      }
      this.values = data;
    }
  }

  save(): void {
    window.localStorage.setItem("director", JSON.stringify(this.values));
  }

  get order(): number {
    return this.values.order;
  }

  set order(value) {
    this.values.order = value;
  }

  get delay(): number {
    return this.values.delay;
  }

  set delay(value) {
    this.values.delay = value;
  }

  get pixel(): number {
    return this.values.pixel;
  }

  set pixel(value) {
    this.values.pixel = value;
  }

  get filmt(): string {
    return this.values.filmt;
  }

  set filmt(value) {
    this.values.filmt = value;
  }

  get snapt(): string {
    return this.values.snapt;
  }

  set snapt(value) {
    this.values.snapt = value;
  }

  get dramas(): { scene: string; action: string; stickers: {} }[] {
    return this.values.dramas;
  }
}
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

  @Provide("preferance")
  preferance: PreferanceData = new PreferanceData(this.world);

  @Provide("themes")
  theme: ThemeData = new ThemeData(this.world);

  data: DirectorData = new DirectorData();

  width = 0;
  height = 0;
  size = 0;

  @Ref("viewport")
  viewport: Viewport;

  @Ref("playbar")
  playbar: Playbar;

  @Ref("copy")
  copy: Vue;

  filmer: WebGLRenderer;
  svger: SVGRenderer;
  gif: GIF;
  apng: APNG;
  zip: ZIP;
  colort: string[];
  colors: { [key: string]: string };

  constructor() {
    super();
    this.filmer = new WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
    this.filmer.setPixelRatio(1);
    this.filmer.setClearColor(0xffffff, 0);
    this.svger = new SVGRenderer();
    this.gif = new GIF();
    this.apng = new APNG(this.filmer.domElement);
    this.zip = new ZIP();
    this.colors = COLORS;
    this.colort = ["R", "L", "F", "B", "U", "D", "High", "Gray"];
  }

  resize(): void {
    this.width = document.documentElement.clientWidth;
    this.height = document.documentElement.clientHeight;
    this.size = Math.ceil(Math.min(this.width / 6, this.height / 12));
    this.viewport?.resize(this.width, this.height - this.size * 3.6 - 32);
    this.playbar?.resize(this.size);
  }

  mounted(): void {
    new ClipboardJS(this.copy.$el);

    this.reload();
    this.world.controller.taps.push((index: number, face: number) => {
      this.stick(index, face);
    });

    this.world.callbacks.push(() => {
      this.callback();
    });
    this.$nextTick(this.resize);
    this.$nextTick(() => {
      this.preferance.refresh();
      this.theme.refresh();
    });
    this.loop();
  }

  callback(): void {
    if (this.recording && this.playbar.playing == false) {
      this.finish();
    }
  }

  reload(): void {
    let save;
    this.world.order = this.data.order;
    const order = this.world.order;
    save = this.data.dramas[order];
    if (!save) {
      save = { scene: "x2^", action: "RUR'U'~", stickers: {} };
      this.data.dramas[order] = save;
    }
    this.scene = save.scene;
    this.action = save.action;
    this.stickers = save.stickers;
    this.world.cube.strip({});
    for (const face of [FACE.L, FACE.R, FACE.D, FACE.U, FACE.B, FACE.F]) {
      const list = this.stickers[FACE[face]];
      if (!list) {
        continue;
      }
      for (const sticker in list) {
        const index = Number(sticker);
        const value = list[index];
        this.world.cube.stick(index, face, value);
      }
    }
  }

  loop(): void {
    requestAnimationFrame(this.loop.bind(this));
    this.viewport.draw();
    if (this.recording) {
      this.record();
    }
  }

  get style(): {} {
    return {
      width: this.size + "px",
      height: this.size + "px",
      "min-width": "0%",
      "min-height": "0%",
      "text-transform": "none",
      flex: 1,
    };
  }

  colord = false;
  outputd = false;
  tap(key: string): void {
    switch (key) {
      case "color":
        this.colord = true;
        break;
      case "output":
        this.outputd = true;
        break;
      case "snap":
        const snapt = this.data.snapt;
        if (snapt == "png") {
          this.png();
        } else if (snapt == "svg") {
          this.svg();
        }
        break;
      case "film":
        this.film();
        break;
      case "share":
        this.share();
        break;
      case "open":
        window.open(this.link);
        this.shared = false;
        break;
      default:
        break;
    }
  }

  shared = false;
  link = "";
  share(): void {
    const data: { [key: string]: {} } = {};
    const order = this.world.order;
    data["order"] = order;
    data["drama"] = this.data.dramas[order];
    let string = JSON.stringify(data);
    string = pako.deflate(string, { to: "string" });
    string = window.btoa(string);
    const search = "mode=player&data=" + string;
    this.link = window.location.origin + window.location.pathname + "?" + search;
    this.shared = true;
  }

  order(): void {
    this.data.order = this.world.order;
    this.data.save();
    this.reload();
    this.playbar.init();
  }

  scene = "";
  @Watch("scene")
  onSceneChange(): void {
    this.playbar.scene = this.scene;
    this.data.dramas[this.world.order].scene = this.scene;
    this.data.save();
  }

  action = "";
  @Watch("action")
  onActionChange(): void {
    this.playbar.action = this.action;
    this.data.dramas[this.world.order].action = this.action;
    this.data.save();
  }

  recording = false;

  color = "High";
  stickers: { [face: string]: { [index: number]: string } | undefined };
  stick(index: number, face: number): void {
    if (index < 0 || !this.colord) {
      this.colord = false;
      return;
    }
    const cubelet: Cubelet = this.world.cube.cubelets[index];
    index = cubelet.initial;
    face = cubelet.getColor(face);
    let arr = this.stickers[FACE[face]];
    if (arr == undefined) {
      arr = {};
      this.stickers[FACE[face]] = arr;
    }
    if (this.color == FACE[face]) {
      delete arr[index];
      this.world.cube.stick(index, face, "");
    } else {
      arr[index] = this.color;
      this.world.cube.stick(index, face, this.color);
    }
    this.data.dramas[this.world.order].stickers = this.stickers;
    this.data.save();
  }

  reset(): void {
    this.stickers = {};
    this.world.cube.strip({});
    this.data.dramas[this.world.order].stickers = this.stickers;
    this.data.save();
  }

  clear(): void {
    const strip: { [face: string]: number[] | undefined } = {};
    for (const face of [FACE.L, FACE.R, FACE.D, FACE.U, FACE.B, FACE.F]) {
      const key = FACE[face];
      const group = this.world.cube.groups.get(key);
      if (!group) {
        throw Error();
      }
      strip[key] = group.indices;
      let arr = this.stickers[FACE[face]];
      if (arr == undefined) {
        arr = {};
        this.stickers[FACE[face]] = arr;
      }
      for (const index of group.indices) {
        arr[index] = "remove";
      }
    }
    this.world.cube.strip(strip);
    this.data.dramas[this.world.order].stickers = this.stickers;
    this.data.save();
  }

  pixels: Uint8Array;
  film(): void {
    if (this.recording) {
      this.recording = false;
      this.world.controller.disable = false;
      this.playbar.toggle();
      return;
    }
    this.world.controller.disable = true;
    const pixel = this.data.pixel;
    const filmt = this.data.filmt;
    const delay = this.data.delay;
    this.filmer.setSize(pixel, pixel, true);
    if (filmt == "gif") {
      this.pixels = new Uint8Array(pixel * pixel * 4);
      this.gif.start(pixel, pixel, delay);
      this.filmer.setClearColor(0xffffff, 1);
    } else if (filmt == "apng") {
      this.apng.delayNum = delay;
      this.apng.start();
      this.filmer.setClearColor(0xffffff, 0);
    } else if (filmt == "pngs") {
      this.zip.init();
      this.filmer.setClearColor(0xffffff, 0);
    }
    this.playbar.init();
    this.playbar.toggle();
    this.record();
    this.recording = true;
  }

  png(): void {
    const pixel = this.data.pixel;
    const width = this.world.width;
    const height = this.world.height;
    this.world.width = pixel;
    this.world.height = pixel;
    this.world.resize();
    this.filmer.setSize(pixel, pixel, true);
    this.filmer.setClearColor(0xffffff, 0);
    this.filmer.clear();
    this.filmer.render(this.world.scene, this.world.camera);
    this.world.width = width;
    this.world.height = height;
    this.world.resize();
    const content = this.filmer.domElement.toDataURL("image/png");
    const parts = content.split(";base64,");
    const type = parts[0].split(":")[1];
    const raw = window.atob(parts[1]);
    const length = raw.length;
    const data = new Uint8Array(length);
    for (let i = 0; i < length; ++i) {
      data[i] = raw.charCodeAt(i);
    }
    const blob = new Blob([data], { type: type });
    const url = URL.createObjectURL(blob);
    Util.DOWNLOAD("cuber", "png", url);
  }

  svg(): void {
    const position: Vector3 = new Vector3();
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
    const pixel = this.data.pixel;
    this.svger.setSize(pixel, pixel);
    this.svger.clear();
    this.svger.overdraw = 0;
    this.svger.render(this.world.scene, this.world.camera);
    this.world.resize();
    const serializer = new XMLSerializer();
    const content = serializer.serializeToString(this.svger.domElement);
    const url = "data:image/svg+xml;base64," + btoa(content);
    Util.DOWNLOAD("cuber", "svg", url);
  }

  record(): void {
    const pixel = this.data.pixel;
    const filmt = this.data.filmt;
    const width = this.world.width;
    const height = this.world.height;
    this.world.width = pixel;
    this.world.height = pixel;
    this.world.resize();
    this.filmer.clear();
    this.filmer.render(this.world.scene, this.world.camera);
    if (filmt == "gif") {
      const content = this.filmer.getContext();
      content.readPixels(0, 0, pixel, pixel, content.RGBA, content.UNSIGNED_BYTE, this.pixels);
      this.gif.add(this.pixels);
    } else if (filmt == "apng") {
      this.apng.addFrame();
    } else if (filmt == "pngs") {
      const content = this.filmer.domElement.toDataURL("image/png");
      const parts = content.split(";base64,");
      const raw = window.atob(parts[1]);
      const length = raw.length;
      const data = new Uint8Array(length);
      for (let i = 0; i < length; ++i) {
        data[i] = raw.charCodeAt(i);
      }
      this.zip.add("cuber" + this.zip.num + ".png", data);
    }
    this.world.width = width;
    this.world.height = height;
    this.world.resize();
  }

  finish(): void {
    const filmt = this.data.filmt;
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
      const blob = new Blob([data], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      Util.DOWNLOAD("cuber", "zip", url);
    }
  }

  scriptd = false;
}
