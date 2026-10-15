import React, { useState, useEffect } from 'react';
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
  Check,
  BookOpen
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import { createGenre, deleteGenre, updateGenre } from '../services/supabaseApi';
import BookCard from '../components/BookCard';
import { AdminOnly } from '../components/AdminGuard';
import { containerVariants, itemVariants } from '../components/BentoGrid';
import { getCategoryGraphic } from '../data/categoryGraphics';
import { getCategoryColor } from '../data/categoryColors';

export default function CategoryGenresPage({
  t,
  lang = 'hi',
  categories = [],
  books = [],
  onSelectBook,
  onOpenReader,
  onDownloadBook,
  onEditBook,
  onRefreshCategories,
  onActiveSectionChange,
}) {
  const { categorySlug } = useParams();
  const navigate = useNavigate();

  // Create Genre State
  const [showCreateGenreForCat, setShowCreateGenreForCat] = useState(null);
  const [newGenreName, setNewGenreName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Genre State
  const [editingGenre, setEditingGenre] = useState(null);
  const [targetCategorySlug, setTargetCategorySlug] = useState(null);
  const [editNameHi, setEditNameHi] = useState('');
  const [editNameEn, setEditNameEn] = useState('');
  const [editDescHi, setEditDescHi] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Delete Confirm State
  const [deletingGenre, setDeletingGenre] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Auto-scroll to categorySlug when mounted or changed
  useEffect(() => {
    if (categorySlug) {
      const el = document.getElementById(`section-${categorySlug}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (onActiveSectionChange) onActiveSectionChange(categorySlug);
      }
    }
  }, [categorySlug]);

  // 2. IntersectionObserver: Scrollspy across continuous category stream
  useEffect(() => {
    const handleIntersect = (entries) => {
      const visibleEntries = entries.filter((e) => e.isIntersecting);
      if (visibleEntries.length > 0) {
        const topEntry = visibleEntries.sort(
          (a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top)
        )[0];
        const sectionId = topEntry.target.getAttribute('data-section-id');
        if (sectionId) {
          if (onActiveSectionChange) onActiveSectionChange(sectionId);
          // Keep URL in sync without reloading
          window.history.replaceState(null, '', `/category/${sectionId}`);
        }
      }
    };

    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: '-15% 0px -55% 0px',
      threshold: [0.05, 0.2, 0.5],
    });

    const elements = document.querySelectorAll('[data-section-id]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [categories, onActiveSectionChange]);

  const handleCreateGenre = async (e, catId) => {
    e.preventDefault();
    if (!newGenreName.trim() || !catId) return;
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
        category_id: catId,
        name_hi: newGenreName.trim(),
        name_en: newGenreName.trim(),
        description_hi: newGenreName.trim() + ' से संबंधित विशिष्ट साहित्यिक विधा',
        description_en: 'Curated works on ' + newGenreName.trim()
      });
      setNewGenreName('');
      setShowCreateGenreForCat(null);
      if (onRefreshCategories) await onRefreshCategories();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGenre = async () => {
    if (!deletingGenre || !targetCategorySlug) return;
    setIsDeleting(true);
    try {
      await deleteGenre(targetCategorySlug, deletingGenre.id);
      setDeletingGenre(null);
      setTargetCategorySlug(null);
      if (onRefreshCategories) await onRefreshCategories();
    } catch (err) {
      alert('Error deleting genre: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEditGenre = async (e) => {
    e.preventDefault();
    if (!editingGenre || !targetCategorySlug) return;
    setIsEditing(true);
    try {
      await updateGenre(targetCategorySlug, editingGenre.id, {
        name_hi: editNameHi.trim(),
        name_en: editNameEn.trim(),
        description_hi: editDescHi.trim()
      });
      setEditingGenre(null);
      setTargetCategorySlug(null);
      if (onRefreshCategories) await onRefreshCategories();
    } catch (err) {
      alert('Error updating genre: ' + err.message);
    } finally {
      setIsEditing(false);
    }
  };

  const openEditModal = (genre, catId, e) => {
    e.stopPropagation();
    setEditingGenre(genre);
    setTargetCategorySlug(catId);
    setEditNameHi(genre.name_hi || '');
    setEditNameEn(genre.name_en || '');
    setEditDescHi(genre.description_hi || genre.description_en || '');
  };

  const openDeleteModal = (genre, catId, e) => {
    e.stopPropagation();
    setDeletingGenre(genre);
    setTargetCategorySlug(catId);
  };

  const hl = t.hierarchyLayers || {};

  // Ordered categories list
  const orderedCategories = categories.length > 0 ? categories : [];

  return (
    <div className="w-full pb-20 animate-fadeIn space-y-24">
      {/* Top Breadcrumb */}
      <div className="pt-2">
        <Breadcrumbs
          lang={lang}
          t={t}
          items={[
            {
              label:
                categories.find((c) => c.id === categorySlug)?.[`name_${lang}`] ||
                categories.find((c) => c.id === categorySlug)?.name_hi ||
                categories.find((c) => c.id === categorySlug)?.name_en ||
                'Taxonomy Catalog',
            },
          ]}
        />
      </div>

      {/* CONTINUOUS STREAM OF ALL SIDEBAR SECTIONS */}
      {orderedCategories.map((cat, idx) => {
        const catId = cat.id;
        const color = getCategoryColor(catId);
        const graphic = getCategoryGraphic(catId);
        const catTitle = cat[`name_${lang}`] || cat.name_hi || cat.name_en;
        const catSub = cat[`subtitle_${lang}`] || cat.subtitle_hi || cat.subtitle_en;
        const genres = cat.genres || [];
        const catBooks = books.filter((b) => b.category === catId);
        const formattedIdx = idx < 9 ? `0${idx + 1}` : `${idx + 1}`;

        return (
          <section
            key={catId}
            id={`section-${catId}`}
            data-section-id={catId}
            className="scroll-mt-6 relative group pt-2 pb-16 border-b border-white/[0.08]"
          >
            {/* Atmospheric Ambient Color Glow behind section */}
            <div
              className="absolute -top-16 -left-12 -right-12 h-[450px] rounded-full pointer-events-none blur-3xl opacity-25 -z-10 transition-opacity duration-1000"
              style={{
                background: `radial-gradient(ellipse at top left, ${color.hex}60, transparent 70%)`,
              }}
            />

            {/* 1. Rich Glowing Category Banner (Layer 2) */}
            <div
              className="p-6 sm:p-10 rounded-[28px] border transition-all duration-500 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${color.hex}28 0%, #17171a 55%, #101012 100%)`,
                borderColor: `${color.hex}45`,
                boxShadow: `0 12px 40px rgba(0,0,0,0.8), 0 0 45px ${color.hex}22`,
              }}
            >
              {graphic && (
                <>
                  <div
                    className="absolute inset-0 bg-cover bg-center z-0 opacity-45 mix-blend-screen pointer-events-none"
                    style={{ backgroundImage: `url(${graphic.image || graphic.remoteFallback})` }}
                  />
                  <div
                    className="absolute inset-0 z-5 pointer-events-none"
                    style={{
                      background: `linear-gradient(90deg, #0e0e10 0%, ${color.hex}20 50%, transparent 100%)`,
                    }}
                  />
                </>
              )}

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="font-mono text-sm font-black px-2.5 py-0.5 rounded-full border backdrop-blur-md shadow-xs"
                      style={{
                        backgroundColor: `${color.hex}25`,
                        borderColor: `${color.hex}50`,
                        color: color.hex,
                      }}
                    >
                      {formattedIdx}
                    </span>
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider border backdrop-blur-md font-semibold"
                      style={{
                        backgroundColor: `${color.hex}20`,
                        borderColor: `${color.hex}45`,
                        color: color.hex,
                      }}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>{hl.layer2Badge || 'LAYER 2: GENRES'}</span>
                    </div>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-black font-sans tracking-[-0.03em] text-white flex items-center gap-3">
                    <span>{catTitle}</span>
                  </h1>

                  <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed max-w-xl">
                    {catSub || hl.layer2Sub}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                  <div
                    className="border px-4 py-2.5 rounded-2xl text-center backdrop-blur-md min-w-[76px]"
                    style={{
                      backgroundColor: `${color.hex}18`,
                      borderColor: `${color.hex}40`,
                    }}
                  >
                    <span className="text-xl font-black font-mono" style={{ color: color.hex }}>
                      {genres.length}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block font-semibold">
                      {t.admin?.genresCount || 'GENRES'}
                    </span>
                  </div>

                  <div
                    className="border px-4 py-2.5 rounded-2xl text-center backdrop-blur-md min-w-[76px]"
                    style={{
                      backgroundColor: `${color.hex}18`,
                      borderColor: `${color.hex}40`,
                    }}
                  >
                    <span className="text-xl font-black font-mono text-white">
                      {catBooks.length}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block font-semibold">
                      {t.admin?.worksCount || 'WORKS'}
                    </span>
                  </div>

                  {/* Admin Only: Create Genre Button */}
                  <AdminOnly>
                    <button
                      onClick={() => setShowCreateGenreForCat(catId)}
                      className="px-4 py-2.5 rounded-2xl text-xs font-mono uppercase tracking-wider font-black transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
                      style={{
                        backgroundColor: color.hex,
                        color: '#000000',
                        boxShadow: `0 0 25px ${color.hex}60`,
                      }}
                    >
                      <span>+ + ADD NEW GENRE</span>
                    </button>
                  </AdminOnly>
                </div>
              </div>

              {/* Admin Create Genre Inline Form */}
              {showCreateGenreForCat === catId && (
                <AdminOnly>
                  <form
                    onSubmit={(e) => handleCreateGenre(e, catId)}
                    className="mt-6 pt-5 border-t border-white/[0.12] flex flex-col sm:flex-row gap-2.5 items-center animate-fadeIn relative z-20"
                  >
                    <input
                      type="text"
                      value={newGenreName}
                      onChange={(e) => setNewGenreName(e.target.value)}
                      placeholder={
                        lang === 'hi'
                          ? `नई साहित्यिक विधा (${catTitle})...`
                          : lang === 'ur'
                          ? `نئی ادبی صنف (${catTitle})...`
                          : `Enter new genre for ${catTitle}...`
                      }
                      className="w-full sm:flex-1 px-4 py-2 text-xs bg-black/80 border border-white/20 text-white rounded-xl outline-hidden focus:border-white"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !newGenreName.trim()}
                      className="w-full sm:w-auto px-5 py-2 text-black text-xs font-mono uppercase tracking-wider font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
                      style={{ backgroundColor: color.hex }}
                    >
                      {isSubmitting ? '...' : '+ Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateGenreForCat(null)}
                      className="px-3 py-2 text-xs font-mono uppercase text-zinc-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                  </form>
                </AdminOnly>
              )}
            </div>

            {/* 2. Section Sub-Header */}
            <div className="mt-10 mb-6 flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block animate-pulse"
                  style={{
                    backgroundColor: color.hex,
                    boxShadow: `0 0 12px ${color.hex}`,
                  }}
                />
                <h2
                  className="text-xs sm:text-sm font-mono uppercase tracking-[0.25em] font-black"
                  style={{ color: color.hex }}
                >
                  {hl.layer2Heading || 'GENRES UNDER'} — {catTitle}
                </h2>
              </div>
              <span
                className="text-xs font-mono tracking-wider px-2.5 py-0.5 rounded-full border"
                style={{
                  backgroundColor: `${color.hex}15`,
                  borderColor: `${color.hex}35`,
                  color: color.hex,
                }}
              >
                [{genres.length} GENRES REGISTERED]
              </span>
            </div>

            {/* 3. Rich, Uniform, Vibrant Genre Cards (Layer 2) */}
            {genres.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {genres.map((g) => {
                  const gTitle = g[`name_${lang}`] || g.name_hi || g.name_en;
                  const gDesc = g[`description_${lang}`] || g.description_hi || g.description_en;
                  const subCount = g.subgenres_count || (g.subgenres && g.subgenres.length) || 0;

                  return (
                    <motion.div
                      key={g.id}
                      variants={itemVariants}
                      onClick={() => navigate(`/category/${catId}/${g.id}`)}
                      className="group relative p-6 sm:p-7 rounded-[26px] border transition-all duration-300 cursor-pointer flex flex-col justify-between col-span-1"
                      style={{
                        background: `linear-gradient(145deg, ${color.hex}16 0%, #17171a 50%, #101012 100%)`,
                        borderColor: `${color.hex}30`,
                        borderTop: `2.5px solid ${color.hex}`,
                        boxShadow: `0 10px 30px rgba(0,0,0,0.65)`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = color.hex;
                        e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.85), 0 0 35px ${color.glow}`;
                        e.currentTarget.style.transform = 'translateY(-4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = `${color.hex}30`;
                        e.currentTarget.style.boxShadow = `0 10px 30px rgba(0,0,0,0.65)`;
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white tracking-tight font-sans leading-snug group-hover:text-zinc-100 transition-colors">
                            {gTitle}
                          </h3>

                          {/* Admin Only Actions: Edit & Delete */}
                          <AdminOnly>
                            <div className="flex items-center gap-1 z-20 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => openEditModal(g, catId, e)}
                                title={t.admin?.editBtn || 'Edit'}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.1] transition cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => openDeleteModal(g, catId, e)}
                                title={t.admin?.deleteBtn || 'Delete'}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </AdminOnly>
                        </div>

                        {gDesc && (
                          <p className="text-xs sm:text-sm text-zinc-300 mt-2.5 leading-relaxed line-clamp-3 font-sans">
                            {gDesc}
                          </p>
                        )}
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-end">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider font-bold transition-all group-hover:translate-x-1.5"
                          style={{ color: color.hex }}
                        >
                          <span>{hl.layer2Explore || 'EXPLORE SUB-GENRES'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <div
                className="py-12 text-center rounded-[24px] border p-8 max-w-md mx-auto"
                style={{
                  backgroundColor: `${color.hex}08`,
                  borderColor: `${color.hex}25`,
                }}
              >
                <FolderTree className="w-8 h-8 mx-auto mb-3" style={{ color: color.hex }} />
                <p className="text-sm font-bold text-white font-sans">
                  {hl.noWorksFound || 'No genres registered yet'}
                </p>
                <p className="text-xs text-zinc-400 mt-1 mb-4 font-sans">
                  {hl.noWorksDesc || 'Add a genre to begin categorizing treatises.'}
                </p>
                <AdminOnly>
                  <button
                    onClick={() => setShowCreateGenreForCat(catId)}
                    className="px-4 py-2 text-black text-xs font-mono uppercase tracking-wider font-bold rounded-full shadow-xs cursor-pointer hover:opacity-90"
                    style={{ backgroundColor: color.hex }}
                  >
                    {hl.addGenreBtn || '+ Add Genre'}
                  </button>
                </AdminOnly>
              </div>
            )}

            {/* 4. Featured Books in this Category */}
            {catBooks.length > 0 && (
              <div className="mt-12 pt-8 border-t border-white/[0.08]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: color.hex }}
                    />
                    <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                      {hl.layer2Works || 'FEATURED ARCHIVAL WORKS'} — {catTitle}
                    </h3>
                  </div>
                  <span className="text-xs text-zinc-500 font-mono">
                    [{catBooks.length} WORKS]
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {catBooks.slice(0, 8).map((book) => (
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
          </section>
        );
      })}

      {/* Edit Genre Modal */}
      {editingGenre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#141414] border border-white/20 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-400" />
                <span>{t.admin?.editGenreTitle || 'Edit Literary Genre'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingGenre(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEditGenre} className="space-y-4">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                  Genre Title (Devanagari)
                </label>
                <input
                  type="text"
                  value={editNameHi}
                  onChange={(e) => setEditNameHi(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-black/50 border border-white/[0.1] text-white rounded-lg focus:border-white outline-hidden"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                  Genre Title (English)
                </label>
                <input
                  type="text"
                  value={editNameEn}
                  onChange={(e) => setEditNameEn(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-black/50 border border-white/[0.1] text-white rounded-lg focus:border-white outline-hidden"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                  Description
                </label>
                <textarea
                  value={editDescHi}
                  onChange={(e) => setEditDescHi(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-xs bg-black/50 border border-white/[0.1] text-white rounded-lg focus:border-white outline-hidden resize-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingGenre(null)}
                  className="px-4 py-2 text-xs font-mono uppercase text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="px-5 py-2 bg-white text-black text-xs font-mono uppercase font-bold rounded-lg hover:bg-zinc-200"
                >
                  {isEditing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Genre Confirmation Modal */}
      {deletingGenre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#141414] border border-red-500/30 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-white">Delete Literary Genre</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed mb-6">
              Are you sure you want to delete{' '}
              <strong className="text-white">
                {deletingGenre.name_hi || deletingGenre.name_en}
              </strong>
              ? All nested subgenres and classifications will be affected.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingGenre(null)}
                className="px-4 py-2 text-xs font-mono uppercase text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteGenre}
                disabled={isDeleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-mono uppercase font-bold rounded-lg"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
