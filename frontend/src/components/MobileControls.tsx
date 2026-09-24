import React, { useRef, useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import type { PlayerInput } from '../types/game.js';

interface MobileControlsProps {
  onInputChange: (input: PlayerInput) => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ onInputChange }) => {
  const [activeDir, setActiveDir] = useState<PlayerInput>({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  const joystickRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Sync state to parent input callback
  const updateInput = (newInput: PlayerInput) => {
    setActiveDir(newInput);
    onInputChange(newInput);
  };

  // Virtual Joystick Touch Handling
  const handleTouch = (clientX: number, clientY: number) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.hypot(dx, dy);
    const maxRadius = rect.width / 2 - 10;

    const angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(distance, maxRadius);

    const clampedX = Math.cos(angle) * clampedDist;
    const clampedY = Math.sin(angle) * clampedDist;
    setKnobPos({ x: clampedX, y: clampedY });

    // Dead zone check (10px)
    if (distance > 10) {
      const threshold = 0.35;
      const nx = dx / distance;
      const ny = dy / distance;

      updateInput({
        right: nx > threshold,
        left: nx < -threshold,
        down: ny > threshold,
        up: ny < -threshold,
      });
    } else {
      updateInput({ up: false, down: false, left: false, right: false });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const touch = e.touches[0];
    handleTouch(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isDragging) return;
    const touch = e.touches[0];
    handleTouch(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setKnobPos({ x: 0, y: 0 });
    updateInput({ up: false, down: false, left: false, right: false });
  };

  // Button-based D-pad helpers for quick tapping
  const setDirection = (key: keyof PlayerInput, val: boolean) => {
    const next = { ...activeDir, [key]: val };
    updateInput(next);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      onInputChange({ up: false, down: false, left: false, right: false });
    };
  }, [onInputChange]);

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 px-4 flex items-center justify-between pointer-events-none md:hidden max-w-lg mx-auto">
      {/* Virtual Analog Joystick */}
      <div
        ref={joystickRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="relative w-28 h-28 rounded-full bg-slate-900/80 border-2 border-cyan-500/40 shadow-[0_0_20px_rgba(0,245,255,0.25)] flex items-center justify-center pointer-events-auto touch-none"
      >
        {/* Joystick Axis crosshair */}
        <div className="absolute inset-x-4 h-px bg-cyan-500/20 top-1/2" />
        <div className="absolute inset-y-4 w-px bg-cyan-500/20 left-1/2" />

        {/* Joystick Knob */}
        <div
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-600 to-cyan-400 border border-white shadow-[0_0_12px_#00f5ff] transition-transform duration-75 flex items-center justify-center pointer-events-none"
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
        >
          <div className="w-4 h-4 rounded-full bg-white/60" />
        </div>
      </div>

      {/* Discrete 4-Way D-Pad on the right */}
      <div className="relative w-32 h-32 pointer-events-auto grid grid-cols-3 grid-rows-3 gap-1 touch-none">
        {/* UP */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            setDirection('up', true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            setDirection('up', false);
          }}
          className={`col-start-2 row-start-1 rounded-xl flex items-center justify-center border font-bold transition-all ${
            activeDir.up
              ? 'bg-cyan-400 text-black border-white shadow-[0_0_15px_#00f5ff]'
              : 'bg-slate-900/80 text-cyan-300 border-cyan-500/40'
          }`}
        >
          <ArrowUp size={22} />
        </button>

        {/* LEFT */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            setDirection('left', true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            setDirection('left', false);
          }}
          className={`col-start-1 row-start-2 rounded-xl flex items-center justify-center border font-bold transition-all ${
            activeDir.left
              ? 'bg-cyan-400 text-black border-white shadow-[0_0_15px_#00f5ff]'
              : 'bg-slate-900/80 text-cyan-300 border-cyan-500/40'
          }`}
        >
          <ArrowLeft size={22} />
        </button>

        {/* CENTER PIVOT */}
        <div className="col-start-2 row-start-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-cyan-500/40" />
        </div>

        {/* RIGHT */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            setDirection('right', true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            setDirection('right', false);
          }}
          className={`col-start-3 row-start-2 rounded-xl flex items-center justify-center border font-bold transition-all ${
            activeDir.right
              ? 'bg-cyan-400 text-black border-white shadow-[0_0_15px_#00f5ff]'
              : 'bg-slate-900/80 text-cyan-300 border-cyan-500/40'
          }`}
        >
          <ArrowRight size={22} />
        </button>

        {/* DOWN */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            setDirection('down', true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            setDirection('down', false);
          }}
          className={`col-start-2 row-start-3 rounded-xl flex items-center justify-center border font-bold transition-all ${
            activeDir.down
              ? 'bg-cyan-400 text-black border-white shadow-[0_0_15px_#00f5ff]'
              : 'bg-slate-900/80 text-cyan-300 border-cyan-500/40'
          }`}
        >
          <ArrowDown size={22} />
        </button>
      </div>
    </div>
  );
};
