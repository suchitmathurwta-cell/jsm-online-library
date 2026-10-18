import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, User, Settings, Sparkles, Menu, ChevronRight, Globe, Check, ArrowUpRight } from 'lucide-react';
import { AdminOnly } from './AdminGuard';
import { useAuth } from '../context/AuthContext';
import { getCategoryColor } from '../data/categoryColors';

export default function StridaSidebar({
  categories = [],
  lang = 'hi',
  setLang,
  t,
  onOpenUpload,
  onOpenAdmin,
  onOpenSuggest,
  onOpenAuth,
  searchQuery,
  setSearchQuery,
  activeSection,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef(null);

  // Click outside to close language dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getLangLabel = () => {
    if (lang === 'hi') return 'हिंदी (HIN)';
    if (lang === 'ur') return 'اردو (URD)';
    return 'English (ENG)';
  };

  return (
    <aside className="w-full lg:w-[380px] xl:w-[420px] lg:h-screen lg:sticky lg:top-0 p-6 sm:p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/[0.08] bg-[#0E0E0E] z-40 lg:overflow-y-auto">
      {/* Top: Identity & Status */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Link
            className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5 group"
            to="/"
          >
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black font-black flex items-center justify-center text-xs font-mono tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.4)] group-hover:scale-105 transition-transform">
              {lang === 'hi' ? 'जसम' : lang === 'ur' ? 'جسم' : 'JSM'}
            </span>
            <div className="flex flex-col">
              <span className="font-sans font-black tracking-[-0.03em] text-lg text-white leading-tight">
                {lang === 'hi' ? 'जसम' : lang === 'ur' ? 'جسم' : 'JSM'}
              </span>
              <span className="text-[10px] font-mono tracking-wider uppercase text-amber-400 font-semibold -mt-0.5">
                {lang === 'hi' ? 'ऑनलाइन लाइब्रेरी' : lang === 'ur' ? 'آن لائن لائبریری' : 'Online Library'}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.25)] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {lang === 'hi' ? 'खुला पुस्तकालय' : lang === 'ur' ? 'ڈیجیٹل کتب خانہ' : 'DIGITAL LIBRARY'}
            </span>

            {/* Mobile Hamburger toggle for small screens */}
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="lg:hidden p-1.5 rounded-lg bg-white/[0.06] text-zinc-300 hover:text-white border border-white/[0.08] cursor-pointer"
              aria-label="Toggle navigation"
            >
              {isMobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider leading-relaxed">
          {lang === 'hi'
            ? 'कालजयी साहित्य, विचार और सांस्कृतिक चेतना का खुला डिजिटल पुस्तकालय।'
            : lang === 'ur'
            ? 'کلاسیکی ادب، فکر اور شعور کا کھلا ڈیجیٹل کتب خانہ۔'
            : 'A digital library for timeless literature, ideas & poetry.'}
        </p>

        {/* 1. Compact Language Selector Dropdown (HIN, ENG, URD) */}
        <div ref={langDropdownRef} className="relative z-50">
          <button
            type="button"
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="inline-flex items-center gap-2 px-2.5 py-1 text-[11px] font-mono font-medium text-zinc-300 bg-white/[0.04] hover:bg-white/[0.08] hover:text-white rounded-lg border border-white/[0.1] hover:border-white/20 transition cursor-pointer select-none"
            title="Select Language / भाषा चुनें"
          >
            <div className="flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-amber-400" />
              <span className="text-zinc-400 text-[10px] uppercase tracking-wider font-mono font-bold">LANG:</span>
              <span className="font-semibold text-white tracking-wide">
                {getLangLabel()}
              </span>
            </div>
            <span className="text-[7px] text-zinc-400 ml-0.5">▼</span>
          </button>

          <AnimatePresence>
            {langDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 mt-1.5 w-48 bg-[#141416]/98 backdrop-blur-2xl rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.9)] border border-white/[0.15] p-1 text-[11px] z-50 text-white space-y-0.5"
              >
                <button
                  type="button"
                  onClick={() => {
                    setLang('hi');
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 flex items-center justify-between hover:bg-white/[0.08] transition cursor-pointer rounded-lg ${
                    lang === 'hi' ? 'font-bold text-white bg-amber-500/20 border border-amber-500/30' : 'text-zinc-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                    <span className="font-sans font-medium">हिंदी (HIN)</span>
                  </span>
                  {lang === 'hi' && <Check className="w-3 h-3 text-amber-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLang('en');
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 flex items-center justify-between hover:bg-white/[0.08] transition cursor-pointer rounded-lg ${
                    lang === 'en' ? 'font-bold text-white bg-blue-500/20 border border-blue-500/30' : 'text-zinc-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                    <span className="font-sans font-medium">English (ENG)</span>
                  </span>
                  {lang === 'en' && <Check className="w-3 h-3 text-blue-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLang('ur');
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 flex items-center justify-between hover:bg-white/[0.08] font-urdu transition cursor-pointer rounded-lg ${
                    lang === 'ur' ? 'font-bold text-white bg-emerald-500/20 border border-emerald-500/30' : 'text-zinc-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    <span className="font-urdu font-medium text-xs">اردو (URD)</span>
                  </span>
                  {lang === 'ur' && <Check className="w-3 h-3 text-emerald-400" />}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Real-time Search Input Box */}
        {setSearchQuery && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={t?.nav?.searchPlaceholder || 'Search library catalog...'}
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-2.5 text-xs bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.08] border border-white/[0.08] focus:border-amber-500/50 rounded-xl outline-hidden text-white placeholder-zinc-500 font-mono transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Middle: Active Navigation / Browse Collections */}
      <div className={`my-6 py-5 border-y border-white/[0.06] space-y-2 ${isMobileNavOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-400 block font-bold">
            {t?.nav?.browseCategories || (lang === 'hi' ? 'श्रेणियाँ देखें' : lang === 'ur' ? 'اصناف دیکھیں' : 'EXPLORE COLLECTIONS')}
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            [{categories.length}]
          </span>
        </div>

        <nav className="space-y-1.5 max-h-[46vh] overflow-y-auto pr-1 scrollbar-thin">
          {categories.map((cat, idx) => {
            // Exactly ONE highlight strip strictly relative to the main content stream
            const isActive = activeSection ? activeSection === cat.id : (location.pathname.startsWith(`/category/${cat.id}`) || idx === 0);
            const color = getCategoryColor(cat.id);
            const catName = cat['name_' + lang] || cat.name_en || cat.name_hi || cat.id;
            // Smooth scroll directly to category section if present on page
            const handleCategoryClick = (e) => {
              setIsMobileNavOpen(false);
              const targetElement = document.getElementById(`section-${cat.id}`);
              if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                window.history.replaceState(null, '', `/category/${cat.id}`);
              } else {
                navigate(`/category/${cat.id}`);
              }
            };

            return (
              <div key={cat.id} className="relative group">
                <Link
                  to={`/category/${cat.id}`}
                  onClick={handleCategoryClick}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-xl text-sm transition-all duration-300 border ${
                    isActive
                      ? 'text-white font-bold shadow-md'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04] border-transparent'
                  }`}
                  style={
                    isActive
                      ? {
                          background: `linear-gradient(90deg, ${color.hex}22 0%, ${color.hex}08 100%)`,
                          borderLeftWidth: '4px',
                          borderLeftColor: color.hex,
                          borderColor: `${color.hex}35`,
                          boxShadow: `0 0 20px ${color.hex}25`,
                        }
                      : {}
                  }
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    {/* Glowing Accent Dot */}
                    <span
                      className="w-2 h-2 rounded-full shrink-0 transition-transform group-hover:scale-125"
                      style={{
                        backgroundColor: color.hex,
                        boxShadow: isActive ? `0 0 10px ${color.hex}` : 'none',
                      }}
                    />
                    <span className="truncate font-sans text-xs sm:text-sm">
                      {catName}
                    </span>
                  </span>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {/* Deep dive arrow */}
                    <Link
                      to={`/category/${cat.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMobileNavOpen(false);
                      }}
                      title={`Jump directly to ${cat.name_en}`}
                      className="opacity-0 group-hover:opacity-100 hover:text-white text-zinc-500 p-0.5 transition-opacity"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" style={{ color: color.hex }} />
                    </Link>
                  </div>
                </Link>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Admin Action Valve & User State */}
      <div className={`pt-4 space-y-3 ${isMobileNavOpen ? 'block' : 'hidden lg:block'}`}>
        {/* Radiant High-Contrast Upload Button */}
        <AdminOnly>
          <button
            onClick={() => {
              setIsMobileNavOpen(false);
              if (onOpenUpload) onOpenUpload();
            }}
            className="w-full py-3.5 px-4 rounded-xl text-black text-xs font-black transition-all flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(245,158,11,0.4)] font-mono uppercase tracking-wider cursor-pointer active:scale-[0.98] hover:scale-[1.01]"
            style={{
              background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #D97706 100%)',
            }}
          >
            <span>↑</span> {t?.nav?.uploadBook || 'Upload E-Book'}
          </button>
        </AdminOnly>

        {/* Suggest Book Button for Visitors */}
        {!isAdmin && onOpenSuggest && (
          <button
            onClick={() => {
              setIsMobileNavOpen(false);
              onOpenSuggest();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] text-xs font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t?.nav?.readerSuggestion || t?.nav?.suggestBook || (lang === 'hi' ? 'पुस्तक का सुझाव दें' : lang === 'ur' ? 'کتاب تجویز کریں' : 'Suggest a Book')}</span>
          </button>
        )}

        {/* User Profile / Admin Mode Trigger */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs font-mono text-zinc-400">
          {user ? (
            <div className="flex items-center gap-2 truncate">
              <div className="w-5 h-5 rounded-full bg-amber-400 text-black font-bold flex items-center justify-center text-[10px]">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="truncate text-[11px] text-zinc-300">{user.email}</span>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsMobileNavOpen(false);
                if (onOpenAuth) onOpenAuth();
              }}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>{t?.nav?.signIn || 'Sign In'}</span>
            </button>
          )}

          <AdminOnly>
            {onOpenAdmin && (
              <button
                onClick={() => {
                  setIsMobileNavOpen(false);
                  onOpenAdmin();
                }}
                className="p-1 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-md transition-colors cursor-pointer"
                title="Admin Management"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            )}
          </AdminOnly>
        </div>
      </div>
    </aside>
  );
}
