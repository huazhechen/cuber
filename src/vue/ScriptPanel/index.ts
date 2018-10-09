import Vue from "vue";
import { Component, Prop, Watch, Inject } from "vue-property-decorator";
import { TwistAction, TwistNode } from "../../cube/twister";
import Game from "../../cube/game";

@Component({
  template: require("./index.html")
})
export default class ScriptPanel extends Vue {
  @Inject("game")
  game: Game;

  @Prop({ default: false })
  show: boolean;

  @Watch("show")
  onShowChange(to: boolean, from: boolean) {
    this.stick();
    if (to) {
      this.onTypeChange();
      this.onIndexChange();
      this.onScriptChange();
      this.onExpChange(this.exp);
    } else {
      this.playing = false;
    }
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
    this.playing = false;
    if (this.progress == this.actions.length) {
      return;
    }
    let action = this.actions[this.progress];
    this.progress++;
    this.game.twister.twist(action.exp, action.reverse, action.times);
  }

  backward() {
    this.playing = false;
    if (this.progress == 0) {
      return;
    }
    this.progress--;
    let action = this.actions[this.progress];
    this.game.twister.twist(action.exp, !action.reverse, action.times);
  }

  stop() {
    this.playing = false;
    if (this.progress == 0) {
      return;
    }
    let start = 0;
    let end = this.progress;
    let actions = this.actions.slice(start, end).reverse();
    for (let action of actions) {
      this.game.twister.twist(
        action.exp,
        !action.reverse,
        action.times,
        null,
        true
      );
    }
    this.progress = 0;
  }

  dialog = false;
  type: number = Number(window.localStorage.getItem("script.type") || 0);
  index: number = Number(window.localStorage.getItem("script.index") || 1);

  stick() {
    this.game.cube.stick();
    this.game.dirty = true;
  }

  strip() {
    let strips = this.scripts[this.type].strips;
    for (let strip of strips) {
      for (let index of strip.indexs) {
        this.game.cube.strip(index, strip.faces);
      }
    }
    this.game.dirty = true;
  }

