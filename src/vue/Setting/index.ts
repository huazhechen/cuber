import Vue from "vue";
import { Component } from "vue-property-decorator";
import Order from "../Menu/Order";
import Control from "../Menu/Control";
import Appear from "../Menu/Appear";
import Camera from "../Menu/Camera";
import Palette from "../Menu/Palette";
import About from "../Menu/About";

export class SettingItem {
  label: string;
  show: boolean;
  disable: boolean;
  value: boolean;
  emit: string | undefined;

  constructor(label: string, emit: string | undefined = undefined) {
    this.label = label;
    this.show = true;
    this.disable = false;
    this.value = false;
    this.emit = emit;
  }
}

@Component({
  template: require("./index.html"),
  components: {
    order: Order,
    appear: Appear,
    camera: Camera,
    control: Control,
    palette: Palette,
    about: About,
  },
})
export default class Setting extends Vue {
  menu = false;

  items: { [key: string]: SettingItem } = {};

  constructor() {
    super();
    this.items["order"] = new SettingItem("阶数");
    this.items["control"] = new SettingItem("控制");
    this.items["appear"] = new SettingItem("显示");
    this.items["camera"] = new SettingItem("镜头");
    this.items["palette"] = new SettingItem("配色");
    this.items["about"] = new SettingItem("关于");
  }
  mounted(): void {
    this.resize();
  }

  width = 0;
  height = 0;
  size = 0;

  resize(): void {
    this.width = document.documentElement.clientWidth;
    this.height = document.documentElement.clientHeight;
    this.size = Math.ceil(Math.min(this.width / 6, this.height / 12));
  }

  tap(key: string | SettingItem): void {
    switch (key) {
      case "playground":
      case "director":
      case "helper":
      case "algs":
        let search = location.search || "";
        const list = search.match(/(\?|\&)mode=([^&]*)(&|$)/);
        const mode = list ? list[2] : "playground";
        if (mode != key) {
          search = key === "playground" ? "" : "?mode=" + key;
          const link = window.location.origin + window.location.pathname + search;
          window.location.replace(link);
        }
        break;
      default:
        if (key instanceof SettingItem) {
          if (key.emit) {
            this.$emit(key.emit);
          } else {
            key.value = true;
          }
        }
        break;
    }
    this.menu = false;
  }
}
