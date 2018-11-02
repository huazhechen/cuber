import Vue from "vue";
import { Component, Inject, Prop, Watch } from "vue-property-decorator";
import Game from "../../cube/game";
import Cubelet from "../../cube/cubelet";
import { Encoder } from "../../common/apng";
import Option from "../../common/option";

@Component({
  template: require("./index.html")
})
export default class TimerPanel extends Vue {
  @Inject("game")
  game: Game;

  @Inject("option")
  option: Option;

  mounted() {
    let search = decodeURI(window.location.search.toString().substr(1));
    if (search.length > 0) {
      try {
        let option = JSON.parse(search);
        if (option.movie) {
          this.scene = option.scene || this.scene
          this.action = option.action || this.action
          this.stickers = option.stickers || this.stickers;
          this.option.mode = "movie";
          history.pushState({}, "Cuber", window.location.origin + window.location.pathname);
        }
      } catch (e) { }
    }
    this.loop();
    this.game.controller.taps.push(this.tap);
    this.onShowChange(this.show);
  }

  @Prop({ default: false })
  show: boolean;

  @Watch("show")
  onShowChange(to: boolean = this.show, from: boolean = this.show) {
    if (to) {
      this.init();
    } else {
      this.playing = false;
      if (from) {
        for (let i = 0; i < 27; i++) {
          for (let face = 0; face < 6; face++) {
            this.game.cube.stick(i, face, "");
          }
        }
        this.game.dirty = true;
      }
    }
  }

  scene: string = window.localStorage.getItem("movie.scene") || "";
  @Watch("scene")
  onSceneChange() {
    window.localStorage.setItem("movie.scene", this.scene);
    this.init();
  }

  action: string = window.localStorage.getItem("movie.action") || "";
  @Watch("action")
  onActionChange() {
    window.localStorage.setItem("movie.action", this.action);
  }

  operate: number = 0;
  playing: boolean = false;

  init() {
    for (let index = 0; index < 27; index++) {
      for (let face = 0; face < 6; face++) {
        let identity = index * 6 + face;
        let sticker = this.stickers[identity] || -1;
        if (sticker < 0) {
          this.game.cube.stick(index, face, "");
        } else {
          this.game.cube.stick(index, face, this.colors[sticker]);
        }
      }
    }
    this.playing = false;
    this.game.twister.twist("#");
    this.game.twister.twist(this.scene, false, 1, null, true);
  }

  reset() {
    this.scene = "";
    this.action = "";
    this.stickers = {};
    this.init();
    this.game.dirty = true;
  }

  play() {
    if (this.playing) {
      this.init();
      this.playing = true;
      this.game.twister.twist("-" + this.action + "--", false, 1, this.play, false);
    } else {
      return;
    }
  }

  toggle() {
    if (this.playing) {
      this.init();
    } else {
      this.playing = true;
      this.play();
    }
  }

  snap() {
    let content = this.game.canvas.toDataURL("image/png");
    let parts = content.split(";base64,");
    let type = parts[0].split(":")[1];
    let raw = window.atob(parts[1]);
    let length = raw.length;
    let data = new Uint8Array(length);
    for (let i = 0; i < length; ++i) {
      data[i] = raw.charCodeAt(i);
    }
    let blob = new Blob([data], { type: type });

    let link = document.createElement("a");
    let evt = document.createEvent("MouseEvents");
    evt.initEvent("click", false, false);
    link.download = "cuber.png";
    link.href = URL.createObjectURL(blob);
    link.dispatchEvent(evt);
  }

  loop() {
    requestAnimationFrame(this.loop.bind(this));
    this.record();
  }

  record() {
    if (!this.recording) {
      return;
    }
    this.encoder.addFrame();
  }

  save() {
    if (!this.recording) {
      return;
    }
    this.recording = false;
    let speed = this.option.speed;
    this.option.speed = speed;
    let data = this.encoder.finish();
    let blob = new Blob([new Uint8Array(data)], { type: "image/png" });
    let link = document.createElement("a");
    let evt = document.createEvent("MouseEvents");
    evt.initEvent("click", false, false);
    link.download = "cuber.png";
    link.href = URL.createObjectURL(blob);
    link.dispatchEvent(evt);
  }

  encoder: Encoder = new Encoder(this.game.canvas);
  recording: boolean = false;
  film() {
    this.game.duration = 60;
    this.init();
    this.recording = true;
    this.encoder.start();
    this.encoder.addFrame();
    this.game.twister.twist("-" + this.action + "-", false, 1, this.save, false);
  }

  share() {
    let data: { [key: string]: any } = {};
    data["movie"] = true;
    if (this.scene.length > 0) {
      data["scene"] = this.scene;
    }
    if (this.action.length > 0) {
      data["action"] = this.action;
    }
    data["stickers"] = this.stickers;
    let json = JSON.stringify(data);
    this.link = window.location.origin + window.location.pathname + "?" + encodeURI(json);
    this.dialog = true;
  }

  link: string = "";
  dialog: boolean = false;
  colors = [
    Cubelet.COLORS.y,
    Cubelet.COLORS.w,
    Cubelet.COLORS.r,
    Cubelet.COLORS.o,
    Cubelet.COLORS.b,
    Cubelet.COLORS.g,
    Cubelet.COLORS.h,
    Cubelet.COLORS.c,
    Cubelet.COLORS.i,
    Cubelet.COLORS.p
  ]
  color = 0;
  stickers: { [idx: number]: number } = ((): { [idx: number]: number } => {
    let save = window.localStorage.getItem("movie.stickers");
    if (save) {
      try {
        let stickers = JSON.parse(save);
        return stickers;
      } catch (e) { }
    }
    return {};
  })()

  @Watch("stickers")
  onStickersChange() {
    window.localStorage.setItem("movie.stickers", JSON.stringify(this.stickers));
  }

  tap(index: number, face: number) {
    if (!this.show) {
      return;
    }
    if (index < 0) {
      return;
    }
    let cubelet: Cubelet = this.game.cube.cubelets[index];
    index = cubelet.initial;
    face = cubelet.getColor(face);
    let identity = index * 6 + face;
    if (this.color == -1) {
      cubelet.stick(face, "");
      delete this.stickers[identity];
    } else {
      cubelet.stick(face, this.colors[this.color]);
      this.stickers[identity] = this.color;
    }
  }
}
