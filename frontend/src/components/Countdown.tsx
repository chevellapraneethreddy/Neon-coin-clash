import React from 'react';

interface CountdownProps {
  count: number;
}

export const Countdown: React.FC<CountdownProps> = ({ count }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="text-center relative">
        <div className="text-xs sm:text-sm font-arcade tracking-[0.4em] text-cyan-400 uppercase mb-4 animate-pulse">
          MATCH STARTING IN
        </div>

        <div className="relative">
          <div
            key={count}
            className="font-arcade text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-amber-400 to-orange-500 drop-shadow-[0_0_40px_rgba(255,230,0,0.8)] animate-bounce"
          >
            {count > 0 ? count : 'GO!'}
          </div>
        </div>

        <div className="text-sm font-cyber text-slate-300 tracking-wider mt-6">
          GET READY TO DASH FOR COINS!
        </div>
      </div>
    </div>
  );
};
