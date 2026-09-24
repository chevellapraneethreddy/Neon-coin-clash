import type { Server } from 'socket.io';
import { config } from '../config.js';
import type { GameState } from './GameState.js';
import type { RoomManager } from './RoomManager.js';

interface ActiveRoomTimers {
  countdownInterval?: NodeJS.Timeout;
  physicsInterval?: NodeJS.Timeout;
  roundTimerInterval?: NodeJS.Timeout;
}

export class GameManager {
  private activeTimers = new Map<string, ActiveRoomTimers>();

  constructor(private roomManager: RoomManager, private io: Server) {}

  /**
   * Starts the 3-second countdown followed by the round
   */
  public startGame(roomCode: string, requesterId: string): { success: boolean; error?: string } {
    const room = this.roomManager.getRoom(roomCode);
    if (!room) {
      return { success: false, error: 'Room not found.' };
    }

    if (room.hostId !== requesterId) {
      return { success: false, error: 'Only the host can start the game.' };
    }

    if (room.players.size < config.MIN_PLAYERS) {
      return {
        success: false,
        error: `At least ${config.MIN_PLAYERS} players are required to start the game.`,
      };
    }

    if (room.phase === 'PLAYING' || room.phase === 'COUNTDOWN') {
      return { success: false, error: 'Game is already running.' };
    }

    // Clear any previous timers
    this.clearRoomTimers(roomCode);

    // 1. Enter Countdown Phase
    room.phase = 'COUNTDOWN';
    room.countdown = config.COUNTDOWN_SECONDS;
    this.io.to(roomCode).emit('game_countdown', { count: room.countdown });

    const timers: ActiveRoomTimers = {};
    this.activeTimers.set(roomCode, timers);

    timers.countdownInterval = setInterval(() => {
      room.countdown -= 1;
      if (room.countdown > 0) {
        this.io.to(roomCode).emit('game_countdown', { count: room.countdown });
      } else {
        // Countdown finished, start the actual round!
        if (timers.countdownInterval) {
          clearInterval(timers.countdownInterval);
          timers.countdownInterval = undefined;
        }
        this.startRound(roomCode);
      }
    }, 1000);

    return { success: true };
  }

  /**
   * Initializes the playing round
   */
  private startRound(roomCode: string): void {
    const room = this.roomManager.getRoom(roomCode);
    if (!room) return;

    room.phase = 'PLAYING';
    room.timeLeft = config.ROUND_DURATION;
    room.initializeCoins();

    const snapshot = room.toSnapshot();
    this.io.to(roomCode).emit('game_started', { gameState: snapshot });

    const timers = this.activeTimers.get(roomCode) || {};
    this.activeTimers.set(roomCode, timers);

    // 1. Authoritative Physics & Collision Loop at TICK_RATE
    const tickIntervalMs = Math.round(1000 / config.TICK_RATE);
    const dt = tickIntervalMs / 1000;

    timers.physicsInterval = setInterval(() => {
      if (room.phase !== 'PLAYING') return;

      const { collectedEvents, winningPlayer } = room.tick(dt);

      // Broadcast coin collection events
      for (const ev of collectedEvents) {
        this.io.to(roomCode).emit('coin_collected', ev);
      }

      if (collectedEvents.length > 0) {
        const scores: Record<string, number> = {};
        for (const p of room.getPlayersList()) {
          scores[p.id] = p.score;
        }
        this.io.to(roomCode).emit('score_updated', { scores });
      }

      // Check if winning score was reached
      if (winningPlayer) {
        this.endGame(roomCode, winningPlayer, 'score_reached');
        return;
      }

      // Broadcast continuous authoritative game state
      this.io.to(roomCode).emit('game_state', {
        players: room.getPlayersList(),
        coins: room.coins,
        timeLeft: room.timeLeft,
        phase: room.phase,
      });
    }, tickIntervalMs);

    // 2. Round Timer Loop (1s intervals)
    timers.roundTimerInterval = setInterval(() => {
      if (room.phase !== 'PLAYING') return;

      room.timeLeft -= 1;
      this.io.to(roomCode).emit('game_timer', { timeLeft: room.timeLeft });

      if (room.timeLeft <= 0) {
        // Time expired, highest score wins!
        room.finishGame(undefined, 'time_expired');
        this.endGame(roomCode, room.winner!, 'time_expired');
      }
    }, 1000);
  }

  /**
   * Finalizes game and sends results
   */
  public endGame(roomCode: string, winner: GameState['winner'], reason: 'score_reached' | 'time_expired'): void {
    const room = this.roomManager.getRoom(roomCode);
    if (!room) return;

    this.clearRoomTimers(roomCode);
    room.finishGame(winner, reason);

    const resultsPayload = {
      winner: room.winner!,
      rankings: room.rankings || room.getPlayersList(),
      reason,
    };

    this.io.to(roomCode).emit('game_over', resultsPayload);
    this.io.to(roomCode).emit('results', resultsPayload);
  }

  /**
   * Requests a rematch and resets to lobby
   */
  public requestRematch(roomCode: string): boolean {
    const room = this.roomManager.getRoom(roomCode);
    if (!room) return false;

    this.clearRoomTimers(roomCode);
    room.resetForRematch();

    const snapshot = room.toSnapshot();
    this.io.to(roomCode).emit('rematch_started', { gameState: snapshot });
    this.io.to(roomCode).emit('lobby_updated', { room: snapshot });
    return true;
  }

  /**
   * Cleans up timers for a room
   */
  public clearRoomTimers(roomCode: string): void {
    const timers = this.activeTimers.get(roomCode);
    if (timers) {
      if (timers.countdownInterval) clearInterval(timers.countdownInterval);
      if (timers.physicsInterval) clearInterval(timers.physicsInterval);
      if (timers.roundTimerInterval) clearInterval(timers.roundTimerInterval);
      this.activeTimers.delete(roomCode);
    }
  }
}
