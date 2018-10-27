import Vue from "vue";
import { Component, Prop, Watch, Inject } from "vue-property-decorator";
import { TwistAction, TwistNode } from "../../cube/twister";
import Game from "../../cube/game";
import Database from "../../common/Database";

@Component({
  template: require("./index.html")
})
export default class CoursePanel extends Vue {
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
      this.onStepChange();
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

  type: number = Number(window.localStorage.getItem("course.type") || 1);
  index: number = Number(window.localStorage.getItem("course.index") || 0);

  stick() {
    this.game.cube.stick();
    this.game.dirty = true;
  }

  strip() {
    let strip = this.step.strip;
    if (strip != undefined) {
      for (let index of strip.indexes) {
        this.game.cube.strip(index, strip.faces);
      }
    }
    let highlights = this.step.highlights;
    if (highlights != undefined) {
      for (let index of highlights) {
        this.game.cube.highlight(index, true);
      }
    }
    this.game.dirty = true;
  }

  @Watch("type")
  onTypeChange(to: number = this.type, from: number = this.type) {
    let storage = window.localStorage;
    storage.setItem("course.type", String(this.type));
    if (to < from) {
      this.index = this.database.course[to - 1].steps.length - 1;
    } else if (to > from) {
      this.index = 0;
    }
  }

  @Watch("index")
  onIndexChange() {
    let length = this.database.course[this.type - 1].steps.length;
    if (this.index < 0) {
      if (this.type > 1) {
        this.type--;
        return;
      } else {
        this.index = 0;
      }
    }
    if (this.index >= length) {
      if (this.type < this.database.course.length) {
        this.type++;
        return;
      } else {
        this.index = length - 1;
      }
    }
    let storage = window.localStorage;
    storage.setItem("course.index", String(this.index));
  }

  @Watch("step")
  onStepChange() {
    this.actions = new TwistNode(this.exp).parse();
    this.$nextTick(this.init);
  }

  get step() {
    return this.database.course[this.type - 1].steps[this.index];
  }

  get exp() {
    return this.step.exp || "";
  }

  get initial() {
    return this.step.initial || "";
  }

  get comment() {
    return this.step.comment
      .replace(/ /gi, "<br/>")
      .replace(/{/gi, "<strong><font  color='red'>")
      .replace(/}/gi, "</font></strong>");
  }

  actions: TwistAction[] = new TwistNode(this.exp).parse();

  playing: boolean = false;

  forward() {
    if (this.progress == this.actions.length) {
      return;
    }
    this.playing = false;
    let action = this.actions[this.progress];
    this.progress++;
    this.game.twister.twist(action.exp, action.reverse, action.times, this.strip);
  }

  backward() {
    if (this.progress == 0) {
      return;
    }
    this.playing = false;
    this.progress--;
    let action = this.actions[this.progress];
    this.game.twister.twist(action.exp, !action.reverse, action.times, this.strip);
  }

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

  toggle() {
    if (this.playing) {
      this.playing = false;
    } else {
      this.playing = !this.playing;
      this.play();
    }
  }

  init() {
    this.playing = false;
    this.game.twister.twist("#");
    this.game.twister.twist(this.initial, false, 1, null, true);
    this.progress = 0;
    this.stick();
    this.strip();
  }
}
