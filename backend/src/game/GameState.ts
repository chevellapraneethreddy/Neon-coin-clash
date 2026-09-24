import { config } from '../config.js';
import type { Coin, GamePhase, Player, PlayerInput, RoomSnapshot, CoinCollectedEvent } from '../types/game.js';
import { checkCircleCollision, clampToArena, getRandomSafeCoinPosition } from './collision.js';

interface InternalPlayer extends Player {
  input: PlayerInput;
}

export class GameState {
  public code: string;
  public hostId: string;
  public phase: GamePhase = 'LOBBY';
  public players = new Map<string, InternalPlayer>();
  public coins: Coin[] = [];
  public timeLeft = config.ROUND_DURATION;
  public countdown = config.COUNTDOWN_SECONDS;
  public winner?: Player;
  public rankings?: Player[];
  private coinCounter = 0;

  constructor(code: string, hostId: string, hostName: string) {
    this.code = code;
    this.hostId = hostId;
    this.addPlayer(hostId, hostName, true);
  }

  public addPlayer(id: string, name: string, isHost = false): Player {
    // Pick an unused neon color if available, or cycle
    const usedColors = new Set(Array.from(this.players.values()).map((p) => p.color));
    const availableColor = config.PLAYER_COLORS.find((c) => !usedColors.has(c)) ||
      config.PLAYER_COLORS[this.players.size % config.PLAYER_COLORS.length];

    // Compute spawn position spaced out
    const spawnIndex = this.players.size;
    const padding = 120;
    const x = padding + ((config.ARENA_WIDTH - 2 * padding) / (config.MAX_PLAYERS || 8)) * spawnIndex;
    const y = config.ARENA_HEIGHT / 2 + (spawnIndex % 2 === 0 ? -60 : 60);

    const player: InternalPlayer = {
      id,
      name: name.trim().slice(0, 15) || `Player ${this.players.size + 1}`,
      color: availableColor,
      x: Math.round(x),
      y: Math.round(y),
      score: 0,
      isHost,
      isConnected: true,
      direction: 'idle',
      input: { up: false, down: false, left: false, right: false },
    };

    this.players.set(id, player);
    return this.getPlayerSnapshot(player);
  }

  public removePlayer(id: string): { remainingCount: number; wasHost: boolean; newHostId?: string } {
    const wasHost = this.hostId === id;
    this.players.delete(id);
    let newHostId: string | undefined;

    if (wasHost && this.players.size > 0) {
      // Transfer host to first remaining connected player
      const firstRemaining = this.players.values().next().value;
      if (firstRemaining) {
        firstRemaining.isHost = true;
        this.hostId = firstRemaining.id;
        newHostId = firstRemaining.id;
      }
    }

    return {
      remainingCount: this.players.size,
      wasHost,
      newHostId,
    };
  }

  public updatePlayerInput(id: string, input: PlayerInput): void {
    const player = this.players.get(id);
    if (!player) return;

    player.input = {
      up: Boolean(input.up),
      down: Boolean(input.down),
      left: Boolean(input.left),
      right: Boolean(input.right),
    };

    if (player.input.left) player.direction = 'left';
    else if (player.input.right) player.direction = 'right';
    else if (player.input.up) player.direction = 'up';
    else if (player.input.down) player.direction = 'down';
  }

  public initializeCoins(): void {
    this.coins = [];
    this.coinCounter = 0;
    const playersList = this.getPlayersList();
    for (let i = 0; i < config.COIN_COUNT; i++) {
      this.spawnCoin(playersList);
    }
  }

  public spawnCoin(playersList?: Player[]): Coin {
    const pos = getRandomSafeCoinPosition(
      this.coins,
      playersList || this.getPlayersList()
    );
    this.coinCounter++;
    const newCoin: Coin = {
      id: `coin_${this.coinCounter}_${Date.now()}`,
      x: pos.x,
      y: pos.y,
      value: 1,
    };
    this.coins.push(newCoin);
    return newCoin;
  }

