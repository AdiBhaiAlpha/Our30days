import { useState, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'motion/react';
import { audio } from '../utils/audio';
import { Scene } from '../types';

interface AnniversaryCakeProps {
  onCut: () => void;
}

export default function AnniversaryCake({ onCut }: AnniversaryCakeProps) {
  // Steps: 
  // 'assembling' (gathering particles)
  // 'rising' (slow materialization and rotation)
  // 'wish' (dim lights, spotlight, candle flicker)
  // 'readyToCut' (knife appears)
  // 'cutting' (presses down, squash)
  // 'cut' (splits, blowout smoke, spark particles)
  // 'celebrating' (exploding balloons, fireworks, ribbons)
  const [step, setStep] = useState<'assembling' | 'rising' | 'wish' | 'readyToCut' | 'cutting' | 'cut' | 'celebrating'>('assembling');
  const [showKnife, setShowKnife] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [cameraShake, setCameraShake] = useState(false);
  
  // Confetti / Ribbons list for celebratory blast
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; color: string; size: number; delay: number; type: 'circle' | 'rect' | 'heart' | 'ribbon' }[]>([]);
  const [balloons, setBalloons] = useState<{ id: number; x: number; color: 'gold' | 'white'; size: number; speed: number; popped: boolean }[]>([]);

  const cakeControls = useAnimation();
  const knifeControls = useAnimation();

  // Initialize scene music on load and step changes
  useEffect(() => {
    audio.playSceneMusic(Scene.Cake, true, step);
  }, [step]);

  // Stage sequence: materializing and rising
  useEffect(() => {
    const assemblyTimer = setTimeout(() => {
      setStep('rising');
      cakeControls.start({
        y: 0,
        opacity: 1,
        scale: 1,
        rotate: 360,
        transition: { duration: 2.8, ease: 'easeOut' },
      }).then(() => {
        setStep('wish');
      });
    }, 1500);

    // Populate celebratory background balloons
    const generatedBalloons = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: 10 + Math.random() * 80, // % from left
      color: Math.random() > 0.5 ? 'gold' as const : 'white' as const,
      size: 24 + Math.random() * 24,
      speed: 6 + Math.random() * 8,
      popped: false,
    }));
    setBalloons(generatedBalloons);

    return () => clearTimeout(assemblyTimer);
  }, [cakeControls]);

  useEffect(() => {
    if (step === 'wish') {
      const timer = setTimeout(() => {
        setStep('readyToCut');
        setShowKnife(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleCutCake = async () => {
    if (step !== 'readyToCut') return;
    setStep('cutting');
    audio.playClickSound();

    // 1. Knife entry with sliding cinematic rotation
    await knifeControls.start({
      rotate: -35,
      x: -45,
      y: 10,
      opacity: 1,
      transition: { duration: 0.6, ease: 'easeOut' },
    });

    // 2. Squash cake slightly before cutting (anticipation)
    await cakeControls.start({
      scaleY: 0.88,
      scaleX: 1.04,
      transition: { duration: 0.25, ease: 'easeInOut' },
    });

    // 3. Knife slices down, sound triggers, and camera shakes
    audio.playCakeSliceSound();
    audio.playCandleBlowoutSound();

    // Trigger photo flash & shake
    setFlashActive(true);
    setCameraShake(true);
    setTimeout(() => setFlashActive(false), 250);
    setTimeout(() => setCameraShake(false), 700);

    await Promise.all([
      knifeControls.start({
        y: 125,
        x: -45,
        rotate: -60,
        opacity: 0,
        transition: { duration: 0.35, ease: 'easeIn' },
      }),
      cakeControls.start({
        scaleY: 1.0,
        scaleX: 1.0,
        transition: { duration: 0.15, ease: 'easeOut' },
      }),
    ]);

    // 4. Split cake, extinguish candles
    setStep('cut');
    audio.playBalloonPopSound();

    // 5. Generate high density celebration particles
    const celebratoryConfetti = Array.from({ length: 80 }).map((_, i) => {
      const colors = ['#d4af37', '#ffffff', '#ff4d6d', '#ff85a1', '#f43f5e', '#fbbf24', '#38bdf8'];
      const types: ('circle' | 'rect' | 'heart' | 'ribbon')[] = ['circle', 'rect', 'heart', 'ribbon'];
      return {
        id: i,
        x: -50 + Math.random() * 100, // offset from center
        y: -100 - Math.random() * 200,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 10,
        delay: Math.random() * 0.5,
        type: types[Math.floor(Math.random() * types.length)],
      };
    });
    setConfetti(celebratoryConfetti);

    // Trigger fireworks audio and celebrate transition
    audio.playFireworkSound();
    setStep('celebrating');

    // Proceed to next screen after 7.5 seconds of pure celebratory magic
    setTimeout(() => {
      onCut();
    }, 7500);
  };

  const popBalloon = (id: number) => {
    audio.playBalloonPopSound();
    setBalloons((prev) =>
      prev.map((b) => (b.id === id ? { ...b, popped: true } : b))
    );
  };

  return (
    <div 
      id="cake-scene-container" 
      className={`flex flex-col items-center justify-center w-full min-h-[500px] relative overflow-hidden transition-all duration-700 ${
        cameraShake ? 'animate-bounce' : ''
      }`}
      style={{
        transform: cameraShake ? 'translate(2px, 3px) rotate(0.5deg)' : 'none',
      }}
    >
      {/* 1. Cinematic Lighting and Atmosphere */}
      {/* Dim room/backdrop shade */}
      <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[1px] pointer-events-none z-0" />
      
      {/* Hanging Golden Fairy Lights */}
      <div className="absolute top-0 inset-x-0 h-10 flex justify-around pointer-events-none z-10">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{
              duration: 1 + Math.random() * 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.1,
            }}
            className="w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_#f59e0b] mt-1"
          />
        ))}
        {/* String wire */}
        <div className="absolute top-1.5 left-0 right-0 h-[1px] bg-neutral-800/60" />
      </div>

      {/* Golden spotlight centered on table */}
      <div className={`absolute top-12 w-80 h-80 rounded-full bg-amber-400/${step === 'wish' ? '10' : '5'} blur-3xl transition-opacity duration-1000 pointer-events-none z-10`} />

      {/* 2. Background Drifting Balloons (Gold & White) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {balloons.map((balloon) => (
          <AnimatePresence key={balloon.id}>
            {!balloon.popped && (
              <motion.div
                initial={{ y: 550, opacity: 0 }}
                animate={{ y: -100, opacity: [0, 0.75, 0.75, 0] }}
                transition={{
                  duration: balloon.speed,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: balloon.id * 0.4,
                }}
                className="absolute cursor-pointer pointer-events-auto"
                style={{ left: `${balloon.x}%` }}
                onClick={() => popBalloon(balloon.id)}
              >
                {/* Balloon shape */}
                <div 
                  className={`w-8 h-10 rounded-full shadow-lg relative flex flex-col items-center ${
                    balloon.color === 'gold' 
                      ? 'bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-100 border border-amber-300' 
                      : 'bg-gradient-to-tr from-neutral-200 via-neutral-100 to-white border border-neutral-300'
                  }`}
                  style={{ width: balloon.size, height: balloon.size * 1.2 }}
                >
                  {/* Gloss highlight reflection */}
                  <div className="absolute top-1.5 left-2 w-1.5 h-3 bg-white/60 rounded-full rotate-12" />
                  {/* Knot */}
                  <div className={`absolute -bottom-1 w-2 h-2 ${balloon.color === 'gold' ? 'bg-amber-500' : 'bg-neutral-300'} rotate-45`} />
                </div>
                {/* String wire hanging */}
                <div className="w-[1px] h-12 bg-neutral-600/30 mx-auto" />
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>

      {/* 3. Narrative Interactive Prompts */}
      <div className="h-16 flex items-center justify-center text-center px-4 mb-4 relative z-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.5 }}
            className="max-w-xs"
          >
            {step === 'assembling' && (
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold">Materializing Magic</span>
                <p className="text-xs font-sans italic text-neutral-400 tracking-wider">
                  Gathering stardust to bake a memory...
                </p>
              </div>
            )}
            {step === 'rising' && (
              <p className="text-sm font-sans italic text-neutral-400 tracking-wider">
                Something beautiful is arriving...
              </p>
            )}
            {step === 'wish' && (
              <div className="space-y-1">
                <p className="text-lg font-serif font-semibold text-amber-300 tracking-wide animate-pulse">
                  ✨ Make a wish, Sayantika... ✨
                </p>
                <p className="text-[10px] font-sans text-neutral-400">Close your eyes and breathe in the love.</p>
              </div>
            )}
            {step === 'readyToCut' && (
              <p className="text-base font-sans font-medium text-neutral-200 tracking-wide">
                "Now, let's cut our anniversary cake."
              </p>
            )}
            {step === 'cutting' && (
              <p className="text-base font-sans italic text-amber-400 animate-pulse">
                Slicing with love... 💖
              </p>
            )}
            {(step === 'cut' || step === 'celebrating') && (
              <div className="space-y-1">
                <p className="text-xl font-serif font-bold text-amber-300 tracking-wider">
                  🎉 Happy 1 Month Anniversary! 🎉
                </p>
                <p className="text-[10px] font-mono text-neutral-400 tracking-widest">CHITRON ❤️ SAYANTIKA</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 4. Magic Particles (Assembling Phase) */}
      {step === 'assembling' && (
        <div className="absolute w-72 h-64 flex items-center justify-center pointer-events-none z-10">
          {Array.from({ length: 25 }).map((_, i) => {
            const angle = (i * 360) / 25;
            const radius = 100 + Math.random() * 50;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;
            return (
              <motion.div
                key={i}
                initial={{ x, y, opacity: 0, scale: 0 }}
                animate={{ x: 0, y: 0, opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.05,
                  ease: 'easeInOut',
                }}
                className="absolute w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b]"
              />
            );
          })}
        </div>
      )}

      {/* 5. Photographic Flash Effect on Cut */}
      <AnimatePresence>
        {flashActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-white z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* 6. Interactive Knife Overlay */}
      {showKnife && (
        <motion.div
          animate={knifeControls}
          initial={{ opacity: 0, y: -70, x: 60, rotate: 18 }}
          style={{ originX: 0.9, originY: 0.1 }}
          className="absolute z-30 pointer-events-none top-24"
        >
          <svg width="130" height="40" viewBox="0 0 120 40" fill="none" className="drop-shadow-[0_12px_20px_rgba(0,0,0,0.7)]">
            {/* Shimmer metal blade */}
            <path d="M10 20 L80 12 C90 12, 100 18, 105 20 L80 28 Z" fill="url(#blade-grad)" stroke="#fff" strokeWidth="0.5" />
            {/* Highlight line */}
            <path d="M15 19 L75 14" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
            {/* Knife Handle (Deep mahogany/Rosewood) */}
            <rect x="5" y="16" width="30" height="8" rx="2.5" fill="#4a1515" stroke="#2a0505" strokeWidth="1" />
            {/* Gold bolts on handle */}
            <circle cx="10" cy="20" r="1.2" fill="#d4af37" />
            <circle cx="20" cy="20" r="1.2" fill="#d4af37" />
            <circle cx="28" cy="20" r="1.2" fill="#d4af37" />
            <defs>
              <linearGradient id="blade-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f1f5f9" />
                <stop offset="35%" stopColor="#cbd5e1" />
                <stop offset="65%" stopColor="#64748b" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      )}

      {/* 7. The 3D Layered Cake Assembly */}
      <motion.div
        animate={cakeControls}
        initial={{ y: 150, opacity: 0, scale: 0.7 }}
        className="relative w-80 h-64 flex flex-col items-center justify-end z-20 select-none"
      >
        {/* Shimmer glowing golden backdrop sparkles behind cake */}
        <div className="absolute top-10 inset-x-0 bottom-4 overflow-hidden pointer-events-none">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -40, 0],
                opacity: [0, 0.65, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2.5 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.15,
              }}
              className="absolute w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]"
              style={{
                left: `${15 + Math.random() * 70}%`,
                bottom: `${Math.random() * 40}px`,
              }}
            />
          ))}
        </div>

        {/* Silver Stand Plate base */}
        <div className="w-64 h-6 bg-gradient-to-r from-neutral-300 via-neutral-100 to-neutral-400 rounded-full shadow-lg border-b-2 border-neutral-500/40 relative z-10 flex items-center justify-center">
          <div className="w-60 h-4 bg-gradient-to-r from-neutral-400 via-neutral-200 to-neutral-500 rounded-full opacity-60" />
          <div className="absolute -bottom-4 w-12 h-6 bg-gradient-to-r from-neutral-400 to-neutral-500 rounded-b-md shadow-md" />
        </div>

        {/* Cake Slices container - moves apart when cut */}
        <div className="w-full flex justify-center items-end absolute bottom-5 z-20">
          {/* Left Cake Half */}
          <motion.div
            animate={{
              x: step === 'celebrating' || step === 'cut' ? -28 : 0,
              rotate: step === 'celebrating' || step === 'cut' ? -6 : 0,
            }}
            transition={{ type: 'spring', stiffness: 95, damping: 11 }}
            className="w-1/2 flex justify-end origin-bottom"
          >
            <div className="w-28 h-36 relative overflow-visible">
              {/* Left Cake Layer Render */}
              <div
                className="w-full h-28 absolute bottom-0 rounded-tl-3xl bg-gradient-to-br from-rose-500 via-rose-600 to-rose-800 border-l border-b border-rose-950/20 shadow-2xl"
                style={{ clipPath: 'polygon(0% 0%, 100% 5%, 100% 100%, 0% 100%)' }}
              >
                {/* Frosting dripping detail */}
                <div className="absolute top-0 inset-x-0 h-4 bg-neutral-100 rounded-b-lg opacity-95 blur-[0.2px] border-b border-pink-100" />
                <div className="absolute top-3 left-4 w-1 h-3 bg-neutral-100 rounded-full opacity-90" />
                <div className="absolute top-3 left-10 w-1 h-4 bg-neutral-100 rounded-full opacity-90" />
                
                {/* Inside red-velvet cake sponge profile (exposed on cut side) */}
                {(step === 'cut' || step === 'celebrating') && (
                  <div className="absolute right-0 top-0 bottom-0 w-3.5 bg-gradient-to-b from-neutral-900 via-rose-900 to-neutral-900 shadow-inner flex flex-col justify-around py-3 pl-[1px]">
                    <div className="h-2.5 w-full bg-amber-100 opacity-90 shadow-sm" /> {/* Cream layer */}
                    <div className="h-2.5 w-full bg-amber-100 opacity-90 shadow-sm" />
                  </div>
                )}
              </div>

              {/* Candles on Left Half */}
              <div className="absolute -top-7 left-8 flex flex-col items-center">
                {/* Candle 1 flame if not cut */}
                {(step !== 'cut' && step !== 'celebrating') && (
                  <motion.div
                    animate={{ 
                      scale: [1, 1.15, 0.9, 1.05, 1], 
                      y: [0, -1, 1, -0.5, 0],
                      rotate: [-1, 2, -2, 1, -1]
                    }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative w-3.5 h-8 origin-bottom flex items-end justify-center"
                  >
                    {/* Flame Orange */}
                    <div className="absolute w-3.5 h-8 bg-amber-500 rounded-full blur-[0.5px] opacity-90 origin-bottom" style={{ borderRadius: '50% 50% 20% 20% / 60% 60% 40% 40%' }} />
                    {/* Flame Yellow Core */}
                    <div className="absolute w-2.5 h-5 bg-yellow-400 rounded-full mb-0.5 origin-bottom" style={{ borderRadius: '50% 50% 20% 20% / 60% 60% 40% 40%' }} />
                    <div className="absolute w-1.5 h-3 bg-white rounded-full mb-1 origin-bottom" />
                  </motion.div>
                )}
                {/* Smoke puff on blowout */}
                {(step === 'cut' || step === 'celebrating') && (
                  <motion.div
                    initial={{ opacity: 0.9, y: 0, scale: 0.6 }}
                    animate={{ opacity: 0, y: -45, scale: 2.2, x: [-5, 5, -2, 0] }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="absolute w-5 h-5 bg-neutral-300/50 rounded-full blur-[1px] -top-12 pointer-events-none"
                  />
                )}
                {/* Candle body */}
                <div className="w-1.5 h-6 bg-gradient-to-b from-yellow-300 to-yellow-400 rounded-t-sm shadow-md" />
              </div>
            </div>
          </motion.div>

          {/* Right Cake Half */}
          <motion.div
            animate={{
              x: step === 'celebrating' || step === 'cut' ? 28 : 0,
              rotate: step === 'celebrating' || step === 'cut' ? 6 : 0,
            }}
            transition={{ type: 'spring', stiffness: 95, damping: 11 }}
            className="w-1/2 flex justify-start origin-bottom"
          >
            <div className="w-28 h-36 relative overflow-visible">
              {/* Right Cake Layer Render */}
              <div
                className="w-full h-28 absolute bottom-0 rounded-tr-3xl bg-gradient-to-br from-rose-500 via-rose-600 to-rose-800 border-r border-b border-rose-950/20 shadow-2xl"
                style={{ clipPath: 'polygon(0% 5%, 100% 0%, 100% 100%, 0% 100%)' }}
              >
                {/* Frosting dripping detail */}
                <div className="absolute top-0 inset-x-0 h-4 bg-neutral-100 rounded-b-lg opacity-95 blur-[0.2px] border-b border-pink-100" />
                <div className="absolute top-3 right-4 w-1 h-3 bg-neutral-100 rounded-full opacity-90" />
                <div className="absolute top-3 right-10 w-1 h-4 bg-neutral-100 rounded-full opacity-90" />

                {/* Inside red-velvet cake sponge profile (exposed on cut side) */}
                {(step === 'cut' || step === 'celebrating') && (
                  <div className="absolute left-0 top-0 bottom-0 w-3.5 bg-gradient-to-b from-neutral-900 via-rose-900 to-neutral-900 shadow-inner flex flex-col justify-around py-3 pr-[1px]">
                    <div className="h-2.5 w-full bg-amber-100 opacity-90 shadow-sm" /> {/* Cream layer */}
                    <div className="h-2.5 w-full bg-amber-100 opacity-90 shadow-sm" />
                  </div>
                )}
              </div>

              {/* Candles on Right Half */}
              <div className="absolute -top-7 right-8 flex flex-col items-center">
                {/* Candle 2 flame if not cut */}
                {(step !== 'cut' && step !== 'celebrating') && (
                  <motion.div
                    animate={{ 
                      scale: [0.95, 1.1, 0.95, 1, 0.95], 
                      y: [0, 0.5, -1, 0, 0.5],
                      rotate: [1, -2, 2, -1, 1]
                    }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                    className="relative w-3.5 h-8 origin-bottom flex items-end justify-center"
                  >
                    {/* Flame Orange */}
                    <div className="absolute w-3.5 h-8 bg-amber-500 rounded-full blur-[0.5px] opacity-90 origin-bottom" style={{ borderRadius: '50% 50% 20% 20% / 60% 60% 40% 40%' }} />
                    {/* Flame Yellow Core */}
                    <div className="absolute w-2.5 h-5 bg-yellow-400 rounded-full mb-0.5 origin-bottom" style={{ borderRadius: '50% 50% 20% 20% / 60% 60% 40% 40%' }} />
                    <div className="absolute w-1.5 h-3 bg-white rounded-full mb-1 origin-bottom" />
                  </motion.div>
                )}
                {/* Smoke puff on blowout */}
                {(step === 'cut' || step === 'celebrating') && (
                  <motion.div
                    initial={{ opacity: 0.9, y: 0, scale: 0.6 }}
                    animate={{ opacity: 0, y: -45, scale: 2.2, x: [3, -3, 1, 0] }}
                    transition={{ duration: 1.5, ease: 'easeOut', delay: 0.05 }}
                    className="absolute w-5 h-5 bg-neutral-300/50 rounded-full blur-[1px] -top-12 pointer-events-none"
                  />
                )}
                {/* Candle body */}
                <div className="w-1.5 h-6 bg-gradient-to-b from-pink-300 to-pink-400 rounded-t-sm shadow-md" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating text badge '1 Month Anniversary' */}
        <div className="absolute bottom-16 z-30 flex flex-col items-center pointer-events-none w-full text-center">
          <motion.div
            animate={{
              opacity: step === 'celebrating' || step === 'cut' ? 0 : [0.9, 1, 0.9],
              scale: step === 'celebrating' || step === 'cut' ? 0.8 : 1,
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 rounded-full text-[10px] font-bold font-sans uppercase tracking-widest shadow-lg shadow-black/40 border border-amber-300"
          >
            One Month Anniversary
          </motion.div>
        </div>
      </motion.div>

      {/* 8. Celebratory Confetti / Ribbons Storm */}
      {step === 'celebrating' && (
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
          {confetti.map((c) => (
            <motion.div
              key={c.id}
              initial={{ x: c.x + 140, y: 350, scale: 0, opacity: 0, rotate: 0 }}
              animate={{
                x: c.x + 140 + Math.sin(c.id) * 35,
                y: 500,
                opacity: [0, 1, 1, 0],
                scale: [0, 1, 1, 0.5],
                rotate: [0, 360 * (c.id % 2 === 0 ? 1 : -1)],
              }}
              transition={{
                duration: 2.8 + Math.random() * 2.2,
                delay: c.delay,
                repeat: Infinity,
                ease: 'easeOut',
              }}
              className="absolute"
              style={{
                backgroundColor: c.type !== 'ribbon' ? c.color : 'transparent',
                width: c.type === 'ribbon' ? c.size * 2.2 : c.size,
                height: c.size,
                borderRadius: c.type === 'circle' ? '50%' : c.type === 'heart' ? '50% 50% 0 0' : '0px',
                border: c.type === 'ribbon' ? `1.5px solid ${c.color}` : 'none',
              }}
            >
              {c.type === 'heart' && (
                <span className="text-[12px] block text-rose-500 leading-none">❤️</span>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* 9. Button: "Cut the Cake" */}
      {step === 'readyToCut' && (
        <motion.button
          id="cut-cake-btn"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.08, boxShadow: '0 0 25px rgba(245, 158, 11, 0.4)' }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCutCake}
          className="mt-8 px-8 py-3.5 rounded-full text-xs font-sans font-semibold tracking-widest uppercase text-neutral-900 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:from-amber-300 hover:to-yellow-200 cursor-pointer shadow-[0_12px_24px_rgba(212,175,55,0.35)] transition-all duration-300 border border-amber-200/30 z-20"
        >
          Cut the Cake 🎂
        </motion.button>
      )}
    </div>
  );
}