  @Watch("index")
  onIndexChange() {
    let length = this.scripts[this.type].scripts.length;
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

  scripts = [
    {
      name: "F2L",
      strips: [
        {
          indexs: [6, 7, 8, 15, 16, 17, 24, 25, 26],
          faces: [0, 1, 2, 3, 4, 5]
        }
      ],
      scripts: [
        { name: "F2L-01", exp: "URU'R'" },
        { name: "F2L-02", exp: "x(UR'U'l)" },
        { name: "F2L-03", exp: "y'(R'U'R)y" },
        { name: "F2L-04", exp: "(RUR')" },
        { name: "F2L-05", exp: "y'R2y'(R'U'RU)yR2y" },
        { name: "F2L-06", exp: "R2y(RUR'U')y'R2" },
        { name: "F2L-07", exp: "U'(RU'U')(R'U2)(RU'R')" },
        { name: "F2L-08", exp: "d(R'U2)(RU'U')(R'UR)y" },
        { name: "F2L-09", exp: "(R2U)y(RU'R'F2)y'" },
        { name: "F2L-10", exp: "y'(R2U')(F'UF)R2y" },
        { name: "F2L-11", exp: "y'(RU'U')R'2U'R2U'R'y" },
        { name: "F2L-12", exp: "(R'U2)(R2'U)(R2'UR)" },
        { name: "F2L-13", exp: "d(R'URU')(R'U'R)y" },
        { name: "F2L-14", exp: "U'(RU'R'U)(RUR')" },
        { name: "F2L-15", exp: "y'(R'U)(Rd'U')(RUR')" },
        { name: "F2L-16", exp: "(RU'R'U)(dR'U'R)y" },
        { name: "F2L-17", exp: "(RU'U')(R'U'RU)R'" },
        { name: "F2L-18", exp: "y'(R'U2)(RUR'U')Ry" },
        { name: "F2L-19", exp: "U(RU'U')(R'URU')R'" },
        { name: "F2L-20", exp: "d'zU'(R2U)(R'U'RU)z'y'" },
        { name: "F2L-21", exp: "Ry(RU2R'F')y'" },
        { name: "F2L-22", exp: "F'L'U2rUx'" },
        { name: "F2L-23", exp: "(U2R2'U2)(R'U'RU'R2)" },
        { name: "F2L-24", exp: "y'(U2R2'U2)(RUR'UR2)y" },
        { name: "F2L-25", exp: "yU'(L'ULU)y'(RU'R')" },
        { name: "F2L-26", exp: "(URU'R'U')y'(R'UR)y" },
        { name: "F2L-27", exp: "(RU'R'U)(RU'R')" },
        { name: "F2L-28", exp: "y'(R'U)(RU')(R'UR)y" },
        { name: "F2L-29", exp: "y'(R'U'RU)(R'U'R)y" },
        { name: "F2L-30", exp: "(RUR'U')(RUR')" },
        { name: "F2L-31", exp: "(RU'R')y'(R'U2R)y" },
        { name: "F2L-32", exp: "(RUR'U')2(RUR')" },
        { name: "F2L-33", exp: "U'(RU')(R'U2)(RU'R')" },
        { name: "F2L-34", exp: "U'(RU'U'R'U)(RUR')" },
        { name: "F2L-35", exp: "U'(RUR')d(R'U'R)y" },
        { name: "F2L-36", exp: "d(R'U'R)d'(RUR')" },
        { name: "F2L-37", exp: "(RU'2R'U)2y'(R'U'R)y" },
        { name: "F2L-38", exp: "(RUR'U')(RU'U'R'U')(RUR')" },
        { name: "F2L-39", exp: "(RU'U')(RUR'U)(RU'U')R2" },
        { name: "F2L-40", exp: "(RU'RU)y(RU'R'F2)y'" },
        { name: "F2L-41", exp: "R2y(RUR'U')y'(R'UR')" }
      ]
    },
    {
      name: "OLL",
      strips: [
        {
          indexs: [6, 7, 8, 15, 16, 17, 24, 25, 26],
          faces: [0, 1, 2, 4, 5]
        }
      ],
      scripts: [
        { name: "OLL-01", exp: "(RU'2)(R2'FRF')U2(R'FRF')" },
        { name: "OLL-02", exp: "(FRUR'U'F')(fRUR'U'f')" },
        { name: "OLL-03", exp: "f(RUR'U')f'U'F(RUR'U')F'" },
        { name: "OLL-04", exp: "f(RUR'U')yx(R'F)(RUR'U')F'y'" },
        { name: "OLL-05", exp: "(r'U2)(RUR'U)r" },
        { name: "OLL-06", exp: "(rU'2)(R'U'RU'r')" },
        { name: "OLL-07", exp: "rUR'URU'2r'" },
        { name: "OLL-08", exp: "r'U'RU'R'U2r" },
        { name: "OLL-09", exp: "(R'U'R)y'x'(RU')(R'F)(RUR')xy" },
        { name: "OLL-10", exp: "(RUR'U)(R'FRF')(RU'2R')" },
        { name: "OLL-11", exp: "r'(R2UR'U)(RU'2R'U)(rR')" },
        { name: "OLL-12", exp: "L2lU'z(UR'U')(R2UR')z'rR'" },
        { name: "OLL-13", exp: "(rU'r'U')(rUr')(F'UF)" },
        { name: "OLL-14", exp: "R'FRUR'F'R(FU'F')" },
        { name: "OLL-15", exp: "(r'U'r)(R'U'RU)(r'Ur)" },
        { name: "OLL-16", exp: "RBR'LUL'U'RB'R'" },
        { name: "OLL-17", exp: "(RUR'U)(R'FRF'U2)R'FRF'" },
        { name: "OLL-18", exp: "F(RUR'd)(R'U2)(R'FRF')y" },
        { name: "OLL-19", exp: "R'U2FRUR'U'y'R2U'2RBy" },
        { name: "OLL-20", exp: "r'(RU)(RUR'U'r2)(R2'U)(RU')r'" },
        { name: "OLL-21", exp: "(RU'2)(R'U'RUR'U')(RU'R')" },
        { name: "OLL-22", exp: "RU'2(R'2U')(R2U')R'2U'2R" },
        { name: "OLL-23", exp: "(R2D')(RU2)(R'D)(RU2R)" },
        { name: "OLL-24", exp: "(rUR'U')(r'FRF')" },
        { name: "OLL-25", exp: "F'(rUR'U')(r'FR)" },
        { name: "OLL-26", exp: "RU'2R'U'RU'R'" },
        { name: "OLL-27", exp: "R'U2RUR'UR" },
        { name: "OLL-28", exp: "(rUR'U')(r'RU)(RU'R')" },
        { name: "OLL-29", exp: "(R2U'R)F(R'U)(R2U')(R'F'R)" },
        { name: "OLL-30", exp: "(R2UR'B')(RU')(R2'U)(lUl')" },
        { name: "OLL-31", exp: "(r'F'UF)(LF'L'U'r)" },
        { name: "OLL-32", exp: "(RU)(B'U')(R'URBR')" },
        { name: "OLL-33", exp: "(RUR'U')(R'FRF')" },
        { name: "OLL-34", exp: "(R'U'RU)x'z'(RU)(L'U')rR'y" },
        { name: "OLL-35", exp: "RU'2R2'FRF'(RU'2R')" },
        { name: "OLL-36", exp: "R'U'RU'R'URUlU'R'Ux" },
        { name: "OLL-37", exp: "F(RU'R'U'RU)(R'F')" },
        { name: "OLL-38", exp: "(RUR'U)(RU'R'U')(R'FRF')" },
        { name: "OLL-39", exp: "(LF'L'U'LU)(FU'L')" },
        { name: "OLL-40", exp: "(R'FRUR'U')(F'UR)" },
        { name: "OLL-41", exp: "RU'R'U2RUyRU'R'U'F'y'" },
        { name: "OLL-42", exp: "(R'URU'2R'U')(F'U)(FUR)" },
        { name: "OLL-43", exp: "(B'U')(R'URB)" },
        { name: "OLL-44", exp: "f(RUR'U')f'" },
        { name: "OLL-45", exp: "F(RUR'U')F'" },
        { name: "OLL-46", exp: "(R'U')R'FRF'(UR)" },
        { name: "OLL-47", exp: "B'(R'U'RU)2B" },
        { name: "OLL-48", exp: "F(RUR'U')2F'" },
        { name: "OLL-49", exp: "RB'(R2F)(R2B)R2F'R" },
        { name: "OLL-50", exp: "L'B(L2F')(L2B')L2FL'" },
        { name: "OLL-51", exp: "f(RUR'U')2f'" },
        { name: "OLL-52", exp: "R'U'RU'R'dR'UlUxy" },
        { name: "OLL-53", exp: "(r'U2)(RUR'U')(RUR'U)r" },
        { name: "OLL-54", exp: "(rU'2)(R'U'RUR'U')(RU'r')" },
        { name: "OLL-55", exp: "(RU'2)(R'2U')RU'R'U2(FRF')" },
        { name: "OLL-56", exp: "F(RUR'U')(RF')(rUR'U')r'" },
        { name: "OLL-57", exp: "(RUR'U'r)(R'U)(RU'r')" }
      ]
    },
    {
      name: "PLL",
      strips: [],
      scripts: [
        { name: "PLL-Aa", exp: "x(R2U'2)(R'D')(RU'2)(R'DR')x'" },
        { name: "PLL-Ab", exp: "x(RD'R)U2R'DRU2R'2x'" },
        {
          name: "PLL-E",
          exp: "x'(RU'R'DRUR')u2'(R'URDR'U'R)x'y2"
        },
        {
          name: "PLL-F",
          exp: "(R'U'F')(RUR'U')(R'FR2U'R'U')(RUR'UR)"
        },
        { name: "PLL-Ga", exp: "(R2uR')(UR'U'Ru')(R'2F'UF)" },
        { name: "PLL-Gb", exp: "(R'd'F)(R2u)(R'URU'Ru'R'2)y'" },
        { name: "PLL-Gc", exp: "(R'2u'RU'R)(UR'u)(R2fR'f')" },
        { name: "PLL-Gd", exp: "(RUR')y'(R2u'RU'R'U)(R'uR2)y" },
        { name: "PLL-H", exp: "M2UM2U2M2UM2" },
        { name: "PLL-Ja", exp: "z(U'RD')(R2UR'U')(R2UDR')z'" },
        { name: "PLL-Jb", exp: "(RUR'F')(RUR'U')(R'F)(R2U'R')" },
        {
          name: "PLL-Na",
          exp: "z(R'UR')z'(RU2L'UR')z(UR')z'(RU2L'UR')"
        },
        {
          name: "PLL-Nb",
          exp: "z(U'RD')(R2UR'U')z'(RUR')z(R2UR')z'(RU')"
        },
        { name: "PLL-Ra", exp: "(RU'2)(R'U2)(RB'R'U')(RURBR2'U)" },
        {
          name: "PLL-Rb",
          exp: "(R'U2)(RU'2)(R'FRUR'U')(R'F'R2U')"
        },
        { name: "PLL-T", exp: "(RUR'U')(R'F)(R2U'R'U'RUR'F')" },
        { name: "PLL-Ua", exp: "(RU'R)(URUR)(U'R'U'R2)" },
        { name: "PLL-Ub", exp: "(R2U)(RUR'U')(R'U')(R'UR')" },
        {
          name: "PLL-V",
          exp: "(R'UR'U'yx2)(R'UR'U'yx)(U2R'U'RUR)x"
        },
        {
          name: "PLL-Y",
          exp: "F(RU'R'U')(RUR'F')(RUR'U')(R'FRF')"
        },
        {
          name: "PLL-Z",
          exp: "(R'U'RU'R)(URU'R'UR)(UR2U'R')U2"
        }
      ]
    }
  ];

  get script() {
    let script = this.scripts[this.type].scripts[this.index - 1];
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
    this.init();
  }

  @Watch("script")
  onScriptChange() {
    this.playing = false;
    let storage = window.localStorage;
    this.exp = storage.getItem(this.script.name) || this.script.exp;
  }

  toggle() {
    this.playing = !this.playing;
    this.play();
  }

  init() {
    this.progress = 0;
    this.playing = false;
    this.game.twister.clear();
    this.game.twister.twist("#");
    this.game.twister.twist(this.exp, true, 1, null, true);
  }
}
