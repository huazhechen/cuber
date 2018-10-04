import { Component, Vue, Prop, Watch, Inject } from "vue-property-decorator";
import { TwistAction, TwistNode } from "../../cube/twister";
import App from "../App";

@Component({
    template: require("./index.html")
})
export default class ScriptPanel extends Vue {

    @Inject('app')
    app: App

    @Prop({ default: false })
    show: boolean

    @Watch("show")
    onShowChange(to: boolean, from: boolean) {
        this.stick();
        if (to) {
            this.reset();
            this.strip();
        } else {
            this.playing = false;
        }
    }

    @Prop({ default: false })
    disabled: boolean

    progress: number = 0;

    playing: boolean = false;

    play() {
        if (this.progress == this.actions.length) {
            this.playing = false;
        }
        if (this.playing) {
            this.forward();
        }
    }

    forward() {
        if (this.progress == this.actions.length) {
            return;
        }
        let action = this.actions[this.progress];
        this.app.game.twister.twist(action.twist, action.reverse, action.times, this.play, false);
        this.progress++;
    }

    backward() {
        if (this.progress == 0) {
            return;
        }
        this.progress--;
        let action = this.actions[this.progress];
        this.app.game.twister.twist(action.twist, !action.reverse, action.times, this.play, false);
    }

    end() {
        if (this.progress == this.actions.length) {
            return;
        }
        let start = this.progress;
        let end = this.actions.length;
        let actions = this.actions.slice(start, end);
        for (let action of actions) {
            this.app.game.twister.twist(action.twist, action.reverse, action.times, null, true);
        }
        this.progress = this.actions.length;
    }

    start() {
        if (this.progress == 0) {
            return;
        }
        let start = 0;
        let end = this.progress;
        let actions = this.actions.slice(start, end).reverse();
        for (let action of actions) {
            this.app.game.twister.twist(action.twist, !action.reverse, action.times, null, true);
        }
        this.progress = 0;
    }

    dialog = false;
    type: number = 0;
    index: number = 1;

    stick() {
        this.app.game.cube.stick();
        this.app.game.dirty = true;
    }

    strip() {
        let strips = this.scripts[this.type].strips;
        for (let strip of strips) {
            for (let index of strip.indexs) {
                this.app.game.cube.strip(index, strip.faces);
            }
        }
        this.app.game.dirty = true;
    }

