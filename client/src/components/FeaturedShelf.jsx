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
    <section className="py-10 border-b border-stone-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header with Refined Spacing */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-5 h-1 bg-[#1d4ed8] rounded-full"></div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0f172a] font-rekhta-serif tracking-tight">
                {title}
              </h2>
            </div>
            {subtitle && (
              <p className="text-xs sm:text-sm text-stone-500 font-normal pl-7">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {onViewAll && (
              <button
                onClick={onViewAll}
                className="text-xs sm:text-sm font-bold text-[#1d4ed8] hover:text-[#1e40af] hover:underline cursor-pointer transition-colors"
              >
                {t.sections.viewAll}
              </button>
            )}

            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => handleScroll('left')}
                className="p-2 rounded-full border border-stone-200/80 hover:bg-stone-50 text-stone-600 hover:text-stone-900 transition shadow-2xs cursor-pointer hover:border-stone-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="p-2 rounded-full border border-stone-200/80 hover:bg-stone-50 text-stone-600 hover:text-stone-900 transition shadow-2xs cursor-pointer hover:border-stone-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Scrollable Book Shelf with Smooth Gaps */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto pb-5 pt-1.5 snap-x scrollbar-none scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {books.map((book) => (
            <div key={book.id} className="w-[195px] sm:w-[225px] shrink-0 snap-start">
              <BookCard
                book={book}
                lang={lang}
                t={t}
                onSelectBook={onSelectBook}
                onOpenReader={onOpenReader}
                onDownloadBook={onDownloadBook}
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
