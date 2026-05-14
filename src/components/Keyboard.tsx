"use client";

import type { KeyboardState, LetterState } from "@/lib/game";

const ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["Enter", "z", "x", "c", "v", "b", "n", "m", "⌫"],
];

function getKeyStyle(state: LetterState | "unused"): React.CSSProperties {
  switch (state) {
    case "correct":
      return { backgroundColor: "#22c55e", color: "#fff", boxShadow: "0 2px 8px rgba(34,197,94,0.3)" };
    case "present":
      return { backgroundColor: "#eab308", color: "#fff", boxShadow: "0 2px 8px rgba(234,179,8,0.3)" };
    case "hinted":
      return { backgroundColor: "#60a5fa", color: "#fff", boxShadow: "0 2px 8px rgba(96,165,250,0.3)" };
    case "absent":
      return { backgroundColor: "var(--key-absent-bg)", color: "var(--key-absent-text)" };
    default:
      return { backgroundColor: "var(--key-bg)", color: "var(--key-text)" };
  }
}

interface KeyboardProps {
  keyboardState: KeyboardState;
  onKey: (key: string) => void;
  disabled?: boolean;
}

export default function Keyboard({
  keyboardState,
  onKey,
  disabled,
}: KeyboardProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      {ROWS.map((row, i) => (
        <div key={i} className="flex gap-1">
          {row.map((key) => {
            const state = keyboardState[key] || "unused";
            const isWide = key === "Enter" || key === "⌫";
            return (
              <button
                key={key}
                onClick={() => onKey(key)}
                disabled={disabled}
                className={`key-base ${isWide ? "px-3 text-xs" : "w-9"} h-14 ${disabled ? "opacity-40 cursor-not-allowed" : "hover:brightness-110"}`}
                style={getKeyStyle(state)}
              >
                {key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
