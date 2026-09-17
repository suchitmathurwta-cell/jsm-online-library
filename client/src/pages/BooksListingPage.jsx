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

export default function BooksListingPage({
  t,
  lang,
  categories = [],
  onSelectBook,
  onOpenReader,
  onDownloadBook,
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fadeIn">
      {/* Layer 4 Breadcrumb: Home > Category > Genre > Sub-genre */}
      <Breadcrumbs
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
              <span>LAYER 4 : DEDICATED SUB-GENRE CATALOG</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-rekhta-serif tracking-tight text-stone-900 flex items-center gap-3">
              <span>{subgenreTitle}</span>
              <button
                onClick={() => setShowDeleteSubModal(true)}
                title="Delete this Sub-Genre"
                className="p-1.5 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-normal leading-relaxed">
              Curated digital archive, scholarly editions, and preserved treatises classified under {subgenreTitle} ({categoryTitle} › {genreTitle}).
            </p>
          </div>

          <div className="bg-stone-50 border border-stone-200 px-5 py-3 rounded-2xl text-center self-start md:self-auto shrink-0 shadow-2xs">
            <span className="text-xl font-bold text-[#1d4ed8] block">{books.length}</span>
            <span className="text-xs text-stone-500 font-medium">Treatises Preserved</span>
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
              placeholder="Search in this sub-genre..."
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
              <option value="all">All Languages</option>
              <option value="hindi">Hindi</option>
              <option value="urdu">Urdu</option>
              <option value="english">English</option>
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
              <option value="all">All Eras</option>
              <option value="contemporary">Contemporary Era (2000–Present)</option>
              <option value="post-independence">Post-Independence (1947–1980)</option>
              <option value="progressive">Progressive Era (1930–1947)</option>
              <option value="chhayavad">Chhayavad (1918–1936)</option>
              <option value="medieval">Medieval / Bhakti</option>
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
              <option value="all">All Formats</option>
              <option value="pdf">PDF E-Books</option>
              <option value="epub">EPUB / Text</option>
            </select>
          </div>

        </div>

        {/* Right Sort Dropdown */}
        <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-500 font-medium">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent font-bold text-stone-800 outline-hidden cursor-pointer"
          >
            <option value="popular">Popular / Most Read</option>
            <option value="views">Highest Views</option>
            <option value="latest">Latest Digitized</option>
            <option value="year">Publication Year</option>
            <option value="title">Title (A-Z)</option>
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
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-stone-200/80 mt-6 shadow-xs p-8 max-w-lg mx-auto">
            <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-900 mb-1 font-hindi-serif">
              No Works Found in this Sub-Genre
            </h3>
            <p className="text-xs text-stone-500 mb-5 leading-relaxed">
              No treatises currently match the active filters under {subgenreTitle}. Try clearing your filters or upload a relevant e-book.
            </p>
            <button
              onClick={() => {
                setSearchFilter('');
                setLanguageFilter('all');
                setEraFilter('all');
                setFormatFilter('all');
              }}
              className="px-5 py-2 bg-[#1d4ed8] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#1e40af] transition"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Delete Sub-Genre Confirmation Modal */}
      {showDeleteSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 font-rekhta-serif mb-1">
              Delete Sub-Genre?
            </h3>
            <p className="text-xs text-stone-600 mb-5 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-stone-900">"{subgenreTitle}"</span>? You will be navigated back to the Genre view.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteSubModal(false)}
                className="px-4 py-2 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubGenre}
                disabled={isDeletingSub}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition disabled:opacity-50"
              >
                {isDeletingSub ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
