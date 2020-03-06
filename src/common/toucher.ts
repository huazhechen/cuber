export class TouchAction {
  type: string;
  x: number;
  y: number;
  constructor(type: string, x: number, y: number) {
    this.type = type;
    this.x = x;
    this.y = y;
  }
}

export default class Toucher {
  init(canvas: HTMLCanvasElement, callback: Function) {
    this.canvas = canvas;
    this.callback = callback;
    canvas.addEventListener("touchstart", this.touch);
    canvas.addEventListener("touchmove", this.touch);
    canvas.addEventListener("touchend", this.touch);
    canvas.addEventListener("touchcancel", this.touch);

    canvas.addEventListener("mousedown", this.mouse);
    canvas.addEventListener("mousemove", this.mouse);
    canvas.addEventListener("mouseup", this.mouse);
    canvas.addEventListener("mouseout", this.mouse);
    window.addEventListener("deviceorientation", this.ori, false);
  }
  canvas: HTMLCanvasElement;
  callback: Function;

  ori = (event: DeviceOrientationEvent) => {
    let alpha = event.alpha || 0;
    let beta = event.beta || 0;
    let gamma = event.gamma || 0;

    let lat = beta;
    let lon = alpha + gamma;
    if (beta > 0) {
      lat = beta - 90;
    }
    lon = lon < 180 ? lon : lon - 360;
    lat = lat;


    let action = new TouchAction(event.type, lat, lon);
    this.callback(action);
    event.returnValue = false;
    return false;
  };

  mouse = (event: MouseEvent) => {
    this.canvas.tabIndex = 1;
    this.canvas.focus();
    let action = new TouchAction(event.type, event.clientX, event.clientY);
    this.callback(action);
    event.returnValue = false;
    return false;
  };

  touch = (event: TouchEvent) => {
    this.canvas.tabIndex = 1;
    this.canvas.focus();
    let touches = event.changedTouches;
    let first = touches[0];
    let action = new TouchAction(event.type, first.clientX, first.clientY);
    this.callback(action);
    event.preventDefault();
    return true;
  };
}
