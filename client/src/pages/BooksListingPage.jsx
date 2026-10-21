import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Filter,
  ArrowUpDown,
  Search,
  Globe,
  Calendar,
  FileText,
  Trash2,
  ChevronRight,
  Layers,
  Sparkles
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import BookCard from '../components/BookCard';
import { getBooks, deleteSubgenre } from '../services/supabaseApi';
import { AdminOnly } from '../components/AdminGuard';
import { getLocalizedEra } from '../locales/translations';
import { getCategoryGraphic } from '../data/categoryGraphics';

export default function BooksListingPage({
  t,
  lang = 'hi',
  categories = [],
  onSelectBook,
  onOpenReader,
  onDownloadBook,
  onEditBook,
  onOpenUpload,
  onRefreshCategories
}) {
  const { categorySlug, genreSlug, subgenreSlug } = useParams();
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [searchFilter, setSearchFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [eraFilter, setEraFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  // Admin Delete State
  const [showDeleteSubModal, setShowDeleteSubModal] = useState(false);
  const [isDeletingSub, setIsDeletingSub] = useState(false);

  const category = categories.find((c) => c.id === categorySlug) || {
    id: categorySlug,
    name_hi: categorySlug,
    name_en: categorySlug
  };

  const genre = (category.genres || []).find((g) => g.id === genreSlug) || {
    id: genreSlug,
    name_hi: genreSlug,
    name_en: genreSlug
  };

  const subgenre = (genre.subgenres || []).find((sg) => sg.id === subgenreSlug) || {
    id: subgenreSlug,
    name_hi: subgenreSlug,
    name_en: subgenreSlug
  };

  const categoryTitle = category[`name_${lang}`] || category.name_hi || category.name_en;
  const genreTitle = genre[`name_${lang}`] || genre.name_hi || genre.name_en;
  const subgenreTitle = subgenre[`name_${lang}`] || subgenre.name_hi || subgenre.name_en;

  const fetchSubgenreBooks = async () => {
    setIsLoading(true);
    try {
      const data = await getBooks({
        category: categorySlug,
        genre: genreSlug,
        subgenre: subgenreSlug,
        language: languageFilter,
        era: eraFilter,
        format: formatFilter,
        search: searchFilter,
        sort: sortBy,
        limit: 100
      });
      setBooks(data || []);
    } catch (err) {
      console.error('Error fetching subgenre books from Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubgenreBooks();
  }, [categorySlug, genreSlug, subgenreSlug, searchFilter, languageFilter, eraFilter, formatFilter, sortBy]);

  const handleDeleteSubGenre = async () => {
    setIsDeletingSub(true);
    try {
      await deleteSubgenre(categorySlug, genreSlug, subgenreSlug);
      if (onRefreshCategories) await onRefreshCategories();
      navigate(`/category/${categorySlug}/${genreSlug}`);
    } catch (err) {
      alert('Error deleting sub-genre: ' + err.message);
    } finally {
      setIsDeletingSub(false);
    }
  };

  const hl = t.hierarchyLayers || {};
  const graphic = getCategoryGraphic(categorySlug);

  return (
    <div className="w-full pb-12 animate-fadeIn">
      {/* Layer 4 Breadcrumb: Home > Category > Genre > Sub-genre */}
      <Breadcrumbs
        lang={lang}
        t={t}
        items={[
          { label: categoryTitle, url: `/category/${categorySlug}` },
          { label: genreTitle, url: `/category/${categorySlug}/${genreSlug}` },
          { label: subgenreTitle }
        ]}
      />

      {/* Layer 4 Header Banner: Mugen Studio Container */}
      <div className="mt-4 p-6 sm:p-8 rounded-[24px] bg-[#141414] border border-white/[0.08] relative overflow-hidden">
        {graphic && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center z-0 opacity-55"
              style={{ backgroundImage: `url(${graphic.image || graphic.remoteFallback})` }}
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${graphic.accentGradient || 'from-black/70 via-black/50 to-transparent'} z-5`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/35 to-transparent z-5 pointer-events-none" />
          </>
        )}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] text-zinc-400 text-[10px] font-mono tracking-[0.2em] uppercase border border-white/[0.08]">
              <span>{hl.layer4Badge || (lang === 'hi' ? 'पुस्तक संग्रह' : lang === 'ur' ? 'کتب کی فہرست' : 'BOOK COLLECTION')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-white flex items-center gap-3">
              <span>{subgenreTitle}</span>
              <AdminOnly>
                <button
                  onClick={() => setShowDeleteSubModal(true)}
                  title={t.admin?.deleteBtn || 'Delete'}
                  className="p-1.5 rounded-full text-zinc-500 hover:text-red-400 hover:bg-white/[0.05] transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </AdminOnly>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
              {lang === 'hi'
                ? `${subgenreTitle} (${categoryTitle} › ${genreTitle}) के अंतर्गत डिजिटल रूप से उपलब्ध पुस्तकें।`
                : lang === 'ur'
                ? `${subgenreTitle} (${categoryTitle} › ${genreTitle}) کے تحت دستیاب کتب۔`
                : `Digitally preserved books and works in ${subgenreTitle} (${categoryTitle} › ${genreTitle}).`}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            <AdminOnly>
              {onOpenUpload && (
                <button
                  type="button"
                  onClick={onOpenUpload}
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-mono uppercase tracking-wider font-extrabold rounded-full shadow-md flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>↑</span>
                  <span>{t?.nav?.uploadBook || 'Upload E-Book'}</span>
                </button>
              )}
            </AdminOnly>
            <div className="bg-white/[0.03] border border-white/[0.08] px-5 py-3 rounded-[16px] text-center">
              <span className="text-xl font-bold font-mono text-white block">{books.length}</span>
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-400">{lang === 'hi' ? 'पुस्तकें' : lang === 'ur' ? 'کتب' : 'Books'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="mt-6 p-4 rounded-[24px] bg-[#141414] border border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Search inside Subgenre */}
          <div className="relative">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder={hl.searchPlaceholder || (lang === 'hi' ? 'इस संग्रह में खोजें...' : lang === 'ur' ? 'اس مجموعے میں تلاش کریں...' : 'Search in this collection...')}
              className="pl-8 pr-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full outline-hidden focus:border-white/30 text-white placeholder:text-zinc-500 w-48 sm:w-56 font-sans text-xs"
            />
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2 pointer-events-none" />
          </div>

          {/* Language Filter */}
          <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full px-3 py-1.5">
            <Globe className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="bg-transparent font-medium text-zinc-300 outline-hidden cursor-pointer [&>option]:bg-[#141414] [&>option]:text-white"
            >
              <option value="all">{hl.allLanguages || 'All Languages'}</option>
              <option value="hindi">{lang === 'hi' ? 'हिंदी' : lang === 'ur' ? 'ہندی' : 'Hindi'}</option>
              <option value="urdu">{lang === 'hi' ? 'उर्दू' : lang === 'ur' ? 'اردو' : 'Urdu'}</option>
              <option value="english">{lang === 'hi' ? 'अंग्रेज़ी' : lang === 'ur' ? 'انگریزی' : 'English'}</option>
            </select>
          </div>

          {/* Era Filter */}
          <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full px-3 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={eraFilter}
              onChange={(e) => setEraFilter(e.target.value)}
              className="bg-transparent font-medium text-zinc-300 outline-hidden cursor-pointer [&>option]:bg-[#141414] [&>option]:text-white"
            >
              <option value="all">{hl.allEras || 'All Eras'}</option>
              <option value="contemporary">{getLocalizedEra('Contemporary Era', lang)}</option>
              <option value="post-independence">{getLocalizedEra('Post-Independence Era', lang)}</option>
              <option value="progressive">{getLocalizedEra('Progressive Era', lang)}</option>
              <option value="chhayavad">{getLocalizedEra('Chhayavad Era', lang)}</option>
              <option value="medieval">{getLocalizedEra('Medieval Era', lang)}</option>
            </select>
          </div>

          {/* Format Filter */}
          <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full px-3 py-1.5">
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="bg-transparent font-medium text-zinc-300 outline-hidden cursor-pointer [&>option]:bg-[#141414] [&>option]:text-white"
            >
              <option value="all">{hl.allFormats || 'All Formats'}</option>
              <option value="pdf">{hl.pdfFormat || 'PDF'}</option>
              <option value="epub">{hl.epubFormat || 'EPUB'}</option>
            </select>
          </div>

        </div>

        {/* Right Sort Dropdown */}
        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-full px-3 py-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-400 font-mono text-[10px] uppercase tracking-wider">{t.sections?.sortBy || 'Sort'}:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent font-bold text-white outline-hidden cursor-pointer [&>option]:bg-[#141414] [&>option]:text-white"
          >
            <option value="popular">{t.sections?.sortPopular || 'Popular'}</option>
            <option value="views">{t.sections?.sortViews || 'Most Viewed'}</option>
            <option value="latest">{t.sections?.sortLatest || 'Latest'}</option>
            <option value="year">{t.sections?.sortYear || 'Year'}</option>
            <option value="title">{t.sections?.sortTitle || 'Title'}</option>
          </select>
        </div>

      </div>

      {/* Catalog Books Grid */}
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
          <div className="py-20 text-center bg-[#141414] rounded-[24px] border border-white/[0.08] mt-6 p-8 max-w-lg mx-auto">
            <BookOpen className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1 font-sans">
              {hl.noWorksFound || (lang === 'hi' ? 'कोई पुस्तक नहीं मिली' : lang === 'ur' ? 'کوئی کتاب نہیں ملی' : 'No books found')}
            </h3>
            <p className="text-xs text-zinc-400 mb-5 leading-relaxed font-sans">
              {hl.noWorksDesc || (lang === 'hi' ? 'फ़िल्टर या खोज शब्द बदलकर पुनः प्रयास करें।' : lang === 'ur' ? 'فلٹرز یا تلاش کے الفاظ تبدیل کر کے دوبارہ کوشش کریں۔' : 'Try adjusting the active filters or search terms.')}
            </p>
            <button
              onClick={() => {
                setSearchFilter('');
                setLanguageFilter('all');
                setEraFilter('all');
                setFormatFilter('all');
              }}
              className="px-5 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-semibold rounded-full shadow-xs transition cursor-pointer"
            >
              {hl.resetFilters || 'Reset Filters'}
            </button>
          </div>
        )}
      </div>

      {/* Delete Sub-Genre Confirmation Modal (Admin Only) */}
      {showDeleteSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-[#141414] rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-white/[0.1] text-center animate-scaleUp text-white">
            <div className="w-10 h-10 rounded-full bg-red-950/60 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-sans mb-1">
              {t.admin?.deleteBtn || 'Delete Sub-Genre'}
            </h3>
            <p className="text-xs text-zinc-400 mb-5 leading-relaxed font-sans">
              {t.admin?.deleteConfirm || 'Are you sure you want to delete this sub-genre?'}
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteSubModal(false)}
                className="px-4 py-2 text-xs font-medium text-zinc-400 border border-white/[0.1] rounded-full hover:text-white hover:bg-white/[0.05] cursor-pointer"
              >
                {lang === 'hi' ? 'रद्द करें' : lang === 'ur' ? 'منسوخ' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeleteSubGenre}
                disabled={isDeletingSub}
                className="px-5 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-full shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                {isDeletingSub ? '...' : t.admin?.deleteBtn || 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
