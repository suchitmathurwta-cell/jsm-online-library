import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, LogOut, Search, Mic, Plus, Settings, Menu, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { AdminOnly } from './AdminGuard';
import FloatingNavPill from './FloatingNavPill';

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
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [localHeaderSearch, setLocalHeaderSearch] = useState(searchQuery || '');
  const debounceRef = useRef(null);
  const searchInputRef = useRef(null);

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

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert(lang === 'hi' ? 'आपके ब्राउज़र में वॉइस सर्च समर्थित नहीं है।' : (lang === 'ur' ? 'آپ کے براؤزر میں وائس سرچ کی سہولت موجود نہیں۔' : 'Voice search is not supported in this browser.'));
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : (lang === 'ur' ? 'ur-PK' : 'en-US');
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
    <>
      {/* Floating Center Segmented Pill: ScriptToggle & Quick Controls */}
      <FloatingNavPill
        lang={lang}
        setLang={setLang}
        t={t}
        onOpenUpload={onOpenUpload}
        onSearchClick={() => {
          const el = document.getElementById('catalog-search-input') || document.getElementById('catalog');
          el?.scrollIntoView({ behavior: 'smooth' });
          setTimeout(() => {
            const input = document.getElementById('catalog-search-input');
            input?.focus();
          }, 300);
        }}
      />

      {/* Main High-Key Minimalist Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-black/[0.05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Left: Brand Identity in Minimalist Studio Aesthetic */}
            <div className="flex items-center gap-3 shrink-0">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-[#111111] flex items-center justify-center text-white font-sans font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
                  <span>{lang === 'ur' ? 'چ' : (lang === 'en' ? 'CH' : 'चे')}</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-lg font-bold tracking-tight text-[#111111] group-hover:text-black transition-colors">
                      {lang === 'ur' ? 'چیتنا' : (lang === 'en' ? 'CHETNA' : 'चेतना')}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 border-l border-zinc-200 pl-2 hidden sm:inline">
                      {lang === 'ur' ? 'کتب خانہ' : (lang === 'en' ? 'ARCHIVE' : 'ई-पुस्तकालय')}
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Center Spacer to allow FloatingNavPill to be the focal segmented control */}
            <div className="hidden lg:flex flex-1 max-w-xs xl:max-w-sm justify-center pointer-events-none">
              {/* Center spacing preserved for FloatingNavPill */}
            </div>

            {/* Right: Quick Search, Actions, Auth & Admin */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Minimalist ⌘K Search Input */}
              <div className="hidden md:flex items-center relative w-48 lg:w-60">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={localHeaderSearch}
                  onChange={handleHeaderInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setSearchQuery?.(localHeaderSearch);
                      if (onSearchSubmit) onSearchSubmit(localHeaderSearch);
                    }
                  }}
                  placeholder={t.hero?.searchPlaceholder || 'Search title, author...'}
                  autoComplete="off"
                  className="w-full pl-8 pr-12 py-1.5 text-xs bg-zinc-50 hover:bg-white focus:bg-white border border-zinc-200/90 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 rounded-full outline-hidden transition text-[#111111] placeholder-zinc-400"
                />
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 pointer-events-none" />
                <div className="absolute right-2 flex items-center gap-1">
                  <kbd className="hidden lg:inline text-[9px] font-mono text-zinc-400 bg-white px-1 py-0.5 rounded border border-zinc-200">
                    ⌘K
                  </kbd>
                  <button
                    type="button"
                    onClick={handleVoiceSearch}
                    title="Voice Search"
                    className={`p-0.5 text-zinc-400 hover:text-black transition cursor-pointer ${
                      isListening ? 'animate-pulse text-red-500' : ''
                    }`}
                  >
                    <Mic className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* User Profile / Auth */}
              {user ? (
                <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-full text-xs">
                  <div className="w-5 h-5 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-[10px]">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[85px] truncate text-[11px] font-medium text-zinc-700 hidden lg:inline">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                  <button
                    type="button"
                    onClick={() => signOut()}
                    title="Sign Out"
                    className="text-zinc-400 hover:text-red-600 transition p-0.5 cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 text-[#111111] text-xs font-medium transition cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{t.nav.login}</span>
                </button>
              )}

              {/* Minimalist Studio Upload CTA Pill */}
              <button
                onClick={onOpenUpload}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#111111] hover:bg-black text-white text-xs font-medium transition-all duration-150 cursor-pointer shadow-xs hover:scale-[1.02]"
                title={t.nav.uploadBook}
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.nav.uploadBook}</span>
              </button>

              {/* Admin Panel Quick Trigger */}
              <AdminOnly>
                <button
                  onClick={onOpenAdmin}
                  title={t.nav.manageLibrary}
                  className="p-1.5 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-full transition cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </AdminOnly>

              {/* Mobile Drawer Trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 text-[#111111] xl:hidden rounded-lg hover:bg-zinc-100 cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-black/[0.05] py-3 px-4 bg-white/98 backdrop-blur-md animate-fadeIn">
            {/* Quick Genres Grid */}
            <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
              {t.sections.browseBy || 'Domains & Genres'}
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-xs mb-3">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    navigate('/category/' + item.key);
                    if (onSelectCategory) onSelectCategory(item.key);
                    setMobileMenuOpen(false);
                  }}
                  className="p-2 rounded-lg hover:bg-zinc-100 text-[#111111] text-left transition cursor-pointer font-medium"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Mobile Actions */}
            <div className="pt-2 border-t border-zinc-100 flex items-center gap-2">
              <button
                onClick={() => { onOpenUpload(); setMobileMenuOpen(false); }}
                className="flex-1 py-2 text-xs text-center bg-[#111111] text-white rounded-full font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.nav.uploadBook}</span>
              </button>
              {!user && (
                <button
                  onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
                  className="flex-1 py-2 text-xs text-center border border-zinc-200 bg-white rounded-full text-[#111111] font-medium transition cursor-pointer"
                >
                  <span>{t.nav.login}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
