import "cubejs/lib/solve"
import Cube from "cubejs"

const ctx: Worker = self as any;
const cuber: Cube = new Cube();

ctx.addEventListener("message", (event: MessageEvent) => {
  if (event.data["action"] == "init") {
    Cube.initSolver();
    ctx.postMessage({ action: "init" });
  } else if (event.data["action"] == "random") {
    cuber.randomize();
    let solution = cuber.solve();
    ctx.postMessage({ action: "random", data: solution });
  }
});