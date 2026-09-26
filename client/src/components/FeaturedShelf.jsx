import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
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
    <section className="py-12 border-b border-[#DDD7CD] bg-[#F7F5F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header: Archival Curatorial Ledger */}
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-[#DDD7CD]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono tracking-widest text-[#9B382A] uppercase font-bold flex items-center gap-1.5">
                <Bookmark className="w-3 h-3 text-[#9B382A]" />
                <span>CURATORIAL SELECTION // ARCHIVAL FOLIO</span>
              </span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl text-[#121110] font-normal tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-[#524E48] font-sans mt-1">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {onViewAll && (
              <button
                type="button"
                onClick={onViewAll}
                className="text-xs font-mono uppercase tracking-wider text-[#9B382A] hover:text-[#852E22] font-semibold cursor-pointer transition-colors"
              >
                {t.sections.viewAll} →
              </button>
            )}

            <div className="hidden sm:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                className="p-2 rounded-xs border border-[#DDD7CD] bg-[#FFFFFF] hover:bg-[#EFECE6] text-[#121110] transition shadow-2xs cursor-pointer"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll('right')}
                className="p-2 rounded-xs border border-[#DDD7CD] bg-[#FFFFFF] hover:bg-[#EFECE6] text-[#121110] transition shadow-2xs cursor-pointer"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Archival Folio Track */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {books.map((book) => (
            <div key={book.id} className="w-[200px] sm:w-[230px] shrink-0 snap-start">
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

