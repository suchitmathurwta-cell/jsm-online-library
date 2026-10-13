import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FolderOpen,
  ChevronRight,
  ArrowRight,
  Plus,
  Layers,
  Trash2,
  Edit2,
  X,
  Check,
  AlertTriangle
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import { createSubgenre, deleteSubgenre, updateSubgenre } from '../services/supabaseApi';
import BookCard from '../components/BookCard';
import { AdminOnly } from '../components/AdminGuard';
import { containerVariants, itemVariants } from '../components/BentoGrid';
import { getCategoryGraphic } from '../data/categoryGraphics';

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

  const category = categories.find((c) => c.id === categorySlug) || {
    id: categorySlug,
    name_hi: categorySlug,
    name_en: categorySlug,
    genres: []
  };

  const genre = (category.genres || []).find((g) => g.id === genreSlug) || {
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
  const genreBooks = books.filter((b) => {
    const bg = (b.genre || '').toLowerCase();
    return (
      b.category === categorySlug &&
      (bg.includes(genreSlug.toLowerCase()) || bg.includes(genre.name_en?.toLowerCase() || ''))
    );
  });

  const handleCreateSubGenre = async (e) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    setIsSubmitting(true);
    try {
      const subId =
        newSubName
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || 'sg-' + Date.now();
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
  const graphic = getCategoryGraphic(categorySlug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fadeIn">
      {/* Layer 3 Breadcrumbs: Home > Category > Genre */}
      <Breadcrumbs
        lang={lang}
        t={t}
        items={[
          { label: categoryTitle, url: `/category/${categorySlug}` },
          { label: genreTitle }
        ]}
      />

      {/* Layer 3 Header: Mugen Studio Presentation */}
      <div className="mt-4 p-6 sm:p-8 rounded-[24px] bg-[#141414] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-white relative overflow-hidden">
        {graphic && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center z-0 opacity-25"
              style={{ backgroundImage: `url(${graphic.image || graphic.remoteFallback})` }}
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${graphic.accentGradient || 'from-black via-black/80 to-transparent'} z-5`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-5 pointer-events-none" />
          </>
        )}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-white rounded-full inline-block" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400">
                {hl.layer3Badge || 'LEVEL 3: SUB-GENRES'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold font-sans tracking-[-0.03em] text-white mt-1">
              {genreTitle}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans mt-1">
              {genreDesc || hl.layer3Sub}
            </p>
          </div>

          <AdminOnly>
            <button
              type="button"
              onClick={() => setShowCreateSub(!showCreateSub)}
              className="px-4 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-mono uppercase tracking-wider font-semibold rounded-full shadow-xs flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{hl.addSubgenreBtn || '+ ADD SUB-GENRE'}</span>
            </button>
          </AdminOnly>
        </div>

        {/* Inline Create Sub-genre Form (Admin Only) */}
        {showCreateSub && (
          <AdminOnly>
            <form
              onSubmit={handleCreateSubGenre}
              className="mb-4 p-3 bg-black/50 rounded-2xl border border-white/[0.08] flex items-center gap-2 animate-fadeIn"
            >
              <input
                type="text"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                placeholder={
                  lang === 'hi'
                    ? 'नए उप-वर्ग का नाम...'
                    : lang === 'ur'
                    ? 'نئی ذیلی صنف کا نام...'
                    : 'Enter new sub-genre title...'
                }
                className="flex-1 px-3 py-2 text-xs border border-white/[0.1] rounded-xl outline-hidden focus:border-white bg-black/60 text-white placeholder-zinc-500"
                autoFocus
              />
              <button
                type="submit"
                disabled={isSubmitting || !newSubName.trim()}
                className="px-4 py-2 bg-white text-black text-xs font-mono uppercase tracking-wider font-semibold rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? '...' : '+ Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateSub(false)}
                className="px-3 py-2 text-xs font-mono uppercase text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </form>
          </AdminOnly>
        )}

        {/* Horizontal Quick-Filter Pills for Sub-genres */}
        {subgenres.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mr-1">
              INDEX:
            </span>
            {subgenres.map((sg) => {
              const sgTitle = sg[`name_${lang}`] || sg.name_hi || sg.name_en;
              return (
                <button
                  key={sg.id}
                  onClick={() => navigate(`/category/${categorySlug}/${genreSlug}/${sg.id}`)}
                  className="px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>{sgTitle}</span>
                  <span className="text-[10px] font-mono opacity-50">[{sg.count || 0}]</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Layer 3 Sub-Genres: Asymmetrical Bento Grid */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-white rounded-full inline-block" />
            <h2 className="text-xs font-mono uppercase tracking-[0.25em] text-white">
              {hl.layer3Heading || 'SUB-GENRES SPECTRUM'} — {genreTitle}
            </h2>
          </div>
          <span className="text-xs text-zinc-500 font-mono hidden sm:inline tracking-wider">
            [{subgenres.length} SUB-DIVISIONS]
          </span>
        </div>

        {subgenres.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {subgenres.map((sg, idx) => {
              const sgTitle = sg[`name_${lang}`] || sg.name_hi || sg.name_en;
              const isHeroBento = idx === 0 && subgenres.length > 2;

              return (
                <motion.div
                  key={sg.id}
                  variants={itemVariants}
                  onClick={() => navigate(`/category/${categorySlug}/${genreSlug}/${sg.id}`)}
                  className={`group relative p-6 rounded-[24px] bg-[#141414] border border-white/[0.08] hover:border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                    isHeroBento ? 'sm:col-span-2' : 'col-span-1'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
                        {sg.count || 0} {t.sections?.worksUnit || 'TREATISES'}
                      </span>

                      {/* Admin Only: Edit & Delete */}
                      <AdminOnly>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => openEditModal(sg, e)}
                            title={t.admin?.editBtn || 'Edit'}
                            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => openDeleteModal(sg, e)}
                            title={t.admin?.deleteBtn || 'Delete'}
                            className="p-1 rounded-md text-zinc-400 hover:text-red-400 hover:bg-red-950/40 transition cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </AdminOnly>
                    </div>

                    <h3 className="text-base font-bold text-white font-sans tracking-tight leading-snug">
                      {sgTitle}
                    </h3>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono uppercase tracking-wider text-white">
                    <span>{hl.layer3Browse || 'Browse Catalog'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="py-14 text-center bg-[#141414] rounded-[24px] border border-white/[0.08] p-8 max-w-md mx-auto shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
            <FolderOpen className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-white font-sans">{hl.noWorksFound || 'No sub-genres cataloged yet'}</p>
            <p className="text-xs text-zinc-400 mt-1 mb-4 font-sans">{hl.noWorksDesc || 'Add a sub-genre to catalog treatises in detail.'}</p>
            <AdminOnly>
              <button
                onClick={() => setShowCreateSub(true)}
                className="px-4 py-2 bg-white text-black text-xs font-mono uppercase tracking-wider font-semibold rounded-full shadow-xs cursor-pointer hover:bg-zinc-200"
              >
                {hl.addSubgenreBtn || '+ Add Sub-Genre'}
              </button>
            </AdminOnly>
          </div>
        )}
      </div>

      {/* Featured Works under this Genre */}
      {genreBooks.length > 0 && (
        <div className="mt-14 pt-8 border-t border-black/[0.06]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#111111] rounded-full inline-block"></span>
              <h2 className="text-sm font-mono uppercase tracking-wider text-[#111111]">
                {hl.layer2WorksHeading || 'Treatises in'} {genreTitle}
              </h2>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              {genreBooks.length} works
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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

      {/* Edit Sub-genre Modal */}
      {editingSub && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-black/[0.08] animate-scaleUp">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100">
              <h3 className="text-base font-bold text-[#111111] font-sans">
                Edit Sub-Genre
              </h3>
              <button
                onClick={() => setEditingSub(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSub} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-500 mb-1 font-mono uppercase text-[10px]">
                  Name (Hindi/Devanagari)
                </label>
                <input
                  type="text"
                  value={editSubHi}
                  onChange={(e) => setEditSubHi(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl outline-hidden focus:border-black font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-500 mb-1 font-mono uppercase text-[10px]">
                  Name (English/Roman)
                </label>
                <input
                  type="text"
                  value={editSubEn}
                  onChange={(e) => setEditSubEn(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl outline-hidden focus:border-black font-sans"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setEditingSub(null)}
                  className="px-4 py-2 border border-zinc-200 rounded-full font-medium text-zinc-600 hover:text-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditingSub}
                  className="px-5 py-2 bg-[#111111] hover:bg-black text-white font-medium rounded-full cursor-pointer disabled:opacity-50"
                >
                  {isEditingSub ? '...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Sub-genre Modal */}
      {deletingSub && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-black/[0.08] text-center animate-scaleUp">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#111111] font-sans">
              Delete Sub-Genre
            </h3>
            <p className="text-xs text-zinc-500 mt-2 font-sans">
              Are you sure you want to delete <span className="font-bold text-[#111111]">"{deletingSub.name_hi || deletingSub.name_en}"</span>?
            </p>
            <div className="flex justify-center gap-2 mt-5">
              <button
                onClick={() => setDeletingSub(null)}
                className="px-4 py-2 border border-zinc-200 rounded-full text-xs font-medium text-zinc-600 hover:text-black cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubGenre}
                disabled={isDeletingSub}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-full cursor-pointer disabled:opacity-50"
              >
                {isDeletingSub ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
