import Vue, { VNode } from "vue";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";
import "material-design-icons/iconfont/material-icons.css";
import "./index.css";
import Playground from "./vue/Playground";
import Director from "./vue/Director";
import Player from "./vue/Player";
import Helper from "./vue/Helper";
import Algs from "./vue/Algs";
import { VueConstructor } from "vue/types/umd";

/* eslint-disable */
var _hmt: any = _hmt || [];
(function () {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?e3fd96123e7614cd5ea9dc70df73217f";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode?.insertBefore(hm, s);
})();
/* eslint-disable */

Vue.use(Vuetify);
const opts = {};
const vuetify = new Vuetify(opts);
Vue.prototype.vuetify = vuetify;

const search = location.search || "";
const list = search.match(/(\?|\&)mode=([^&]*)(&|$)/);
const mode = list ? list[2] : "playground";
Vue.prototype.mode = mode;

let app: VueConstructor;
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
const vm = new Vue({
  vuetify,
  el: "#app",
  render: (h): VNode => h(app),
});
export default vm;
