import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function FloatingNavPill({
  lang = 'hi',
  setLang,
  t,
  onOpenUpload,
  onSearchClick
}) {
  const { isAdmin } = useAuth();

  const scriptOptions = [
    { id: 'hi', label: 'Devanagari', vernacular: 'देवनागरी' },
    { id: 'ur', label: 'Nastaliq', vernacular: 'نستعلیق' },
    { id: 'en', label: 'Romanized', vernacular: 'Roman' }
  ];

  // ⌘K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (onSearchClick) {
          onSearchClick();
        } else {
          const searchInput = document.getElementById('catalog-search-input') || document.querySelector('input[type="text"]');
          searchInput?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearchClick]);

  return (
    <nav
      aria-label="Studio navigation"
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 rounded-full bg-[#141414]/90 backdrop-blur-md border border-white/[0.1] p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex items-center gap-1 sm:gap-2 max-w-[95vw]"
    >
      {/* 1. Brand Name: Chetna */}
      <Link
        to="/"
        className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold tracking-tight text-white hover:text-zinc-200 transition-colors"
      >
        <span className="w-5 h-5 rounded-md bg-white text-black flex items-center justify-center text-[10px] font-bold">
          चे
        </span>
        <span className="hidden sm:inline font-sans font-bold">Chetna</span>
      </Link>

      <span className="h-4 w-px bg-white/[0.1]" />

      {/* 2. Script Switcher with spring indicator */}
      <div className="flex items-center gap-0.5">
        {scriptOptions.map((opt) => {
          const isActive = lang === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setLang(opt.id)}
              className={`relative px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-sans font-medium transition-colors cursor-pointer select-none rounded-full ${
                isActive ? 'text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavBubble"
                  className="absolute inset-0 bg-white rounded-full shadow-xs"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1">
                <span>{opt.vernacular}</span>
                <span className="text-[9px] opacity-70 hidden md:inline font-mono">
                  {opt.id.toUpperCase()}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <span className="h-4 w-px bg-white/[0.1]" />

      {/* 3. Search Trigger: ⌘K */}
      <button
        type="button"
        onClick={() => {
          if (onSearchClick) {
            onSearchClick();
          } else {
            const el = document.getElementById('catalog-search-input') || document.getElementById('catalog');
            el?.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
              const input = document.getElementById('catalog-search-input');
              input?.focus();
            }, 300);
          }
        }}
        className="flex items-center gap-1 px-2.5 py-1 text-xs text-zinc-400 hover:text-white rounded-full hover:bg-white/[0.06] transition-colors cursor-pointer"
        title="Search Catalog (⌘K)"
      >
        <Search className="w-3.5 h-3.5 text-zinc-400" />
        <span className="hidden md:inline text-[10px] font-mono text-zinc-400 bg-white/[0.06] px-1.5 py-0.2 rounded border border-white/[0.08]">
          ⌘K
        </span>
      </button>

      {/* 4. Role-gated "Upload Work" button (Admin Only) */}
      {isAdmin && onOpenUpload && (
        <>
          <span className="h-4 w-px bg-white/[0.1]" />
          <button
            type="button"
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-zinc-200 text-black text-[11px] sm:text-xs font-semibold font-mono uppercase tracking-wider transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Upload Work</span>
          </button>
        </>
      )}
    </nav>
  );
}
