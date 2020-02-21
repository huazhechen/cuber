import { Component } from "./component";
import * as THREE from "three";
import { RoundButton } from "./button";
import Database from "../database";
import { COLORS } from "../../cuber/define";
import { TouchAction } from "../../common/toucher";

export default class Retry implements Component {
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
  private buttons: RoundButton[];
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
    this.buttons.push(
      new RoundButton(
        "再次挑战",
        () => {
          this.database.mode = "cuber";
        },
        COLORS.RED,
        COLORS.WHITE
      )
    );
    this.buttons.push(
      new RoundButton("记录", () => {
        this.database.mode = "score";
      })
    );
    this.buttons.push(
      new RoundButton("设置", () => {
        this.database.mode = "setting";
      })
    );

    this.resize();
  }

  touch = (action: TouchAction) => {
    switch (action.type) {
      case "touchstart":
      case "mousedown":
        for (const button of this.buttons) {
          if (action.x > button.x && action.x < button.x + button.width && action.y > button.y && action.y < button.y + button.height) {
            button.tap();
            return true;
          }
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

    let size = Math.min(this.width / 8, this.height / 12);
    let height = size * 1.5 + size * 0.8 * 1.5 * this.buttons.length;
    let x = (this.width - size * 4) / 2;
    let y = Math.min(this.height - height, this.height * 0.6);

    let button = this.buttons[0];
    button.x = x;
    button.y = y;
    button.width = size * 4;
    button.height = size;
    y = y + size;
    y = y + 0.5 * size;
    size = size * 0.8;
    x = (this.width - size * 3) / 2;

    for (let i = 1; i < this.buttons.length; i++) {
      button = this.buttons[i];
      button.x = x;
      button.y = y;
      button.width = size * 3;
      button.height = size;
      y = y + size;
      y = y + 0.5 * size;
    }

    this.paint();
  }

  paint() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.restore();
    this.context.fillStyle = COLORS.BLACK;
    this.context.globalAlpha = 0.8;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.globalAlpha = 1;

    let diff = this.database.time;
    let second = Math.floor(diff / 1000);
    diff = diff % 1000;
    let ms = Math.floor(diff / 100);
    let time = (Array(2).join("0") + second).slice(-2) + "." + ms;

    let font = Math.min(this.canvas.width / 8, this.canvas.height / 12);
    this.context.font = font + "px Arial";
    this.context.fillStyle = COLORS.PINK;
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    this.context.fillText(time + "秒", this.canvas.width / 2, this.canvas.height / 3);
    this.context.fillText(this.database.step + "步", this.canvas.width / 2, this.canvas.height / 3 + font * 1.2);

    for (const button of this.buttons) {
      button.paint(this.context);
    }

    this.context.save();

    this.dirty = true;
    this.texture.needsUpdate = true;
  }
}
