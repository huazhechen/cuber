import Vue from "vue";
import App from "./vue/App";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.css";
import "typeface-roboto";
import "material-design-icons/iconfont/material-icons.css";

Vue.use(Vuetify);

new Vue({
  el: "#app",
  render: h => h(App)
});
