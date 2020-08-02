import CubieCube from "./CubieCube";
import CoordCube from "./CoordCube";

export default class Solver {
  constructor() {
    CubieCube.Init();
    CoordCube.Init();
  }

  init(): void {
    CoordCube.Init();
  }
}
