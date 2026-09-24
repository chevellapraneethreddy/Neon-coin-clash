import React, { useState } from 'react';
import { ArrowLeft, KeyRound, User, Users } from 'lucide-react';

interface JoinRoomProps {
  initialName: string;
  onJoin: (code: string, name: string) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const JoinRoom: React.FC<JoinRoomProps> = ({
  initialName,
  onJoin,
  onBack,
  isLoading = false,
}) => {
  const [name, setName] = useState(initialName || 'Player 2');
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    onJoin(code.trim().toUpperCase(), name.trim());
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4">
      <div className="w-full max-w-md glass-panel rounded-2xl p-6 sm:p-8 border border-pink-500/40 shadow-[0_0_30px_rgba(255,0,127,0.15)] relative">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-arcade text-slate-400 hover:text-pink-400 mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> BACK TO MENU
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-3">
            <Users size={24} />
          </div>
          <h2 className="text-2xl font-bold font-arcade tracking-wider text-pink-300 uppercase">
            Join Arena
          </h2>
          <p className="text-sm text-slate-400 font-cyber mt-1">
            Enter the 4-6 letter code provided by your lobby host.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-arcade text-pink-300 uppercase mb-2 flex items-center gap-1.5">
              <KeyRound size={14} /> Room Code
            </label>
            <input
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder="e.g. 7X3K"
              maxLength={6}
              className="w-full text-center px-4 py-3 rounded-xl bg-slate-900/90 border border-pink-500/40 text-pink-300 placeholder-slate-600 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-500/40 font-arcade text-2xl tracking-[0.25em] uppercase font-bold"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-arcade text-pink-300 uppercase mb-2 flex items-center gap-1.5">
              <User size={14} /> Player Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 15))}
              maxLength={15}
              placeholder="Enter your name..."
              className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-pink-500/40 text-pink-200 placeholder-slate-500 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-500/40 font-cyber text-lg tracking-wide"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !code.trim() || !name.trim()}
            className="cyber-button w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-base hover:from-pink-400 hover:to-rose-500 shadow-[0_0_20px_rgba(255,0,127,0.35)] transition-all"
          >
            {isLoading ? 'CONNECTING...' : 'JOIN ROOM'}
          </button>
        </form>
      </div>
    </div>
  );
};
