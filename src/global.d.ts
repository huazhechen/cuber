declare module "*.vue" {
  import Vue from "vue";
  export default Vue;
}

declare module "pako" {
  export namespace pako {
    function deflate(s: string, option: any): string;
    function inflate(s: string, option: any): string;
  }
  export default pako;
}

declare module "clipboard" {
  export class ClipboardJS {
    constructor(args: any);
  }
  export default ClipboardJS;
}
