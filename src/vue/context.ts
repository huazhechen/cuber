import Toucher from "../common/toucher";
import { Panel } from "./panel";

export default class Context {
  toucher: Toucher = new Toucher();
  mode: number = -1;
  panels: Panel[] = [];

  algs = require("./Algs/algs.json");
  pics: string[][] = [];
}
