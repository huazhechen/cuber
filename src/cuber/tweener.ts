export class Tween {
  begin: number;
  end: number;
  duration: number;
  callback: Function;
  value: number;
  constructor(begin: number, end: number, duration: number, callback: Function) {
    this.begin = begin;
    this.end = end;
    this.duration = duration;
    this.callback = callback;
    this.value = 0;
  }

  finish(): void {
    this.callback(this.end);
  }

  update(): boolean {
    this.value++;
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

  tween(begin: number, end: number, duration: number, update: Function): Tween {
    const tween = new Tween(begin, end, duration, update);
    this.tweens.push(tween);
    return tween;
  }

  update(): boolean {
    if (this.tweens.length === 0) return false;
    let i = 0;
    let len = this.tweens.length;
    while (i < len) {
      if (this.tweens[i].update()) {
        i++;
      } else {
        this.tweens.splice(i, 1);
        len--;
      }
    }
    return true;
  }

  finish(tween: Tween | undefined = undefined): void {
    if (tween) {
      for (let i = 0; i < this.tweens.length; i++) {
        if (this.tweens[i] == tween) {
          tween.finish();
          this.tweens.splice(i, 1);
          return;
        }
      }
    } else {
      const tweens = this.tweens.splice(0, this.tweens.length);
      for (const tween of tweens) {
        tween.finish();
      }
    }
  }

  cancel(tween: Tween): void {
    for (let i = 0; i < this.tweens.length; i++) {
      if (this.tweens[i] == tween) {
        this.tweens.splice(i, 1);
        return;
      }
    }
  }
}

const tweener = new Tweener();
export default tweener;
