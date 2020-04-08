import Vue from "vue";
import { Component, Provide, Ref } from "vue-property-decorator";
import Viewport from "../Viewport";
import Playbar from "../Playbar";
import World from "../../cuber/world";
import Database from "../../database";
import { FACE, COLORS } from "../../cuber/define";
import Director from "../Director";
import pako from "pako";
import Setting from "../Setting";

@Component({
  template: require("./index.html"),
  components: {
    viewport: Viewport,
    playbar: Playbar,
    setting: Setting,
  },
})
export default class Algs extends Vue {
  @Provide("world")
  world: World = new World();

  @Provide("database")
  database: Database = new Database("playground", this.world);

  width: number = 0;
  height: number = 0;
  size: number = 0;

  @Ref("viewport")
  viewport: Viewport;
  
  @Ref("playbar")
  playbar: Playbar;

  @Ref("setting")
  setting: Setting;

  scene: string = "";
  action: string = "";

  constructor() {
    super();
  }

  mounted() {
    this.setting.items["order"].disable = true;
    let search = location.search || "";
    let list = search.match(/(\?|\&)data=([^&]*)(&|$)/);
    let string = list ? list[2] : "";
    string = window.atob(string);
    string = pako.inflate(string, { to: "string" });
    let data = JSON.parse(string);
    if (data.order) {
      this.world.order = data.order;
    }
    if (data.drama) {
      this.scene = data.drama.scene;
      this.playbar.scene = this.scene;
      this.action = data.drama.action;
      this.playbar.action = this.action;
      let stickers = data.drama.stickers;
      if (stickers) {
        for (const face of [FACE.L, FACE.R, FACE.D, FACE.U, FACE.B, FACE.F]) {
          let list = stickers[FACE[face]];
          if (!list) {
            continue;
          }
          for (const sticker in list) {
            let index = Number(sticker);
            let value = list[index];
            this.world.cube.stick(index, face, value);
          }
        }
      }
    }
    this.$nextTick(this.resize);
    this.$nextTick(() => {
      this.database.refresh();
    });
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

  scriptd: boolean = false;
  script() {
    this.scriptd = true;
  }
}
