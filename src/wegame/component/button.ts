import { COLORS } from "../../cuber/define";

export interface Button {
  x: number;
  y: number;
  width: number;
  height: number;
  paint(context: CanvasRenderingContext2D): void;
  tap: Function;
  touch: Function;
}

export class RoundButton implements Button {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  private value: string;
  private callback: Function;
  private bg: string;
  private fg: string;
  constructor(value: string, callback: Function, bg: string = COLORS.WHITE, fg: string = COLORS.BLACK) {
    this.value = value;
    this.callback = callback;
    this.bg = bg;
    this.fg = fg;
  }

  paint(context: CanvasRenderingContext2D) {
    let x = this.x * window.devicePixelRatio;
    let y = this.y * window.devicePixelRatio;
    let width = this.width * window.devicePixelRatio;
    let height = this.height * window.devicePixelRatio;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = height / 2 + "px Arial";
    context.beginPath();
    context.moveTo(x + height / 2, y);
    context.lineTo(x + width - height / 2, y);
    context.arc(x + width - height / 2, y + height / 2, height / 2, -Math.PI / 2, Math.PI / 2);
    context.lineTo(x + height / 2, y + height);
    context.arc(x + height / 2, y + height / 2, height / 2, Math.PI / 2, -Math.PI / 2);
    context.closePath();
    context.fillStyle = this.bg;
    context.fill();

    context.fillStyle = this.fg;
    context.fillText(this.value, x + width / 2, y + height / 2);
  }

  tap() {
    this.callback();
  }
  touch() {}
}
