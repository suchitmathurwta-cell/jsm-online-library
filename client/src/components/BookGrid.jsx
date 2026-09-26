import React from 'react';
import { ArrowUpDown, BookOpen, ChevronRight, X, Layers } from 'lucide-react';
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
    <section id="catalog" className="py-14 bg-[#F7F5F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Control Bar with Hierarchical Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#DDD7CD]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono tracking-widest text-[#9B382A] uppercase font-bold flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-[#9B382A]" />
                <span>ARCHIVAL CATALOGUE // ACCESSION REGISTER</span>
              </span>
            </div>

            {/* Category Breadcrumb */}
            <h2 className="font-editorial text-2xl sm:text-3xl text-[#121110] font-normal tracking-tight flex flex-wrap items-center gap-2">
              {searchQuery ? (
                <span>{`${lang === 'hi' ? 'खोज परिणाम' : 'Search Results'}: "${searchQuery}"`}</span>
              ) : (
                <>
                  <span>{catTitle}</span>
                  {subGenreTitle && (
                    <>
                      <ChevronRight className="w-4 h-4 text-[#524E48] shrink-0" />
                      <span className="text-[#9B382A] font-serif">{subGenreTitle}</span>
                    </>
                  )}
                </>
              )}
            </h2>

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <p className="text-xs font-mono text-[#524E48]">
                {books.length} {lang === 'hi' ? 'रचनाएँ पंजीकृत' : (lang === 'ur' ? 'کتابیں درج' : 'registered manuscripts')}
              </p>

              {/* Active Sub-genre indicator */}
              {subGenreTitle && (
                <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-sm bg-[#EFECE6] text-[#121110] border border-[#DDD7CD] flex items-center gap-1.5">
                  <span>SUB-DOMAIN: {subGenreTitle}</span>
                  <button
                    type="button"
                    onClick={() => onSelectSubGenre && onSelectSubGenre('all')}
                    className="hover:text-[#9B382A] transition cursor-pointer"
                    title="Clear Sub-Genre filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>

          {/* Right Controls: Sort & Filter Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {searchQuery && (
              <button
                type="button"
                onClick={onClearSearch}
                className="px-3 py-1.5 text-xs font-mono bg-[#EFECE6] hover:bg-[#E5E1D8] text-[#121110] rounded-sm border border-[#DDD7CD] transition cursor-pointer"
              >
                ✕ {t.sections.clearSearch}
              </button>
            )}

            {/* Archival Sort Dropdown */}
            <div className="flex items-center gap-2 bg-[#FFFFFF] border border-[#DDD7CD] rounded-sm px-3 py-1.5 text-xs shadow-2xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#524E48]" />
              <span className="text-[#524E48] font-mono uppercase text-[10px]">{t.sections.sortBy}:</span>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="bg-transparent font-mono text-xs text-[#121110] outline-none cursor-pointer"
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
                onEditBook={onEditBook}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-[#FFFFFF] rounded-sm border border-[#DDD7CD] mt-8 p-8 max-w-xl mx-auto">
            <div className="w-12 h-12 bg-[#FAF9F6] rounded-sm flex items-center justify-center mx-auto mb-4 border border-[#DDD7CD]">
              <BookOpen className="w-5 h-5 text-[#524E48]" />
            </div>
            <h3 className="font-editorial text-xl font-normal text-[#121110] mb-2">
              {t.sections.noBooksFound}
            </h3>
            <p className="text-xs text-[#524E48] font-sans max-w-sm mx-auto mb-6 leading-relaxed">
              {t.sections.noBooksDesc}
            </p>
            <div className="flex items-center justify-center gap-3">
              {selectedSubGenre && selectedSubGenre !== 'all' && (
                <button
                  type="button"
                  onClick={() => onSelectSubGenre && onSelectSubGenre('all')}
                  className="px-4 py-2 bg-[#EFECE6] hover:bg-[#E5E1D8] text-[#121110] text-xs font-mono uppercase tracking-wider rounded-sm transition cursor-pointer border border-[#DDD7CD]"
                >
                  {lang === 'hi' ? 'समग्र विधा देखें' : 'View Full Genre'}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onSelectCategory('all');
                  if (onSelectSubGenre) onSelectSubGenre('all');
                  if (onClearSearch) onClearSearch();
                }}
                className="px-5 py-2 bg-[#9B382A] text-white text-xs font-mono uppercase tracking-wider rounded-sm hover:bg-[#852E22] transition cursor-pointer"
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

