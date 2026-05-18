"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { MAX_GUESSES } from "@/lib/game";
import type { TileData } from "@/lib/game";
import Tile from "./Tile";

interface BoardProps {
  guesses: TileData[][];
  currentGuess: string;
  wordLength: number;
  shaking?: boolean;
  won?: boolean;
}

function getTileSize(wordLength: number, screenWidth: number): number {
  // Use screen width to determine max board width (with padding)
  const maxBoard = Math.min(520, screenWidth - 32);
  const gap = wordLength <= 8 ? 6 : 4;
  const computed = Math.floor((maxBoard - (wordLength - 1) * gap) / wordLength);
  return Math.max(28, Math.min(58, computed));
}

export default function Board({
  guesses,
  currentGuess,
  wordLength,
  shaking,
  won,
}: BoardProps) {
  const [revealingRow, setRevealingRow] = useState(-1);
  const [bounceRow, setBounceRow] = useState(-1);
  const prevGuessCount = useRef(guesses.length);
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 400
  );

  useEffect(() => {
    const onResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (guesses.length > prevGuessCount.current) {
      const newRow = guesses.length - 1;
      setRevealingRow(newRow);

      const revealDuration = wordLength * 350 + 250;
      const t1 = setTimeout(() => {
        setRevealingRow(-1);
        if (won) setBounceRow(newRow);
      }, revealDuration);

      const t2 = won
        ? setTimeout(() => setBounceRow(-1), revealDuration + wordLength * 100 + 600)
        : undefined;

      prevGuessCount.current = guesses.length;
      return () => {
        clearTimeout(t1);
        if (t2) clearTimeout(t2);
      };
    }
    prevGuessCount.current = guesses.length;
  }, [guesses.length, wordLength, won]);

  const tileSize = getTileSize(wordLength, screenWidth);
  const gap = wordLength <= 8 ? 6 : 4;
  const rows: React.ReactNode[] = [];

  for (let i = 0; i < MAX_GUESSES; i++) {
    const tiles: React.ReactNode[] = [];
    const isRevealing = i === revealingRow;
    const isBouncing = i === bounceRow;
    const isCurrentRow = i === guesses.length;
    const isShaking = shaking && isCurrentRow;

    if (i < guesses.length) {
      for (let j = 0; j < wordLength; j++) {
        const tile = guesses[i][j];
        tiles.push(
          <Tile
            key={j}
            letter={tile.letter}
            state={tile.state}
            size={tileSize}
            isRevealing={isRevealing}
            revealDelay={j * 350}
            isBouncing={isBouncing}
            bounceDelay={j * 100}
          />
        );
      }
    } else if (isCurrentRow) {
      for (let j = 0; j < wordLength; j++) {
        tiles.push(
          <Tile
            key={j}
            letter={currentGuess[j] || ""}
            state="empty"
            size={tileSize}
          />
        );
      }
    } else {
      for (let j = 0; j < wordLength; j++) {
        tiles.push(<Tile key={j} state="empty" size={tileSize} />);
      }
    }

    rows.push(
      <div
        key={i}
        className={`flex justify-center ${isShaking ? "animate-row-shake" : ""}`}
        style={{ gap }}
      >
        {tiles}
      </div>
    );
  }

  return (
    <div className="flex flex-col transition-board" style={{ gap }}>
      {rows}
    </div>
  );
}
