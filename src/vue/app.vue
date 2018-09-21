<template>
  <v-app>
      <v-btn fixed top left icon large outline @click.stop="drawer = !drawer">
          <v-icon>menu</v-icon>
      </v-btn>
      <div id=cuber></div>
      <v-navigation-drawer v-model="drawer" fixed temporary>
      </v-navigation-drawer>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import Game from "../cube/game";

@Component
export default class App extends Vue {
  drawer: boolean = false;
  props: {
    source: String;
  };
  mounted() {
    let cuber = document.querySelector("#cuber");
    if (null != cuber) {
      let game = new Game(cuber);
    }
  }
}
</script>
