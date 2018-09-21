export default class Tweener {

    private _tweens: Tween[] = [];

    tween(begin: number, end: number, duration: number, update: Function, finish: Function) {
        this._tweens.push(new Tween(begin, end, duration, update, finish));
    }

    update() {
        if (this._tweens.length === 0) return false;
        var i = 0;
        while (i < this._tweens.length) {
            if (this._tweens[i].update()) {
                i++;
            } else {
                this._tweens.splice(i, 1);
            }
        }
        return true;
    }
}

class Tween {

    private _start: number = Date.now();
    private _begin: number;
    private _end: number;
    private _duration: number;
    private _update: Function;
    private _finish: Function;
    constructor(begin: number, end: number, duration: number, update: Function, finish: Function) {
        this._begin = begin;
        this._end = end;
        this._duration = duration;
        this._update = update;
        this._finish = finish;
    }
    update(): boolean {
        let time = Date.now();
        let elapsed = (time - this._start) / this._duration;
        elapsed = elapsed > 1 ? 1 : elapsed;
        let value = 1 - (--elapsed * elapsed);
        this._update(this._begin + (this._end - this._begin) * value);
        if (value == 1) {
            this._finish();
            return false;
        }
        return true;
    };
}