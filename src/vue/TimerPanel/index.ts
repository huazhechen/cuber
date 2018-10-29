import Vue from "vue";
import { Component, Inject, Prop, Watch } from "vue-property-decorator";
import Game from "../../cube/game";

@Component({
  template: require("./index.html")
})
export default class TimerPanel extends Vue {
  @Inject("game")
  game: Game;

  mounted() {
    this.onShowChange(this.show);
  }

  @Prop({ default: false })
  show: boolean;

  @Watch("show")
  onShowChange(value: boolean) {
    if (value) {
      this.init();
      document.addEventListener("keydown", this.onKeyDown);
      document.addEventListener("keyup", this.onKeyUp);
    } else {
      document.removeEventListener("keydown", this.onKeyDown);
      document.removeEventListener("keyup", this.onKeyUp);
    }
  }

  onKeyDown(e: KeyboardEvent) {
    var key = e.keyCode;
    if (key == 32) {
      this.down();
    }
  }

  onKeyUp(e: KeyboardEvent) {
    var key = e.keyCode;
    if (key == 32) {
      this.up();
    }
  }

  init() {
    if (this.scramble != "") {
      this.game.twister.twist("#x2", false, 1, null, true);
      this.game.twister.twist(this.scramble, false, 1, null, true);
    }
  }

  @Watch("scramble")
  onScrambleChange(to: string, from: string) {
    let storage = window.localStorage;
    storage.setItem("timer.scramble", this.scramble);
    if (this.show) {
      this.init();
    }
  }

  scramble: string = window.localStorage.getItem("timer.scramble") || this.game.random();

  start: number = 0;
  lapse: number = Number(window.localStorage.getItem("timer.lapse") || 0);
  get time() {
    let min = Math.floor(this.lapse / 1000 / 60);
    let sec = Math.floor((this.lapse % (1000 * 60)) / 1000);
    let ms = this.lapse % 1000;
    return (
      (min == 0 ? "" : String(min) + ":") +
      ((min == 0 ? "" : "0") + String(sec)).substr(-2) +
      ":" +
      (this.intervalTask == 0 ? ("0" + String(Math.floor(ms / 10))).substr(-2) : Math.floor(ms / 100))
    );
  }

  get lock() {
    if (this.press || this.intervalTask != 0 || this.timeoutTask != 0) {
      return true;
    }
    return false;
  }

  random() {
    this.scramble = this.game.random();
  }

  timeoutTask = 0;
  intervalTask = 0;

  down() {
    if (this.scramble == "") {
      return;
    }
    if (this.press == true) {
      return;
    }
    if (this.intervalTask != 0) {
      this.press = false;
      clearInterval(this.intervalTask);
      this.intervalTask = 0;
      let date = new Date();
      this.lapse = date.getTime() - this.start;
      let storage = window.localStorage;
      storage.setItem("timer.lapse", String(this.lapse));
      this.start = 0;
    } else {
      this.press = true;
      clearTimeout(this.timeoutTask);
      this.timeoutTask = setTimeout(() => {
        this.lapse = 0;
        this.timeoutTask = 0;
      }, 550);
    }
  }
  press: boolean = false;

  get color() {
    if (this.press) {
      if (this.timeoutTask != 0) {
        return "red--text";
      }
      return "green--text";
    }
    return "black--text";
  }

  up() {
    if (this.press && this.timeoutTask == 0) {
      let date = new Date();
      this.start = date.getTime();
      clearInterval(this.intervalTask);
      this.intervalTask = setInterval(() => {
        let date = new Date();
        this.lapse = date.getTime() - this.start;
      }, 100);
    } else {
      clearTimeout(this.timeoutTask);
      this.timeoutTask = 0;
    }
    this.press = false;
  }
}
