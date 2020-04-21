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
    const i = Math.round((h / 60) % 6);
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

  static RGB2HSL(rgb: number[]): number[] {
    const r = rgb[0] / 255,
      g = rgb[1] / 255,
      b = rgb[2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const v = max - min;

    let h = 0;
    if (v === 0) {
      h = 0;
    } else if (max === r) {
      h = 60 * (((g - b) / v) % 6);
    } else if (max === g) {
      h = 60 * ((b - r) / v + 2);
    } else if (max === b) {
      h = 60 * ((r - g) / v + 4);
    }

    h = h % 360;
    if (h < 0) {
      h += 360;
    }
    let l = (max + min) / 2;
    let s = v === 0 ? 0 : v / (1 - Math.abs(2 * l - 1));
    h = Math.round(h);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    return [h, s, l];
  }

  static HSL2RGB(hsl: number[]): number[] {
    const h = hsl[0],
      s = hsl[1] / 100,
      l = hsl[2] / 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    const rgb = [];
    if (h >= 0 && h < 60) {
      rgb.push(c, x, 0);
    } else if (h >= 60 && h < 120) {
      rgb.push(x, c, 0);
    } else if (h >= 120 && h < 180) {
      rgb.push(0, c, x);
    } else if (h >= 180 && h < 240) {
      rgb.push(0, x, c);
    } else if (h >= 240 && h < 300) {
      rgb.push(x, 0, c);
    } else if (h >= 300 && h < 360) {
      rgb.push(c, 0, x);
    }
    let [r, g, b] = rgb;
    r = Math.round(255 * (r + m));
    g = Math.round(255 * (g + m));
    b = Math.round(255 * (b + m));
    return [r, g, b];
  }

  static HSVD(hsv1: number[], hsv2: number[]): number {
    const r = 50;
    const h = 90;
    const x1 = r * hsv1[2] * hsv1[1] * Math.cos((hsv1[0] / 180) * Math.PI);
    const y1 = r * hsv1[2] * hsv1[1] * Math.sin((hsv1[0] / 180) * Math.PI);
    const z1 = h * (1 - hsv1[2]);
    const x2 = r * hsv2[2] * hsv2[1] * Math.cos((hsv2[0] / 180) * Math.PI);
    const y2 = r * hsv2[2] * hsv2[1] * Math.sin((hsv2[0] / 180) * Math.PI);
    const z2 = h * (1 - hsv2[2]);
    const dx = x1 - x2;
    const dy = y1 - y2;
    const dz = z1 - z2;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  static RGBD(rgb1: number[], rgb2: number[]): number {
    const rmean = (rgb1[0] + rgb2[0]) / 2;
    const r = rgb1[0] - rgb2[0];
    const g = rgb1[1] - rgb2[1];
    const b = rgb1[2] - rgb2[2];
    return Math.sqrt((2 + rmean / 256) * r ** 2 + 4 * g ** 2 + (2 + (255 - rmean) / 256) * b ** 2);
  }
}
