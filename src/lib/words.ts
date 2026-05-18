import { readFileSync } from "fs";
import { join } from "path";

export const MIN_LENGTH = 5;
export const MAX_LENGTH = 12;

const validWordsByLength = new Map<number, Set<string>>();
const answerWordsByLength = new Map<number, string[]>();

function load() {
  try {
    const validPath = join(process.cwd(), "data", "valid-words.txt");
    const validWords = readFileSync(validPath, "utf-8")
      .split("\n")
      .filter((w) => /^[a-z]+$/.test(w));

    for (const word of validWords) {
      const len = word.length;
      if (len < MIN_LENGTH || len > MAX_LENGTH) continue;
      if (!validWordsByLength.has(len)) validWordsByLength.set(len, new Set());
      validWordsByLength.get(len)!.add(word);
    }
  } catch {
    console.warn("Could not load valid-words.txt, using answer words only");
  }

  try {
    const answerPath = join(process.cwd(), "data", "answer-words.json");
    const data = JSON.parse(readFileSync(answerPath, "utf-8")) as Record<
      string,
      string[]
    >;

    for (const [lenStr, words] of Object.entries(data)) {
      const len = parseInt(lenStr, 10);
      answerWordsByLength.set(len, words);

      if (!validWordsByLength.has(len)) validWordsByLength.set(len, new Set());
      const set = validWordsByLength.get(len)!;
      for (const w of words) set.add(w);
    }
  } catch {
    console.error("Could not load answer-words.json");
  }

  for (let len = MIN_LENGTH; len <= MAX_LENGTH; len++) {
    const valid = validWordsByLength.get(len)?.size ?? 0;
    const answers = answerWordsByLength.get(len)?.length ?? 0;
    console.log(`  Words[${len}]: ${valid} valid, ${answers} answers`);
  }
}

load();

export function isValidGuess(word: string): boolean {
  const set = validWordsByLength.get(word.length);
  return set ? set.has(word.toLowerCase()) : false;
}

export function getRandomWord(length: number): string {
  const words = answerWordsByLength.get(length);
  if (!words || words.length === 0) {
    throw new Error(`No answer words for length ${length}`);
  }
  return words[Math.floor(Math.random() * words.length)];
}

export function getDailyWord(length: number): string {
  const words = answerWordsByLength.get(length);
  if (!words || words.length === 0) {
    throw new Error(`No answer words for length ${length}`);
  }
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) | 0;
  }
  return words[Math.abs(hash) % words.length];
}

export function isValidWord(word: string): boolean {
  const set = validWordsByLength.get(word.length);
  return set ? set.has(word.toLowerCase()) : false;
}
