import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-stone-500 py-3 flex-wrap animate-fadeIn" aria-label="Breadcrumb">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-[#1d4ed8] transition-colors font-medium text-stone-600 hover:underline"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-stone-300 shrink-0" />
            {isLast || !item.url ? (
              <span className="font-bold text-[#1d4ed8] truncate max-w-xs sm:max-w-md">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.url}
                className="hover:text-[#1d4ed8] transition-colors font-medium text-stone-600 hover:underline truncate max-w-xs"
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
