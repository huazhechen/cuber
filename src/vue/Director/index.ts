import Vue from "vue";
import { Component, Provide, Watch } from "vue-property-decorator";
import Cuber from "../../cuber/cuber";
import Keyboard from "../Keyboard";
import Option from "../../common/option";
import Tune from "../Tune";
import { COLORS } from "../../common/define";
import Cubelet from "../../cuber/cubelet";

@Component({
  template: require("./index.html"),
  components: {
    keyboard: Keyboard,
    tune: Tune
  }
})
export default class Director extends Vue {
  @Provide("cuber")
  cuber: Cuber;

  @Provide("option")
  option: Option;

  tune: boolean = false;
  width: number = 0;
  height: number = 0;
  size: number = 0;
  playing: boolean = false;
  strips: boolean[] = new Array(6 * 27).fill(false);

  constructor() {
    super();
    let canvas = document.createElement("canvas");
    this.cuber = new Cuber(canvas);
    this.option = new Option(this.cuber);
    this.cuber.cube.callbacks.push(() => {
      this.triger();
    });
  }

  triger() {
    if (this.cuber.cube.twister.length == 0 && this.playing) {
      this.toggle();
    }
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.size = Math.min(this.width / 8, this.height / 14);

    this.cuber.width = this.width;
    this.cuber.height = this.height - this.size * 4;
    this.cuber.resize();
    let cuber = this.$refs.cuber;
    if (cuber instanceof HTMLElement) {
      cuber.style.width = this.width + "px";
      cuber.style.height = this.height - this.size * 4 + "px";
    }
  }

  mounted() {
    if (this.$refs.cuber instanceof Element) {
      let cuber = this.$refs.cuber;
      cuber.appendChild(this.cuber.canvas);
      this.$nextTick(this.resize);
    }
    this.cuber.controller.taps.push(this.tap);
    this.loop();
  }

  init() {
    this.cuber.controller.disable = false;
    this.playing = false;
    this.cuber.cube.twister.twist("#");
    this.cuber.cube.twister.twist(this.scene, false, 1, true);
  }

  stick() {}

  reset() {
    this.stick();
    this.init();
    this.cuber.dirty = true;
  }

  scene: string = "";
  @Watch("scene")
  onSceneChange() {
    this.init();
  }

  action: string = "";

  play() {
    this.init();
    this.cuber.controller.disable = true;
    this.playing = true;
    this.cuber.cube.twister.twist("-" + this.action + "--", false, 1);
  }

  toggle() {
    if (this.playing) {
      this.init();
    } else {
      this.playing = true;
      this.play();
    }
  }

  recording: boolean = false;
  loop() {
    requestAnimationFrame(this.loop.bind(this));
    if (this.recording) {
      this.record();
    } else {
      this.cuber.render();
    }
  }

  record() {}

  save() {
    // if (!this.recording) {
    //   return;
    // }
    // this.recording = false;
    // let data = this.encoder.finish();
    // let blob = new Blob([new Uint8Array(data)], { type: "image/png" });
    // let link = document.createElement("a");
    // let click = document.createEvent("MouseEvents");
    // click.initEvent("click", false, false);
    // link.download = "cuber.png";
    // link.href = URL.createObjectURL(blob);
    // link.dispatchEvent(click);
  }

  film() {
    // this.init();
    // this.recording = true;
    // this.renderer.render(this.cuber.scene, this.cuber.camera);
    // this.encoder.start();
    // this.encoder.add();
    // this.cuber.cube.twister.twist("-" + this.action + "-", false, 1);
  }

  snap() {
    // this.renderer.render(this.cuber.scene, this.cuber.camera);
    // let content = this.renderer.domElement.toDataURL("image/png");
    // let parts = content.split(";base64,");
    // let type = parts[0].split(":")[1];
    // let raw = window.atob(parts[1]);
    // let length = raw.length;
    // let data = new Uint8Array(length);
    // for (let i = 0; i < length; ++i) {
    //   data[i] = raw.charCodeAt(i);
    // }
    // let blob = new Blob([data], { type: type });
    // let link = document.createElement("a");
    // let evt = document.createEvent("MouseEvents");
    // evt.initEvent("click", false, false);
    // link.download = "cuber.png";
    // link.href = URL.createObjectURL(blob);
    // link.dispatchEvent(evt);
  }

  tap(index: number, face: number) {
    if (index < 0) {
      return;
    }
    this.cuber.cube.cubelets[index];
    let cubelet: Cubelet = this.cuber.cube.cubelets[index];
    index = cubelet.initial;
    face = cubelet.getColor(face);
    let identity = index * 6 + face;
    this.strips[identity] = !this.strips[identity];
    cubelet.stick(face, this.strips[identity] ? COLORS.GRAY : "");
  }
}
