import React from 'react';
import { ArrowUpDown, BookOpen, ChevronRight, X } from 'lucide-react';
import BookCard from './BookCard';

export default function BookGrid({
  books = [],
  categories = [],
  selectedCategory,
  onSelectCategory,
  selectedSubGenre,
  onSelectSubGenre,
  sortBy,
  onSortChange,
  searchQuery,
  onClearSearch,
  lang,
  t,
  onSelectBook,
  onOpenReader,
  onDownloadBook,
  onEditBook
}) {
  const currentCat = categories.find((c) => c.id === selectedCategory);
  const catTitle = currentCat
    ? (currentCat[`name_${lang}`] || currentCat.name_hi || currentCat.name_en)
    : (selectedCategory === 'marsiya'
      ? (lang === 'hi' ? 'मर्सिया व शोक काव्य' : lang === 'ur' ? 'مرثیہ نگاری' : 'Marsiya & Elegiac Poetry')
      : t.sections?.allCategories || 'All Treatises');

  let activeSubGenreObj = null;
  if (currentCat && selectedSubGenre && selectedSubGenre !== 'all') {
    activeSubGenreObj = (currentCat.subgenres || []).find(
      (s) => s.id === selectedSubGenre || s.name_hi === selectedSubGenre || s.name_en === selectedSubGenre
    );
  }

  const subGenreTitle = activeSubGenreObj
    ? (activeSubGenreObj[`name_${lang}`] || activeSubGenreObj.name_hi || activeSubGenreObj.name_en)
    : (selectedSubGenre && selectedSubGenre !== 'all' ? selectedSubGenre : null);

  return (
    <section id="catalog" className="py-16 bg-[#080808] border-t border-white/[0.08] text-white">
      <div className="max-w-[1440px] mx-auto px-6">
        
        {/* Top Control Bar with Hierarchical Heading */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-1.5 h-1.5 bg-white rounded-full inline-block" />
              
              {/* Category Breadcrumb */}
              <h2 className="text-xl sm:text-2xl font-bold font-sans text-white tracking-[-0.03em] flex items-center gap-2">
                {searchQuery ? (
                  <span>{`${lang === 'hi' ? 'खोज परिणाम' : 'Search Results'}: "${searchQuery}"`}</span>
                ) : (
                  <>
                    <span>{catTitle}</span>
                    {subGenreTitle && (
                      <>
                        <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
                        <span className="text-zinc-400 font-medium">{subGenreTitle}</span>
                      </>
                    )}
                  </>
                )}
              </h2>
            </div>

            <div className="flex items-center gap-2 pl-3.5 mt-1.5 flex-wrap">
              <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                [{books.length} {lang === 'hi' ? 'रचनाएँ उपलब्ध' : lang === 'ur' ? 'کتابیں دستیاب' : 'TREATISES INDEXED'}]
              </p>

              {/* Active Sub-genre pill badge */}
              {subGenreTitle && (
                <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/[0.06] text-zinc-300 border border-white/[0.08] flex items-center gap-1.5">
                  <span>SUB-GENRE: {subGenreTitle}</span>
                  <button
                    onClick={() => onSelectSubGenre && onSelectSubGenre('all')}
                    className="hover:text-white transition cursor-pointer"
                    title="Clear Sub-Genre filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {searchQuery && (
              <button
                onClick={onClearSearch}
                className="px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.08] rounded-full transition cursor-pointer"
              >
                ✕ {t.sections?.clearSearch || 'CLEAR SEARCH'}
              </button>
            )}

            {/* Modern Sort Dropdown */}
            <div className="flex items-center gap-2 bg-[#141414] border border-white/[0.08] rounded-full px-4 py-2 text-xs font-mono">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-zinc-500 uppercase tracking-wider">{t.sections?.sortBy || 'SORT'}:</span>
              <select
                value={sortBy}
                onChange={(e) => onSortChange && onSortChange(e.target.value)}
                className="bg-transparent font-medium text-white outline-hidden cursor-pointer"
              >
                <option value="popular" className="bg-[#141414] text-white">{t.sections?.sortPopular || 'Popular'}</option>
                <option value="views" className="bg-[#141414] text-white">{t.sections?.sortViews || 'Most Viewed'}</option>
                <option value="latest" className="bg-[#141414] text-white">{t.sections?.sortLatest || 'Latest Uploads'}</option>
                <option value="year" className="bg-[#141414] text-white">{t.sections?.sortYear || 'Publication Year'}</option>
                <option value="title" className="bg-[#141414] text-white">{t.sections?.sortTitle || 'Alphabetical Title'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        <div className="mt-10">
          {books.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  lang={lang}
                  t={t}
                  onSelectBook={onSelectBook}
                  onOpenReader={onOpenReader}
                  onDownloadBook={onDownloadBook}
                  onEditBook={onEditBook}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-[#141414] rounded-[24px] border border-white/[0.08] p-8 max-w-lg mx-auto">
              <BookOpen className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1 font-sans">
                {t.sections?.noResults || 'No treatises match your search'}
              </h3>
              <p className="text-xs text-zinc-400 mb-6 leading-relaxed font-sans">
                {t.sections?.tryDifferent || 'Try searching with alternate spellings, authors, or transliterations.'}
              </p>
              {searchQuery && (
                <button
                  onClick={onClearSearch}
                  className="px-5 py-2 bg-white text-black font-mono text-xs uppercase tracking-wider font-semibold rounded-full shadow-xs hover:bg-zinc-200 transition cursor-pointer"
                >
                  {t.sections?.clearSearch || 'CLEAR SEARCH'}
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
