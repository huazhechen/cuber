declare module "*.vue" {
  import Vue from "vue";
  export default Vue;
}

declare module "cubejs" {
  export default class Cube {
    static initSolver(): null;
    static scramble(): string;
  }
}

declare module "whammy" {
  export namespace Whammy {
    class Video {
      constructor(rate: number);
      add(canvas: HTMLCanvasElement): null;
      compile(b: boolean): Blob;
    }
  }
  export default Whammy;
}
