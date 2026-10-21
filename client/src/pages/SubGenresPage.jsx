import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FolderOpen,
  ArrowRight,
  Plus,
  Trash2,
  Edit2,
  X,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import { createSubgenre, deleteSubgenre, updateSubgenre } from '../services/supabaseApi';
import {
  getTrilingualNames,
  transliterateAll,
  clientSideTransliterateFallback,
  enforceScript
} from '../services/transliterationService';
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
  onOpenUpload,
  onRefreshCategories
}) {
  const { categorySlug, genreSlug } = useParams();
  const navigate = useNavigate();
  const [showCreateSub, setShowCreateSub] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [previewTrilingual, setPreviewTrilingual] = useState({ hi: '', en: '', ur: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Sub-genre State
  const [editingSub, setEditingSub] = useState(null);
  const [editSubHi, setEditSubHi] = useState('');
  const [editSubEn, setEditSubEn] = useState('');
  const [editSubUr, setEditSubUr] = useState('');
  const [isEditingSub, setIsEditingSub] = useState(false);
  const editTimeoutRef = useRef(null);

  // Delete Sub-genre State
  const [deletingSub, setDeletingSub] = useState(null);
  const [isDeletingSub, setIsDeletingSub] = useState(false);

  useEffect(() => {
    const trimmed = newSubName.trim();
    if (!trimmed) {
      setPreviewTrilingual({ hi: '', en: '', ur: '' });
      return;
    }
    const sync = clientSideTransliterateFallback(trimmed);
    setPreviewTrilingual({
      hi: enforceScript(sync.hi, 'hi'),
      en: enforceScript(sync.en, 'en'),
      ur: enforceScript(sync.ur, 'ur')
    });
    const timer = setTimeout(async () => {
      try {
        const res = await getTrilingualNames(trimmed);
        setPreviewTrilingual({
          hi: res.name_hi,
          en: res.name_en,
          ur: res.name_ur
        });
      } catch (e) {}
    }, 220);
    return () => clearTimeout(timer);
  }, [newSubName]);

  const handleEditSubInput = (boxLang, val) => {
    if (boxLang === 'hi') setEditSubHi(val);
    if (boxLang === 'en') setEditSubEn(val);
    if (boxLang === 'ur') setEditSubUr(val);

    if (editTimeoutRef.current) clearTimeout(editTimeoutRef.current);
    const trimmed = (val || '').trim();
    if (!trimmed) return;

    const sync = clientSideTransliterateFallback(trimmed);
    if (boxLang !== 'hi') setEditSubHi(enforceScript(sync.hi, 'hi'));
    if (boxLang !== 'en') setEditSubEn(enforceScript(sync.en, 'en'));
    if (boxLang !== 'ur') setEditSubUr(enforceScript(sync.ur, 'ur'));

    editTimeoutRef.current = setTimeout(async () => {
      try {
        const trans = await transliterateAll(trimmed, boxLang);
        if (trans) {
          if (boxLang !== 'hi' && trans.hi) setEditSubHi(trans.hi);
          if (boxLang !== 'en' && trans.en) setEditSubEn(trans.en);
          if (boxLang !== 'ur' && trans.ur) setEditSubUr(trans.ur);
        }
      } catch (e) {}
    }, 280);
  };

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
      const { name_en, name_hi, name_ur } = await getTrilingualNames(newSubName.trim());
      const subId =
        (name_en || newSubName.trim())
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || 'sg-' + Date.now();
      await createSubgenre({
        id: subId,
        genre_id: genreSlug,
        category_id: categorySlug,
        name_hi: previewTrilingual.hi || name_hi || newSubName.trim(),
        name_en: previewTrilingual.en || name_en || newSubName.trim(),
        name_ur: previewTrilingual.ur || name_ur || newSubName.trim()
      });
      setNewSubName('');
      setPreviewTrilingual({ hi: '', en: '', ur: '' });
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
        name_en: editSubEn.trim(),
        name_ur: editSubUr.trim() || undefined
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
    setEditSubUr(sg.name_ur || '');
  };

  const openDeleteModal = (sg, e) => {
    e.stopPropagation();
    setDeletingSub(sg);
  };

  const hl = t.hierarchyLayers || {};
  const graphic = getCategoryGraphic(categorySlug);

  return (
    <div className="w-full pb-12 animate-fadeIn">
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
              className="absolute inset-0 bg-cover bg-center z-0 opacity-55"
              style={{ backgroundImage: `url(${graphic.image || graphic.remoteFallback})` }}
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${graphic.accentGradient || 'from-black/70 via-black/50 to-transparent'} z-5`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/35 to-transparent z-5 pointer-events-none" />
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
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setShowCreateSub(!showCreateSub)}
                className="px-4 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-mono uppercase tracking-wider font-semibold rounded-full shadow-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{hl.addSubgenreBtn || '+ ADD SUB-GENRE'}</span>
              </button>
              {onOpenUpload && (
                <button
                  type="button"
                  onClick={onOpenUpload}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-mono uppercase tracking-wider font-extrabold rounded-full shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>↑</span>
                  <span>{t?.nav?.uploadBook || 'Upload E-Book'}</span>
                </button>
              )}
            </div>
          </AdminOnly>
        </div>

        {/* Inline Create Sub-genre Form (Admin Only) */}
        {showCreateSub && (
          <AdminOnly>
            <form
              onSubmit={handleCreateSubGenre}
              className="relative z-10 mb-4 p-3 bg-black/70 rounded-2xl border border-white/[0.12] space-y-2.5 animate-fadeIn"
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder={
                    lang === 'hi'
                      ? 'नए विषय का नाम हिंदी, अंग्रेज़ी या उर्दू में लिखें...'
                      : lang === 'ur'
                      ? 'نئے موضوع کا نام اردو، ہندی یا انگریزی میں درج کریں...'
                      : 'Enter new sub-genre in English, Hindi, or Urdu...'
                  }
                  className="flex-1 px-3 py-2 text-xs border border-white/[0.15] rounded-xl outline-hidden focus:border-white bg-black/80 text-white placeholder-zinc-500"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !newSubName.trim()}
                    className="flex-1 sm:flex-none px-4 py-2 bg-white text-black text-xs font-mono uppercase tracking-wider font-semibold rounded-xl transition cursor-pointer disabled:opacity-50"
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
                </div>
              </div>
              {newSubName.trim() && (
                <div className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/[0.08] text-[11px] text-zinc-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="font-mono text-amber-400 font-semibold">AUTO TRILINGUAL:</span>
                  <span><strong>हिंदी:</strong> {previewTrilingual.hi || '...'}</span>
                  <span><strong>English:</strong> {previewTrilingual.en || '...'}</span>
                  <span><strong>اردو:</strong> {previewTrilingual.ur || '...'}</span>
                </div>
              )}
            </form>
          </AdminOnly>
        )}

        {/* Horizontal Quick-Filter Pills for Themes */}
        {subgenres.length > 0 && (
          <div className="relative z-10 flex flex-wrap items-center gap-2 pt-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mr-1">
              {lang === 'hi' ? 'विषय:' : lang === 'ur' ? 'موضوعات:' : 'JUMP TO:'}
            </span>
            {subgenres.map((sg) => {
              const sgTitle = sg[`name_${lang}`] || sg.name_hi || sg.name_en;
              return (
                <button
                  key={sg.id}
                  onClick={() => navigate(`/category/${categorySlug}/${genreSlug}/${sg.id}`)}
                  className="px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 hover:text-white border border-white/[0.1] transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>{sgTitle}</span>
                  <AdminOnly>
                    <span className="text-[10px] font-mono opacity-60">[{sg.count || 0}]</span>
                  </AdminOnly>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Themes & Topics Bento Grid */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-white rounded-full inline-block" />
            <h2 className="text-xs font-mono uppercase tracking-[0.25em] text-white">
              {hl.layer3Heading || (lang === 'hi' ? 'प्रमुख विषय व श्रेणियाँ' : lang === 'ur' ? 'اہم موضوعات' : 'THEMES & TOPICS IN')} {genreTitle}
            </h2>
          </div>
          <AdminOnly>
            <span className="text-xs text-zinc-500 font-mono tracking-wider">
              [{subgenres.length} {lang === 'hi' ? 'विषय' : lang === 'ur' ? 'موضوعات' : 'THEMES'}]
            </span>
          </AdminOnly>
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
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-base sm:text-lg font-bold text-white font-sans tracking-tight leading-snug">
                        {sgTitle}
                      </h3>

                      {/* Admin Only: Count + Edit & Delete */}
                      <AdminOnly>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
                            {sg.count || 0}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => openEditModal(sg, e)}
                            title={t.admin?.editBtn || 'Edit'}
                            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => openDeleteModal(sg, e)}
                            title={t.admin?.deleteBtn || 'Delete'}
                            className="p-1.5 rounded-md text-zinc-400 hover:text-red-400 hover:bg-red-950/40 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </AdminOnly>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-end text-xs font-mono uppercase tracking-wider text-white">
                    <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="py-14 text-center bg-[#141414] rounded-[24px] border border-white/[0.08] p-8 max-w-md mx-auto shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
            <FolderOpen className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-white font-sans">{hl.noWorksFound || 'No themes added yet'}</p>
            <p className="text-xs text-zinc-400 mt-1 mb-4 font-sans">{hl.noWorksDesc || 'This collection has no sub-sections yet.'}</p>
            <AdminOnly>
              <button
                onClick={() => setShowCreateSub(true)}
                className="px-4 py-2 bg-white text-black text-xs font-mono uppercase tracking-wider font-semibold rounded-full shadow-xs cursor-pointer hover:bg-zinc-200"
              >
                {hl.addSubgenreBtn || '+ Add Theme'}
              </button>
            </AdminOnly>
          </div>
        )}
      </div>

      {/* Featured Works under this Genre */}
      {genreBooks.length > 0 && (
        <div className="mt-14 pt-8 border-t border-white/[0.08]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-white rounded-full inline-block" />
              <h2 className="text-sm font-mono uppercase tracking-wider text-white">
                {hl.layer2WorksHeading || 'Books in'} {genreTitle}
              </h2>
            </div>
            <AdminOnly>
              <span className="text-xs font-mono text-zinc-400">
                [{genreBooks.length} {t.sections?.worksUnit || 'BOOKS'}]
              </span>
            </AdminOnly>
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-black/[0.08] animate-scaleUp text-black">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100">
              <h3 className="text-base font-bold text-[#111111] font-sans flex items-center gap-2">
                <span>Edit Sub-Genre</span>
                <span className="text-[10px] font-mono text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Auto-Translate</span>
                </span>
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
                  Name (Hindi / Devanagari)
                </label>
                <input
                  type="text"
                  value={editSubHi}
                  onChange={(e) => handleEditSubInput('hi', e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl outline-hidden focus:border-black font-sans text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-500 mb-1 font-mono uppercase text-[10px]">
                  Name (English / Roman)
                </label>
                <input
                  type="text"
                  value={editSubEn}
                  onChange={(e) => handleEditSubInput('en', e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl outline-hidden focus:border-black font-sans text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-500 mb-1 font-mono uppercase text-[10px]">
                  Name (Urdu / اردو)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={editSubUr}
                  onChange={(e) => handleEditSubInput('ur', e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl outline-hidden focus:border-black font-urdu text-black text-right"
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-black/[0.08] text-center animate-scaleUp text-black">
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
