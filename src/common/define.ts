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
  PURPLE: "#E040FB"
};

export function RGB(value: string) {
  value = value.toLowerCase();
  var result = [];
  for (var i = 1; i < 7; i += 2) {
    result.push(parseInt("0x" + value.slice(i, i + 2)));
  }
  return result;
}

export function RGB2HSV(rgb: number[]) {
  var h = 0,
    s = 0,
    v = 0;
  var r = rgb[0],
    g = rgb[1],
    b = rgb[2];
  rgb.sort(function(a, b) {
    return a - b;
  });
  var max = rgb[2];
  var min = rgb[0];
  v = max / 255;
  if (max === 0) {
    s = 0;
  } else {
    s = 1 - min / max;
  }
  if (max === min) {
    h = 0;
  } else if (max === r && g >= b) {
    h = 60 * ((g - b) / (max - min)) + 0;
  } else if (max === r && g < b) {
    h = 60 * ((g - b) / (max - min)) + 360;
  } else if (max === g) {
    h = 60 * ((b - r) / (max - min)) + 120;
  } else if (max === b) {
    h = 60 * ((r - g) / (max - min)) + 240;
  }
  h = Math.floor(h);
  s = Math.floor(s * 100);
  v = Math.floor(v * 100);
  return [h, s, v];
}

export function HSV2RGB(hsv: number[]) {
  var h = hsv[0],
    s = hsv[1],
    v = hsv[2];
  s = s / 100;
  v = v / 100;
  var r = 0,
    g = 0,
    b = 0;
  var i = Math.floor((h / 60) % 6);
  var f = h / 60 - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);
  switch (i) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
    default:
      break;
  }
  r = Math.floor(r * 255.0);
  g = Math.floor(g * 255.0);
  b = Math.floor(b * 255.0);
  return [r, g, b];
}

export function HSVD(hsv1: number[], hsv2: number[]) {
  let r = 50;
  let h = 90;
  let x1 = r * hsv1[2] * hsv1[1] * Math.cos((hsv1[0] / 180) * Math.PI);
  let y1 = r * hsv1[2] * hsv1[1] * Math.sin((hsv1[0] / 180) * Math.PI);
  let z1 = h * (1 - hsv1[2]);
  let x2 = r * hsv2[2] * hsv2[1] * Math.cos((hsv2[0] / 180) * Math.PI);
  let y2 = r * hsv2[2] * hsv2[1] * Math.sin((hsv2[0] / 180) * Math.PI);
  let z2 = h * (1 - hsv2[2]);
  let dx = x1 - x2;
  let dy = y1 - y2;
  let dz = z1 - z2;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function RGBD(rgb1: number[], rgb2: number[]) {
  let rmean = (rgb1[0] + rgb2[0]) / 2;
  let r = rgb1[0] - rgb2[0];
  let g = rgb1[1] - rgb2[1];
  let b = rgb1[2] - rgb2[2];
  return Math.sqrt((2 + rmean / 256) * r ** 2 + 4 * g ** 2 + (2 + (255 - rmean) / 256) * b ** 2);
}

export enum FACE {
  L,
  R,
  D,
  U,
  B,
  F
}

export function DOWNLOAD(filename: string, url: string) {
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
