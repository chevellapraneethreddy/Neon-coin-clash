import React from 'react';
import { Clock } from 'lucide-react';

interface GameTimerProps {
  timeLeft: number;
}

export const GameTimer: React.FC<GameTimerProps> = ({ timeLeft }) => {
  const isUrgent = timeLeft <= 15;
  const isCritical = timeLeft <= 5;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div
      className={`glass-panel rounded-xl px-3.5 py-1.5 border flex items-center gap-2 transition-all ${
        isCritical
          ? 'border-rose-500 bg-rose-950/60 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse'
          : isUrgent
          ? 'border-amber-500 bg-amber-950/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
          : 'border-slate-700/60 shadow-md'
      }`}
    >
      <Clock
        size={16}
        className={isCritical ? 'text-rose-400' : isUrgent ? 'text-amber-400' : 'text-cyan-400'}
      />
      <div className="flex flex-col items-center">
        <span
          className={`font-arcade text-lg sm:text-xl font-bold tracking-widest ${
            isCritical
              ? 'text-rose-400 drop-shadow-[0_0_8px_#f43f5e]'
              : isUrgent
              ? 'text-amber-400 drop-shadow-[0_0_8px_#fbbf24]'
              : 'text-cyan-300 drop-shadow-[0_0_8px_#00f5ff]'
          }`}
        >
          {formatted}
        </span>
      </div>
    </div>
  );
};
