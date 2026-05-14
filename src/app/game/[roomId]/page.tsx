"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import SoloGame from "@/components/SoloGame";

function GameContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const playerName = searchParams.get("name") || "";
  const mode = (searchParams.get("mode") || "solo") as
    | "solo"
    | "friends"
    | "join"
    | "daily"
    | "custom";
  const length = parseInt(searchParams.get("length") || "5", 10);

  useEffect(() => {
    if (!playerName && roomId !== "new") {
      router.replace(`/`);
    }
  }, [playerName, roomId, router]);

  if (!playerName) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#f8f8f8" }}
      >
        <p className="text-zinc-500 animate-pulse">Redirecting...</p>
      </div>
    );
  }

  // Solo and Daily modes use the API-based SoloGame (works on Vercel)
  if (mode === "solo" || mode === "daily") {
    return (
      <SoloGame playerName={playerName} mode={mode} wordLength={length} />
    );
  }

  // Multiplayer modes need WebSocket server (not available on Vercel)
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <p className="text-4xl mb-4">🏗️</p>
        <h2 className="text-2xl font-bold mb-2">Multiplayer Coming Soon</h2>
        <p className="text-zinc-500 mb-6">
          Multiplayer mode requires a real-time server which isn&apos;t available
          on this deployment. Solo and Daily modes work great though!
        </p>
        <a
          href="/"
          className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-2xl transition-all hover:scale-105 active:scale-95"
        >
          Play Solo or Daily
        </a>
      </div>
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "#f8f8f8" }}
        >
          <p className="text-zinc-500 animate-pulse">Loading...</p>
        </div>
      }
    >
      <GameContent />
    </Suspense>
  );
}
