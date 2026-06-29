import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { audio } from '../utils/audio';

interface Particle {
  id: string;
  x: number;
  y: number;
  type: 'heart' | 'sparkle' | 'kiss' | 'petal' | 'balloon';
  size: number;
  rotation: number;
  color?: string;
  popped?: boolean;
  createdAt: number;
}

const PARTICLE_LIFETIMES = {
  heart: 3500,
  sparkle: 2000,
  kiss: 5000,
  petal: 8000,
  balloon: 14000,
};

interface KissOverlayProps {
  onRegisterTrigger: (trigger: {
    spawnKissStorm: () => void;
    spawnBalloons: () => void;
    spawnHeartsAt: (x: number, y: number) => void;
    spawnSparklesAt: (x: number, y: number) => void;
  }) => void;
}

export default function KissOverlay({ onRegisterTrigger }: KissOverlayProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const interactionRef = useRef<HTMLDivElement>(null);
  const pressTimer = useRef<any>(null);

  // Helper to generate unique ID
  const getUid = () => Math.random().toString(36).substring(2, 9);

  // 1. Double tap detector for background hearts
  const lastTap = useRef<number>(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    const touch = e.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;

    if (now - lastTap.current < DOUBLE_PRESS_DELAY) {
      spawnHeartsAt(x, y);
    } else {
      // Setup long press
      pressTimer.current = setTimeout(() => {
        spawnSparklesAt(x, y);
      }, 500);
    }
    lastTap.current = now;
  };

  const handleTouchEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const x = e.clientX;
    const y = e.clientY;
    
    // Check double click
    const now = Date.now();
    if (now - lastTap.current < 300) {
      spawnHeartsAt(x, y);
    } else {
      pressTimer.current = setTimeout(() => {
        spawnSparklesAt(x, y);
      }, 500);
    }
    lastTap.current = now;
  };

  const handleMouseUp = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  // --- Particle Spawners ---

  const spawnHeartsAt = (x: number, y: number) => {
    audio.playClickSound();
    const newHearts: Particle[] = Array.from({ length: 6 }).map(() => ({
      id: getUid(),
      x: x + (Math.random() * 40 - 20),
      y: y + (Math.random() * 40 - 20),
      type: 'heart',
      size: 16 + Math.random() * 16,
      rotation: Math.random() * 360,
      createdAt: Date.now(),
    }));
    setParticles((prev) => [...prev, ...newHearts]);
  };

  const spawnSparklesAt = (x: number, y: number) => {
    audio.playEnvelopeSound(); // Shimmering paper slide sound
    const newSparkles: Particle[] = Array.from({ length: 8 }).map(() => ({
      id: getUid(),
      x: x + (Math.random() * 50 - 25),
      y: y + (Math.random() * 50 - 25),
      type: 'sparkle',
      size: 12 + Math.random() * 14,
      rotation: Math.random() * 360,
      createdAt: Date.now(),
    }));
    setParticles((prev) => [...prev, ...newSparkles]);
  };

  const spawnBalloons = () => {
    audio.playFireworkSound();
    const width = window.innerWidth;
    const height = window.innerHeight;
    const colors = ['#ff4d6d', '#ff85a1', '#f15bb5', '#7209b7', '#3f37c9', '#4cc9f0', '#d4af37'];
    
    const newBalloons: Particle[] = Array.from({ length: 18 }).map(() => ({
      id: getUid(),
      x: Math.random() * (width - 60) + 30,
      y: height + 50 + Math.random() * 100,
      type: 'balloon',
      size: 44 + Math.random() * 20,
      rotation: Math.random() * 20 - 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      createdAt: Date.now(),
    }));
    setParticles((prev) => [...prev, ...newBalloons]);
  };

  const spawnKissStorm = () => {
    audio.playKissSound();
    // Device vibration feedback for premium physical engagement
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Mass spawn kiss prints, petals, hearts
    const list: Particle[] = [];
    const colors = ['#ff0054', '#ff5400', '#ff007f', '#e0115f', '#c9184a'];

    // 12 Kisses (optimized from 35)
    for (let i = 0; i < 12; i++) {
      list.push({
        id: getUid(),
        x: Math.random() * width,
        y: Math.random() * height,
        type: 'kiss',
        size: 24 + Math.random() * 24,
        rotation: Math.random() * 40 - 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        createdAt: Date.now(),
      });
    }

    // 10 Petals (optimized from 25)
    for (let i = 0; i < 10; i++) {
      list.push({
        id: getUid(),
        x: Math.random() * width,
        y: -50 - Math.random() * 200,
        type: 'petal',
        size: 14 + Math.random() * 16,
        rotation: Math.random() * 360,
        createdAt: Date.now(),
      });
    }

    // 8 Hearts (optimized from 20)
    for (let i = 0; i < 8; i++) {
      list.push({
        id: getUid(),
        x: Math.random() * width,
        y: height + 50 + Math.random() * 200,
        type: 'heart',
        size: 18 + Math.random() * 18,
        rotation: Math.random() * 40 - 20,
        createdAt: Date.now(),
      });
    }

    setParticles((prev) => [...prev, ...list]);
  };

  // Register callbacks on mount for parent reference
  useEffect(() => {
    onRegisterTrigger({
      spawnKissStorm,
      spawnBalloons,
      spawnHeartsAt,
      spawnSparklesAt,
    });
  }, [onRegisterTrigger]);

  // Balloon popping mechanism
  const handlePopBalloon = (id: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    audio.playBalloonPopSound();
    setParticles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, popped: true } : p))
    );
    // Cleanup popped balloon shortly
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 600);
  };

  // Autocleanup of out-of-bounds or old particles to guarantee 60fps performance
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setParticles((prev) =>
        prev.filter((p) => {
          const lifetime = PARTICLE_LIFETIMES[p.type] || 5000;
          return now - p.createdAt < lifetime;
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      id="particles-surface"
      ref={interactionRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="absolute inset-0 z-40 overflow-hidden pointer-events-none"
    >
      {/* Absolute floating interaction overlays */}
      <AnimatePresence>
        {particles.map((p) => {
          if (p.popped) {
            // Render popping blast effect
            return (
              <motion.div
                key={`pop-${p.id}`}
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 2 }}
                exit={{ opacity: 0 }}
                style={{ left: p.x, top: p.y }}
                className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center"
              >
                <div className="w-4 h-4 rounded-full bg-yellow-300 blur-[2px]" />
                <div className="absolute w-8 h-8 rounded-full border border-yellow-400" />
              </motion.div>
            );
          }

          if (p.type === 'heart') {
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0, y: 0 }}
                animate={{
                  opacity: [0, 0.9, 0.9, 0],
                  scale: [0.5, 1.2, 1, 0.8],
                  y: -220,
                  x: Math.sin(p.id.charCodeAt(0)) * 40,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 3.2, ease: 'easeOut' }}
                style={{ left: p.x, top: p.y, width: p.size, height: p.size }}
                className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2"
              >
                <svg viewBox="0 0 24 24" fill="#ff4d6d" className="w-full h-full drop-shadow-[0_4px_8px_rgba(255,77,109,0.4)]">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </motion.div>
            );
          }

          if (p.type === 'sparkle') {
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  scale: [0.2, 1.5, 1, 0.2],
                  rotate: p.rotation + 180,
                }}
                transition={{ duration: 1.8, ease: 'easeInOut' }}
                style={{ left: p.x, top: p.y, width: p.size, height: p.size }}
                className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2"
              >
                <svg viewBox="0 0 24 24" fill="#d4af37" className="w-full h-full drop-shadow-[0_0_8px_#d4af37]">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </motion.div>
            );
          }

          if (p.type === 'kiss') {
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 0.85, 0.85, 0],
                  scale: [0.3, 1.1, 1, 0.7],
                }}
                transition={{ duration: 4.5, ease: 'easeOut' }}
                style={{
                  left: p.x,
                  top: p.y,
                  width: p.size,
                  height: p.size,
                  rotate: `${p.rotation}deg`,
                }}
                className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2"
              >
                <svg viewBox="0 0 24 24" fill={p.color || '#ff0054'} className="w-full h-full drop-shadow-[0_3px_6px_rgba(255,0,84,0.3)]">
                  {/* Highly polished lip prints mark path */}
                  <path d="M12 16c-3.15 0-5.73-1.63-7.5-4 1.77-2.37 4.35-4 7.5-4s5.73 1.63 7.5 4c-1.77 2.37-4.35 4-7.5 4zm-1-3c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm4-.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zm-8 0c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5z" opacity="0.15" />
                  <path d="M12 21c-4.42 0-8-2.5-8-5.5 0-1.2.66-2.3 1.75-3.15C5.3 11.45 5 10.3 5 9c0-3.3 3.13-6 7-6s7 2.7 7 6c0 1.3-.3 2.45-.75 3.35 1.09.85 1.75 1.95 1.75 3.15 0 3-3.58 5.5-8 5.5zm-5-5.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5c0-.1-.02-.2-.05-.3C10.5 16.1 11.2 16 12 16s1.5.1 2.05.3c-.03.1-.05.2-.05.3 0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5c0-1.1-.9-2-2-2h-6c-1.1 0-2 .9-2 2z" />
                </svg>
              </motion.div>
            );
          }

          if (p.type === 'petal') {
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: -50 }}
                animate={{
                  opacity: [0, 0.8, 0.8, 0],
                  y: window.innerHeight + 80,
                  x: p.x + Math.sin(p.id.charCodeAt(0)) * 120,
                  rotate: [p.rotation, p.rotation + 360],
                }}
                transition={{ duration: 7.5, ease: 'linear' }}
                style={{ left: p.x, width: p.size, height: p.size }}
                className="absolute pointer-events-none"
              >
                {/* Curved delicate rose petal */}
                <svg viewBox="0 0 24 24" fill="#ff4d6d" className="w-full h-full drop-shadow-[0_2px_4px_rgba(255,77,109,0.25)]">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10C22 6.48 17.52 2 12 2zm1 14.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5 1.5-3.5 1.5-3.5 1.5 2.67 1.5 3.5z" />
                </svg>
              </motion.div>
            );
          }

          if (p.type === 'balloon') {
            return (
              <motion.div
                key={p.id}
                initial={{ y: window.innerHeight + 120 }}
                animate={{
                  y: -150,
                  x: p.x + Math.sin(p.id.charCodeAt(0)) * 50,
                  rotate: [p.rotation, -p.rotation, p.rotation],
                }}
                transition={{ duration: 8.5 + Math.random() * 4, ease: 'easeOut' }}
                style={{ left: p.x, width: p.size, height: p.size * 1.3 }}
                className="absolute pointer-events-auto cursor-pointer"
                onMouseDown={(e) => handlePopBalloon(p.id, e)}
                onTouchStart={(e) => handlePopBalloon(p.id, e)}
              >
                <svg viewBox="0 0 30 42" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
                  {/* Balloon bubble */}
                  <ellipse cx="15" cy="18" rx="13" ry="17" fill={p.color || '#ff4d6d'} />
                  {/* Highlight sheen for glossy look */}
                  <ellipse cx="10" cy="10" rx="3" ry="5" fill="white" opacity="0.25" />
                  {/* Knot */}
                  <polygon points="12,35 18,35 15,32" fill={p.color || '#ff4d6d'} />
                  {/* String hanging down */}
                  <path d="M15,35 Q13,38 15,41 T14,44" stroke="#737373" strokeWidth="0.8" fill="none" />
                </svg>
              </motion.div>
            );
          }

          return null;
        })}
      </AnimatePresence>
    </div>
  );
}
