import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GalleryItem } from '../types';
import { audio } from '../utils/audio';

interface MemoryGalleryProps {
  onGalleryComplete: () => void;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g1',
    title: 'First attraction',
    description: 'Holding hands at the golden momemnt, whispering secrets, love over the lips.',
    date: 'June, 2026',
    imageUrl: 'https://i.ibb.co.com/tT2DVbsv/f628a4981514c9b821e00de7ffd77735.jpg',
    rotate: -4,
  },
  {
    id: 'g2',
    title: 'Cutest Ever',
    description: 'Shared warm, endless smiles, and stealing quick glances.',
    date: 'June, 2026',
    imageUrl: 'https://i.ibb.co.com/DgkhVx6p/IMG-20260605-WA0008.jpg',
    rotate: 3,
  },
  {
    id: 'g3',
    title: 'Our first date',
    description: 'Finding constellations and making silent wishes for our future.',
    date: 'June, 2026',
    imageUrl: 'https://i.ibb.co.com/wNXWTSny/IMG-20260603-WA0002.jpg',
    rotate: -3,
  },
  {
    id: 'g4',
    title: 'Candid',
    description: 'Cozy indoors having some candid moments, listening a beautiful melody.',
    date: 'June, 2026',
    imageUrl: 'https://i.ibb.co.com/7NgqD9Z6/IMG-20260603-WA0004.jpg',
    rotate: 5,
  },
  {
    id: 'g5',
    title: 'Endless Whispers',
    description: 'Losing track of time listening to your laughter echo in my ears.',
    date: 'June 23, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=800&auto=format&fit=crop',
    rotate: -5,
  },
  {
    id: 'g6',
    rotate: 'Infinite Promises',
    description: 'A beautiful month of pure devotion, looking forward to forever.',
    date: 'June 29, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1464746133101-a2c3f88e0dd9?q=80&w=800&auto=format&fit=crop',
    rotate: 2,
  },
];

export default function MemoryGallery({ onGalleryComplete }: MemoryGalleryProps) {
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const handleCardClick = (item: GalleryItem) => {
    audio.playClickSound();
    setActiveItem(item);
  };

  const handleClose = () => {
    audio.playClickSound();
    setActiveItem(null);
  };

  const navigateItem = (dir: 'prev' | 'next') => {
    if (!activeItem) return;
    audio.playClickSound();
    const currIdx = GALLERY_ITEMS.findIndex((it) => it.id === activeItem.id);
    let nextIdx = dir === 'next' ? currIdx + 1 : currIdx - 1;

    if (nextIdx >= GALLERY_ITEMS.length) nextIdx = 0;
    if (nextIdx < 0) nextIdx = GALLERY_ITEMS.length - 1;

    setActiveItem(GALLERY_ITEMS[nextIdx]);
  };

  return (
    <div id="memory-gallery-container" className="w-full py-8 px-4 flex flex-col items-center">
      {/* Narrative Intro */}
      <div className="text-center mb-10">
        <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">
          Memory Album
        </span>
        <h2 className="text-3xl font-serif font-bold text-neutral-100 mt-2 tracking-tight">
          Snapshots of Us
        </h2>
        <p className="text-xs text-neutral-400 mt-2 max-w-xs mx-auto italic">
          "Hover to drift, click to unlock. Little fragments of our beautiful month together."
        </p>
      </div>

      {/* Polaroid Deck - CSS grid that supports staggered display */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-xl w-full px-2">
        {GALLERY_ITEMS.map((item) => (
          <motion.div
            key={item.id}
            layoutId={`polaroid-${item.id}`}
            onClick={() => handleCardClick(item)}
            whileHover={{
              scale: 1.05,
              rotate: 0,
              y: -8,
              zIndex: 30,
              transition: { duration: 0.3, ease: 'easeOut' },
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ rotate: `${item.rotate}deg` }}
            className="bg-neutral-100 p-3 pb-6 rounded shadow-[0_12px_24px_rgba(0,0,0,0.8)] cursor-pointer select-none border border-white/60 relative group origin-center flex flex-col"
          >
            {/* The Image Container */}
            <div className="w-full aspect-square bg-neutral-200 overflow-hidden rounded-sm relative">
              {/* Overlay shimmer on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <img
                src={item.imageUrl}
                alt={item.title}
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>

            {/* Handwritten Label on Polaroid Rim */}
            <div className="mt-3 text-center">
              <p className="font-cursive text-neutral-800 text-lg tracking-wider font-semibold truncate leading-none">
                {item.title}
              </p>
              <span className="text-[8px] font-mono text-neutral-400 mt-1 block tracking-wider uppercase">
                {item.date}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Hero Zoom Detail Dialog Overlay */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            key="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            {/* Dismiss backdrop trigger */}
            <div className="absolute inset-0 cursor-default" onClick={handleClose} />

            {/* Polaroid Enlarged view */}
            <motion.div
              layoutId={`polaroid-${activeItem.id}`}
              className="bg-neutral-100 p-4 pb-8 rounded-lg max-w-sm w-full shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/80 z-10 relative flex flex-col"
            >
              {/* Close Button top-right corner */}
              <button
                onClick={handleClose}
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white text-sm font-sans hover:bg-neutral-800 focus:outline-none cursor-pointer shadow-lg shadow-black/50"
              >
                ✕
              </button>

              {/* Enlarged image */}
              <div className="w-full aspect-square bg-neutral-300 overflow-hidden rounded shadow-inner relative">
                <img
                  src={activeItem.imageUrl}
                  alt={activeItem.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Bottom handwriting metadata & caption description */}
              <div className="mt-4 px-2 text-center">
                <p className="font-cursive text-neutral-800 text-2xl font-bold tracking-wider leading-none">
                  {activeItem.title}
                </p>
                <p className="text-xs text-neutral-500 font-mono mt-1 uppercase tracking-widest font-semibold">
                  {activeItem.date}
                </p>
                <p className="text-xs text-neutral-700 leading-relaxed italic mt-3 border-t border-neutral-200 pt-3 max-w-xs mx-auto">
                  "{activeItem.description}"
                </p>
              </div>

              {/* Gallery Arrow Nav Controls */}
              <div className="absolute inset-y-1/2 left-0 right-0 -mx-14 flex justify-between px-2 pointer-events-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateItem('prev');
                  }}
                  className="w-10 h-10 rounded-full bg-neutral-900/80 border border-neutral-800 flex items-center justify-center text-white font-sans pointer-events-auto hover:bg-neutral-800 cursor-pointer shadow-lg"
                >
                  ◀
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateItem('next');
                  }}
                  className="w-10 h-10 rounded-full bg-neutral-900/80 border border-neutral-800 flex items-center justify-center text-white font-sans pointer-events-auto hover:bg-neutral-800 cursor-pointer shadow-lg"
                >
                  ▶
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation action button */}
      <div className="mt-14">
        <motion.button
          id="gallery-done-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onGalleryComplete}
          className="px-6 py-2.5 rounded-full text-xs font-semibold text-neutral-900 bg-amber-400 hover:bg-amber-300 cursor-pointer shadow-lg shadow-amber-400/20"
        >
          See Our Love Clock ⏳
        </motion.button>
      </div>
    </div>
  );
}
