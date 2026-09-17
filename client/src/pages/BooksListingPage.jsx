import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ArrowUpDown,
  Filter,
  Search,
  Globe,
  Calendar,
  FileText,
  Download,
  Eye,
  Trash2,
  Edit2,
  X
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import { getBooks, deleteSubgenre } from '../services/supabaseApi';
import BookCard from '../components/BookCard';
import { AdminOnly } from '../components/AdminGuard';
import { getLocalizedEra } from '../locales/translations';

export default function BooksListingPage({
  t,
  lang = 'hi',
  categories = [],
  onSelectBook,
  onOpenReader,
  onDownloadBook,
  onEditBook,
  onRefreshCategories
}) {
  const { categorySlug, genreSlug, subgenreSlug } = useParams();
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [eraFilter, setEraFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  // Delete Subgenre State
  const [showDeleteSubModal, setShowDeleteSubModal] = useState(false);
  const [isDeletingSub, setIsDeletingSub] = useState(false);

  const category = categories.find(c => c.id === categorySlug) || {
    id: categorySlug,
    name_hi: categorySlug,
    name_en: categorySlug,
    genres: []
  };

  const genre = (category.genres || []).find(g => g.id === genreSlug) || {
    id: genreSlug,
    name_hi: genreSlug,
    name_en: genreSlug,
    subgenres: []
  };

  const subgenre = (genre.subgenres || []).find(s => s.id === subgenreSlug) || {
    id: subgenreSlug,
    name_hi: subgenreSlug,
    name_en: subgenreSlug
  };

  const categoryTitle = category[`name_${lang}`] || category.name_hi || category.name_en;
  const genreTitle = genre[`name_${lang}`] || genre.name_hi || genre.name_en;
  const subgenreTitle = subgenre[`name_${lang}`] || subgenre.name_hi || subgenre.name_en;

  // Fetch filtered books for this subgenre from backend
  const fetchSubgenreBooks = async () => {
    setIsLoading(true);
    try {
      const data = await getBooks({
        category: categorySlug,
        genre: genreSlug,
        subgenre: subgenreSlug,
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fadeIn">
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

      {/* Layer 4 Header Banner */}
      <div className="mt-3 p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/90 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1d4ed8] text-xs font-bold border border-blue-200/70">
              <span>{hl.layer4Badge}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-rekhta-serif tracking-tight text-stone-900 flex items-center gap-3">
              <span>{subgenreTitle}</span>
              <AdminOnly>
                <button
                  onClick={() => setShowDeleteSubModal(true)}
                  title={t.admin.deleteBtn}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </AdminOnly>
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-normal leading-relaxed">
              {lang === 'hi'
                ? `${subgenreTitle} (${categoryTitle} › ${genreTitle}) के अंतर्गत डिजिटल रूप से संरक्षित और वर्गीकृत दुर्लभ साहित्यिक कृतियाँ।`
                : (lang === 'ur'
                  ? `${subgenreTitle} (${categoryTitle} › ${genreTitle}) کے تحت محفوظ کی گئی نایاب کتب اور علمی شاہکار۔`
                  : `Curated digital archive and preserved treatises classified under ${subgenreTitle} (${categoryTitle} › ${genreTitle}).`)}
            </p>
          </div>

          <div className="bg-stone-50 border border-stone-200 px-5 py-3 rounded-2xl text-center self-start md:self-auto shrink-0 shadow-2xs">
            <span className="text-xl font-bold text-[#1d4ed8] block">{books.length}</span>
            <span className="text-xs text-stone-500 font-medium">{hl.layer4Treatises}</span>
          </div>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="mt-6 p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Search inside Subgenre */}
          <div className="relative">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder={hl.searchPlaceholder}
              className="pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:border-[#1d4ed8] text-stone-800 w-48 sm:w-56"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2 pointer-events-none" />
          </div>

          {/* Language Filter */}
          <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5">
            <Globe className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="bg-transparent font-medium text-stone-700 outline-hidden cursor-pointer"
            >
              <option value="all">{hl.allLanguages}</option>
              <option value="hindi">{lang === 'hi' ? 'हिंदी' : (lang === 'ur' ? 'ہندی' : 'Hindi')}</option>
              <option value="urdu">{lang === 'hi' ? 'उर्दू' : (lang === 'ur' ? 'اردو' : 'Urdu')}</option>
              <option value="english">{lang === 'hi' ? 'अंग्रेज़ी' : (lang === 'ur' ? 'انگریزی' : 'English')}</option>
            </select>
          </div>

          {/* Era Filter */}
          <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={eraFilter}
              onChange={(e) => setEraFilter(e.target.value)}
              className="bg-transparent font-medium text-stone-700 outline-hidden cursor-pointer"
            >
              <option value="all">{hl.allEras}</option>
              <option value="contemporary">{getLocalizedEra('Contemporary Era', lang)}</option>
              <option value="post-independence">{getLocalizedEra('Post-Independence Era', lang)}</option>
              <option value="progressive">{getLocalizedEra('Progressive Era', lang)}</option>
              <option value="chhayavad">{getLocalizedEra('Chhayavad Era', lang)}</option>
              <option value="medieval">{getLocalizedEra('Medieval Era', lang)}</option>
            </select>
          </div>

          {/* Format Filter */}
          <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5">
            <FileText className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="bg-transparent font-medium text-stone-700 outline-hidden cursor-pointer"
            >
              <option value="all">{hl.allFormats}</option>
              <option value="pdf">{hl.pdfFormat}</option>
              <option value="epub">{hl.epubFormat}</option>
            </select>
          </div>

        </div>

        {/* Right Sort Dropdown */}
        <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-500 font-medium">{t.sections.sortBy}:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent font-bold text-stone-800 outline-hidden cursor-pointer"
          >
            <option value="popular">{t.sections.sortPopular}</option>
            <option value="views">{t.sections.sortViews}</option>
            <option value="latest">{t.sections.sortLatest}</option>
            <option value="year">{t.sections.sortYear}</option>
            <option value="title">{t.sections.sortTitle}</option>
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
          <div className="py-20 text-center bg-white rounded-3xl border border-stone-200/80 mt-6 shadow-xs p-8 max-w-lg mx-auto">
            <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-900 mb-1 font-hindi-serif">
              {hl.noWorksFound}
            </h3>
            <p className="text-xs text-stone-500 mb-5 leading-relaxed">
              {hl.noWorksDesc}
            </p>
            <button
              onClick={() => {
                setSearchFilter('');
                setLanguageFilter('all');
                setEraFilter('all');
                setFormatFilter('all');
              }}
              className="px-5 py-2 bg-[#1d4ed8] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#1e40af] transition cursor-pointer"
            >
              {hl.resetFilters}
            </button>
          </div>
        )}
      </div>

      {/* Delete Sub-Genre Confirmation Modal (Admin Only) */}
      {showDeleteSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 font-rekhta-serif mb-1">
              {t.admin.deleteBtn}
            </h3>
            <p className="text-xs text-stone-600 mb-5 leading-relaxed">
              {t.admin.deleteConfirm}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteSubModal(false)}
                className="px-4 py-2 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
              >
                {lang === 'hi' ? 'रद्द करें' : (lang === 'ur' ? 'منسوخ' : 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleDeleteSubGenre}
                disabled={isDeletingSub}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                {isDeletingSub ? '...' : t.admin.deleteBtn}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
