import Vue from "vue";
import App from "./vue/App";
import Vuetify from "vuetify";
import "material-design-icons/iconfont/material-icons.css";
import "vuetify/dist/vuetify.css";
import "typeface-roboto";
import FastButton from "./vue/FastButton";

Vue.use(Vuetify);
Vue.component("fast-button", FastButton);

new Vue({
  el: "#app",
  render: h => h(App)
});
