import Toucher from "../common/toucher";
import { Panel } from "./panel";
import Cuber from "../cuber/cuber";
import Capture from "../cuber/capture";

export default class Context {
  cuber: Cuber = new Cuber();
  toucher: Toucher = new Toucher();
  mode: number = -1;
  panels: Panel[] = [];

  algs = require("./Algs/algs.json");
  pics: string[][] = [];
  capture: Capture = new Capture();
}
