import { io, Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "./types";

export function createSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  return io({ autoConnect: false });
}
