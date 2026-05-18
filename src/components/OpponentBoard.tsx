"use client";

import { MAX_GUESSES } from "@/lib/game";
import type { TileData, LetterState } from "@/lib/game";
import { useTheme } from "./ThemeProvider";

const miniColors: Record<LetterState, string> = {
  correct: "#22c55e",
  present: "#eab308",
  absent: "#787c7e",
  empty: "transparent",
  hinted: "#60a5fa",
};

interface OpponentBoardProps {
  name: string;
  guesses: TileData[][];
  solved: boolean;
  isWinner: boolean;
  wordLength: number;
}

export default function OpponentBoard({
  name,
  guesses,
  solved,
  isWinner,
  wordLength,
}: OpponentBoardProps) {
  const { theme } = useTheme();
  const miniSize = wordLength <= 8 ? 4 : 3;
  const miniGap = 1;

  return (
    <div
      className={`cute-card flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 ${
        isWinner ? "ring-2 ring-green-500 animate-pulse-glow" : ""
      }`}
      style={{
        background: isWinner ? "rgba(34,197,94,0.1)" : theme.opponentBg,
        borderWidth: isWinner ? 0 : 1,
        borderColor: theme.cardBorder,
      }}
    >
      <span
        className="text-xs font-semibold truncate max-w-[90px]"
        style={{ color: solved ? "#22c55e" : theme.textMuted }}
      >
        {name}
        {isWinner && " 👑"}
      </span>
      <div className="flex flex-col" style={{ gap: miniGap }}>
        {Array.from({ length: MAX_GUESSES }, (_, i) => (
          <div key={i} className="flex" style={{ gap: miniGap }}>
            {Array.from({ length: wordLength }, (_, j) => {
              const tile = guesses[i]?.[j];
              const bg = tile ? miniColors[tile.state] : "transparent";
              return (
                <div
                  key={j}
                  className="rounded-sm"
                  style={{
                    width: miniSize * 4,
                    height: miniSize * 4,
                    backgroundColor: bg,
                    border: !tile ? `1px solid ${theme.tileEmpty}` : "none",
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
