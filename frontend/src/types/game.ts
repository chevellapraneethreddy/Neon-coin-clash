export type GamePhase = 'LOBBY' | 'COUNTDOWN' | 'PLAYING' | 'GAME_OVER';

export interface PlayerInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  score: number;
  isHost: boolean;
  isConnected: boolean;
  direction?: 'left' | 'right' | 'up' | 'down' | 'idle';
}

export interface Coin {
  id: string;
  x: number;
  y: number;
  value: number;
}

export interface RoomSnapshot {
  code: string;
  hostId: string;
  phase: GamePhase;
  players: Player[];
  coins: Coin[];
  timeLeft: number;
  countdown: number;
  winner?: Player;
  rankings?: Player[];
}

export interface GameStateBroadcast {
  players: Player[];
  coins: Coin[];
  timeLeft: number;
  phase: GamePhase;
}

export interface CoinCollectedEvent {
  coinId: string;
  collectedBy: string;
  playerName: string;
  newScore: number;
  newCoin: Coin;
}

export interface ResultsData {
  winner: Player;
  rankings: Player[];
  reason: 'score_reached' | 'time_expired';
}