    @Watch('type')
    onTypeChange(to: number, from: number) {
        this.index = 1;
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
                { name: "F2L-01", script: "(R U'2 R' U)2 y'(R' U' R) y" },
                { name: "F2L-02", script: "(U R U' R' U') y'(R' U R) y" },
                { name: "F2L-03", script: "y U'(L' U L U)y' (R U' R')" },
                { name: "F2L-04", script: "(R U R' U')(R U'U' R' U')(R U R')" },
                { name: "F2L-05", script: "(R U' R U)y(R U' R' F2) y'" },
                { name: "F2L-06", script: "y'(R' U' R U)(R' U' R) y" },
                { name: "F2L-07", script: "(R U' R' U)(R U' R')" },
                { name: "F2L-08", script: "(R U'U')(R U R' U)(R U'U')R2" },
                { name: "F2L-09", script: "R2 y(R U R' U')y'(R' U R')" },
                { name: "F2L-10", script: "y' (R' U)(R U')(R' U R) y" },
                { name: "F2L-11", script: "(R U R' U' )(R U R')" },
                { name: "F2L-12", script: "(R U R' U')2 (R U R')" },
                { name: "F2L-13", script: "(R U' R') y' (R' U2 R) y" },
                { name: "F2L-14", script: " y'(R' U2)(R U R' U')R y" },
                { name: "F2L-15", script: "d' z U'(R2 U)(R' U' R U) z'y'" },
                { name: "F2L-16", script: "F' L' U2 r U x'" },
                { name: "F2L-17", script: "y' (U2 R2' U2)(R U R' U R2) y" },
                { name: "F2L-18", script: "(U2 R2' U2)(R' U' R U' R2)" },
                { name: "F2L-19", script: "R y (R U2 R' F') y'" },
                { name: "F2L-20", script: "U(R U'U')(R' U R U' )R'" },
                { name: "F2L-21", script: "(R U'U')(R' U' R U)R'" },
                { name: "F2L-22", script: "U'(R U')(R' U2)(R U' R')" },
                { name: "F2L-23", script: "U' (R U R') d (R' U' R) y" },
                { name: "F2L-24", script: "d (R' U R U')(R' U' R) y" },
                { name: "F2L-25", script: "y' (R' U' R) y" },
                { name: "F2L-26", script: "(R2 U)y(R U' R' F2) y'" },
                { name: "F2L-27", script: "y' (R U'U')R'2 U' R2 U' R' y" },
                { name: "F2L-28", script: "y' (R' U)(R d' U')(R U R')" },
                { name: "F2L-29", script: "U' (R U'U')(R' U2)(R U' R')" },
                { name: "F2L-30", script: "y' R2 y'(R' U' R U)y R2 y" },
                { name: "F2L-31", script: "U R U' R'" },
                { name: "F2L-32", script: "U' (R U'U' R' U)(R U R')" },
                { name: "F2L-33", script: "d (R' U' R) d' (R U R')" },
                { name: "F2L-34", script: "x(U R' U' l)" },
                { name: "F2L-35", script: "R2 y (R U R' U')y' R2" },
                { name: "F2L-36", script: "d (R' U2)(R U'U')(R' U R) y" },
                { name: "F2L-37", script: "(R U' R' U)(d R' U' R) y" },
                { name: "F2L-38", script: "(R' U2)(R2' U)(R2' U R)" },
                { name: "F2L-39", script: "y' (R2 U')(F' U F)R2 y" },
                { name: "F2L-40", script: "(R U R')" },
                { name: "F2L-41", script: "U' (R U' R' U)(R U R')" }
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
                { name: "OLL-01", script: "(R U'2) (R2' F R F') U2 (R' F R F')" },
                { name: "OLL-02", script: "(F R U R' U' F') (f R U R' U' f')" },
                { name: "OLL-03", script: "f(R U R' U')f' U' F(R U R' U')F'" },
                { name: "OLL-04", script: "f(R U R' U')y x(R' F)(R U R' U')F' y'" },
                { name: "OLL-05", script: "(r' U2) (R U R'U) r" },
                { name: "OLL-06", script: "(r U'2) (R' U' R U' r')" },
                { name: "OLL-07", script: "r U R' U R U'2 r'" },
                { name: "OLL-08", script: "r' U' R U' R' U2 r" },
                { name: "OLL-09", script: "(R' U' R) y' x' (R U')(R'F) (R U R') xy" },
                { name: "OLL-10", script: "(R U R'U)(R'F R F') (RU'2R')" },
                { name: "OLL-11", script: "r'(R2 U R' U)(R U'2 R' U) (r R')" },
                { name: "OLL-12", script: "L2 l U' z (U R'U') (R2 U R') z' r R'" },
                { name: "OLL-13", script: "(r U' r' U')(r U r') (F' U F)" },
                { name: "OLL-14", script: "R' F R U R' F'R (F U' F')" },
                { name: "OLL-15", script: "(r' U' r) (R'U'R U) (r' U r)" },
                { name: "OLL-16", script: "R B R' L U L' U' R B' R'" },
                { name: "OLL-17", script: "(R U R' U) (R' F R F'U2) R' F R F'" },
                { name: "OLL-18", script: "F (R U R' d)(R' U2) (R' F R F') y" },
                { name: "OLL-19", script: "R' U2 F R U R'U' y'R2 U'2 R B y" },
                { name: "OLL-20", script: "r'(R U) (R U R'U' r2)(R2'U) (R U') r'" },
                { name: "OLL-21", script: "(R U'2) (R' U' R U R' U') (R U' R')" },
                { name: "OLL-22", script: "R U'2 (R'2 U') (R2 U') R'2 U'2 R" },
                { name: "OLL-23", script: "(R2 D') (R U2) (R' D) (R U2 R)" },
                { name: "OLL-24", script: "(r U R' U')(r' F R F')" },
                { name: "OLL-25", script: "F'(r U R' U') (r' F R)" },
                { name: "OLL-26", script: "R U'2 R' U' R U' R'" },
                { name: "OLL-27", script: "R' U2 R U R' U R" },
                { name: "OLL-28", script: "(r U R' U') (r' R U) (R U' R')" },
                { name: "OLL-29", script: "(R2 U' R) F (R' U) (R2 U') (R' F' R)" },
                { name: "OLL-30", script: "(R2 U R' B')(RU') (R2' U) (l U l')" },
                { name: "OLL-31", script: "(r' F' U F) (L F' L' U' r)" },
                { name: "OLL-32", script: "(R U)(B' U')(R' U R B R')" },
                { name: "OLL-33", script: "(R U R' U') (R' F R F')" },
                { name: "OLL-34", script: "(R'U'R U) x' z'(R U) (L'U')r R' y" },
                { name: "OLL-35", script: "R U'2R2' F R F'(R U'2R')" },
                { name: "OLL-36", script: "R'U'R U' R'U R U l U'R'U x" },
                { name: "OLL-37", script: "F (R U' R'U'R U) (R' F')" },
                { name: "OLL-38", script: "(R U R'U) (RU'R'U') (R'F R F')" },
                { name: "OLL-39", script: "(L F'L' U'L U) (F U' L')" },
                { name: "OLL-40", script: "(R' F R U R'U') (F' U R)" },
                { name: "OLL-41", script: "R U' R' U2 R U y R U' R' U' F' y'" },
                { name: "OLL-42", script: "(R'U RU'2 R' U')(F' U)(F U R)" },
                { name: "OLL-43", script: "(B' U') (R' U R B)" },
                { name: "OLL-44", script: "f (R U R' U')f'" },
                { name: "OLL-45", script: "F (R U R' U') F'" },
                { name: "OLL-46", script: "(R' U') R' F R F' (U R)" },
                { name: "OLL-47", script: "B'(R' U' R U)2 B" },
                { name: "OLL-48", script: "F (R U R' U')2 F'" },
                { name: "OLL-49", script: "R B'(R2 F)(R2 B) R2 F' R" },
                { name: "OLL-50", script: "L'B (L2 F')(L2B') L2 F L'" },
                { name: "OLL-51", script: "f (R U R' U')2 f'" },
                { name: "OLL-52", script: "R'U' R U' R' d R' U l U xy" },
                { name: "OLL-53", script: "(r' U2) (R U R'U') (R U R'U) r" },
                { name: "OLL-54", script: "(r U'2) (R' U' R U R' U') (R U' r')" },
                { name: "OLL-55", script: "(R U'2) (R'2 U') R U' R'U2 (F R F')" },
                { name: "OLL-56", script: "F (R U R'U')(R F')(r U R'U')r'" },
                { name: "OLL-57", script: "(R U R' U' r)(R' U) (R U' r')" }
            ]
        },
        {
            name: "PLL",
            strips: [],
            scripts: [
                { name: "PLL-01", script: "(R U' R)(U R U R)(U' R' U' R2)" },
                { name: "PLL-02", script: "(R2 U)(R U R' U')(R' U')(R' U R')" },
                { name: "PLL-03", script: "M2 U M2 U2 M2 U M2" },
                {
                    name: "PLL-04",
                    script: "(R' U' R U' R)(U R U' R' U R)(U R2 U' R') U2"
                },
                { name: "PLL-05", script: "x (R2 U'2) (R' D') (R U'2) (R'DR') x'" },
                { name: "PLL-06", script: "x (R D' R) U2 R' D R U2 R'2 x'" },
                {
                    name: "PLL-07",
                    script: "x'(R U' R' D R U R')u2'(R' U R D R' U' R) x'y2"
                },
                { name: "PLL-08", script: "(R U R' U')(R'F)(R2 U' R' U' R U R' F')" },
                {
                    name: "PLL-09",
                    script: "(R' U' F')(R U R' U')(R' F R2 U' R' U')(R U R' U R)"
                },
                {
                    name: "PLL-10",
                    script: "(R' U R' U' yx2)(R' U R' U' yx)(U2 R' U' R U R) x"
                },
                {
                    name: "PLL-11",
                    script: "F(R U' R' U')(R U R' F')(R U R' U')(R' F R F')"
                },
                { name: "PLL-12", script: "z(U' R D')(R2 U R' U')(R2 U D R')z'" },
                { name: "PLL-13", script: "(R U R' F')(R U R' U')(R' F)(R2 U' R')" },
                {
                    name: "PLL-14",
                    script: "(R' U2)(R U'2)(R' F R U R' U')(R' F' R2 U')"
                },
                { name: "PLL-15", script: "(R U'2)(R' U2)(R B' R' U')(R U R B R2' U)" },
                { name: "PLL-16", script: "(R'2 u' R U' R)(U R' u)(R2 f R'f')" },
                { name: "PLL-17", script: "(R U R')y'(R2 u' R U' R' U)(R' u R2)y" },
                { name: "PLL-18", script: "(R2 uR')(U R' U' R u')(R'2 F' U F)" },
                { name: "PLL-19", script: "(R' d' F)(R2 u)(R' U R U' R u' R'2) y'" },
                {
                    name: "PLL-20",
                    script: "z(R' U R')z'(R U2 L' U R') z(U R')z'(R U2 L' U R')"
                },
                {
                    name: "PLL-21",
                    script: "z(U'R D')(R2 U R'U')z'(R U R') z(R2 U R')z'(R U')"
                }
            ]
        }
    ];
    get script() {
        return this.scripts[this.type].scripts[this.index - 1];
    }
    actions: TwistAction[] = new TwistNode(this.script.script).parse();

    @Watch("script")
    onScriptChange(to: string, from: string) {
        this.actions = new TwistNode(this.script.script).parse();
        this.reset();
        this.$nextTick(this.app.resize);
    }

    reset() {
        this.progress = 0;
        this.playing = false;
        this.app.game.reset();
        this.app.game.twister.twist(this.script.script, true, 1, null, true);
    }
}