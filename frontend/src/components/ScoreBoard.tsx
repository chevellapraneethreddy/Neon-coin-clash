import React from 'react';
import { Trophy } from 'lucide-react';
import type { Player } from '../types/game.js';

interface ScoreBoardProps {
  players: Player[];
  currentPlayerId: string | null;
  targetScore?: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  players,
  currentPlayerId,
  targetScore = 10,
}) => {
  // Sort players descending by score
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="glass-panel rounded-xl px-3 sm:px-4 py-2 border border-slate-700/60 shadow-lg flex items-center gap-2 sm:gap-4 overflow-x-auto max-w-full">
      <div className="flex items-center gap-1.5 text-xs font-arcade text-yellow-400 shrink-0">
        <Trophy size={14} />
        <span className="hidden sm:inline">TARGET:</span>
        <span className="font-bold">{targetScore}</span>
      </div>

      <div className="h-4 w-px bg-slate-700 shrink-0" />

      <div className="flex items-center gap-2.5 sm:gap-3.5 overflow-x-auto py-1">
        {sorted.map((p, idx) => {
          const isCurrent = p.id === currentPlayerId;
          const progressPercent = Math.min(100, (p.score / targetScore) * 100);

          return (
            <div
              key={p.id}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border shrink-0 transition-all ${
                isCurrent
                  ? 'bg-cyan-950/50 border-cyan-500/50 shadow-[0_0_10px_rgba(0,245,255,0.15)]'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <span className="text-[10px] font-arcade text-slate-400">
                #{idx + 1}
              </span>

              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: p.color }}
              />

              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-cyber font-bold text-slate-200">
                    {p.name.length > 8 ? `${p.name.slice(0, 7)}…` : p.name}
                  </span>
                  {isCurrent && (
                    <span className="text-[9px] font-arcade text-cyan-400 font-bold">
                      YOU
                    </span>
                  )}
                </div>

                {/* Micro progress bar */}
                <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${progressPercent}%`,
                      backgroundColor: p.color,
                    }}
                  />
                </div>
              </div>

              <span className="text-xs font-arcade font-bold text-yellow-300 ml-1">
                {p.score}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
