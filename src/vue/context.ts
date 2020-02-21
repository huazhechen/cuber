import Toucher from "../common/toucher";
import { Panel } from "./panel";
import Cuber from "../cuber/cuber";

export default class Context {
  cuber: Cuber = new Cuber();
  controller: Toucher = new Toucher();
  mode: number = -1;
  panels: Panel[] = [];
}
