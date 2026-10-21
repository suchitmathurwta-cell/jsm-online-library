import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronRight, Sparkles, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import { AdminOnly } from './AdminGuard';
import { createSubgenre, createFormat, updateFormat, deleteFormat } from '../services/supabaseApi';
import {
  getTrilingualNames,
  transliterateAll,
  clientSideTransliterateFallback,
  enforceScript
} from '../services/transliterationService';
import ArchiveCard from './bento/ArchiveCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 26,
    },
  },
};

export default function CategoryTiles({
  t,
  lang = 'hi',
  categories = [],
  selectedCategory,
  onSelectCategory,
  selectedSubGenre,
  onSelectSubGenre,
  onCreateSubGenreClick,
  onRefreshCategories
}) {
  const [showSubGenrePrompt, setShowSubGenrePrompt] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [previewTrilingual, setPreviewTrilingual] = useState({ hi: '', en: '', ur: '' });
  const [isSubmittingSub, setIsSubmittingSub] = useState(false);

  // Admin Category CRUD State
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [catPreviewTrilingual, setCatPreviewTrilingual] = useState({ hi: '', en: '', ur: '' });
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [editCatHi, setEditCatHi] = useState('');
  const [editCatEn, setEditCatEn] = useState('');
  const [editCatUr, setEditCatUr] = useState('');
  const [isEditingCat, setIsEditingCat] = useState(false);
  const [deletingCat, setDeletingCat] = useState(null);
  const [isDeletingCat, setIsDeletingCat] = useState(false);
  const editTimeoutRef = useRef(null);

  // Active Category Object
  const activeCategoryObj = categories.find((c) => c.id === selectedCategory);
  const activeSubGenres = activeCategoryObj?.subgenres || [];

  useEffect(() => {
    const trimmed = newCatName.trim();
    if (!trimmed) {
      setCatPreviewTrilingual({ hi: '', en: '', ur: '' });
      return;
    }
    const sync = clientSideTransliterateFallback(trimmed);
    setCatPreviewTrilingual({
      hi: enforceScript(sync.hi, 'hi'),
      en: enforceScript(sync.en, 'en'),
      ur: enforceScript(sync.ur, 'ur')
    });
    const timer = setTimeout(async () => {
      try {
        const res = await transliterateAll(trimmed);
        setCatPreviewTrilingual(res);
      } catch (e) {}
    }, 220);
    return () => clearTimeout(timer);
  }, [newCatName]);

  const handleEditCatInput = (boxLang, val) => {
    if (boxLang === 'hi') setEditCatHi(val);
    if (boxLang === 'en') setEditCatEn(val);
    if (boxLang === 'ur') setEditCatUr(val);

    if (editTimeoutRef.current) clearTimeout(editTimeoutRef.current);
    const trimmed = (val || '').trim();
    if (!trimmed) return;

    const sync = clientSideTransliterateFallback(trimmed);
    if (boxLang !== 'hi') setEditCatHi(enforceScript(sync.hi, 'hi'));
    if (boxLang !== 'en') setEditCatEn(enforceScript(sync.en, 'en'));
    if (boxLang !== 'ur') setEditCatUr(enforceScript(sync.ur, 'ur'));

    editTimeoutRef.current = setTimeout(async () => {
      try {
        const trans = await transliterateAll(trimmed, boxLang);
        if (trans) {
          if (boxLang !== 'hi' && trans.hi) setEditCatHi(trans.hi);
          if (boxLang !== 'en' && trans.en) setEditCatEn(trans.en);
          if (boxLang !== 'ur' && trans.ur) setEditCatUr(trans.ur);
        }
      } catch (e) {}
    }, 280);
  };

  const handleCreateCategoryInline = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsSubmittingCat(true);
    try {
      const { name_en, name_hi, name_ur } = await getTrilingualNames(newCatName.trim());
      const catId =
        (name_en || newCatName.trim())
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || 'cat-' + Date.now();
      await createFormat({
        id: catId,
        name_hi: catPreviewTrilingual.hi || name_hi || newCatName.trim(),
        name_en: catPreviewTrilingual.en || name_en || newCatName.trim(),
        name_ur: catPreviewTrilingual.ur || name_ur || newCatName.trim()
      });
      setNewCatName('');
      setCatPreviewTrilingual({ hi: '', en: '', ur: '' });
      setShowCreateCategory(false);
      if (onRefreshCategories) await onRefreshCategories();
    } catch (err) {
      alert('Error creating category: ' + err.message);
    } finally {
      setIsSubmittingCat(false);
    }
  };

  const handleSaveEditCat = async (e) => {
    e.preventDefault();
    if (!editingCat) return;
    setIsEditingCat(true);
    try {
      await updateFormat(editingCat.id, {
        name_hi: editCatHi.trim(),
        name_en: editCatEn.trim(),
        name_ur: editCatUr.trim() || undefined
      });
      setEditingCat(null);
      if (onRefreshCategories) await onRefreshCategories();
    } catch (err) {
      alert('Error updating category: ' + err.message);
    } finally {
      setIsEditingCat(false);
    }
  };

  const handleDeleteCat = async () => {
    if (!deletingCat) return;
    setIsDeletingCat(true);
    try {
      await deleteFormat(deletingCat.id);
      setDeletingCat(null);
      if (onRefreshCategories) await onRefreshCategories();
    } catch (err) {
      alert('Error deleting category: ' + err.message);
    } finally {
      setIsDeletingCat(false);
    }
  };

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
        const res = await transliterateAll(trimmed);
        setPreviewTrilingual(res);
      } catch (e) {}
    }, 220);
    return () => clearTimeout(timer);
  }, [newSubName]);

  const handleCreateSubGenreInline = async (e) => {
    e.preventDefault();
    if (!newSubName.trim() || !selectedCategory || selectedCategory === 'all') return;
    setIsSubmittingSub(true);
    try {
      if (onCreateSubGenreClick) {
        await onCreateSubGenreClick(newSubName.trim(), selectedCategory);
      } else {
        const { name_en, name_hi, name_ur } = await getTrilingualNames(newSubName.trim());
        const subId =
          (name_en || newSubName.trim())
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') || 'sg-' + Date.now();
        const firstGenreId = activeCategoryObj?.genres?.[0]?.id || 'general';
        await createSubgenre({
          id: subId,
          category_id: selectedCategory,
          genre_id: firstGenreId,
          name_hi: previewTrilingual.hi || name_hi || newSubName.trim(),
          name_en: previewTrilingual.en || name_en || newSubName.trim(),
          name_ur: previewTrilingual.ur || name_ur || newSubName.trim()
        });
        if (onRefreshCategories) await onRefreshCategories();
      }
      setNewSubName('');
      setPreviewTrilingual({ hi: '', en: '', ur: '' });
      setShowSubGenrePrompt(false);
    } catch (err) {
      console.error('Error creating subgenre:', err);
    } finally {
      setIsSubmittingSub(false);
    }
  };

  return (
    <section className="text-white">
      <div className="w-full py-6">
        
        {/* Title Lockup */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/[0.08] pb-10 mb-10">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-400 block mb-3">
              {lang === 'hi'
                ? 'जसम ऑनलाइन लाइब्रेरी • संग्रह अवलोकन'
                : lang === 'ur'
                ? 'جسم آن لائن لائبریری • مجموعات کا جائزہ'
                : 'JSM ONLINE LIBRARY • EXPLORE COLLECTIONS'}
            </span>
            <h1 className="text-4xl md:text-7xl font-bold tracking-[-0.04em] text-white font-sans">
              {lang === 'hi'
                ? 'पुस्तकालय संग्रह।'
                : lang === 'ur'
                ? 'کتب خانہ مجموعہ۔'
                : 'Explore Collections.'}
            </h1>
          </div>
          <div className="mt-4 md:mt-0 max-w-sm flex flex-col items-start md:items-end gap-3">
            <p className="font-mono text-xs text-zinc-400 leading-relaxed uppercase tracking-wider md:text-right">
              {lang === 'hi'
                ? 'भारतीय उपमहाद्वीप के कालजयी साहित्य, विचार और दुर्लभ पांडुलिपियों का संरक्षित डिजिटल संग्रह।'
                : lang === 'ur'
                ? 'کلاسیکی ادب، فکری مضامین اور نایاب مخطوطات کا محفوظ ڈیجیٹل کتب خانہ۔'
                : 'Preserving timeless literature, poetry & progressive thought across 9 curated collections.'}
            </p>
            <AdminOnly>
              <button
                type="button"
                onClick={() => setShowCreateCategory(!showCreateCategory)}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-mono uppercase tracking-wider font-extrabold rounded-full shadow-md flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{lang === 'hi' ? '+ नई श्रेणी जोड़ें' : lang === 'ur' ? '+ نئی صنف شامل کریں' : '+ ADD CATEGORY'}</span>
              </button>
            </AdminOnly>
          </div>
        </div>

        {/* Inline Admin Create Category Form */}
        {showCreateCategory && (
          <AdminOnly>
            <form
              onSubmit={handleCreateCategoryInline}
              className="mb-8 p-4 rounded-2xl bg-[#141418] border-2 border-amber-400/60 space-y-3 animate-fadeIn"
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder={
                    lang === 'hi'
                      ? 'नई मुख्य श्रेणी का नाम हिंदी, अंग्रेज़ी या उर्दू में लिखें...'
                      : lang === 'ur'
                      ? 'نئی صنف کا نام اردو، ہندی یا انگریزی میں درج کریں...'
                      : 'Enter new category name in English, Hindi, or Urdu...'
                  }
                  className="flex-1 px-4 py-2.5 text-xs border border-white/[0.15] rounded-xl outline-hidden focus:border-amber-400 bg-black/70 text-white placeholder-zinc-500"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSubmittingCat || !newCatName.trim()}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-mono uppercase tracking-wider font-extrabold rounded-xl transition cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingCat ? '...' : '+ Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateCategory(false)}
                    className="px-3 py-2.5 text-xs font-mono uppercase text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              {newCatName.trim() && (
                <div className="px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-[11px] text-zinc-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="font-mono text-amber-400 font-semibold">AUTO TRILINGUAL:</span>
                  <span><strong>हिंदी:</strong> {catPreviewTrilingual.hi || '...'}</span>
                  <span><strong>English:</strong> {catPreviewTrilingual.en || '...'}</span>
                  <span><strong>اردو:</strong> {catPreviewTrilingual.ur || '...'}</span>
                </div>
              )}
            </form>
          </AdminOnly>
        )}

        {/* Uniform, Neat & Tidy Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {categories.map((cat, idx) => {
            const localizedTitle =
              lang === 'hi'
                ? (cat.name_hi || cat.name_en)
                : lang === 'ur'
                ? (cat.name_ur || cat.name_en)
                : (cat.name_en || cat.name_hi);

            return (
              <motion.div
                key={cat.id}
                variants={itemVariants}
                className="w-full relative group/cat"
              >
                <ArchiveCard
                  title={localizedTitle}
                  category={cat.name_en || 'Collection'}
                  workCount={cat.count || 0}
                  slug={cat.id}
                  colSpan="w-full"
                  aspectRatio="aspect-[16/11]"
                  coverImage={cat.cover_url}
                  indexNumber={idx}
                  lang={lang}
                  onClick={() => {
                    if (onSelectCategory) {
                      onSelectCategory(cat.id);
                    }
                  }}
                />
                <AdminOnly>
                  <div className="absolute top-3 right-3 z-40 flex items-center gap-1.5 bg-black/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-amber-400/50 shadow-lg">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setEditingCat(cat);
                        setEditCatHi(cat.name_hi || '');
                        setEditCatEn(cat.name_en || '');
                        setEditCatUr(cat.name_ur || '');
                      }}
                      title="Edit Category"
                      className="p-1 text-amber-300 hover:text-amber-200 transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setDeletingCat(cat);
                      }}
                      title="Delete Category"
                      className="p-1 text-red-400 hover:text-red-300 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </AdminOnly>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Inline Sub-Genre Expansion Container (Layer 1 ➔ Layer 2 inline peek) */}
        {selectedCategory && selectedCategory !== 'all' && activeCategoryObj && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 p-8 rounded-[24px] bg-[#141414] border border-white/[0.08]"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-1.5">
                  <span>{t.hierarchyLayers?.subGenresAndSections || (lang === 'hi' ? 'उप-विषय व श्रेणियाँ' : lang === 'ur' ? 'موضوعات و اصناف' : 'THEMES & TOPICS')}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-white font-semibold">
                    {activeCategoryObj['name_' + lang] || activeCategoryObj.name_hi || activeCategoryObj.name_en}
                  </span>
                </span>
              </div>

              {/* Admin Action: Add Sub-genre */}
              <AdminOnly>
                <button
                  type="button"
                  onClick={() => setShowSubGenrePrompt(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 text-xs font-mono uppercase tracking-wider transition cursor-pointer border border-white/[0.08]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.admin?.createSubGenre || '+ ADD THEME'}</span>
                </button>
              </AdminOnly>
            </div>

            {/* Quick Filter Pill Buttons */}
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => onSelectSubGenre && onSelectSubGenre('all')}
                className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition cursor-pointer ${
                  selectedSubGenre === 'all' || !selectedSubGenre
                    ? 'bg-white text-black font-semibold'
                    : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/[0.08]'
                }`}
              >
                {t.filters?.allSubGenres || 'ALL SECTIONS'}
              </button>

              {activeSubGenres.map((sg) => {
                const isSgActive = selectedSubGenre === sg.id;
                const sgName = sg['name_' + lang] || sg.name_hi || sg.name_en;
                return (
                  <button
                    key={sg.id}
                    type="button"
                    onClick={() => onSelectSubGenre && onSelectSubGenre(sg.id)}
                    className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${
                      isSgActive
                        ? 'bg-white text-black font-semibold'
                        : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/[0.08]'
                    }`}
                  >
                    <span>{sgName}</span>
                    <AdminOnly>
                      {sg.count !== undefined && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                          isSgActive ? 'bg-black/20 text-black' : 'bg-white/[0.08] text-zinc-400'
                        }`}>
                          {sg.count}
                        </span>
                      )}
                    </AdminOnly>
                  </button>
                );
              })}
            </div>

            {/* Inline Admin Form to Create New Sub-Genre */}
            {showSubGenrePrompt && (
              <form onSubmit={handleCreateSubGenreInline} className="mt-6 p-4 rounded-2xl bg-black/50 border border-white/[0.08] space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    placeholder="Type in Hindi, English, or Urdu (e.g. Dalit Literature / दलित साहित्य / دلت ادب)..."
                    className="flex-1 px-4 py-2.5 bg-[#141414] rounded-xl border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingSub || !newSubName.trim()}
                    className="px-4 py-2.5 bg-white text-black text-xs font-mono uppercase tracking-wider font-semibold rounded-xl hover:bg-zinc-200 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingSub ? 'ADDING...' : 'ADD'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSubGenrePrompt(false)}
                    className="px-3 py-2.5 bg-white/[0.06] text-zinc-400 hover:text-white text-xs font-mono uppercase rounded-xl cursor-pointer"
                  >
                    CANCEL
                  </button>
                </div>
                {newSubName.trim() && (
                  <div className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[11px] text-zinc-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="text-amber-400 font-mono flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>AUTO TRILINGUAL:</span>
                    </span>
                    <span><strong>हिंदी:</strong> {previewTrilingual.hi || '...'}</span>
                    <span><strong>English:</strong> {previewTrilingual.en || '...'}</span>
                    <span><strong>اردو:</strong> {previewTrilingual.ur || '...'}</span>
                  </div>
                )}
              </form>
            )}
          </motion.div>
        )}

        {/* Edit Category Modal */}
        {editingCat && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-black/[0.08] text-black">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100">
                <h3 className="text-base font-bold text-[#111111] font-sans flex items-center gap-2">
                  <span>Edit Category</span>
                  <span className="text-[10px] font-mono text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Auto-Translate</span>
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingCat(null)}
                  className="p-1 rounded-full text-zinc-400 hover:text-black cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSaveEditCat} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-zinc-500 mb-1 font-mono uppercase text-[10px]">
                    Name (Hindi / Devanagari)
                  </label>
                  <input
                    type="text"
                    value={editCatHi}
                    onChange={(e) => handleEditCatInput('hi', e.target.value)}
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
                    value={editCatEn}
                    onChange={(e) => handleEditCatInput('en', e.target.value)}
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
                    value={editCatUr}
                    onChange={(e) => handleEditCatInput('ur', e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl outline-hidden focus:border-black font-urdu text-black text-right"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setEditingCat(null)}
                    className="px-4 py-2 border border-zinc-200 rounded-full font-medium text-zinc-600 hover:text-black cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isEditingCat}
                    className="px-5 py-2 bg-[#111111] hover:bg-black text-white font-medium rounded-full cursor-pointer disabled:opacity-50"
                  >
                    {isEditingCat ? '...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Category Modal */}
        {deletingCat && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-black/[0.08] text-center text-black">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#111111] font-sans">Delete Category</h3>
              <p className="text-xs text-zinc-500 mt-2 font-sans">
                Are you sure you want to delete{' '}
                <span className="font-bold text-[#111111]">
                  "{deletingCat.name_hi || deletingCat.name_en}"
                </span>
                ?
              </p>
              <div className="flex justify-center gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => setDeletingCat(null)}
                  className="px-4 py-2 border border-zinc-200 rounded-full text-xs font-medium text-zinc-600 hover:text-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCat}
                  disabled={isDeletingCat}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-full cursor-pointer disabled:opacity-50"
                >
                  {isDeletingCat ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
