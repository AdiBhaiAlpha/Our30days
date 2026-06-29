import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface LoveCounterProps {
  onCounterComplete: () => void;
}

export default function LoveCounter({ onCounterComplete }: LoveCounterProps) {
  const [elapsed, setElapsed] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Relationship Start Date: May 29, 2026 (assuming midnight)
    const startDate = new Date('2026-05-29T00:00:00').getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const diff = now - startDate;

      if (diff <= 0) {
        setElapsed({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const msecPerDay = 1000 * 60 * 60 * 24;
      const msecPerHour = 1000 * 60 * 60;
      const msecPerMin = 1000 * 60;

      const days = Math.floor(diff / msecPerDay);
      const hours = Math.floor((diff % msecPerDay) / msecPerHour);
      const minutes = Math.floor((diff % msecPerHour) / msecPerMin);
      const seconds = Math.floor((diff % msecPerMin) / 1000);

      setElapsed({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const timeBlocks = [
    { label: 'Days', value: elapsed.days, color: 'from-amber-400 to-yellow-500' },
    { label: 'Hours', value: elapsed.hours, color: 'from-pink-500 to-rose-600' },
    { label: 'Minutes', value: elapsed.minutes, color: 'from-purple-500 to-indigo-600' },
    { label: 'Seconds', value: elapsed.seconds, color: 'from-cyan-400 to-blue-500' },
  ];

  return (
    <div id="love-counter-scene" className="w-full py-8 px-4 flex flex-col items-center">
      {/* Label */}
      <div className="text-center mb-10 select-none">
        <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">
          Live Counter
        </span>
        <h2 className="text-3xl font-serif font-bold text-neutral-100 mt-2 tracking-tight">
          We've Been Together For
        </h2>
        <p className="text-xs text-neutral-400 mt-2 italic">
          "Counting every single heartbeat since May 29, 2026."
        </p>
      </div>

      {/* Grid of counters */}
      <div className="grid grid-cols-2 gap-4 max-w-sm w-full px-2 mb-10">
        {timeBlocks.map((block, idx) => (
          <motion.div
            key={block.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay: idx * 0.1, stiffness: 120 }}
            className="bg-neutral-950/60 backdrop-blur-md border border-neutral-800/80 rounded-2xl p-5 flex flex-col items-center justify-center shadow-[0_15px_30px_rgba(0,0,0,0.7)] relative overflow-hidden group"
          >
            {/* Soft inner color beam glow */}
            <div className={`absolute -bottom-8 w-16 h-16 rounded-full bg-gradient-to-tr ${block.color} opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-300 pointer-events-none`} />

            {/* Value */}
            <motion.span
              key={block.value}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-4xl font-mono font-bold tracking-tight bg-gradient-to-r from-neutral-50 via-neutral-100 to-neutral-200 bg-clip-text text-transparent group-hover:text-amber-400 transition-colors duration-300"
            >
              {String(block.value).padStart(2, '0')}
            </motion.span>

            {/* Label */}
            <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase mt-2 group-hover:text-amber-300/60 transition-colors">
              {block.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Heartbeat pulse details */}
      <div className="flex gap-2 items-center justify-center mb-10 opacity-70">
        <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping absolute" />
        <div className="w-2.5 h-2.5 bg-rose-600 rounded-full" />
        <span className="text-xs font-mono tracking-wider text-neutral-400 select-none">
          Live Connection Established
        </span>
      </div>

      {/* Narrative Button */}
      <div>
        <motion.button
          id="counter-done-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCounterComplete}
          className="px-6 py-2.5 rounded-full text-xs font-semibold text-neutral-900 bg-amber-400 hover:bg-amber-300 cursor-pointer shadow-lg shadow-amber-400/20"
        >
          A Special Ending... 💖
        </motion.button>
      </div>
    </div>
  );
}
