import Vue from "vue";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.css";
import "material-design-icons/iconfont/material-icons.css";
import "./index.css";
import Playground from "./vue/Playground";
import Director from "./vue/Director";
import Algs from "./vue/Algs";
import Player from "./vue/Player";
import { VueConstructor } from "vue/types/umd";

var _hmt: any = _hmt || [];
(function () {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?e3fd96123e7614cd5ea9dc70df73217f";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode?.insertBefore(hm, s);
})();

if (navigator.serviceWorker != null) {
  navigator.serviceWorker.register("./service-worker.js");
}

Vue.use(Vuetify);
const opts = {};
const vuetify = new Vuetify(opts);
Vue.prototype.vuetify = vuetify;

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
  case "player":
    app = Player;
    break;
  default:
    app = Playground;
    break;
}
let vm = new Vue({
  vuetify,
  el: "#app",
  render: (h) => h(app),
});
export default vm;
