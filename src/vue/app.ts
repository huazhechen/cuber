import Vue from "vue";
import Component from "vue-class-component";
import Game from "../cube/game";

interface MenuItem {
  title: string;
}

@Component({
  template: require("./app.html")
})
export default class App extends Vue {
  menu: boolean = false;
  tab: string = "tab-显示设置";
  snackbar: boolean = false;
  message: string = "";

  items: MenuItem[] = [
    {
      title: "显示设置"
    },
    {
      title: "模式设置"
    },
    {
      title: "关于"
    }
  ];
  onMenuItemClick(item: MenuItem) {
    this.message = item.title;
    this.snackbar = true;
    this.menu = false;
  }
  mounted() {
    let cuber = document.querySelector("#cuber");
    if (null != cuber) {
      let game = new Game(cuber);
    }
  }
}
