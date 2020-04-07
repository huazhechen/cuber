export enum FACE {
  L,
  R,
  D,
  U,
  B,
  F,
}

export const DEFAULT_COLORS: { [key: string]: string } = {
  L: "#FF6D00",
  R: "#B71C1C",
  D: "#FFD600",
  U: "#FFFFFF",
  B: "#0D47A1",
  F: "#00A020",
  Core: "#202020",
  High: "#FF4081",
};

export var COLORS: { [key: string]: string } = JSON.parse(JSON.stringify(DEFAULT_COLORS));
