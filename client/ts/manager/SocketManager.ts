import { io, Socket } from "socket.io-client";
import { PlayerPosition } from "../entity/Player";

// Define event types for better type safety
export interface ServerToClientEvents {
  currentPlayers: (players: Record<string, PlayerData>) => void;
  newPlayer: (playerId: string) => void;
  playerDisconnected: (playerId: string) => void;
  playWalkingAnimation: (data: { playerId: string; rotation: number }) => void;
  playerMoved: (data: { playerId: string; playerPos: { x: number; y: number; rotation?: number } }) => void;
  playShoot: (data: { playerId: string }) => void;
  playerGotHit: (data: { playerId: string }) => void;
  playerDied: (data: { playerId: string }) => void;
}

export interface ClientToServerEvents {
  playerMoved: (data: { x: number; y: number; isRespawning?: boolean }) => void;
  playedWalkingAnimation: (data: { rotation: number }) => void;
  playedShoot: () => void;
  playerHit: (data: { playerId: string }) => void;
  shotFired: () => void;
  playerMovement: (data: PlayerPosition) => void;
}

export interface PlayerData {
  position: {
    x: number;
    y: number;
    rotation?: number;
  };
}

export class SocketManager {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents>;

  constructor() {
    // Initialize the Socket.IO connection
    this.socket = io(); // Default to the current domain/host for simplicity
  }

  // Overload for custom events
  public on<EventName extends keyof ServerToClientEvents>(
    event: EventName,
    callback: ServerToClientEvents[EventName]
  ): void;

  // Overload for reserved events
  public on(event: "connect" | "disconnect" | "connect_error", callback: (...args: any[]) => void): void;

  // Implementation
  public on(event: any, callback: (...args: any[]) => void): void {
    this.socket.on(event, callback);
  }

  // Overload for events with required data
  public emit<EventName extends keyof ClientToServerEvents>(
    event: EventName,
    data: Parameters<ClientToServerEvents[EventName]>[0]
  ): void;

  // Overload for events with no data
  public emit<EventName extends keyof ClientToServerEvents>(
    event: EventName
  ): void;

  // Implementation
  public emit<EventName extends keyof ClientToServerEvents>(
    event: EventName,
    ...args: Parameters<ClientToServerEvents[EventName]>
  ): void {
    this.socket.emit(event, ...args);
  }
}
