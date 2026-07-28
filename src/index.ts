import { createApp, h, type Component as VueComponent } from "vue";
import { toNative } from "vue-facing-decorator";
import "vuetify/styles";
import "material-design-icons/iconfont/material-icons.css";
import "./index.css";
import Playground from "./vue/Playground";
import Director from "./vue/Director";
import Player from "./vue/Player";
import Helper from "./vue/Helper";
import Algs from "./vue/Algs";
import { VBtnCompat, VFlexCompat, VLayoutCompat } from "./vue/compat";
import { vuetify } from "./vue/vuetify";

/* eslint-disable */
var _hmt: any = _hmt || [];
(function () {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?e3fd96123e7614cd5ea9dc70df73217f";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode?.insertBefore(hm, s);
})();
/* eslint-disable */

const search = location.search || "";
const list = search.match(/(\?|\&)mode=([^&]*)(&|$)/);
const mode = list ? list[2] : "playground";

let app: VueComponent;
switch (mode) {
  case "director":
    app = Director;
    break;
  case "algs":
    app = Algs;
    break;
  case "player":
    app = Player;
    break;
  case "helper":
    app = Helper;
    break;
  case "reset":
    window.localStorage.clear();
    const link = window.location.origin + window.location.pathname;
    window.location.replace(link);
    break;
  default:
    app = Playground;
    break;
}
const vm = createApp({
  render: () => h(toNative(app as never)),
});

vm.use(vuetify);
vm.component("v-btn", VBtnCompat);
vm.component("v-layout", VLayoutCompat);
vm.component("v-flex", VFlexCompat);
vm.directive("resize", {
  mounted(el, binding) {
    const callback = binding.value;
    if (typeof callback !== "function") {
      return;
    }
    const handler = () => callback();
    window.addEventListener("resize", handler);
    (el as HTMLElement & { __resizeHandler?: () => void }).__resizeHandler = handler;
  },
  unmounted(el) {
    const handler = (el as HTMLElement & { __resizeHandler?: () => void }).__resizeHandler;
    if (handler) {
      window.removeEventListener("resize", handler);
    }
  },
});
vm.config.globalProperties.mode = mode;
vm.config.globalProperties.vuetify = vuetify;
vm.mount("#app");

export default vm;
