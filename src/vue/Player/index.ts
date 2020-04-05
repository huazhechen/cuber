import Vue from "vue";
import { Component, Provide } from "vue-property-decorator";
import Viewport from "../Viewport";
import Playbar from "../Playbar";
import World from "../../cuber/world";
import Base64 from "../../common/base64";
import { Preferance } from "../../database";
import { FACE } from "../../cuber/define";
import Director from "../Director";
import pako from "pako";

@Component({
  template: require("./index.html"),
  components: {
    viewport: Viewport,
    playbar: Playbar,
  },
})
export default class Algs extends Vue {
  @Provide("world")
  world: World = new World();

  width: number = 0;
  height: number = 0;
  size: number = 0;
  viewport: Viewport;
  playbar: Playbar;

  constructor() {
    super();
  }

  mounted() {
    let view = this.$refs.viewport;
    if (view instanceof Viewport) {
      this.viewport = view;
    }
    view = this.$refs.playbar;
    if (view instanceof Playbar) {
      this.playbar = view;
    }

    let search = location.search || "";
    let list = search.match(/(\?|\&)data=([^&]*)(&|$)/);
    let string = list ? list[2] : "";
    string = Base64.decode(string);
    string = pako.inflate(string, { to: "string" });
    let data = JSON.parse(string);
    let preferance = new Preferance(this.world);
    if (data.order) {
      this.world.order = data.order;
    }
    if (data.preferance) {
      preferance.load(data.preferance);
    }
    if (data.drama) {
      this.playbar.scene = data.drama.scene;
      this.playbar.action = data.drama.action;
      let stickers = data.drama.stickers;
      if (stickers) {
        for (const face of [FACE.L, FACE.R, FACE.D, FACE.U, FACE.B, FACE.F]) {
          let list = stickers[FACE[face]];
          if (!list) {
            continue;
          }
          for (let index = 0; index < list.length; index++) {
            let sticker = list[index];
            if (sticker && sticker >= 0) {
              this.world.cube.stick(index, face, Director.COLORS[sticker]);
            } else {
              this.world.cube.stick(index, face, "");
            }
          }
        }
      }
    }
    this.$nextTick(this.resize);
    this.loop();
  }

  loop() {
    requestAnimationFrame(this.loop.bind(this));
    this.viewport?.draw();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.size = Math.ceil(Math.min(this.width / 6, this.height / 12));
    this.viewport?.resize(this.width, this.height - this.size * 1.6 - 32);
    this.playbar?.resize(this.size);
  }

  home() {
    window.location.search = "";
  }
}
