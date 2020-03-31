import cuber from ".";
import { TwistAction } from "./twister";

export default class History {
  list: TwistAction[] = [];
  constructor() {}

  record(action: TwistAction) {
    if (this.list.length == 0) {
      action.times = action.times % 4;
      if (action.times != 0) {
        this.list.push(action);
      }
    } else {
      let last = this.list[this.list.length - 1];
      if (last.exp == action.exp) {
        last.times = last.times + action.times * (last.reverse == action.reverse ? 1 : -1);
        last.times = last.times % 4;
        if (last.times == 0) {
          this.list.pop();
        }
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
      if (twist.exp == "x" || twist.exp == "y" || twist.exp == "z") {
        length--;
      }
    }
    return length;
  }

  undo() {
    if (this.length == 0) {
      return;
    }
    cuber.twister.finish();
    if (this.length == 0) {
      return;
    }
    let last = this.last;
    let action = new TwistAction(last.exp, !last.reverse, last.times);
    cuber.twister.push(action);
  }

  get exp() {
    let exps: string[] = [];
    for (const action of this.list) {
      exps.push(action.exp);
    }
    return exps.join(" ");
  }
}
