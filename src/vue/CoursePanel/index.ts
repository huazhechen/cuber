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
          comment: "复原前先将{黄色}中心块朝上",
          exp: "z'",
          initial: "z",
          strip: {
            indexes: [0, 1, 2, 3, 5, 6, 7, 8, 9, 11, 15, 17, 18, 19, 20, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "对面中心块颜色为{白色}",
          exp: "xx'",
          initial: "",
          strip: {
            indexes: [0, 1, 2, 3, 5, 6, 7, 8, 9, 11, 15, 17, 18, 19, 20, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "侧面中心块颜色顺序固定 {蓝}-{红}-{绿}-{橙}",
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
          comment: "这三块所在的位置是{工作区}",
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
          comment: "{工作区}中的棱块 直接进入底层复原",
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
          comment: "如果目标棱块在底层 先{转入工作区}后复原",
          exp: "RD'R'D",
          initial: "(RD'R'D)'",
          strip: {
            indexes: [0, 2, 3, 5, 6, 7, 8, 9, 11, 15, 17, 18, 20, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [5]
        },
        {
          comment: "如果目标棱块在顶层 先{转入工作区}后复原",
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
          comment: "将工作区的角块移动到{顶层} 按照{相反}的顺序回归 可以{交换工作区角块}",
          exp: "RUR'U'",
          initial: "(RUR'U')'",
          strip: {
            indexes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [26]
        },
        {
          comment: "旋转顶层将{目标块}和{目标位置} 移动到{同一工作区}内 为交换角块做准备",
          exp: "U",
          initial: "(RUR'U')'U'",
          strip: {
            indexes: [0, 2, 3, 5, 6, 7, 8, 15, 17, 18, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [26]
        },
        {
          comment: "通过{交换工作区角块}操作 复原底层角块",
          exp: "RUR'U'",
          initial: "(RUR'U')'",
          strip: {
            indexes: [0, 2, 3, 5, 6, 7, 8, 15, 17, 18, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [26]
        },
        {
          comment: "如果移动到顶层后白色朝上 交换后角块方向错误 ({错误示范})",
          exp: "RUR'U'",
          initial: "RUR'U'",
          strip: {
            indexes: [0, 2, 3, 5, 6, 7, 8, 15, 17, 18, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [26]
        },
        {
          comment: "如果移动到顶层后白色朝侧面 交换后角块方向正确 ({正确示范})",
          exp: "F'U'FU",
          initial: "(F'U'FU)'",
          strip: {
            indexes: [0, 2, 3, 5, 6, 7, 8, 15, 17, 18, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [26]
        },
        {
          comment: "如果角块位置或方向错误 交换到顶层后重新复原",
          exp: "(RUR'U')y'U(RUR'U')",
          initial: "F'U'FyF'U'F",
          strip: {
            indexes: [0, 2, 3, 5, 6, 7, 8, 15, 17, 18, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [24, 26]
        },
        {
          comment: "如果白色朝向顶层 通过多次交换的方式进行旋转",
          exp: "(RUR'U')3",
          initial: "(RUR'U')'3",
          strip: {
            indexes: [0, 2, 3, 5, 6, 7, 8, 15, 17, 18, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [26]
        },
        {
          comment: "任选三个复原 留一个用于复原顶层角块 称为{脏角块}",
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
          comment: "将工作区的棱块移动到{顶层} 工作区带其他顶层棱块回归 可以使棱块复原回中层",
          exp: "RUR'",
          initial: "y(DRUR'D')'",
          strip: {
            indexes: [3, 6, 7, 8, 15, 17, 20, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [17]
        },
        {
          comment: "为了防止底层角块被破坏 将脏角块移动到工作区 替换掉正确角块",
          exp: "D",
          initial: "y(DRUR'D')'",
          strip: {
            indexes: [3, 6, 7, 8, 15, 17, 20, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [26]
        },
        {
          comment: "使顶层棱块复原到中层 复原后恢复正确角块",
          exp: "RUR'D'",
          initial: "y(RUR'D')'",
          strip: {
            indexes: [3, 6, 7, 8, 15, 17, 20, 21, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [17, 26]
        },
        {
          comment: "选择左右层中 与目标棱块{侧面}颜色 相同的层进行操作",
          exp: "D'F'U2FD",
          initial: "y'(D'U'F'U'FD)'",
          strip: {
            indexes: [3, 5, 6, 7, 8, 15, 17, 20, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [25, 26]
        },
        {
          comment: "如果棱块位置或方向不对 交换到顶层后重新复原",
          exp: "D(RU'R')(F'U2F)D'",
          initial: "y(RU'2R'U)2y'(R'U'RU)y",
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
          comment: "将{目标位置}转到 {目标棱块}去到顶层后的落点",
          exp: "U",
          initial: "RU'R'U'",
          strip: {
            indexes: [6, 8, 17, 20, 23, 24, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [17]
        },
        {
          comment: "{目标棱块}去往顶层 {错误棱块}回到中层",
          exp: "RUR'",
          initial: "RU'R'",
          strip: {
            indexes: [6, 8, 17, 20, 23, 24, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [23]
        },
        {
          comment: "选择左右层中 {目标棱块}去到顶层后 黄色朝上的层进行操作",
          exp: "F'U'F",
          initial: "F'UF",
          strip: {
            indexes: [6, 8, 20, 23, 24, 25, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "三个正确块场景 按紧邻顺序标记为ABC {去A}-{回B}-{去C}-{回}",
          exp: "RUR'URUR'",
          initial: "RU'R'U'RU'R'",
          strip: {
            indexes: [6, 8, 20, 23, 24, 26],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "单独一块需要旋转场景 标记旋转块O和任意正确块A {去A}-{回O}-{换边去A}-{回}",
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
          comment: "将工作区的角块移动到{底层} 按照{相反}的顺序回归 可以{交换工作区角块}",
          exp: "R'D'RD",
          initial: "z'(R'D'RD)4U'(R'D'RD)2Uz(R'D'RD)3",
          strip: {
            indexes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "使用底层交换角块能保护{顶层} 下两层会{暂时}打乱 最后进行处理",
          exp: "R'D'RD",
          initial: "z'(R'D'RD)4U'(R'D'RD)2Uz(R'D'RD)3",
          strip: {
            indexes: [],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: []
        },
        {
          comment: "转动顶层将{目标块}和{目标位置} 移动到{同一工作区}内 为交换角块做准备",
          exp: "U'",
          initial: "(R'D'RD)5U",
          strip: {
            indexes: [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 18, 19, 20, 21, 22, 23, 24],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [20]
        },
        {
          comment: "通过{交换工作区角块}操作 复原顶层角块",
          exp: "R'D'RD",
          initial: "(R'D'RD)5",
          strip: {
            indexes: [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 18, 19, 20, 21, 22, 23, 24],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [20]
        },
        {
          comment: "为了保护下两层状态 只能使用{右层}交换角块 角块的方向通过{多次交换}旋转",
          exp: "(R'D'RD)5",
          initial: "R'D'RD",
          strip: {
            indexes: [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 18, 19, 20, 21, 22, 23, 24],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [20]
        },
        {
          comment: "如果角块位置或方向错误 交换到底层后重新复原",
          exp: "(R'D'RD)U(R'D'RD)",
          initial: "(R'D'RD)U'(R'D'RD)3",
          strip: {
            indexes: [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 18, 19, 20, 21, 22, 23, 24],
            faces: [0, 1, 2, 3, 4, 5]
          },
          highlights: [20, 24]
        },
        {
          comment: "所有角块复原后 有时下两层已经复原了 此时对齐即可完成复原",
          exp: "R'D'RDU",
          initial: "U'(R'D'RD)5",
          strip: undefined,
          highlights: []
        },
        {
          comment: "所有角块复原后 有时下两层还是乱的",
          exp: "",
          initial: "z'(R'D'RD)4U'(R'D'RD)2Uz(R'D'RD)4U'",
          strip: undefined,
          highlights: []
        },
        {
          comment: "将顶层与中层中心块对齐 重复交换工作区角块直到其他块复原",
          exp: "U(R'D'RD)2",
          initial: "z'(R'D'RD)4U'(R'D'RD)2Uz(R'D'RD)4U'",
          strip: undefined,
          highlights: []
        },
        {
          comment: "然后将魔方向左倾倒 使错误的两块都在顶层 正常复原剩余的两块",
          exp: "z'(R'D'RD)2U'(R'D'RD)4Uz",
          initial: "z'(R'D'RD)4U'(R'D'RD)2Uz",
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
