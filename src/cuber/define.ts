export enum FACE {
  L,
  R,
  D,
  U,
  B,
  F,
}

export const DEFAULT_COLORS: { [key: string]: string } = {
  R: "#B71C1C",
  L: "#FF6D00",
  U: "#FFFFFF",
  D: "#FFD600",
  F: "#00A020",
  B: "#0D47A1",
  Core: "#202020",
  High: "#FF4081",
  Gray: "#404040",
};

export var COLORS: { [key: string]: string } = JSON.parse(JSON.stringify(DEFAULT_COLORS));
