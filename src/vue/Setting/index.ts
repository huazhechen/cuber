import Vue from "vue";
import { Component } from "vue-property-decorator";
import Order from "../Order";
import Control from "../Control";
import Appear from "../Appear";
import Theme from "../Theme";

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
    control: Control,
    appear: Appear,
    theme: Theme,
  },
})
export default class Setting extends Vue {
  menu = false;

  items: { [key: string]: SettingItem } = {};

  constructor() {
    super();
    this.items["order"] = new SettingItem("阶数选择");
    this.items["control"] = new SettingItem("操作设置");
    this.items["appear"] = new SettingItem("外观设置");
    this.items["theme"] = new SettingItem("主题设置");
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

  reset(): void {
    window.localStorage.clear();
    window.location.reload();
  }

  resetd = false;
  tap(key: string | SettingItem): void {
    switch (key) {
      case "playground":
      case "director":
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
      case "help":
        window.open("https://gitee.com/huazhechen/cuber/blob/master/README.md");
        break;
      case "reset":
        this.resetd = true;
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
