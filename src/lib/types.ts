import type { TileData } from "./game";

export interface PlayerState {
  id: string;
  name: string;
  guesses: TileData[][];
  solved: boolean;
  solvedAt?: number;
  hintsUsed: number;
  revealedPositions: number[];
}

export interface RoomState {
  roomId: string;
  players: Record<string, PlayerState>;
  gameStarted: boolean;
  roundOver: boolean;
  word: string;
  wordLength: number;
  roundId: number;
  winnerId?: string;
  countdown?: number;
  gameMode?: "solo" | "friends" | "daily" | "custom";
}

export interface ClientPlayerState {
  id: string;
  name: string;
  guesses: TileData[][];
  solved: boolean;
}

export interface ClientRoomState {
  roomId: string;
  players: ClientPlayerState[];
  gameStarted: boolean;
  roundOver: boolean;
  roundId: number;
  wordLength: number;
  winnerId?: string;
  winnerName?: string;
  word?: string;
  countdown?: number;
  gameMode?: "solo" | "friends" | "daily" | "custom";
}

export interface ServerToClientEvents {
  "room:state": (state: ClientRoomState) => void;
  "room:error": (message: string) => void;
  "game:guess-result": (data: {
    tiles: TileData[];
    guessIndex: number;
    correct: boolean;
  }) => void;
  "game:countdown": (seconds: number) => void;
  "game:hint-result": (data: {
    position: number;
    letter: string;
    hintsRemaining: number;
    isVowel: boolean;
  }) => void;
}

export interface ClientToServerEvents {
  "room:create": (
    data: {
      playerName: string;
      wordLength?: number;
      autoStart?: boolean;
      daily?: boolean;
      customWord?: string;
    },
    cb: (roomId: string) => void
  ) => void;
  "room:join": (
    data: { roomId: string; playerName: string },
    cb: (ok: boolean, error?: string) => void
  ) => void;
  "game:start": (wordLength: number) => void;
  "game:guess": (word: string) => void;
  "game:play-again": (wordLength: number) => void;
  "game:hint": () => void;
  "room:set-word-length": (length: number) => void;
}
