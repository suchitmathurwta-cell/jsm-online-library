import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FolderTree,
  ChevronRight,
  ArrowRight,
  Plus,
  Layers,
  Trash2,
  Edit2,
  AlertTriangle,
  X,
  Check
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import { createGenre, deleteGenre, updateGenre } from '../services/supabaseApi';
import BookCard from '../components/BookCard';
import { AdminOnly } from '../components/AdminGuard';

export default function CategoryGenresPage({
  t,
  lang = 'hi',
  categories = [],
  books = [],
  onSelectBook,
  onOpenReader,
  onDownloadBook,
  onEditBook,
  onRefreshCategories
}) {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const [showCreateGenre, setShowCreateGenre] = useState(false);
  const [newGenreName, setNewGenreName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Genre State
  const [editingGenre, setEditingGenre] = useState(null);
  const [editNameHi, setEditNameHi] = useState('');
  const [editNameEn, setEditNameEn] = useState('');
  const [editDescHi, setEditDescHi] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Delete Confirm State
  const [deletingGenre, setDeletingGenre] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const category = categories.find(c => c.id === categorySlug) || {
    id: categorySlug,
    name_hi: categorySlug,
    name_en: categorySlug,
    genres: []
  };

  const categoryTitle = category[`name_${lang}`] || category.name_hi || category.name_en;
  const categorySub = category[`subtitle_${lang}`] || category.subtitle_hi || category.subtitle_en;
  const genres = category.genres || [];

  // Books in this category
  const categoryBooks = books.filter(b => b.category === categorySlug);

  const handleCreateGenre = async (e) => {
    e.preventDefault();
    if (!newGenreName.trim()) return;
    setIsSubmitting(true);
    try {
      const genreId = newGenreName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || ('genre-' + Date.now());
      await createGenre({
        id: genreId,
        category_id: categorySlug,
        name_hi: newGenreName.trim(),
        name_en: newGenreName.trim(),
        description_hi: newGenreName.trim() + ' से संबंधित विशिष्ट साहित्यिक विधा',
        description_en: 'Curated works on ' + newGenreName.trim()
      });
      setNewGenreName('');
      setShowCreateGenre(false);
      if (onRefreshCategories) await onRefreshCategories();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGenre = async () => {
    if (!deletingGenre) return;
    setIsDeleting(true);
    try {
      await deleteGenre(categorySlug, deletingGenre.id);
      setDeletingGenre(null);
      if (onRefreshCategories) await onRefreshCategories();
    } catch (err) {
      alert('Error deleting genre: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEditGenre = async (e) => {
    e.preventDefault();
    if (!editingGenre) return;
    setIsEditing(true);
    try {
      await updateGenre(categorySlug, editingGenre.id, {
        name_hi: editNameHi.trim(),
        name_en: editNameEn.trim(),
        description_hi: editDescHi.trim()
      });
      setEditingGenre(null);
      if (onRefreshCategories) await onRefreshCategories();
    } catch (err) {
      alert('Error updating genre: ' + err.message);
    } finally {
      setIsEditing(false);
    }
  };

  const openEditModal = (genre, e) => {
    e.stopPropagation();
    setEditingGenre(genre);
    setEditNameHi(genre.name_hi || '');
    setEditNameEn(genre.name_en || '');
    setEditDescHi(genre.description_hi || genre.description_en || '');
  };

  const openDeleteModal = (genre, e) => {
    e.stopPropagation();
    setDeletingGenre(genre);
  };

  const hl = t.hierarchyLayers || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fadeIn">
      {/* Layer 2 Breadcrumb */}
      <Breadcrumbs lang={lang} t={t} items={[{ label: categoryTitle }]} />

      {/* Layer 2 Header Banner */}
      <div className="mt-3 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-indigo-950 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold border border-white/10">
              <Layers className="w-3.5 h-3.5" />
              <span>{hl.layer2Badge}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-rekhta-serif tracking-tight text-white flex items-center gap-3">
              <span>{categoryTitle}</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 font-normal leading-relaxed">
              {categorySub || hl.layer2Sub}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-2xl text-center">
              <span className="text-lg font-bold text-amber-300">{genres.length}</span>
              <span className="text-xs text-stone-300 block">{t.admin.genresCount}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-2xl text-center">
              <span className="text-lg font-bold text-white">{categoryBooks.length}</span>
              <span className="text-xs text-stone-300 block">{t.admin.worksCount}</span>
            </div>
            
            <AdminOnly>
              <button
                onClick={() => setShowCreateGenre(!showCreateGenre)}
                className="px-4 py-2.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-md transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{hl.addGenreBtn}</span>
              </button>
            </AdminOnly>
          </div>
        </div>

        {/* Inline Create Genre Form (Admin Only) */}
        {showCreateGenre && (
          <AdminOnly>
            <form onSubmit={handleCreateGenre} className="mt-6 pt-5 border-t border-white/10 flex items-center gap-2 max-w-xl animate-fadeIn">
              <input
                type="text"
                value={newGenreName}
                onChange={(e) => setNewGenreName(e.target.value)}
                placeholder={lang === 'hi' ? 'नई विधा का नाम दर्ज करें...' : (lang === 'ur' ? 'نئی صنف کا نام درج کریں...' : 'Enter new genre name...')}
                className="flex-1 px-4 py-2 text-xs bg-white text-stone-900 rounded-xl outline-hidden font-medium"
                autoFocus
              />
              <button
                type="submit"
                disabled={isSubmitting || !newGenreName.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? '...' : (lang === 'hi' ? '+ जोड़ें' : (lang === 'ur' ? '+ شامل کریں' : '+ Create'))}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateGenre(false)}
                className="px-3 py-2 text-stone-300 hover:text-white text-xs cursor-pointer"
              >
                {lang === 'hi' ? 'रद्द करें' : (lang === 'ur' ? 'منسوخ' : 'Cancel')}
              </button>
            </form>
          </AdminOnly>
        )}
      </div>

      {/* Layer 2: Genres Grid */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-1 bg-[#1d4ed8] rounded-full"></div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 font-rekhta-serif">
              {hl.layer2Heading} {categoryTitle}
            </h2>
          </div>
          <span className="text-xs text-stone-500 font-medium hidden sm:inline">
            {hl.layer2Sub}
          </span>
        </div>

        {genres.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {genres.map((g) => {
              const gTitle = g[`name_${lang}`] || g.name_hi || g.name_en;
              const gDesc = g[`description_${lang}`] || g.description_hi || g.description_en;
              const subCount = g.subgenres_count || (g.subgenres && g.subgenres.length) || 0;

              return (
                <div
                  key={g.id}
                  onClick={() => navigate(`/category/${categorySlug}/${g.id}`)}
                  className="group relative p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1d4ed8] flex items-center justify-center border border-blue-100 shadow-2xs group-hover:bg-[#1d4ed8] group-hover:text-white transition-colors">
                        <FolderTree className="w-5 h-5" />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                          {subCount} {lang === 'hi' ? 'उप-विधाएँ' : (lang === 'ur' ? 'ذیلی اصناف' : 'Sub-Genres')}
                        </span>
                        
                        {/* Admin Only Actions: Edit & Delete */}
                        <AdminOnly>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => openEditModal(g, e)}
                              title={t.admin.editBtn}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => openDeleteModal(g, e)}
                              title={t.admin.deleteBtn}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </AdminOnly>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-stone-900 font-hindi-serif group-hover:text-[#1d4ed8] transition-colors leading-snug">
                      {gTitle}
                    </h3>

                    <p className="text-xs text-stone-600 mt-2.5 leading-relaxed line-clamp-2">
                      {gDesc}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-500">
                      {g.count || 0} {hl.layer2Works}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1d4ed8] group-hover:translate-x-1 transition-transform">
                      <span>{hl.layer2Explore}</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center bg-white rounded-3xl border border-stone-200 p-8 max-w-lg mx-auto">
            <FolderTree className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-stone-700">{hl.noWorksFound}</p>
            <p className="text-xs text-stone-500 mt-1 mb-4">{hl.noWorksDesc}</p>
            <AdminOnly>
              <button
                onClick={() => setShowCreateGenre(true)}
                className="px-4 py-2 bg-[#1d4ed8] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                {hl.addGenreBtn}
              </button>
            </AdminOnly>
          </div>
        )}
      </div>

      {/* Featured Books in this Category */}
      {categoryBooks.length > 0 && (
        <div className="mt-14 pt-10 border-t border-stone-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-1 bg-[#1d4ed8] rounded-full"></div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 font-rekhta-serif">
                {hl.featuredTreatises} {categoryTitle}
              </h2>
            </div>
            <span className="text-xs text-stone-500 font-medium">
              {categoryBooks.length} {t.sections.worksUnit}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
            {categoryBooks.slice(0, 6).map((book) => (
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
        </div>
      )}

      {/* Edit Genre Modal (Admin Only) */}
      {editingGenre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900 font-rekhta-serif">
                {t.admin.editBtn}
              </h3>
              <button
                onClick={() => setEditingGenre(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditGenre} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  {lang === 'hi' ? 'विधा का नाम (हिंदी)' : (lang === 'ur' ? 'صنف کا نام (ہندی)' : 'Genre Name (Hindi)')}
                </label>
                <input
                  type="text"
                  value={editNameHi}
                  onChange={(e) => setEditNameHi(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl outline-hidden focus:border-[#1d4ed8]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  {lang === 'hi' ? 'विधा का नाम (अंग्रेज़ी)' : (lang === 'ur' ? 'صنف کا نام (انگریزی)' : 'Genre Name (English)')}
                </label>
                <input
                  type="text"
                  value={editNameEn}
                  onChange={(e) => setEditNameEn(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl outline-hidden focus:border-[#1d4ed8]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  {t.details.description}
                </label>
                <textarea
                  value={editDescHi}
                  onChange={(e) => setEditDescHi(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl outline-hidden focus:border-[#1d4ed8]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingGenre(null)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-medium cursor-pointer"
                >
                  {lang === 'hi' ? 'रद्द करें' : (lang === 'ur' ? 'منسوخ' : 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="px-4 py-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  {isEditing ? '...' : (lang === 'hi' ? 'सुरक्षित करें' : (lang === 'ur' ? 'محفوظ کریں' : 'Save Changes'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Admin Only) */}
      {deletingGenre && (
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
                onClick={() => setDeletingGenre(null)}
                className="px-4 py-2 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
              >
                {lang === 'hi' ? 'रद्द करें' : (lang === 'ur' ? 'منسوخ' : 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleDeleteGenre}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? '...' : t.admin.deleteBtn}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
