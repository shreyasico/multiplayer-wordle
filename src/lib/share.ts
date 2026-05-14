import type { TileData } from "./game";

const EMOJI: Record<string, string> = {
  correct: "🟩",
  present: "🟨",
  absent: "⬜",
  empty: "⬜",
};

export function buildShareText(
  guesses: TileData[][],
  won: boolean,
  wordLength: number,
  maxGuesses: number,
  mode: string,
): string {
  const score = won ? `${guesses.length}/${maxGuesses}` : `X/${maxGuesses}`;
  const grid = guesses
    .map((row) => row.map((t) => EMOJI[t.state] || "⬜").join(""))
    .join("\n");

  const modeLabel = mode === "daily" ? "Daily" : "";
  const header = `Wordly ${modeLabel} (${wordLength} letters) ${score}`.replace(/  +/g, " ").trim();

  return `${header}\n\n${grid}`;
}
