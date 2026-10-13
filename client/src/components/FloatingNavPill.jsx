import React from 'react';
import { motion } from 'framer-motion';

export default function FloatingNavPill({
  lang = 'hi',
  setLang,
  t
}) {
  const scriptOptions = [
    { id: 'hi', label: 'Devanagari', vernacular: 'देवनागरी' },
    { id: 'en', label: 'Romanized', vernacular: 'Roman' },
    { id: 'ur', label: 'Nastaliq', vernacular: 'نستعلیق' }
  ];

  return (
    <nav
      aria-label="Script selection"
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 rounded-full bg-white/85 backdrop-blur-md border border-black/5 p-1 shadow-sm flex items-center gap-0.5"
    >
      {scriptOptions.map((opt) => {
        const isActive = lang === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setLang(opt.id)}
            className={`relative px-3.5 py-1.5 text-xs font-sans font-medium transition-colors cursor-pointer select-none rounded-full ${
              isActive ? 'text-white' : 'text-zinc-600 hover:text-black'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeNavBubble"
                className="absolute inset-0 bg-[#111111] rounded-full shadow-xs"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <span>{opt.vernacular}</span>
              <span className="text-[10px] opacity-70 hidden sm:inline font-mono">
                {opt.id.toUpperCase()}
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}
