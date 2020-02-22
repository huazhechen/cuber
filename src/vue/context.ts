import Toucher from "../common/toucher";
import { Panel } from "./panel";
import Cuber from "../cuber/cuber";
import Capture from "../cuber/capture";

export default class Context {
  cuber: Cuber = new Cuber();
  controller: Toucher = new Toucher();
  mode: number = -1;
  panels: Panel[] = [];
  pics: string[][] = [];

  algs = require("./Algs/algs.json");
  capture: Capture = new Capture();
}
