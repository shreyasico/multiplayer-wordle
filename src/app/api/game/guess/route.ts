import { NextResponse } from "next/server";
import { evaluateGuess } from "@/lib/game";
import { isValidGuess } from "@/lib/words";
import { decryptToken, encryptToken } from "@/lib/token";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, guess } = body as { token: string; guess: string };

    const data = decryptToken(token);
    if (!data || !data.word) {
      return NextResponse.json({ error: "Invalid game token" }, { status: 400 });
    }

    const word = data.word as string;
    const normalizedGuess = guess.toLowerCase();

    if (normalizedGuess.length !== word.length) {
      return NextResponse.json(
        { error: `Word must be ${word.length} letters` },
        { status: 400 }
      );
    }

    if (!isValidGuess(normalizedGuess)) {
      return NextResponse.json(
        { error: "Not a valid word" },
        { status: 400 }
      );
    }

    const tiles = evaluateGuess(normalizedGuess, word);
    const correct = normalizedGuess === word;

    return NextResponse.json({
      tiles,
      correct,
      // Only reveal the word when the game is over (correct guess or client tracks max guesses)
      word: correct ? word : undefined,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to evaluate guess" },
      { status: 500 }
    );
  }
}
