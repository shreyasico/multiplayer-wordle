"use client";

import { useEffect, useState, useRef } from "react";
import type { LetterState } from "@/lib/game";

const stateClass: Record<LetterState, string> = {
  correct: "tile-correct",
  present: "tile-present",
  absent: "tile-absent",
  empty: "tile-empty",
  hinted: "tile-correct",
};

interface TileProps {
  letter?: string;
  state: LetterState;
  size: number;
  isRevealing?: boolean;
  revealDelay?: number;
  isBouncing?: boolean;
  bounceDelay?: number;
}

export default function Tile({
  letter,
  state,
  size,
  isRevealing,
  revealDelay = 0,
  isBouncing,
  bounceDelay = 0,
}: TileProps) {
  const [showColor, setShowColor] = useState(!isRevealing && state !== "empty");
  const [flipPhase, setFlipPhase] = useState<"none" | "in" | "out">("none");
  const [popping, setPopping] = useState(false);
  const prevLetter = useRef(letter);

  useEffect(() => {
    if (!isRevealing || state === "empty") {
      if (state !== "empty") setShowColor(true);
      return;
    }
    // Phase 1: flip tile to edge (0 → -90deg) over 250ms
    const t1 = setTimeout(() => setFlipPhase("in"), revealDelay);
    // Phase 2: at midpoint, swap color and flip back (-90deg → 0) over 250ms
    const t2 = setTimeout(() => {
      setShowColor(true);
      setFlipPhase("out");
    }, revealDelay + 250);
    // Done: clear flip state
    const t3 = setTimeout(() => setFlipPhase("none"), revealDelay + 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isRevealing, revealDelay, state]);

  useEffect(() => {
    if (letter && !prevLetter.current && state === "empty") {
      setPopping(true);
      const t = setTimeout(() => setPopping(false), 100);
      return () => clearTimeout(t);
    }
    prevLetter.current = letter;
  }, [letter, state]);

  const colorClass =
    showColor && state !== "empty" ? stateClass[state] : stateClass.empty;
  const filledClass =
    !showColor && letter && state === "empty" ? "tile-filled" : "";

  let animClass = "";
  if (flipPhase === "in") animClass = "animate-tile-flip-in";
  else if (flipPhase === "out") animClass = "animate-tile-flip-out";
  else if (popping) animClass = "animate-tile-pop";

  return (
    <div
      className={`tile-base ${colorClass} ${filledClass} ${animClass}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(12, size * 0.45),
        animationDelay: isBouncing ? `${bounceDelay}ms` : undefined,
      }}
    >
      {isBouncing && (
        <div
          className="animate-tile-bounce absolute inset-0 flex items-center justify-center"
          style={{ animationDelay: `${bounceDelay}ms` }}
        >
          {letter?.toUpperCase() || ""}
        </div>
      )}
      {!isBouncing && (letter?.toUpperCase() || "")}
    </div>
  );
}
