import React, { useState } from 'react';
import { ArrowLeft, Sparkles, User, Zap } from 'lucide-react';

interface CreateRoomProps {
  initialName: string;
  onCreate: (name: string) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const CreateRoom: React.FC<CreateRoomProps> = ({
  initialName,
  onCreate,
  onBack,
  isLoading = false,
}) => {
  const [name, setName] = useState(initialName || 'Player 1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim());
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4">
      <div className="w-full max-w-md glass-panel rounded-2xl p-6 sm:p-8 border border-cyan-500/40 shadow-[0_0_30px_rgba(0,245,255,0.15)] relative">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-arcade text-slate-400 hover:text-cyan-400 mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> BACK TO MENU
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
            <Sparkles size={24} />
          </div>
          <h2 className="text-2xl font-bold font-arcade tracking-wider text-cyan-300 uppercase">
            Create Arena
          </h2>
          <p className="text-sm text-slate-400 font-cyber mt-1">
            Host a new match. You will get a 4-letter code to share with friends.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-arcade text-cyan-300 uppercase mb-2 flex items-center gap-1.5">
              <User size={14} /> Host Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 15))}
              maxLength={15}
              placeholder="Enter your name..."
              className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-cyan-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40 font-cyber text-lg tracking-wide"
              required
            />
          </div>

          <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-slate-300 font-cyber space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold font-arcade">
              <Zap size={13} /> HOST PRIVILEGES
            </div>
            <p>• Only the host can start the game</p>
            <p>• Minimum 2 players needed to launch (up to 8 players)</p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="cyber-button w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-base hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_20px_rgba(0,245,255,0.35)] transition-all"
          >
            {isLoading ? 'GENERATING ROOM...' : 'CREATE & ENTER LOBBY'}
          </button>
        </form>
      </div>
    </div>
  );
};
