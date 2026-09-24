import React, { useState, useEffect } from 'react';
import { Play, Users, Sparkles, Volume2, VolumeX, ShieldCheck, Zap, Settings, RefreshCw } from 'lucide-react';
import { sounds } from '../lib/sound.js';

interface HomeProps {
  onCreateRoom: (name: string) => void;
  onJoinRoomClick: (name: string) => void;
  isConnected: boolean;
  socketUrl?: string;
  connectionError?: string | null;
}

export const Home: React.FC<HomeProps> = ({
  onCreateRoom,
  onJoinRoomClick,
  isConnected,
  socketUrl = '',
  connectionError,
}) => {
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('ncc_player_name') || `Rider_${Math.floor(100 + Math.random() * 900)}`;
  });
  const [muted, setMuted] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [customUrl, setCustomUrl] = useState(() => {
    return localStorage.getItem('ncc_socket_url') || socketUrl || '';
  });
  const [connectTime, setConnectTime] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (!isConnected) {
      timer = setInterval(() => {
        setConnectTime((prev) => prev + 1);
      }, 1000);
    } else {
      setConnectTime(0);
    }
    return () => clearInterval(timer);
  }, [isConnected]);

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

  const saveCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      localStorage.setItem('ncc_socket_url', customUrl.trim());
    } else {
      localStorage.removeItem('ncc_socket_url');
    }
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-4 py-8">
      {/* Sound Toggle & Status Bar */}
      <div className="w-full max-w-md flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-2 text-xs font-arcade tracking-wider">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isConnected
                ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                : 'bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse'
            }`}
          />
          <span className={isConnected ? 'text-emerald-400' : 'text-slate-400'}>
            {isConnected ? 'SERVER ONLINE' : 'CONNECTING TO SERVER...'}
          </span>
          {!isConnected && (
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="text-slate-500 hover:text-cyan-400 ml-1 transition-colors"
              title="Configure Server URL"
            >
              <Settings size={13} />
            </button>
          )}
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

      {/* Connection troubleshooting helper if taking > 4s or if config open */}
      {(!isConnected && connectTime >= 4) || showConfig ? (
        <div className="w-full max-w-md mb-6 p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-xs text-slate-300 font-cyber shadow-lg">
          <div className="flex items-center justify-between font-arcade text-cyan-300 mb-2">
            <span className="flex items-center gap-1.5">
              <RefreshCw size={13} className={!isConnected ? 'animate-spin' : ''} />
              BACKEND CONNECTION STATUS
            </span>
            <button
              onClick={() => setShowConfig(false)}
              className="text-slate-500 hover:text-white"
            >
              ✕
            </button>
          </div>

          <p className="text-slate-400 mb-2">
            Targeting server:{' '}
            <span className="font-mono text-cyan-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 break-all">
              {socketUrl || 'http://localhost:3001'}
            </span>
          </p>

          {!isConnected && connectTime >= 8 && (
            <p className="text-amber-400/90 mb-3 bg-amber-950/30 p-2 rounded border border-amber-500/30">
              💡 <strong>Render Free Tier Note:</strong> Render services sleep after 15 minutes of inactivity and can take ~30–50 seconds to wake up on the first connection. Please wait a moment.
            </p>
          )}

          {connectionError && (
            <p className="text-rose-400 mb-2 bg-rose-950/30 p-2 rounded border border-rose-500/30">
              Error: {connectionError}
            </p>
          )}

          <form onSubmit={saveCustomUrl} className="mt-3 pt-3 border-t border-slate-800 space-y-2">
            <label className="block text-[11px] font-arcade text-slate-400">
              Render Backend URL (override):
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://YOUR-BACKEND.onrender.com"
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-cyan-200 text-xs font-mono focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-cyan-500 text-black font-arcade font-bold text-xs hover:bg-cyan-400"
              >
                CONNECT
              </button>
            </div>
          </form>
        </div>
      ) : null}

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
