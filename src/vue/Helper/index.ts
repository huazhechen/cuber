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
import { TwistNode } from "../../cuber/twister";

export class HelperData {
  private values = {
    version: "0.2",
    stickers: {},
    history: "",
  };

  constructor() {
    this.load();
  }

  load(): void {
    const save = window.localStorage.getItem("helper");
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
    window.localStorage.setItem("helper", JSON.stringify(this.values));
  }

  get stickers(): { [face: string]: { [index: number]: string } | undefined } {
    return this.values.stickers;
  }

  set stickers(value: { [face: string]: { [index: number]: string } | undefined }) {
    this.values.stickers = value;
  }

  get history(): string {
    return this.values.history;
  }

  set history(value: string) {
    this.values.history = value;
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

  solver: Solver = new Solver();

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
    this.colort = ["R", "F", "D", "L", "B", "U"];
  }

  resize(): void {
    this.width = document.documentElement.clientWidth;
    this.height = document.documentElement.clientHeight;
    this.size = Math.ceil(Math.min(this.width / 6, this.height / 12));
    this.viewport?.resize(this.width, this.height - this.size * 4);
  }

  mounted(): void {
    new ClipboardJS(this.copy.$el);
    this.world.callbacks.push(() => {
      this.callback();
    });

    this.setting.items["order"].disable = true;
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

  callback(): void {
    this.data.history = this.world.cube.history.exp;
    this.data.save();
  }

  clear(): void {
    this.stickers = {};
    this.data.stickers = this.stickers;
    this.data.save();
    this.reload();
  }

  reset(): void {
    this.world.cube.reset();
    this.stickers = {};
    for (const face of [FACE.L, FACE.R, FACE.D, FACE.U, FACE.B, FACE.F]) {
      const key = FACE[face];
      const group = this.world.cube.table.face(key);
      const list = [];
      for (const indice of group.indices) {
        list[indice] = key;
      }
      this.stickers[FACE[face]] = list;
    }
    this.data.stickers = this.stickers;
    this.data.save();
    this.reload();
  }

  reload(): void {
    this.world.order = 3;
    this.stickers = this.data.stickers;
    const node = new TwistNode(this.data.history);
    const list = node.parse();
    for (const action of list) {
      this.world.cube.twister.twist(action, true, true);
    }
    this.callback();

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
    this.state = this.world.cube.serialize();
  }

  loop(): void {
    requestAnimationFrame(this.loop.bind(this));
    this.viewport.draw();
    this.solver.init();
  }

  get style(): unknown {
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
  stickers: { [face: string]: { [index: number]: string } | undefined } = {};
  state = "";
  get faces(): { [face: string]: number } {
    const ret: { [face: string]: number } = {};
    for (const face of [FACE.L, FACE.R, FACE.D, FACE.U, FACE.B, FACE.F]) {
      const key = FACE[face];
      ret[key] = 0;
    }
    for (const c of this.state) {
      ret[c]++;
    }
    return ret;
  }

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
    arr[index] = this.color;
    this.world.cube.stick(index, face, this.color);
    this.data.stickers = this.stickers;
    this.data.save();
    this.state = this.world.cube.serialize();
  }

  solutiond = false;
  solution = "";
  solve(): void {
    const state = this.world.cube.serialize();
    this.solution = this.solver.solve(state);
    if (this.solution.length == 0) {
      this.solution = "error: solved";
    }
    this.solutiond = true;
    return;
  }

  play(): void {
    const data: { [key: string]: unknown } = {};
    const order = this.world.order;
    data["order"] = order;
    const drama = { scene: this.world.cube.history.exp, action: this.solution, stickers: this.stickers };
    data["drama"] = drama;
    let string = JSON.stringify(data);
    string = window.btoa(string);
    const search = "mode=player&data=" + string;
    const link = window.location.origin + window.location.pathname + "?" + search;
    window.open(link);
  }
}
