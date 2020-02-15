export var COLORS = {
  BACKGROUND: "#FFFFFF",
  GRAY: "#444444",
  BLACK: "#222222",
  GREEN: "#00A020",
  ORANGE: "#FF6D00",
  BLUE: "#0D47A1",
  YELLOW: "#FFD600",
  RED: "#B71C1C",
  WHITE: "#E0E0E0"
};

export enum FACE {
  L,
  R,
  D,
  U,
  B,
  F
}

export var DURATION = 30;

export function download(filename: string, blob: Blob) {
  let link = document.createElement("a");
  link.innerHTML = filename;
  link.setAttribute("download", filename);
  link.download = filename;

  document.body.appendChild(link);

  let url = URL.createObjectURL(blob);
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
