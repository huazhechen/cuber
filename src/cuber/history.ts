import { TwistAction } from "./twister";

export default class History {
  list: TwistAction[] = [];
  init = "";
  exp = "";

  record(raw: TwistAction): void {
    const action = new TwistAction(raw.sign, raw.reverse, raw.times);
    if (this.list.length == 0) {
      action.times = action.times % 4;
      if (action.times != 0) {
        this.list.push(action);
        this.exp = this.exp + " " + action.value;
      }
    } else {
      const last = this.list[this.list.length - 1];
      if (last.sign == action.sign) {
        last.times = last.times + action.times * (last.reverse == action.reverse ? 1 : -1);
        if (last.times < 0) {
          last.times = -last.times;
          last.reverse = !last.reverse;
        }
        last.times = last.times % 4;
        this.exp = this.exp.substring(0, this.exp.lastIndexOf(" "));
        if (last.times == 0) {
          this.list.pop();
        } else {
          this.exp = this.exp + " " + last.value;
        }
      } else {
        this.list.push(action);
        this.exp = this.exp + " " + action.value;
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
      if (twist.sign == "x" || twist.sign == "y" || twist.sign == "z") {
        length--;
      }
    }
    return length;
  }
}
