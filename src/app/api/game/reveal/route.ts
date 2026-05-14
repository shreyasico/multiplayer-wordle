import { NextResponse } from "next/server";
import { decryptToken } from "@/lib/token";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body as { token: string };

    const data = decryptToken(token);
    if (!data || !data.word) {
      return NextResponse.json({ error: "Invalid game token" }, { status: 400 });
    }

    return NextResponse.json({ word: data.word as string });
  } catch {
    return NextResponse.json(
      { error: "Failed to reveal word" },
      { status: 500 }
    );
  }
}
