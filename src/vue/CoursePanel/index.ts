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
          comments: ["这一步的目标是将底层的四个棱块", "白橙", "白红", "白蓝", "白绿", "", "", "按照中心块的顺序放入底层", "然后和中心块对齐"],
          script: "LR'F2U'RB'R'u2",
          finalize: "",
          strips: [
            {
              indexes: [0, 2, 3, 5, 6, 7, 8, 15, 17, 18, 20, 21, 23, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        },
        {
          comments: ["场景1：底层棱块在中层", "一步直接转到底层"],
          script: "LR'",
          finalize: "",
          strips: [
            {
              indexes: [0, 2, 3, 5, 6, 7, 8, 15, 17, 18, 20, 21, 23, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        },
        {
          comments: ["场景2：底层棱块在顶层", "先转到中层", "再转到底层", "先转到中层", "再转到底层"],
          script: "R'R'F'L",
          finalize: "",
          strips: [
            {
              indexes: [0, 1, 2, 3, 5, 6, 7, 8, 15, 17, 18, 19, 20, 21, 23, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        },
        {
          comments: ["场景3：底层棱块在底层", "先转到中层", "再转到底层"],
          script: "RF",
          finalize: "",
          strips: [
            {
              indexes: [0, 1, 2, 3, 5, 6, 7, 8, 9, 11, 15, 17, 18, 20, 21, 23, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        },
        {
          comments: ["如果棱块直接放入底层", "结果棱块间相互关系不对", "重新回到中层", "旋转底层到正确位置", "此时不用关系和中心块的对齐"],
          script: "R'RD'R'",
          finalize: "D",
          strips: [
            {
              indexes: [0, 2, 3, 5, 6, 7, 8, 9, 11, 15, 17, 18, 20, 21, 23, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        },
        {
          comments: ["四个棱块位置全部正确", "将棱块与中心块对齐", "也可以旋转底层"],
          script: "u2u'2D2",
          finalize: "",
          strips: [
            {
              indexes: [0, 2, 3, 5, 6, 7, 8, 15, 17, 18, 20, 21, 23, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        }
      ]
    },
    {
      name: "底层角块",
      steps: [
        {
          comments: [
            "这一步的目标是将底层的任意三个角块",
            "白橙蓝",
            "",
            "",
            "",
            "白橙绿",
            "",
            "",
            "",
            "",
            "白红绿",
            "",
            "",
            "",
            "复原到底面对应位置",
            "留下一个空槽位，称为角槽"
          ],
          script: "((URU'R')y')3",
          finalize: "",
          strips: [
            {
              indexes: [3, 5, 6, 7, 8, 15, 17, 20, 21, 23, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        },
        {
          comments: ["正常情况：找到在顶层的白色角块", "将其与目标槽位对齐", "让开右面旋转的'车道'", "右面旋转上来迎接角块", "角块归位", "右面归位"],
          script: "U2(URU'R')",
          finalize: "",
          strips: [
            {
              indexes: [0, 2, 3, 5, 6, 7, 8, 15, 17, 18, 21, 23, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        },
        {
          comments: [
            "异常情况：找到在顶层的白色角块",
            "将其与目标槽位对齐",
            "让开右面旋转的'车道'",
            "右面旋转上来迎接角块",
            "角块归位",
            "右面归位后发现方向不对",
            "继续做(第一次)",
            "",
            "",
            "",
            "继续做(第二次)",
            "",
            "",
            "每多做两次方向会发生旋转"
          ],
          script: "U2(URU'R')3",
          finalize: "",
          strips: [
            {
              indexes: [0, 2, 3, 5, 6, 7, 8, 15, 17, 18, 21, 23, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        },
        {
          comments: ["异常情况：角块在错误位置", "右面旋转送它出来", "离开右面", "右面旋转回去", "重新放回正确的位置"],
          script: "RUR'y'URU'R'",
          finalize: "",
          strips: [
            {
              indexes: [0, 2, 3, 5, 6, 7, 8, 15, 17, 18, 21, 23, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        }
      ]
    },
    {
      name: "中层棱块",
      steps: [
        {
          comments: [
            "这一步的目标是将三个棱块",
            "橙蓝",
            "",
            "",
            "",
            "",
            "",
            "橙绿",
            "",
            "",
            "",
            "",
            "",
            "",
            "红绿",
            "",
            "",
            "",
            "",
            "",
            "复原到三个角块上方对应位置",
            "留下一个空槽位，称为棱槽"
          ],
          script: "(D'URU'R'Dy')(D2'URU'R'D2y')(DURU'R'D'y')",
          finalize: "",
          strips: [
            {
              indexes: [6, 7, 8, 15, 17, 20, 23, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        },
        {
          comments: [
            "正常情况：找到在顶层的中层棱块",
            "将侧面颜色与中心块对齐",
            "将角槽移过来保护角块",
            "让开右面旋转的'车道'",
            "右面旋转上来迎接棱块",
            "棱块归位",
            "右面归位",
            "恢复角块"
          ],
          script: "U'2D(URU'R')D'",
          finalize: "y'",
          strips: [
            {
              indexes: [3, 6, 7, 8, 15, 17, 20, 21, 23, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        },
        {
          comments: [
            "镜像情况：找到在顶层的中层棱块",
            "将侧面颜色与中心块对齐",
            "将角槽移过来保护角块",
            "让开前面旋转的'车道'",
            "前面(左手)旋转上来迎接棱块",
            "棱块归位",
            "前面(左手)归位",
            "恢复角块"
          ],
          script: "U2D(U'F'UF)D'",
          finalize: "y'",
          strips: [
            {
              indexes: [3, 6, 7, 8, 15, 17, 20, 21, 23, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        },
        {
          comments: ["异常情况：棱块位置或方向错误", "将角槽移过来保护角块", "右面旋转送它出来", "离开右面", "右面旋转回去", "恢复角块", "重新放回正确的位置"],
          script: "DRUR'D'D(U'F'UF)D'",
          finalize: "y'",
          strips: [
            {
              indexes: [3, 6, 7, 8, 15, 17, 20, 21, 23, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        }
      ]
    },
    {
      name: "顶层棱块",
      steps: [
        {
          comments: ["将棱槽位置上的棱块放到正确位置，同时拿回来一个位置错误的顶层棱块"],
          script: "RUR'U'",
          finalize: "",
          strips: [
            {
              indexes: [6, 7, 8, 15, 20, 23, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        },
        {
          comments: ["与底层棱块类似，正确位置指的是顺序要和中心块的顺序一致"],
          script: "RUR'U2",
          finalize: "",
          strips: [
            {
              indexes: [6, 8, 15, 20, 23, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        },
        {
          comments: ["三个(按照紧邻顺序标记为ABC)都归位的情况，O->A，B->棱槽，B->C，棱槽归位"],
          script: "RUR'URUR'",
          finalize: "",
          strips: [
            {
              indexes: [6, 8, 20, 23, 24, 26],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        },
        {
          comments: ["单独旋转(O)的情况，左侧为O，标记右侧为A，棱槽->A，O->棱槽，O->A，棱槽归位"],
          script: "(RU'R'U)(F'UF)",
          finalize: "",
          strips: [
            {
              indexes: [6, 8, 20, 24, 26],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        },
        {
          comments: ["依次完成顶层4棱块，此时棱槽已经自动还原"],
          script: "RU'R'",
          finalize: "",
          strips: [
            {
              indexes: [6, 8, 20, 24, 26],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        }
      ]
    },
    {
      name: "顶层角块",
      steps: [
        {
          comments: ["通过旋转顶层将角槽与目标位置对齐，把目标位置当作车，'上车四步'"],
          script: "D'R'DR",
          finalize: "U(D'R'DR)5U'",
          strips: [
            {
              indexes: [],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        },
        {
          comments: ["与底层角块类似，如果方向不对，重复执行上述操作，最差情况下需要5次"],
          script: "(D'R'DR)5",
          finalize: "U(D'R'DR)U'",
          strips: [
            {
              indexes: [],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        },
        {
          comments: ["此步骤会打乱下两层，因此除了旋转顶层对齐和'上车四步'以外，千万不要有其他操作"],
          script: "UD'R'DRU'",
          finalize: "(D'R'DR)5",
          strips: [
            {
              indexes: [],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        },
        {
          comments: ["一般情况下，完成最后一个角块，魔方应该就只差顶面一个旋转就复原了"],
          script: "(D'R'DR)U2",
          finalize: "",
          strips: [
            {
              indexes: [],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        },
        {
          comments: ["如果完成最后一个角块魔方还是乱的，继续做'上车四步'直到其他块复原"],
          script: "(D'R'DR)2",
          finalize: "z'(D'R'DR)2U'(D'R'DR)4Uz",
          strips: [
            {
              indexes: [],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        },
        {
          comments: ["然后将魔方向左倾倒，随意选择底层角块当做角槽继续复原"],
          script: "z'(D'R'DR)2U'(D'R'DR)4Uz",
          finalize: "",
          strips: [
            {
              indexes: [],
              faces: [0, 1, 2, 3, 4, 5]
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
      if (from) {
        this.stick();
      }
    }
  }

  mounted() {
    this.onShowChange();
  }

  progress: number = 0;

  forward() {
    if (this.progress == this.actions.length) {
      return;
    }
    let action = this.actions[this.progress];
    this.progress++;
    this.game.twister.twist(action.exp, action.reverse, action.times);
  }

  backward() {
    if (this.progress == 0) {
      return;
    }
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
      } else {
        this.index = 0;
      }
    }
    if (this.index >= length) {
      if (this.type < this.course.length) {
        this.type++;
        return;
      } else {
        this.index = length - 1;
      }
    }
    this.$nextTick(this.init);
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
    let i = this.progress;
    let comments = this.course[this.type - 1].steps[this.index].comments;
    let comment = "";
    while (comment == "" || comment == undefined) {
      comment = comments[i];
      i--;
    }
    return comment;
  }

  actions: TwistAction[] = new TwistNode(this.exp).parse();

  init() {
    this.stick();
    this.strip();
    this.progress = 0;
    this.game.twister.twist("#");
    this.game.twister.twist(this.finalize, true, 1, null, true);
    this.game.twister.twist(this.exp, true, 1, null, true);
  }
}
