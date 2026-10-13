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
    <section id="catalog" className="py-12 bg-[#FAFAFA] border-t border-black/[0.05]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Top Control Bar with Hierarchical Heading */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-black/[0.06]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#111111] rounded-full inline-block"></span>
              
              {/* Category Breadcrumb */}
              <h2 className="text-xl sm:text-2xl font-bold font-sans text-[#111111] tracking-tight flex items-center gap-2">
                {searchQuery ? (
                  <span>{`${lang === 'hi' ? 'खोज परिणाम' : 'Search Results'}: "${searchQuery}"`}</span>
                ) : (
                  <>
                    <span>{catTitle}</span>
                    {subGenreTitle && (
                      <>
                        <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                        <span className="text-zinc-600 font-medium">{subGenreTitle}</span>
                      </>
                    )}
                  </>
                )}
              </h2>
            </div>

            <div className="flex items-center gap-2 pl-3.5 mt-1.5 flex-wrap">
              <p className="text-xs font-mono text-zinc-500">
                {books.length} {lang === 'hi' ? 'रचनाएँ उपलब्ध' : lang === 'ur' ? 'کتابیں دستیاب' : 'treatises available'}
              </p>

              {/* Active Sub-genre pill badge */}
              {subGenreTitle && (
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200/80 flex items-center gap-1">
                  <span>उप-वर्ग: {subGenreTitle}</span>
                  <button
                    onClick={() => onSelectSubGenre && onSelectSubGenre('all')}
                    className="hover:text-red-600 transition cursor-pointer"
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
                className="px-3.5 py-1.5 text-xs bg-zinc-100 hover:bg-zinc-200 text-[#111111] rounded-full font-medium transition cursor-pointer"
              >
                ✕ {t.sections?.clearSearch || 'Clear Search'}
              </button>
            )}

            {/* Modern Sort Dropdown */}
            <div className="flex items-center gap-2 bg-white border border-zinc-200/90 rounded-full px-3.5 py-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-zinc-500 font-medium">{t.sections?.sortBy || 'Sort'}:</span>
              <select
                value={sortBy}
                onChange={(e) => onSortChange && onSortChange(e.target.value)}
                className="bg-transparent font-medium text-[#111111] outline-hidden cursor-pointer"
              >
                <option value="popular">{t.sections?.sortPopular || 'Popular'}</option>
                <option value="views">{t.sections?.sortViews || 'Most Viewed'}</option>
                <option value="latest">{t.sections?.sortLatest || 'Latest Uploads'}</option>
                <option value="year">{t.sections?.sortYear || 'Publication Year'}</option>
                <option value="title">{t.sections?.sortTitle || 'Alphabetical Title'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        <div className="mt-8">
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
            <div className="py-20 text-center bg-white rounded-3xl border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-8 max-w-lg mx-auto">
              <BookOpen className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#111111] mb-1 font-sans">
                {t.sections?.noResults || 'No treatises match your search'}
              </h3>
              <p className="text-xs text-zinc-500 mb-5 leading-relaxed font-sans">
                {t.sections?.tryDifferent || 'Try searching with alternate spellings, authors, or transliterations.'}
              </p>
              {searchQuery && (
                <button
                  onClick={onClearSearch}
                  className="px-5 py-2 bg-[#111111] hover:bg-black text-white text-xs font-medium rounded-full shadow-xs transition cursor-pointer"
                >
                  {t.sections?.clearSearch || 'Clear Search'}
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
