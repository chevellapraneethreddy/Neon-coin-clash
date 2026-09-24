import React from 'react';
import type { Coin as CoinType } from '../types/game.js';

interface CoinProps {
  coin: CoinType;
}

export const Coin: React.FC<CoinProps> = ({ coin }) => {
  const { x, y } = coin;

  return (
    <g transform={`translate(${x}, ${y})`} className="cursor-pointer">
      {/* Outer Pulse Glow Ring */}
      <circle
        r={22}
        fill="#ffe600"
        opacity={0.2}
        className="animate-pulse"
      />

      {/* Main Golden Disc */}
      <circle
        r={14}
        fill="url(#coin-gradient)"
        stroke="#fff480"
        strokeWidth={2}
        filter="drop-shadow(0 0 8px #ffe600)"
      />

      {/* Inner Rim */}
      <circle
        r={10}
        fill="none"
        stroke="#b8860b"
        strokeWidth={1}
        strokeDasharray="2,2"
      />

      {/* Coin Center Emblem */}
      <text
        x={0}
        y={4.5}
        textAnchor="middle"
        fontSize={12}
        fontWeight={900}
        fill="#5a3d00"
        fontFamily="'Orbitron', sans-serif"
      >
        ✦
      </text>

      {/* Sparkle highlight */}
      <circle
        cx={-4}
        cy={-4}
        r={2}
        fill="#ffffff"
        opacity={0.8}
      />
    </g>
  );
};
