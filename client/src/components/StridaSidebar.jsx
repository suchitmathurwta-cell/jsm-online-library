import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, X, User, Settings, Sparkles, Menu, ChevronRight } from 'lucide-react';
import { AdminOnly } from './AdminGuard';
import { useAuth } from '../context/AuthContext';

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
}) {
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const scripts = [
    { key: 'hi', label: 'Devanagari' },
    { key: 'ur', label: 'Nastaliq' },
    { key: 'en', label: 'Romanized' },
  ];

  return (
    <aside className="w-full lg:w-[380px] xl:w-[420px] lg:h-screen lg:sticky lg:top-0 p-6 sm:p-8 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/[0.08] bg-[#0E0E0E] z-40 lg:overflow-y-auto">
      {/* Top: Identity & Status */}
      <div className="space-y-6">
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

        {/* Script Selector Pill (Strida Micro-Control) */}
        <div className="p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center gap-1 text-xs font-mono">
          {scripts.map(({ key, label }) => (
            <button
              key={key}
              className="flex-1 py-1.5 rounded-lg text-center transition-all text-zinc-400 hover:text-white cursor-pointer data-[active=true]:bg-white data-[active=true]:text-black data-[active=true]:font-medium data-[active=true]:shadow-xs"
              data-active={lang === key}
              onClick={() => setLang(key)}
            >
              {label}
            </button>
          ))}
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
      <div className={`my-8 py-6 border-y border-white/[0.06] space-y-2 ${isMobileNavOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-400 block">
            TAXONOMY NAVIGATOR
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            [{categories.length}]
          </span>
        </div>

        <nav className="space-y-1 max-h-[46vh] overflow-y-auto pr-1">
          {categories.map((cat, idx) => {
            const isActive =
              location.pathname === `/category/${cat.id}` ||
              location.pathname.startsWith(`/category/${cat.id}/`);
            const catName = cat['name_' + lang] || cat.name_en || cat.name_hi || cat.id;
            const workCount = cat.count || 0;
            const formattedIdx = idx < 9 ? `0${idx + 1}` : `${idx + 1}`;

            return (
              <Link
                key={cat.id}
                to={`/category/${cat.id}`}
                onClick={() => setIsMobileNavOpen(false)}
                className={`flex items-center justify-between py-2 px-2.5 rounded-lg text-sm transition-all group ${
                  isActive
                    ? 'bg-white/[0.08] text-white font-medium border border-white/[0.1]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span className="group-hover:translate-x-1 transition-transform flex items-center gap-2.5 min-w-0">
                  <span className={`font-mono text-xs ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {formattedIdx}
                  </span>
                  <span className="truncate font-sans text-xs sm:text-sm">
                    {catName}
                  </span>
                </span>
                <span className={`text-[11px] font-mono shrink-0 ml-2 ${isActive ? 'text-zinc-200' : 'text-zinc-500'}`}>
                  [{workCount}]
                </span>
              </Link>
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
