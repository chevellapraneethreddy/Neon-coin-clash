import React, { useEffect, useRef } from 'react';
import type { Coin as CoinType, Player as PlayerType, PlayerInput } from '../types/game.js';
import { Player } from './Player.js';
import { Coin } from './Coin.js';
import { ScoreBoard } from './ScoreBoard.js';
import { GameTimer } from './GameTimer.js';
import { MobileControls } from './MobileControls.js';

interface GameArenaProps {
  players: PlayerType[];
  coins: CoinType[];
  timeLeft: number;
  currentPlayerId: string | null;
  onSendInput: (input: PlayerInput) => void;
  recentPickup?: { id: string; x: number; y: number; text: string } | null;
  onLeaveRoom?: () => void;
}

export const GameArena: React.FC<GameArenaProps> = ({
  players,
  coins,
  timeLeft,
  currentPlayerId,
  onSendInput,
  recentPickup,
}) => {
  const activeKeys = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  // Desktop Keyboard Input Listener (WASD & Arrow Keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      let changed = false;
      const key = e.code;

      if (key === 'KeyW' || key === 'ArrowUp') {
        if (!activeKeys.current.up) {
          activeKeys.current.up = true;
          changed = true;
        }
      } else if (key === 'KeyS' || key === 'ArrowDown') {
        if (!activeKeys.current.down) {
          activeKeys.current.down = true;
          changed = true;
        }
      } else if (key === 'KeyA' || key === 'ArrowLeft') {
        if (!activeKeys.current.left) {
          activeKeys.current.left = true;
          changed = true;
        }
      } else if (key === 'KeyD' || key === 'ArrowRight') {
        if (!activeKeys.current.right) {
          activeKeys.current.right = true;
          changed = true;
        }
      }

      if (changed) {
        onSendInput({ ...activeKeys.current });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      let changed = false;
      const key = e.code;

      if (key === 'KeyW' || key === 'ArrowUp') {
        if (activeKeys.current.up) {
          activeKeys.current.up = false;
          changed = true;
        }
      } else if (key === 'KeyS' || key === 'ArrowDown') {
        if (activeKeys.current.down) {
          activeKeys.current.down = false;
          changed = true;
        }
      } else if (key === 'KeyA' || key === 'ArrowLeft') {
        if (activeKeys.current.left) {
          activeKeys.current.left = false;
          changed = true;
        }
      } else if (key === 'KeyD' || key === 'ArrowRight') {
        if (activeKeys.current.right) {
          activeKeys.current.right = false;
          changed = true;
        }
      }

      if (changed) {
        onSendInput({ ...activeKeys.current });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      onSendInput({ up: false, down: false, left: false, right: false });
    };
  }, [onSendInput]);

  return (
    <div className="flex flex-col items-center justify-between w-full h-[100dvh] max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-3 overflow-hidden select-none">
      {/* Top HUD: ScoreBoard & GameTimer */}
      <div className="w-full flex items-center justify-between gap-3 mb-2 shrink-0">
        <ScoreBoard
          players={players}
          currentPlayerId={currentPlayerId}
          targetScore={10}
        />
        <GameTimer timeLeft={timeLeft} />
      </div>

      {/* Main Responsive Arena Viewport (1000 x 600 fixed coordinate space) */}
      <div className="relative w-full flex-1 max-h-[78vh] flex items-center justify-center">
        <div className="relative w-full aspect-[1000/600] max-h-full rounded-2xl overflow-hidden glass-panel border-2 border-cyan-500/50 shadow-[0_0_35px_rgba(0,245,255,0.25)]">
          <svg
            viewBox="0 0 1000 600"
            className="w-full h-full block"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Coin Golden Gradient */}
              <linearGradient id="coin-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff275" />
                <stop offset="45%" stopColor="#ffd700" />
                <stop offset="100%" stopColor="#e5a100" />
              </linearGradient>

              {/* Grid pattern */}
              <pattern id="arena-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path
                  d="M 50 0 L 0 0 0 50"
                  fill="none"
                  stroke="rgba(0, 245, 255, 0.08)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>

            {/* Arena Floor Background */}
            <rect width="1000" height="600" fill="#080a14" />
            <rect width="1000" height="600" fill="url(#arena-grid)" />

            {/* Center Arena Court Graphic */}
            <circle
              cx="500"
              cy="300"
              r="120"
              fill="none"
              stroke="rgba(0, 245, 255, 0.12)"
              strokeWidth="2"
              strokeDasharray="6 6"
            />
            <circle
              cx="500"
              cy="300"
              r="4"
              fill="rgba(0, 245, 255, 0.4)"
            />

            {/* Arena Boundary Glow Border */}
            <rect
              x="6"
              y="6"
              width="988"
              height="588"
              rx="14"
              fill="none"
              stroke="rgba(0, 245, 255, 0.4)"
              strokeWidth="2"
            />

            {/* Neon Corner Accents */}
            <path d="M 20 50 L 20 20 L 50 20" fill="none" stroke="#00f5ff" strokeWidth="3" />
            <path d="M 980 50 L 980 20 L 950 20" fill="none" stroke="#00f5ff" strokeWidth="3" />
            <path d="M 20 550 L 20 580 L 50 580" fill="none" stroke="#00f5ff" strokeWidth="3" />
            <path d="M 980 550 L 980 580 L 950 580" fill="none" stroke="#00f5ff" strokeWidth="3" />

            {/* Coins */}
            {coins.map((coin) => (
              <Coin key={coin.id} coin={coin} />
            ))}

            {/* Players */}
            {players.map((player) => (
              <Player
                key={player.id}
                player={player}
                isCurrentPlayer={player.id === currentPlayerId}
              />
            ))}

            {/* Transient Pickup Floater */}
            {recentPickup && (
              <g transform={`translate(${recentPickup.x}, ${recentPickup.y - 25})`}>
                <text
                  textAnchor="middle"
                  fill="#ffe600"
                  fontSize={14}
                  fontWeight={900}
                  fontFamily="'Orbitron', sans-serif"
                  filter="drop-shadow(0 0 6px #ffe600)"
                >
                  {recentPickup.text}
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Bottom Info / Desktop Controls Guide */}
      <div className="w-full flex items-center justify-between text-xs text-slate-400 font-cyber px-2 py-1 shrink-0">
        <div className="hidden md:flex items-center gap-2">
          <span className="font-arcade text-cyan-400 font-bold">CONTROLS:</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-arcade text-[10px]">
            W A S D
          </span>
          <span>or</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-arcade text-[10px]">
            ↑ ← ↓ →
          </span>
          <span>to maneuver</span>
        </div>

        <div className="text-[11px] text-yellow-400/90 font-arcade">
          FIRST TO 10 COINS WINS!
        </div>
      </div>

      {/* On-Screen Mobile Joystick / D-Pad for Touch Devices */}
      <MobileControls onInputChange={onSendInput} />
    </div>
  );
};
