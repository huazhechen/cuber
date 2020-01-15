import Vue from "vue";
import { Component, Inject, Prop, Watch } from "vue-property-decorator";
import Cuber from "../../cuber/cuber";
import Option from "../../common/option";
import { FACES } from "../../common/define";
import { Vector3 } from "three";

@Component({
  template: require("./index.html")
})
export default class Keyboard extends Vue {
  @Inject("cuber")
  cuber: Cuber;

  @Inject("option")
  option: Option;

  width: number = 0;
  height: number = 0;

  assistant: boolean = false;

  layers: number = 0;
  operations: string[][] = [
    ["L", "D", "B", "F", "U", "R", "L'", "D'", "B'", "F'", "U'", "R'"],
    ["l", "d", "b", "f", "u", "r", "l'", "d'", "b'", "f'", "u'", "r'"],
    ["M", "E", "S", "z", "y", "x", "M'", "E'", "S'", "z'", "y'", "x'"]
  ];

  strips = [
    [{ indexes: [0, 2, 3, 5, 6, 7, 8, 15, 17, 18, 20, 21, 23, 24, 25, 26], faces: [0, 1, 2, 3, 4, 5] }],
    [{ indexes: [6, 7, 8, 15, 16, 17, 24, 25, 26], faces: [0, 1, 2, 3, 4, 5] }],
    [
      { indexes: [0, 1, 2, 3, 4, 5, 9, 10, 11, 12, 14, 18, 19, 20, 21, 22, 23], faces: [0, 1, 2, 3, 4, 5] },
      { indexes: [6, 7, 8, 15, 16, 17, 24, 25, 26], faces: [0, 1, 2, 4, 5] }
    ],
    [{ indexes: [0, 1, 2, 3, 4, 5, 9, 10, 11, 12, 14, 18, 19, 20, 21, 22, 23], faces: [0, 1, 2, 3, 4, 5] }]
  ];

  faces: { [key: number]: FACES } = {
    4: FACES.B,
    10: FACES.D,
    12: FACES.L,
    14: FACES.R,
    16: FACES.U,
    22: FACES.F
  };

  check() {
    this.assistant = !this.assistant;
    this.cuber.strip([]);
    if (this.assistant) {
      let d = this.cuber.cube.initials[10];
      let r = this.cuber.cube.initials[14];
      let b = this.cuber.cube.initials[4];
      let l = this.cuber.cube.initials[12];
      let f = this.cuber.cube.initials[22];
      let u = this.cuber.cube.initials[16];
      let vector = new Vector3();
      let index;
      let ok;
      ok = [r, b, l, f].every(cubelet => {
        vector.copy(d.vector).add(cubelet.vector);
        index = (vector.z + 1) * 9 + (vector.y + 1) * 3 + (vector.x + 1);
        let c = this.cuber.cube.cubelets[index];
        if (c.getColor(this.faces[d.index]) == FACES.D && c.getColor(this.faces[cubelet.index]) == this.faces[cubelet.initial]) {
          return true;
        }
      });
      if (!ok) {
        this.cuber.strip(this.strips[0]);
        return;
      }
      ok = [
        [r, b],
        [b, l],
        [l, f],
        [f, r]
      ].every(cubelets => {
        vector.copy(cubelets[0].vector).add(cubelets[1].vector);
        index = (vector.z + 1) * 9 + (vector.y + 1) * 3 + (vector.x + 1);
        let c = this.cuber.cube.cubelets[index];
        if (
          c.getColor(this.faces[cubelets[0].index]) == this.faces[cubelets[0].initial] &&
          c.getColor(this.faces[cubelets[1].index]) == this.faces[cubelets[1].initial]
        ) {
          vector.add(d.vector);
          index = (vector.z + 1) * 9 + (vector.y + 1) * 3 + (vector.x + 1);
          let c = this.cuber.cube.cubelets[index];
          if (
            c.getColor(this.faces[d.index]) == FACES.D &&
            c.getColor(this.faces[cubelets[0].index]) == this.faces[cubelets[0].initial] &&
            c.getColor(this.faces[cubelets[1].index]) == this.faces[cubelets[1].initial]
          ) {
            return true;
          }
        }
      });
      if (!ok) {
        this.cuber.strip(this.strips[1]);
        return;
      }
      ok = this.cuber.cube.groups[FACES[this.faces[u.index]]].indices.every(i => {
        if (this.cuber.cube.cubelets[i].getColor(this.faces[u.index]) == FACES.U) {
          return true;
        }
      });
      if (!ok) {
        this.cuber.strip(this.strips[2]);
        return;
      }
      ok = [
        [r, b],
        [b, l],
        [l, f],
        [f, r]
      ].every(cubelets => {
        vector.copy(u.vector).add(cubelets[0].vector);
        index = (vector.z + 1) * 9 + (vector.y + 1) * 3 + (vector.x + 1);
        let c = this.cuber.cube.cubelets[index];
        if (c.getColor(this.faces[cubelets[0].index]) == this.faces[cubelets[0].initial]) {
          vector.add(cubelets[1].vector);
          index = (vector.z + 1) * 9 + (vector.y + 1) * 3 + (vector.x + 1);
          let c = this.cuber.cube.cubelets[index];
          if (
            c.getColor(this.faces[cubelets[0].index]) == this.faces[cubelets[0].initial] &&
            c.getColor(this.faces[cubelets[1].index]) == this.faces[cubelets[1].initial]
          ) {
            return true;
          }
        }
      });
      if (!ok) {
        this.cuber.strip(this.strips[3]);
        return;
      }
    }
  }

  get style() {
    return {
      margin: this.height / 48 + "px",
      width: (this.height / 32) * 9 + "px",
      height: (this.height / 32) * 9 + "px",
      "min-width": "0%",
      "min-height": "0%",
      "text-transform": "none"
    };
  }

  get exps() {
    return this.operations[this.layers];
  }

  twist(exp: string) {
    this.cuber.twister.twist(exp);
  }

  reverse() {
    if (this.cuber.history.last == undefined) {
      return;
    }
    this.cuber.twister.twist(this.cuber.history.last.value, true, 1, false);
  }
}
