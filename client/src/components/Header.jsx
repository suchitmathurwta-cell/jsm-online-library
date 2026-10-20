import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Globe,
  User as UserIcon,
  LogOut,
  Search,
  Mic,
  Plus,
  Settings,
  Menu,
  X,
  ArrowRight,
  BookOpen,
  Loader2,
  Command
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminOnly } from './AdminGuard';
import { getBooks } from '../services/supabaseApi';

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
  onSelectCategory,
  onSelectBook,
  onOpenReader
}) {
  const navigate = useNavigate();
  const { user, signOut, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [spotlightQuery, setSpotlightQuery] = useState(searchQuery || '');
  const [spotlightResults, setSpotlightResults] = useState([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const langDropdownRef = useRef(null);
  const spotlightInputRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ⌘K / Ctrl+K keyboard shortcut to open Spotlight Search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSpotlightOpen((prev) => !prev);
      } else if (e.key === 'Escape' && spotlightOpen) {
        setSpotlightOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [spotlightOpen]);

  // Auto focus input when Spotlight opens
  useEffect(() => {
    if (spotlightOpen) {
      setSpotlightQuery(searchQuery || '');
      setTimeout(() => {
        spotlightInputRef.current?.focus();
      }, 80);
    }
  }, [spotlightOpen, searchQuery]);

  // Debounced live search inside Spotlight
  const handleSpotlightInputChange = (e) => {
    const val = e.target.value;
    setSpotlightQuery(val);

    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);

    if (!val || !val.trim()) {
      setSpotlightResults([]);
      setIsSearchingLive(false);
      return;
    }

    setIsSearchingLive(true);
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await getBooks({ search: val.trim(), limit: 8 });
        setSpotlightResults(results || []);
      } catch (err) {
        console.warn('Spotlight live search error:', err);
      } finally {
        setIsSearchingLive(false);
      }
    }, 200);
  };

  const handleSpotlightSubmit = (e) => {
    e?.preventDefault();
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    setSearchQuery?.(spotlightQuery);
    if (onSearchSubmit) onSearchSubmit(spotlightQuery);
    setSpotlightOpen(false);
    const catElement = document.getElementById('catalog');
    if (catElement) catElement.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectSpotlightBook = (book) => {
    setSpotlightOpen(false);
    if (onOpenReader) {
      onOpenReader(book);
    } else if (onSelectBook) {
      onSelectBook(book);
    } else {
      navigate(`/read/${book.id}`);
    }
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
      setSpotlightQuery(transcript);
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

  const popularThinkers = [
    'मुंशी प्रेमचंद',
    'मिर्ज़ा ग़ालिब',
    'रवींद्रनाथ टैगोर',
    'संत कबीर',
    'फ़ैज़ अहमद फ़ैज़',
    'महादेवी वर्मा'
  ];

  const getLangCode = () => {
    if (lang === 'hi') return 'HIN';
    if (lang === 'ur') return 'URD';
    return 'ENG';
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. MUGEN STUDIO FLOATING ISLAND DOCK NAVIGATION BAR                      */}
      {/* ========================================================================= */}
      <header className="fixed top-3 sm:top-5 inset-x-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-none select-none">
        <nav
          aria-label="Studio navigation"
          className="pointer-events-auto inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#121212]/92 backdrop-blur-2xl border border-white/[0.1] shadow-[0_16px_40px_rgba(0,0,0,0.7)] transition-all duration-300 hover:border-white/20 max-w-[98vw]"
        >
          {/* 1.1 Brand Lockup */}
          <Link
            to="/"
            className="flex items-center gap-2 pr-1 group shrink-0 focus:outline-hidden"
            title={lang === 'hi' ? 'जसम ऑनलाइन लाइब्रेरी' : lang === 'ur' ? 'جسم آن لائن لائبریری' : 'JSM Online Library'}
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center text-black font-sans font-bold text-xs shadow-xs group-hover:scale-105 transition-transform duration-200 shrink-0 tracking-tighter">
              <span>{lang === 'hi' ? 'जसम' : lang === 'ur' ? 'جسم' : 'JSM'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-sans text-xs sm:text-sm font-bold tracking-tight text-white group-hover:text-zinc-200 transition-colors">
                {lang === 'hi' ? 'जसम' : lang === 'ur' ? 'جسم' : 'JSM'}
              </span>
              <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-zinc-400 border border-white/[0.1] px-1.5 py-0.5 rounded-full hidden xl:inline">
                {lang === 'ur' ? 'آن لائن لائبریری' : lang === 'en' ? 'ONLINE LIBRARY' : 'ऑनलाइन लाइब्रेरी'}
              </span>
            </div>
          </Link>

          {/* Hairline Divider */}
          <span className="h-4 w-px bg-white/[0.1] hidden sm:block shrink-0" />

          {/* 1.2 Universal ⌘K Spotlight Trigger Capsule */}
          <button
            type="button"
            onClick={() => setSpotlightOpen(true)}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs text-zinc-400 hover:text-white rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer shrink-0 group"
            title="Search Archive (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
            <span className="hidden lg:inline text-xs text-zinc-400 group-hover:text-zinc-200">
              {searchQuery ? searchQuery : t.hero?.searchBtn ? `${t.hero.searchBtn}...` : 'Search...'}
            </span>
            <kbd className="text-[9px] font-mono text-zinc-400 bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/[0.1]">
              ⌘K
            </kbd>
          </button>

          {/* Hairline Divider */}
          <span className="h-4 w-px bg-white/[0.1] hidden sm:block shrink-0" />

          {/* 1.3 Previous Language Selector Dropdown (HIN, ENG, URD) in Studio Aesthetic */}
          <div ref={langDropdownRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-mono font-medium text-zinc-200 bg-white/[0.04] hover:bg-white/[0.08] rounded-full border border-white/[0.08] hover:border-white/20 transition cursor-pointer select-none"
              title="Select Language / भाषा चुनें"
            >
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              <span className="uppercase text-[11px] font-bold tracking-wider">{getLangCode()}</span>
              <span className="text-[8px] text-zinc-400">▼</span>
            </button>

            <AnimatePresence>
              {langDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 sm:left-1/2 sm:-translate-x-1/2 mt-2 w-40 bg-[#141414]/95 backdrop-blur-2xl rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.85)] border border-white/[0.1] py-1.5 text-xs z-50 text-white"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setLang('hi');
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-white/[0.08] transition cursor-pointer rounded-xl ${
                      lang === 'hi' ? 'font-bold text-white bg-white/[0.1]' : 'text-zinc-300'
                    }`}
                  >
                    <span>हिंदी (HIN)</span>
                    {lang === 'hi' && <span className="text-white font-bold">✓</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLang('en');
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-white/[0.08] transition cursor-pointer rounded-xl ${
                      lang === 'en' ? 'font-bold text-white bg-white/[0.1]' : 'text-zinc-300'
                    }`}
                  >
                    <span>English (ENG)</span>
                    {lang === 'en' && <span className="text-white font-bold">✓</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLang('ur');
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-white/[0.08] font-urdu transition cursor-pointer rounded-xl ${
                      lang === 'ur' ? 'font-bold text-white bg-white/[0.1]' : 'text-zinc-300'
                    }`}
                  >
                    <span>اردو (URD)</span>
                    {lang === 'ur' && <span className="text-white font-bold">✓</span>}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 1.4 High-Contrast "Upload Work" & Admin Management Cog (Admin Only) */}
          <AdminOnly>
            <span className="h-4 w-px bg-white/[0.1] hidden sm:block shrink-0" />
            <button
              type="button"
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white hover:bg-zinc-200 text-black text-[11px] sm:text-xs font-semibold font-mono uppercase tracking-wider transition-all duration-150 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-95 shrink-0"
              title={t.nav.uploadBook || 'Upload Work'}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.nav.uploadBook || 'Upload Work'}</span>
            </button>
            <button
              type="button"
              onClick={onOpenAdmin}
              title={t.nav.manageLibrary || 'Admin Portal'}
              className="p-1.5 sm:p-2 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-full transition cursor-pointer shrink-0"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </AdminOnly>

          {/* 1.6 User Profile / Sign In Pill */}
          {user ? (
            <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] pl-1.5 pr-2 py-1 rounded-full text-xs shrink-0">
              <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center font-bold text-[10px]">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="max-w-[70px] truncate text-[11px] font-medium text-zinc-300 hidden xl:inline">
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
              className="p-1.5 sm:px-3 sm:py-1.5 text-zinc-300 hover:text-white rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition cursor-pointer flex items-center gap-1.5 shrink-0"
              title={t.nav.login || 'Sign In'}
            >
              <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline text-xs font-mono uppercase tracking-wider">
                {t.nav.login || 'Sign In'}
              </span>
            </button>
          )}

          {/* 1.7 Mobile Navigation Drawer Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 sm:p-2 text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-full transition cursor-pointer md:hidden shrink-0"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
          </button>
        </nav>
      </header>

      {/* ========================================================================= */}
      {/* 2. SPOTLIGHT SEARCH COMMAND PALETTE MODAL (⌘K)                           */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {spotlightOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSpotlightOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Spotlight Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl bg-[#141414] border border-white/[0.12] rounded-3xl shadow-[0_24px_70px_rgba(0,0,0,0.95)] overflow-hidden z-10"
            >
              {/* Search Bar Input Row */}
              <form onSubmit={handleSpotlightSubmit} className="relative flex items-center p-3.5 sm:p-4 border-b border-white/[0.08]">
                <div className="pl-2 pr-3 text-zinc-400 pointer-events-none flex items-center justify-center">
                  {isSearchingLive ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Search className="w-5 h-5 text-zinc-400" />
                  )}
                </div>

                <input
                  ref={spotlightInputRef}
                  type="text"
                  value={spotlightQuery}
                  onChange={handleSpotlightInputChange}
                  placeholder={
                    lang === 'hi'
                      ? 'पुस्तक, रचनाकार, विधा या विषय खोजें...'
                      : lang === 'ur'
                      ? 'کتاب، مصنف، صنف یا موضوع تلاش کریں...'
                      : 'Search by book title, author, or genre...'
                  }
                  autoComplete="off"
                  className="w-full py-1 text-sm sm:text-base text-white placeholder-zinc-500 bg-transparent outline-hidden font-sans cursor-text font-medium"
                />

                {spotlightQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSpotlightQuery('');
                      setSpotlightResults([]);
                    }}
                    className="p-1 mr-1 text-zinc-400 hover:text-white rounded-full hover:bg-white/[0.06] transition cursor-pointer"
                    title="Clear"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  title="Voice Search"
                  className={`p-1.5 mr-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition cursor-pointer ${
                    isListening ? 'animate-pulse text-red-500 bg-red-950/40' : ''
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>

                <kbd className="text-[10px] font-mono text-zinc-400 bg-white/[0.06] px-2 py-0.5 rounded border border-white/[0.08] select-none">
                  ESC
                </kbd>
              </form>

              {/* Dynamic Body Content */}
              <div className="max-h-[60vh] overflow-y-auto divide-y divide-white/[0.06]">
                {/* 2.1 Live Results List */}
                {spotlightQuery.trim() ? (
                  spotlightResults.length > 0 ? (
                    <div className="p-2">
                      <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">
                        {spotlightResults.length} {t.sections?.worksUnit || (lang === 'hi' ? 'पुस्तकें मिलीं' : lang === 'ur' ? 'کتابیں ملیں' : 'books found')}
                      </div>
                      <div className="space-y-1">
                        {spotlightResults.map((b) => (
                          <div
                            key={b.id}
                            onClick={() => handleSelectSpotlightBook(b)}
                            className="group flex items-center justify-between p-3 rounded-2xl hover:bg-white/[0.06] transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-11 rounded-lg bg-zinc-900 border border-white/[0.08] overflow-hidden flex items-center justify-center shrink-0">
                                {b.cover_image ? (
                                  <img
                                    src={b.cover_image}
                                    alt={b.title_en || b.title_hi}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <BookOpen className="w-4 h-4 text-zinc-500" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs sm:text-sm font-semibold text-white tracking-tight truncate group-hover:text-zinc-200">
                                  {lang === 'hi' ? b.title_hi || b.title_en : b.title_en || b.title_hi}
                                </h4>
                                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                                  {lang === 'hi' ? b.author_hi || b.author_en : b.author_en || b.author_hi}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 pl-3">
                              <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.05] text-zinc-400 border border-white/[0.06] hidden sm:inline">
                                {b.category}
                              </span>
                              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Jump to catalog button */}
                      <div className="p-2 pt-3 border-t border-white/[0.06]">
                        <button
                          type="button"
                          onClick={handleSpotlightSubmit}
                          className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono uppercase tracking-wider text-white text-center transition cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Search className="w-3.5 h-3.5 text-zinc-400" />
                          <span>View all results for "{spotlightQuery}" in catalog</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs font-mono uppercase text-zinc-400">
                      {isSearchingLive ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 text-white animate-spin" />
                          <span>{lang === 'hi' ? 'पुस्तकालय में खोज रहे हैं...' : lang === 'ur' ? 'کتب خانے میں تلاش جاری ہے...' : 'Searching library collection...'}</span>
                        </div>
                      ) : (
                        <span>{lang === 'hi' ? `"${spotlightQuery}" से संबंधित कोई पुस्तक नहीं मिली` : lang === 'ur' ? `"${spotlightQuery}" سے متعلق کوئی کتاب نہیں ملی` : `No books matched "${spotlightQuery}"`}</span>
                      )}
                    </div>
                  )
                ) : (
                  /* 2.2 Quick Shortcuts when query is empty */
                  <div className="p-4 space-y-4">
                    {/* Category Shortcuts */}
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-2.5">
                        {lang === 'hi' ? 'श्रेणियों के अनुसार खोजें' : lang === 'ur' ? 'اصناف کے مطابق تلاش کریں' : 'Browse by Category'}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {navItems.map((item) => (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => {
                              navigate('/category/' + item.key);
                              if (onSelectCategory) onSelectCategory(item.key);
                              setSpotlightOpen(false);
                            }}
                            className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-sans text-zinc-200 text-left transition cursor-pointer flex items-center justify-between group"
                          >
                            <span className="truncate">{item.label}</span>
                            <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-zinc-300 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Prolific Authors / Thinkers */}
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-2">
                        Popular Authors & Thinkers
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {popularThinkers.map((author) => (
                          <button
                            key={author}
                            type="button"
                            onClick={() => {
                              setSpotlightQuery(author);
                              handleSpotlightInputChange({ target: { value: author } });
                            }}
                            className="px-3 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-sans text-zinc-400 hover:text-white transition cursor-pointer"
                          >
                            {author}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-3 bg-black/60 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Command className="w-3 h-3" />
                  <span>{lang === 'hi' ? 'जसम खोज' : lang === 'ur' ? 'جسم تلاش' : 'JSM Spotlight'}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span>[↵ to explore]</span>
                  <span>[esc to dismiss]</span>
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 3. MOBILE FLOATING GLASS DRAWER                                           */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed top-18 sm:top-20 inset-x-4 max-w-lg mx-auto z-50 p-4 rounded-3xl bg-[#121212]/96 backdrop-blur-2xl border border-white/[0.1] shadow-2xl text-white md:hidden"
          >
            {/* Mobile Language Selector (Reverted to Previous States: HIN, ENG, URD) */}
            <div className="mb-4">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-2">
                Language / भाषा / زبان
              </p>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setLang('hi')}
                  className={`py-1.5 text-xs rounded-xl font-medium transition cursor-pointer text-center ${
                    lang === 'hi' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  हिंदी (HIN)
                </button>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`py-1.5 text-xs rounded-xl font-medium transition cursor-pointer text-center ${
                    lang === 'en' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  English (ENG)
                </button>
                <button
                  type="button"
                  onClick={() => setLang('ur')}
                  className={`py-1.5 text-xs rounded-xl font-urdu font-medium transition cursor-pointer text-center ${
                    lang === 'ur' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  اردو (URD)
                </button>
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
              <AdminOnly>
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
              </AdminOnly>
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
