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
  onDownloadBook
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
    <section id="catalog" className="py-12 bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Top Control Bar with Hierarchical Heading */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200/80">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-5 h-1 bg-[#1d4ed8] rounded-full"></div>
              
              {/* Category Breadcrumb */}
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0f172a] font-rekhta-serif tracking-tight flex items-center gap-2">
                {searchQuery ? (
                  <span>{`${lang === 'hi' ? 'खोज परिणाम' : 'Search Results'}: "${searchQuery}"`}</span>
                ) : (
                  <>
                    <span>{catTitle}</span>
                    {subGenreTitle && (
                      <>
                        <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
                        <span className="text-[#1d4ed8] font-bold">{subGenreTitle}</span>
                      </>
                    )}
                  </>
                )}
              </h2>
            </div>

            <div className="flex items-center gap-2 pl-7 mt-1.5 flex-wrap">
              <p className="text-xs text-stone-500 font-medium">
                {books.length} {lang === 'hi' ? 'रचनाएँ उपलब्ध' : (lang === 'ur' ? 'کتابیں دستیاب' : 'treatises available')}
              </p>

              {/* Active Sub-genre pill badge */}
              {subGenreTitle && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1d4ed8] border border-blue-200 flex items-center gap-1">
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
                className="px-3.5 py-1.5 text-xs bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-medium transition cursor-pointer shadow-2xs"
              >
                ✕ {lang === 'hi' ? 'खोज हटाएं' : (lang === 'ur' ? 'مسح تلاش' : 'Clear search')}
              </button>
            )}

            {/* Modern Sort Dropdown */}
            <div className="flex items-center gap-2 bg-white border border-stone-200/90 rounded-xl px-3 py-1.5 shadow-2xs text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-stone-500 font-medium">{t.sections.sortBy}:</span>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="bg-transparent font-semibold text-stone-800 outline-hidden cursor-pointer"
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

        {/* Books Grid */}
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
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-stone-200/80 mt-8 shadow-xs p-8 max-w-xl mx-auto">
            <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-stone-200/60 shadow-2xs">
              <BookOpen className="w-6 h-6 text-stone-400" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-1 font-hindi-serif">
              {t.sections.noBooksFound}
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mb-5 leading-relaxed">
              {lang === 'hi'
                ? 'इस उप-विधा में वर्तमान में कोई पुस्तक उपलब्ध नहीं है। आप अपनी ई-पुस्तक अपलोड कर सकते हैं।'
                : 'No treatises found matching this sub-genre or criteria. You can upload relevant e-books to this collection.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              {selectedSubGenre && selectedSubGenre !== 'all' && (
                <button
                  onClick={() => onSelectSubGenre && onSelectSubGenre('all')}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition cursor-pointer"
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
                className="px-5 py-2 bg-[#1d4ed8] text-white text-xs font-semibold rounded-xl hover:bg-[#1e40af] transition shadow-xs cursor-pointer"
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
