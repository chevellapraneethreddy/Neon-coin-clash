import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: Number(process.env.PORT) || 3001,
  CLIENT_URL: process.env.CLIENT_URL || '*',
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Game Arena & Physics
  ARENA_WIDTH: 1000,
  ARENA_HEIGHT: 600,
  PLAYER_RADIUS: 20,
  COIN_RADIUS: 14,
  PLAYER_SPEED: 320, // pixels per second
  TICK_RATE: 30, // 30 ticks per second (33.3ms)
  
  // Game Rules
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 8,
  WINNING_SCORE: 10,
  ROUND_DURATION: 60, // seconds
  COUNTDOWN_SECONDS: 3,
  COIN_COUNT: 3, // simultaneous coins in arena
  
  // Neon Color Palette
  PLAYER_COLORS: [
    '#00f5ff', // Neon Cyan
    '#ff007f', // Neon Pink / Magenta
    '#39ff14', // Neon Green / Lime
    '#ffe600', // Neon Yellow
    '#b026ff', // Neon Purple
    '#ff6600', // Neon Orange
    '#00e5ff', // Electric Turquoise
    '#ff1744', // Neon Crimson
  ],
};
