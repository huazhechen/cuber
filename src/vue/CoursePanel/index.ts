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
          comments: ["如果棱块直接放入底层", "棱块间相对位置不对", "重新回到中层", "旋转底层到正确位置", "此时不用关心和中心块是否对齐"],
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
          comments: ["四个棱块位置全部正确", "旋转上两层将棱块与中心块对齐", "还有另一种方法", "旋转底层"],
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
            "复原到底层对应位置",
            "留下一个空槽位，称为角槽"
          ],
          script: "(URU'R'y')3",
          finalize: "",
          strips: [
            {
              indexes: [3, 5, 6, 7, 8, 15, 17, 20, 21, 23, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        },
        {
          comments: ["正常情况：找到在顶层的白色角块", "将其与目标槽位对齐", "让开右层旋转的'车道'", "右层旋转上来迎接角块", "角块归位", "右层归位"],
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
            "让开右层旋转的'车道'",
            "右层旋转上来迎接角块",
            "角块归位",
            "右层归位后发现方向不对",
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
          comments: ["异常情况：角块在错误位置", "右层旋转送它出来", "离开右层", "右层旋转回去", "重新放回正确的位置"],
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
            "让开右层旋转的'车道'",
            "右层旋转上来迎接棱块",
            "棱块归位",
            "右层归位",
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
            "让开前层旋转的'车道'",
            "前层(左手)旋转上来迎接棱块",
            "棱块归位",
            "前层(左手)归位",
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
          comments: ["异常情况：棱块位置或方向错误", "将角槽移过来保护角块", "右层旋转送它出来", "离开右层", "右层旋转回去", "恢复角块", "重新放回正确的位置"],
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
          comments: ["这一步的目标是将顶层的四个棱块", "黄绿(假定正确)", "黄蓝", "", "", "黄橙", "", "", "黄红", "按中心块颜色顺序复原"],
          script: "URUR'U'F'U2FU'",
          finalize: "",
          strips: [
            {
              indexes: [6, 8, 20, 24, 26],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        },
        {
          comments: [
            "正常情况：观察棱槽颜色",
            "将目标位置移动到右层中心块上方",
            "非黄色面(右层)旋转将棱块归位",
            "将错误棱块放入右层",
            "右层归位，并带回错误棱块到棱槽"
          ],
          script: "U2RU'R'",
          finalize: "U",
          strips: [
            {
              indexes: [6, 8, 20, 24, 25, 26],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        },
        {
          comments: [
            "镜像情况：观察棱槽颜色",
            "将目标位置移动到右层中心块上方",
            "非黄色面(前层)旋转将棱块归位",
            "将错误棱块放入前层",
            "前层归位，并带回错误棱块到棱槽"
          ],
          script: "U2F'UF",
          finalize: "U'",
          strips: [
            {
              indexes: [6, 8, 17, 20, 24, 26],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        },
        {
          comments: ["异常情况：三个正确棱块(橙蓝红)", "绿->橙", "", "橙->蓝", "", "蓝->红", "", "红->棱槽"],
          script: "RUR'URUR'",
          finalize: "",
          strips: [
            {
              indexes: [6, 8, 20, 24, 26],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        },
        {
          comments: ["异常情况：单独(橙)旋转", "棱槽->蓝", "", "蓝->橙", "", "橙->蓝(镜像)", "", "蓝->棱槽"],
          script: "(RU'R'U)(F'UF)",
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
          comments: [
            "这一步的目标是将顶层的四个角块",
            "黄红绿",
            "",
            "",
            "",
            "",
            "黄橙绿",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "黄橙蓝",
            "",
            "",
            "",
            "",
            "黄红蓝",
            "",
            "",
            "",
            "全部复原"
          ],
          script: "U(D'R'DR)U(D'R'DR)3U(D'R'DR)U(D'R'DR)",
          finalize: "",
          strips: [
            {
              indexes: [],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        },
        {
          comments: ["正常情况：观察角槽颜色", "将目标位置和角槽对齐", "角槽让开右层旋转的'车道'", "右层旋转下来迎接角槽", "角槽归位", "右层归位"],
          script: "U2D'R'DR",
          finalize: "",
          strips: [
            {
              indexes: [0, 1, 2, 3, 5, 6, 7, 8, 9, 11, 15, 18, 19, 20, 21, 23, 24],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        },
        {
          comments: ["注意", "角块复原过程中", "其他块会全部乱掉", "不要有顶层旋转和复原以外的操作", "不要有魔方整体旋转", "乱掉的块我们最后处理"],
          script: "U2D'R'DR",
          finalize: "U2(D'R'DR)5U2",
          strips: [
            {
              indexes: [],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        },
        {
          comments: [
            "异常情况：观察角槽颜色",
            "将目标位置和角槽对齐",
            "角槽让开右层旋转的'车道'",
            "右层旋转下来迎接角槽",
            "角槽归位",
            "右层归位后发现方向不对",
            "继续做(第一次)",
            "",
            "",
            "",
            "继续做(第二次)",
            "",
            "",
            "每多做两次方向会发生旋转"
          ],
          script: "U2(D'R'DR)3",
          finalize: "U2(D'R'DR)3U2",
          strips: [
            {
              indexes: [],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        },
        {
          comments: ["最佳情况", "", "", "", "四个角块复原后", "魔方仅差顶层旋转即可复原"],
          script: "(D'R'DR)U",
          finalize: "",
          strips: [
            {
              indexes: [],
              faces: [0, 1, 2, 3, 4, 5]
            }
          ]
        },
        {
          comments: [
            "一般情况",
            "",
            "",
            "四个角块复原后",
            "其他块仍是乱的",
            "继续做(第一次)",
            "",
            "",
            "",
            "继续做(第二次)",
            "",
            "",
            "直到只有两块方向不对",
            "将魔方向左倾倒",
            "将两个错误块当作顶层",
            "在底层任选角块当作角槽复原魔方"
          ],
          script: "(D'R'DR)(D'R'DR)2z'(D'R'DR)2U'(D'R'DR)4Uz",
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
