import { TwistAction } from "./twister";

export default class History {
  list: TwistAction[] = [];
  init = "";
  exp = "";

  record(action: TwistAction): void {
    if (this.list.length == 0) {
      action.times = action.times % 4;
      if (action.times != 0) {
        this.list.push(action);
        this.exp = this.exp + " " + action.exp;
      }
    } else {
      const last = this.list[this.list.length - 1];
      if (last.group == action.group) {
        last.times = last.times + action.times * (last.reverse == action.reverse ? 1 : -1);
        while (last.times < 0) {
          last.times = last.times + 4;
        }
        last.times = last.times % 4;
        this.exp = this.exp.substring(0, this.exp.lastIndexOf(" "));
        if (last.times == 0) {
          this.list.pop();
        } else {
          this.exp = this.exp + " " + last.exp;
        }
      } else {
        this.list.push(action);
        this.exp = this.exp + " " + action.exp;
      }
    }
  }

  clear(): void {
    this.list = [];
    this.init = "";
    this.exp = "";
  }

  get last(): TwistAction {
    return this.list[this.list.length - 1];
  }

  get length(): number {
    return this.list.length;
  }

  get moves(): number {
    let length = this.length;
    for (const twist of this.list) {
      if (twist.group == "x" || twist.group == "y" || twist.group == "z") {
        length--;
      }
    }
    return length;
  }
}
