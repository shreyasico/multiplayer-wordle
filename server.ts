import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { evaluateGuess, MAX_GUESSES } from "./src/lib/game";
import type { TileData } from "./src/lib/game";
import {
  getRandomWord,
  getDailyWord,
  isValidGuess,
  isValidWord,
  MIN_LENGTH,
  MAX_LENGTH,
} from "./src/lib/words";
import type {
  RoomState,
  ClientRoomState,
  ClientPlayerState,
  ServerToClientEvents,
  ClientToServerEvents,
} from "./src/lib/types";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const rooms = new Map<string, RoomState>();
const playerRooms = new Map<string, string>();

function generateRoomId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 4; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return rooms.has(id) ? generateRoomId() : id;
}

function clampWordLength(len: number): number {
  return Math.max(MIN_LENGTH, Math.min(MAX_LENGTH, Math.floor(len) || 5));
}

function removePlayerFromCurrentRoom(socketId: string, io: Server) {
  const oldRoomId = playerRooms.get(socketId);
  if (!oldRoomId) return;
  const oldRoom = rooms.get(oldRoomId);
  if (oldRoom) {
    delete oldRoom.players[socketId];
    if (Object.keys(oldRoom.players).length === 0) {
      rooms.delete(oldRoomId);
    } else {
      broadcastRoomState(io, oldRoom);
    }
  }
  playerRooms.delete(socketId);
}

function toClientState(room: RoomState, revealWord = false): ClientRoomState {
  const players: ClientPlayerState[] = Object.values(room.players).map(
    (p) => ({
      id: p.id,
      name: p.name,
      guesses: p.guesses,
      solved: p.solved,
    })
  );

  return {
    roomId: room.roomId,
    players,
    gameStarted: room.gameStarted,
    roundOver: room.roundOver,
    roundId: room.roundId,
    wordLength: room.wordLength,
    winnerId: room.winnerId,
    winnerName: room.winnerId ? room.players[room.winnerId]?.name : undefined,
    word: revealWord ? room.word : undefined,
    countdown: room.countdown,
    gameMode: room.gameMode,
  };
}

