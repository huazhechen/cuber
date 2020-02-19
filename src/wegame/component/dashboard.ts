import { Component } from "./component";
import * as THREE from "three";
import Main from "../main";
import { COLORS, TouchAction } from "../../common/define";

class ExitButton {
  public x: number;
  public y: number;
  public size: number;
  paint(context: CanvasRenderingContext2D) {
    let size = this.size * window.devicePixelRatio;
    let x = this.x * window.devicePixelRatio;
    let y = this.y * window.devicePixelRatio;

    let padding = size / 6;
    x = x + padding;
    y = y + padding;
    size = size - 2 * padding;
    context.strokeStyle = COLORS.PINK;
    context.lineWidth = size / 8;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + size, y + size);
    context.moveTo(x + size, y);
    context.lineTo(x, y + size);
    context.stroke();
  }
}

class ScoreBoard {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  private dashboard: Dashboard;
  constructor(dashboard: Dashboard) {
    this.dashboard = dashboard;
  }

  paint(context: CanvasRenderingContext2D) {
    let x = this.x * window.devicePixelRatio;
    let y = this.y * window.devicePixelRatio;
    let height = this.height * window.devicePixelRatio;

    context.strokeStyle = COLORS.GRAY;
    context.fillStyle = COLORS.GRAY;
    context.font = height * 0.8 + "px Arial";
    context.textBaseline = "middle";
    context.textAlign = "left";
    let diff = this.dashboard.main.database.now - this.dashboard.main.database.start;
    let minute = Math.floor(diff / 1000 / 60);
    diff = diff % (1000 * 60);
    let second = Math.floor(diff / 1000);
    diff = diff % 1000;
    let ms = Math.floor(diff / 100);
    let time = (minute > 0 ? minute + ":" : "") + (Array(2).join("0") + second).slice(-2) + "." + ms;
    context.fillText(time + "/" + this.dashboard.main.cuber.cube.history.length, x, y + height / 2);
  }
}

export default class Dashboard implements Component {
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
  private exit: ExitButton;
  private score: ScoreBoard;
  constructor(main: Main, x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.dirty = false;
    this.main = main;
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

    this.exit = new ExitButton();
    this.score = new ScoreBoard(this);

    this.resize();
    this.loop();
  }

  touch = (action: TouchAction) => {
    switch (action.type) {
      case "touchstart":
      case "mousedown":
        let x = action.x - this.exit.x;
        let y = action.y - this.exit.y;
        if (x > 0 && x < this.exit.size && y > 0 && y < this.exit.size) {
          this.main.database.mode = "starter";
          this.paint();
          this.dirty = true;
          return true;
        }
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
    return false;
  };

  resize() {
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;

    let size = this.height / 3;
    this.exit.x = size / 2;
    this.exit.y = size / 2;
    this.exit.size = size;

    this.score.x = size / 2;
    this.score.y = 2 * size;
    this.score.width = this.width - size;
    this.score.height = size;

    this.paint();
  }

  loop() {
    requestAnimationFrame(this.loop.bind(this));
    this.paint();
  }

  paint() {
    if (!this.display) {
      return;
    }
    if (this.main.cuber.cube.history.moves == 0) {
      this.main.database.start = 0;
      this.main.database.now = 0;
    } else {
      if (this.main.database.start == 0) {
        this.main.database.start = new Date().getTime();
      }
      if (!this.main.cuber.cube.complete) {
        this.main.database.now = new Date().getTime();
      }
    }
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.restore();

    this.exit.paint(this.context);
    this.score.paint(this.context);

    this.context.save();

    this.dirty = true;
    this.texture.needsUpdate = true;
  }
}
