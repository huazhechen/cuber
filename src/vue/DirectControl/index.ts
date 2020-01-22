import Vue from "vue";
import { Component, Inject, Prop, Watch } from "vue-property-decorator";
import Option from "../../common/option";
import * as THREE from "three";
import Cuber from "../../cuber/cuber";
import Cubelet from "../../cuber/cubelet";
import { Encoder } from "../../common/encoder";
import { COLORS } from "../../common/define";

@Component({
  template: require("./index.html")
})
export default class DirectControl extends Vue {
  @Inject("cuber")
  cuber: Cuber;

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
    this.camera.lookAt(this.cuber.scene.position);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.size, this.size, true);
  }

  mounted() {
    this.loop();
    this.cuber.controller.taps.push(this.tap);
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
        this.cuber.cube.stick();
        this.cuber.dirty = true;
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
        let sticker = this.stickers[identity];
        if (null == sticker) {
          sticker = -1;
        }
        if (sticker < 0) {
          this.cuber.cube.initials[index].stick(face, "");
        } else {
          this.cuber.cube.initials[index].stick(face, this.colors[sticker]);
        }
      }
    }
    this.playing = false;
    this.cuber.cube.twister.twist("#");
    this.cuber.cube.twister.twist(this.scene, false, 1);
  }

  reset() {
    this.stickers = [];
    this.init();
    this.cuber.dirty = true;
  }

  play() {
    if (this.playing) {
      this.init();
      this.playing = true;
      this.cuber.cube.twister.twist("-" + this.action + "--", false, 1);
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
    this.renderer.render(this.cuber.scene, this.camera);
    this.encoder.add();
  }

  save() {
    if (!this.recording) {
      return;
    }
    this.recording = false;
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
    this.init();
    this.recording = true;
    this.renderer.render(this.cuber.scene, this.camera);
    this.encoder.start();
    this.encoder.add();
    this.cuber.cube.twister.twist("-" + this.action + "-", false, 1);
  }

  snap() {
    this.renderer.render(this.cuber.scene, this.camera);
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

  link: string = "";
  shareDialog: boolean = false;
  colorDialog: boolean = false;
  qualityDialog: boolean = false;

  colors = [
    COLORS.YELLOW,
    COLORS.WHITE,
    COLORS.BLUE,
    COLORS.GREEN,
    COLORS.RED,
    COLORS.ORANGE,
    COLORS.BLACK,
    COLORS.GREEN,
    COLORS.CYAN,
    COLORS.LIME,
    COLORS.PURPLE
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
    let cubelet: Cubelet = this.cuber.cube.cubelets[index];
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