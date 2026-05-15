"use client";

import { useEffect, useState } from "react";
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
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 400
  );

  useEffect(() => {
    const onResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Calculate key sizes based on screen width
  // 10 keys + 9 gaps (4px each) in widest row
  const maxKeyboardWidth = Math.min(500, screenWidth - 16);
  const keyGap = screenWidth < 380 ? 3 : 4;
  const keyWidth = Math.floor((maxKeyboardWidth - 9 * keyGap) / 10);
  const keyHeight = Math.min(58, Math.max(42, keyWidth * 1.4));
  const wideKeyWidth = Math.floor(keyWidth * 1.5);
  const fontSize = screenWidth < 380 ? 11 : 13;

  return (
    <div className="flex flex-col items-center" style={{ gap: keyGap }}>
      {ROWS.map((row, i) => (
        <div key={i} className="flex" style={{ gap: keyGap }}>
          {row.map((key) => {
            const state = keyboardState[key] || "unused";
            const isWide = key === "Enter" || key === "⌫";
            return (
              <button
                key={key}
                onClick={() => onKey(key)}
                disabled={disabled}
                className={`key-base ${disabled ? "opacity-40 cursor-not-allowed" : "hover:brightness-110"}`}
                style={{
                  ...getKeyStyle(state),
                  width: isWide ? wideKeyWidth : keyWidth,
                  height: keyHeight,
                  fontSize: isWide ? fontSize - 1 : fontSize,
                }}
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
