import Vue from "vue";
import { Component } from "vue-property-decorator";
import Order from "../Order";
import Control from "../Control";
import Appear from "../Appear";

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
    appear: Appear
  }
})
export default class Setting extends Vue {
  menu: boolean = false;

  items: { [key: string]: SettingItem } = {};

  constructor() {
    super();
    this.items["order"] = new SettingItem("阶数选择");
    this.items["control"] = new SettingItem("操作设置");
    this.items["appear"] = new SettingItem("外观设置");
    this.items["theme"] = new SettingItem("主题设置");
    this.items["theme"].disable = true;
  }
  mounted() {
    this.resize();
  }

  width: number = 0;
  height: number = 0;
  size: number = 0;

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.size = Math.ceil(Math.min(this.width / 6, this.height / 12));
  }

  reset() {
    let storage = window.localStorage;
    storage.clear();
    window.location.reload();
  }

  resetd: boolean = false;
  tap(key: string | SettingItem) {
    switch (key) {
      case "playground":
      case "director":
      case "algs":
        let search = location.search || "";
        let list = search.match(/(\?|\&)mode=([^&]*)(&|$)/);
        let mode = list ? list[2] : "playground";
        if (mode != key) {
          window.location.search = "mode=" + key;
        }
        break;
      case "code":
        window.location.href = "https://gitee.com/huazhechen/cuber";
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
