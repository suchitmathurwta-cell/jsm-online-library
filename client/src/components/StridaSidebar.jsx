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

  const getLangCode = () => {
    if (lang === 'hi') return 'HIN';
    if (lang === 'ur') return 'URD';
    return 'ENG';
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
            <span className="w-8 h-8 rounded-xl bg-white text-black font-black flex items-center justify-center text-sm shadow-xs group-hover:scale-105 transition-transform">
              चे
            </span>
            <span className="font-sans font-bold tracking-[-0.03em] text-lg">Chetna</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono tracking-wider bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              PUBLIC ARCHIVE
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
          Open Repository for Cultural Conscience, Literature & Human Development.
        </p>

        {/* 1. Restored Language Selector Dropdown (HIN, ENG, URD) */}
        <div ref={langDropdownRef} className="relative z-50">
          <button
            type="button"
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-mono font-medium text-zinc-200 bg-white/[0.04] hover:bg-white/[0.08] rounded-xl border border-white/[0.08] hover:border-white/20 transition cursor-pointer select-none"
            title="Select Language / भाषा चुनें"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-mono">LANG:</span>
              <span className="font-bold text-white tracking-wide">
                {getLangLabel()}
              </span>
            </div>
            <span className="text-[8px] text-zinc-400">▼</span>
          </button>

          <AnimatePresence>
            {langDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 mt-2 bg-[#141414]/98 backdrop-blur-2xl rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.85)] border border-white/[0.12] p-1.5 text-xs z-50 text-white space-y-1"
              >
                <button
                  type="button"
                  onClick={() => {
                    setLang('hi');
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-white/[0.08] transition cursor-pointer rounded-xl ${
                    lang === 'hi' ? 'font-bold text-white bg-white/[0.12]' : 'text-zinc-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>हिंदी (HIN)</span>
                  </span>
                  {lang === 'hi' && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLang('en');
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-white/[0.08] transition cursor-pointer rounded-xl ${
                    lang === 'en' ? 'font-bold text-white bg-white/[0.12]' : 'text-zinc-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>English (ENG)</span>
                  </span>
                  {lang === 'en' && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLang('ur');
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-white/[0.08] font-urdu transition cursor-pointer rounded-xl ${
                    lang === 'ur' ? 'font-bold text-white bg-white/[0.12]' : 'text-zinc-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>اردو (URD)</span>
                  </span>
                  {lang === 'ur' && <Check className="w-3.5 h-3.5 text-white" />}
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
              className="w-full pl-8 pr-7 py-2 text-xs bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.08] border border-white/[0.08] focus:border-white/20 rounded-xl outline-hidden text-white placeholder-zinc-500 font-mono transition-all"
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

      {/* Middle: Active Navigation / Taxonomy Navigator (Layer 1 -> 4) */}
      <div className={`my-6 py-5 border-y border-white/[0.06] space-y-2 ${isMobileNavOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-400 block">
            TAXONOMY NAVIGATOR
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            [{categories.length}]
          </span>
        </div>

        <nav className="space-y-1 max-h-[46vh] overflow-y-auto pr-1 scrollbar-thin">
          {categories.map((cat, idx) => {
            const isScrollActive = activeSection === cat.id;
            const isRouteActive =
              location.pathname === `/category/${cat.id}` ||
              location.pathname.startsWith(`/category/${cat.id}/`);
            const isActive = isRouteActive || (location.pathname === '/' && isScrollActive);
            const color = getCategoryColor(cat.id);
            const catName = cat['name_' + lang] || cat.name_en || cat.name_hi || cat.id;
            const workCount = cat.count || 0;
            const formattedIdx = idx < 9 ? `0${idx + 1}` : `${idx + 1}`;

            const handleCategoryClick = (e) => {
              setIsMobileNavOpen(false);
              if (location.pathname === '/') {
                e.preventDefault();
                const targetElement = document.getElementById(`section-${cat.id}`);
                if (targetElement) {
                  targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }
            };

            return (
              <div key={cat.id} className="relative group">
                <Link
                  to={`/category/${cat.id}`}
                  onClick={handleCategoryClick}
                  className={`flex items-center justify-between py-2 px-3 rounded-xl text-sm transition-all ${
                    isActive
                      ? 'bg-white/[0.08] text-white font-medium border border-white/[0.12] shadow-xs'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                  style={{
                    borderLeftColor: isActive ? color.hex : undefined,
                    borderLeftWidth: isActive ? '3px' : undefined,
                  }}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="font-mono text-xs font-bold shrink-0 transition-colors"
                      style={{ color: isActive ? color.hex : color.subtleHex }}
                    >
                      {formattedIdx}
                    </span>
                    <span className="truncate font-sans text-xs sm:text-sm">
                      {catName}
                    </span>
                  </span>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className={`text-[11px] font-mono ${isActive ? 'text-zinc-200' : 'text-zinc-500'}`}>
                      [{workCount}]
                    </span>
                    {/* Deep dive link into category page */}
                    <Link
                      to={`/category/${cat.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMobileNavOpen(false);
                      }}
                      title={`Open ${cat.name_en} full section`}
                      className="opacity-0 group-hover:opacity-100 hover:text-white text-zinc-500 p-0.5 transition-opacity"
                    >
                      <ArrowUpRight className="w-3 h-3" />
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
        {/* Upload Document Button (Admin/Superadmin Protected) */}
        <AdminOnly>
          <button
            onClick={() => {
              setIsMobileNavOpen(false);
              if (onOpenUpload) onOpenUpload();
            }}
            className="w-full py-3 px-4 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-sm font-mono uppercase tracking-wider cursor-pointer active:scale-[0.98]"
          >
            <span>↑</span> {t?.nav?.uploadBook || 'Upload Document'}
          </button>
        </AdminOnly>

        {/* Suggest Document Button for Visitors */}
        {!isAdmin && onOpenSuggest && (
          <button
            onClick={() => {
              setIsMobileNavOpen(false);
              onOpenSuggest();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] text-xs font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            <span>{t?.nav?.suggestBook || 'Suggest Document'}</span>
          </button>
        )}

        {/* User Profile / Admin Mode Trigger */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs font-mono text-zinc-400">
          {user ? (
            <div className="flex items-center gap-2 truncate">
              <div className="w-5 h-5 rounded-full bg-white text-black font-bold flex items-center justify-center text-[10px]">
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
