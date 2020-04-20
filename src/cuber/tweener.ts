export class Tween {
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

  speedup(): void {
    this.delta = 4;
  }

  finish(): void {
    this.callback(this.end);
  }

  update(): boolean {
    this.value = this.value + this.delta;
    let elapsed = this.value / this.duration;
    elapsed = elapsed > 1 ? 1 : elapsed;
    elapsed = elapsed < 0 ? 0 : elapsed;
    elapsed = elapsed - 1;
    const value = 1 - elapsed * elapsed;
    if (value == 1) {
      this.callback(this.end);
      return false;
    }
    this.callback(this.begin + (this.end - this.begin) * value);
    return true;
  }
}

export class Tweener {
  tweens: Tween[];

  get length(): number {
    return this.tweens.length;
  }

  constructor() {
    this.tweens = [];
    this.loop();
  }

  loop(): void {
    requestAnimationFrame(this.loop.bind(this));
    this.update();
  }

  tween(begin: number, end: number, duration: number, update: Function): void {
    this.tweens.push(new Tween(begin, end, duration, update));
  }

  update(): boolean {
    if (this.tweens.length === 0) return false;
    let i = 0;
    while (i < this.tweens.length) {
      if (this.tweens[i].update()) {
        i++;
      } else {
        this.tweens.splice(i, 1);
      }
    }
    return true;
  }

  speedup(): void {
    for (const tween of this.tweens) {
      tween.speedup();
    }
  }

  finish(): void {
    const tweens = this.tweens.splice(0, this.tweens.length);
    for (const tween of tweens) {
      tween.finish();
    }
  }
}

const tweener = new Tweener();
export default tweener;
