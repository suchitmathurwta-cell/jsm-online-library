import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BookCard from './BookCard';

export default function FeaturedShelf({
  title,
  subtitle,
  books = [],
  lang,
  t,
  onSelectBook,
  onOpenReader,
  onDownloadBook,
  onEditBook,
  onViewAll
}) {
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!books || books.length === 0) return null;

  return (
    <section className="py-10 border-b border-black/[0.05] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header: Minimalist Studio Typography */}
        <div className="flex items-end justify-between mb-6 pb-3 border-b border-black/[0.04]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 bg-[#111111] rounded-full inline-block"></span>
              <h2 className="text-lg sm:text-xl font-bold text-[#111111] font-sans tracking-tight">
                {title}
              </h2>
            </div>
            {subtitle && (
              <p className="text-xs text-zinc-500 font-sans pl-3.5">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {onViewAll && (
              <button
                onClick={onViewAll}
                className="text-xs font-medium text-[#111111] hover:underline cursor-pointer transition-colors"
              >
                {t.sections?.viewAll || 'View All'}
              </button>
            )}

            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => handleScroll('left')}
                className="p-1.5 rounded-full border border-zinc-200 hover:bg-zinc-50 text-zinc-600 hover:text-black transition cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="p-1.5 rounded-full border border-zinc-200 hover:bg-zinc-50 text-zinc-600 hover:text-black transition cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Scrollable Book Shelf */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto pb-5 pt-1 snap-x scrollbar-none scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {books.map((book) => (
            <div key={book.id} className="w-[195px] sm:w-[220px] shrink-0 snap-start">
              <BookCard
                book={book}
                lang={lang}
                t={t}
                onSelectBook={onSelectBook}
                onOpenReader={onOpenReader}
                onDownloadBook={onDownloadBook}
                onEditBook={onEditBook}
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
