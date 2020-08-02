import Vue from "vue";
import { Component, Provide, Ref } from "vue-property-decorator";

import Viewport from "../Viewport";
import { COLORS, FACE } from "../../cuber/define";
import Cubelet from "../../cuber/cubelet";
import Setting from "../Setting";
import World from "../../cuber/world";
import { PreferanceData, PaletteData } from "../../data";
import Solver from "../../solver/Solver";
import ClipboardJS from "clipboard";
import pako from "pako";

export class HelperData {
  private values = {
    version: "0.1",
    stickers: {},
  };

  constructor() {
    this.load();
  }

  load(): void {
    const save = window.localStorage.getItem("solver");
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
    window.localStorage.setItem("solver", JSON.stringify(this.values));
  }

  get stickers(): { [face: string]: { [index: number]: string } | undefined } {
    return this.values.stickers;
  }

  set stickers(value) {
    this.values.stickers = value;
  }
}

@Component({
  template: require("./index.html"),
  components: {
    viewport: Viewport,
    setting: Setting,
  },
})
export default class Helper extends Vue {
  @Provide("world")
  world: World = new World();

  @Provide("preferance")
  preferance: PreferanceData = new PreferanceData(this.world);

  @Provide("palette")
  palette: PaletteData = new PaletteData(this.world);

  data: HelperData = new HelperData();

  searcher: Solver = new Solver();

  width = 0;
  height = 0;
  size = 0;

  @Ref("viewport")
  viewport: Viewport;

  @Ref("setting")
  setting: Setting;

  @Ref("copy")
  copy: Vue;

  colort: string[];
  colors: { [key: string]: string };

  constructor() {
    super();
    this.colors = COLORS;
    this.colort = ["R", "L", "F", "B", "U", "D"];
  }

  resize(): void {
    this.width = document.documentElement.clientWidth;
    this.height = document.documentElement.clientHeight;
    this.size = Math.ceil(Math.min(this.width / 6, this.height / 12));
    this.viewport?.resize(this.width, this.height - this.size * 3.6 - 32);
  }

  mounted(): void {
    new ClipboardJS(this.copy.$el);

    this.setting.items["order"].disable = true;
    this.stickers = {};
    this.reload();
    this.world.controller.taps.push((index: number, face: number) => {
      this.stick(index, face);
    });

    this.$nextTick(this.resize);
    this.$nextTick(() => {
      this.preferance.refresh();
      this.palette.refresh();
    });
    this.loop();
  }

  clear(): void {
    this.stickers = {};
    this.data.stickers = this.stickers;
    this.data.save();
    this.reload();
  }

  reload(): void {
    this.world.order = 3;
    if (!this.data.stickers) {
      this.data.stickers = {};
    }
    this.stickers = this.data.stickers;

    const strip: { [face: string]: number[] | undefined } = {};
    for (const face of [FACE.L, FACE.R, FACE.D, FACE.U, FACE.B, FACE.F]) {
      const key = FACE[face];
      const group = this.world.cube.table.face(key);
      strip[key] = group.indices;
    }
    this.world.cube.strip(strip);
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
    this.searcher.init();
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

  color = "R";
  stickers: { [face: string]: { [index: number]: string } | undefined };
  stick(index: number, face: number): void {
    if (index < 0) {
      return;
    }
    const cubelet: Cubelet = this.world.cube.cubelets[index];
    index = cubelet.initial;
    face = cubelet.getFace(face);
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
    this.data.stickers = this.stickers;
    this.data.save();
  }

  solutiond = false;
  solution = "";
  solve(): void {
    const state = this.world.cube.serialize();
    this.solution = this.searcher.solve(state);
    this.solutiond = true;
    return;
  }

  play(): void {
    const data: { [key: string]: {} } = {};
    const order = this.world.order;
    data["order"] = order;
    const drama = { scene: "^", action: this.solution, stickers: this.stickers };
    data["drama"] = drama;
    let string = JSON.stringify(data);
    string = pako.deflate(string, { to: "string" });
    string = window.btoa(string);
    const search = "mode=player&data=" + string;
    const link = window.location.origin + window.location.pathname + "?" + search;
    window.open(link);
  }
}
