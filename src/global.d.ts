declare module "*.vue" {
  import Vue from "vue";
  export default Vue;
}

declare module "pako" {
  export namespace pako {
    function deflate(s: string, option: { to: string }): string;
    function inflate(s: string, option: { to: string }): string;
  }
  export default pako;
}

declare module "clipboard" {
  export class ClipboardJS {
    constructor(args: Element);
  }
  export default ClipboardJS;
}
