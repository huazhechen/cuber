import Controller from "../common/controllor";
import { Panel } from "./panel";
import Cuber from "../cuber/cuber";

export default class Context {
  cuber: Cuber = new Cuber();
  controller: Controller = new Controller();
  mode: number = 0;
  panels: Panel[] = [];
  dialogs: boolean[] = [];
}
