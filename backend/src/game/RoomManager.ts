import { config } from '../config.js';
import { GameState } from './GameState.js';
import type { RoomSnapshot } from '../types/game.js';

const CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export class RoomManager {
  private rooms = new Map<string, GameState>();
  private playerToRoom = new Map<string, string>();

  /**
   * Generates a unique 4-character room code
   */
  public generateRoomCode(): string {
    let code: string;
    let attempts = 0;
    do {
      code = '';
      for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * CHARACTERS.length);
        code += CHARACTERS[randomIndex];
      }
      attempts++;
    } while (this.rooms.has(code) && attempts < 1000);
    return code;
  }

  /**
   * Creates a new room with the requesting player as host
   */
  public createRoom(playerId: string, playerName: string): { code: string; snapshot: RoomSnapshot } {
    // If player is already in a room, leave it first
    this.leaveRoom(playerId);

    const code = this.generateRoomCode();
    const gameState = new GameState(code, playerId, playerName);
    this.rooms.set(code, gameState);
    this.playerToRoom.set(playerId, code);

    return {
      code,
      snapshot: gameState.toSnapshot(),
    };
  }

  /**
   * Joins an existing room
   */
  public joinRoom(
    code: string,
    playerId: string,
    playerName: string
  ): { success: boolean; error?: string; snapshot?: RoomSnapshot } {
    const formattedCode = code.trim().toUpperCase();
    const gameState = this.rooms.get(formattedCode);

    if (!gameState) {
      return { success: false, error: 'Room not found. Please check the room code.' };
    }

    if (gameState.phase !== 'LOBBY' && gameState.phase !== 'GAME_OVER') {
      return { success: false, error: 'Game is already in progress. Please wait or join another room.' };
    }

    if (gameState.players.size >= config.MAX_PLAYERS) {
      return { success: false, error: `Room is full (Maximum ${config.MAX_PLAYERS} players).` };
    }

    // Leave any previous room
    this.leaveRoom(playerId);

    gameState.addPlayer(playerId, playerName, false);
    this.playerToRoom.set(playerId, formattedCode);

    return {
      success: true,
      snapshot: gameState.toSnapshot(),
    };
  }

  /**
   * Gets the GameState for a room code
   */
  public getRoom(code: string): GameState | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  /**
   * Finds the room a player is currently in
   */
  public getRoomByPlayerId(playerId: string): GameState | undefined {
    const code = this.playerToRoom.get(playerId);
    if (!code) return undefined;
    return this.rooms.get(code);
  }

  /**
   * Handles player leaving or disconnecting
   */
  public leaveRoom(playerId: string): {
    roomCode?: string;
    wasHost: boolean;
    newHostId?: string;
    roomEmpty: boolean;
    snapshot?: RoomSnapshot;
  } {
    const roomCode = this.playerToRoom.get(playerId);
    if (!roomCode) {
      return { wasHost: false, roomEmpty: false };
    }

    this.playerToRoom.delete(playerId);
    const gameState = this.rooms.get(roomCode);
    if (!gameState) {
      return { roomCode, wasHost: false, roomEmpty: false };
    }

    const { remainingCount, wasHost, newHostId } = gameState.removePlayer(playerId);

    if (remainingCount === 0) {
      this.rooms.delete(roomCode);
      return { roomCode, wasHost, roomEmpty: true };
    }

    return {
      roomCode,
      wasHost,
      newHostId,
      roomEmpty: false,
      snapshot: gameState.toSnapshot(),
    };
  }

  public getRoomCount(): number {
    return this.rooms.size;
  }
}
