export default class Color {
  static RGB2HEX(rgb: number[]): string {
    const r = rgb[0];
    const g = rgb[1];
    const b = rgb[2];
    const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return hex;
  }

  static HEX2RGB(value: string): number[] {
    value = value.toLowerCase();
    const result = [];
    for (let i = 1; i < 7; i += 2) {
      result.push(parseInt("0x" + value.slice(i, i + 2)));
    }
    return result;
  }

  static RGB2HSV(rgb: number[]): number[] {
    let h = 0,
      s = 0,
      v = 0;
    const r = rgb[0],
      g = rgb[1],
      b = rgb[2];
    rgb.sort(function (a, b) {
      return a - b;
    });
    const max = rgb[2];
    const min = rgb[0];
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
    h = Math.round(h);
    s = Math.round(s * 100);
    v = Math.round(v * 100);
    return [h, s, v];
  }

  static HSV2RGB(hsv: number[]): number[] {
    const h = hsv[0],
      s = hsv[1] / 100,
      v = hsv[2] / 100;
    let r = 0,
      g = 0,
      b = 0;
    const i = Math.floor((h / 60) % 6);
    const f = h / 60 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
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
    r = Math.round(r * 255.0);
    g = Math.round(g * 255.0);
    b = Math.round(b * 255.0);
    return [r, g, b];
  }

  static RGBD(rgb1: number[], rgb2: number[]): number {
    const rmean = (rgb1[0] + rgb2[0]) / 2;
    const r = rgb1[0] - rgb2[0];
    const g = rgb1[1] - rgb2[1];
    const b = rgb1[2] - rgb2[2];
    return Math.sqrt((2 + rmean / 256) * r ** 2 + 4 * g ** 2 + (2 + (255 - rmean) / 256) * b ** 2);
  }

  static PRINT(rgb: number[]): void {
    console.log("%cRGB=" + rgb + " HSV=" + Color.RGB2HSV(rgb), "color:" + Color.RGB2HEX(rgb));
  }
}
