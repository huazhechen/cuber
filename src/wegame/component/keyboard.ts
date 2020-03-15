import Main from "../main";
import { Component } from "./component";
import { TouchAction } from "../../common/toucher";
import { Scene, OrthographicCamera, CanvasTexture, Vector3, LinearFilter, PlaneGeometry, MeshBasicMaterial, Mesh } from "three";
import { COLORS } from "../../common/color";

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
    if (key == "cfop0") {
      key = this.keys[this.keyboard.cf];
    } else if (this.keys.length == 3) {
      key = this.keys[this.keyboard.layer];
    }
    switch (key) {
      case "layer1":
      case "layer2":
      case "layer3":
      case "cfop1":
      case "cfop2":
        key = key + " on";
        break;
      case "mirror":
        if (this.keyboard.main.cuber.preferance.mirror) {
          key = key + " on";
        }
        break;
      case "hollow":
        if (this.keyboard.main.cuber.preferance.hollow) {
          key = key + " on";
        }
        break;
      case "lock":
        if (this.keyboard.main.cuber.preferance.lock) {
          key = key + " on";
        }
        break;
      case "backspace":
        if (this.keyboard.main.cuber.cube.history.length == 0 || this.keyboard.main.cuber.preferance.lock) {
          key = key + " disable";
        }
        break;
      case "colorize":
        break;
      default:
        if (this.keyboard.main.cuber.preferance.lock) {
          key = key + " disable";
        }
        break;
    }
    return key;
  }

  paint() {
    let context = this.keyboard.context;
    context.fillStyle = COLORS.black;
    context.strokeStyle = COLORS.black;

    let padding = this.size / 16;
    let size = this.size - 2 * padding;
    let x = this.x + padding;
    let y = this.y + padding;
    let line = padding / 2;
    line = line < 2 ? 2 : line;
    context.lineWidth = line;

    let keys = this.key.split(" ");
    if (keys[1] == "on") {
      context.fillStyle = COLORS.red;
      context.strokeStyle = COLORS.red;
    }
    if (keys[1] == "disable") {
      context.fillStyle = COLORS.gray;
      context.strokeStyle = COLORS.gray;
    }
    context.strokeRect(x, y, size, size);
    size = size - 4 * padding;
    x = x + 2 * padding;
    y = y + 2 * padding;
    let d = size / 48;
    let font = Math.round(size * 0.6);
    context.font = font + "px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";

    switch (keys[0]) {
      case "layer1":
        context.fillRect(x + 5 * d, y + 6 * d, 38 * d, 8 * d);
        context.fillStyle = COLORS.black;
        context.fillRect(x + 5 * d, y + 20 * d, 38 * d, 8 * d);
        context.fillRect(x + 5 * d, y + 34 * d, 38 * d, 8 * d);
        break;
      case "layer2":
        context.fillRect(x + 5 * d, y + 6 * d, 38 * d, 8 * d);
        context.fillRect(x + 5 * d, y + 20 * d, 38 * d, 8 * d);
        context.fillStyle = COLORS.black;
        context.fillRect(x + 5 * d, y + 34 * d, 38 * d, 8 * d);
        break;
      case "layer3":
        context.fillRect(x + 10 * d, y + 6 * d, 28 * d, 8 * d);
        context.fillRect(x + 5 * d, y + 20 * d, 38 * d, 8 * d);
        context.fillRect(x + 10 * d, y + 34 * d, 28 * d, 8 * d);
        break;
      case "cfop0":
        context.fillStyle = COLORS.black;
        context.fillRect(x + 6 * d, y + 6 * d, 12 * d, 12 * d);
        context.fillRect(x + 6 * d, y + 30 * d, 12 * d, 12 * d);
        context.fillRect(x + 30 * d, y + 6 * d, 12 * d, 12 * d);
        context.fillRect(x + 30 * d, y + 30 * d, 12 * d, 12 * d);
        context.fillRect(x + 18 * d, y + 18 * d, 12 * d, 12 * d);
        break;
      case "cfop1":
        context.fillRect(x + 6 * d, y + 18 * d, 12 * d, 12 * d);
        context.fillRect(x + 18 * d, y + 6 * d, 12 * d, 12 * d);
        context.fillRect(x + 18 * d, y + 18 * d, 12 * d, 12 * d);
        context.fillRect(x + 18 * d, y + 30 * d, 12 * d, 12 * d);
        context.fillRect(x + 30 * d, y + 18 * d, 12 * d, 12 * d);
        break;
      case "cfop2":
        context.fillRect(x + 6 * d, y + 6 * d, 12 * d, 12 * d);
        context.fillRect(x + 6 * d, y + 30 * d, 12 * d, 12 * d);
        context.fillRect(x + 30 * d, y + 6 * d, 12 * d, 12 * d);
        context.fillRect(x + 30 * d, y + 30 * d, 12 * d, 12 * d);
        break;
      case "mirror":
        context.fillRect(x + 4 * d, y + 12 * d, 4 * d, 24 * d);
        context.fillRect(x + 40 * d, y + 12 * d, 4 * d, 24 * d);
        context.fillRect(x + 12 * d, y + 4 * d, 24 * d, 4 * d);
        context.fillRect(x + 12 * d, y + 40 * d, 24 * d, 4 * d);
        context.fillStyle = COLORS.black;
        context.fillRect(x + 12 * d, y + 12 * d, 24 * d, 24 * d);
        break;
      case "hollow":
        context.fillRect(x + 12 * d, y + 12 * d, 24 * d, 24 * d);
        context.fillStyle = COLORS.black;
        context.beginPath();
        context.moveTo(x + 4 * d, y + 4 * d);
        context.lineTo(x + 44 * d, y + 4 * d);
        context.lineTo(x + 44 * d, y + 44 * d);
        context.lineTo(x + 4 * d, y + 44 * d);
        context.moveTo(x + 8 * d, y + 8 * d);
        context.lineTo(x + 8 * d, y + 40 * d);
        context.lineTo(x + 40 * d, y + 40 * d);
        context.lineTo(x + 40 * d, y + 8 * d);
        context.closePath();
        context.fill();
        break;
      case "lock":
        context.beginPath();
        context.moveTo(x + 14 * d, y + 18 * d);
        context.lineTo(x + 14 * d, y + 15 * d);
        context.arc(x + 24 * d, y + 15 * d, 10 * d, -Math.PI, 0, false);
        context.lineTo(x + 34 * d, y + 18 * d);
        context.lineTo(x + 39 * d, y + 18 * d);
        context.lineTo(x + 39 * d, y + 43 * d);
        context.lineTo(x + 9 * d, y + 43 * d);
        context.lineTo(x + 9 * d, y + 18 * d);
        context.lineTo(x + 14 * d, y + 18 * d);

        context.moveTo(x + 18 * d, y + 18 * d);
        context.lineTo(x + 30 * d, y + 18 * d);
        context.lineTo(x + 30 * d, y + 15 * d);
        context.arc(x + 24 * d, y + 15 * d, 6 * d, 0, -Math.PI, true);
        context.lineTo(x + 18 * d, y + 18 * d);

        context.arc(x + 24 * d, y + 30 * d, 3 * d, 0, 2 * Math.PI, true);
        context.fill();
        break;
      case "backspace":
        context.beginPath();
        context.moveTo(x + 46 * d, y + 6 * d);
        context.lineTo(x + 14 * d, y + 6 * d);
        context.lineTo(x + 2 * d, y + 24 * d);
        context.lineTo(x + 14 * d, y + 42 * d);
        context.lineTo(x + 46 * d, y + 42 * d);
        context.lineTo(x + 46 * d, y + 6 * d);

        context.moveTo(x + 38 * d, y + 31.17 * d);
        context.lineTo(x + 35.17 * d, y + 34 * d);
        context.lineTo(x + 28 * d, y + 26 * d);
        context.lineTo(x + 28 * d, y + 26.83 * d);
        context.lineTo(x + 20.83 * d, y + 34 * d);
        context.lineTo(x + 18 * d, y + 31.17 * d);
        context.lineTo(x + 25.17 * d, y + 24 * d);
        context.lineTo(x + 18 * d, y + 16.83 * d);
        context.lineTo(x + 20.83 * d, y + 14 * d);
        context.lineTo(x + 28 * d, y + 21.17 * d);
        context.lineTo(x + 35.17 * d, y + 14 * d);
        context.lineTo(x + 38 * d, y + 16.83 * d);
        context.lineTo(x + 30.83 * d, y + 24 * d);
        context.lineTo(x + 38 * d, y + 31.17 * d);
        context.closePath();
        context.fill();
        break;
      default:
        context.fillText(keys[0], x + size / 2, y + size / 2 + line);
        break;
    }
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
      case "layer1":
      case "layer2":
      case "layer3":
        this.keyboard.layer = (this.keyboard.layer + 1) % 3;
        break;
      case "cfop0":
      case "cfop1":
      case "cfop2":
        this.keyboard.cf = (this.keyboard.cf + 1) % 3;
        this.strip();
        break;
      case "backspace":
        this.keyboard.main.cuber.cube.undo();
        break;
      case "lock":
        this.keyboard.main.cuber.preferance.lock = !this.keyboard.main.cuber.preferance.lock;
        break;
      case "mirror":
        this.keyboard.main.cuber.preferance.mirror = !this.keyboard.main.cuber.preferance.mirror;
        break;
      case "hollow":
        this.keyboard.main.cuber.preferance.hollow = !this.keyboard.main.cuber.preferance.hollow;
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
  public scene: Scene;
  public camera: OrthographicCamera;
  public display: boolean = true;
  public disable: boolean = false;
  public main: Main;
  private canvas: HTMLCanvasElement;
  public context: CanvasRenderingContext2D;
  private texture: CanvasTexture;
  private buttons: KeyboardButton[];
  public layer: number = 0;
  public cf: number = 0;

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

    this.scene = new Scene();
    this.camera = new OrthographicCamera(this.width / -2, this.width / 2, this.height / 2, this.height / -2, -10, 10);
    this.camera.updateProjectionMatrix();
    this.camera.lookAt(new Vector3(0, 0, 0));

    this.texture = new CanvasTexture(this.canvas);
    this.texture.minFilter = this.texture.magFilter = LinearFilter;
    this.texture.needsUpdate = true;
    let geometry = new PlaneGeometry(this.width, this.height);
    let material = new MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      opacity: 1
    });
    let mesh = new Mesh(geometry, material);
    this.scene.add(mesh);
    this.buttons = [];
    let keys: string[][] = [
      ["layer1", "layer2", "layer3"],
      ["cfop0", "cfop1", "cfop2"],
      ["mirror"],
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
    this.resize();
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
    this.context.fillStyle = COLORS.white;
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
