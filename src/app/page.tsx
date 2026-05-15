"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import WordLengthPicker from "@/components/WordLengthPicker";
import Mascot from "@/components/Mascot";
import ThemePicker from "@/components/ThemePicker";
import { useTheme } from "@/components/ThemeProvider";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const joinParam = searchParams.get("join") || "";
  const { theme } = useTheme();

  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState(joinParam.toUpperCase());
  const [selectedLength, setSelectedLength] = useState(5);
  const [mode, setMode] = useState<"solo" | "daily" | "multiplayer" | "custom">(
    joinParam ? "multiplayer" : "solo"
  );
  const [customWord, setCustomWord] = useState("");
  const [error, setError] = useState("");

  function handleStart() {
    if (!name.trim()) {
      setError("Enter your name");
      return;
    }
    if (mode === "custom" && customWord.trim().length < 5) {
      setError("Custom word must be at least 5 letters");
      return;
    }
    if (mode === "multiplayer" && joinCode.trim()) {
      router.push(
        `/game/${joinCode.trim().toUpperCase()}?name=${encodeURIComponent(name.trim())}`
      );
      return;
    }
    if (mode === "daily") {
      router.push(
        `/game/new?name=${encodeURIComponent(name.trim())}&mode=daily&length=${selectedLength}`
      );
      return;
    }
    if (mode === "custom") {
      router.push(
        `/game/new?name=${encodeURIComponent(name.trim())}&mode=custom&customWord=${encodeURIComponent(customWord.trim().toLowerCase())}`
      );
      return;
    }
    const gameMode = mode === "solo" ? "solo" : "friends";
    router.push(
      `/game/new?name=${encodeURIComponent(name.trim())}&mode=${gameMode}&length=${selectedLength}`
    );
  }

  const modes = [
    { key: "solo" as const, label: "Solo" },
    { key: "daily" as const, label: "Daily" },
    { key: "multiplayer" as const, label: "Friends" },
    { key: "custom" as const, label: "Custom" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="flex justify-center mb-3 animate-float">
            <Mascot size={120} />
          </div>
          <h1
            className="text-4xl sm:text-6xl font-bold tracking-tight mb-2 font-[family-name:var(--font-fredoka)]"
            style={{
              background: "linear-gradient(135deg, #2d7a2d 0%, #4a9e4a 50%, #2d7a2d 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 2px 8px rgba(106, 170, 100, 0.3))",
            }}
          >
            Wordly
          </h1>
          <p style={{ color: theme.textMuted }} className="text-base sm:text-lg font-medium">
            Guess the word — solo or race your friends
          </p>
        </div>

        <div
          className="cute-card backdrop-blur-sm rounded-3xl p-5 sm:p-7 space-y-4 sm:space-y-5 shadow-lg animate-fade-in-up"
          style={{ animationDelay: "100ms", background: theme.cardBg, borderColor: theme.cardBorder, borderWidth: 1 }}
        >
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: theme.textMuted }}>
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="Enter your name"
              maxLength={15}
              className="w-full rounded-2xl px-4 py-3 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              style={{ background: theme.inputBg, borderColor: theme.inputBorder, borderWidth: 1, color: theme.text }}
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-center" style={{ color: theme.textMuted }}>
              Game Mode
            </label>
            <div className="grid grid-cols-4 rounded-xl p-1 gap-1" style={{ background: theme.inputBg }}>
              {modes.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  className={`py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    mode === m.key
                      ? "bg-green-500 text-white shadow-lg shadow-green-500/20 scale-[1.02]"
                      : "hover:scale-[1.04]"
                  }`}
                  style={mode !== m.key ? { color: theme.textMuted } : undefined}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {mode !== "custom" && (
            <WordLengthPicker
              value={selectedLength}
              onChange={setSelectedLength}
              disabled={false}
            />
          )}

          {mode === "custom" && (
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: theme.textMuted }}>
                Set a word for your friends
              </label>
              <input
                type="text"
                value={customWord}
                onChange={(e) => {
                  setCustomWord(e.target.value.toLowerCase().replace(/[^a-z]/g, ""));
                  setError("");
                }}
                placeholder="Enter a word (5-12 letters)"
                maxLength={12}
                className="w-full rounded-xl px-4 py-3 font-mono text-center text-xl tracking-widest placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                style={{ background: theme.inputBg, borderColor: theme.inputBorder, borderWidth: 1, color: theme.text }}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
              />
              <p className="text-xs mt-1.5" style={{ color: theme.textMuted }}>
                Share the room link — friends won't see the word
              </p>
            </div>
          )}

          {mode === "multiplayer" && (
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: theme.textMuted }}>
                Room Code{" "}
                <span style={{ color: theme.textMuted, opacity: 0.6 }}>(leave empty to create)</span>
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase());
                  setError("");
                }}
                placeholder="ROOM CODE"
                maxLength={4}
                className="w-full rounded-xl px-4 py-3 font-mono text-center text-xl tracking-widest uppercase placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                style={{ background: theme.inputBg, borderColor: theme.inputBorder, borderWidth: 1, color: theme.text }}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
              />
            </div>
          )}

          {mode === "daily" && (
            <p className="text-sm text-center" style={{ color: theme.textMuted }}>
              Same word for everyone today — come back tomorrow for a new one!
            </p>
          )}

          {error && (
            <p className="text-red-500 text-sm animate-row-shake">{error}</p>
          )}

          <button
            onClick={handleStart}
            disabled={!name.trim()}
            className="btn-shimmer w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-2xl text-lg transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-green-500/20"
          >
            {mode === "solo"
              ? "Play"
              : mode === "daily"
                ? "Play Daily"
                : mode === "custom"
                  ? "Create Room"
                  : joinCode.trim()
                    ? "Join Room"
                    : "Create Room"}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <div className="text-xs sm:text-sm space-y-1 text-center sm:text-left" style={{ color: theme.textMuted }}>
            <p>Guess the word in 6 tries &middot; 5 to 12 letters</p>
            <p>
              <span className="text-green-600">Green</span> = correct spot,{" "}
              <span className="text-yellow-600">Yellow</span> = wrong spot,{" "}
              <span style={{ color: theme.textMuted }}>Gray</span> = not in word
            </p>
          </div>
          <ThemePicker />
        </div>
      </div>

      <div className="fixed bottom-4 right-4 text-xs animate-fade-in-up z-10" style={{ animationDelay: "300ms", color: theme.textMuted }}>
        made with ❤️ and claude by @shreyasico
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f8f8" }}>
          <p className="text-zinc-500 animate-pulse">Loading...</p>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