function broadcastRoomState(io: Server, room: RoomState) {
  const state = toClientState(room, room.roundOver);
  io.to(room.roomId).emit("room:state", state);
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server<ClientToServerEvents, ServerToClientEvents>(
    httpServer,
    { cors: { origin: "*" } }
  );

  io.on("connection", (socket) => {
    socket.on("room:create", ({ playerName, wordLength, autoStart, daily, customWord }, cb) => {
      removePlayerFromCurrentRoom(socket.id, io);

      const roomId = generateRoomId();
      const playerId = socket.id;
      const wl = clampWordLength(wordLength ?? 5);

      let word: string;
      let gameMode: RoomState["gameMode"] = "solo";

      if (daily) {
        word = getDailyWord(wl);
        gameMode = "daily";
      } else if (customWord && customWord.trim().length >= MIN_LENGTH && customWord.trim().length <= MAX_LENGTH) {
        word = customWord.trim().toLowerCase();
        gameMode = "custom";
      } else {
        word = getRandomWord(wl);
      }

      const effectiveLength = (gameMode === "custom") ? word.length : wl;

      const room: RoomState = {
        roomId,
        players: {
          [playerId]: {
            id: playerId,
            name: playerName.trim().slice(0, 15) || "Player",
            guesses: [],
            solved: false,
            hintsUsed: 0,
            revealedPositions: [],
          },
        },
        gameStarted: false,
        roundOver: false,
        roundId: 1,
        wordLength: effectiveLength,
        word,
        gameMode,
      };

      rooms.set(roomId, room);
      playerRooms.set(playerId, roomId);
      socket.join(roomId);
      cb(roomId);

      if (autoStart || daily) {
        room.gameStarted = true;
        room.roundId++;
        if (!daily && gameMode !== "custom") {
          room.word = getRandomWord(room.wordLength);
        }
      }

      broadcastRoomState(io, room);
    });

    socket.on("room:join", ({ roomId, playerName }, cb) => {
      const normalizedId = roomId.toUpperCase();
      const room = rooms.get(normalizedId);
      if (!room) {
        cb(false, "Room not found");
        return;
      }
      if (room.roundOver) {
        cb(false, "Round is over — wait for the next one");
        return;
      }
      if (Object.keys(room.players).length >= 8) {
        cb(false, "Room is full (max 8 players)");
        return;
      }

      removePlayerFromCurrentRoom(socket.id, io);

      const playerId = socket.id;
      room.players[playerId] = {
        id: playerId,
        name: playerName.trim().slice(0, 15) || "Player",
        guesses: [],
        solved: false,
        hintsUsed: 0,
        revealedPositions: [],
      };

      playerRooms.set(playerId, normalizedId);
      socket.join(room.roomId);
      cb(true);
      broadcastRoomState(io, room);
    });

    socket.on("room:set-word-length", (length) => {
      const roomId = playerRooms.get(socket.id);
      if (!roomId) return;
      const room = rooms.get(roomId);
      if (!room || room.gameStarted) return;

      const hostId = Object.keys(room.players)[0];
      if (socket.id !== hostId) return;

      room.wordLength = clampWordLength(length);
      broadcastRoomState(io, room);
    });

    socket.on("game:start", (wordLength) => {
      const roomId = playerRooms.get(socket.id);
      if (!roomId) return;
      const room = rooms.get(roomId);
      if (!room || room.gameStarted) return;

      const hostId = Object.keys(room.players)[0];
      if (socket.id !== hostId) return;

      room.wordLength = clampWordLength(wordLength);
      room.gameStarted = true;
      room.roundOver = false;
      room.roundId++;
      room.word = getRandomWord(room.wordLength);
      room.winnerId = undefined;

      for (const p of Object.values(room.players)) {
        p.guesses = [];
        p.solved = false;
        p.solvedAt = undefined;
        p.hintsUsed = 0;
        p.revealedPositions = [];
      }

      broadcastRoomState(io, room);
    });

    socket.on("game:guess", (word) => {
      const roomId = playerRooms.get(socket.id);
      if (!roomId) return;
      const room = rooms.get(roomId);
      if (!room || !room.gameStarted || room.roundOver) return;

      const player = room.players[socket.id];
      if (!player || player.solved || player.guesses.length >= MAX_GUESSES)
        return;

      const guess = word.toLowerCase().trim();
      if (guess.length !== room.wordLength) return;
      if (!isValidGuess(guess)) {
        socket.emit("room:error", "Not a valid word");
        return;
      }

      const tiles: TileData[] = evaluateGuess(guess, room.word);
      player.guesses.push(tiles);

      const correct = guess === room.word;

      socket.emit("game:guess-result", {
        tiles,
        guessIndex: player.guesses.length - 1,
        correct,
      });

      if (correct) {
        player.solved = true;
        player.solvedAt = Date.now();
        if (!room.winnerId) {
          room.winnerId = socket.id;
        }
      }

      const allDone = Object.values(room.players).every(
        (p) => p.solved || p.guesses.length >= MAX_GUESSES
      );

      if (allDone) {
        room.roundOver = true;
      }

      broadcastRoomState(io, room);
    });

    socket.on("game:hint", () => {
      const roomId = playerRooms.get(socket.id);
      if (!roomId) return;
      const room = rooms.get(roomId);
      if (!room || !room.gameStarted || room.roundOver) return;

      const player = room.players[socket.id];
      if (!player || player.solved) return;

      const maxHints = 1;
      if (player.hintsUsed >= maxHints) {
        socket.emit("room:error", "No hints remaining");
        return;
      }

      const knownPositions = new Set(player.revealedPositions);
      for (const guess of player.guesses) {
        guess.forEach((tile, i) => {
          if (tile.state === "correct") knownPositions.add(i);
        });
      }

      const unrevealed: number[] = [];
      for (let i = 0; i < room.word.length; i++) {
        if (!knownPositions.has(i)) unrevealed.push(i);
      }

      if (unrevealed.length === 0) return;

      const pos = unrevealed[Math.floor(Math.random() * unrevealed.length)];
      player.hintsUsed++;
      player.revealedPositions.push(pos);

      const letter = room.word[pos];
      const isVowel = "aeiou".includes(letter);

      socket.emit("game:hint-result", {
        position: pos,
        letter,
        hintsRemaining: maxHints - player.hintsUsed,
        isVowel,
      });
    });

    socket.on("game:play-again", (wordLength) => {
      const roomId = playerRooms.get(socket.id);
      if (!roomId) return;
      const room = rooms.get(roomId);
      if (!room || !room.roundOver) return;

      const playerIds = Object.keys(room.players);
      const isHost = socket.id === playerIds[0];
      const isSolo = playerIds.length === 1;
      if (!isHost && !isSolo) return;

      room.wordLength = clampWordLength(wordLength);
      room.gameStarted = true;
      room.roundOver = false;
      room.roundId++;
      room.word = getRandomWord(room.wordLength);
      room.winnerId = undefined;

      for (const p of Object.values(room.players)) {
        p.guesses = [];
        p.solved = false;
        p.solvedAt = undefined;
        p.hintsUsed = 0;
        p.revealedPositions = [];
      }

      broadcastRoomState(io, room);
    });

    socket.on("disconnect", () => {
      removePlayerFromCurrentRoom(socket.id, io);
    });
  });

  const PORT = parseInt(process.env.PORT || "3000", 10);
  httpServer.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
