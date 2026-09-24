import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Crown, RotateCcw, Home, Trophy, Medal } from 'lucide-react';
import type { Player, ResultsData } from '../types/game.js';

interface ResultsProps {
  results: ResultsData;
  currentPlayerId: string | null;
  isHost: boolean;
  onRematch: () => void;
  onLeave: () => void;
}

export const Results: React.FC<ResultsProps> = ({
  results,
  currentPlayerId,
  isHost,
  onRematch,
  onLeave,
}) => {
  const { winner, rankings, reason } = results;
  const isWinner = winner.id === currentPlayerId;

  useEffect(() => {
    // Fire celebratory confetti bursts
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-4 py-8">
      <div className="w-full max-w-lg glass-panel rounded-2xl p-6 sm:p-8 border border-yellow-500/50 shadow-[0_0_40px_rgba(255,230,0,0.2)] text-center relative overflow-hidden">
        {/* Glow halo */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Victory Header */}
        <div className="relative mb-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-300 p-0.5 shadow-[0_0_25px_rgba(255,230,0,0.6)] mb-3 flex items-center justify-center">
            <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-yellow-400">
              <Crown size={32} className="animate-bounce" />
            </div>
          </div>

          <span className="text-xs font-arcade tracking-[0.25em] text-yellow-400 uppercase block mb-1">
            {reason === 'score_reached' ? '10 COINS REACHED' : 'TIME EXPIRED'}
          </span>

          <h2 className="text-3xl sm:text-4xl font-black font-arcade uppercase tracking-wide text-white">
            {isWinner ? (
              <span className="neon-text-yellow">VICTORY IS YOURS!</span>
            ) : (
              <span>
                <span style={{ color: winner.color }}>{winner.name}</span> WINS!
              </span>
            )}
          </h2>

          <p className="text-sm font-cyber text-slate-300 mt-1">
            {reason === 'score_reached'
              ? `${winner.name} collected all 10 coins first!`
              : `Time ran out! ${winner.name} finished with the highest score (${winner.score} coins).`}
          </p>
        </div>

        {/* Podium Standings Table */}
        <div className="mb-8 text-left">
          <div className="flex items-center gap-2 text-xs font-arcade text-slate-300 uppercase mb-3 px-1">
            <Trophy size={14} className="text-yellow-400" />
            FINAL RANKINGS
          </div>

          <div className="space-y-2">
            {rankings.map((player: Player, index: number) => {
              const isCurrent = player.id === currentPlayerId;
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;

              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                    isFirst
                      ? 'bg-yellow-950/40 border-yellow-500/60 shadow-[0_0_15px_rgba(255,230,0,0.25)]'
                      : isCurrent
                      ? 'bg-cyan-950/40 border-cyan-500/60'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <span
                      className={`w-6 text-center font-arcade text-sm font-bold ${
                        isFirst
                          ? 'text-yellow-400'
                          : isSecond
                          ? 'text-slate-300'
                          : isThird
                          ? 'text-amber-600'
                          : 'text-slate-500'
                      }`}
                    >
                      {isFirst ? <Medal size={18} className="text-yellow-400 inline" /> : `#${index + 1}`}
                    </span>

                    {/* Color dot */}
                    <div
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: player.color }}
                    />

                    {/* Name */}
                    <span className="font-cyber font-bold text-slate-200">
                      {player.name}
                      {isCurrent && (
                        <span className="ml-2 text-[10px] font-arcade px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                          YOU
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Coins Score */}
                  <div className="flex items-center gap-1.5 font-arcade font-bold text-yellow-300">
                    <span>{player.score}</span>
                    <span className="text-xs text-yellow-500 font-normal">coins</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onRematch}
            className="cyber-button flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-extrabold text-sm sm:text-base hover:from-yellow-300 hover:to-amber-400 shadow-[0_0_20px_rgba(255,230,0,0.35)] transition-all"
          >
            <RotateCcw size={18} />
            {isHost ? 'PLAY AGAIN' : 'REQUEST REMATCH'}
          </button>

          <button
            onClick={onLeave}
            className="cyber-button py-3.5 px-6 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 text-sm font-bold transition-all"
          >
            <Home size={18} />
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
