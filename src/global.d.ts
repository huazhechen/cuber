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

declare module "worker-loader*" {
  class WebpackWorker extends Worker {
    constructor();
  }

  export default WebpackWorker;
}
