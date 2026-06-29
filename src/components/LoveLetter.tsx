import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { audio } from '../utils/audio';
import { Scene } from '../types';

interface LoveLetterProps {
  onReadComplete: () => void;
}

export default function LoveLetter({ onReadComplete }: LoveLetterProps) {
  // Stages: 'particles' | 'feathers' | 'flying' | 'landed' | 'opening' | 'reading'
  const [stage, setStage] = useState<'particles' | 'feathers' | 'flying' | 'landed' | 'opening' | 'reading'>('particles');
  const [typedText, setTypedText] = useState('');
  const [typingIndex, setTypingIndex] = useState(0);
  const letterRef = useRef<HTMLDivElement>(null);

  const fullLetterText = `Dear Shreyoshi,

It’s hard to believe a whole month has passed since we first started talking. On May 29, 2026, my life changed in the most beautiful way possible.

Every message from you brings a smile to my face, and every phone call makes my heart beat faster. From our endless late-night chats to the cute little disagreements about who loves who more, every single second with you has felt like a dream.

You have this magical ability to make my darkest days incredibly bright. Your smile is my favorite view, your voice is my favorite melody, and your happiness is my absolute priority.

I want to promise you today that this is just the beginning. I will stand by you, laugh with you, care for you, and love you more and more with each passing day. 

Thank you for being my peace, my joy, and my favorite person in the entire world. Happy 1 Month Anniversary, my love! 💖

Forever Yours,
Chitron`;

  // Track state and transition timings
  useEffect(() => {
    // Initial music play
    audio.playSceneMusic(Scene.Letter, true);

    if (stage === 'particles') {
      const timer = setTimeout(() => {
        setStage('feathers');
      }, 2000);
      return () => clearTimeout(timer);
    }

    if (stage === 'feathers') {
      const timer = setTimeout(() => {
        setStage('flying');
      }, 2200);
      return () => clearTimeout(timer);
    }

    if (stage === 'flying') {
      const timer = setTimeout(() => {
        setStage('landed');
        audio.playEnvelopeSound();
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  // Typing Effect once the letter is opened
  useEffect(() => {
    if (stage !== 'reading') return;

    // Transition sound triggers
    audio.playSceneMusic(Scene.Letter, true);

    let textIdx = 0;
    const interval = setInterval(() => {
      if (textIdx < fullLetterText.length) {
        setTypedText((prev) => prev + fullLetterText.charAt(textIdx));
        textIdx++;
        setTypingIndex(textIdx);

        // Auto-scroll the letter box to mimic live handwriting feed
        if (letterRef.current) {
          letterRef.current.scrollTop = letterRef.current.scrollHeight;
        }
      } else {
        clearInterval(interval);
      }
    }, 45); // legible premium flow speed

    return () => clearInterval(interval);
  }, [stage]);

  const handleOpenEnvelope = () => {
    if (stage !== 'landed') return;
    setStage('opening');
    audio.playEnvelopeSound();

    setTimeout(() => {
      setStage('reading');
    }, 1200);
  };

  const handleSkipTyping = () => {
    setTypedText(fullLetterText);
    setTypingIndex(fullLetterText.length);
  };

  return (
    <div id="love-letter-scene" className="w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[500px] relative px-4 select-none">
      
      {/* Cinematic ambient spotlight behind envelope */}
      {stage === 'landed' && (
        <div className="absolute w-72 h-72 rounded-full bg-amber-400/5 blur-3xl pointer-events-none z-0" />
      )}

      <AnimatePresence mode="wait">
        
        {/* PHASE 1: Sparkling Magic Particles */}
        {stage === 'particles' && (
          <motion.div
            key="particles-stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center space-y-4 text-center h-64 relative w-full"
          >
            <div className="absolute w-48 h-48 bg-amber-300/10 rounded-full blur-2xl" />
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: (Math.random() - 0.5) * 300,
                  y: (Math.random() - 0.5) * 300,
                  scale: 0,
                  opacity: 0,
                }}
                animate={{
                  x: 0,
                  y: 0,
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  delay: i * 0.05,
                  ease: 'easeInOut',
                }}
                className="absolute w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_#f59e0b]"
              />
            ))}
            <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold animate-pulse">
              Magic Materializing
            </span>
          </motion.div>
        )}

        {/* PHASE 2: Swirling Feathers */}
        {stage === 'feathers' && (
          <motion.div
            key="feathers-stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center space-y-4 text-center h-64 relative w-full"
          >
            {Array.from({ length: 12 }).map((_, i) => {
              const startX = (Math.random() - 0.5) * 400;
              const angle = i * 30;
              return (
                <motion.div
                  key={i}
                  initial={{ x: startX, y: -200, rotate: 0, opacity: 0 }}
                  animate={{
                    x: [startX, startX + Math.sin(angle) * 80, startX + Math.cos(angle) * 40],
                    y: [250],
                    rotate: [0, 180, 360],
                    opacity: [0, 0.8, 0.8, 0],
                  }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: 'easeInOut',
                  }}
                  className="absolute pointer-events-none"
                >
                  {/* Elegant soft SVG feather outline */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" opacity="0.45" className="text-amber-100/60 filter drop-shadow">
                    <path d="M12 2C12 2 15 8 15 12C15 16 11 20 11 20C11 20 9 17 9 12C9 7 12 2 12 2Z" fill="currentColor" />
                    <path d="M12 2C12 2 9 8 9 12C9 16 11 20 11 20" stroke="currentColor" strokeWidth="0.5" />
                  </svg>
                </motion.div>
              );
            })}
            <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold">
              Synthesizing Letter
            </span>
          </motion.div>
        )}

        {/* PHASE 3: Flying Envelope */}
        {stage === 'flying' && (
          <motion.div
            key="flying-stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-64 flex items-center justify-center relative w-full overflow-visible"
          >
            {/* Flying envelope following wave path */}
            <motion.div
              animate={{
                x: [-150, -40, 60, 0],
                y: [40, -60, 30, 0],
                rotate: [-20, 15, -10, 0],
                scale: [0.6, 1.1, 0.85, 1],
              }}
              transition={{
                duration: 2.6,
                ease: 'easeInOut',
              }}
              className="w-56 h-36 bg-gradient-to-br from-amber-50 to-amber-100/90 rounded-lg border border-amber-200 shadow-2xl relative flex items-center justify-center"
            >
              {/* Golden sparkles leaving behind */}
              {Array.from({ length: 15 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{
                    x: (Math.random() - 0.5) * 80,
                    y: 60 + Math.random() * 40,
                    opacity: [0, 0.8, 0],
                    scale: [0.5, 1, 0.2],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.08,
                  }}
                  className="absolute w-1 h-1 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]"
                />
              ))}
              <span className="text-rose-500 text-lg animate-ping">❤️</span>
            </motion.div>
          </motion.div>
        )}

        {/* STAGE 4: Landed Envelope with spotlight and glowing wax seal */}
        {stage === 'landed' && (
          <motion.div
            key="envelope-landed"
            initial={{ y: 50, scale: 0.9, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 85 }}
            className="flex flex-col items-center justify-center relative"
          >
            {/* Soft backdrop glow */}
            <div className="absolute w-60 h-36 rounded-xl bg-amber-300/10 blur-xl pointer-events-none" />

            {/* Realistic Floating Envelope */}
            <motion.div
              id="envelope-body"
              onClick={handleOpenEnvelope}
              animate={{
                y: [0, -6, 0],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-56 h-36 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-300 shadow-2xl relative cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center"
            >
              {/* Flaps fold overlay */}
              <div className="absolute top-0 inset-x-0 h-0 border-t-[70px] border-t-amber-50/40 border-x-[112px] border-x-transparent pointer-events-none" />
              <div className="absolute bottom-0 inset-x-0 h-0 border-b-[90px] border-b-amber-100/80 border-x-[112px] border-x-transparent pointer-events-none" />
              <div className="absolute left-0 inset-y-0 w-0 border-l-[112px] border-l-amber-50/60 border-y-[72px] border-y-transparent pointer-events-none" />

              {/* Heart Wax Seal (Glows and pulses) */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  boxShadow: ['0 0 10px rgba(225,29,72,0.3)', '0 0 22px rgba(225,29,72,0.65)', '0 0 10px rgba(225,29,72,0.3)'],
                }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute w-12 h-12 bg-rose-600 rounded-full flex items-center justify-center border border-rose-500 z-10"
              >
                <span className="text-white text-lg drop-shadow">❤️</span>
              </motion.div>
            </motion.div>

            {/* Prompt text */}
            <p className="mt-8 text-sm font-sans italic text-neutral-300 text-center tracking-wide animate-pulse">
              I wrote a special letter for you. Open it.
            </p>

            <button
              id="open-letter-btn"
              onClick={handleOpenEnvelope}
              className="mt-4 px-6 py-2.5 rounded-full text-xs font-semibold text-neutral-900 bg-amber-400 hover:bg-amber-300 cursor-pointer shadow-lg shadow-amber-400/20"
            >
              Open Letter ✉️
            </button>
          </motion.div>
        )}

        {/* STAGE 5: Wax seal cracking & unfolding */}
        {stage === 'opening' && (
          <motion.div
            key="envelope-opening"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1.12, opacity: 0 }}
            transition={{ duration: 1.1 }}
            className="w-56 h-36 bg-amber-50 rounded-lg relative flex items-center justify-center border border-amber-200 shadow-2xl"
          >
            {/* Crack wax seal action */}
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: [1, 2.5], opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute w-12 h-12 bg-rose-600 rounded-full flex items-center justify-center z-10"
            >
              ❤️
            </motion.div>
          </motion.div>
        )}

        {/* STAGE 6: Unfolded parchment & handwriting typing */}
        {stage === 'reading' && (
          <motion.div
            key="letter-parchment"
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 90 }}
            className="w-full flex flex-col items-center"
          >
            {/* Parchment Sheet */}
            <div
              id="letter-parchment-sheet"
              className="w-full max-h-[460px] bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl p-6 md:p-8 overflow-y-auto relative"
              ref={letterRef}
              style={{
                backgroundImage: 'radial-gradient(#fbf8eb 70%, #f4ede0 100%)',
                boxShadow: 'inset 0 0 40px rgba(139, 90, 43, 0.08), 0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              }}
            >
              {/* Paper line rules decoration */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(180,140,90,0.03)_1px,transparent_1px)] bg-[size:100%_28px] pointer-events-none" />

              {/* Sacramento handwritten font rendering */}
              <p className="font-cursive text-2xl text-neutral-800 leading-relaxed whitespace-pre-wrap tracking-wide pr-2">
                {typedText}
                {typingIndex < fullLetterText.length && (
                  <span className="inline-block w-1.5 h-5 ml-1 bg-rose-500 animate-pulse align-middle" />
                )}
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 flex gap-4">
              {typingIndex < fullLetterText.length && (
                <button
                  id="skip-type-btn"
                  onClick={handleSkipTyping}
                  className="px-4 py-2 rounded-full border border-neutral-700 hover:border-neutral-500 text-xs text-neutral-400 bg-neutral-900/60 cursor-pointer transition-colors"
                >
                  Skip Typing ⚡
                </button>
              )}
              {typingIndex >= fullLetterText.length && (
                <motion.button
                  id="done-letter-btn"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={onReadComplete}
                  className="px-6 py-2.5 rounded-full text-xs font-semibold text-neutral-900 bg-amber-400 hover:bg-amber-300 cursor-pointer shadow-lg shadow-amber-400/20"
                >
                  Continue Journey 💫
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
