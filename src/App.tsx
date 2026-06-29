import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scene } from './types';
import { audio } from './utils/audio';

import LightSwitch from './components/LightSwitch';
import CandleLit from './components/CandleLit';
import AnniversaryCake from './components/AnniversaryCake';
import LoveLetter from './components/LoveLetter';
import Timeline from './components/Timeline';
import MemoryGallery from './components/MemoryGallery';
import LoveCounter from './components/LoveCounter';
import KissOverlay from './components/KissOverlay';

import { Volume2, VolumeX, Music, Heart, ChevronRight, RefreshCw } from 'lucide-react';

export default function App() {
  const [currentScene, setCurrentScene] = useState<Scene>(Scene.Opening);
  const [unlockedScenes, setUnlockedScenes] = useState<Scene[]>([Scene.Opening]);
  const [lightsOn, setLightsOn] = useState(false);
  const [litCandles, setLitCandles] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [celebrationTimeLeft, setCelebrationTimeLeft] = useState(8);

  // References to trigger particle storms across modules
  const particleTriggers = useRef<{
    spawnKissStorm: () => void;
    spawnBalloons: () => void;
    spawnHeartsAt: (x: number, y: number) => void;
    spawnSparklesAt: (x: number, y: number) => void;
  } | null>(null);

  // Register particle handles
  const handleRegisterParticles = (triggers: typeof particleTriggers.current) => {
    particleTriggers.current = triggers;
  };

  // Sync volume & mute changes with synthesizer engine
  useEffect(() => {
    audio.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    audio.setMute(isMuted);
  }, [isMuted]);

  // Synchronize dynamic background music with scene changes
  useEffect(() => {
    audio.playSceneMusic(currentScene, lightsOn);
  }, [currentScene, lightsOn]);

  // Unlock navigation tracking
  const unlockScene = (scene: Scene) => {
    if (!unlockedScenes.includes(scene)) {
      setUnlockedScenes((prev) => [...prev, scene]);
    }
    setCurrentScene(scene);
  };

  // 1. Double Click / Double Tap Background to spawn hearts manually
  const handleBackgroundDoubleClick = (e: React.MouseEvent) => {
    if (!lightsOn) return;
    particleTriggers.current?.spawnHeartsAt(e.clientX, e.clientY);
  };

  // 2. Shake Device Fallback Listener
  useEffect(() => {
    let lastX: number | null = null;
    let lastY: number | null = null;
    let lastZ: number | null = null;
    let threshold = 15;

    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const { x, y, z } = acc;
      if (x === null || y === null || z === null) return;

      if (lastX !== null && lastY !== null && lastZ !== null) {
        const deltaX = Math.abs(x - lastX);
        const deltaY = Math.abs(y - lastY);
        const deltaZ = Math.abs(z - lastZ);

        if ((deltaX > threshold && deltaY > threshold) || (deltaX > threshold && deltaZ > threshold) || (deltaY > threshold && deltaZ > threshold)) {
          particleTriggers.current?.spawnBalloons();
        }
      }

      lastX = x;
      lastY = y;
      lastZ = z;
    };

    window.addEventListener('devicemotion', handleDeviceMotion);
    return () => window.removeEventListener('devicemotion', handleDeviceMotion);
  }, []);

  // Sequential automatic candles lighting trigger
  const triggerAutoLightCandles = () => {
    let count = 0;
    const interval = setInterval(() => {
      if (count < 5) {
        setLitCandles((prev) => prev + 1);
        count++;
      } else {
        clearInterval(interval);
      }
    }, 700);
  };

  // Scene 4 celebration countdown logic
  useEffect(() => {
    if (currentScene !== Scene.Celebration) return;
    
    // Play celebratory soundscapes
    audio.playFireworkSound();
    particleTriggers.current?.spawnBalloons();

    // Spawn periodic celebration particles
    const particleInterval = setInterval(() => {
      particleTriggers.current?.spawnKissStorm();
    }, 2000);

    const countdown = setInterval(() => {
      setCelebrationTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          clearInterval(particleInterval);
          unlockScene(Scene.Letter);
          return 8;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(countdown);
      clearInterval(particleInterval);
    };
  }, [currentScene]);

  const resetAll = () => {
    setCurrentScene(Scene.Opening);
    setUnlockedScenes([Scene.Opening]);
    setLightsOn(false);
    setLitCandles(0);
    audio.stopBackgroundMusic();
  };

  return (
    <div
      id="root-viewport"
      onDoubleClick={handleBackgroundDoubleClick}
      className="relative w-full min-h-screen select-none overflow-x-hidden flex flex-col justify-between transition-colors duration-1000"
      style={{
        backgroundColor: lightsOn ? '#0b090a' : '#000000',
        backgroundImage: lightsOn
          ? 'radial-gradient(circle at 50% 40%, rgba(212, 175, 55, 0.08) 0%, rgba(11, 9, 10, 1) 75%)'
          : 'none',
      }}
    >
      {/* Cinematic Dynamic Background Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <AnimatePresence mode="wait">
          {/* 1. Opening pitch-black moonlight backdrop */}
          {currentScene === Scene.Opening && !lightsOn && (
            <motion.div
              key="bg-opening-dark"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#020204]"
            >
              {/* Window moonbeam reflection */}
              <div className="absolute top-0 left-0 w-[500px] h-full bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent rotate-12 origin-top-left" />
              {/* Soft moving fog elements */}
              <motion.div
                animate={{ x: [-100, 100, -100], opacity: [0.15, 0.25, 0.15] }}
                transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-10 inset-x-0 h-40 bg-gradient-to-t from-indigo-900/10 to-transparent blur-2xl"
              />
              {/* Floating dust/particles */}
              {Array.from({ length: 15 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -60, 0],
                    x: [0, (Math.random() - 0.5) * 40, 0],
                    opacity: [0, 0.4, 0],
                  }}
                  transition={{
                    duration: 4 + Math.random() * 4,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                  className="absolute w-1 h-1 rounded-full bg-indigo-300/30"
                  style={{
                    left: `${10 + Math.random() * 80}%`,
                    bottom: `${10 + Math.random() * 60}%`,
                  }}
                />
              ))}
            </motion.div>
          )}

          {/* 2. Lights on & Candle scene cozy bedroom backdrop */}
          {lightsOn && (currentScene === Scene.Opening || currentScene === Scene.Candles) && (
            <motion.div
              key="bg-cozy-warm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0d090a]"
              style={{
                backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(245, 158, 11, 0.08) 0%, rgba(13, 9, 10, 1) 80%)',
              }}
            >
              {/* Floor highlight shadow lines (Wood panel effect) */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.01)_1px,transparent_1px)] bg-[size:100%_40px] opacity-40" />
              
              {/* Warm cozy fairy lights on the wall margins */}
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 0.9, 0.3] }}
                  transition={{ duration: 1.5 + Math.random() * 1.5, repeat: Infinity, delay: i * 0.2 }}
                  className="absolute w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_#f59e0b]"
                  style={{
                    left: i % 2 === 0 ? '5%' : '95%',
                    top: `${15 + i * 7}%`,
                  }}
                />
              ))}

              {/* Warm Lamp Glow in the top right corner */}
              <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl" />
            </motion.div>
          )}

          {/* 3. Celebration scene - layered fireworks & glowing lanterns */}
          {currentScene === Scene.Celebration && (
            <motion.div
              key="bg-celebration"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#050206]"
              style={{
                backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(225, 29, 72, 0.06) 0%, rgba(5, 2, 6, 1) 85%)',
              }}
            >
              {/* Floating Lanterns drifting upwards slowly */}
              {Array.from({ length: 10 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 550, x: `${10 + Math.random() * 80}%`, opacity: 0, scale: 0.6 }}
                  animate={{
                    y: -100,
                    opacity: [0, 0.7, 0.7, 0],
                    scale: [0.6, 1.1, 1.1, 0.7],
                  }}
                  transition={{
                    duration: 9 + Math.random() * 5,
                    repeat: Infinity,
                    delay: i * 1.2,
                  }}
                  className="absolute w-4 h-6 bg-gradient-to-t from-amber-500 to-yellow-300 rounded shadow-[0_0_12px_#f59e0b] opacity-80"
                />
              ))}

              {/* Distant firework flash effects */}
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    opacity: [0, 0.25, 0, 0],
                    scale: [0.8, 1.2, 1, 0.8],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 1,
                  }}
                  className="absolute w-36 h-36 rounded-full bg-rose-500/10 blur-3xl"
                  style={{
                    left: `${20 + i * 25}%`,
                    top: `${15 + Math.random() * 30}%`,
                  }}
                />
              ))}
            </motion.div>
          )}

          {/* 4. Letter scene vintage study table spotlight */}
          {currentScene === Scene.Letter && (
            <motion.div
              key="bg-letter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#080705]"
              style={{
                backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(217, 119, 6, 0.05) 0%, rgba(8, 7, 5, 1) 85%)',
              }}
            />
          )}

          {/* 5. Timeline scene sunset sky with soft clouds & moving stars */}
          {currentScene === Scene.Timeline && (
            <motion.div
              key="bg-timeline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-b from-[#180828] via-[#240824] to-[#0d0414]"
            >
              {/* Sunset glow at the bottom */}
              <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-orange-500/10 via-rose-500/5 to-transparent blur-3xl" />

              {/* Twinkling stars */}
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: i * 0.1 }}
                  className="absolute w-0.5 h-0.5 rounded-full bg-white"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 70}%`,
                  }}
                />
              ))}

              {/* Slowly sliding soft clouds */}
              <motion.div
                animate={{ x: [-200, 200] }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                className="absolute top-24 left-0 w-96 h-28 bg-white/2 rounded-full blur-3xl"
              />
              <motion.div
                animate={{ x: [200, -200] }}
                transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
                className="absolute top-48 right-0 w-80 h-24 bg-rose-500/2 rounded-full blur-3xl"
              />
            </motion.div>
          )}

          {/* 6. Gallery scene romantic garden with bokeh and petals */}
          {currentScene === Scene.Gallery && (
            <motion.div
              key="bg-gallery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#060807]"
              style={{
                backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(34, 197, 94, 0.03) 0%, rgba(6, 8, 7, 1) 90%)',
              }}
            >
              {/* Soft bokeh bubbles */}
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0.1, 0.25, 0.1],
                  }}
                  transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute rounded-full bg-amber-400/5 blur-xl"
                  style={{
                    width: `${40 + i * 15}px`,
                    height: `${40 + i * 15}px`,
                    left: `${15 + i * 10}%`,
                    top: `${20 + i * 6}%`,
                  }}
                />
              ))}

              {/* Falling rose petals */}
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -50, x: `${10 + Math.random() * 80}%`, rotate: 0 }}
                  animate={{
                    y: 550,
                    x: [`${10 + Math.random() * 80}%`, `${15 + Math.random() * 70}%`],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 8 + Math.random() * 6,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: i * 0.5,
                  }}
                  className="absolute text-rose-500/20 text-sm select-none"
                >
                  🌸
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* 7. Final Kiss scene dreamy night sky and auroras */}
          {currentScene === Scene.Kiss && (
            <motion.div
              key="bg-kiss"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#020104]"
              style={{
                backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(244, 63, 94, 0.05) 0%, rgba(2, 1, 4, 1) 90%)',
              }}
            >
              {/* Aurora Gradient swirl overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/5 via-transparent to-indigo-500/5 opacity-50 blur-2xl" />

              {/* Deep stardust billions stars */}
              {Array.from({ length: 45 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.1, 0.9, 0.1], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1.5 + Math.random() * 2, repeat: Infinity, delay: i * 0.15 }}
                  className="absolute w-[1.5px] h-[1.5px] rounded-full bg-white/70"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                />
              ))}

              {/* Dreamy slow sliding clouds */}
              <motion.div
                animate={{ x: [-150, 150] }}
                transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
                className="absolute bottom-12 w-96 h-24 bg-rose-500/2 rounded-full blur-3xl"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Background Interactive Particles Layer */}
      <KissOverlay onRegisterTrigger={handleRegisterParticles} />

      {/* Floating Header UI (Persistent once lights are on) */}
      <AnimatePresence>
        {lightsOn && (
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-lg mx-auto px-6 py-4 flex items-center justify-between z-50 relative pointer-events-auto"
          >
            {/* Title / Brand watermark */}
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
              <span className="font-serif font-bold text-neutral-200 text-sm tracking-tight">
                Our First Month
              </span>
            </div>

            {/* Ambient Sound / Synthesizer control widgets */}
            <div className="flex items-center gap-4 bg-neutral-900/60 backdrop-blur border border-neutral-800/80 px-3.5 py-1.5 rounded-full shadow-lg">
              {/* Animated Jumping Music Bars */}
              <div className="flex gap-0.5 items-end h-3 w-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: isMuted ? 2 : [2, 12, 2] }}
                    transition={{
                      duration: 0.6 + i * 0.15,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="w-0.5 bg-amber-400 rounded-full"
                  />
                ))}
              </div>

              {/* Volume Slider */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                aria-label="Volume Control"
              />

              {/* Mute Button Toggle */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer focus:outline-none"
                aria-label="Toggle Mute"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main Narrative Cinema Stage */}
      <main className="flex-1 w-full max-w-md mx-auto flex items-center justify-center px-4 relative z-40">
        <AnimatePresence mode="wait">
          {/* SCENE 1: Opening pitch black switch */}
          {currentScene === Scene.Opening && (
            <motion.div
              key="scene-opening"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="flex flex-col items-center justify-center text-center space-y-12 py-10 w-full"
            >
              <div className="space-y-4">
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 1.2 }}
                  className="font-serif text-3xl font-semibold text-neutral-100 tracking-tight"
                >
                  Welcome...
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8, duration: 1.2 }}
                  className="font-sans text-sm italic text-neutral-400 tracking-wider"
                >
                  "Tonight is not just another night."
                </motion.p>
              </div>

              {/* The Physical wall Switch */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.8, type: 'spring' }}
                className="py-4"
              >
                <LightSwitch
                  onToggle={(isOn) => {
                    if (isOn) {
                      setLightsOn(true);
                      audio.startAmbientPad();
                      // Wait 1.5s for room warmth sweep, then move to Scene 2
                      setTimeout(() => {
                        unlockScene(Scene.Candles);
                      }, 1500);
                    }
                  }}
                />
              </motion.div>
            </motion.div>
          )}

          {/* SCENE 2: Light the Candles */}
          {currentScene === Scene.Candles && (
            <motion.div
              key="scene-candles"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center justify-center text-center w-full"
            >
              <div className="space-y-3 mb-8">
                <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">
                  Introduction
                </span>
                <h2 className="font-serif text-2xl font-bold text-neutral-100 tracking-wide">
                  The room is cozy, but...
                </h2>
                <p className="font-sans text-xs italic text-neutral-400 tracking-wide max-w-xs mx-auto">
                  "The night isn't complete yet. Light every candle to awaken the warmth."
                </p>
              </div>

              {/* Dynamic Candle arrangement table */}
              <CandleLit
                litCount={litCandles}
                totalCandles={5}
                onCandleLit={(idx) => setLitCandles(idx + 1)}
                onAllLit={() => {
                  // Wait 2.2s for gorgeous flare-up camera zoom, then trigger Scene 3
                  setTimeout(() => {
                    unlockScene(Scene.Cake);
                  }, 2200);
                }}
              />

              {/* Button "Light Candles" */}
              {litCandles < 5 && (
                <motion.button
                  id="light-candles-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={triggerAutoLightCandles}
                  className="mt-4 px-6 py-2.5 rounded-full text-xs font-semibold text-neutral-950 bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_4px_15px_rgba(212,175,55,0.25)] hover:from-amber-300 cursor-pointer"
                >
                  Light All Candles 🕯️
                </motion.button>
              )}
            </motion.div>
          )}

          {/* SCENE 3: The Anniversary Cake */}
          {currentScene === Scene.Cake && (
            <motion.div
              key="scene-cake"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center w-full"
            >
              <AnniversaryCake
                onCut={() => {
                  unlockScene(Scene.Celebration);
                }}
              />
            </motion.div>
          )}

          {/* SCENE 4: Romantic Celebration Screen */}
          {currentScene === Scene.Celebration && (
            <motion.div
              key="scene-celebration"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center space-y-6 w-full max-w-sm mx-auto px-4"
            >
              <div className="space-y-3">
                {/* Cute Floating Celebration Icon */}
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: [1, 1.15, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.3)] cursor-pointer"
                    onClick={() => {
                      audio.playClickSound();
                      particleTriggers.current?.spawnKissStorm();
                    }}
                    title="Click for love magic!"
                  >
                    <Heart className="w-10 h-10 text-rose-500 fill-rose-500" />
                  </motion.div>
                  {/* Floating sparkly accents around heart */}
                  <span className="absolute -top-1 -left-1 text-base animate-bounce">🎈</span>
                  <span className="absolute -bottom-1 -right-1 text-base animate-bounce delay-300">✨</span>
                  <span className="absolute top-1/2 -right-3 text-lg animate-pulse">🥰</span>
                  <span className="absolute top-1/2 -left-3 text-lg animate-pulse delay-700">💖</span>
                </div>

                <h2 className="font-serif text-3xl font-bold bg-gradient-to-r from-rose-400 via-pink-300 to-amber-300 bg-clip-text text-transparent tracking-wide">
                  Celebrating Us!
                </h2>
                <p className="font-sans text-xs italic text-neutral-300 tracking-wider max-w-xs mx-auto leading-relaxed">
                  "Our journey of 1 month has been pure magic. Click the heart or pop the balloons!"
                </p>
              </div>

              {/* Interactive Balloon Spawner Card */}
              <div className="bg-neutral-950/60 backdrop-blur border border-neutral-800/80 rounded-2xl p-4 w-full space-y-4 shadow-xl">
                <div className="flex justify-around items-center text-xs text-neutral-400 font-sans">
                  <button
                    onClick={() => particleTriggers.current?.spawnBalloons()}
                    className="px-3 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition-all cursor-pointer text-[11px] font-medium"
                  >
                    Release Balloons 🎈
                  </button>
                  <button
                    onClick={() => particleTriggers.current?.spawnKissStorm()}
                    className="px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-all cursor-pointer text-[11px] font-medium"
                  >
                    Send Kisses 💋
                  </button>
                </div>

                {/* Celebration Progress bar visualizer */}
                <div className="space-y-1">
                  <div className="w-full bg-neutral-900 border border-neutral-800/60 h-3 rounded-full overflow-hidden shadow-inner p-[1px]">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 8, ease: 'linear' }}
                      className="h-full rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 px-1 select-none">
                    <span>LOVE LEVEL ACCUMULATING</span>
                    <span>{celebrationTimeLeft}s</span>
                  </div>
                </div>
              </div>

              {/* Direct Skip / Continue CTA Button to avoid being stuck */}
              <motion.button
                id="celebration-skip-btn"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  audio.playClickSound();
                  unlockScene(Scene.Letter);
                }}
                className="w-full py-3.5 rounded-xl font-sans font-semibold text-xs uppercase tracking-widest text-neutral-950 bg-gradient-to-r from-amber-400 via-pink-400 to-rose-400 shadow-[0_10px_25px_rgba(244,63,94,0.25)] hover:shadow-[0_12px_30px_rgba(244,63,94,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 border border-white/10"
              >
                <span>Read My Love Letter</span>
                <span className="text-sm animate-pulse">💌</span>
              </motion.button>
            </motion.div>
          )}

          {/* SCENE 5: Flying Love Letter */}
          {currentScene === Scene.Letter && (
            <motion.div
              key="scene-letter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <LoveLetter
                onReadComplete={() => {
                  unlockScene(Scene.Timeline);
                }}
              />
            </motion.div>
          )}

          {/* SCENE 6: Memory Timeline Recap */}
          {currentScene === Scene.Timeline && (
            <motion.div
              key="scene-timeline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <Timeline
                onTimelineComplete={() => {
                  unlockScene(Scene.Gallery);
                }}
              />
            </motion.div>
          )}

          {/* SCENE 7: Polaroid Memory Gallery */}
          {currentScene === Scene.Gallery && (
            <motion.div
              key="scene-gallery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <MemoryGallery
                onGalleryComplete={() => {
                  unlockScene(Scene.Counter);
                }}
              />
            </motion.div>
          )}

          {/* SCENE 8: Live Relationship Duration Counter */}
          {currentScene === Scene.Counter && (
            <motion.div
              key="scene-counter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <LoveCounter
                onCounterComplete={() => {
                  unlockScene(Scene.Kiss);
                }}
              />
            </motion.div>
          )}

          {/* SCENE 9: Final Kiss Ending card */}
          {currentScene === Scene.Kiss && (
            <motion.div
              key="scene-kiss"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center space-y-10 py-8 w-full"
            >
              <div className="space-y-4">
                <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold">
                  Final Gift
                </span>
                <h2 className="font-serif text-3xl font-bold text-neutral-100 tracking-tight leading-none">
                  One Last Thing...
                </h2>
                <p className="font-sans text-xs italic text-neutral-400 max-w-xs mx-auto">
                  "Close your eyes and click below to receive a thousand kisses."
                </p>
              </div>

              {/* Glowing Interactive Kiss Button */}
              <motion.button
                id="kiss-me-btn"
                whileHover={{ scale: 1.1, boxShadow: '0 0 35px rgba(255, 77, 109, 0.6)' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  particleTriggers.current?.spawnKissStorm();
                }}
                className="w-28 h-28 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-5xl cursor-pointer shadow-[0_15px_30px_rgba(255,77,109,0.35)] focus:outline-none select-none border border-rose-400/30"
              >
                💋
              </motion.button>

              {/* Final Statement Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 1.5 }}
                className="bg-neutral-950/60 backdrop-blur-md border border-neutral-800/80 rounded-2xl p-6 shadow-2xl w-full max-w-sm"
              >
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500 mx-auto mb-3 animate-bounce" />
                <h3 className="font-serif text-xl font-bold text-amber-300">
                  Happy One Month Anniversary
                </h3>
                <p className="font-sans text-xs font-semibold text-neutral-200 mt-2 tracking-wide uppercase">
                  Chitron Bhattacharjee ❤️ Sayantika Chakraborty Shreyoshi
                </p>
                <p className="font-cursive text-xl text-rose-400/95 mt-4 tracking-wide leading-relaxed">
                  "Every heartbeat with you has become my favorite memory. One month down, forever to go."
                </p>
              </motion.div>

              {/* Replay controller */}
              <motion.button
                id="replay-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetAll}
                className="flex items-center gap-1.5 px-4 py-2 border border-neutral-800 rounded-full text-[10px] font-mono text-neutral-400 uppercase tracking-widest bg-neutral-900/60 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Replay Movie
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Bottom Navigation Stepper Panel (once lights are on) */}
      <AnimatePresence>
        {lightsOn && unlockedScenes.length > 1 && (
          <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full max-w-lg mx-auto px-6 py-4 flex items-center justify-center z-50 relative pointer-events-auto"
          >
            {/* Quick Scene Jumper Dots Drawer */}
            <div className="flex gap-2.5 items-center bg-neutral-950/80 backdrop-blur border border-neutral-800/80 px-4 py-2.5 rounded-full shadow-2xl">
              {Array.from({ length: 9 }).map((_, idx) => {
                const sceneNum = (idx + 1) as Scene;
                const isUnlocked = unlockedScenes.includes(sceneNum);
                const isActive = currentScene === sceneNum;

                const sceneLabels = [
                  'Start',
                  'Candles',
                  'Cake',
                  'Party',
                  'Letter',
                  'Timeline',
                  'Gallery',
                  'Clock',
                  'Kiss',
                ];

                return (
                  <button
                    key={idx}
                    id={`scene-dot-${sceneNum}`}
                    disabled={!isUnlocked}
                    onClick={() => {
                      audio.playClickSound();
                      setCurrentScene(sceneNum);
                    }}
                    className={`w-2.5 h-2.5 rounded-full relative group transition-all duration-300 focus:outline-none ${
                      isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'
                    }`}
                    style={{
                      backgroundColor: isActive ? '#d4af37' : isUnlocked ? '#f43f5e' : '#3f3f46',
                      boxShadow: isActive ? '0 0 8px #d4af37' : 'none',
                    }}
                    aria-label={`Jump to ${sceneLabels[idx]}`}
                  >
                    {/* Hover text badge indicator tooltip */}
                    <span className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-neutral-950 text-[9px] font-sans font-medium px-2 py-0.5 rounded border border-neutral-800 text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                      {sceneLabels[idx]}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.footer>
        )}
      </AnimatePresence>
    </div>
  );
}
