"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createSocket } from "@/lib/socket";
import { MAX_GUESSES, updateKeyboardState } from "@/lib/game";
import type { TileData, KeyboardState } from "@/lib/game";
import type { ClientRoomState } from "@/lib/types";
import type { Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "@/lib/types";
import Board from "./Board";
import Keyboard from "./Keyboard";
import OpponentBoard from "./OpponentBoard";
import WordLengthPicker from "./WordLengthPicker";
import Confetti from "./Confetti";
import ThemePicker from "./ThemePicker";
import { useTheme } from "./ThemeProvider";
import { buildShareText } from "@/lib/share";
import { playKeyPress, playDelete, playCorrect, playWin, playWrong, playGameOver, isMuted, setMuted } from "@/lib/sounds";

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface GameProps {
  roomId: string;
  playerName: string;
  mode: "solo" | "friends" | "join" | "daily" | "custom";
  wordLength: number;
  customWord?: string;
}

export default function Game({
  roomId,
  playerName,
  mode,
  wordLength: initialWordLength,
  customWord,
}: GameProps) {
  const { theme } = useTheme();
  const [roomState, setRoomState] = useState<ClientRoomState | null>(null);
  const [actualRoomId, setActualRoomId] = useState(
    roomId === "new" ? "" : roomId
  );
  const [myGuesses, setMyGuesses] = useState<TileData[][]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({});
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);
  const [connected, setConnected] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [won, setWon] = useState(false);
  const [selectedLength, setSelectedLength] = useState(initialWordLength);
  const [copied, setCopied] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(1);
  const [hintMessage, setHintMessage] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [shareText, setShareText] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [soundOff, setSoundOff] = useState(isMuted());

  const socketRef = useRef<GameSocket | null>(null);
  const roundIdRef = useRef(0);

  useEffect(() => {
    const socket = createSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);

      if (roomId === "new") {
        socket.emit(
          "room:create",
          {
            playerName,
            wordLength: initialWordLength,
            autoStart: mode === "solo",
            daily: mode === "daily",
            customWord: mode === "custom" ? customWord : undefined,
          },
          (newRoomId) => {
            setActualRoomId(newRoomId);
            setJoined(true);
          }
        );
      } else {
        socket.emit("room:join", { roomId, playerName }, (ok, err) => {
          if (ok) {
            setJoined(true);
          } else {
            setError(err || "Failed to join room");
          }
        });
      }
    });

    socket.on("room:state", (state) => {
      setRoomState(state);
      setActualRoomId(state.roomId);
      setSelectedLength(state.wordLength);

      if (state.roundId !== roundIdRef.current) {
        roundIdRef.current = state.roundId;
        setMyGuesses([]);
        setCurrentGuess("");
        setKeyboardState({});
        setWon(false);
        setHintsRemaining(1);
        setHintMessage("");
        setShowConfetti(false);
        setShareText("");
        setShareCopied(false);
      }
    });

    socket.on("game:guess-result", ({ tiles, correct }) => {
      setMyGuesses((prev) => {
        const next = [...prev, tiles];
        if (correct) {
          playWin();
          setShowConfetti(true);
          setShareText(buildShareText(next, true, tiles.length, MAX_GUESSES, mode));
        } else {
          playCorrect();
          const isLastGuess = next.length >= MAX_GUESSES;
          if (isLastGuess && !correct) {
            playGameOver();
            setShareText(buildShareText(next, false, tiles.length, MAX_GUESSES, mode));
          }
        }
        return next;
      });
      setKeyboardState((prev) => updateKeyboardState(prev, tiles));
      setCurrentGuess("");
      if (correct) setWon(true);
    });

    socket.on("room:error", (msg) => {
      setError(msg);
      setCurrentGuess("");
      setShaking(true);
      playWrong();
      setTimeout(() => setShaking(false), 500);
      setTimeout(() => setError(""), 3000);
    });

    socket.on("game:hint-result", ({ position, letter, hintsRemaining, isVowel }) => {
      setHintsRemaining(hintsRemaining);
      const ordinal =
        position === 0
          ? "1st"
          : position === 1
            ? "2nd"
            : position === 2
              ? "3rd"
              : `${position + 1}th`;
      const type = isVowel ? "vowel" : "consonant";
      setHintMessage(
        `The ${ordinal} letter is "${letter.toUpperCase()}" (${type})`
      );
      setKeyboardState((prev) => {
        if (!prev[letter] || prev[letter] === "empty") {
          return { ...prev, [letter]: "hinted" };
        }
        return prev;
      });
      setTimeout(() => setHintMessage(""), 4000);
    });

    socket.connect();

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, playerName, mode, initialWordLength, customWord]);

  const wordLength = roomState?.wordLength ?? selectedLength;

  const handleKey = useCallback(
    (key: string) => {
      const socket = socketRef.current;
      if (!socket) return;
      if (!roomState?.gameStarted || roomState.roundOver) return;

      const me = roomState.players.find((p) => p.id === socket.id);
      if (me?.solved || (me && me.guesses.length >= MAX_GUESSES)) return;

      if (key === "Enter") {
        if (currentGuess.length === wordLength) {
          socket.emit("game:guess", currentGuess);
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
    [currentGuess, roomState, wordLength]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      handleKey(e.key);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKey]);

  const socket = socketRef.current;

  const copyInviteLink = () => {
    if (!actualRoomId) return;
    const url = `${window.location.origin}/?join=${actualRoomId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  };

  if (!joined && error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center animate-fade-in-scale cute-card rounded-2xl p-8" style={{ background: theme.cardBg, borderColor: theme.cardBorder, borderWidth: 1 }}>
          <p className="text-4xl mb-3">😿</p>
          <p className="text-red-500 text-xl mb-4 font-medium">{error}</p>
          <a href="/" className="text-green-600 font-semibold hover:text-green-700 transition-colors">
            Back to lobby
          </a>
        </div>
      </div>
    );
  }

  if (!roomState || !socket || !connected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="text-4xl animate-float">🟩</div>
          <p style={{ color: theme.textMuted }} className="animate-pulse font-medium">Connecting...</p>
        </div>
      </div>
    );
  }

  const myId = socket.id;
  const isHost = roomState.players[0]?.id === myId;
  const me = roomState.players.find((p) => p.id === myId);
  const opponents = roomState.players.filter((p) => p.id !== myId);
  const isSolo = roomState.players.length === 1;
  const isSolved = me?.solved ?? false;
  const isOutOfGuesses = (me?.guesses.length ?? 0) >= MAX_GUESSES;
  const inputDisabled =
    !roomState.gameStarted ||
    roomState.roundOver ||
    isSolved ||
    isOutOfGuesses;
  const isDaily = roomState.gameMode === "daily";
  const isCustom = roomState.gameMode === "custom";

  const handleSetWordLength = (len: number) => {
    setSelectedLength(len);
    socket.emit("room:set-word-length", len);
  };

  const handleStart = () => {
    socket.emit("game:start", selectedLength);
  };

  const handlePlayAgain = () => {
    socket.emit("game:play-again", selectedLength);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {showConfetti && <Confetti />}
      <header
        className="border-b py-3 px-4 flex items-center justify-between backdrop-blur-sm"
        style={{ background: theme.headerBg, borderColor: theme.headerBorder }}
      >
        <a
          href="/"
          className="text-xl font-bold tracking-wide hover:text-green-600 transition-colors font-[family-name:var(--font-fredoka)] flex items-center gap-1.5"
        >
          <span className="animate-gentle-bounce inline-block">🟩</span> Wordly
        </a>
        <div className="flex items-center gap-3">
          {actualRoomId && !isDaily && (
            <button
              onClick={copyInviteLink}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all active:scale-95"
              style={{ background: theme.inputBg }}
            >
              {copied ? (
                <span className="text-green-600">Copied!</span>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    style={{ color: theme.textMuted }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                  <span style={{ color: theme.textMuted }}>Invite 📨</span>
                </>
              )}
            </button>
          )}
          {isDaily && (
            <span className="text-sm font-medium px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700">
              📅 Daily
            </span>
          )}
          {isCustom && (
            <span className="text-sm font-medium px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
              ✨ Custom
            </span>
          )}
          <span className="text-sm" style={{ color: theme.textMuted }}>
            Room:{" "}
            <span className="font-mono font-bold" style={{ color: theme.text }}>
              {actualRoomId || "..."}
            </span>
          </span>
          <div className="h-4 w-px" style={{ background: theme.headerBorder }} />
          <span className="text-sm" style={{ color: theme.textMuted }}>
            {roomState.players.length} player
            {roomState.players.length !== 1 ? "s" : ""}
          </span>
          {roomState.gameStarted && (
            <>
              <div className="h-4 w-px" style={{ background: theme.headerBorder }} />
              <span className="text-sm" style={{ color: theme.textMuted }}>
                {wordLength} letters
              </span>
            </>
          )}
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
              <svg className="w-5 h-5" style={{ color: theme.textMuted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-5 h-5" style={{ color: theme.textMuted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
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

      <div className="flex-1 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 p-4">
        {opponents.length > 0 && (
          <div className="flex lg:flex-col flex-wrap gap-2 justify-center">
            {opponents.map((op) => (
              <OpponentBoard
                key={op.id}
                name={op.name}
                guesses={op.guesses}
                solved={op.solved}
                isWinner={op.id === roomState.winnerId}
                wordLength={wordLength}
              />
            ))}
          </div>
        )}

        <div className="flex flex-col items-center gap-4">
          {!roomState.gameStarted && !roomState.roundOver && (
            <div className="text-center mb-4 animate-fade-in-up cute-card rounded-2xl p-6" style={{ background: theme.cardBg, borderColor: theme.cardBorder, borderWidth: 1 }}>
              <p style={{ color: theme.textMuted }} className="mb-2 text-lg">Waiting for players... 👀</p>
              <p className="text-sm mb-3" style={{ color: theme.textMuted }}>
                Share room code:{" "}
                <span className="font-mono text-lg font-bold" style={{ color: theme.text }}>
                  {actualRoomId || "..."}
                </span>
              </p>

              <button
                onClick={copyInviteLink}
                className="mb-5 flex items-center gap-2 mx-auto px-4 py-2 rounded-xl transition-all active:scale-95"
                style={{ background: theme.inputBg, color: theme.textMuted }}
              >
                {copied ? (
                  <span className="text-green-600">Link copied!</span>
                ) : (
                  <>
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
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      />
                    </svg>
                    Copy Invite Link
                  </>
                )}
              </button>

              {isHost && (
                <>
                  <WordLengthPicker
                    value={selectedLength}
                    onChange={handleSetWordLength}
                    disabled={false}
                  />
                  {roomState.players.length >= 1 && (
                    <button
                      onClick={handleStart}
                      className="btn-shimmer mt-5 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-2xl text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-500/20"
                    >
                      Start Game 🎮
                    </button>
                  )}
                </>
              )}

              {!isHost && (
                <div className="text-sm space-y-2" style={{ color: theme.textMuted }}>
                  <p>
                    Word length:{" "}
                    <span className="font-bold" style={{ color: theme.text }}>
                      {wordLength} letters
                    </span>
                  </p>
                  <p>Waiting for host to start...</p>
                </div>
              )}
            </div>
          )}

          {roomState.roundOver && (
            <div className="text-center mb-4 animate-fade-in-scale cute-card rounded-2xl p-6" style={{ background: theme.cardBg, borderColor: theme.cardBorder, borderWidth: 1 }}>
              {roomState.winnerId ? (
                <p className="text-2xl font-bold mb-1 font-[family-name:var(--font-fredoka)]">
                  {roomState.winnerId === myId ? (
                    <span className="text-green-600 animate-sparkle-in inline-block">🎉 You won!</span>
                  ) : (
                    <span className="text-yellow-600">
                      🏆 {roomState.winnerName} won!
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-2xl font-bold mb-1 font-[family-name:var(--font-fredoka)]" style={{ color: theme.textMuted }}>
                  {isSolo || isDaily ? "Better luck next time! 💪" : "No one solved it! 😅"}
                </p>
              )}
              <p className="mb-4" style={{ color: theme.textMuted }}>
                The word was:{" "}
                <span className="font-bold uppercase tracking-widest text-lg" style={{ color: theme.text }}>
                  {roomState.word}
                </span>
              </p>

              <div className="flex items-center gap-3 justify-center mb-4">
                {shareText && (
                  <button
                    onClick={handleShare}
                    className="btn-shimmer flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-5 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-500/20"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    {shareCopied ? "Copied!" : "Share Result"}
                  </button>
                )}
              </div>

              {(isHost || isSolo) && !isDaily && (
                <>
                  <WordLengthPicker
                    value={selectedLength}
                    onChange={setSelectedLength}
                    disabled={false}
                  />
                  <button
                    onClick={handlePlayAgain}
                    className="btn-shimmer mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-6 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-500/20"
                  >
                    Play Again 🔄
                  </button>
                </>
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

          {roomState.gameStarted && !roomState.roundOver && !isSolved && !isOutOfGuesses && (
            <button
              onClick={() => socketRef.current?.emit("game:hint")}
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
    </div>
  );
}
