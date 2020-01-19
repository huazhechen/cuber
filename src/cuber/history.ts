import { TwistAction } from "./twister";

export default class list {
  list: TwistAction[] = [];
  constructor() {}

  record(action: TwistAction) {
    if (this.list.length == 0) {
      this.list.push(action);
    } else {
      let last = this.list[this.list.length - 1];
      if (last.exp == action.exp && last.times == action.times && last.reverse != action.reverse) {
        this.list.pop();
      } else {
        this.list.push(action);
      }
    }
  }

  clear() {
    this.list = [];
  }

  get last() {
    return this.list[this.list.length - 1];
  }

  get length() {
    return this.list.length;
  }

  get moves() {
    let length = this.length;
    for (const twist of this.list) {
      if (/[xyz]/.test(twist.exp)) {
        length--;
      }
    }
    return length;
  }
}
