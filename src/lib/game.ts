export const MAX_GUESSES = 6;

export type LetterState = "correct" | "present" | "absent" | "empty" | "hinted";

export interface TileData {
  letter: string;
  state: LetterState;
}

export function evaluateGuess(guess: string, answer: string): TileData[] {
  const length = answer.length;
  const result: TileData[] = Array.from({ length }, (_, i) => ({
    letter: guess[i],
    state: "absent" as LetterState,
  }));

  const remaining: (string | null)[] = answer.split("");

  for (let i = 0; i < length; i++) {
    if (guess[i] === answer[i]) {
      result[i].state = "correct";
      remaining[i] = null;
    }
  }

  for (let i = 0; i < length; i++) {
    if (result[i].state === "correct") continue;
    const idx = remaining.indexOf(guess[i]);
    if (idx !== -1) {
      result[i].state = "present";
      remaining[idx] = null;
    }
  }

  return result;
}

export type KeyboardState = Record<string, LetterState>;

export function updateKeyboardState(
  current: KeyboardState,
  tiles: TileData[]
): KeyboardState {
  const next = { ...current };
  const priority: Record<LetterState, number> = {
    correct: 4,
    present: 3,
    absent: 2,
    hinted: 1,
    empty: 0,
  };
  for (const tile of tiles) {
    const existing = next[tile.letter];
    if (!existing || priority[tile.state] > priority[existing]) {
      next[tile.letter] = tile.state;
    }
  }
  return next;
}
