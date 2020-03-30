import Tweener from "./tweener";
import Twister from "./twister";
import Preferance from "./preferance";
import Controller from "./controller";
import Capture from "./capture";
import World from "./world";
import History from "./history";

export class Cuber {
  world: World;
  tweener: Tweener;
  twister: Twister;
  history: History;
  preferance: Preferance;
  controller: Controller;
  capture: Capture;

  constructor() {
    this.world = new World();
    this.tweener = new Tweener();
    this.twister = new Twister();
    this.history = new History();
    this.preferance = new Preferance();
    this.controller = new Controller();
    this.capture = new Capture();
  }
}

let cuber = new Cuber();
export default cuber;
