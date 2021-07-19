import Vue from "vue";
import { Component, Watch, Provide, Ref } from "vue-property-decorator";
import Viewport from "../Viewport";
import Setting from "../Setting";
import Playbar from "../Playbar";
import World from "../../cuber/world";
import Capture from "./capture";
import { PreferanceData, PaletteData } from "../../data";

export class AlgItem {
  name: string;
  order: number;
  origin: string;
  exp: string;
  scramble: boolean;
}

export class AlgGroup {
  name: string;
  strip: { [face: string]: number[] | undefined };
  mutable: boolean;
  items: AlgItem[];
}

export class AlgsData {
  algs: AlgGroup[] = require("./algs.json");
  private values: {
    version: string;
    position: { group: number; index: number };
    modify: string[][];
  } = {
    version: "0.6",
    position: { group: 0, index: 0 },
    modify: [[], [], []],
  };

  constructor() {
    this.load();
  }

  load(): void {
    const save = window.localStorage.getItem("algs");
    if (save) {
      const data = JSON.parse(save);
      if (data.version != this.values.version) {
        this.save();
      } else {
        this.values = data;
      }
    }
    for (let i = 0; i < this.algs.length; i++) {
      const group = this.algs[i];
      const modify = this.values.modify[i];
      for (let j = 0; j < group.items.length; j++) {
        const alg = group.items[j];
        const exp = modify[j];
        if (exp && exp.length > 0) {
          alg.exp = exp;
        } else {
          alg.exp = alg.origin;
        }
      }
    }
  }

  modify(i: number, j: number, exp: string): void {
    const alg = this.algs[i].items[j];
    if (exp == alg.origin) {
      this.values.modify[i][j] = "";
    } else {
      this.values.modify[i][j] = exp;
    }
    alg.exp = exp;
  }

  save(): void {
    window.localStorage.setItem("algs", JSON.stringify(this.values));
  }

  get position(): { group: number; index: number } {
    return this.values.position;
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
export default class Algs extends Vue {
  @Provide("world")
  world: World = new World();

  @Provide("preferance")
  preferance: PreferanceData = new PreferanceData(this.world);

  @Provide("palette")
  palette: PaletteData = new PaletteData(this.world);

  data: AlgsData = new AlgsData();

  capture: Capture = new Capture();

  width = 320;
  height = 640;
  size = 0;

  @Ref("viewport")
  viewport: Viewport;

  @Ref("playbar")
  playbar: Playbar;

  @Ref("setting")
  setting: Setting;

  constructor() {
    super();
  }

  tab = "tab-0";
  pics: string[][] = [];

  mounted(): void {
    this.setting.items["order"].disable = true;
    for (let i = 0; i < this.data.algs.length; i++) {
      this.pics.push([]);
    }
    this.$nextTick(this.resize);
    this.$nextTick(() => {
      this.preferance.refresh();
      this.palette.refresh();
    });
    this.reload();
    this.loop();
  }

  snap(i: number, j: number): string {
    const group = this.data.algs[i];
    const alg = group.items[j];
    const origin = alg.origin;
    const scramble = alg.scramble;
    let exp = alg.exp ? alg.exp : origin;
    if (scramble) {
      exp = "x2 " + exp;
    } else {
      exp = "x2 " + "(" + exp + ")'";
    }
    const order = alg.order ? alg.order : 3;
    return this.capture.snap(group.strip, exp, order);
  }

  loop(): void {
    requestAnimationFrame(this.loop.bind(this));
    if (this.viewport.draw()) {
      return;
    }
    for (let i = 0; i < 2; i++) {
      this.pics.some((pics, i) => {
        const group = this.data.algs[i];
        if (pics.length >= group.items.length) {
          return false;
        }
        const j = pics.length;
        pics.push(this.snap(i, j));
        return true;
      });
    }
  }

  resize(): void {
    this.width = document.documentElement.clientWidth;
    this.height = document.documentElement.clientHeight;
    this.size = Math.ceil(Math.min(this.width / 6, this.height / 12));
    this.viewport?.resize(this.width, this.height - this.size * 3.5);
    this.playbar?.resize(this.size);
  }

  get grid(): number {
    const min = Math.min(this.width / 4, this.height / 6);
    const num = ~~(this.width / min);
    const result = ~~(this.width / num);
    return result;
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

  listd = false;
  tap(key: string): void {
    switch (key) {
      case "list":
        this.listd = true;
        break;
      default:
        break;
    }
  }

  reload(): void {
    this.data.save();
    const group = this.data.algs[this.data.position.group];
    const alg = group.items[this.data.position.index];
    const order = alg.order ? alg.order : 3;
    if (order != this.world.order) {
      this.world.order = order;
      this.preferance.refresh();
    }
    const strip = group.strip;
    this.world.cube.strip(strip);
    this.name = alg.name;
    this.origin = alg.origin;
    this.action = alg.exp;
    const exp = "x2" + (alg.scramble ? "" : "^");
    this.playbar.scene = exp;
  }

  name = "";
  origin = "";
  action = "";
  @Watch("action")
  onActionChange(): void {
    const pos = this.data.position;
    this.data.modify(pos.group, pos.index, this.action);
    this.data.save();
    if (this.pics[pos.group][pos.index]) {
      this.pics[pos.group][pos.index] = this.snap(pos.group, pos.index);
    }
    this.playbar.action = this.action;
  }

  select(i: number, j: number): void {
    this.data.position.group = i;
    this.data.position.index = j;
    this.reload();
    this.listd = false;
  }
}
