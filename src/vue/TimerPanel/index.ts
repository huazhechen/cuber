import Vue from "vue";
import { Component, Inject, Prop, Watch } from "vue-property-decorator";
import Game from "../../cube/game";

@Component({
  template: require("./index.html")
})
export default class TimerPanel extends Vue {
  @Inject("game")
  game: Game;

  @Prop({ default: false })
  show: boolean;

  @Watch("show")
  onShowChange(to: boolean, from: boolean) {
    if (to) {
      if (this.exp == "") {
        this.random();
      }
      this.init();
    }
  }

  init() {
    this.game.twister.twist("#x2", false, 1, null, true);
    this.game.twister.twist(this.exp, false, 1, null, true);
  }

  @Watch("exp")
  onExpChange(to: string, from: string) {
    let storage = window.localStorage;
    storage.setItem("timer.exp", this.exp);
  }

  exp: string = window.localStorage.getItem("timer.exp") || "";

  start: number = 0;
  lapse: number = Number(window.localStorage.getItem("timer.lapse") || 0);
  get time() {
    let min = Math.floor(this.lapse / 1000 / 60);
    let sec = Math.floor((this.lapse % (1000 * 60)) / 1000);
    let ms = Math.floor((this.lapse % 1000) / 10);
    return (
      (min == 0 ? "" : String(min) + ":") +
      ("0" + String(sec)).substr(-2) +
      ":" +
      ("0" + String(ms)).substr(-2)
    );
  }

  get lock() {
    if (this.press || this.intervalTask != 0 || this.timeoutTask != 0) {
      return true;
    }
    return false;
  }

  random() {
    if (!this.lock) {
      this.exp = this.game.twister.random();
      this.init();
    }
  }

  timeoutTask = 0;
  intervalTask = 0;

  down() {
    this.press = true;
    if (this.lapse != 0) {
      if (this.start != 0) {
        clearInterval(this.intervalTask);
        this.intervalTask = 0;
        let date = new Date();
        this.lapse = date.getTime() - this.start;
        let storage = window.localStorage;
        storage.setItem("timer.lapse", String(this.lapse));
        this.start = 0;
      } else {
        clearTimeout(this.timeoutTask);
        this.timeoutTask = setTimeout(() => {
          this.lapse = 0;
          this.timeoutTask = 0;
        }, 1000);
      }
    }
  }
  press: boolean = false;

  get color() {
    if (this.press) {
      if (this.timeoutTask != 0) {
        return "red--text";
      }
      if (this.lapse == 0) {
        return "green--text";
      }
    }
    return "black--text";
  }

  up() {
    this.press = false;
    clearTimeout(this.timeoutTask);
    this.timeoutTask = 0;
    if (this.lapse == 0) {
      let date = new Date();
      this.start = date.getTime();
      clearInterval(this.intervalTask);
      this.intervalTask = setInterval(() => {
        let date = new Date();
        this.lapse = date.getTime() - this.start;
      }, 100);
    }
  }
}
