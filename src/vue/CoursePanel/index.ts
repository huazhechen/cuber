import Vue from "vue";
import { Component, Prop, Watch, Inject } from "vue-property-decorator";
import { TwistAction, TwistNode } from "../../cube/twister";
import Game from "../../cube/game";

@Component({
  template: require("./index.html")
})
export default class CoursePanel extends Vue {
  @Inject("game")
  game: Game;

  @Prop({ default: false })
  show: boolean;

  course = [
    {
      name: "底层棱块",
      steps: [
        {
          comment: "底层棱块在中层，一步可以转到底层",
          script: "R'",
          strips: [
            {
              indexes: [0, 1, 2, 3, 5, 6, 7, 8, 9, 15, 17, 18, 19, 20, 21, 23, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5,]
            }
          ]
        },
        {
          comment: "底层棱块在上下层，一次可以转到中层",
          script: "FR'",
          strips: [
            {
              indexes: [0, 1, 2, 3, 5, 6, 7, 8, 9, 15, 17, 18, 19, 20, 21, 23, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5,]
            }
          ]
        }
      ]
    },
    {
      name: "底层角块",
      steps: [
        {
          comment: "让路-车来-上车-车走",
          script: "URU'R'",
          strips: [
            {
              indexes: [6, 7, 8, 15, 16, 17, 24, 25, 26],
              faces: [0, 1, 2, 4, 5]
            }
          ]
        },
        {
          comment: "方向不对可以多做几次",
          script: "(URU'R')3",
          strips: [
            {
              indexes: [6, 7, 8, 15, 16, 17, 24, 25, 26],
              faces: [0, 1, 2, 4, 5]
            }
          ]
        }
      ]
    },
    {
      name: "中层棱块",
      steps: [
        {
          comment: "方向不对可以多做几次",
          script: "(URU'R')3",
          strips: [
            {
              indexes: [6, 7, 8, 15, 16, 17, 24, 25, 26],
              faces: [0, 1, 2, 4, 5]
            }
          ]
        }
      ]
    },
    {
      name: "顶层棱块",
      steps: [
        {
          comment: "方向不对可以多做几次",
          script: "(URU'R')3",
          strips: [
            {
              indexes: [6, 7, 8, 15, 16, 17, 24, 25, 26],
              faces: [0, 1, 2, 4, 5]
            }
          ]
        }
      ]
    },
    {
      name: "顶层角块",
      steps: [
        {
          comment: "方向不对可以多做几次",
          script: "(URU'R')3",
          strips: [
            {
              indexes: [6, 7, 8, 15, 16, 17, 24, 25, 26],
              faces: [0, 1, 2, 4, 5]
            }
          ]
        }
      ]
    }
  ];

  @Watch("show")
  onShowChange(to: boolean = this.show, from: boolean = this.show) {
    if (to) {
      this.onTypeChange();
      this.onIndexChange();
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
      this.game.twister.twist(
        action.exp,
        action.reverse,
        action.times,
        this.play,
        false
      );
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
    this.playing = false;
    this.progress--;
    let action = this.actions[this.progress];
    this.game.twister.twist(action.exp, !action.reverse, action.times);
  }

  type: number = Number(window.localStorage.getItem("course.type") || 1);
  index: number = Number(window.localStorage.getItem("course.index") || 0);

  stick() {
    this.game.cube.stick();
    this.game.dirty = true;
  }

  strip() {
    let strips = this.course[this.type - 1].steps[this.index].strips;

    for (let strip of strips) {
      for (let index of strip.indexes) {
        this.game.cube.strip(index, strip.faces);
      }
    }
    this.game.dirty = true;
  }

  @Watch("type")
  onTypeChange(to: number = this.type, from: number = this.type) {
    let storage = window.localStorage;
    storage.setItem("course.type", String(this.type));
    if (to < from) {
      this.index = this.course[to].steps.length - 1;
    } else {
      this.index = 0;
    }
  }

  @Watch("index")
  onIndexChange() {
    let length = this.course[this.type - 1].steps.length;
    if (this.index < 0) {
      if (this.type > 1) {
        this.type--;
        return;
      }
      else {
        this.index = 0;
      }
    }
    if (this.index >= length) {
      if (this.type < this.course.length) {
        this.type++;
        return;
      }
      else {
        this.index = length - 1;
      }
    }
    this.init();
    this.actions = new TwistNode(this.exp).parse();
    let storage = window.localStorage;
    storage.setItem("course.index", String(this.index));
  }

  get exp() {
    return this.course[this.type - 1].steps[this.index].script;
  }

  get comment() {
    return this.course[this.type - 1].steps[this.index].comment;
  }

  actions: TwistAction[] = new TwistNode(this.exp).parse();

  toggle() {
    if (this.playing) {
      this.playing = false;
    } else {
      this.playing = !this.playing;
      this.play();
    }
  }

  init() {
    this.stick();
    this.strip();
    this.progress = 0;
    this.playing = false;
    this.game.twister.twist("#");
    this.game.twister.twist(this.exp, true, 1, null, true);
  }
}
