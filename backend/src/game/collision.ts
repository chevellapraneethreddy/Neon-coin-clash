import { config } from '../config.js';
import type { Coin, Player } from '../types/game.js';

/**
 * Checks circle-to-circle collision
 */
export function checkCircleCollision(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number
): boolean {
  const dx = x1 - x2;
  const dy = y1 - y2;
  const distanceSquared = dx * dx + dy * dy;
  const minDistance = r1 + r2;
  return distanceSquared <= minDistance * minDistance;
}

/**
 * Clamps coordinates within arena boundaries taking entity radius into account
 */
export function clampToArena(
  x: number,
  y: number,
  radius: number,
  arenaWidth = config.ARENA_WIDTH,
  arenaHeight = config.ARENA_HEIGHT
): { x: number; y: number } {
  const clampedX = Math.max(radius, Math.min(arenaWidth - radius, x));
  const clampedY = Math.max(radius, Math.min(arenaHeight - radius, y));
  return { x: clampedX, y: clampedY };
}

/**
 * Generates a random safe position for coins with arena margins
 */
export function getRandomSafeCoinPosition(
  existingCoins: Coin[] = [],
  players: Player[] = [],
  margin = 60
): { x: number; y: number } {
  const minX = margin;
  const maxX = config.ARENA_WIDTH - margin;
  const minY = margin;
  const maxY = config.ARENA_HEIGHT - margin;

  let attempts = 0;
  let candidateX = minX + Math.random() * (maxX - minX);
  let candidateY = minY + Math.random() * (maxY - minY);

  while (attempts < 30) {
    candidateX = minX + Math.random() * (maxX - minX);
    candidateY = minY + Math.random() * (maxY - minY);

    // Ensure not too close to another coin (at least 60px)
    const tooCloseToCoin = existingCoins.some(
      (c) => Math.hypot(c.x - candidateX, c.y - candidateY) < 60
    );

    // Ensure not spawning directly inside a player (at least 50px)
    const tooCloseToPlayer = players.some(
      (p) => Math.hypot(p.x - candidateX, p.y - candidateY) < 50
    );

    if (!tooCloseToCoin && !tooCloseToPlayer) {
      break;
    }
    attempts++;
  }

  return {
    x: Math.round(candidateX),
    y: Math.round(candidateY),
  };
}
