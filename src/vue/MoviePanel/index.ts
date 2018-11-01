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
    let search = decodeURI(window.location.search.toString().substr(1)).replace(/\+/gi, '"');
    if (search.length > 0) {
      try {
        let option = JSON.parse(search);
        if (option.movie != null) {
          this.scene = option.movie.scene || "";
          this.action = option.movie.action || "";
          this.strips = option.movie.strips || [];
          this.highlights = option.movie.highlights || [];
          this.hides = option.movie.hides || [];
          this.option.mode = "movie";
          window.location.href = window.location.origin + window.location.pathname;
          console.log(window.location.href);
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
          this.game.cube.cubelets[i].show();
          for (let face = 0; face < 6; face++) {
            this.game.cube.stick(i, face);
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

  refresh() {
    for (let index = 0; index < 27; index++) {
      if (this.hides.indexOf(index) < 0) {
        this.game.cube.show(index);
      } else {
        this.game.cube.hide(index);
      }
      for (let face = 0; face < 6; face++) {
        let identity = index * 6 + face;
        if (this.highlights.indexOf(identity) >= 0) {
          this.game.cube.highlight(index, face);
        } else if (this.strips.indexOf(identity) >= 0) {
          this.game.cube.strip(index, face);
        } else {
          this.game.cube.stick(index, face);
        }
      }
    }
  }

  init() {
    this.refresh();
    this.playing = false;
    this.game.twister.twist("#");
    this.game.twister.twist(this.scene, false, 1, null, true);
  }

  reset() {
    this.hides = [];
    this.strips = [];
    this.highlights = [];
    this.refresh();
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
    let json = JSON.stringify({ movie: { scene: this.scene, action: this.action, strips: this.strips, highlights: this.highlights, hides: this.hides } });
    console.log(json.replace(/"/gi, "+"));
    this.link = window.location.origin + window.location.pathname + "?" + encodeURI(json.replace(/"/gi, "+"));
    this.dialog = true;
  }

  link: string = "";
  dialog: boolean = false;

  strips: number[] = JSON.parse(window.localStorage.getItem("movie.strips") || "[]");
  @Watch("strips")
  onStripsChange() {
    window.localStorage.setItem("movie.strips", JSON.stringify(this.strips));
  }

  highlights: number[] = JSON.parse(window.localStorage.getItem("movie.highlights") || "[]");
  @Watch("highlights")
  onHighlightsChange() {
    window.localStorage.setItem("movie.highlights", JSON.stringify(this.highlights));
  }

  hides: number[] = JSON.parse(window.localStorage.getItem("movie.hides") || "[]");
  @Watch("hides")
  onHidesChange() {
    window.localStorage.setItem("movie.hides", JSON.stringify(this.hides));
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
    let position = 0;
    switch (this.operate) {
      case 0:
        position = this.strips.indexOf(identity);
        if (position < 0) {
          cubelet.strip(face);
          this.strips.push(identity);
          position = this.highlights.indexOf(identity);
          if (position >= 0) {
            this.highlights.splice(position, 1);
          }
        } else {
          cubelet.stick(face);
          this.strips.splice(position, 1);
        }
        break;
      case 1:
        position = this.highlights.indexOf(identity);
        if (position < 0) {
          cubelet.highlight(face);
          this.highlights.push(identity);
          position = this.strips.indexOf(identity);
          if (position >= 0) {
            this.strips.splice(position, 1);
          }
        } else {
          cubelet.stick(face);
          this.highlights.splice(position, 1);
        }
        break;
      case 2:
        position = this.hides.indexOf(index);
        if (position < 0) {
          cubelet.hide();
          this.hides.push(index);
        } else {
          cubelet.show();
          this.hides.splice(position, 1);
        }
        break;
    }
  }
}
