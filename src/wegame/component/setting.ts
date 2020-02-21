import { Component } from "./component";
import * as THREE from "three";
import { Button } from "./button";
import Main from "../main";
import { COLORS } from "../../cuber/define";
import { TouchAction } from "../../common/toucher";

class ConfirmButton implements Button {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  private main: Main;

  constructor(main: Main) {
    this.main = main;
  }

  paint(context: CanvasRenderingContext2D) {
    let x = this.x * window.devicePixelRatio;
    let y = this.y * window.devicePixelRatio;
    let width = this.width * window.devicePixelRatio;
    let height = this.height * window.devicePixelRatio;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = height / 2 + "px Arial";

    let padding = height;
    let size = (width - 3 * padding) / 2;

    context.fillStyle = COLORS.GREEN;
    context.fillRect(x + padding, y, size, height);

    context.fillStyle = COLORS.WHITE;
    context.fillText("确认", x + padding + size / 2, y + height / 2);

    context.fillStyle = COLORS.PINK;
    context.fillRect(x + padding + size + padding, y, size, height);

    context.fillStyle = COLORS.WHITE;
    context.fillText("重置", x + padding + size + padding + size / 2, y + height / 2);
    return;
  }

  tap(x: number, y: number) {
    let padding = this.height;
    let size = (this.width - 3 * padding) / 2;
    if (x > padding && x < padding + size) {
      this.main.database.mode = "starter";
    }
    if (x > padding + size + padding && x < padding + size + padding + size) {
      this.main.cuber.preferance.reset();
    }
  }

  touch(x: number, y: number) {}
}

class Slider implements Button {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  private callback: Function;
  private key: string;
  private getter: Function;

  constructor(getter: Function, callback: Function, key: string) {
    this.getter = getter;
    this.callback = callback;
    this.key = key;
  }
  get value() {
    return this.getter();
  }

  paint(context: CanvasRenderingContext2D) {
    let x = this.x * window.devicePixelRatio;
    let y = this.y * window.devicePixelRatio;
    let width = this.width * window.devicePixelRatio;
    let height = this.height * window.devicePixelRatio;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = height / 2 + "px Arial";

    let split = (this.value / 100) * width;
    let str = this.key;
    context.fillStyle = COLORS.PINK;
    context.fillRect(x, y, split, height);
    context.fillStyle = COLORS.GRAY;
    context.fillRect(x + split, y, width - split, height);

    context.fillStyle = COLORS.WHITE;
    context.fillText(str, x + width / 2, y + height / 2);
    return;
  }

  tap(x: number, y: number) {
    this.callback((x / this.width) * 100);
  }

  touch(x: number, y: number) {
    this.callback((x / this.width) * 100);
  }
}

export default class Setting implements Component {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public dirty: boolean;
  public scene: THREE.Scene;
  public camera: THREE.OrthographicCamera;
  public display: boolean = true;
  public disable: boolean = false;
  private canvas: HTMLCanvasElement;
  public context: CanvasRenderingContext2D;
  private texture: THREE.CanvasTexture;
  private buttons: Button[];
  private down: Button | null = null;
  public main: Main;
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

    this.buttons = [];
    let button;

    button = new Slider(
      () => {
        return this.main.cuber.preferance.scale;
      },
      (value: number) => {
        this.main.cuber.preferance.scale = value;
      },
      "缩放"
    );
    this.buttons.push(button);

    button = new Slider(
      () => {
        return this.main.cuber.preferance.perspective;
      },
      (value: number) => {
        this.main.cuber.preferance.perspective = value;
      },
      "透视"
    );
    this.buttons.push(button);

    button = new Slider(
      () => {
        return this.main.cuber.preferance.angle;
      },
      (value: number) => {
        this.main.cuber.preferance.angle = value;
      },
      "左右"
    );
    this.buttons.push(button);

    button = new Slider(
      () => {
        return this.main.cuber.preferance.gradient;
      },
      (value: number) => {
        this.main.cuber.preferance.gradient = value;
      },
      "上下"
    );
    this.buttons.push(button);

    button = new Slider(
      () => {
        return this.main.cuber.preferance.brightness;
      },
      (value: number) => {
        this.main.cuber.preferance.brightness = value;
      },
      "亮度"
    );
    this.buttons.push(button);

    this.buttons.push(new ConfirmButton(this.main));

    this.resize();
  }

  touch = (action: TouchAction) => {
    switch (action.type) {
      case "touchstart":
      case "mousedown":
        this.buttons.some((button: Button) => {
          if (action.x > button.x && action.x < button.x + button.width && action.y > button.y && action.y < button.y + button.height) {
            button.tap(action.x - button.x, action.y - button.y);
            this.down = button;
            return true;
          }
          return false;
        });
        break;
      case "touchmove":
      case "mousemove":
        if (this.down != null) {
          let button = this.down;
          let x = action.x - button.x;
          let y = action.y - button.y;
          if (x < 0) {
            x = 0;
          }
          if (x > button.width) {
            x = button.width;
          }
          button.touch(x, y);
        }
        break;
      case "touchend":
      case "touchcancel":
      case "mouseup":
      case "mouseout":
        this.down = null;
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

    let size = Math.min(this.width / 10, (this.height * 0.6) / (1.5 * this.buttons.length + 1));
    let width = Math.min(this.width - size, size * 9);
    let height = 1.2 * this.buttons.length * size;

    let top = this.height - height;

    let x = (this.width - width) / 2;
    let y = top;

    for (const button of this.buttons) {
      button.x = x;
      button.y = y;
      button.width = width;
      button.height = size;
      y = y + 1.2 * size;
    }
    this.paint();
  }

  paint() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.restore();

    this.context.globalAlpha = 0.6;
    if (this.down instanceof Slider){
      this.context.globalAlpha = 0;
    }
    this.context.fillStyle = COLORS.BLACK;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    let font = Math.min(this.canvas.width / 8, this.canvas.height / 12);
    this.context.font = font + "px Arial";
    this.context.fillStyle = COLORS.WHITE;
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    this.context.fillText("设置", this.canvas.width / 2, this.canvas.height / 6);
    this.context.globalAlpha = 1;

    for (const button of this.buttons) {
      button.paint(this.context);
    }

    this.context.globalAlpha = 1;
    this.context.save();

    this.dirty = true;
    this.texture.needsUpdate = true;
  }
}
