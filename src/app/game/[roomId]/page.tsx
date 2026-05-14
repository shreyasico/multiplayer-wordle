"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import Game from "@/components/Game";

function GameContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const playerName = searchParams.get("name") || "";
  const mode = (searchParams.get("mode") || "join") as
    | "solo"
    | "friends"
    | "join"
    | "daily"
    | "custom";
  const length = parseInt(searchParams.get("length") || "5", 10);
  const customWord = searchParams.get("customWord") || "";

  useEffect(() => {
    if (!playerName && roomId !== "new") {
      router.replace(`/?join=${roomId}`);
    }
  }, [playerName, roomId, router]);

  if (!playerName) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f8f8" }}>
        <p className="text-zinc-500 animate-pulse">Redirecting...</p>
      </div>
    );
  }

  return (
    <Game
      roomId={roomId}
      playerName={playerName}
      mode={mode}
      wordLength={length}
      customWord={customWord}
    />
  );
}

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f8f8" }}>
          <p className="text-zinc-500 animate-pulse">Loading...</p>
        </div>
      }
    >
      <GameContent />
    </Suspense>
  );
}
