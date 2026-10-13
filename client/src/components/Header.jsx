import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, LogOut, Search, Mic, Plus, Settings, Menu, X, ArrowUpRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AdminOnly } from './AdminGuard';

export default function Header({
  lang = 'hi',
  setLang,
  t,
  onOpenUpload,
  onOpenAdmin,
  onOpenAuth,
  onOpenSuggest,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  onSelectCategory
}) {
  const navigate = useNavigate();
  const { user, signOut, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [localHeaderSearch, setLocalHeaderSearch] = useState(searchQuery || '');
  const debounceRef = useRef(null);
  const searchInputRef = useRef(null);

  const scriptOptions = [
    { id: 'hi', label: 'Devanagari', vernacular: 'देवनागरी', code: 'HI' },
    { id: 'ur', label: 'Nastaliq', vernacular: 'نستعلیق', code: 'UR' },
    { id: 'en', label: 'Romanized', vernacular: 'Roman', code: 'EN' }
  ];

  // ⌘K / Ctrl+K keyboard shortcut to focus header search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setLocalHeaderSearch(searchQuery || '');
  }, [searchQuery]);

  const handleHeaderInputChange = (e) => {
    const val = e.target.value;
    setLocalHeaderSearch(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery?.(val);
    }, 200);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery?.(localHeaderSearch);
    if (onSearchSubmit) onSearchSubmit(localHeaderSearch);
    const catElement = document.getElementById('catalog');
    if (catElement) catElement.scrollIntoView({ behavior: 'smooth' });
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert(
        lang === 'hi'
          ? 'आपके ब्राउज़र में वॉइस सर्च समर्थित नहीं है।'
          : lang === 'ur'
          ? 'آپ کے براؤزر میں وائس سرچ کی سہولت موجود نہیں۔'
          : 'Voice search is not supported in this browser.'
      );
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'ur' ? 'ur-PK' : 'en-US';
    recognition.interimResults = false;

    setIsListening(true);
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setLocalHeaderSearch(transcript);
      setSearchQuery?.(transcript);
      if (onSearchSubmit) onSearchSubmit(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const navItems = [
    { key: 'novel', label: t.nav.novel || 'Novel' },
    { key: 'story', label: t.nav.story || 'Story' },
    { key: 'poetry', label: t.nav.poetry || 'Poetry' },
    { key: 'magazines', label: t.nav.magazines || 'Magazines' },
    { key: 'vimarsh', label: t.nav.vimarsh || 'Discourse' },
    { key: 'cultural-conscience', label: t.nav.conscience || 'Conscience' },
    { key: 'satire', label: t.nav.satire || 'Satire' },
    { key: 'drama', label: t.nav.drama || 'Drama' },
    { key: 'essays', label: t.nav.essays || 'Essays' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#080808]/90 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          
          {/* ========================================================================= */}
          {/* 1. LEFT: Brand Lockup                                                     */}
          {/* ========================================================================= */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-[10px] bg-white flex items-center justify-center text-black font-sans font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
                <span>{lang === 'ur' ? 'چ' : lang === 'en' ? 'CH' : 'चे'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-sans text-base font-bold tracking-tight text-white group-hover:text-zinc-200 transition-colors">
                  {lang === 'ur' ? 'چیتنا' : lang === 'en' ? 'CHETNA' : 'चेतना'}
                </span>
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-400 border border-white/[0.1] px-2 py-0.5 rounded-full hidden md:inline">
                  {lang === 'ur' ? 'کتب خانہ' : lang === 'en' ? 'DIGITAL ARCHIVE' : 'डिजिटल अभिलेखागार'}
                </span>
              </div>
            </Link>
          </div>

          {/* ========================================================================= */}
          {/* 2. CENTER: Segmented Script Switcher (Docked Studio Capsule)             */}
          {/* ========================================================================= */}
          <nav
            aria-label="Script Selection"
            className="hidden md:flex items-center justify-center"
          >
            <div className="flex items-center gap-1 p-1 rounded-full bg-[#141414] border border-white/[0.08] shadow-inner">
              {scriptOptions.map((opt) => {
                const isActive = lang === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setLang(opt.id)}
                    className={`relative px-3 sm:px-3.5 py-1 text-xs font-sans font-medium transition-colors cursor-pointer select-none rounded-full ${
                      isActive ? 'text-black' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeScriptBubble"
                        className="absolute inset-0 bg-white rounded-full shadow-xs"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <span>{opt.vernacular}</span>
                      <span className={`text-[9px] font-mono tracking-widest ${isActive ? 'text-zinc-700' : 'text-zinc-400'}`}>
                        {opt.code}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* ========================================================================= */}
          {/* 3. RIGHT: Search, Upload Action & Profile Suite                           */}
          {/* ========================================================================= */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Minimalist ⌘K Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative hidden lg:flex items-center">
              <input
                ref={searchInputRef}
                type="text"
                value={localHeaderSearch}
                onChange={handleHeaderInputChange}
                placeholder={t.hero?.searchPlaceholder || 'Search title, author...'}
                autoComplete="off"
                className="w-44 xl:w-56 pl-8 pr-14 py-1.5 text-xs bg-[#141414] hover:bg-[#181818] focus:bg-[#181818] border border-white/[0.08] focus:border-white/30 rounded-full outline-hidden transition text-white placeholder-zinc-500 font-sans"
              />
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 pointer-events-none" />
              <div className="absolute right-2 flex items-center gap-1">
                <kbd className="text-[9px] font-mono text-zinc-400 bg-white/[0.06] px-1 py-0.5 rounded border border-white/[0.08]">
                  ⌘K
                </kbd>
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  title="Voice Search"
                  className={`p-0.5 text-zinc-400 hover:text-white transition cursor-pointer ${
                    isListening ? 'animate-pulse text-red-500' : ''
                  }`}
                >
                  <Mic className="w-3 h-3" />
                </button>
              </div>
            </form>

            {/* Quick Search Button (for screens where full input is hidden) */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('catalog-search-input') || document.getElementById('catalog');
                el?.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => {
                  const input = document.getElementById('catalog-search-input');
                  input?.focus();
                }, 300);
              }}
              className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-full bg-[#141414] border border-white/[0.08] hover:bg-white/[0.06] transition cursor-pointer"
              title="Search (⌘K)"
            >
              <Search className="w-3.5 h-3.5" />
            </button>

            {/* High-Contrast "Upload Work" CTA Pill */}
            <button
              type="button"
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold font-mono uppercase tracking-wider transition-all duration-150 cursor-pointer shadow-xs hover:scale-[1.02]"
              title={t.nav.uploadBook || 'Upload Work'}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.nav.uploadBook || 'Upload Work'}</span>
            </button>

            {/* Admin Management Cog (Admin Only) */}
            <AdminOnly>
              <button
                type="button"
                onClick={onOpenAdmin}
                title={t.nav.manageLibrary || 'Admin Portal'}
                className="p-2 text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-full transition cursor-pointer border border-transparent hover:border-white/[0.08]"
              >
                <Settings className="w-4 h-4" />
              </button>
            </AdminOnly>

            {/* User Profile / Auth Button */}
            {user ? (
              <div className="flex items-center gap-2 bg-[#141414] border border-white/[0.08] px-2.5 py-1 rounded-full text-xs">
                <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center font-bold text-[10px]">
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="max-w-[75px] truncate text-[11px] font-medium text-zinc-300 hidden xl:inline">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
                <button
                  type="button"
                  onClick={() => signOut()}
                  title="Sign Out"
                  className="text-zinc-400 hover:text-red-400 transition p-0.5 cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="p-2 text-zinc-300 hover:text-white rounded-full bg-[#141414] hover:bg-white/[0.06] border border-white/[0.08] transition cursor-pointer flex items-center gap-1.5 sm:px-3 sm:py-1.5"
                title={t.nav.login || 'Sign In'}
              >
                <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline text-xs font-mono uppercase tracking-wider">{t.nav.login || 'Sign In'}</span>
              </button>
            )}

            {/* Mobile Navigation Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-300 hover:text-white bg-[#141414] hover:bg-white/[0.06] border border-white/[0.08] rounded-full transition cursor-pointer md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MOBILE DRAWER: Dark Studio Glass Sheet                                 */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.08] py-4 px-4 bg-[#0e0e0e]/95 backdrop-blur-xl animate-fadeIn text-white">
          
          {/* Mobile Script Switcher */}
          <div className="mb-4">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-2">
              Script / भाषा / رسم الخط
            </p>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#141414] border border-white/[0.08]">
              {scriptOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setLang(opt.id);
                  }}
                  className={`py-1.5 text-xs rounded-xl font-medium transition cursor-pointer text-center ${
                    lang === opt.id ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {opt.vernacular}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Browse Domains */}
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-2">
            {t.sections?.browseBy || 'Archival Domains'}
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-xs mb-4">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  navigate('/category/' + item.key);
                  if (onSelectCategory) onSelectCategory(item.key);
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-200 text-left transition cursor-pointer font-sans"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Actions */}
          <div className="pt-3 border-t border-white/[0.08] flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onOpenUpload();
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 text-xs text-center bg-white hover:bg-zinc-200 text-black rounded-full font-mono uppercase tracking-wider font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.nav.uploadBook || 'Upload Work'}</span>
            </button>
            {!user && (
              <button
                type="button"
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 text-xs text-center border border-white/[0.1] bg-[#141414] hover:bg-white/[0.06] rounded-full text-white font-mono uppercase tracking-wider transition cursor-pointer"
              >
                <span>{t.nav.login || 'Sign In'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
