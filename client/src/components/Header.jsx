import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, LogOut, BookMarked, Sparkles } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Mic,
  Plus,
  Settings,
  Globe,
  Menu,
  X,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { AdminOnly, VisitorOnly } from './AdminGuard';

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
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [localHeaderSearch, setLocalHeaderSearch] = useState(searchQuery || '');
  const debounceRef = useRef(null);

  useEffect(() => {
    setLocalHeaderSearch(searchQuery || '');
  }, [searchQuery]);

  const handleHeaderInputChange = (e) => {
    const val = e.target.value;
    setLocalHeaderSearch(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery?.(val);
    }, 250);
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
    { key: 'novel', label: t.nav.novel || 'Novel & Fiction' },
    { key: 'story', label: t.nav.story || 'Story' },
    { key: 'poetry', label: t.nav.poetry || 'Poetry & Verse' },
    { key: 'magazines', label: t.nav.magazines || 'Periodicals' },
    { key: 'vimarsh', label: t.nav.vimarsh || 'Discourse' },
    { key: 'cultural-conscience', label: t.nav.conscience || 'Conscience' },
    { key: 'satire', label: t.nav.satire || 'Satire' },
    { key: 'drama', label: t.nav.drama || 'Theatre & Drama' },
    { key: 'essays', label: t.nav.essays || 'Essays' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F7F5F0]/95 backdrop-blur-md border-b border-[#DDD7CD] transition-all">
      {/* 1. Archival Masthead Top Ledger Folio */}
      <div className="border-b border-[#DDD7CD]/70 px-4 sm:px-6 py-1.5 bg-[#EFECE6]/50 text-[#847E75] text-[11px] font-mono-ledger flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#9B382A]"></span>
          <span className="tracking-wider uppercase">
            CHETNA // CULTURAL ARCHIVE & READING ROOM
          </span>
          <span className="hidden md:inline text-[#DDD7CD]">|</span>
          <span className="hidden md:inline text-[#524E48] font-editorial italic font-normal">
            {t.tagline}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {onOpenSuggest && (
            <VisitorOnly>
              <button
                onClick={onOpenSuggest}
                className="hover:text-[#121110] transition-colors cursor-pointer hidden sm:flex items-center gap-1"
              >
                <span>Suggest a Treatise</span>
                <ArrowUpRight className="w-3 h-3 text-[#9B382A]" />
              </button>
            </VisitorOnly>
          )}

          <AdminOnly>
            <button
              onClick={onOpenAdmin}
              className="text-[#9B382A] font-semibold hover:underline cursor-pointer flex items-center gap-1 transition-colors"
            >
              <span>{t.nav.manageLibrary}</span>
              <Settings className="w-3 h-3" />
            </button>
          </AdminOnly>
        </div>
      </div>

      {/* 2. Main Editorial Masthead */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-4">
          
          {/* Brand Monogram & Cultural Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#121110] text-[#F7F5F0] flex items-center justify-center font-editorial font-bold text-base shadow-2xs group-hover:bg-[#9B382A] transition-colors">
                <span>{lang === 'ur' ? 'چ' : (lang === 'en' ? 'C' : 'चे')}</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="font-editorial text-2xl font-bold tracking-tight text-[#121110] group-hover:text-[#9B382A] transition-colors">
                    {t.brand}
                  </span>
                  <span className="text-[10px] font-mono-ledger uppercase tracking-widest text-[#847E75] hidden sm:inline">
                    / ARCHIVE
                  </span>
                </div>
                <span className="text-[10px] text-[#524E48] font-editorial italic -mt-1 hidden lg:block">
                  {t.brandTagline}
                </span>
              </div>
            </Link>
          </div>

          {/* Minimal Editorial Search Capsule */}
          <div className="hidden md:flex items-center flex-1 max-w-sm lg:max-w-md relative">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearchQuery?.(localHeaderSearch);
                if (onSearchSubmit) onSearchSubmit(localHeaderSearch);
              }}
              className="w-full relative flex items-center"
            >
              <Search className="w-3.5 h-3.5 text-[#847E75] absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={localHeaderSearch}
                onChange={handleHeaderInputChange}
                placeholder={t.hero?.searchPlaceholder || 'Search title, author, historical era, theme...'}
                autoComplete="off"
                className="w-full pl-9 pr-14 py-1.5 text-xs bg-[#EFECE6]/60 hover:bg-white focus:bg-white border border-[#DDD7CD] focus:border-[#9B382A] rounded-full outline-hidden transition text-[#121110] placeholder-[#847E75] font-editorial"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  title="Voice Search"
                  className={`p-1 text-[#847E75] hover:text-[#9B382A] transition cursor-pointer ${isListening ? 'animate-pulse text-red-600' : ''}`}
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>
                <span className="hidden xl:inline text-[9px] font-mono text-[#847E75] border border-[#DDD7CD] rounded px-1 py-0.2">
                  ⌘K
                </span>
              </div>
            </form>
          </div>

          {/* Right Action Tools: Language, Upload, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Minimal Segmented Language Pill */}
            <div className="flex items-center p-0.5 bg-[#EFECE6] border border-[#DDD7CD] rounded-full text-xs font-medium">
              {[
                { code: 'hi', label: 'हिं' },
                { code: 'en', label: 'EN' },
                { code: 'ur', label: 'اردو' }
              ].map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`px-2 py-0.5 rounded-full transition cursor-pointer text-[11px] ${
                    lang === l.code
                      ? 'bg-[#121110] text-white font-bold shadow-2xs'
                      : 'text-[#524E48] hover:text-[#121110]'
                  }`}
                  title={l.label}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Admin Upload Trigger in Terracotta */}
            <AdminOnly>
              <button
                onClick={onOpenUpload}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#9B382A] hover:bg-[#832E22] text-white text-xs font-semibold rounded-full shadow-2xs transition cursor-pointer"
                title={t.nav.uploadBook}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.nav.uploadBook}</span>
              </button>
            </AdminOnly>

            {/* User Profile / Auth Button */}
            {user ? (
              <div className="flex items-center gap-1.5 bg-[#EFECE6] border border-[#DDD7CD] px-2.5 py-1 rounded-full text-xs">
                <span className="w-4 h-4 rounded-full bg-[#121110] text-white flex items-center justify-center font-bold text-[9px]">
                  {(user.email || 'U')[0].toUpperCase()}
                </span>
                <span className="font-mono text-[10px] text-[#524E48] max-w-[80px] truncate hidden sm:inline">
                  {user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  title="Sign Out"
                  className="text-[#847E75] hover:text-red-700 transition p-0.5 cursor-pointer ml-0.5"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#EFECE6] hover:bg-[#DDD7CD] text-[#121110] text-xs font-semibold border border-[#DDD7CD] transition cursor-pointer"
              >
                <UserIcon className="w-3 h-3 text-[#847E75]" />
                <span className="hidden sm:inline">{t.nav.login}</span>
              </button>
            )}

            {/* Mobile Navigation Drawer Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-1.5 text-[#121110] hover:bg-[#EFECE6] rounded-lg transition cursor-pointer border border-[#DDD7CD]"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

          </div>
        </div>

        {/* 3. Archival Domain Ledger Strip (Desktop) */}
        <nav className="hidden xl:flex items-center justify-between py-2 border-t border-[#DDD7CD]/60 text-xs font-editorial text-[#524E48]">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {navItems.map((item, idx) => (
              <React.Fragment key={item.key}>
                <button
                  onClick={() => {
                    navigate('/category/' + item.key);
                    if (onSelectCategory) onSelectCategory(item.key);
                  }}
                  className="px-2.5 py-1 rounded-md hover:text-[#121110] hover:bg-[#EFECE6]/70 transition-colors cursor-pointer tracking-wide"
                >
                  {item.label}
                </button>
                {idx < navItems.length - 1 && (
                  <span className="text-[#DDD7CD] text-[10px] select-none">•</span>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono-ledger text-[#847E75]">
            <span>[ OPEN ACCESS ARCHIVE ]</span>
          </div>
        </nav>

        {/* 4. Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-[#DDD7CD] py-3 space-y-3 bg-[#F7F5F0] animate-fadeIn">
            {/* Search Input for Mobile */}
            <div className="px-1">
              <input
                type="text"
                value={localHeaderSearch}
                onChange={handleHeaderInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearchQuery?.(localHeaderSearch);
                    if (onSearchSubmit) onSearchSubmit(localHeaderSearch);
                    setMobileMenuOpen(false);
                  }
                }}
                placeholder={t.hero?.searchPlaceholder || 'Search title, author, theme...'}
                className="w-full px-3 py-2 text-xs bg-[#EFECE6] border border-[#DDD7CD] rounded-xl text-[#121110] font-editorial outline-hidden"
              />
            </div>

            {/* Category Navigation Matrix */}
            <div className="grid grid-cols-2 gap-1.5 text-xs font-editorial">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    navigate('/category/' + item.key);
                    if (onSelectCategory) onSelectCategory(item.key);
                    setMobileMenuOpen(false);
                  }}
                  className="p-2.5 text-left rounded-lg hover:bg-[#EFECE6] text-[#121110] transition-colors cursor-pointer border border-[#DDD7CD]/50"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Mobile Actions */}
            <div className="pt-2 border-t border-[#DDD7CD] flex gap-2">
              <AdminOnly>
                <button
                  onClick={() => { onOpenUpload(); setMobileMenuOpen(false); }}
                  className="flex-1 py-2 text-xs text-center bg-[#9B382A] text-white rounded-xl font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.nav.uploadBook}</span>
                </button>
                <button
                  onClick={() => { onOpenAdmin(); setMobileMenuOpen(false); }}
                  className="flex-1 py-2 text-xs text-center border border-[#DDD7CD] bg-[#EFECE6] rounded-xl font-medium text-[#121110] transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>{t.nav.manageLibrary}</span>
                </button>
              </AdminOnly>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
