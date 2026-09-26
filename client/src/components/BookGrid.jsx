import React, { useState } from 'react';
import { ArrowUpDown, BookOpen, ChevronRight, X, LayoutGrid, List, Download, Eye, Edit3 } from 'lucide-react';
import BookCard from './BookCard';
import { AdminOnly } from './AdminGuard';

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
  const [viewMode, setViewMode] = useState('plates'); // 'plates' | 'register'

  const currentCat = categories.find((c) => c.id === selectedCategory);
  const catTitle = currentCat
    ? (currentCat[`name_${lang}`] || currentCat.name_hi || currentCat.name_en)
    : (selectedCategory === 'marsiya' ? (lang === 'hi' ? 'मर्सिया व शोक काव्य' : (lang === 'ur' ? 'مرثیہ نگاری' : 'Marsiya & Elegiac Poetry')) : t.sections?.allCategories || 'समस्त रचनाएँ');

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
    <section id="catalog" className="py-10 bg-[#F4F1EA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Register Control Bar */}
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 pb-4 border-b border-[#D5CFC4]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#A83324] rounded-full inline-block"></span>
              
              {/* Category Breadcrumb */}
              <h2 className="text-base sm:text-lg font-editorial font-bold text-[#161514] flex items-center gap-2">
                {searchQuery ? (
                  <span>{`${lang === 'hi' ? 'खोज परिणाम' : 'Search Results'}: "${searchQuery}"`}</span>
                ) : (
                  <>
                    <span>{catTitle}</span>
                    {subGenreTitle && (
                      <>
                        <ChevronRight className="w-3.5 h-3.5 text-[#7A746B] shrink-0" />
                        <span className="text-[#A83324] font-medium">{subGenreTitle}</span>
                      </>
                    )}
                  </>
                )}
              </h2>
            </div>

            <div className="flex items-center gap-3 pl-3.5 mt-1 flex-wrap">
              <p className="text-xs font-mono text-[#7A746B]">
                {books.length} {lang === 'hi' ? 'रचनाएँ पंजीकृत' : (lang === 'ur' ? 'کتابیں درج ہیں' : 'treatises in register')}
              </p>

              {/* Active Sub-genre filter tag */}
              {subGenreTitle && (
                <span className="text-[10.5px] font-mono px-2 py-0.5 rounded-xs bg-[#EAE6DC] text-[#161514] border border-[#D5CFC4] flex items-center gap-1.5">
                  <span>उप-वर्ग: {subGenreTitle}</span>
                  <button
                    onClick={() => onSelectSubGenre && onSelectSubGenre('all')}
                    className="hover:text-[#A83324] transition cursor-pointer"
                    title="Clear Sub-Genre filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>

          {/* Right Controls: Sort & View Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            {searchQuery && (
              <button
                onClick={onClearSearch}
                className="px-2.5 py-1 text-xs font-mono bg-[#EAE6DC] hover:bg-white text-[#161514] border border-[#D5CFC4] rounded transition cursor-pointer"
              >
                ✕ {t.sections?.clearSearch || 'फ़िल्टर हटाएँ'}
              </button>
            )}

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#D5CFC4] rounded px-2.5 py-1 text-xs font-mono">
              <ArrowUpDown className="w-3 h-3 text-[#7A746B]" />
              <span className="text-[#7A746B]">{t.sections?.sortBy || 'क्रम'}:</span>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="bg-transparent font-medium text-[#161514] outline-hidden cursor-pointer"
              >
                <option value="popular">{t.sections?.sortPopular || 'लोकप्रिय'}</option>
                <option value="views">{t.sections?.sortViews || 'सर्वाधिक पठित'}</option>
                <option value="latest">{t.sections?.sortLatest || 'नवीनतम'}</option>
                <option value="year">{t.sections?.sortYear || 'प्रकाशन वर्ष'}</option>
                <option value="title">{t.sections?.sortTitle || 'शीर्षक'}</option>
              </select>
            </div>

            {/* View Mode Toggle: Plates vs Ruled Register */}
            <div className="flex items-center border border-[#D5CFC4] rounded bg-[#FAF8F5] p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('plates')}
                title="Monograph Plates View"
                className={`p-1 rounded transition cursor-pointer ${
                  viewMode === 'plates'
                    ? 'bg-[#161514] text-[#F4F1EA]'
                    : 'text-[#7A746B] hover:text-[#161514]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('register')}
                title="Ruled Index Rows View"
                className={`p-1 rounded transition cursor-pointer ${
                  viewMode === 'register'
                    ? 'bg-[#161514] text-[#F4F1EA]'
                    : 'text-[#7A746B] hover:text-[#161514]'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Display: Monograph Plates Grid vs Ruled Index Rows */}
        {books.length > 0 ? (
          viewMode === 'plates' ? (
            /* Monograph Plates Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4 mt-6">
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
            /* Ruled Index Rows (Table / Register mode) */
            <div className="mt-6 border border-[#D5CFC4] bg-[#FAF8F5]">
              {/* Desktop Register Header */}
              <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 bg-[#EAE6DC] border-b border-[#D5CFC4] text-[11px] font-mono text-[#7A746B] uppercase tracking-wider">
                <div className="col-span-5">शीर्षक एवं ग्रंथ (Treatise)</div>
                <div className="col-span-3">रचनाकार (Author)</div>
                <div className="col-span-2">प्रभाग / काल (Domain / Era)</div>
                <div className="col-span-2 text-right">कार्य (Actions)</div>
              </div>

              {/* Ruled Rows */}
              <div className="divide-y divide-[#D5CFC4]">
                {books.map((book) => {
                  const bTitle = book[`title_${lang}`] || book.title_hi || book.title_en;
                  const bAuthor = book[`author_${lang}`] || book.author_hi || book.author_en;
                  const bYear = book.year ? `${book.year}` : null;

                  return (
                    <div
                      key={book.id}
                      className="p-3 sm:px-4 sm:py-3 hover:bg-[#F4F1EA] transition-colors flex flex-col md:grid md:grid-cols-12 md:items-center gap-2 md:gap-3"
                    >
                      {/* Col 1: Title & Script */}
                      <div className="md:col-span-5">
                        <div
                          onClick={() => onSelectBook(book)}
                          className="font-editorial font-bold text-sm text-[#161514] hover:text-[#A83324] cursor-pointer"
                        >
                          {bTitle}
                        </div>
                        {book.title_en && book.title_en !== bTitle && (
                          <div className="text-[10.5px] font-mono text-[#7A746B]">
                            {book.title_en}
                          </div>
                        )}
                      </div>

                      {/* Col 2: Author */}
                      <div className="md:col-span-3 text-xs text-[#4A463F] font-serif italic">
                        {bAuthor}
                      </div>

                      {/* Col 3: Domain & Year */}
                      <div className="md:col-span-2 flex items-center gap-2 text-xs font-mono text-[#7A746B]">
                        <span className="capitalize">{book.category}</span>
                        {bYear && (
                          <>
                            <span>•</span>
                            <span>{bYear}</span>
                          </>
                        )}
                      </div>

                      {/* Col 4: Actions */}
                      <div className="md:col-span-2 flex items-center justify-start md:justify-end gap-2 pt-1 md:pt-0 border-t border-[#D5CFC4]/50 md:border-t-0">
                        <button
                          onClick={() => onOpenReader(book)}
                          className="px-2.5 py-1 text-xs font-mono bg-[#161514] hover:bg-[#A83324] text-white rounded-xs flex items-center gap-1 transition cursor-pointer"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>पढ़ें</span>
                        </button>
                        <button
                          onClick={() => onDownloadBook(book)}
                          className="p-1 text-[#7A746B] hover:text-[#1E3D34] hover:bg-[#EAE6DC] rounded-xs transition cursor-pointer"
                          title={t.card?.downloadPdf || 'PDF डाउनलोड'}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        {onEditBook && (
                          <AdminOnly>
                            <button
                              onClick={() => onEditBook(book)}
                              className="p-1 text-[#7A746B] hover:text-[#A83324] hover:bg-[#EAE6DC] rounded-xs transition cursor-pointer"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </AdminOnly>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        ) : (
          /* Empty Register Notice */
          <div className="py-16 text-center bg-[#FAF8F5] border border-[#D5CFC4] mt-6 p-6 max-w-lg mx-auto">
            <div className="w-10 h-10 border border-[#D5CFC4] rounded flex items-center justify-center mx-auto mb-3 text-[#7A746B]">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-editorial font-bold text-[#161514] mb-1">
              {t.sections?.noBooksFound || 'इस श्रेणी में कोई ग्रंथ पंजीकृत नहीं'}
            </h3>
            <p className="text-xs text-[#7A746B] max-w-sm mx-auto mb-4 leading-relaxed font-mono">
              {t.sections?.noBooksDesc || 'फ़िल्टर बदलकर देखें अथवा समस्त ग्रंथ सूची का अवलोकन करें।'}
            </p>
            <div className="flex items-center justify-center gap-2">
              {selectedSubGenre && selectedSubGenre !== 'all' && (
                <button
                  onClick={() => onSelectSubGenre && onSelectSubGenre('all')}
                  className="px-3 py-1.5 bg-[#EAE6DC] hover:bg-white text-[#161514] text-xs font-mono rounded border border-[#D5CFC4] transition cursor-pointer"
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
                className="px-3.5 py-1.5 bg-[#161514] hover:bg-[#A83324] text-white text-xs font-mono rounded transition cursor-pointer"
              >
                {lang === 'hi' ? 'समस्त ग्रंथ सूची' : 'View All Treatises'}
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

