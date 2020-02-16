export var COLORS = {
  BACKGROUND: "#FFFFFF",
  GRAY: "#444444",
  BLACK: "#222222",
  GREEN: "#00A020",
  ORANGE: "#FF6D00",
  BLUE: "#0D47A1",
  YELLOW: "#FFD600",
  RED: "#B71C1C",
  WHITE: "#F0F0F0",
  CYAN: "#18FFFF",
  LIME: "#C6FF00",
  PURPLE: "#FF4081"
};

export function RGB(value: string) {
  value = value.toLowerCase();
  var result = [];
  for (var i = 1; i < 7; i += 2) {
    result.push(parseInt("0x" + value.slice(i, i + 2)));
  }
  return result;
}

export enum FACE {
  L,
  R,
  D,
  U,
  B,
  F
}

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
