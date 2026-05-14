import { NextResponse } from "next/server";
import { decryptToken, encryptToken } from "@/lib/token";
import type { TileData } from "@/lib/game";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, guesses } = body as {
      token: string;
      guesses: TileData[][];
    };

    const data = decryptToken(token);
    if (!data || !data.word) {
      return NextResponse.json({ error: "Invalid game token" }, { status: 400 });
    }

    const word = data.word as string;
    const hintsUsed = (data.hintsUsed as number) || 0;
    const revealedPositions = (data.revealedPositions as number[]) || [];
    const maxHints = 1;

    if (hintsUsed >= maxHints) {
      return NextResponse.json({ error: "No hints remaining" }, { status: 400 });
    }

    // Find positions already known
    const knownPositions = new Set(revealedPositions);
    for (const guess of guesses) {
      guess.forEach((tile, i) => {
        if (tile.state === "correct") knownPositions.add(i);
      });
    }

    const unrevealed: number[] = [];
    for (let i = 0; i < word.length; i++) {
      if (!knownPositions.has(i)) unrevealed.push(i);
    }

    if (unrevealed.length === 0) {
      return NextResponse.json({ error: "No more positions to reveal" }, { status: 400 });
    }

    const pos = unrevealed[Math.floor(Math.random() * unrevealed.length)];
    const newRevealedPositions = [...revealedPositions, pos];
    const newHintsUsed = hintsUsed + 1;

    // Return updated token with new hint state
    const newToken = encryptToken({
      word,
      mode: data.mode,
      hintsUsed: newHintsUsed,
      revealedPositions: newRevealedPositions,
    });

    const letter = word[pos];
    const isVowel = "aeiou".includes(letter);

    return NextResponse.json({
      token: newToken,
      position: pos,
      letter,
      hintsRemaining: maxHints - newHintsUsed,
      isVowel,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to get hint" },
      { status: 500 }
    );
  }
}
