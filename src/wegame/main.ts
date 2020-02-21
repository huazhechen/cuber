import * as THREE from "three";
import Keyboard from "./component/keyboard";
import { Component } from "./component/component";
import Starter from "./component/starter";
import Dashboard from "./component/dashboard";
import Setting from "./component/setting";
import Score from "./component/score";
import Database from "./database";
import Wecuber from "./component/wecuber";
import Retry from "./component/retry";
import { COLORS } from "../cuber/define";
import Toucher, { TouchAction } from "../common/toucher";
/**
 * 游戏主函数
 */
export default class Main {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  renderer: THREE.WebGLRenderer;
  views: Component[];
  handles: Component[];
  cuber: Wecuber;
  keyboard: Keyboard;
  starter: Starter;
  retry: Retry;
  dashboard: Dashboard;
  setting: Setting;
  score: Score;
  focus: Component;
  timer: number;
  database: Database;
  toucher: Toucher;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.database = new Database(this);

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true
    });
    this.renderer.autoClear = false;
    this.renderer.setClearColor(COLORS.BACKGROUND);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height, true);

    this.cuber = new Wecuber(0, 0, this.width, this.height);
    this.toucher = new Toucher();
    this.toucher.init(canvas, this.dispatch);
    this.keyboard = new Keyboard(this, 0, 0, this.width, this.height);
    this.dashboard = new Dashboard(this, 0, 0, this.width, this.height);

    this.starter = new Starter(this.database, 0, 0, this.width, this.height);
    this.retry = new Retry(this.database, 0, 0, this.width, this.height);
    this.setting = new Setting(this, 0, 0, this.width, this.height);
    this.score = new Score(this.database, 0, 0, this.width, this.height);

    this.views = [this.cuber, this.keyboard, this.dashboard, this.starter, this.retry, this.setting, this.score];
    this.handles = this.views.slice().reverse();

    this.cuber.cube.callbacks.push(this.check);

    window.onresize = () => {
      this.resize();
    };
    this.resize();

    this.timer = 0;

    this.database.load();
    this.database.mode = "starter";

    this.loop();
  }

  dispatch = (action: TouchAction) => {
    let x = action.x;
    let y = action.y;
    if (action.type == "touchstart" || action.type == "mousedown") {
      for (let component of this.handles) {
        if (component.disable || !component.display) {
          continue;
        }
        if (x > component.x && x < component.x + component.width && y > component.y && y < component.y + component.height) {
          action.x = x - component.x;
          action.y = y - component.y;
          if (component.touch(action)) {
            this.focus = component;
            break;
          }
        }
      }
    } else {
      let component = this.focus;
      if (!this.focus) {
        return;
      }
      if (!(x > component.x && x < component.x + component.width && y > component.y && y < component.y + component.height)) {
        action.type = "touchcancel";
      }
      action.x = x - component.x;
      action.y = y - component.y;
      component.touch(action);
    }
  };

  render = () => {
    let dirty = false;
    for (let component of this.views) {
      if (component.dirty) {
        dirty = true;
        break;
      }
    }
    if (dirty) {
      this.renderer.clear();
      for (let component of this.views) {
        if (!component.display) {
          continue;
        }
        this.renderer.setViewport(component.x, this.height - component.y - component.height, component.width, component.height);
        this.renderer.render(component.scene, component.camera);
        this.renderer.clearDepth();
        component.dirty = false;
      }
      this.renderer.setViewport(0, 0, this.width, this.height);
    }
    this.timer++;
    if (this.timer % Math.floor(this.cuber.cube.duration * 2) == 0) {
      this.random();
    }
  };

  loop() {
    requestAnimationFrame(this.loop.bind(this));
    this.render();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer.setSize(this.width, this.height, true);

    let width = this.width;
    let height = this.height;
    if (width > this.height / 1.8) {
      width = Math.floor(this.height / 1.8);
    } else {
      height = Math.floor(this.width * 1.8);
    }

    let cuber = width * 1.2;
    let keyboard = width * 0.5;
    if (!this.keyboard.display) {
      cuber = height;
      keyboard = 0;
    }

    let top = (this.height - height) / 2;
    let bottom = this.height - (this.height - height) / 2;
    let side = (this.width - width) / 2;

    this.dashboard.x = side;
    this.dashboard.y = top;
    this.dashboard.width = width;
    this.dashboard.height = width / 4;
    this.dashboard.resize();

    this.cuber.x = side;
    this.cuber.y = bottom - cuber - keyboard;
    this.cuber.width = width;
    this.cuber.height = cuber;
    this.cuber.resize();

    this.keyboard.x = side;
    this.keyboard.y = bottom - keyboard;
    this.keyboard.width = width;
    this.keyboard.height = keyboard;
    this.keyboard.resize();

    this.starter.x = 0;
    this.starter.y = 0;
    this.starter.width = this.width;
    this.starter.height = this.height;
    this.starter.resize();

    this.retry.x = 0;
    this.retry.y = 0;
    this.retry.width = this.width;
    this.retry.height = this.height;
    this.retry.resize();

    this.setting.x = 0;
    this.setting.y = 0;
    this.setting.width = this.width;
    this.setting.height = this.height;
    this.setting.resize();

    this.score.x = 0;
    this.score.y = 0;
    this.score.width = this.width;
    this.score.height = this.height;
    this.score.resize();
  }

  random() {
    if (this.database.mode == "starter") {
      let actions = ["U", "D", "R", "L", "F", "B"];
      let special = ["M", "x", "E", "y", "S", "z"];
      let index = Math.floor(Math.random() * 6);
      let exp = actions[index];
      let random = Math.random();
      if (random < 0.1) {
        exp = special[index];
      } else if (random < 0.6) {
        exp = exp.toLowerCase();
      }
      random = Math.random();
      if (random < 0.5) {
        exp = exp + "'";
      }
      this.cuber.cube.twister.twist(exp);
    }
  }

  check = () => {
    if (this.database.mode != "cuber") {
      return;
    }
    let complete = this.cuber.cube.complete;
    if (complete) {
      let time = this.database.now - this.database.start;
      this.database.record(time, this.cuber.cube.history.length);
      this.retry.paint();
      this.cuber.preferance.lock = true;
      this.keyboard.paint();
      this.keyboard.disable = true;
      this.database.mode = "retry";
    }
  };
}
