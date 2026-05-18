export interface Theme {
  name: string;
  key: string;
  emoji: string;
  bg: string;
  cardBg: string;
  cardBorder: string;
  text: string;
  textMuted: string;
  inputBg: string;
  inputBorder: string;
  headerBg: string;
  headerBorder: string;
  tileEmpty: string;
  tileFilled: string;
  tileAbsent: string;
  tileAbsentText: string;
  keyBg: string;
  keyText: string;
  keyAbsent: string;
  keyAbsentText: string;
  opponentBg: string;
  miniEmpty: string;
}

export const themes: Theme[] = [
  {
    name: "Terminal",
    key: "terminal",
    emoji: ">_",
    bg: "#0d1117",
    cardBg: "rgba(22,27,34,0.95)",
    cardBorder: "#30363d",
    text: "#00ff41",
    textMuted: "#7ee787",
    inputBg: "#161b22",
    inputBorder: "#30363d",
    headerBg: "rgba(13,17,23,0.9)",
    headerBorder: "#30363d",
    tileEmpty: "#30363d",
    tileFilled: "#484f58",
    tileAbsent: "#30363d",
    tileAbsentText: "#7ee787",
    keyBg: "#21262d",
    keyText: "#00ff41",
    keyAbsent: "#30363d",
    keyAbsentText: "#484f58",
    opponentBg: "rgba(22,27,34,0.7)",
    miniEmpty: "#30363d",
  },
  {
    name: "Dracula",
    key: "dracula",
    emoji: "\u{1F9DB}",
    bg: "#282a36",
    cardBg: "rgba(40,42,54,0.95)",
    cardBorder: "#44475a",
    text: "#f8f8f2",
    textMuted: "#bd93f9",
    inputBg: "#44475a",
    inputBorder: "#6272a4",
    headerBg: "rgba(40,42,54,0.9)",
    headerBorder: "#44475a",
    tileEmpty: "#44475a",
    tileFilled: "#6272a4",
    tileAbsent: "#44475a",
    tileAbsentText: "#f8f8f2",
    keyBg: "#44475a",
    keyText: "#f8f8f2",
    keyAbsent: "#383a49",
    keyAbsentText: "#6272a4",
    opponentBg: "rgba(68,71,90,0.5)",
    miniEmpty: "#44475a",
  },
  {
    name: "Cyberpunk",
    key: "cyberpunk",
    emoji: "\u{1F916}",
    bg: "#0a0a1a",
    cardBg: "rgba(15,15,35,0.95)",
    cardBorder: "#ff2a6d",
    text: "#05d9e8",
    textMuted: "#d16ba5",
    inputBg: "#12122a",
    inputBorder: "#ff2a6d55",
    headerBg: "rgba(10,10,26,0.9)",
    headerBorder: "#ff2a6d44",
    tileEmpty: "#1a1a3e",
    tileFilled: "#2d2d5e",
    tileAbsent: "#1a1a3e",
    tileAbsentText: "#05d9e8",
    keyBg: "#1a1a3e",
    keyText: "#05d9e8",
    keyAbsent: "#12122a",
    keyAbsentText: "#4a4a7a",
    opponentBg: "rgba(26,26,62,0.6)",
    miniEmpty: "#1a1a3e",
  },
  {
    name: "Retro Arcade",
    key: "arcade",
    emoji: "\u{1F47E}",
    bg: "#1a0533",
    cardBg: "rgba(30,10,60,0.95)",
    cardBorder: "#ff6600",
    text: "#ffcc00",
    textMuted: "#ff9933",
    inputBg: "#220840",
    inputBorder: "#ff660055",
    headerBg: "rgba(26,5,51,0.9)",
    headerBorder: "#ff660044",
    tileEmpty: "#2d0a50",
    tileFilled: "#4a1a7a",
    tileAbsent: "#2d0a50",
    tileAbsentText: "#ffcc00",
    keyBg: "#2d0a50",
    keyText: "#ffcc00",
    keyAbsent: "#220840",
    keyAbsentText: "#664400",
    opponentBg: "rgba(45,10,80,0.6)",
    miniEmpty: "#2d0a50",
  },
  {
    name: "Solarized",
    key: "solarized",
    emoji: "\u{2600}\u{FE0F}",
    bg: "#002b36",
    cardBg: "rgba(0,43,54,0.95)",
    cardBorder: "#073642",
    text: "#839496",
    textMuted: "#586e75",
    inputBg: "#073642",
    inputBorder: "#586e75",
    headerBg: "rgba(0,43,54,0.9)",
    headerBorder: "#073642",
    tileEmpty: "#073642",
    tileFilled: "#586e75",
    tileAbsent: "#073642",
    tileAbsentText: "#839496",
    keyBg: "#073642",
    keyText: "#93a1a1",
    keyAbsent: "#002b36",
    keyAbsentText: "#586e75",
    opponentBg: "rgba(7,54,66,0.5)",
    miniEmpty: "#073642",
  },
  {
    name: "Matrix",
    key: "matrix",
    emoji: "\u{1F48A}",
    bg: "#000000",
    cardBg: "rgba(0,10,0,0.95)",
    cardBorder: "#003300",
    text: "#00ff00",
    textMuted: "#008f00",
    inputBg: "#001a00",
    inputBorder: "#003300",
    headerBg: "rgba(0,5,0,0.9)",
    headerBorder: "#003300",
    tileEmpty: "#002200",
    tileFilled: "#004400",
    tileAbsent: "#001a00",
    tileAbsentText: "#00aa00",
    keyBg: "#002200",
    keyText: "#00ff00",
    keyAbsent: "#001100",
    keyAbsentText: "#004400",
    opponentBg: "rgba(0,20,0,0.6)",
    miniEmpty: "#002200",
  },
  {
    name: "Starship",
    key: "starship",
    emoji: "\u{1F680}",
    bg: "#0b0e17",
    cardBg: "rgba(15,20,35,0.95)",
    cardBorder: "#1e3a5f",
    text: "#e0e7ff",
    textMuted: "#7c8db5",
    inputBg: "#111827",
    inputBorder: "#1e3a5f",
    headerBg: "rgba(11,14,23,0.9)",
    headerBorder: "#1e3a5f",
    tileEmpty: "#1e293b",
    tileFilled: "#334155",
    tileAbsent: "#1e293b",
    tileAbsentText: "#94a3b8",
    keyBg: "#1e293b",
    keyText: "#e0e7ff",
    keyAbsent: "#0f172a",
    keyAbsentText: "#475569",
    opponentBg: "rgba(30,41,59,0.5)",
    miniEmpty: "#1e293b",
  },
  {
    name: "Light",
    key: "light",
    emoji: "\u{2B1C}",
    bg: "#f8f8f8",
    cardBg: "rgba(255,255,255,0.9)",
    cardBorder: "#e4e4e7",
    text: "#1a1a1a",
    textMuted: "#71717a",
    inputBg: "#f4f4f5",
    inputBorder: "#d4d4d8",
    headerBg: "rgba(255,255,255,0.8)",
    headerBorder: "#e4e4e7",
    tileEmpty: "#d3d6da",
    tileFilled: "#878a8c",
    tileAbsent: "#787c7e",
    tileAbsentText: "#ffffff",
    keyBg: "#d3d6da",
    keyText: "#1a1a1a",
    keyAbsent: "#9ca3af",
    keyAbsentText: "#ffffff",
    opponentBg: "rgba(255,255,255,0.7)",
    miniEmpty: "#e4e4e7",
  },
];

export function getTheme(key: string): Theme {
  return themes.find((t) => t.key === key) || themes[0];
}

export function getSavedTheme(): string {
  if (typeof window === "undefined") return "light";
  return localStorage.getItem("wordly-theme") || "light";
}

export function saveTheme(key: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("wordly-theme", key);
  }
}
