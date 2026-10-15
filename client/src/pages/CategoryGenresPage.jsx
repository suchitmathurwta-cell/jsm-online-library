import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
import { containerVariants, itemVariants } from '../components/BentoGrid';
import { getCategoryGraphic } from '../data/categoryGraphics';

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

  const category = categories.find((c) => c.id === categorySlug) || {
    id: categorySlug,
    name_hi: categorySlug,
    name_en: categorySlug,
    genres: []
  };

  const categoryTitle = category[`name_${lang}`] || category.name_hi || category.name_en;
  const categorySub = category[`subtitle_${lang}`] || category.subtitle_hi || category.subtitle_en;
  const genres = category.genres || [];

  // Books in this category
  const categoryBooks = books.filter((b) => b.category === categorySlug);

  const handleCreateGenre = async (e) => {
    e.preventDefault();
    if (!newGenreName.trim()) return;
    setIsSubmitting(true);
    try {
      const genreId =
        newGenreName
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || 'genre-' + Date.now();
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

  const graphic = getCategoryGraphic(categorySlug);

  return (
    <div className="w-full pb-12 animate-fadeIn">
      {/* Layer 2 Breadcrumb */}
      <Breadcrumbs lang={lang} t={t} items={[{ label: categoryTitle }]} />

      {/* Layer 2 Header Banner: Mugen Studio Presentation */}
      <div className="mt-4 p-6 sm:p-8 rounded-[24px] bg-[#141414] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6)] relative overflow-hidden">
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] text-zinc-300 text-xs font-mono uppercase tracking-wider border border-white/[0.08]">
              <Layers className="w-3.5 h-3.5" />
              <span>{hl.layer2Badge || 'LEVEL 2: GENRES'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold font-sans tracking-[-0.03em] text-white flex items-center gap-3">
              <span>{categoryTitle}</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
              {categorySub || hl.layer2Sub}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <div className="bg-black/50 border border-white/[0.08] px-4 py-2 rounded-2xl text-center">
              <span className="text-lg font-bold font-mono text-white">{genres.length}</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">{t.admin?.genresCount || 'GENRES'}</span>
            </div>
            <div className="bg-black/50 border border-white/[0.08] px-4 py-2 rounded-2xl text-center">
              <span className="text-lg font-bold font-mono text-white">{categoryBooks.length}</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">{t.admin?.worksCount || 'WORKS'}</span>
            </div>

            <AdminOnly>
              <button
                onClick={() => setShowCreateGenre(!showCreateGenre)}
                className="px-4 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-mono uppercase tracking-wider font-semibold rounded-full flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{hl.addGenreBtn || '+ ADD GENRE'}</span>
              </button>
            </AdminOnly>
          </div>
        </div>

        {/* Inline Create Genre Form (Admin Only) */}
        {showCreateGenre && (
          <AdminOnly>
            <form
              onSubmit={handleCreateGenre}
              className="mt-6 pt-5 border-t border-white/[0.08] flex flex-col sm:flex-row gap-2.5 items-center animate-fadeIn"
            >
              <input
                type="text"
                value={newGenreName}
                onChange={(e) => setNewGenreName(e.target.value)}
                placeholder={
                  lang === 'hi'
                    ? 'नई साहित्यिक विधा का नाम...'
                    : lang === 'ur'
                    ? 'نئی ادبی صنف کا نام...'
                    : 'Enter new genre title...'
                }
                className="w-full sm:flex-1 px-4 py-2 text-xs bg-black/60 border border-white/[0.1] text-white rounded-xl outline-hidden focus:border-white"
                autoFocus
              />
              <button
                type="submit"
                disabled={isSubmitting || !newGenreName.trim()}
                className="w-full sm:w-auto px-5 py-2 bg-white text-black text-xs font-mono uppercase tracking-wider font-semibold rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? '...' : '+ Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateGenre(false)}
                className="px-3 py-2 text-xs font-mono uppercase text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </form>
          </AdminOnly>
        )}
      </div>

      {/* Layer 2 Genres: Asymmetrical Bento Grid */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-white rounded-full inline-block"></span>
            <h2 className="text-xs font-mono uppercase tracking-[0.25em] text-white">
              {hl.layer2Heading || 'GENRES CATALOG'} — {categoryTitle}
            </h2>
          </div>
          <span className="text-xs text-zinc-500 font-mono hidden sm:inline tracking-wider">
            [{genres.length} GENRES REGISTERED]
          </span>
        </div>

        {genres.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {genres.map((g, idx) => {
              const gTitle = g[`name_${lang}`] || g.name_hi || g.name_en;
              const gDesc = g[`description_${lang}`] || g.description_hi || g.description_en;
              const subCount = g.subgenres_count || (g.subgenres && g.subgenres.length) || 0;
              return (
                <motion.div
                  key={g.id}
                  variants={itemVariants}
                  onClick={() => navigate(`/category/${categorySlug}/${g.id}`)}
                  className="group relative p-6 rounded-[24px] bg-[#141414] border border-white/[0.08] hover:border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 cursor-pointer flex flex-col justify-between col-span-1"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-white/[0.06] text-white flex items-center justify-center border border-white/[0.08] transition-transform group-hover:scale-105">
                        <FolderTree className="w-5 h-5" />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
                          {subCount} {lang === 'hi' ? 'उप-विधाएँ' : lang === 'ur' ? 'ذیلی اصناف' : 'SUB-GENRES'}
                        </span>

                        {/* Admin Only Actions: Edit & Delete */}
                        <AdminOnly>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => openEditModal(g, e)}
                              title={t.admin?.editBtn || 'Edit'}
                              className="p-1 rounded-md text-zinc-400 hover:text-black hover:bg-zinc-100 transition cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => openDeleteModal(g, e)}
                              title={t.admin?.deleteBtn || 'Delete'}
                              className="p-1 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </AdminOnly>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white tracking-tight font-sans leading-snug">
                      {gTitle}
                    </h3>

                    {gDesc && (
                      <p className="text-xs text-zinc-400 mt-2 leading-relaxed line-clamp-2 font-sans">
                        {gDesc}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-xs font-mono text-zinc-400">
                      {g.count || 0} {hl.layer2Works || 'works'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-white group-hover:translate-x-1 transition-transform">
                      <span>{hl.layer2Explore || 'Explore'}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="py-16 text-center bg-[#141414] rounded-[24px] border border-white/[0.08] p-8 max-w-lg mx-auto shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
            <FolderTree className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-white font-sans">{hl.noWorksFound || 'No genres registered yet'}</p>
            <p className="text-xs text-zinc-400 mt-1 mb-4 font-sans">{hl.noWorksDesc || 'Add a genre to begin categorizing treatises.'}</p>
            <AdminOnly>
              <button
                onClick={() => setShowCreateGenre(true)}
                className="px-4 py-2 bg-white text-black text-xs font-mono uppercase tracking-wider font-semibold rounded-full shadow-xs cursor-pointer hover:bg-zinc-200"
              >
                {hl.addGenreBtn || '+ Add Genre'}
              </button>
            </AdminOnly>
          </div>
        )}
      </div>

      {/* Featured Books in this Category */}
      {categoryBooks.length > 0 && (
        <div className="mt-14 pt-8 border-t border-black/[0.06]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#111111] rounded-full inline-block"></span>
              <h2 className="text-sm font-mono uppercase tracking-wider text-[#111111]">
                {hl.layer2WorksHeading || 'Indexed Works in'} {categoryTitle}
              </h2>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              {categoryBooks.length} works
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categoryBooks.map((book) => (
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

      {/* Edit Genre Modal */}
      {editingGenre && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-black/[0.08] animate-scaleUp">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100">
              <h3 className="text-base font-bold text-[#111111] font-sans">
                {t.admin?.editGenreTitle || 'Edit Genre'}
              </h3>
              <button
                onClick={() => setEditingGenre(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditGenre} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-500 mb-1 font-mono uppercase text-[10px]">
                  Name (Hindi/Devanagari)
                </label>
                <input
                  type="text"
                  value={editNameHi}
                  onChange={(e) => setEditNameHi(e.target.value)}
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
                  value={editNameEn}
                  onChange={(e) => setEditNameEn(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl outline-hidden focus:border-black font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-500 mb-1 font-mono uppercase text-[10px]">
                  Description
                </label>
                <textarea
                  value={editDescHi}
                  onChange={(e) => setEditDescHi(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl outline-hidden focus:border-black font-sans resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setEditingGenre(null)}
                  className="px-4 py-2 border border-zinc-200 rounded-full font-medium text-zinc-600 hover:text-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="px-5 py-2 bg-[#111111] hover:bg-black text-white font-medium rounded-full cursor-pointer disabled:opacity-50"
                >
                  {isEditing ? '...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Genre Modal */}
      {deletingGenre && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-black/[0.08] text-center animate-scaleUp">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#111111] font-sans">
              Delete Genre
            </h3>
            <p className="text-xs text-zinc-500 mt-2 font-sans">
              Are you sure you want to delete <span className="font-bold text-[#111111]">"{deletingGenre.name_hi || deletingGenre.name_en}"</span>?
            </p>
            <div className="flex justify-center gap-2 mt-5">
              <button
                onClick={() => setDeletingGenre(null)}
                className="px-4 py-2 border border-zinc-200 rounded-full text-xs font-medium text-zinc-600 hover:text-black cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGenre}
                disabled={isDeleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-full cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
