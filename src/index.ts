import Vue from "vue";
import "./index.css";
import "vuetify/dist/vuetify.css";
import Vuetify from "vuetify";
import App from "./vue/App";

Vue.use(Vuetify);
const opts = {};
const vuetify = new Vuetify(opts);

new Vue({
  vuetify,
  el: "#app",
  render: h => h(App)
});
