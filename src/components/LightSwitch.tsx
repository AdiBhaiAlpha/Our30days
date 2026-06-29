import { useState } from 'react';
import { motion } from 'motion/react';
import { audio } from '../utils/audio';

interface LightSwitchProps {
  onToggle: (isOn: boolean) => void;
}

export default function LightSwitch({ onToggle }: LightSwitchProps) {
  const [isOn, setIsOn] = useState(false);

  const handleToggle = () => {
    audio.playSwitchSound();
    setIsOn(!isOn);
    onToggle(!isOn);
  };

  return (
    <div id="light-switch-wrapper" className="flex flex-col items-center justify-center">
      {/* Wall Plate Plate */}
      <div
        id="switch-plate"
        className="relative w-28 h-44 rounded-2xl bg-neutral-900 border-2 border-neutral-800 shadow-[inset_0_2px_5px_rgba(255,255,255,0.05),0_15px_30px_rgba(0,0,0,0.8)] flex items-center justify-center p-3 transition-colors duration-500"
        style={{
          boxShadow: isOn
            ? '0 0 40px rgba(212,175,55,0.25), inset 0 2px 5px rgba(255,255,255,0.1), 0 15px_30px rgba(0,0,0,0.8)'
            : '0 15px_30px rgba(0,0,0,0.8), inset 0 2px 5px rgba(255,255,255,0.05)',
          borderColor: isOn ? '#d4af37' : '#262626',
        }}
      >
        {/* Beveled edge border */}
        <div className="absolute inset-2 rounded-xl border border-neutral-800/60 pointer-events-none" />

        {/* Switch Body Housing */}
        <div
          id="switch-housing"
          className="relative w-16 h-28 rounded-lg bg-neutral-950 shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)] flex items-center justify-center overflow-hidden border border-neutral-900"
        >
          {/* Glowing Status Indicator LED */}
          <div
            id="led-indicator"
            className="absolute top-3 w-1.5 h-1.5 rounded-full transition-all duration-700"
            style={{
              backgroundColor: isOn ? '#d4af37' : '#3f3f46',
              boxShadow: isOn ? '0 0 8px #d4af37, 0 0 2px #d4af37' : 'none',
            }}
          />

          {/* Toggle Button Lever */}
          <button
            id="switch-lever"
            onClick={handleToggle}
            className="w-12 h-20 focus:outline-none relative group cursor-pointer"
            aria-label="Light Switch"
          >
            <motion.div
              animate={{
                rotateX: isOn ? -22 : 22,
                y: isOn ? 2 : -2,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{ transformPerspective: 300 }}
              className="w-full h-full rounded-md bg-gradient-to-b from-neutral-800 to-neutral-700 shadow-lg border border-neutral-600/30 flex flex-col justify-between p-1.5"
            >
              {/* Upper half details for depth */}
              <div
                className={`w-full h-1/2 rounded-t-sm transition-opacity duration-300 ${
                  isOn ? 'bg-neutral-600/20' : 'bg-neutral-800/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]'
                }`}
              />

              {/* Lower half details */}
              <div
                className={`w-full h-1/2 rounded-b-sm transition-opacity duration-300 ${
                  isOn ? 'bg-neutral-800/80 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.5)]' : 'bg-neutral-600/10'
                }`}
              />

              {/* Interactive subtle inner glow / dimple */}
              <div className="absolute inset-x-2 top-[45%] h-1 bg-neutral-900/60 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
            </motion.div>
          </button>
        </div>

        {/* Brand/Slogan subtle engraved detail */}
        <span className="absolute bottom-1.5 text-[7px] font-mono tracking-widest text-neutral-600 uppercase">
          {isOn ? 'LIT' : 'DARK'}
        </span>
      </div>

      <div className="mt-4 flex flex-col items-center gap-1.5">
        <span className="text-xs font-mono tracking-wider text-neutral-400 select-none">
          Click to turn on the lights
        </span>
      </div>
    </div>
  );
}
