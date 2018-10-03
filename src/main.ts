import Vue from "vue";
import App from "./vue/app";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.css";
import "typeface-roboto";
import "material-design-icons/iconfont/material-icons.css";
import VueSlider from "./vue/slider";

Vue.use(Vuetify);
Vue.component('vue-slider', VueSlider)

new Vue({
  el: "#app",
  render: h => h(App)
});
