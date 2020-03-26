import Tweener from "./tweener";
import Twister from "./twister";
import Preferance from "./preferance";
import Controller from "./controller";
import Capture from "./capture";
import World from "./world";
import History from "./history";

let world = new World();
let tweener = new Tweener();
let twister = new Twister();
let history = new History();
let preferance = new Preferance();
let controller = new Controller();
let capture: Capture = new Capture();

export default { world, controller, preferance, history, twister, tweener, capture };

preferance.load();
