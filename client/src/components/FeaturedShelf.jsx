import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import BookCard from './BookCard';

export default function FeaturedShelf({
  title,
  subtitle,
  books,
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
    <section className="py-12 border-b border-white/[0.08] bg-[#080808] text-white">
      <div className="max-w-[1440px] mx-auto px-6">
        
        {/* Section Header: Mugen Studio Typography */}
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 bg-white rounded-full inline-block" />
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-[-0.03em] font-sans">
                {title}
              </h2>
            </div>
            {subtitle && (
              <p className="text-xs font-mono uppercase tracking-wider text-zinc-400 pl-3.5">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {onViewAll && (
              <button
                onClick={onViewAll}
                className="text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>{t.sections?.viewAll || 'VIEW ALL'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            )}

            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => handleScroll('left')}
                className="p-2 rounded-full border border-white/[0.08] bg-[#141414] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="p-2 rounded-full border border-white/[0.08] bg-[#141414] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition cursor-pointer"
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
          className="flex gap-4 sm:gap-5 overflow-x-auto pb-6 pt-1 snap-x scrollbar-none scroll-smooth -mx-6 px-6 sm:mx-0 sm:px-0"
        >
          {books.map((book) => (
            <div
              key={book.id}
              className="w-44 sm:w-52 lg:w-56 shrink-0 snap-start"
            >
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
