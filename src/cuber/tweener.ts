class Tween {
  begin: number;
  end: number;
  duration: number;
  callback: Function;
  value: number;
  delta: number;
  constructor(begin: number, end: number, duration: number, callback: Function) {
    this.begin = begin;
    this.end = end;
    this.duration = duration;
    this.callback = callback;
    this.value = 0;
    this.delta = 1;
  }

  speedup() {
    this.delta = 4;
  }

  finish() {
    this.callback(this.end);
  }

  update() {
    this.value = this.value + this.delta;
    let elapsed = this.value / this.duration;
    elapsed = elapsed > 1 ? 1 : elapsed;
    elapsed = elapsed < 0 ? 0 : elapsed;
    elapsed = elapsed - 1;
    let value = 1 - elapsed * elapsed;
    this.callback(this.begin + (this.end - this.begin) * value);
    if (value == 1) {
      return false;
    }
    return true;
  }
}

export class Tweener {
  tweens: Tween[];

  get length() {
    return this.tweens.length;
  }

  constructor() {
    this.tweens = [];
    this.loop();
  }

  loop() {
    requestAnimationFrame(this.loop.bind(this));
    this.update();
  }

  tween(begin: number, end: number, duration: number, update: Function) {
    this.tweens.push(new Tween(begin, end, duration, update));
  }

  update() {
    if (this.tweens.length === 0) return false;
    var i = 0;
    while (i < this.tweens.length) {
      if (this.tweens[i].update()) {
        i++;
      } else {
        this.tweens.splice(i, 1);
      }
    }
    return true;
  }

  speedup() {
    for (const tween of this.tweens) {
      tween.speedup();
    }
  }

  finish() {
    let tweens = this.tweens.splice(0, this.tweens.length);
    for (const tween of tweens) {
      tween.finish();
    }
  }
}

let tweener = new Tweener();
export default tweener;
