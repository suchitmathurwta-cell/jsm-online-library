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
  lang,
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
    { key: 'novel', label: t.nav.novel || 'Novel' },
    { key: 'story', label: t.nav.story || 'Story' },
    { key: 'poetry', label: t.nav.poetry || 'Poetry' },
    { key: 'magazines', label: t.nav.magazines || 'Magazines (Patrika)' },
    { key: 'vimarsh', label: t.nav.vimarsh || 'Discussion (Vimarsh)' },
    { key: 'cultural-conscience', label: t.nav.conscience || 'Cultural Conscience' },
    { key: 'satire', label: t.nav.satire || 'Satire' },
    { key: 'drama', label: t.nav.drama || 'Drama' },
    { key: 'essays', label: t.nav.essays || 'Essays' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
      {/* Top Banner Notice with Clean Minimal Style */}
      <div className="bg-[#0f172a] text-stone-300 text-[11.5px] py-1.5 px-4 text-center font-medium tracking-wide flex justify-center items-center gap-4">
        <span>✨ {t.tagline}</span>
        <AdminOnly>
          <button
            onClick={onOpenAdmin}
            className="underline hover:text-amber-400 cursor-pointer hidden md:inline text-amber-300/90 font-semibold transition-colors"
          >
            {t.nav.manageLibrary} ⚙️
          </button>
        </AdminOnly>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-5">
          
          {/* Logo with Elevated Cultural Typography */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 via-blue-800 to-indigo-950 flex items-center justify-center text-amber-300 font-bold text-lg shadow-xs border border-amber-400/30 group-hover:scale-105 transition-transform">
                <span>चे</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-rekhta-serif text-2xl font-extrabold tracking-tight text-[#0f2852] group-hover:text-[#1d4ed8] transition-colors">
                    {t.brand}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1d4ed8] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/70">
                    {t.brandSubtitle}
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 font-medium hidden sm:block -mt-0.5">
                  {t.brandTagline}
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links for Genres (Desktop) navigating directly to /category/:slug */}
          <nav className="hidden xl:flex items-center gap-1 text-[13px] font-medium text-stone-600">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  navigate('/category/' + item.key);
                  if (onSelectCategory) onSelectCategory(item.key);
                }}
                className={`px-2.5 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
                  item.key === 'magazines' || item.key === 'vimarsh'
                    ? 'font-bold text-[#1d4ed8] bg-blue-50/70 hover:bg-blue-100/70'
                    : 'hover:text-[#1d4ed8] hover:bg-stone-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Quick Header Search Bar with Refined Style */}
          <div className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-sm relative">
            <input
              type="text"
              value={localHeaderSearch}
              onChange={handleHeaderInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSearchQuery?.(localHeaderSearch);
                  if (onSearchSubmit) onSearchSubmit(localHeaderSearch);
                }
              }}
              placeholder={t.hero.searchPlaceholder}
              autoComplete="off"
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-stone-50 hover:bg-white focus:bg-white border border-stone-200 focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/15 rounded-full outline-hidden transition text-stone-900 cursor-text font-normal shadow-2xs"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 pointer-events-none" />
            <button
              type="button"
              onClick={handleVoiceSearch}
              title="Voice Search"
              className={`absolute right-2.5 p-1 text-stone-400 hover:text-[#1d4ed8] transition ${isListening ? 'animate-pulse text-red-600' : ''}`}
            >
              <Mic className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* User Profile / Auth Button */}
            {user ? (
              <div className="flex items-center gap-2 bg-blue-50/80 border border-blue-200/80 px-2.5 py-1.5 rounded-full text-xs">
                <div className="w-5 h-5 rounded-full bg-[#1d4ed8] text-white flex items-center justify-center font-bold text-[10px]">
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="max-w-[100px] truncate text-[11px] font-semibold text-stone-700 hidden md:inline">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
                <button
                  type="button"
                  onClick={() => signOut()}
                  title="Sign Out"
                  className="text-stone-400 hover:text-red-600 transition p-0.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold border border-stone-200/80 transition cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5 text-stone-500" />
                <span>लॉग इन / Sign In</span>
              </button>
            )}

            {/* Admin Upload vs Visitor Suggest CTA */}
            <AdminOnly>
              <button
                onClick={onOpenUpload}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs font-semibold shadow-xs hover:shadow-md transition duration-150 cursor-pointer hover:-translate-y-0.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">{t.nav.uploadBook}</span>
                <span className="sm:hidden">+</span>
              </button>
            </AdminOnly>

            <VisitorOnly>
              <button
                onClick={onOpenSuggest}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-300 text-xs font-semibold shadow-2xs hover:shadow-xs transition duration-150 cursor-pointer"
              >
                <BookMarked className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">
                  {lang === 'hi' ? 'पुस्तक सुझाव' : (lang === 'ur' ? 'کتاب کی تجویز' : 'Suggest Book')}
                </span>
                <span className="sm:hidden">सुझाव</span>
              </button>
            </VisitorOnly>

            {/* Language Selector Dropdown (HIN, ENG, URD) */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-700 bg-stone-50 hover:bg-stone-100 rounded-lg border border-stone-200/80 shadow-2xs cursor-pointer transition"
              >
                <Globe className="w-3.5 h-3.5 text-stone-500" />
                <span className="uppercase">{lang}</span>
                <span className="text-[10px] text-stone-400">▼</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-38 bg-white rounded-xl shadow-xl border border-stone-100 py-1.5 text-xs z-50 animate-fadeIn">
                  <button
                    onClick={() => { setLang('hi'); setLangDropdownOpen(false); }}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-stone-50 transition ${
                      lang === 'hi' ? 'font-bold text-[#1d4ed8] bg-blue-50/50' : 'text-stone-700'
                    }`}
                  >
                    <span>हिंदी (HIN)</span>
                    {lang === 'hi' && <span className="text-[#1d4ed8]">✓</span>}
                  </button>
                  <button
                    onClick={() => { setLang('en'); setLangDropdownOpen(false); }}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-stone-50 transition ${
                      lang === 'en' ? 'font-bold text-[#1d4ed8] bg-blue-50/50' : 'text-stone-700'
                    }`}
                  >
                    <span>English (ENG)</span>
                    {lang === 'en' && <span className="text-[#1d4ed8]">✓</span>}
                  </button>
                  <button
                    onClick={() => { setLang('ur'); setLangDropdownOpen(false); }}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-stone-50 font-urdu transition ${
                      lang === 'ur' ? 'font-bold text-[#1d4ed8] bg-blue-50/50' : 'text-stone-700'
                    }`}
                  >
                    <span>اردو (URD)</span>
                    {lang === 'ur' && <span className="text-[#1d4ed8]">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Admin / Management Button (Admin Only) */}
            <AdminOnly>
              <button
                onClick={onOpenAdmin}
                title={t.nav.manageLibrary}
                className="p-2 text-stone-500 hover:text-[#1d4ed8] hover:bg-stone-50 rounded-lg transition cursor-pointer border border-transparent hover:border-stone-200/60"
              >
                <Settings className="w-4 h-4" />
              </button>
            </AdminOnly>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-600 hover:text-stone-900 xl:hidden rounded-lg hover:bg-stone-50 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-stone-100 py-3.5 px-2 space-y-2 bg-white animate-fadeIn">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    navigate('/category/' + item.key);
                    if (onSelectCategory) onSelectCategory(item.key);
                    setMobileMenuOpen(false);
                  }}
                  className="p-2.5 rounded-lg hover:bg-stone-50 text-stone-700 text-left font-medium transition"
                >
                  {item.label}
                </button>
              ))}
            </div>
            
            <div className="pt-2.5 border-t border-stone-100 flex gap-2">
              <AdminOnly>
                <button
                  onClick={() => { onOpenAdmin(); setMobileMenuOpen(false); }}
                  className="flex-1 py-2 text-xs text-center border border-stone-200 rounded-lg font-medium text-stone-700 hover:bg-stone-50 transition"
                >
                  ⚙️ {t.nav.manageLibrary}
                </button>
              </AdminOnly>
              <VisitorOnly>
                <button
                  onClick={() => { onOpenSuggest(); setMobileMenuOpen(false); }}
                  className="flex-1 py-2 text-xs text-center bg-amber-50 border border-amber-200 rounded-lg font-semibold text-amber-900 hover:bg-amber-100 transition"
                >
                  💡 {lang === 'hi' ? 'पुस्तक सुझाव दें' : 'Suggest a Book'}
                </button>
              </VisitorOnly>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
