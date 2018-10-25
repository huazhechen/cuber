import Vue from "vue";
import { Component, Prop, Watch, Inject } from "vue-property-decorator";
import { TwistAction, TwistNode } from "../../cube/twister";
import Game from "../../cube/game";
import Database from "../../common/Database";

@Component({
  template: require("./index.html")
})
export default class ScriptPanel extends Vue {
  @Inject("game")
  game: Game;

  @Inject("database")
  database: Database;

  @Prop({ default: false })
  show: boolean;

  @Watch("show")
  onShowChange(to: boolean = this.show, from: boolean = this.show) {
    if (to) {
      this.onTypeChange();
      this.onIndexChange();
      this.onScriptChange();
      this.onExpChange(this.exp);
    } else {
      this.playing = false;
      if (from) {
        this.stick();
      }
    }
  }

  mounted() {
    this.onShowChange();
  }

  progress: number = 0;

  playing: boolean = false;

  play() {
    if (this.progress == this.actions.length) {
      this.playing = false;
    }
    if (this.playing) {
      let action = this.actions[this.progress];
      this.progress++;
      this.game.twister.twist(action.exp, action.reverse, action.times, this.play, false);
    }
  }

  forward() {
    if (this.progress == this.actions.length) {
      return;
    }
    this.playing = false;
    let action = this.actions[this.progress];
    this.progress++;
    this.game.twister.twist(action.exp, action.reverse, action.times);
  }

  backward() {
    if (this.progress == 0) {
      return;
    }
    this.playing = false;
    this.progress--;
    let action = this.actions[this.progress];
    this.game.twister.twist(action.exp, !action.reverse, action.times);
  }

  type: number = Number(window.localStorage.getItem("script.type") || 0);
  index: number = Number(window.localStorage.getItem("script.index") || 1);

  stick() {
    this.game.cube.stick();
    this.game.dirty = true;
  }

  strip() {
    let strips = this.database.scripts[this.type].strips;
    for (let strip of strips) {
      for (let index of strip.indexes) {
        this.game.cube.strip(index, strip.faces);
      }
    }
    this.game.dirty = true;
  }

  @Watch("index")
  onIndexChange() {
    let length = this.database.scripts[this.type].scripts.length;
    this.index;
    while (this.index < 1) {
      this.index = this.index + length;
    }
    while (this.index > length) {
      this.index = this.index - length;
    }
    let storage = window.localStorage;
    storage.setItem("script.index", String(this.index));
  }

  @Watch("type")
  onTypeChange(to: number = this.type, from: number = this.type) {
    let storage = window.localStorage;
    storage.setItem("script.type", String(this.type));
    if (to != from) {
      this.index = 1;
    }
    this.stick();
    this.strip();
  }

  get script() {
    let script = this.database.scripts[this.type].scripts[this.index - 1];
    let result = { name: "", exp: "" };
    result.name = script.name;
    result.exp = script.exp;
    return result;
  }

  timeoutTask: number = 0;
  intervalTask: number = 0;
  indexDown(delta: number) {
    clearTimeout(this.timeoutTask);
    this.timeoutTask = setTimeout(() => {
      this.timeoutTask = 0;
      clearTimeout(this.intervalTask);
      this.intervalTask = setInterval(() => {
        this.index = this.index + delta;
      }, 100);
    }, 500);
    return true;
  }
  indexUp(delta: number) {
    if (this.timeoutTask != 0) {
      clearTimeout(this.timeoutTask);
      this.index = this.index + delta;
      this.timeoutTask = 0;
    }
    if (this.intervalTask != 0) {
      clearInterval(this.intervalTask);
      this.intervalTask = 0;
    }
    return true;
  }

  exp: string = "";
  actions: TwistAction[] = new TwistNode(this.exp).parse();
  @Watch("exp")
  onExpChange(value: string) {
    this.playing = false;
    let storage = window.localStorage;
    let saved = storage.getItem(this.script.name);
    if (value == this.script.exp) {
      storage.removeItem(this.script.name);
    } else if (value != saved) {
      storage.setItem(this.script.name, value);
    }
    this.actions = new TwistNode(this.exp).parse();
    this.$nextTick(this.init);
  }

  @Watch("script")
  onScriptChange() {
    this.playing = false;
    let storage = window.localStorage;
    this.exp = storage.getItem(this.script.name) || this.script.exp;
  }

  toggle() {
    if (this.playing) {
      this.playing = false;
    } else {
      this.playing = !this.playing;
      this.play();
    }
  }

  init() {
    this.progress = 0;
    this.playing = false;
    this.game.twister.twist("#");
    this.game.twister.twist(this.exp, true, 1, null, true);
  }
}
