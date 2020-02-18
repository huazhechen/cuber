import * as THREE from "three";
import { Component } from "./component";
import Main from "../main";
import { COLORS, TouchAction } from "../../common/define";

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

  get key() {
    let key = this.keys[0];
    if (this.keys.length == 4) {
      key = this.keys[this.keyboard.layer];
      if (this.keyboard.main.context.lock) {
        key = key + " disable";
      }
      return key;
    }

    switch (key) {
      case "sole":
        if (this.keyboard.layer == 0) {
          key = key + " on";
        }
        break;
      case "dual":
        if (this.keyboard.layer == 1) {
          key = key + " on";
        }
        break;
      case "middle":
        if (this.keyboard.layer == 2) {
          key = key + " on";
        }
        break;
      case "entire":
        if (this.keyboard.layer == 3) {
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
    }
    return key;
  }
  paint() {
    let context = this.keyboard.context;
    context.fillStyle = "#000000";
    context.strokeStyle = "#000000";
    let font = Math.round(this.size * 0.5);
    context.font = font + "px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";

    let dx = this.size / 24;
    let dy = this.size / 30;
    let line = this.size / 24 < 2 ? 2 : this.size / 24;
    context.lineWidth = line;

    let keys = this.key.split(" ");
    if (keys[1] == "on") {
      context.fillStyle = COLORS.CYAN;
      context.strokeStyle = COLORS.CYAN;
    }
    if (keys[1] == "disable") {
      context.fillStyle = COLORS.DISABLE;
      context.strokeStyle = COLORS.DISABLE;
    }
    context.strokeRect(this.x, this.y, this.size, this.size);
    switch (keys[0]) {
      case "sole":
        context.fillRect(this.x + 4 * dx, this.y + 6 * dy + 0 * (7 * dy), 16 * dx, 4 * dy);
        context.fillStyle = COLORS.DISABLE;
        context.strokeStyle = COLORS.DISABLE;
        context.fillRect(this.x + 4 * dx, this.y + 6 * dy + 1 * (7 * dy), 16 * dx, 4 * dy);
        context.fillRect(this.x + 4 * dx, this.y + 6 * dy + 2 * (7 * dy), 16 * dx, 4 * dy);
        break;
      case "dual":
        context.fillRect(this.x + 4 * dx, this.y + 6 * dy + 0 * (7 * dy), 16 * dx, 4 * dy);
        context.fillRect(this.x + 4 * dx, this.y + 6 * dy + 1 * (7 * dy), 16 * dx, 4 * dy);
        context.fillStyle = COLORS.DISABLE;
        context.strokeStyle = COLORS.DISABLE;
        context.fillRect(this.x + 4 * dx, this.y + 6 * dy + 2 * (7 * dy), 16 * dx, 4 * dy);
        break;
      case "middle":
        context.fillRect(this.x + 4 * dx, this.y + 6 * dy + 1 * (7 * dy), 16 * dx, 4 * dy);
        context.fillStyle = COLORS.DISABLE;
        context.strokeStyle = COLORS.DISABLE;
        context.fillRect(this.x + 4 * dx, this.y + 6 * dy + 0 * (7 * dy), 16 * dx, 4 * dy);
        context.fillRect(this.x + 4 * dx, this.y + 6 * dy + 2 * (7 * dy), 16 * dx, 4 * dy);
        break;
      case "entire":
        context.fillRect(this.x + 4 * dx, this.y + 6 * dy + 0 * (7 * dy), 16 * dx, 4 * dy);
        context.fillRect(this.x + 4 * dx, this.y + 6 * dy + 1 * (7 * dy), 16 * dx, 4 * dy);
        context.fillRect(this.x + 4 * dx, this.y + 6 * dy + 2 * (7 * dy), 16 * dx, 4 * dy);
        break;
      case "backspace":
        context.beginPath();
        context.moveTo(this.x + 6 * dx, this.y + 6 * dy);
        context.lineTo(this.x + 20 * dx, this.y + 6 * dy);
        context.lineTo(this.x + 20 * dx, this.y + 24 * dy);
        context.lineTo(this.x + 6 * dx, this.y + 24 * dy);
        context.lineTo(this.x + 2 * dx, this.y + 15 * dy);
        context.closePath();
        context.fill();
        context.fillStyle = "#ffffff";
        context.strokeStyle = "#ffffff";
        context.lineWidth = this.size / 16;
        context.beginPath();
        context.moveTo(this.x + 9 * dx, this.y + 15 * dy - 3 * dx);
        context.lineTo(this.x + 15 * dx, this.y + 15 * dy + 3 * dx);
        context.moveTo(this.x + 15 * dx, this.y + 15 * dy - 3 * dx);
        context.lineTo(this.x + 9 * dx, this.y + 15 * dy + 3 * dx);
        context.stroke();
        context.fillStyle = "#000000";
        context.strokeStyle = "#000000";
        context.lineWidth = line;
        break;
      case "lock":
        context.beginPath();
        context.lineWidth = this.size / 16;
        context.moveTo(this.x + this.size / 2 + 3 * dx, this.y + 13 * dy);
        context.lineTo(this.x + this.size / 2 + 3 * dx, this.y + 11 * dy);
        context.arc(this.x + this.size / 2, this.y + 11 * dy, 3 * dx, 0, -Math.PI, true);
        if (keys[1] == "on") {
          context.lineTo(this.x + this.size / 2 - 3 * dx, this.y + 13 * dy);
        }
        context.stroke();
        context.lineWidth = line;
        context.fillRect(this.x + 7 * dx, this.y + 13 * dy, 10 * dx, 11 * dy);
        context.fillStyle = "#ffffff";
        context.beginPath();
        context.arc(this.x + +12 * dx, this.y + 18 * dy, line, 0, 2 * Math.PI);
        context.fill();
        break;
      default:
        context.fillText(keys[0], this.x + this.size / 2, this.y + this.size / 2 + line);
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
      case "sole":
        this.keyboard.layer = 0;
        break;
      case "dual":
        this.keyboard.layer = 1;
        break;
      case "middle":
        this.keyboard.layer = 2;
        break;
      case "entire":
        this.keyboard.layer = 3;
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
  public layer: number;
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
      ["L", "l", "M", "x"],
      ["D", "d", "E", "y"],
      ["B", "b", "S", "z"],
      ["F", "f", "S", "z"],
      ["U", "u", "E", "y"],
      ["R", "r", "M", "x"],
      ["L'", "l'", "M'", "x'"],
      ["D'", "d'", "E'", "y'"],
      ["B'", "b'", "S'", "z'"],
      ["F'", "f'", "S'", "z'"],
      ["U'", "u'", "E'", "y'"],
      ["R'", "r'", "M'", "x'"],
      ["sole"],
      ["dual"],
      ["middle"],
      ["entire"],
      ["lock"],
      ["backspace"]
    ];
    for (let c = 0; c < 3; c++) {
      for (let r = 0; r < 6; r++) {
        let key = keys[r + c * 6];
        this.buttons.push(new KeyboardButton(0, 0, 0, key, this));
      }
    }
    this.layer = 0;

    this.resize();
  }

  resize() {
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;

    let space = this.canvas.width / 4;
    let size = (this.canvas.width - space) / 6;
    let font = Math.floor(size * 0.5);
    space = space / 8;

    this.context.font = font + "px Arial";
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";

    for (let c = 0; c < 3; c++) {
      for (let r = 0; r < 6; r++) {
        let x = space * 1.5 + (space + size) * r;
        let y = space / 2 + (space + size) * c;
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

        let space = Math.floor(this.width / 32);
        let size = Math.floor((this.width - space * 8) / 6);
        let pandding = Math.floor(space * 1.5);

        x -= pandding;
        let r = Math.floor(x / (space + size));
        y -= pandding;
        let c = Math.floor(y / (space + size));
        if (r < 0 || c < 0 || r > 5 || c > 2) {
          return false;
        }
        if (r * (space + size) + size < x) {
          return false;
        }
        if (c * (space + size) + size < y) {
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
