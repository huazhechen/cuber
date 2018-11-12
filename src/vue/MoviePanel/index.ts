import Vue from "vue";
import { Component, Inject, Prop, Watch } from "vue-property-decorator";
import Game from "../../cube/game";
import Cubelet from "../../cube/cubelet";
import { Encoder } from "../../common/apng";
import Option from "../../common/option";
import pako from "pako";
import Base64 from "../../common/base64";
import * as THREE from "three";

@Component({
  template: require("./index.html")
})
export default class MoviePanel extends Vue {
  @Inject("game")
  game: Game;

  @Inject("option")
  option: Option;

  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  encoder: Encoder;
  constructor() {
    super();
    this.camera = new THREE.PerspectiveCamera(50, 1, 1, Cubelet.SIZE * 32);
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = Cubelet.SIZE * 3 * 4;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.setClearColor(0xe0e0e0);
    this.renderer.setPixelRatio(1);

    this.encoder = new Encoder(this.renderer.domElement);
  }
  size = 128;
  @Watch("size")
  onSizeChange() {
    this.resize();
  }

  speed = 0;

  resize() {
    this.camera.aspect = 1;
    let fov = (2 * Math.atan(1 / 4) * 180) / Math.PI;
    this.camera.fov = fov;
    this.camera.lookAt(this.game.scene.position);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.size, this.size, true);
  }

  mounted() {
    let search = window.location.search.toString().substr(1);
    if (search.length > 0) {
      try {
        let string = Base64.decode(search);
        string = pako.inflate(string, { to: "string" });
        let option = JSON.parse(string);
        if (option.movie) {
          this.scene = option.scene || "";
          this.action = option.action || "";
          this.stickers = option.stickers || [];
          this.option.mode = "movie";
          history.replaceState({}, "Cuber", window.location.origin + window.location.pathname);
        }
      } catch (e) {}
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
    this.init();
  }

  operate: number = 0;
  playing: boolean = false;

  init() {
    this.resize();
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
    this.stickers = [];
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

  loop() {
    requestAnimationFrame(this.loop.bind(this));
    this.record();
  }

  record() {
    if (!this.recording) {
      return;
    }
    this.renderer.render(this.game.scene, this.camera);
    this.encoder.add();
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
    let click = document.createEvent("MouseEvents");
    click.initEvent("click", false, false);
    link.download = "cuber.png";
    link.href = URL.createObjectURL(blob);
    link.dispatchEvent(click);
  }

  mode: string = "snap";
  recording: boolean = false;
  film() {
    this.game.duration = 30 - this.speed * 5;
    this.init();
    this.recording = true;
    this.renderer.render(this.game.scene, this.camera);
    this.encoder.start();
    this.encoder.add();
    this.game.twister.twist("-" + this.action + "-", false, 1, this.save, false);
  }

  snap() {
    this.renderer.render(this.game.scene, this.camera);
    let content = this.renderer.domElement.toDataURL("image/png");
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

  generate() {
    switch (this.mode) {
      case "snap":
        this.snap();
        break;
      case "film":
        this.film();
        break;
    }
  }

  share() {
    let data: { [key: string]: any } = {};
    data["movie"] = true;
    data["scene"] = this.scene;
    data["action"] = this.action;
    data["stickers"] = this.stickers;
    let json = JSON.stringify(data);
    let string = pako.deflate(json, { to: "string" });
    string = Base64.encode(string);
    this.link = window.location.origin + window.location.pathname + "?" + string;
    this.shareDialog = true;
  }

  link: string = "";
  shareDialog: boolean = false;
  colorDialog: boolean = false;
  qualityDialog: boolean = false;

  colors = [
    Cubelet.COLORS.yellow,
    Cubelet.COLORS.white,
    Cubelet.COLORS.blue,
    Cubelet.COLORS.green,
    Cubelet.COLORS.red,
    Cubelet.COLORS.orange,
    Cubelet.COLORS.black,
    Cubelet.COLORS.gray,
    Cubelet.COLORS.cyan,
    Cubelet.COLORS.lime,
    Cubelet.COLORS.purple
  ];
  color = 0;
  stickers: number[] = ((): number[] => {
    let save = window.localStorage.getItem("movie.stickers");
    if (save) {
      try {
        let stickers = JSON.parse(save);
        return stickers;
      } catch (e) {}
    }
    return [];
  })();

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
    if (this.stickers[identity] == this.color) {
      this.stickers[identity] = -1;
    } else {
      this.stickers[identity] = this.color;
    }
    if (this.stickers[identity] < 0) {
      cubelet.stick(face, "");
    } else {
      cubelet.stick(face, this.colors[this.stickers[identity]]);
    }
    window.localStorage.setItem("movie.stickers", JSON.stringify(this.stickers));
  }
}
