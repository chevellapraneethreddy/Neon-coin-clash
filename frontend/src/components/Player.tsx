import React from 'react';
import type { Player as PlayerType } from '../types/game.js';

interface PlayerProps {
  player: PlayerType;
  isCurrentPlayer: boolean;
}

export const Player: React.FC<PlayerProps> = ({ player, isCurrentPlayer }) => {
  const { x, y, name, color, score, direction } = player;

  // Calculate subtle thruster offset
  let thrusterX = 0;
  let thrusterY = 0;
  if (direction === 'left') thrusterX = 22;
  else if (direction === 'right') thrusterX = -22;
  else if (direction === 'up') thrusterY = 22;
  else if (direction === 'down') thrusterY = -22;

  const showThruster = direction && direction !== 'idle';

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Thruster Flame / Jet Trail */}
      {showThruster && (
        <circle
          cx={thrusterX}
          cy={thrusterY}
          r={7}
          fill="#ff007f"
          opacity={0.8}
          className="animate-ping"
          style={{ transformOrigin: `${thrusterX}px ${thrusterY}px` }}
        />
      )}

      {/* Outer Neon Glow Aura */}
      <circle
        r={26}
        fill={color}
        opacity={isCurrentPlayer ? 0.35 : 0.2}
        className={isCurrentPlayer ? 'animate-pulse' : ''}
      />

      {/* Main Avatar Hull */}
      <circle
        r={20}
        fill="#0b0d19"
        stroke={color}
        strokeWidth={isCurrentPlayer ? 3.5 : 2.5}
        filter="drop-shadow(0 0 6px currentColor)"
        style={{ color }}
      />

      {/* Inner Neon Core */}
      <circle
        r={10}
        fill={color}
        opacity={0.85}
      />

      {/* Center Cockpit Eye / Indicator */}
      <circle
        r={4}
        fill="#ffffff"
      />

      {/* Pilot Name & Score Tag Above Avatar */}
      <g transform="translate(0, -32)">
        {/* Name background bubble */}
        <rect
          x={-45}
          y={-14}
          width={90}
          height={20}
          rx={6}
          fill="rgba(8, 10, 20, 0.85)"
          stroke={isCurrentPlayer ? color : 'rgba(255,255,255,0.15)'}
          strokeWidth={isCurrentPlayer ? 1.5 : 1}
        />

        {/* Player Name */}
        <text
          x={0}
          y={0}
          textAnchor="middle"
          fontSize={10}
          fontWeight={isCurrentPlayer ? 800 : 600}
          fill={isCurrentPlayer ? '#00f5ff' : '#f1f5f9'}
          fontFamily="'Rajdhani', sans-serif"
        >
          {name.length > 9 ? `${name.slice(0, 8)}…` : name}
          {isCurrentPlayer && ' (YOU)'}
        </text>

        {/* Score pill next to avatar */}
        <g transform="translate(26, 28)">
          <circle r={8} fill="#ffe600" />
          <text
            x={0}
            y={3}
            textAnchor="middle"
            fontSize={9}
            fontWeight={900}
            fill="#000000"
            fontFamily="'Orbitron', sans-serif"
          >
            {score}
          </text>
        </g>
      </g>
    </g>
  );
};
