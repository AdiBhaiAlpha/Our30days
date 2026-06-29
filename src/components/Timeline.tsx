import { motion } from 'motion/react';
import { TimelineEvent } from '../types';

interface TimelineProps {
  onTimelineComplete: () => void;
}

const EVENTS: TimelineEvent[] = [
  {
    id: '1',
    title: 'Our First Conversation 💬',
    date: 'May 29, 2026',
    category: 'The Spark',
    description: 'The day our worlds collided. A simple hello that changed everything. We connected instantly, chatting for hours about nothing and everything.',
    gradient: 'from-amber-500/20 to-orange-500/20',
  },
  {
    id: '2',
    title: 'Our First Smile 😊',
    date: 'June 2, 2026',
    category: 'Butterflies',
    description: 'The moment when we exchanged pictures/voices and realized how deeply we could make each other smile. The butterflies were real!',
    gradient: 'from-pink-500/20 to-rose-500/20',
  },
  {
    id: '3',
    title: 'Our First Long Night 🌌',
    date: 'June 8, 2026',
    category: 'Endless Chats',
    description: 'We talked until the sun came up, sharing secrets, dreams, and our favorite songs. Neither of us wanted the night to end.',
    gradient: 'from-purple-500/20 to-indigo-500/20',
  },
  {
    id: '4',
    title: 'Our Funny Moments 🤭',
    date: 'June 12, 2026',
    category: 'Pure Laughter',
    description: 'Inside jokes only we understand, teasing each other endlessly, and laughing until our stomachs hurt. You\'re my favorite comedian!',
    gradient: 'from-emerald-500/20 to-teal-500/20',
  },
  {
    id: '5',
    title: 'Our Cute Fights 😤',
    date: 'June 16, 2026',
    category: 'Growing Closer',
    description: 'A little jealousy, silly arguments over who loves who more, and the sweet makeup conversations that followed. Our bond only grows stronger.',
    gradient: 'from-rose-500/20 to-pink-500/20',
  },
  {
    id: '6',
    title: 'Our Endless Calls 📞',
    date: 'June 20, 2026',
    category: 'Voice Notes',
    description: 'Hours felt like minutes on the phone. Hearing your breathing, falling asleep together on call, and waking up to your sweet voice.',
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    id: '7',
    title: 'Our Promises 💍',
    date: 'June 25, 2026',
    category: 'Devotion',
    description: 'Whispering our hopes for the future, promising to stand by each other through thick and thin, and starting this beautiful journey together.',
    gradient: 'from-violet-500/20 to-fuchsia-500/20',
  },
  {
    id: '8',
    title: 'One Month Together ❤️',
    date: 'June 29, 2026',
    category: 'Milestone',
    description: '31 days of pure magic. A small milestone for a love that is destined to last forever. Happy 1 Month, my love!',
    gradient: 'from-amber-400/30 to-rose-500/30',
  },
];

export default function Timeline({ onTimelineComplete }: TimelineProps) {
  return (
    <div id="timeline-container" className="w-full py-8 px-4 flex flex-col items-center">
      {/* Header section */}
      <div className="text-center mb-12">
        <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">
          Chapter Recap
        </span>
        <h2 className="text-3xl font-serif font-bold text-neutral-100 mt-2 tracking-tight">
          Our One Month Journey
        </h2>
        <p className="text-xs text-neutral-400 mt-2 max-w-xs mx-auto italic">
          "Every day with you has been a page in a storybook that I never want to close."
        </p>
      </div>

      {/* Vertical timeline spine */}
      <div className="relative w-full max-w-lg flex flex-col items-center">
        {/* Glow Line Connector */}
        <div className="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-[2px] bg-gradient-to-b from-amber-500/40 via-rose-500/40 to-amber-500/40 pointer-events-none" />

        {/* Timeline cards rendering */}
        <div className="space-y-10 w-full relative z-10">
          {EVENTS.map((event, idx) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: Math.min(idx * 0.1, 0.3) }}
              className="flex w-full justify-between items-center relative"
            >
              {/* Central connecting circle pin */}
              <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-neutral-900 border-2 border-amber-400 shadow-[0_0_10px_#d4af37] z-20" />

              {/* Card wrapper */}
              <div className="w-full flex justify-center">
                {/* Glass Card */}
                <div
                  id={`timeline-card-${event.id}`}
                  className="w-[90%] md:w-[85%] rounded-2xl p-5 md:p-6 bg-neutral-950/60 backdrop-blur-md border border-neutral-800/70 hover:border-amber-400/30 hover:shadow-[0_8px_30px_rgb(212,175,55,0.05)] transition-all duration-300 relative group overflow-hidden"
                >
                  {/* Subtle inner background gradient wash */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${event.gradient} opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity duration-300`} />

                  {/* Top Metadata Row */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-medium">
                      {event.category}
                    </span>
                    <span className="text-xs font-mono text-neutral-400 font-semibold bg-neutral-900/70 border border-neutral-800 px-2 py-0.5 rounded-full">
                      {event.date}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-serif font-bold text-neutral-100 group-hover:text-amber-300 transition-colors duration-200">
                    {event.title}
                  </h3>

                  {/* Description Paragraph */}
                  <p className="text-xs text-neutral-400 leading-relaxed mt-2.5">
                    {event.description}
                  </p>

                  {/* Editable Placeholder Indicator */}
                  <div className="mt-4 pt-3 border-t border-neutral-900/80 flex justify-between items-center">
                    <div className="flex gap-1 items-center opacity-45 group-hover:opacity-75 transition-opacity">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span className="text-[9px] font-mono text-neutral-500 tracking-wider">MEMORIES ENABLED</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Proceed Button */}
      <div className="mt-12">
        <motion.button
          id="timeline-done-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onTimelineComplete}
          className="px-6 py-2.5 rounded-full text-xs font-semibold text-neutral-900 bg-amber-400 hover:bg-amber-300 cursor-pointer shadow-lg shadow-amber-400/20"
        >
          Explore Memory Gallery ✨
        </motion.button>
      </div>
    </div>
  );
}
