import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, LogOut, BookMarked, Sparkles } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Mic,
  PlusCircle,
  Settings,
  Globe,
  Menu,
  X
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
  const searchInputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    setLocalHeaderSearch(searchQuery || '');
  }, [searchQuery]);

  // Global ⌘K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E2DDD5] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-3 sm:gap-6">
          
          {/* Left: Clean Branding */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#1E1B18] text-[#FAF9F6] flex items-center justify-center font-bold text-sm shadow-xs group-hover:bg-[#BA4E36] transition-colors">
                <span className="font-editorial">{lang === 'ur' ? 'چ' : (lang === 'en' ? 'C' : 'चे')}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-editorial text-xl font-bold tracking-tight text-[#1E1B18] group-hover:text-[#BA4E36] transition-colors">
                  {t.brand}
                </span>
                <span className="text-[9.5px] font-semibold uppercase tracking-wider text-[#BA4E36] bg-[#F2EFE9] px-2 py-0.5 rounded-full border border-[#E2DDD5] hidden sm:inline-block">
                  {t.brandSubtitle || 'Archives'}
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Minimal Pill Search Bar (⌘K) */}
          <div className="flex-1 max-w-md mx-auto hidden md:block">
            <div className="relative flex items-center w-full">
              <Search className="w-3.5 h-3.5 text-[#66615B] absolute left-3.5 pointer-events-none" />
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
                placeholder={t.hero?.searchPlaceholder || 'Search title, author, verses...'}
                autoComplete="off"
                className="w-full pl-9 pr-20 py-1.5 text-xs bg-[#F2EFE9] hover:bg-[#F2EFE9]/80 focus:bg-white border border-[#E2DDD5] focus:border-[#BA4E36] focus:ring-1 focus:ring-[#BA4E36]/30 rounded-full outline-hidden transition text-[#1E1B18] placeholder-[#66615B]/80 font-normal"
              />
              <div className="absolute right-2.5 flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  title="Voice Search"
                  className={`p-1 text-[#66615B] hover:text-[#BA4E36] transition cursor-pointer ${isListening ? 'animate-pulse text-red-600' : ''}`}
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>
                <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-[#66615B] bg-[#FAF9F6] border border-[#E2DDD5] rounded shadow-2xs">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          {/* Right: Contextual Profile / Admin Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Admin Management Link */}
            <AdminOnly>
              <button
                onClick={onOpenAdmin}
                className="text-[11px] font-semibold text-[#1E1B18] hover:text-[#BA4E36] bg-[#F2EFE9] hover:bg-[#E2DDD5]/70 border border-[#E2DDD5] px-2.5 py-1 rounded-full transition cursor-pointer hidden sm:flex items-center gap-1.5"
              >
                <span>⚙️ {t.nav.manageLibrary || 'Admin'}</span>
              </button>
            </AdminOnly>

            {/* Language Selector Pill */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#1E1B18] bg-[#F2EFE9] hover:bg-[#E2DDD5]/70 rounded-full border border-[#E2DDD5] transition cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-[#66615B]" />
                <span className="uppercase">{lang}</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-36 bg-[#FAF9F6] rounded-xl shadow-lg border border-[#E2DDD5] py-1 text-xs z-50 animate-fadeIn">
                  <button
                    onClick={() => { setLang('hi'); setLangDropdownOpen(false); }}
                    className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between hover:bg-[#F2EFE9] transition ${
                      lang === 'hi' ? 'font-bold text-[#BA4E36] bg-[#F2EFE9]' : 'text-[#1E1B18]'
                    }`}
                  >
                    <span>हिंदी (HIN)</span>
                    {lang === 'hi' && <span className="text-[#BA4E36]">✓</span>}
                  </button>
                  <button
                    onClick={() => { setLang('en'); setLangDropdownOpen(false); }}
                    className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between hover:bg-[#F2EFE9] transition ${
                      lang === 'en' ? 'font-bold text-[#BA4E36] bg-[#F2EFE9]' : 'text-[#1E1B18]'
                    }`}
                  >
                    <span>English (ENG)</span>
                    {lang === 'en' && <span className="text-[#BA4E36]">✓</span>}
                  </button>
                  <button
                    onClick={() => { setLang('ur'); setLangDropdownOpen(false); }}
                    className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between hover:bg-[#F2EFE9] font-urdu transition ${
                      lang === 'ur' ? 'font-bold text-[#BA4E36] bg-[#F2EFE9]' : 'text-[#1E1B18]'
                    }`}
                  >
                    <span>اردو (URD)</span>
                    {lang === 'ur' && <span className="text-[#BA4E36]">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Upload PDF Action (Terracotta Pill) */}
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#BA4E36] hover:bg-[#9E3F29] text-white text-xs font-semibold shadow-xs transition duration-150 cursor-pointer"
              title={t.nav.uploadBook}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.nav.uploadBook || 'Upload'}</span>
            </button>

            {/* User Profile / Auth Button */}
            {user ? (
              <div className="flex items-center gap-1.5 bg-[#F2EFE9] border border-[#E2DDD5] px-2 py-1 rounded-full text-xs">
                <div className="w-5 h-5 rounded-full bg-[#1E1B18] text-[#FAF9F6] flex items-center justify-center font-bold text-[10px]">
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <button
                  type="button"
                  onClick={() => signOut()}
                  title="Sign Out"
                  className="text-[#66615B] hover:text-red-600 transition p-0.5 cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F2EFE9] hover:bg-[#E2DDD5]/70 text-[#1E1B18] text-xs font-semibold border border-[#E2DDD5] transition cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#66615B]" />
                <span>{t.nav.login}</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-[#1E1B18] hover:bg-[#F2EFE9] rounded-lg transition cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E2DDD5] py-3.5 px-3 space-y-2 bg-[#FAF9F6] animate-fadeIn">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    navigate('/category/' + item.key);
                    if (onSelectCategory) onSelectCategory(item.key);
                    setMobileMenuOpen(false);
                  }}
                  className="p-2.5 rounded-xl hover:bg-[#F2EFE9] text-[#1E1B18] text-left font-medium transition cursor-pointer font-editorial"
                >
                  {item.label}
                </button>
              ))}
            </div>
            
            <div className="pt-2.5 border-t border-[#E2DDD5] flex gap-2">
              <button
                onClick={() => { onOpenUpload(); setMobileMenuOpen(false); }}
                className="flex-1 py-2 text-xs text-center bg-[#BA4E36] text-white rounded-xl font-bold hover:bg-[#a0422d] transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t.nav.uploadBook}</span>
              </button>
              <button
                onClick={() => { onOpenAdmin(); setMobileMenuOpen(false); }}
                className="flex-1 py-2 text-xs text-center border border-[#E2DDD5] bg-[#F2EFE9] rounded-xl font-medium text-[#1E1B18] hover:bg-[#E2DDD5] transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>⚙️ {t.nav.manageLibrary}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
