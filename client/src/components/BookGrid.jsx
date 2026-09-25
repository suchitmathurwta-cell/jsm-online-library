import React from 'react';
import { ArrowUpDown, BookOpen, ChevronRight, X, Sparkles } from 'lucide-react';
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
    : (selectedCategory === 'marsiya' ? (lang === 'hi' ? 'मर्सिया व शोक काव्य' : (lang === 'ur' ? 'مرثیہ نگاری' : 'Marsiya & Elegiac Poetry')) : t.sections.allCategories);

  let activeSubGenreObj = null;
  if (currentCat && selectedSubGenre && selectedSubGenre !== 'all') {
    activeSubGenreObj = (currentCat.subgenres || []).find(
      s => s.id === selectedSubGenre || s.name_hi === selectedSubGenre || s.name_en === selectedSubGenre
    );
  }

  const subGenreTitle = activeSubGenreObj
    ? (activeSubGenreObj[`name_${lang}`] || activeSubGenreObj.name_hi || activeSubGenreObj.name_en)
    : (selectedSubGenre && selectedSubGenre !== 'all' ? selectedSubGenre : null);

  return (
    <section id="catalog" className="py-12 bg-[#FAF9F6] border-t border-[#E2DDD5]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Editorial Publication Header & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E2DDD5]">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#BA4E36]"></span>
              
              {/* Category Breadcrumb */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#1E1B18] font-editorial tracking-tight flex items-center gap-2">
                {searchQuery ? (
                  <span>{`${lang === 'hi' ? 'खोज परिणाम' : 'Search Results'}: "${searchQuery}"`}</span>
                ) : (
                  <>
                    <span>{catTitle}</span>
                    {subGenreTitle && (
                      <>
                        <ChevronRight className="w-4 h-4 text-[#66615B] shrink-0" />
                        <span className="text-[#BA4E36] font-bold">{subGenreTitle}</span>
                      </>
                    )}
                  </>
                )}
              </h2>
            </div>

            <div className="flex items-center gap-2 pl-5 mt-1.5 flex-wrap">
              <p className="text-xs text-[#66615B] font-editorial">
                {books.length} {lang === 'hi' ? 'रचनाएँ उपलब्ध' : (lang === 'ur' ? 'کتابیں دستیاب' : 'treatises available')}
              </p>

              {/* Active Sub-genre pill badge */}
              {subGenreTitle && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#BA4E36]/10 text-[#BA4E36] border border-[#BA4E36]/20 flex items-center gap-1 font-editorial">
                  <span>उप-वर्ग: {subGenreTitle}</span>
                  <button
                    onClick={() => onSelectSubGenre && onSelectSubGenre('all')}
                    className="hover:text-red-700 transition cursor-pointer"
                    title="Clear Sub-Genre filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>

          {/* Right Controls: Clear Search & Sort */}
          <div className="flex flex-wrap items-center gap-2.5">
            {searchQuery && (
              <button
                onClick={onClearSearch}
                className="px-3.5 py-1.5 text-xs bg-[#F2EFE9] hover:bg-[#E2DDD5] text-[#1E1B18] rounded-xl font-medium transition cursor-pointer border border-[#E2DDD5]"
              >
                ✕ {t.sections.clearSearch}
              </button>
            )}

            {/* Editorial Sort Dropdown */}
            <div className="flex items-center gap-2 bg-[#F2EFE9] border border-[#E2DDD5] rounded-xl px-3 py-1.5 text-xs shadow-2xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#66615B]" />
              <span className="text-[#66615B] font-medium">{t.sections.sortBy}:</span>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="bg-transparent font-semibold text-[#1E1B18] outline-hidden cursor-pointer font-editorial"
              >
                <option value="popular">{t.sections.sortPopular}</option>
                <option value="views">{t.sections.sortViews}</option>
                <option value="latest">{t.sections.sortLatest}</option>
                <option value="year">{t.sections.sortYear}</option>
                <option value="title">{t.sections.sortTitle}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Fluid Editorial Books Grid */}
        {books.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 mt-8">
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
          <div className="py-20 text-center bg-[#F2EFE9] rounded-3xl border border-[#E2DDD5] mt-8 shadow-xs p-8 max-w-xl mx-auto">
            <div className="w-14 h-14 bg-[#FAF9F6] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#E2DDD5] shadow-2xs">
              <BookOpen className="w-6 h-6 text-[#BA4E36]" />
            </div>
            <h3 className="text-lg font-bold text-[#1E1B18] mb-1 font-editorial">
              {t.sections.noBooksFound}
            </h3>
            <p className="text-xs text-[#66615B] max-w-sm mx-auto mb-5 leading-relaxed font-editorial">
              {t.sections.noBooksDesc}
            </p>
            <div className="flex items-center justify-center gap-3">
              {selectedSubGenre && selectedSubGenre !== 'all' && (
                <button
                  onClick={() => onSelectSubGenre && onSelectSubGenre('all')}
                  className="px-4 py-2 bg-[#FAF9F6] hover:bg-white text-[#1E1B18] text-xs font-semibold rounded-xl border border-[#E2DDD5] transition cursor-pointer"
                >
                  {lang === 'hi' ? 'समग्र विधा देखें' : 'View Full Genre'}
                </button>
              )}
              <button
                onClick={() => {
                  onSelectCategory('all');
                  if (onSelectSubGenre) onSelectSubGenre('all');
                  if (onClearSearch) onClearSearch();
                }}
                className="px-5 py-2 bg-[#BA4E36] text-white text-xs font-semibold rounded-xl hover:bg-[#a0422d] transition shadow-xs cursor-pointer"
              >
                {lang === 'hi' ? 'सभी रचनाएँ देखें' : 'View All Treatises'}
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
