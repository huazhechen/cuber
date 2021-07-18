declare module "*.vue" {
  import Vue from "vue";
  export default Vue;
}

declare module "clipboard" {
  export class ClipboardJS {
    constructor(args: Element);
  }
  export default ClipboardJS;
}
