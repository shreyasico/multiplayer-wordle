import { NextResponse } from "next/server";
import { getRandomWord, getDailyWord } from "@/lib/words";
import { encryptToken } from "@/lib/token";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mode, length } = body as { mode: string; length: number };

    const wordLength = Math.max(5, Math.min(12, Math.floor(length) || 5));
    let word: string;

    if (mode === "daily") {
      word = getDailyWord(wordLength);
    } else {
      word = getRandomWord(wordLength);
    }

    const token = encryptToken({
      word,
      mode,
      hintsUsed: 0,
      revealedPositions: [] as number[],
    });

    return NextResponse.json({
      token,
      wordLength: word.length,
      mode,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create game" },
      { status: 500 }
    );
  }
}