  /**
   * Authoritative physics tick
   * @param dt Delta time in seconds (e.g. ~0.033s for 30 ticks/s)
   */
  public tick(dt: number): { collectedEvents: CoinCollectedEvent[]; winningPlayer?: Player } {
    const collectedEvents: CoinCollectedEvent[] = [];
    let winningPlayer: Player | undefined;

    if (this.phase !== 'PLAYING') {
      return { collectedEvents };
    }

    // 1. Update player positions based on authoritative input
    for (const player of this.players.values()) {
      if (!player.isConnected) continue;

      let dx = 0;
      let dy = 0;

      if (player.input.left) dx -= 1;
      if (player.input.right) dx += 1;
      if (player.input.up) dy -= 1;
      if (player.input.down) dy += 1;

      // Normalize diagonal speed
      if (dx !== 0 && dy !== 0) {
        const factor = 1 / Math.SQRT2;
        dx *= factor;
        dy *= factor;
      }

      if (dx !== 0 || dy !== 0) {
        player.x += dx * config.PLAYER_SPEED * dt;
        player.y += dy * config.PLAYER_SPEED * dt;

        // Clamp to arena bounds
        const clamped = clampToArena(player.x, player.y, config.PLAYER_RADIUS);
        player.x = clamped.x;
        player.y = clamped.y;
      }
    }

    // 2. Authoritative Coin Collision Checks
    const remainingCoins: Coin[] = [];
    const playersList = this.getPlayersList();

    for (const coin of this.coins) {
      let collectedBy: InternalPlayer | null = null;

      for (const player of this.players.values()) {
        if (!player.isConnected) continue;
        const hit = checkCircleCollision(
          player.x,
          player.y,
          config.PLAYER_RADIUS,
          coin.x,
          coin.y,
          config.COIN_RADIUS
        );

        if (hit) {
          collectedBy = player;
          break; // First player in loop gets coin, prevents duplicate collection
        }
      }

      if (collectedBy) {
        collectedBy.score += coin.value;
        const newCoin = this.spawnCoin(playersList);

        collectedEvents.push({
          coinId: coin.id,
          collectedBy: collectedBy.id,
          playerName: collectedBy.name,
          newScore: collectedBy.score,
          newCoin,
        });

        // Check winning condition
        if (collectedBy.score >= config.WINNING_SCORE && !winningPlayer) {
          winningPlayer = this.getPlayerSnapshot(collectedBy);
        }
      } else {
        remainingCoins.push(coin);
      }
    }

    this.coins = remainingCoins;

    if (winningPlayer) {
      this.finishGame(winningPlayer, 'score_reached');
    }

    return { collectedEvents, winningPlayer };
  }

  public finishGame(winner?: Player, _reason: 'score_reached' | 'time_expired' = 'score_reached'): void {
    this.phase = 'GAME_OVER';

    const sortedPlayers = Array.from(this.players.values())
      .map((p) => this.getPlayerSnapshot(p))
      .sort((a, b) => b.score - a.score);

    this.rankings = sortedPlayers;
    this.winner = winner || sortedPlayers[0];
  }

  public resetForRematch(): void {
    this.phase = 'LOBBY';
    this.timeLeft = config.ROUND_DURATION;
    this.countdown = config.COUNTDOWN_SECONDS;
    this.winner = undefined;
    this.rankings = undefined;
    this.coins = [];

    // Reset scores & reposition players
    let index = 0;
    const padding = 120;
    for (const player of this.players.values()) {
      player.score = 0;
      player.input = { up: false, down: false, left: false, right: false };
      player.direction = 'idle';
      player.x = Math.round(padding + ((config.ARENA_WIDTH - 2 * padding) / Math.max(1, this.players.size)) * index);
      player.y = Math.round(config.ARENA_HEIGHT / 2 + (index % 2 === 0 ? -60 : 60));
      index++;
    }
  }

  public getPlayer(id: string): Player | undefined {
    const p = this.players.get(id);
    return p ? this.getPlayerSnapshot(p) : undefined;
  }

  public getPlayersList(): Player[] {
    return Array.from(this.players.values()).map((p) => this.getPlayerSnapshot(p));
  }

  private getPlayerSnapshot(player: InternalPlayer): Player {
    return {
      id: player.id,
      name: player.name,
      color: player.color,
      x: Math.round(player.x),
      y: Math.round(player.y),
      score: player.score,
      isHost: player.isHost,
      isConnected: player.isConnected,
      direction: player.direction,
    };
  }

  public toSnapshot(): RoomSnapshot {
    return {
      code: this.code,
      hostId: this.hostId,
      phase: this.phase,
      players: this.getPlayersList(),
      coins: this.coins,
      timeLeft: this.timeLeft,
      countdown: this.countdown,
      winner: this.winner,
      rankings: this.rankings,
    };
  }
}
