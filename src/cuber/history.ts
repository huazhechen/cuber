import { TwistAction } from "./twister";

export default class list {
  list: TwistAction[] = [];
  callbacks: Function[] = [];
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
    for (let callback of this.callbacks) {
      callback();
    }
  }

  clear() {
    this.list = [];
    for (let callback of this.callbacks) {
      callback();
    }
  }

  get last() {
    return this.list[this.list.length - 1];
  }

  get length() {
    return this.list.length;
  }
}
