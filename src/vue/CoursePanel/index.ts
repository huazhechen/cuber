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
          finalize: "",
          strips: [
            {
              indexes: [0, 1, 2, 3, 5, 6, 7, 8, 9, 15, 17, 18, 19, 20, 21, 23, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5,]
            }
          ]
        },
        {
          comment: "底层棱块在上下层，一步可以转到中层，然后转到底层",
          script: "FR'",
          finalize: "",
          strips: [
            {
              indexes: [0, 1, 2, 3, 5, 6, 7, 8, 9, 15, 17, 18, 19, 20, 21, 23, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5,]
            }
          ]
        },
        {
          comment: "棱块间的顺序要和中心块的顺序一致",
          script: "u'R'u2",
          finalize: "",
          strips: [
            {
              indexes: [0, 2, 3, 5, 6, 7, 8, 15, 17, 18, 20, 21, 23, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5,]
            }
          ]
        },
        {
          comment: "依次完成四个棱块后，将棱块与中心块对齐",
          script: "u2",
          finalize: "",
          strips: [
            {
              indexes: [0, 2, 3, 5, 6, 7, 8, 15, 17, 18, 20, 21, 23, 24, 25, 26],
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
          comment: "将角块与目标位置对齐后，把目标位置当作车，我们定义'上车四步': 让开-车来-上车-车回",
          script: "URU'R'",
          finalize: "",
          strips: [
            {
              indexes: [0, 2, 3, 5, 6, 7, 8, 15, 17, 18, 21, 23, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5,]
            }
          ]
        },
        {
          comment: "如果方向不对，重复执行上述操作，最差情况下需要5次",
          script: "(URU'R')5",
          finalize: "",
          strips: [
            {
              indexes: [0, 2, 3, 5, 6, 7, 8, 15, 17, 18, 21, 23, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5,]
            }
          ]
        },
        {
          comment: "如果角块在错误位置，使用无关块将其置换出来",
          script: "(URU'R')(d')(URU'R')",
          finalize: "",
          strips: [
            {
              indexes: [0, 2, 3, 5, 6, 7, 8, 15, 17, 18, 21, 23, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5,]
            }
          ]
        },
        {
          comment: "任选三个角块依次完成，未完成的角块位置称为角槽，角块上方称为棱槽",
          script: "(URU'R')y",
          finalize: "",
          strips: [
            {
              indexes: [3, 5, 6, 7, 8, 15, 17, 20, 21, 23, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5,]
            }
          ]
        }
      ]
    },
    {
      name: "中层棱块",
      steps: [
        {
          comment: "将棱块与中心块对齐，将角槽移动到目标位置下，'上车四步'后恢复角槽位置",
          script: "UD(URU'R')D'y'",
          finalize: "",
          strips: [
            {
              indexes: [3, 6, 7, 8, 15, 17, 20, 21, 23, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5,]
            }
          ]
        },
        {
          comment: "注意车只能从棱块所在的面开上来，此时需要左手操作",
          script: "D(U'F'UF)D'y'",
          finalize: "",
          strips: [
            {
              indexes: [3, 6, 7, 8, 15, 17, 20, 21, 23, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5,]
            }
          ]
        },
        {
          comment: "将除棱槽之外的三个棱块依次完成",
          script: "D2(U'F'UF)D2'y2",
          finalize: "",
          strips: [
            {
              indexes: [6, 7, 8, 15, 17, 20, 23, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5,]
            }
          ]
        }
      ]
    },
    {
      name: "顶层棱块",
      steps: [
        {
          comment: "将棱槽位置上的棱块放到正确位置，同时拿回来一个位置错误的顶层棱块",
          script: "RUR'U'",
          finalize: "",
          strips: [
            {
              indexes: [6, 7, 8, 15, 20, 23, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5,]
            }
          ]
        },
        {
          comment: "与底层棱块类似，正确位置指的是顺序要和中心块的顺序一致",
          script: "RUR'U2",
          finalize: "",
          strips: [
            {
              indexes: [6, 8, 15, 20, 23, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5,]
            }
          ]
        },
        {
          comment: "三个(按照紧邻顺序标记为ABC)都归位的情况，O->A，B->棱槽，B->C，棱槽归位",
          script: "RUR'URUR'",
          finalize: "",
          strips: [
            {
              indexes: [6, 8, 20, 23, 24, 26],
              faces: [0, 1, 2, 3, 4, 5,]
            }
          ]
        },
        {
          comment: "单独旋转(O)的情况，左侧为O，标记右侧为A，棱槽->A，O->棱槽，O->A，棱槽归位",
          script: "(RU'R'U)(F'UF)",
          finalize: "",
          strips: [
            {
              indexes: [6, 8, 20, 24, 26],
              faces: [0, 1, 2, 3, 4, 5,]
            }
          ]
        },
        {
          comment: "依次完成顶层4棱块，此时棱槽已经自动还原",
          script: "RU'R'",
          finalize: "",
          strips: [
            {
              indexes: [6, 8, 20, 24, 26],
              faces: [0, 1, 2, 3, 4, 5,]
            }
          ]
        }
      ]
    },
    {
      name: "顶层角块",
      steps: [
        {
          comment: "通过旋转顶层将角槽与目标位置对齐，把目标位置当作车，'上车四步'",
          script: "D'R'DR",
          finalize: "U(D'R'DR)5U'",
          strips: [
            {
              indexes: [],
              faces: [0, 1, 2, 3, 4, 5,]
            }
          ]
        },
        {
          comment: "与底层角块类似，如果方向不对，重复执行上述操作，最差情况下需要5次",
          script: "(D'R'DR)5",
          finalize: "U(D'R'DR)U'",
          strips: [
            {
              indexes: [],
              faces: [0, 1, 2, 3, 4, 5,]
            }
          ]
        },
        {
          comment: "此步骤会打乱下两层，因此除了旋转顶层对齐和'上车四步'以外，千万不要有其他操作",
          script: "UD'R'DRU'",
          finalize: "(D'R'DR)5",
          strips: [
            {
              indexes: [],
              faces: [0, 1, 2, 3, 4, 5,]
            }
          ]
        },
        {
          comment: "一般情况下，完成最后一个角块，魔方应该就只差顶面一个旋转就复原了",
          script: "(D'R'DR)U2",
          finalize: "",
          strips: [
            {
              indexes: [],
              faces: [0, 1, 2, 3, 4, 5,]
            }
          ]
        },
        {
          comment: "如果完成最后一个角块魔方还是乱的，继续做'上车四步'直到其他块复原",
          script: "(D'R'DR)2",
          finalize: "z'(D'R'DR)2U'(D'R'DR)4Uz",
          strips: [
            {
              indexes: [],
              faces: [0, 1, 2, 3, 4, 5,]
            }
          ]
        },
        {
          comment: "然后将魔方向左倾倒，随意选择底层角块当做角槽继续复原",
          script: "z'(D'R'DR)2U'(D'R'DR)4Uz",
          finalize: "",
          strips: [
            {
              indexes: [],
              faces: [0, 1, 2, 3, 4, 5,]
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
      this.index = this.course[to - 1].steps.length - 1;
    } else if (to > from) {
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

  get finalize() {
    return this.course[this.type - 1].steps[this.index].finalize;
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
    this.game.twister.twist(this.finalize, true, 1, null, true);
    this.game.twister.twist(this.exp, true, 1, null, true);
  }
}
