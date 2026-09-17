import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FolderOpen,
  ChevronRight,
  ArrowRight,
  Plus,
  Layers,
  Trash2,
  Edit2,
  X,
  Check
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import { createSubgenre, deleteSubgenre, updateSubgenre } from '../services/supabaseApi';
import BookCard from '../components/BookCard';
import { AdminOnly } from '../components/AdminGuard';

export default function SubGenresPage({
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
  const { categorySlug, genreSlug } = useParams();
  const navigate = useNavigate();
  const [showCreateSub, setShowCreateSub] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Sub-genre State
  const [editingSub, setEditingSub] = useState(null);
  const [editSubHi, setEditSubHi] = useState('');
  const [editSubEn, setEditSubEn] = useState('');
  const [isEditingSub, setIsEditingSub] = useState(false);

  // Delete Sub-genre State
  const [deletingSub, setDeletingSub] = useState(null);
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

  const categoryTitle = category[`name_${lang}`] || category.name_hi || category.name_en;
  const genreTitle = genre[`name_${lang}`] || genre.name_hi || genre.name_en;
  const genreDesc = genre[`description_${lang}`] || genre.description_hi || genre.description_en;
  const subgenres = genre.subgenres || [];

  // Books under this genre
  const genreBooks = books.filter(b => {
    const bg = (b.genre || '').toLowerCase();
    return b.category === categorySlug && (bg.includes(genreSlug.toLowerCase()) || bg.includes(genre.name_en?.toLowerCase() || ''));
  });

  const handleCreateSubGenre = async (e) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    setIsSubmitting(true);
    try {
      const subId = newSubName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || ('sg-' + Date.now());
      await createSubgenre({
        id: subId,
        genre_id: genreSlug,
        category_id: categorySlug,
        name_hi: newSubName.trim(),
        name_en: newSubName.trim()
      });
      setNewSubName('');
      setShowCreateSub(false);
      if (onRefreshCategories) await onRefreshCategories();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubGenre = async () => {
    if (!deletingSub) return;
    setIsDeletingSub(true);
    try {
      await deleteSubgenre(categorySlug, genreSlug, deletingSub.id);
      setDeletingSub(null);
      if (onRefreshCategories) await onRefreshCategories();
    } catch (err) {
      alert('Error deleting sub-genre: ' + err.message);
    } finally {
      setIsDeletingSub(false);
    }
  };

  const handleSaveEditSub = async (e) => {
    e.preventDefault();
    if (!editingSub) return;
    setIsEditingSub(true);
    try {
      await updateSubgenre(categorySlug, genreSlug, editingSub.id, {
        name_hi: editSubHi.trim(),
        name_en: editSubEn.trim()
      });
      setEditingSub(null);
      if (onRefreshCategories) await onRefreshCategories();
    } catch (err) {
      alert('Error updating sub-genre: ' + err.message);
    } finally {
      setIsEditingSub(false);
    }
  };

  const openEditModal = (sg, e) => {
    e.stopPropagation();
    setEditingSub(sg);
    setEditSubHi(sg.name_hi || '');
    setEditSubEn(sg.name_en || '');
  };

  const openDeleteModal = (sg, e) => {
    e.stopPropagation();
    setDeletingSub(sg);
  };

  const hl = t.hierarchyLayers || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fadeIn">
      {/* Layer 3 Breadcrumbs: Home > Category > Genre */}
      <Breadcrumbs
        items={[
          { label: categoryTitle, url: `/category/${categorySlug}` },
          { label: genreTitle }
        ]}
      />

      {/* Top Bar with Horizontal Pills */}
      <div className="mt-4 p-4 sm:p-5 rounded-3xl bg-stone-50/90 border border-stone-200/90 shadow-xs">
        
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1d4ed8]"></div>
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
              <span>{hl.layer3Badge}</span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-[#1d4ed8] font-bold normal-case text-sm">
                {categoryTitle} › {genreTitle}
              </span>
            </span>
          </div>

          <AdminOnly>
            <button
              type="button"
              onClick={() => setShowCreateSub(!showCreateSub)}
              className="px-3.5 py-1.5 bg-white hover:bg-blue-50 text-[#1d4ed8] hover:text-[#1e40af] text-xs font-bold rounded-xl border border-blue-200/80 shadow-2xs flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{hl.addSubgenreBtn}</span>
            </button>
          </AdminOnly>
        </div>

        {/* Inline Create Sub-genre Form (Admin Only) */}
        {showCreateSub && (
          <AdminOnly>
            <form onSubmit={handleCreateSubGenre} className="mb-4 p-3 bg-white rounded-2xl border border-blue-200 flex items-center gap-2 shadow-xs animate-fadeIn">
              <input
                type="text"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                placeholder={lang === 'hi' ? 'नए उप-वर्ग का नाम दर्ज करें...' : (lang === 'ur' ? 'نئی ذیلی صنف کا نام درج کریں...' : 'Enter new sub-genre title...')}
                className="flex-1 px-3 py-1.5 text-xs border border-stone-300 rounded-lg outline-hidden focus:border-[#1d4ed8]"
                autoFocus
              />
              <button
                type="submit"
                disabled={isSubmitting || !newSubName.trim()}
                className="px-4 py-1.5 bg-[#1d4ed8] text-white text-xs font-bold rounded-lg transition disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? '...' : (lang === 'hi' ? '+ जोड़ें' : (lang === 'ur' ? '+ شامل کریں' : '+ Create'))}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateSub(false)}
                className="px-3 py-1.5 text-stone-500 text-xs cursor-pointer"
              >
                {lang === 'hi' ? 'रद्द करें' : (lang === 'ur' ? 'منسوخ' : 'Cancel')}
              </button>
            </form>
          </AdminOnly>
        )}

        {/* Horizontal Pill Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active All Pill */}
          <button
            type="button"
            className="px-4 py-2 rounded-2xl text-xs font-bold bg-[#b45309] text-white shadow-xs flex items-center gap-1.5 border border-[#b45309]"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? `समग्र ${genreTitle}` : (lang === 'ur' ? `تمام ${genreTitle}` : `All ${genreTitle}`)}</span>
          </button>

          {/* Subgenre Pills */}
          {subgenres.map((sg) => {
            const sgTitle = sg[`name_${lang}`] || sg.name_hi || sg.name_en;
            return (
              <div key={sg.id} className="inline-flex items-center group">
                <button
                  type="button"
                  onClick={() => navigate(`/category/${categorySlug}/${genreSlug}/${sg.id}`)}
                  className="px-3.5 py-2 rounded-2xl text-xs font-semibold bg-amber-50/80 hover:bg-amber-100/90 text-amber-950 border border-amber-200/80 transition cursor-pointer shadow-2xs hover:shadow-xs"
                >
                  <span>{sgTitle}</span>
                </button>
                <AdminOnly>
                  <button
                    type="button"
                    onClick={(e) => openDeleteModal(sg, e)}
                    title={t.admin.deleteBtn}
                    className="ml-1 p-1 rounded-full text-amber-700 hover:text-red-700 hover:bg-red-100 transition cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </AdminOnly>
              </div>
            );
          })}
        </div>

      </div>

      {/* Layer 3: Sub-Genres Grid */}
      <div className="mt-8">
        <div className="mb-6">
          <h2 className="text-xl font-extrabold text-stone-900 font-rekhta-serif">
            {hl.layer3Heading} {genreTitle}
          </h2>
          <p className="text-xs text-stone-500 mt-1 font-normal">
            {genreDesc || hl.layer3Sub}
          </p>
        </div>

        {subgenres.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {subgenres.map((sg) => {
              const sgTitle = sg[`name_${lang}`] || sg.name_hi || sg.name_en;
              return (
                <div
                  key={sg.id}
                  onClick={() => navigate(`/category/${categorySlug}/${genreSlug}/${sg.id}`)}
                  className="group relative p-5 rounded-3xl bg-white border border-stone-200 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1d4ed8] border border-blue-200">
                        {sg.count || 0} {t.sections.worksUnit}
                      </span>
                      
                      {/* Admin Only: Edit & Delete */}
                      <AdminOnly>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => openEditModal(sg, e)}
                            title={t.admin.editBtn}
                            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => openDeleteModal(sg, e)}
                            title={t.admin.deleteBtn}
                            className="p-1 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </AdminOnly>
                    </div>

                    <h3 className="text-base font-bold text-stone-900 font-hindi-serif group-hover:text-[#1d4ed8] transition-colors">
                      {sgTitle}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-[#1d4ed8] font-bold">
                    <span>{hl.layer3Browse}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center bg-white rounded-3xl border border-stone-200 p-8 max-w-md mx-auto">
            <FolderOpen className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-stone-700">{hl.noWorksFound}</p>
            <p className="text-xs text-stone-500 mt-1 mb-4">{hl.noWorksDesc}</p>
            <AdminOnly>
              <button
                onClick={() => setShowCreateSub(true)}
                className="px-4 py-2 bg-[#1d4ed8] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                {hl.addSubgenreBtn}
              </button>
            </AdminOnly>
          </div>
        )}
      </div>

      {/* Catalog Books under this Genre */}
      {genreBooks.length > 0 && (
        <div className="mt-14 pt-10 border-t border-stone-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-1 bg-[#1d4ed8] rounded-full"></div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 font-rekhta-serif">
                {hl.featuredTreatises} {genreTitle}
              </h2>
            </div>
            <span className="text-xs text-stone-500 font-medium">
              {genreBooks.length} {t.sections.worksUnit}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
            {genreBooks.map((book) => (
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

      {/* Edit Sub-Genre Modal (Admin Only) */}
      {editingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900 font-rekhta-serif">
                {t.admin.editBtn}
              </h3>
              <button
                onClick={() => setEditingSub(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSub} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  {lang === 'hi' ? 'उप-विधा का नाम (हिंदी)' : (lang === 'ur' ? 'ذیلی صنف کا نام (ہندی)' : 'Sub-Genre Name (Hindi)')}
                </label>
                <input
                  type="text"
                  value={editSubHi}
                  onChange={(e) => setEditSubHi(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl outline-hidden focus:border-[#1d4ed8]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  {lang === 'hi' ? 'उप-विधा का नाम (अंग्रेज़ी)' : (lang === 'ur' ? 'ذیلی صنف کا نام (انگریزی)' : 'Sub-Genre Name (English)')}
                </label>
                <input
                  type="text"
                  value={editSubEn}
                  onChange={(e) => setEditSubEn(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl outline-hidden focus:border-[#1d4ed8]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingSub(null)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-medium cursor-pointer"
                >
                  {lang === 'hi' ? 'रद्द करें' : (lang === 'ur' ? 'منسوخ' : 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isEditingSub}
                  className="px-4 py-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  {isEditingSub ? '...' : (lang === 'hi' ? 'सुरक्षित करें' : (lang === 'ur' ? 'محفوظ کریں' : 'Save Changes'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Sub-Genre Modal (Admin Only) */}
      {deletingSub && (
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
                onClick={() => setDeletingSub(null)}
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
