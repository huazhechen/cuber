export default class Util {
  static DOWNLOAD(filename: string, url: string) {
    let link = document.createElement("a");
    link.innerHTML = filename;
    link.setAttribute("download", filename);
    link.download = filename;

    document.body.appendChild(link);

    link.href = url;

    if (document.createEvent) {
      var event = document.createEvent("MouseEvents");
      event.initEvent("click", true, true);
      link.dispatchEvent(event);
    } else if (link.click) {
      link.click();
    }

    document.body.removeChild(link);
  }
}
