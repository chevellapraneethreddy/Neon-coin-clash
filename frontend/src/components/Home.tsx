import React, { useState } from 'react';
import { Play, Users, Sparkles, Volume2, VolumeX, ShieldCheck, Zap } from 'lucide-react';
import { sounds } from '../lib/sound.js';

interface HomeProps {
  onCreateRoom: (name: string) => void;
  onJoinRoomClick: (name: string) => void;
  isConnected: boolean;
}

export const Home: React.FC<HomeProps> = ({
  onCreateRoom,
  onJoinRoomClick,
  isConnected,
}) => {
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('ncc_player_name') || `Rider_${Math.floor(100 + Math.random() * 900)}`;
  });
  const [muted, setMuted] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.slice(0, 15);
    setPlayerName(val);
    localStorage.setItem('ncc_player_name', val);
  };

  const handleCreate = () => {
    onCreateRoom(playerName.trim() || 'Player 1');
  };

  const handleJoin = () => {
    onJoinRoomClick(playerName.trim() || 'Player 2');
  };

  const toggleSound = () => {
    const isNowMuted = sounds.toggleMute();
    setMuted(isNowMuted);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-4 py-8">
      {/* Sound Toggle & Status Bar */}
      <div className="w-full max-w-md flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-2 text-xs font-arcade tracking-wider">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isConnected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
            }`}
          />
          <span className="text-slate-400">
            {isConnected ? 'SERVER ONLINE' : 'CONNECTING TO SERVER...'}
          </span>
        </div>

        <button
          onClick={toggleSound}
          className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/80 text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/50 transition-all text-xs flex items-center gap-1.5"
          title={muted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          <span className="font-arcade">{muted ? 'MUTED' : 'SFX ON'}</span>
        </button>
      </div>

      {/* Main Title Hero */}
      <div className="text-center mb-8 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-arcade tracking-widest mb-3">
          <Zap size={14} className="animate-bounce" /> 2-8 PLAYER REALTIME ARCADE
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold font-arcade tracking-tighter uppercase mb-2">
          <span className="neon-text-cyan">NEON</span>{' '}
          <span className="neon-text-yellow">COIN</span>{' '}
          <span className="neon-text-magenta">CLASH</span>
        </h1>

        <p className="text-slate-300 text-base sm:text-lg font-cyber max-w-md mx-auto">
          Fast-paced multiplayer arena. Out-maneuver rivals, collect 10 coins, and dominate the leaderboard!
        </p>
      </div>

      {/* Action Card */}
      <div className="w-full max-w-md glass-panel rounded-2xl p-6 sm:p-8 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,245,255,0.12)]">
        {/* Name input */}
        <div className="mb-6">
          <label className="block text-xs font-arcade tracking-wider text-cyan-300 mb-2 uppercase flex items-center justify-between">
            <span>Pilot Handle / Name</span>
            <span className="text-slate-400 font-normal">{playerName.length}/15</span>
          </label>
          <input
            type="text"
            value={playerName}
            onChange={handleNameChange}
            placeholder="Enter your name..."
            maxLength={15}
            className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-cyan-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40 font-cyber text-lg tracking-wide transition-all"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3.5">
          <button
            onClick={handleCreate}
            disabled={!isConnected}
            className="cyber-button w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_20px_rgba(0,245,255,0.4)] text-base font-bold transition-all"
          >
            <Sparkles size={18} />
            CREATE ROOM
          </button>

          <button
            onClick={handleJoin}
            disabled={!isConnected}
            className="cyber-button w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:from-pink-400 hover:to-rose-500 shadow-[0_0_20px_rgba(255,0,127,0.35)] text-base font-bold transition-all"
          >
            <Users size={18} />
            JOIN ROOM
          </button>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400 font-cyber">
          <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800">
            <span className="block text-cyan-400 font-bold font-arcade text-sm">60s</span>
            Fast Rounds
          </div>
          <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800">
            <span className="block text-yellow-400 font-bold font-arcade text-sm">10 Coins</span>
            First to Win
          </div>
          <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800">
            <span className="block text-pink-400 font-bold font-arcade text-sm">2-8 P</span>
            Realtime Co-op
          </div>
        </div>
      </div>

      {/* Footer controls tip */}
      <div className="mt-8 text-center text-xs text-slate-400 font-cyber flex items-center gap-2">
        <ShieldCheck size={14} className="text-cyan-400" />
        Supports Desktop (WASD / Arrows) & Mobile (Touch Joystick)
      </div>
    </div>
  );
};
