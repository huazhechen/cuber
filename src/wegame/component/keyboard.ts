import Main from "../main";
import svg_mirror_on from "../resource/mirror_on.svg";
import svg_mirror_off from "../resource/mirror_off.svg";
import svg_lock_on from "../resource/lock_on.svg";
import svg_lock_off from "../resource/lock_off.svg";
import svg_hollow_on from "../resource/hollow_on.svg";
import svg_hollow_off from "../resource/hollow_off.svg";
import svg_help from "../resource/help.svg";
import svg_backspace_on from "../resource/backspace_on.svg";
import svg_backspace_off from "../resource/backspace_off.svg";
import { Component } from "./component";
import * as THREE from "three";
import { COLORS } from "../../cuber/cuber";
import TouchAction from "../../common/touch";

class KeyboardButton {
  x: number;
  y: number;
  size: number;
  keys: string[];
  keyboard: Keyboard;

  constructor(x: number, y: number, size: number, keys: string[], keyboard: Keyboard) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.keys = keys;
    this.keyboard = keyboard;
  }

  strips = [
    {},
    { U: [1, 2, 3, 4, 6, 7, 8, 9], F: [1, 2, 3, 4, 6, 7, 9], R: [1, 2, 3, 4, 6, 7, 9], B: [1, 2, 3, 4, 6, 7, 9], L: [1, 2, 3, 4, 6, 7, 9], D: [1, 3, 7, 9] },
    { U: [1, 2, 3, 4, 5, 6, 7, 8, 9], F: [1, 2, 3], R: [1, 2, 3], B: [1, 2, 3], L: [1, 2, 3] }
  ];
  strip() {
    this.keyboard.main.cuber.cube.strip(this.strips[this.keyboard.cf]);
  }

  get key() {
    let key = this.keys[0];
    if (key == "sole") {
      key = this.keys[this.keyboard.layer];
    } else if (key == "help") {
      key = this.keys[this.keyboard.cf];
    }
    switch (key) {
      case "sole":
      case "dual":
      case "mix":
      case "Crs":
      case "F2L":
        key = key + " on";
        break;
      case "mirror":
        if (this.keyboard.main.context.mirror) {
          key = key + " on";
        }
        break;
      case "hollow":
        if (this.keyboard.main.context.hollow) {
          key = key + " on";
        }
        break;
      case "lock":
        if (this.keyboard.main.context.lock) {
          key = key + " on";
        }
        break;
      case "backspace":
        if (this.keyboard.main.cuber.cube.history.length == 0 || this.keyboard.main.context.lock) {
          key = key + " disable";
        }
        break;
      case "help":
        break;
      default:
        if (this.keyboard.main.context.lock) {
          key = key + " disable";
        }
        break;
    }
    return key;
  }

  paint() {
    let context = this.keyboard.context;
    context.fillStyle = "#000000";
    context.strokeStyle = "#000000";

    let padding = this.size / 16;
    let size = this.size - 2 * padding;
    let x = this.x + padding;
    let y = this.y + padding;
    let line = padding / 2;
    line = line < 2 ? 2 : line;
    context.lineWidth = line;

    let font = Math.round(size * 0.5);
    context.font = font + "px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";

    let keys = this.key.split(" ");
    if (keys[1] == "on") {
      context.fillStyle = COLORS.PINK;
      context.strokeStyle = COLORS.PINK;
    }
    if (keys[1] == "disable") {
      context.fillStyle = COLORS.DISABLE;
      context.strokeStyle = COLORS.DISABLE;
    }
    let dx = size / 24;
    let dy = size / 30;
    switch (keys[0]) {
      case "sole":
        context.fillRect(x + 4 * dx, y + 6 * dy + 0 * (7 * dy), 16 * dx, 4 * dy);
        context.fillStyle = COLORS.DISABLE;
        context.strokeStyle = COLORS.DISABLE;
        context.fillRect(x + 4 * dx, y + 6 * dy + 1 * (7 * dy), 16 * dx, 4 * dy);
        context.fillRect(x + 4 * dx, y + 6 * dy + 2 * (7 * dy), 16 * dx, 4 * dy);
        break;
      case "dual":
        context.fillRect(x + 4 * dx, y + 6 * dy + 0 * (7 * dy), 16 * dx, 4 * dy);
        context.fillRect(x + 4 * dx, y + 6 * dy + 1 * (7 * dy), 16 * dx, 4 * dy);
        context.fillStyle = COLORS.DISABLE;
        context.strokeStyle = COLORS.DISABLE;
        context.fillRect(x + 4 * dx, y + 6 * dy + 2 * (7 * dy), 16 * dx, 4 * dy);
        break;
      case "mix":
        context.fillRect(x + 4 * dx, y + 6 * dy + 1 * (7 * dy), 16 * dx, 4 * dy);
        context.fillRect(x + 6 * dx, y + 6 * dy + 0 * (7 * dy), 12 * dx, 4 * dy);
        context.fillRect(x + 6 * dx, y + 6 * dy + 2 * (7 * dy), 12 * dx, 4 * dy);
        break;
      case "mirror":
      case "help":
      case "hollow":
      case "lock":
      case "backspace":
      case "camera":
      case "casino":
      case "complete":
        context.drawImage(this.keyboard.images[this.key], x + 2 * padding, y + 2 * padding, size - 4 * padding, size - 4 * padding);
        break;
      default:
        context.fillText(keys[0], x + size / 2, y + size / 2 + line);
        break;
    }
    if (keys[1] == "on") {
      context.strokeStyle = COLORS.PINK;
    }
    if (keys[1] == "disable") {
      context.strokeStyle = COLORS.DISABLE;
    }
    context.strokeRect(x, y, size, size);
  }

  resize(x: number, y: number, size: number) {
    this.x = x;
    this.y = y;
    this.size = size;
  }

  tap() {
    let keys = this.key.split(" ");
    if (keys[1] == "disable") {
      return;
    }
    switch (keys[0]) {
      case "sole":
      case "dual":
      case "mix":
        this.keyboard.layer = (this.keyboard.layer + 1) % 3;
        break;
      case "help":
      case "Crs":
      case "F2L":
        this.keyboard.cf = (this.keyboard.cf + 1) % 3;
        this.strip();
        break;
      case "backspace":
        if (this.keyboard.main.cuber.cube.history.last == undefined) {
          return;
        }
        this.keyboard.main.cuber.cube.twister.finish();
        if (this.keyboard.main.cuber.cube.history.last == undefined) {
          return;
        }
        this.keyboard.main.cuber.cube.twister.twist(this.keyboard.main.cuber.cube.history.last.value, true, 1, false);
        break;
      case "lock":
        this.keyboard.main.context.lock = !this.keyboard.main.context.lock;
        break;
      case "mirror":
        this.keyboard.main.context.mirror = !this.keyboard.main.context.mirror;
        break;
      case "hollow":
        this.keyboard.main.context.hollow = !this.keyboard.main.context.hollow;
        break;
      default:
        this.keyboard.main.cuber.cube.twister.twist(this.key);
        break;
    }
  }
}

