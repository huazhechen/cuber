import { Component } from "./component";
import * as THREE from "three";
import Database from "../database";
import { Button, RoundButton } from "./button";
import { COLORS, TouchAction } from "../../common/define";

class CatagoryButton implements Button {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  private score: Score;

  constructor(score: Score) {
    this.score = score;
  }

  paint(context: CanvasRenderingContext2D) {
    let x = this.x * window.devicePixelRatio;
    let y = this.y * window.devicePixelRatio;
    let width = this.width * window.devicePixelRatio;
    let height = this.height * window.devicePixelRatio;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = height / 2 + "px Arial";

    let size = height;
    let w = (width - size) / 2;

    context.fillStyle = COLORS.BLUE;
    context.fillRect(x, y, w, height);

    context.fillStyle = COLORS.WHITE;
    context.fillText("时间", x + w / 2, y + height / 2);

    context.fillStyle = COLORS.GREEN;
    context.fillRect(x + size + w, y, w, height);

    context.fillStyle = COLORS.WHITE;
    context.fillText("步数", x + size + w + w / 2, y + height / 2);
    return;
  }

  tap(x: number, y: number) {
    let size = this.width / 2;
    if (x > 0 && x < size) {
      this.score.mode = "time";
    }
    if (x > size && x < size + size) {
      this.score.mode = "step";
    }
  }

  touch() {}
}

class ScoreButton implements Button {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  private score: Score;
  private index: number;

  constructor(score: Score, index: number) {
    this.score = score;
    this.index = index;
  }

  paint(context: CanvasRenderingContext2D) {
    let x = this.x * window.devicePixelRatio;
    let y = this.y * window.devicePixelRatio;
    let width = this.width * window.devicePixelRatio;
    let height = this.height * window.devicePixelRatio;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = height / 2 + "px Arial";

    let size = height;
    let w = (width - size) / 2;

    context.fillStyle = COLORS.CYAN;
    context.fillRect(x, y, w, height);

    context.fillStyle = COLORS.BLACK;
    if (this.score.database.times[this.index] == this.score.database.time) {
      context.fillStyle = COLORS.PINK;
    }
    let time = this.score.database.times[this.index] ? String((this.score.database.times[this.index] / 1000).toFixed(1)) : "";
    context.fillText(time, x + w / 2, y + height / 2);

    context.fillStyle = COLORS.WHITE;
    context.fillRect(x + w, y, size, height);

    context.fillStyle = COLORS.BLACK;
    context.fillText(String(this.index + 1), x + w + size / 2, y + height / 2);

    context.fillStyle = COLORS.LIME;
    context.fillRect(x + size + w, y, w, height);

    context.fillStyle = COLORS.BLACK;
    if (this.score.database.steps[this.index] == this.score.database.step) {
      context.fillStyle = COLORS.PINK;
    }
    let step = this.score.database.steps[this.index] ? String(this.score.database.steps[this.index] || 0) : "";
    context.fillText(step, x + size + w + w / 2, y + height / 2);

    return;
  }

  tap(x: number, y: number) {
    let size = this.width / 2;
    if (x > 0 && x < size) {
      this.score.mode = "time";
    }
    if (x > size && x < size + size) {
      this.score.mode = "step";
    }
  }
  touch() {}
}

class LastButton implements Button {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  private score: Score;

  constructor(score: Score) {
    this.score = score;
  }

  paint(context: CanvasRenderingContext2D) {
    let x = this.x * window.devicePixelRatio;
    let y = this.y * window.devicePixelRatio;
    let width = this.width * window.devicePixelRatio;
    let height = this.height * window.devicePixelRatio;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = height / 2 + "px Arial";

    let size = height;
    let w = (width - size) / 2;

    context.fillStyle = COLORS.WHITE;
    context.fillRect(x, y, w, height);

    context.fillStyle = COLORS.BLACK;
    let time = this.score.database.time ? String((this.score.database.time / 1000).toFixed(1)) : "";
    context.fillText(time, x + w / 2, y + height / 2);

    context.fillStyle = COLORS.WHITE;
    context.fillRect(x + w, y, size, height);

    context.fillStyle = COLORS.WHITE;
    context.fillRect(x + size + w, y, w, height);

    context.fillStyle = COLORS.BLACK;
    let step = this.score.database.step ? String(this.score.database.step || 0) : "";
    context.fillText(step, x + size + w + w / 2, y + height / 2);
    return;
  }

  tap(x: number, y: number) {
    let size = this.width / 2;
    if (x > 0 && x < size) {
      this.score.mode = "time";
    }
    if (x > size && x < size + size) {
      this.score.mode = "step";
    }
  }
  touch() {}
}

export default class Score implements Component {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public dirty: boolean;
  public scene: THREE.Scene;
  public camera: THREE.OrthographicCamera;
  public display: boolean = true;
  public disable: boolean = false;
  public database: Database;
  private canvas: HTMLCanvasElement;
  public context: CanvasRenderingContext2D;
  private texture: THREE.CanvasTexture;
  private buttons: Button[];
  private ok: Button;
  public mode: string;
  constructor(database: Database, x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.dirty = false;
    this.database = database;
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
    this.buttons.push(new CatagoryButton(this));
    for (let i = 0; i < 10; i++) {
      this.buttons.push(new ScoreButton(this, i));
    }
    this.buttons.push(new LastButton(this));
    this.ok = new RoundButton("返回", () => {
      this.database.mode = "starter";
    });

    this.resize();
  }

  touch = (action: TouchAction) => {
    switch (action.type) {
      case "touchstart":
      case "mousedown":
        if (action.x > this.ok.x && action.x < this.ok.x + this.ok.width && action.y > this.ok.y && action.y < this.ok.y + this.ok.height) {
          this.ok.tap(action.x - this.ok.x, action.y - this.ok.y);
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
        break;
    }
    this.paint();
    return true;
  };

  resize() {
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;

    let size = Math.min(this.width / 10, (this.height * 0.8) / 14);
    let width = Math.min(this.width - size, size * 8);
    let height = 14 * size;

    let top = (this.height - height) / 2;

    let x = (this.width - width) / 2;
    let y = top;

    for (const button of this.buttons) {
      button.x = x;
      button.y = y;
      button.width = width;
      button.height = size;
      y = y + size + size / 16;
    }

    width = 4 * size;
    x = (this.width - width) / 2;
    y = y + size + size / 16;
    this.ok.x = x;
    this.ok.y = y;
    this.ok.width = width;
    this.ok.height = size;

    this.paint();
  }

  paint() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.restore();
    this.context.fillStyle = COLORS.BLACK;
    this.context.globalAlpha = 0.8;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (const button of this.buttons) {
      button.paint(this.context);
    }
    this.context.globalAlpha = 1;
    this.ok.paint(this.context);

    this.context.globalAlpha = 1;
    this.context.save();

    this.texture.needsUpdate = true;
    this.dirty = true;
  }
}
