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
  X
} from 'lucide-react';
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
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [localHeaderSearch, setLocalHeaderSearch] = useState(searchQuery || '');
  const debounceRef = useRef(null);
  const searchInputRef = useRef(null);

  // Global ⌘K / Ctrl+K shortcut to focus inquiry input
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
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#D5CFC4]">
      {/* Editorial Provenance Bar */}
      <div className="bg-[#161514] text-[#D5CFC4] text-[11px] py-1 px-4 tracking-normal flex justify-between items-center max-w-full">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#A83324]"></span>
            <span className="font-editorial italic text-stone-300">{t.tagline}</span>
          </div>
          <AdminOnly>
            <button
              onClick={onOpenAdmin}
              className="text-[#EAE6DC] hover:text-[#A83324] cursor-pointer text-[11px] transition-colors flex items-center gap-1 font-mono"
            >
              <span>{t.nav.manageLibrary}</span>
              <span className="text-[#A83324]">⚙</span>
            </button>
          </AdminOnly>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          
          {/* Brand Mark: Script Parity & Editorial Dignity */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-sm bg-[#161514] flex items-center justify-center text-[#F4F1EA] font-serif text-sm border border-[#161514] group-hover:bg-[#A83324] group-hover:border-[#A83324] transition-colors">
                <span className="font-editorial font-bold">{lang === 'ur' ? 'چ' : (lang === 'en' ? 'CH' : 'चे')}</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="font-editorial text-xl sm:text-2xl font-bold tracking-tight text-[#161514]">
                    {lang === 'ur' ? 'چیتنا' : (lang === 'en' ? 'CHETNA' : 'चेतना')}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-[#7A746B] font-mono border-l border-[#D5CFC4] pl-2 hidden sm:inline">
                    {lang === 'ur' ? 'کتب خانہ' : (lang === 'en' ? 'LIBRARY REGISTER' : 'ई-पुस्तकालय')}
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Inquiry Shell / Register Search with ⌘K */}
          <div className="hidden md:flex items-center flex-1 max-w-sm lg:max-w-md relative">
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
              placeholder={t.hero?.searchPlaceholder || 'ग्रंथ, लेखक या विषय खोजें...'}
              autoComplete="off"
              className="w-full pl-9 pr-14 py-1.5 text-xs bg-[#F4F1EA] hover:bg-white focus:bg-white border border-[#D5CFC4] focus:border-[#161514] focus:ring-1 focus:ring-[#161514] rounded-md outline-hidden transition text-[#161514] placeholder-[#7A746B]"
            />
            <Search className="w-3.5 h-3.5 text-[#7A746B] absolute left-3 pointer-events-none" />
            <div className="absolute right-2 flex items-center gap-1.5">
              <kbd className="hidden lg:inline text-[9.5px] font-mono text-[#7A746B] bg-[#EAE6DC] px-1 py-0.5 rounded border border-[#D5CFC4]">
                ⌘K
              </kbd>
              <button
                type="button"
                onClick={handleVoiceSearch}
                title="Voice Search"
                className={`p-0.5 text-[#7A746B] hover:text-[#A83324] transition cursor-pointer ${isListening ? 'animate-pulse text-[#A83324]' : ''}`}
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Primary Genre Access (Desktop) */}
          <nav className="hidden xl:flex items-center gap-1 text-xs font-medium text-[#4A463F]">
            {navItems.slice(0, 6).map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  navigate('/category/' + item.key);
                  if (onSelectCategory) onSelectCategory(item.key);
                }}
                className="px-2 py-1 rounded transition-colors hover:text-[#A83324] cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* User Profile / Auth */}
            {user ? (
              <div className="flex items-center gap-2 bg-[#F4F1EA] border border-[#D5CFC4] px-2.5 py-1 rounded text-xs">
                <div className="w-4 h-4 rounded-full bg-[#161514] text-[#F4F1EA] flex items-center justify-center font-bold text-[9px]">
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="max-w-[90px] truncate text-[11px] font-medium text-[#161514] hidden md:inline">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
                <button
                  type="button"
                  onClick={() => signOut()}
                  title="Sign Out"
                  className="text-[#7A746B] hover:text-[#A83324] transition p-0.5 cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded border border-[#D5CFC4] bg-[#F4F1EA] hover:bg-white text-[#161514] text-xs font-medium transition cursor-pointer"
              >
                <UserIcon className="w-3 h-3 text-[#7A746B]" />
                <span>{t.nav.login}</span>
              </button>
            )}

            {/* Accession Button (Upload Treatise) */}
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#A83324] hover:bg-[#8C2A1E] text-white text-xs font-medium transition cursor-pointer"
              title={t.nav.uploadBook}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.nav.uploadBook}</span>
              <span className="sm:hidden font-bold">+</span>
            </button>

            {/* Trilingual Script Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium text-[#161514] bg-[#F4F1EA] hover:bg-white rounded border border-[#D5CFC4] transition cursor-pointer"
                title="Select Script & Language"
              >
                <Globe className="w-3 h-3 text-[#7A746B]" />
                <span className="uppercase text-[11px]">{lang}</span>
                <span className="text-[8px] text-[#7A746B]">▼</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-[#FAF8F5] rounded border border-[#D5CFC4] py-1 text-xs z-50 shadow-md">
                  <button
                    onClick={() => { setLang('hi'); setLangDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[#EAE6DC] transition ${
                      lang === 'hi' ? 'font-bold text-[#A83324] bg-[#EAE6DC]' : 'text-[#161514]'
                    }`}
                  >
                    <span>हिंदी (HIN)</span>
                    {lang === 'hi' && <span className="text-[#A83324]">✓</span>}
                  </button>
                  <button
                    onClick={() => { setLang('en'); setLangDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[#EAE6DC] transition ${
                      lang === 'en' ? 'font-bold text-[#A83324] bg-[#EAE6DC]' : 'text-[#161514]'
                    }`}
                  >
                    <span>English (ENG)</span>
                    {lang === 'en' && <span className="text-[#A83324]">✓</span>}
                  </button>
                  <button
                    onClick={() => { setLang('ur'); setLangDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[#EAE6DC] font-urdu transition ${
                      lang === 'ur' ? 'font-bold text-[#A83324] bg-[#EAE6DC]' : 'text-[#161514]'
                    }`}
                  >
                    <span>اردو (URD)</span>
                    {lang === 'ur' && <span className="text-[#A83324]">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Admin Management Button */}
            <AdminOnly>
              <button
                onClick={onOpenAdmin}
                title={t.nav.manageLibrary}
                className="p-1.5 text-[#7A746B] hover:text-[#161514] hover:bg-[#EAE6DC] rounded transition cursor-pointer"
              >
                <Settings className="w-4 h-4" />
              </button>
            </AdminOnly>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-[#161514] xl:hidden rounded hover:bg-[#EAE6DC] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-[#D5CFC4] py-3 px-2 space-y-2 bg-[#FAF8F5]">
            <div className="grid grid-cols-2 gap-1 text-xs">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    navigate('/category/' + item.key);
                    if (onSelectCategory) onSelectCategory(item.key);
                    setMobileMenuOpen(false);
                  }}
                  className="p-2 rounded hover:bg-[#EAE6DC] text-[#161514] text-left transition cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
            
            <div className="pt-2 border-t border-[#D5CFC4] flex gap-2">
              <button
                onClick={() => { onOpenUpload(); setMobileMenuOpen(false); }}
                className="flex-1 py-1.5 text-xs text-center bg-[#A83324] text-white rounded font-medium transition cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.nav.uploadBook}</span>
              </button>
              <button
                onClick={() => { onOpenAdmin(); setMobileMenuOpen(false); }}
                className="flex-1 py-1.5 text-xs text-center border border-[#D5CFC4] bg-[#F4F1EA] rounded text-[#161514] hover:bg-white transition cursor-pointer flex items-center justify-center gap-1"
              >
                <span>⚙ {t.nav.manageLibrary}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}

