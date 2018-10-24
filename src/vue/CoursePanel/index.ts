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
      name: "基础知识",
      steps: [
        {
          comment: "魔方由{中心块}、{角块}和{棱块}构成",
          exp: "",
          initial: "",
          strip: undefined,
          highlights: []
        },
        {
          comment: "这是6个{中心块}",
          exp: "",
          initial: "",
          strip: {
            indexes: [0, 1, 2, 3, 5, 6, 7, 8, 9, 11, 15, 17, 18, 19, 20, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "这是8个{角块}",
          exp: "",
          initial: "",
          strip: {
            indexes: [1, 3, 4, 5, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19, 21, 22, 23, 25],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "这是12个{棱块}",
          exp: "",
          initial: "",
          strip: {
            indexes: [0, 2, 4, 6, 8, 10, 12, 13, 14, 16, 18, 20, 22, 24, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "复原时需要将{黄色}中心块朝上",
          exp: "z'",
          initial: "z",
          strip: {
            indexes: [0, 1, 2, 3, 5, 6, 7, 8, 9, 11, 15, 17, 18, 19, 20, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "此时对面中心块颜色为{白色}",
          exp: "xx'",
          initial: "",
          strip: {
            indexes: [0, 1, 2, 3, 5, 6, 7, 8, 9, 11, 15, 17, 18, 19, 20, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "侧面中心块颜色顺序为{蓝}-{红}-{绿}-{橙}",
          exp: "yyyy",
          initial: "",
          strip: {
            indexes: [0, 1, 2, 3, 5, 6, 7, 8, 9, 11, 15, 17, 18, 19, 20, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "黄色中心块所在层称为{顶层}",
          exp: "",
          initial: "",
          strip: {
            indexes: [0, 1, 2, 3, 4, 5, 9, 10, 11, 12, 13, 14, 18, 19, 20, 21, 22, 23],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "白色中心块所在层称为{底层}",
          exp: "",
          initial: "",
          strip: {
            indexes: [3, 4, 5, 6, 7, 8, 12, 13, 14, 15, 16, 17, 21, 22, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "其他块所在的称为{中层}",
          exp: "",
          initial: "",
          strip: {
            indexes: [0, 1, 2, 6, 7, 8, 9, 10, 11, 15, 16, 17, 18, 19, 20, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "这三块是我们的工作区 其中块复原的目标位置称为{槽}",
          exp: "",
          initial: "",
          strip: {
            indexes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 25],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "工作区右边称为{右层}",
          exp: "",
          initial: "",
          strip: {
            indexes: [0, 1, 3, 4, 6, 7, 9, 10, 12, 13, 15, 16, 18, 19, 21, 22, 24, 25],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "工作区左边称为{左层}",
          exp: "",
          initial: "",
          strip: {
            indexes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "槽{迎接}/{接回}目标块 称为{槽出}/{槽归}",
          exp: "RR'F'F",
          initial: "",
          strip: {
            indexes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 25],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "左手握住这里方便右手操作",
          exp: "RUR'U'",
          initial: "",
          strip: {
            indexes: [2, 5, 6, 7, 8, 11, 14, 15, 16, 17, 20, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "右手握住这里方便左手操作",
          exp: "F'U'FU",
          initial: "",
          strip: {
            indexes: [6, 7, 8, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "我们将按照以下顺序复原整个魔方",
          exp: "",
          initial: "",
          strip: {
            indexes: [0, 1, 2, 3, 5, 6, 7, 8, 9, 11, 15, 17, 18, 19, 20, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "复原{底层棱块}",
          exp: "",
          initial: "",
          strip: {
            indexes: [0, 2, 3, 5, 6, 7, 8, 15, 17, 18, 20, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "复原三个{底层角块}",
          exp: "",
          initial: "",
          strip: {
            indexes: [3, 5, 6, 7, 8, 15, 17, 20, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "复原三个{中层棱块}",
          exp: "",
          initial: "",
          strip: {
            indexes: [6, 7, 8, 15, 17, 20, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "复原{顶层棱块}",
          exp: "",
          initial: "",
          strip: {
            indexes: [6, 8, 20, 24, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "复原{顶层角块}",
          exp: "",
          initial: "",
          strip: undefined,
          highlights: []
        }
      ]
    },
    {
      name: "底层棱块",
      steps: [
        {
          comment: "底层棱块是有{白色}的棱块",
          exp: "",
          initial: "x",
          strip: {
            indexes: [0, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "如果在中层可以直接复原",
          exp: "R'",
          initial: "R",
          strip: {
            indexes: [0, 2, 3, 5, 6, 7, 8, 15, 17, 18, 20, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [5]
        },
        {
          comment: "位置要和已经复原的块{顺序}吻合 绿色需要在蓝色对面",
          exp: "D'R'D",
          initial: "u'Bu",
          strip: {
            indexes: [0, 2, 3, 5, 6, 7, 8, 9, 11, 15, 17, 18, 20, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [5]
        },
        {
          comment: "如果目标棱块在底层 先{转入中层}后复原",
          exp: "RD'R'D",
          initial: "(RD'R'D)'",
          strip: {
            indexes: [0, 2, 3, 5, 6, 7, 8, 9, 11, 15, 17, 18, 20, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [5]
        },
        {
          comment: "如果目标棱块在顶层 先{转入中层}后复原",
          exp: "B'R",
          initial: "(B'R)'",
          strip: {
            indexes: [0, 1, 2, 3, 5, 6, 7, 8, 9, 15, 17, 18, 20, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [23]
        },
        {
          comment: "全部复原后和侧面中心块对齐",
          exp: "D",
          initial: "D'",
          strip: {
            indexes: [0, 2, 3, 5, 6, 7, 8, 15, 17, 18, 20, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        }
      ]
    },
    {
      name: "底层角块",
      steps: [
        {
          comment: "底层角块是有{白色}的角块",
          exp: "",
          initial: "x",
          strip: {
            indexes: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19, 21, 22, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "将角块与目标位置({槽})对齐",
          exp: "U",
          initial: "RUR'U2",
          strip: {
            indexes: [0, 2, 3, 5, 6, 7, 8, 15, 17, 18, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [26]
        },
        {
          comment: "{让路}-{槽出}-{入槽}-{槽归} (单步播放理解)",
          exp: "URU'R'",
          initial: "RUR'U'",
          strip: {
            indexes: [0, 2, 3, 5, 6, 7, 8, 15, 17, 18, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [26]
        },
        {
          comment: "根据白色朝向选择左右层用于槽出 ({错误示范})",
          exp: "URU'R'",
          initial: "F'U'FU",
          strip: {
            indexes: [0, 2, 3, 5, 6, 7, 8, 15, 17, 18, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [26]
        },
        {
          comment: "根据白色朝向选择左右层用于槽出 ({正确示范})",
          exp: "U'F'UF",
          initial: "F'U'FU",
          strip: {
            indexes: [0, 2, 3, 5, 6, 7, 8, 15, 17, 18, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [26]
        },
        {
          comment: "如果角块位置或方向错误 用其他角块置换出来再复原",
          exp: "(URU'R'U')y(URU'R')",
          initial: "RUR'y'RUR'",
          strip: {
            indexes: [0, 2, 3, 5, 6, 7, 8, 15, 17, 18, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [8, 26]
        },
        {
          comment: "如果白色朝向顶层 任选一侧复原后置换出来再复原",
          exp: "(URU'R')3",
          initial: "(RUR'U')3",
          strip: {
            indexes: [0, 2, 3, 5, 6, 7, 8, 15, 17, 18, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [26]
        },
        {
          comment: "任选三个复原 留一个用于复原顶层角块",
          exp: "",
          initial: "",
          strip: {
            indexes: [3, 5, 6, 7, 8, 15, 17, 20, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [20]
        }
      ]
    },
    {
      name: "中层棱块",
      steps: [
        {
          comment: "中层棱块是{没有}黄白色的棱块",
          exp: "",
          initial: "",
          strip: {
            indexes: [0, 1, 2, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "将棱块侧面与中心块颜色对齐",
          exp: "U'",
          initial: "yRUR'U'F'U'FU2",
          strip: {
            indexes: [3, 6, 7, 8, 15, 17, 20, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [7]
        },
        {
          comment: "{借角}-{让路}-{槽出}-{入槽}-{槽归}-{还角} (单步播放理解)",
          exp: "DURU'R'D'",
          initial: "y(DURU'R'D')'",
          strip: {
            indexes: [3, 6, 7, 8, 15, 17, 20, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [15]
        },
        {
          comment: "镜像情况使用左层槽出",
          exp: "D'U'F'UFD",
          initial: "y'(D'U'F'UFD)'",
          strip: {
            indexes: [3, 5, 6, 7, 8, 15, 17, 20, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [7]
        },
        {
          comment: "如果棱块位置或方向不对 用其他棱块置换出来再复原",
          exp: "D(URU'R')D'U2D(U'F'UF)D'",
          initial: "y(RU'2R'U)2y'(R'U'R)y",
          strip: {
            indexes: [3, 6, 7, 8, 17, 20, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [15]
        },
        {
          comment: "复原三个正确角块上方的棱块 留一个作为后续步骤的槽",
          exp: "",
          initial: "",
          strip: {
            indexes: [6, 7, 8, 15, 17, 20, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [23]
        }
      ]
    },
    {
      name: "顶层棱块",
      steps: [
        {
          comment: "顶层棱块是有{黄色}的棱块",
          exp: "",
          initial: "",
          strip: {
            indexes: [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 16, 18, 19, 20, 21, 22, 23, 24, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "将{目标位置}提前放置到{槽出}后棱块的落点",
          exp: "U",
          initial: "RU'R'U'",
          strip: {
            indexes: [6, 8, 17, 20, 23, 24, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [17]
        },
        {
          comment: "{槽出到目标位置}-{错误块入槽}-{槽归} (单步播放理解)",
          exp: "RUR'",
          initial: "RU'R'",
          strip: {
            indexes: [6, 8, 17, 20, 23, 24, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [17, 23]
        },
        {
          comment: "根据黄色朝向选择左右层用于槽出",
          exp: "F'U'F",
          initial: "F'UF",
          strip: {
            indexes: [6, 8, 20, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [25]
        },
        {
          comment: "三个正确块场景按顺序命名为ABC 槽出到A-槽归B-槽出到C-槽归",
          exp: "RUR'URUR'",
          initial: "RU'R'U'RU'R'",
          strip: {
            indexes: [6, 8, 20, 23, 24, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "单独旋转一块场景命名为O 槽出到邻居A-槽归O-镜像槽出到A-槽归",
          exp: "(RU'R'U)(F'UF)",
          initial: "(F'U'FU')(RUR')",
          strip: {
            indexes: [6, 8, 20, 23, 24, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "复原四个顶层棱块后 剩余的一个中层棱块自动复原",
          exp: "",
          initial: "",
          strip: {
            indexes: [6, 8, 20, 24, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        }
      ]
    },
    {
      name: "顶层角块",
      steps: [
        {
          comment: "顶层角块是有{黄色}的角块",
          exp: "",
          initial: "",
          strip: {
            indexes: [0, 1, 2, 3, 4, 5, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 25],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "{复原过程中底层和中层会乱}",
          exp: "",
          initial: "",
          strip: {
            indexes: [0, 1, 2, 3, 4, 5, 9, 10, 11, 12, 13, 14, 18, 19, 20, 21, 22, 23],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "将目标位置移到工作区内成为{槽}",
          exp: "U'",
          initial: "(D'R'DR)5U",
          strip: {
            indexes: [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 18, 19, 20, 21, 22, 23, 24],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [20]
        },
        {
          comment: "{让路}-{槽出}-{入槽}-{槽归} (单步播放理解)",
          exp: "D'R'DR",
          initial: "(D'R'DR)5",
          strip: {
            indexes: [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 18, 19, 20, 21, 22, 23, 24],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [20]
        },
        {
          comment: "根据黄色朝向选择左右层用于槽出 ({错误示范})",
          exp: "D'R'DR",
          initial: "(DFD'F')5",
          strip: {
            indexes: [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 18, 19, 20, 21, 22, 23, 24],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [20]
        },
        {
          comment: "根据黄色朝向选择左右层用于槽出 ({正确示范})",
          exp: "DFD'F'",
          initial: "(DFD'F')5",
          strip: {
            indexes: [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 18, 19, 20, 21, 22, 23, 24],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [20]
        },
        {
          comment: "如果角块位置或方向错误 用槽里的另一角块置换出来再复原",
          exp: "(D'R'DR)U(D'R'DR)",
          initial: "(D'R'DR)U'(D'R'DR)3",
          strip: {
            indexes: [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 18, 19, 20, 21, 22, 23, 24],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [20, 24]
        },
        {
          comment: "如果黄色朝向顶层 任选一侧复原后置换出来再复原",
          exp: "(D'R'DR)3",
          initial: "(D'R'DR)3",
          strip: {
            indexes: [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 18, 19, 20, 21, 22, 23, 24],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [20]
        },
        {
          comment: "所有角块复原后下两层已经复原了 此时对齐即可完成复原",
          exp: "U",
          initial: "U'",
          strip: undefined,
          highlights: []
        },
        {
          comment: "所有角块复原后下两层还是乱的",
          exp: "",
          initial: "z'(D'R'DR)4U'(D'R'DR)2Uz(D'R'DR)4U'",
          strip: undefined,
          highlights: []
        },
        {
          comment: "将顶层与中心块对齐 重复交换上下两个角块直到其他块复原",
          exp: "U(D'R'DR)2",
          initial: "z'(D'R'DR)4U'(D'R'DR)2Uz(D'R'DR)4U'",
          strip: undefined,
          highlights: []
        },
        {
          comment: "然后将魔方向左倾倒 全部使用{右层槽出}复原剩余的两块",
          exp: "z'(D'R'DR)2U'(D'R'DR)4Uz",
          initial: "z'(D'R'DR)4U'(D'R'DR)2Uz",
          strip: undefined,
          highlights: []
        }
      ]
    }
  ];

  @Watch("show")
  onShowChange(to: boolean = this.show, from: boolean = this.show) {
    if (to) {
      this.onTypeChange();
      this.onIndexChange();
      this.onStepChange();
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

  type: number = Number(window.localStorage.getItem("course.type") || 1);
  index: number = Number(window.localStorage.getItem("course.index") || 0);

  stick() {
    this.game.cube.stick();
    this.game.dirty = true;
  }

  strip() {
    let strip = this.step.strip;
    if (strip == undefined) {
      return;
    }
    for (let index of strip.indexes) {
      this.game.cube.strip(index, strip.faces);
    }
    let highlights = this.step.highlights;
    for (let index of highlights) {
      this.game.cube.highlight(index);
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
    let storage = window.localStorage;
    storage.setItem("course.index", String(this.index));
  }

  @Watch("step")
  onStepChange() {
    this.actions = new TwistNode(this.exp).parse();
    this.$nextTick(this.init);
  }

  get step() {
    return this.course[this.type - 1].steps[this.index];
  }

  get exp() {
    return this.step.exp || "";
  }

  get initial() {
    return this.step.initial || "";
  }

  get comment() {
    return this.step.comment.replace(/ /gi, "<br/>").replace(/{/gi, "<strong>").replace(/}/gi, "</strong>");
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
    this.strip();
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
