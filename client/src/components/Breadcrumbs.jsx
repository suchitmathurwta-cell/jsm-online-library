import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { translations } from '../locales/translations';

export default function Breadcrumbs({ items = [], lang, t }) {
  if (!items || items.length === 0) return null;

  const currentLang = lang || localStorage.getItem('chetna_lang') || 'hi';
  const tr = t || translations[currentLang] || translations.hi;
  const homeLabel = tr.breadcrumbs?.home || (currentLang === 'hi' ? 'मुख्य पृष्ठ' : (currentLang === 'ur' ? 'مرکزی صفحہ' : 'Home'));

  return (
    <nav className="flex items-center gap-1.5 text-xs text-zinc-500 py-3 flex-wrap font-sans animate-fadeIn" aria-label="Breadcrumb">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-black transition-colors font-medium text-zinc-600"
      >
        <Home className="w-3.5 h-3.5" />
        <span>{homeLabel}</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3 h-3 text-zinc-300 shrink-0" />
            {isLast || !item.url ? (
              <span className="font-bold text-[#111111] truncate max-w-xs sm:max-w-md">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.url}
                className="hover:text-black transition-colors font-medium text-zinc-600 truncate max-w-xs"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