export default class Keyboard implements Component {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public dirty: boolean;
  public scene: THREE.Scene;
  public camera: THREE.OrthographicCamera;
  public display: boolean = true;
  public disable: boolean = false;
  public main: Main;
  private canvas: HTMLCanvasElement;
  public context: CanvasRenderingContext2D;
  private texture: THREE.CanvasTexture;
  private buttons: KeyboardButton[];
  public layer: number = 0;
  public cf: number = 0;
  public images: { [idx: string]: HTMLImageElement };

  constructor(main: Main, x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.dirty = false;
    this.main = main;
    this.main.cuber.cube.callbacks.push(this.paint.bind(this));
    this.canvas = document.createElement("canvas");
    let context = this.canvas.getContext("2d");
    if (context == null) {
      throw new Error();
    }
    this.context = context;

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(this.width / -2, this.width / 2, this.height / 2, this.height / -2, -10, 10);
    this.camera.updateProjectionMatrix();
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.minFilter = this.texture.magFilter = THREE.LinearFilter;
    this.texture.needsUpdate = true;
    let geometry = new THREE.PlaneGeometry(this.width, this.height);
    let material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      opacity: 1
    });
    let mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
    this.buttons = [];
    let keys: string[][] = [
      ["sole", "dual", "mix"],
      ["mirror"],
      ["help", "Crs", "F2L"],
      ["hollow"],
      ["lock"],
      ["backspace"],
      ["L", "l", "M"],
      ["D", "d", "E"],
      ["B", "b", "S"],
      ["F", "f", "z"],
      ["U", "u", "y"],
      ["R", "r", "x"],
      ["L'", "l'", "M'"],
      ["D'", "d'", "E'"],
      ["B'", "b'", "S'"],
      ["F'", "f'", "z'"],
      ["U'", "u'", "y'"],
      ["R'", "r'", "x'"]
    ];
    for (let c = 0; c < 3; c++) {
      for (let r = 0; r < 6; r++) {
        let key = keys[r + c * 6];
        this.buttons.push(new KeyboardButton(0, 0, 0, key, this));
      }
    }
    this.images = {};
    this.load();
    this.resize();
  }

  load() {
    let image;

    image = new Image();
    image.src = svg_mirror_off;
    image.onload = function() {
      this.paint();
    }.bind(this);
    this.images["mirror"] = image;

    image = new Image();
    image.src = svg_mirror_on;
    image.onload = function() {
      this.paint();
    }.bind(this);
    this.images["mirror on"] = image;

    image = new Image();
    image.src = svg_lock_off;
    image.onload = function() {
      this.paint();
    }.bind(this);
    this.images["lock"] = image;

    image = new Image();
    image.src = svg_lock_on;
    image.onload = function() {
      this.paint();
    }.bind(this);
    this.images["lock on"] = image;

    image = new Image();
    image.src = svg_help;
    image.onload = function() {
      this.paint();
    }.bind(this);
    this.images["help"] = image;

    image = new Image();
    image.src = svg_hollow_off;
    image.onload = function() {
      this.paint();
    }.bind(this);
    this.images["hollow"] = image;

    image = new Image();
    image.src = svg_hollow_on;
    image.onload = function() {
      this.paint();
    }.bind(this);
    this.images["hollow on"] = image;

    image = new Image();
    image.src = svg_backspace_off;
    image.onload = function() {
      this.paint();
    }.bind(this);
    this.images["backspace disable"] = image;

    image = new Image();
    image.src = svg_backspace_on;
    image.onload = function() {
      this.paint();
    }.bind(this);
    this.images["backspace"] = image;
  }

  resize() {
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;

    let padding = Math.floor(this.canvas.width / 32);
    let size = Math.floor((this.canvas.width - padding * 2) / 6);
    let font = Math.floor(size * 0.5);

    this.context.font = font + "px Arial";
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";

    for (let c = 0; c < 3; c++) {
      for (let r = 0; r < 6; r++) {
        let x = padding + size * r;
        let y = size * c;
        this.buttons[r + c * 6].resize(x, y, size);
      }
    }
    this.paint();
  }

  paint() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.restore();
    this.context.fillStyle = COLORS.BACKGROUND;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.fillStyle = "#000000";
    this.context.strokeStyle = "#000000";
    for (let button of this.buttons) {
      button.paint();
    }

    this.context.save();

    this.dirty = true;
    this.texture.needsUpdate = true;
  }

  touch = (action: TouchAction) => {
    switch (action.type) {
      case "touchstart":
      case "mousedown":
        let x = action.x;
        let y = action.y;
        let padding = Math.floor(this.width / 32);
        let size = Math.floor((this.width - padding * 2) / 6);
        x -= padding;
        let r = Math.floor(x / size);
        let c = Math.floor(y / size);
        if (r < 0 || c < 0 || r > 5 || c > 2) {
          return false;
        }
        this.buttons[r + c * 6].tap();
        break;
      case "touchmove":
      case "mousemove":
        break;
      case "touchend":
      case "touchcancel":
      case "mouseup":
      case "mouseout":
        break;
      default:
        return false;
    }
    this.paint();
    this.dirty = true;
    return true;
  };
}
