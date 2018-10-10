import "cubejs/lib/solve";
import Cube from "cubejs";

const ctx: Worker = self as any;

ctx.addEventListener("message", (event: MessageEvent) => {
  if (event.data["action"] == "init") {
    Cube.initSolver();
    ctx.postMessage({ action: "init" });
  } else if (event.data["action"] == "scramble") {
    let scramble = Cube.scramble();
    ctx.postMessage({ action: "scramble", data: scramble });
  }
});
