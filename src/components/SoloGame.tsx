"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { MAX_GUESSES, updateKeyboardState } from "@/lib/game";
import type { TileData, KeyboardState } from "@/lib/game";
import Board from "./Board";
import Keyboard from "./Keyboard";
import Confetti from "./Confetti";
import ThemePicker from "./ThemePicker";
import { useTheme } from "./ThemeProvider";
import { buildShareText } from "@/lib/share";
import {
  playKeyPress,
  playDelete,
  playCorrect,
  playWin,
  playWrong,
  playGameOver,
  isMuted,
  setMuted,
} from "@/lib/sounds";

interface SoloGameProps {
  playerName: string;
  mode: "solo" | "daily";
  wordLength: number;
}

export default function SoloGame({
  playerName,
  mode,
  wordLength: initialWordLength,
}: SoloGameProps) {
  const { theme } = useTheme();
  const [token, setToken] = useState("");
  const [wordLength, setWordLength] = useState(initialWordLength);
  const [myGuesses, setMyGuesses] = useState<TileData[][]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [shaking, setShaking] = useState(false);
  const [won, setWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [revealedWord, setRevealedWord] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [shareText, setShareText] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [soundOff, setSoundOff] = useState(isMuted());
  const [hintsRemaining, setHintsRemaining] = useState(1);
  const [hintMessage, setHintMessage] = useState("");

  const guessesRef = useRef<TileData[][]>([]);

  // Start a new game
  const startGame = useCallback(
    async (length: number) => {
      setLoading(true);
      try {
        const res = await fetch("/api/game/new", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode, length }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        setToken(data.token);
        setWordLength(data.wordLength);
        setMyGuesses([]);
        guessesRef.current = [];
        setCurrentGuess("");
        setKeyboardState({});
        setWon(false);
        setGameOver(false);
        setRevealedWord("");
        setShowConfetti(false);
        setShareText("");
        setShareCopied(false);
        setHintsRemaining(1);
        setHintMessage("");
        setError("");
      } catch {
        setError("Failed to start game");
      }
      setLoading(false);
    },
    [mode]
  );

  useEffect(() => {
    startGame(initialWordLength);
  }, [startGame, initialWordLength]);

  // Submit a guess
  const submitGuess = useCallback(async () => {
    if (!token || currentGuess.length !== wordLength) return;

    try {
      const res = await fetch("/api/game/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, guess: currentGuess }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid guess");
        setShaking(true);
        playWrong();
        setTimeout(() => setShaking(false), 500);
        setTimeout(() => setError(""), 3000);
        return;
      }

      const tiles = data.tiles as TileData[];
      const correct = data.correct as boolean;

      setMyGuesses((prev) => {
        const next = [...prev, tiles];
        guessesRef.current = next;

        if (correct) {
          playWin();
          setShowConfetti(true);
          setShareText(
            buildShareText(next, true, wordLength, MAX_GUESSES, mode)
          );
          setWon(true);
          setGameOver(true);
          if (data.word) setRevealedWord(data.word);
        } else {
          playCorrect();
          if (next.length >= MAX_GUESSES) {
            playGameOver();
            setShareText(
              buildShareText(next, false, wordLength, MAX_GUESSES, mode)
            );
            setGameOver(true);
            // Reveal the word
            revealWord();
          }
        }
        return next;
      });

      setKeyboardState((prev) => updateKeyboardState(prev, tiles));
      setCurrentGuess("");
    } catch {
      setError("Network error");
      setTimeout(() => setError(""), 3000);
    }
  }, [token, currentGuess, wordLength, mode]);

  // Reveal word when game is lost
  const revealWord = async () => {
    try {
      const res = await fetch("/api/game/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.word) setRevealedWord(data.word);
    } catch {
      // ignore
    }
  };

  // Request a hint
  const requestHint = async () => {
    if (!token || hintsRemaining <= 0) return;
    try {
      const res = await fetch("/api/game/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, guesses: guessesRef.current }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No hints available");
        setTimeout(() => setError(""), 3000);
        return;
      }

      if (data.token) setToken(data.token);
      setHintsRemaining(data.hintsRemaining);

      const pos = data.position as number;
      const letter = data.letter as string;
      const isVowel = data.isVowel as boolean;
      const ordinal =
        pos === 0 ? "1st" : pos === 1 ? "2nd" : pos === 2 ? "3rd" : `${pos + 1}th`;
      const type = isVowel ? "vowel" : "consonant";
      setHintMessage(`The ${ordinal} letter is "${letter.toUpperCase()}" (${type})`);
      setTimeout(() => setHintMessage(""), 4000);

      setKeyboardState((prev) => {
        if (!prev[letter] || prev[letter] === "empty") {
          return { ...prev, [letter]: "hinted" };
        }
        return prev;
      });
    } catch {
      setError("Network error");
      setTimeout(() => setError(""), 3000);
    }
  };

  // Handle keyboard input
  const handleKey = useCallback(
    (key: string) => {
      if (gameOver) return;

      if (key === "Enter") {
        if (currentGuess.length === wordLength) {
          submitGuess();
        }
        return;
      }
      if (key === "⌫" || key === "Backspace") {
        setCurrentGuess((prev) => prev.slice(0, -1));
        playDelete();
        return;
      }
      if (/^[a-zA-Z]$/.test(key) && currentGuess.length < wordLength) {
        setCurrentGuess((prev) => prev + key.toLowerCase());
        playKeyPress();
      }
    },
    [currentGuess, wordLength, gameOver, submitGuess]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      handleKey(e.key);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKey]);

  const handleShare = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  };

  const handlePlayAgain = () => {
    startGame(wordLength);
  };

  const isDaily = mode === "daily";
  const isOutOfGuesses = myGuesses.length >= MAX_GUESSES;
  const inputDisabled = gameOver || won || isOutOfGuesses;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="text-4xl animate-float">🟩</div>
          <p
            style={{ color: theme.textMuted }}
            className="animate-pulse font-medium"
          >
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {showConfetti && <Confetti />}
      <header
        className="border-b py-2.5 sm:py-3 px-3 sm:px-4 flex items-center justify-between backdrop-blur-sm"
        style={{
          background: theme.headerBg,
          borderColor: theme.headerBorder,
        }}
      >
        <a
          href="/"
          className="text-base sm:text-xl font-bold tracking-wide hover:text-green-600 transition-colors font-[family-name:var(--font-fredoka)] flex items-center gap-1 sm:gap-1.5"
        >
          <span className="animate-gentle-bounce inline-block">🟩</span> Wordly
        </a>
        <div className="flex items-center gap-2 sm:gap-3">
          {isDaily && (
            <span className="text-xs sm:text-sm font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-yellow-100 text-yellow-700">
              📅 Daily
            </span>
          )}
          <span className="text-xs sm:text-sm" style={{ color: theme.textMuted }}>
            {wordLength} letters
          </span>
          <button
            onClick={() => {
              const next = !soundOff;
              setSoundOff(next);
              setMuted(next);
            }}
            className="p-1.5 rounded-lg transition-all active:scale-95"
            style={{ background: theme.inputBg }}
            title={soundOff ? "Unmute" : "Mute"}
          >
            {soundOff ? (
              <svg
                className="w-5 h-5"
                style={{ color: theme.textMuted }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                style={{ color: theme.textMuted }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
            )}
          </button>
          <ThemePicker />
        </div>
      </header>

      {error && (
        <div className="bg-red-50 text-red-600 text-center py-2.5 text-sm font-medium animate-fade-in-up border-b border-red-100">
          😬 {error}
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center gap-3 sm:gap-4 p-3 sm:p-4">
        {gameOver && (
          <div
            className="text-center mb-3 sm:mb-4 animate-fade-in-scale cute-card rounded-2xl p-4 sm:p-6 mx-2"
            style={{
              background: theme.cardBg,
              borderColor: theme.cardBorder,
              borderWidth: 1,
            }}
          >
            {won ? (
              <p className="text-xl sm:text-2xl font-bold mb-1 font-[family-name:var(--font-fredoka)]">
                <span className="text-green-600 animate-sparkle-in inline-block">
                  🎉 You won!
                </span>
              </p>
            ) : (
              <p
                className="text-xl sm:text-2xl font-bold mb-1 font-[family-name:var(--font-fredoka)]"
                style={{ color: theme.textMuted }}
              >
                Better luck next time! 💪
              </p>
            )}
            {revealedWord && (
              <p className="mb-4" style={{ color: theme.textMuted }}>
                The word was:{" "}
                <span
                  className="font-bold uppercase tracking-widest text-lg"
                  style={{ color: theme.text }}
                >
                  {revealedWord}
                </span>
              </p>
            )}
            <div className="flex items-center gap-3 justify-center mb-4">
              {shareText && (
                <button
                  onClick={handleShare}
                  className="btn-shimmer flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-5 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-500/20"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  {shareCopied ? "Copied!" : "Share Result"}
                </button>
              )}
            </div>
            {!isDaily && (
              <button
                onClick={handlePlayAgain}
                className="btn-shimmer bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-6 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-500/20"
              >
                Play Again 🔄
              </button>
            )}
            {isDaily && (
              <p className="text-sm mt-2" style={{ color: theme.textMuted }}>
                Come back tomorrow for a new daily challenge! 🌅
              </p>
            )}
          </div>
        )}

        {hintMessage && (
          <div className="bg-blue-100 text-blue-700 px-4 py-2.5 rounded-2xl text-sm font-medium animate-fade-in-scale shadow-sm">
            💡 {hintMessage}
          </div>
        )}

        <Board
          guesses={myGuesses}
          currentGuess={currentGuess}
          wordLength={wordLength}
          shaking={shaking}
          won={won}
        />

        {!gameOver && !won && !isOutOfGuesses && (
          <button
            onClick={requestHint}
            disabled={hintsRemaining <= 0}
            className="flex items-center gap-1.5 bg-blue-100 hover:bg-blue-200 disabled:opacity-40 disabled:cursor-not-allowed text-blue-700 px-4 py-2 rounded-2xl text-sm font-medium transition-all active:scale-95 hover:scale-[1.03] shadow-sm"
          >
            💡 Hint ({hintsRemaining}/1)
          </button>
        )}

        <div className="mt-2">
          <Keyboard
            keyboardState={keyboardState}
            onKey={handleKey}
            disabled={inputDisabled}
          />
        </div>
      </div>
    </div>
  );
}
