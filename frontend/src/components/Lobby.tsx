import React, { useState } from 'react';
import { Copy, Check, Crown, Play, LogOut, Users, Info } from 'lucide-react';
import type { Player } from '../types/game.js';

interface LobbyProps {
  roomCode: string;
  players: Player[];
  currentPlayerId: string | null;
  isHost: boolean;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  roomCode,
  players,
  currentPlayerId,
  isHost,
  onStartGame,
  onLeaveRoom,
}) => {
  const [copied, setCopied] = useState(false);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canStart = isHost && players.length >= 2;

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-6">
      <div className="w-full max-w-xl glass-panel rounded-2xl p-6 sm:p-8 border border-cyan-500/40 shadow-[0_0_35px_rgba(0,245,255,0.15)] relative">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-arcade tracking-widest text-cyan-400 uppercase">
              LOBBY ACTIVE
            </span>
          </div>

          <button
            onClick={onLeaveRoom}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:text-rose-200 hover:border-rose-400 text-xs font-arcade transition-all"
          >
            <LogOut size={14} /> LEAVE
          </button>
        </div>

        {/* Room Code Display Box */}
        <div className="text-center mb-8">
          <span className="text-xs font-arcade tracking-widest text-slate-400 uppercase block mb-1">
            Arena Room Code
          </span>
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-900/90 border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(0,245,255,0.25)]">
            <span className="font-arcade text-3xl sm:text-4xl tracking-[0.25em] font-black text-cyan-300">
              {roomCode}
            </span>
            <button
              onClick={copyRoomCode}
              className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 transition-all"
              title="Copy Room Code"
            >
              {copied ? <Check size={20} className="text-emerald-400" /> : <Copy size={20} />}
            </button>
          </div>
          {copied && (
            <p className="text-xs font-cyber text-emerald-400 mt-2 animate-bounce">
              Code copied to clipboard! Share with friends.
            </p>
          )}
        </div>

        {/* Player Roster Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-arcade text-slate-300 uppercase mb-3">
            <span className="flex items-center gap-1.5">
              <Users size={15} className="text-cyan-400" /> Connected Pilots
            </span>
            <span className="text-cyan-400 font-bold">
              {players.length} / 8 PLAYERS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {players.map((p) => {
              const isCurrent = p.id === currentPlayerId;
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_12px_rgba(0,245,255,0.2)]'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Player Color Disc */}
                    <div
                      className="w-4 h-4 rounded-full border border-white/60 shadow-[0_0_8px_var(--glow)]"
                      style={
                        {
                          backgroundColor: p.color,
                          '--glow': p.color,
                        } as React.CSSProperties
                      }
                    />

                    <div className="flex flex-col">
                      <span className="text-sm font-cyber font-bold tracking-wide text-slate-200">
                        {p.name}
                        {isCurrent && (
                          <span className="ml-1.5 text-[10px] font-arcade px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                            YOU
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {p.isHost && (
                    <span className="flex items-center gap-1 text-[11px] font-arcade px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 font-semibold">
                      <Crown size={12} /> HOST
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Start Game / Waiting Section */}
        <div className="pt-2">
          {isHost ? (
            <div className="space-y-3">
              <button
                onClick={onStartGame}
                disabled={!canStart}
                className="cyber-button w-full py-4 px-6 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-black font-extrabold text-lg hover:from-yellow-300 hover:to-orange-400 shadow-[0_0_25px_rgba(255,230,0,0.4)] transition-all"
              >
                <Play size={20} className="fill-black" />
                START BATTLE
              </button>

              {!canStart && (
                <div className="flex items-center justify-center gap-1.5 text-xs font-cyber text-amber-400/90 text-center">
                  <Info size={14} /> Waiting for at least 1 more player to join (2 players required).
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
              <div className="inline-flex items-center gap-2 text-cyan-400 font-arcade text-sm animate-pulse mb-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                WAITING FOR HOST TO LAUNCH...
              </div>
              <p className="text-xs text-slate-400 font-cyber">
                Get ready! Round will begin as soon as the host initiates the countdown.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
