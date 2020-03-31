import Vue from "vue";
import Vuetify, {
  VApp,
  VCard,
  VTabs,
  VTab,
  VBtn,
  VTabItem,
  VIcon,
  VDialog,
  VSlider,
  Resize,
  VCardTitle,
  VFlex,
  VLayout,
  VContainer,
  VTextField,
  VBottomSheet,
  VTabsItems,
  VCardActions
} from "vuetify/lib";
import "material-design-icons/iconfont/material-icons.css";
import "./index.css";
import cuber from "./cuber";
import Playground from "./vue/Playground";
import Director from "./vue/Director";
import { VueConstructor } from "vue/types/umd";
import Algs from "./vue/Algs";

Vue.use(Vuetify, {
  components: {
    VApp,
    VBtn,
    VIcon,
    VDialog,
    VBottomSheet,
    VContainer,
    VLayout,
    VFlex,
    VTextField,
    VCard,
    VCardTitle,
    VCardActions,
    VTabs,
    VTab,
    VTabItem,
    VTabsItems,
    VSlider
  },
  directives: {
    Resize
  }
});
const opts = {};
const vuetify = new Vuetify(opts);
Vue.prototype.cuber = cuber;

let search = location.search || "";
let list = search.match(/(\?|\&)mode=([^&]*)(&|$)/);
let mode = list ? list[2] : "playground";
Vue.prototype.mode = mode;

let app: VueConstructor;
switch (mode) {
  case "director":
    app = Director;
    break;
  case "algs":
    app = Algs;
    break;
  default:
    app = Playground;
    break;
}
new Vue({
  vuetify,
  el: "#app",
  render: h => h(app)
});
