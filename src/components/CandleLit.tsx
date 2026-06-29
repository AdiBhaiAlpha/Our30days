import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { audio } from '../utils/audio';

interface CandleLitProps {
  litCount: number;
  totalCandles: number;
  onCandleLit: (index: number) => void;
  onAllLit: () => void;
}

const CANDLE_LABELS = [
  'First Hello ❤️',
  'Cute Smiles 😊',
  'Late Conversations 💬',
  'Silly Arguments 🤭',
  'Pure Promises 💍'
];

export default function CandleLit({ litCount, totalCandles, onCandleLit, onAllLit }: CandleLitProps) {
  // Trigger sound effect on individual candle light-up
  useEffect(() => {
    if (litCount > 0 && litCount <= totalCandles) {
      audio.playCandleSettleSound();
    }
    if (litCount === totalCandles) {
      onAllLit();
    }
  }, [litCount, totalCandles, onAllLit]);

  return (
    <div id="candle-grid-container" className="flex flex-col items-center justify-center w-full max-w-lg mx-auto py-6">
      {/* Candle Arrangement Row */}
      <div className="flex justify-around items-end gap-6 w-full h-48 px-4 relative mb-12">
        {Array.from({ length: totalCandles }).map((_, idx) => {
          const isLit = idx < litCount;
          // Vary the candle heights slightly for a more natural, handcrafted table look
          const heightClass = idx === 2 ? 'h-32' : idx % 2 === 0 ? 'h-24' : 'h-28';
          const delayOffset = idx * 0.1;

          return (
            <div
              key={idx}
              className="flex flex-col items-center relative cursor-pointer group"
              onClick={() => !isLit && onCandleLit(idx)}
            >
              {/* Flame and Glow container */}
              <div className="h-16 flex items-end justify-center relative w-full">
                <AnimatePresence>
                  {isLit && (
                    <>
                      {/* Radial Aura Glow Backing */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: [0.5, 0.7, 0.5],
                          scale: [1, 1.15, 1],
                        }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="absolute w-24 h-24 rounded-full bg-amber-500/10 blur-xl pointer-events-none -bottom-2"
                      />

                      {/* Realistic Flame */}
                      <motion.div
                        initial={{ scale: 0, y: 10 }}
                        animate={{
                          scale: [1, 1.05, 0.95, 1],
                          y: 0,
                          rotate: [-1, 2, -2, 1, -1],
                        }}
                        exit={{ scale: 0, y: 10 }}
                        transition={{
                          scale: { duration: 0.2 },
                          y: { duration: 0.2 },
                          rotate: {
                            duration: 1.8,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          },
                        }}
                        className="relative w-4 h-12 origin-bottom pointer-events-none flex items-end justify-center"
                      >
                        {/* Outer Flame (Orange) */}
                        <div className="absolute w-4 h-10 bg-amber-500 rounded-full blur-[1px] opacity-90 animate-pulse origin-bottom" style={{ borderRadius: '50% 50% 20% 20% / 60% 60% 40% 40%' }} />
                        
                        {/* Middle Flame (Yellow/Gold) */}
                        <div className="absolute w-2.5 h-7 bg-yellow-400 rounded-full blur-[0.5px] mb-1 origin-bottom" style={{ borderRadius: '50% 50% 20% 20% / 60% 60% 40% 40%' }} />
                        
                        {/* Inner Flame (Soft White Core) */}
                        <div className="absolute w-1.5 h-4 bg-white rounded-full mb-2 origin-bottom" style={{ borderRadius: '50% 50% 20% 20% / 60% 60% 40% 40%' }} />

                        {/* Blue bottom base flame */}
                        <div className="absolute w-2.5 h-2 bg-blue-600 rounded-full blur-[0.5px] opacity-60 bottom-0" />
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Black burned Wick */}
              <div className="w-0.5 h-2 bg-neutral-800 rounded-t-full relative z-10" />

              {/* Wax Body Column */}
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ type: 'spring', delay: delayOffset, stiffness: 100 }}
                className={`w-8 ${heightClass} rounded-t-sm rounded-b-md relative shadow-2xl origin-bottom overflow-hidden border border-rose-900/10`}
                style={{
                  background: isLit
                    ? 'linear-gradient(to right, #ff4d6d, #c9184a, #a4133c)'
                    : 'linear-gradient(to right, #7209b7, #560bad, #3f37c9)',
                  boxShadow: isLit
                    ? '0 0 15px rgba(255, 77, 109, 0.4), inset 1px 1px 2px rgba(255,255,255,0.2)'
                    : 'inset 1px 1px 2px rgba(255,255,255,0.05)',
                }}
              >
                {/* 3D Wax Melt lines/ribs */}
                <div className="absolute top-0 inset-x-0 h-2 bg-rose-400/20 rounded-full opacity-60 blur-[0.5px]" />
                <div className="absolute top-1 left-1.5 w-1 h-6 bg-rose-300/30 rounded-full" />
                <div className="absolute top-2 right-2 w-0.5 h-4 bg-rose-400/20 rounded-full" />

                {/* Shimmer overlay when lit */}
                {isLit && (
                  <motion.div
                    animate={{ opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-b from-yellow-300/20 via-transparent to-transparent pointer-events-none"
                  />
                )}
              </motion.div>

              {/* Candle Plate Holder */}
              <div className="w-12 h-1.5 bg-gradient-to-r from-neutral-800 to-neutral-700 rounded-full shadow-md border-t border-neutral-600/20" />

              {/* Little label beneath the candle */}
              <span className="mt-2 text-[10px] font-mono text-neutral-400 tracking-wider transition-colors group-hover:text-amber-400 text-center select-none">
                {CANDLE_LABELS[idx] || `Promise ${idx + 1}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
