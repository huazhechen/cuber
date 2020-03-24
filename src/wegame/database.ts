import Main from "./main";

export default class Database {
  private _mode: string;

  public times: number[];
  public steps: number[];
  public time: number;
  public step: number;

  private _storage = window.localStorage;
  private main: Main;
  constructor(main: Main) {
    this.main = main;
    this.times = [];
    this.steps = [];
  }

  load() {
    let version = "0.0.1";
    if (this._storage.getItem("version") != version) {
      this._storage.clear();
      this._storage.setItem("version", version);
    }
    this.times = JSON.parse(this._storage.getItem("score.times") || "[]");
    this.steps = JSON.parse(this._storage.getItem("score.steps") || "[]");
    this.time = Number(this._storage.getItem("score.time") || 0);
    this.step = Number(this._storage.getItem("score.step") || 0);
    this.main.setting.paint();
  }

  set mode(mode: string) {
    this.main.cuber.disable = mode != "cuber";
    this.main.keyboard.disable = mode != "cuber";

    this.main.dashboard.display = mode == "cuber";
    this.main.starter.display = mode == "starter";
    this.main.retry.display = mode == "retry";
    this.main.setting.display = mode == "setting";
    this.main.score.display = mode == "score";
    if (mode == "cuber") {
      this.main.cuber.preferance.lock = false;
      this.main.cuber.twister.finish();
      this.main.cuber.twister.twist("#x2*", false, 1, true);
    }
    this._mode = mode;
  }

  get mode() {
    return this._mode;
  }

  record(time: number, step: number) {
    this.time = time;
    this.step = step;
    this.times.push(time);
    this.steps.push(step);

    this.times.sort();
    if (this.times.length > 24) {
      this.times.pop();
    }
    this.steps.sort();
    if (this.steps.length > 24) {
      this.steps.pop();
    }

    this._storage.setItem("score.times", JSON.stringify(this.times));
    this._storage.setItem("score.steps", JSON.stringify(this.steps));
    this._storage.setItem("score.time", String(this.time));
    this._storage.setItem("score.step", String(this.step));

    this.main.score.paint();
  }
    
  public start: number;
  public now: number;
}
