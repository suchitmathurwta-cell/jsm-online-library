import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Layers, Edit2, Trash2, AlertTriangle, X } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import CategoryTiles from '../components/CategoryTiles';
import BookCard from '../components/BookCard';
import BookGrid from '../components/BookGrid';
import { AdminOnly } from '../components/AdminGuard';
import { createGenre, deleteGenre, updateGenre } from '../services/supabaseApi';
import { getTrilingualNames } from '../services/transliterationService';
import { getCategoryColor } from '../data/categoryColors';

export default function HomePage({
  t,
  lang = 'hi',
  categories = [],
  books = [],
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  onSelectBook,
  onOpenReader,
  onDownloadBook,
  onEditBook,
  onOpenUpload,
  onRefreshCategories,
  onActiveSectionChange,
}) {
  const navigate = useNavigate();

  // Create Genre State (Admin)
  const [showCreateGenreForCat, setShowCreateGenreForCat] = useState(null);
  const [newGenreName, setNewGenreName] = useState('');
  const [previewTrilingual, setPreviewTrilingual] = useState({ hi: '', en: '', ur: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Genre State (Admin)
  const [editingGenre, setEditingGenre] = useState(null);
  const [targetCategorySlug, setTargetCategorySlug] = useState(null);
  const [editNameHi, setEditNameHi] = useState('');
  const [editNameEn, setEditNameEn] = useState('');
  const [editNameUr, setEditNameUr] = useState('');
  const [editDescHi, setEditDescHi] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Delete Genre State (Admin)
  const [deletingGenre, setDeletingGenre] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!newGenreName.trim()) {
      setPreviewTrilingual({ hi: '', en: '', ur: '' });
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await getTrilingualNames(newGenreName.trim());
        setPreviewTrilingual({
          hi: res.name_hi,
          en: res.name_en,
          ur: res.name_ur
        });
      } catch (e) {}
    }, 200);
    return () => clearTimeout(timer);
  }, [newGenreName]);

  const handleCreateGenre = async (e, catId) => {
    e.preventDefault();
    if (!newGenreName.trim() || !catId) return;
    setIsSubmitting(true);
    try {
      const { name_en, name_hi, name_ur } = await getTrilingualNames(newGenreName.trim());
      const genreId =
        (name_en || newGenreName.trim())
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || 'genre-' + Date.now();
      await createGenre({
        id: genreId,
        category_id: catId,
        name_hi: previewTrilingual.hi || name_hi || newGenreName.trim(),
        name_en: previewTrilingual.en || name_en || newGenreName.trim(),
        name_ur: previewTrilingual.ur || name_ur || newGenreName.trim(),
        description_hi: (previewTrilingual.hi || name_hi || newGenreName.trim()) + ' से संबंधित विशिष्ट साहित्यिक विधा',
        description_en: 'Curated works on ' + (previewTrilingual.en || name_en || newGenreName.trim())
      });
      setNewGenreName('');
      setPreviewTrilingual({ hi: '', en: '', ur: '' });
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
        name_ur: editNameUr.trim() || undefined,
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
    setEditNameUr(genre.name_ur || '');
    setEditDescHi(genre.description_hi || genre.description_en || '');
  };

  const openDeleteModal = (genre, catId, e) => {
    e.stopPropagation();
    setDeletingGenre(genre);
    setTargetCategorySlug(catId);
  };

  // Scrollspy: Track visible category section and sync with StridaSidebar
  useEffect(() => {
    const handleIntersect = (entries) => {
      const visibleEntries = entries.filter((e) => e.isIntersecting);
      if (visibleEntries.length > 0) {
        const topEntry = visibleEntries.sort(
          (a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top)
        )[0];
        const sectionId = topEntry.target.getAttribute('data-section-id');
        if (sectionId && onActiveSectionChange) {
          onActiveSectionChange(sectionId);
        }
      }
    };

    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: '-10% 0px -55% 0px',
      threshold: [0.05, 0.2, 0.5],
    });

    const elements = document.querySelectorAll('[data-section-id]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [categories, books, onActiveSectionChange]);

  const handleSelectCategory = (catId) => {
    if (!catId || catId === 'all') {
      const catElement = document.getElementById('catalog');
      if (catElement) catElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      const targetElement = document.getElementById(`section-${catId}`);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        navigate('/category/' + catId);
      }
    }
  };

  return (
    <div className="flex flex-col animate-fadeIn space-y-16">
      {/* 1. Hero Section */}
      <HeroSection
        t={t}
        lang={lang}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={() => {
          const catElement = document.getElementById('catalog');
          if (catElement) catElement.scrollIntoView({ behavior: 'smooth' });
        }}
        categories={categories}
        selectedCategory="all"
        onSelectCategory={handleSelectCategory}
        onOpenReader={onOpenReader}
        onSelectBook={onSelectBook}
      />

      {/* 2. Collections Overview: 9 Uniform, Neat & Tidy Tiles */}
      <div id="collections-overview" data-section-id="collections-overview">
        <CategoryTiles
          t={t}
          lang={lang}
          categories={categories}
          selectedCategory="all"
          onSelectCategory={handleSelectCategory}
          onRefreshCategories={onRefreshCategories}
        />
      </div>

      {/* 3. Continuous Main Content Stream: Sequential Category Sections synced with Sidebar */}
      {!searchQuery && categories && categories.length > 0 && (
        <div className="space-y-24 pt-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-200 font-bold">
                {lang === 'hi' ? 'विशेष संग्रह • समस्त श्रेणियाँ' : lang === 'ur' ? 'نمایاں مجموعات • تمام اصناف' : 'FEATURED COLLECTIONS • BROWSE ALL GENRES'}
              </span>
            </div>
            <span className="font-mono text-xs text-zinc-400">
              {lang === 'hi' ? '[सभी श्रेणियों को देखने हेतु नीचे स्क्रॉल करें]' : lang === 'ur' ? '[تمام اصناف دیکھنے کے لیے نیچے اسکرول کریں]' : '[SCROLL TO EXPLORE ALL COLLECTIONS]'}
            </span>
          </div>

          {categories.map((cat) => {
            const color = getCategoryColor(cat.id);
            const catName = cat['name_' + lang] || cat.name_hi || cat.name_en;
            const subtitle = cat['subtitle_' + lang] || cat.subtitle_en || cat.subtitle_hi;
            const catBooks = books.filter((b) => b.category === cat.id);
            const genres = cat.genres || [];

            return (
              <section
                key={cat.id}
                id={`section-${cat.id}`}
                data-section-id={cat.id}
                className="scroll-mt-8 pb-16 border-b border-white/[0.08] relative group"
              >
                {/* Atmospheric Ambient Color Glow */}
                <div
                  className="absolute -top-12 -left-8 -right-8 h-80 rounded-full pointer-events-none opacity-10 blur-3xl -z-10"
                  style={{
                    background: `radial-gradient(ellipse at top left, ${color.hex}30, transparent 70%)`,
                  }}
                />

                {/* Section Header Banner */}
                <div
                  className="p-6 sm:p-8 rounded-[24px] border transition-all duration-300 mb-8"
                  style={{
                    background: `linear-gradient(135deg, ${color.hex}22 0%, #17171a 50%, #101012 100%)`,
                    borderColor: `${color.hex}40`,
                    boxShadow: `0 10px 30px rgba(0,0,0,0.7), 0 0 35px ${color.hex}18`,
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border font-bold"
                            style={{
                              color: color.hex,
                              borderColor: `${color.hex}45`,
                              backgroundColor: `${color.hex}18`,
                            }}
                          >
                            {catName}
                          </span>
                        </div>

                        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-sans">
                          {catName}
                        </h2>

                        {subtitle && (
                          <p className="text-xs sm:text-sm text-zinc-300 font-sans max-w-2xl leading-relaxed">
                            {subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      <AdminOnly>
                        <button
                          type="button"
                          onClick={() => setShowCreateGenreForCat(cat.id)}
                          className="px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider font-black transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
                          style={{
                            backgroundColor: color.hex,
                            color: '#000000',
                            boxShadow: `0 0 20px ${color.hex}50`,
                          }}
                        >
                          <span>+ + ADD NEW GENRE</span>
                        </button>
                      </AdminOnly>

                      <Link
                        to={`/category/${cat.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer shadow-md group/btn"
                        style={{
                          backgroundColor: `${color.hex}20`,
                          borderColor: `${color.hex}40`,
                          borderWidth: '1px',
                          color: color.hex,
                        }}
                      >
                        <span>
                          {lang === 'hi'
                            ? 'सभी विधाएँ देखें'
                            : lang === 'ur'
                            ? 'تمام اصناف دیکھیں'
                            : 'Explore All Genres'}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>

                  {/* Admin Create Genre Inline Form */}
                  {showCreateGenreForCat === cat.id && (
                    <AdminOnly>
                      <form
                        onSubmit={(e) => handleCreateGenre(e, cat.id)}
                        className="mt-6 pt-5 border-t border-white/[0.12] space-y-2.5 animate-fadeIn relative z-20"
                      >
                        <div className="flex flex-col sm:flex-row gap-2.5 items-center">
                          <input
                            type="text"
                            value={newGenreName}
                            onChange={(e) => setNewGenreName(e.target.value)}
                            placeholder={
                              lang === 'hi'
                                ? `नई साहित्यिक विधा हिंदी, अंग्रेज़ी या उर्दू में लिखें (${catName})...`
                                : lang === 'ur'
                                ? `نئی ادبی صنف اردو، ہندی یا انگریزی میں درج کریں (${catName})...`
                                : `Enter new genre in English, Hindi, or Urdu for ${catName}...`
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
                        </div>
                        {newGenreName.trim() && (
                          <div className="px-3.5 py-2 rounded-xl bg-black/60 border border-white/[0.12] text-[11px] text-zinc-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span className="font-mono text-amber-400 font-semibold">AUTO TRILINGUAL:</span>
                            <span><strong>हिंदी:</strong> {previewTrilingual.hi || '...'}</span>
                            <span><strong>English:</strong> {previewTrilingual.en || '...'}</span>
                            <span><strong>اردو:</strong> {previewTrilingual.ur || '...'}</span>
                          </div>
                        )}
                      </form>
                    </AdminOnly>
                  )}
                </div>

                {/* Layer 2: Genre Cards (Uniform, Neat & Saturated with Color) */}
                {genres.length > 0 && (
                  <div className="mb-10">
                    <div className="flex items-center justify-between gap-2 mb-5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full inline-block animate-pulse"
                          style={{ backgroundColor: color.hex, boxShadow: `0 0 10px ${color.hex}` }}
                        />
                        <h3
                          className="text-xs font-mono uppercase tracking-[0.2em] font-black"
                          style={{ color: color.hex }}
                        >
                          {lang === 'hi'
                            ? `प्रमुख विधाएँ — ${catName}`
                            : lang === 'ur'
                            ? `اہم اصناف — ${catName}`
                            : `GENRES UNDER — ${catName}`}
                        </h3>
                      </div>

                      <AdminOnly>
                        <span
                          className="text-xs font-mono tracking-wider px-2.5 py-0.5 rounded-full border"
                          style={{
                            backgroundColor: `${color.hex}15`,
                            borderColor: `${color.hex}35`,
                            color: color.hex,
                          }}
                        >
                          [{genres.length} {lang === 'hi' ? 'विधाएँ' : lang === 'ur' ? 'اصناف' : 'GENRES'}]
                        </span>
                      </AdminOnly>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {genres.slice(0, 6).map((g) => {
                        const gTitle = g[`name_${lang}`] || g.name_hi || g.name_en;
                        const gDesc = g[`description_${lang}`] || g.description_hi || g.description_en;

                        return (
                          <div
                            key={g.id}
                            onClick={() => navigate(`/category/${cat.id}/${g.id}`)}
                            className="group relative p-6 rounded-[24px] border transition-all duration-300 cursor-pointer flex flex-col justify-between"
                            style={{
                              background: `linear-gradient(145deg, ${color.hex}14 0%, #17171a 50%, #101012 100%)`,
                              borderColor: `${color.hex}30`,
                              borderTop: `2px solid ${color.hex}`,
                              boxShadow: `0 8px 24px rgba(0,0,0,0.6)`,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = color.hex;
                              e.currentTarget.style.boxShadow = `0 14px 35px rgba(0,0,0,0.8), 0 0 30px ${color.glow}`;
                              e.currentTarget.style.transform = 'translateY(-3px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = `${color.hex}30`;
                              e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.6)`;
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <h4 className="text-lg font-bold text-white tracking-tight font-sans">
                                  {gTitle}
                                </h4>

                                {/* Admin Only Actions: Edit & Delete */}
                                <AdminOnly>
                                  <div className="flex items-center gap-1 z-20 shrink-0">
                                    <button
                                      type="button"
                                      onClick={(e) => openEditModal(g, cat.id, e)}
                                      title={t.admin?.editBtn || 'Edit'}
                                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.1] transition cursor-pointer"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => openDeleteModal(g, cat.id, e)}
                                      title={t.admin?.deleteBtn || 'Delete'}
                                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </AdminOnly>
                              </div>

                              {gDesc && (
                                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed line-clamp-3 font-sans">
                                  {gDesc}
                                </p>
                              )}
                            </div>

                            <div className="mt-5 pt-3.5 border-t border-white/[0.08] flex items-center justify-end">
                              <span
                                className="inline-flex items-center justify-center transition-transform group-hover:translate-x-1"
                                style={{ color: color.hex }}
                              >
                                <ArrowRight className="w-4 h-4" />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Featured Books Grid for this Category */}
                {catBooks.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color.hex }} />
                      <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                        {lang === 'hi'
                          ? `प्रमुख पुस्तकें — ${catName}`
                          : lang === 'ur'
                          ? `منتخب کتب — ${catName}`
                          : `KEY ARCHIVAL WORKS — ${catName}`}
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                      {catBooks.slice(0, 4).map((book) => (
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
        </div>
      )}

      {/* 4. Main General Catalog Grid (for search or full directory sorting) */}
      <main id="catalog" className="flex-1 pt-8 border-t border-white/[0.08]">
        <div className="mb-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-400 block mb-1">
            {lang === 'hi' ? 'समग्र पुस्तकालय सूची' : lang === 'ur' ? 'مکمل فہرست کتب خانہ' : 'COMPLETE LIBRARY CATALOG'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-sans">
            {searchQuery ? `${lang === 'hi' ? 'खोज परिणाम' : lang === 'ur' ? 'نتائج تلاش' : 'Search Results for'} "${searchQuery}"` : (lang === 'hi' ? 'समस्त पुस्तकें व कृतियाँ' : lang === 'ur' ? 'تمام کتب و شاہکار' : 'All Books & Works')}
          </h2>
        </div>

        <BookGrid
          books={books}
          categories={categories}
          selectedCategory="all"
          onSelectCategory={handleSelectCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery('')}
          lang={lang}
          t={t}
          onSelectBook={onSelectBook}
          onOpenReader={onOpenReader}
          onDownloadBook={onDownloadBook}
          onEditBook={onEditBook}
        />
      </main>

      {/* Edit Genre Modal (Admin) */}
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
                  Genre Title (Devanagari / हिंदी)
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
                  Genre Title (Urdu / اردو)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={editNameUr}
                  onChange={(e) => setEditNameUr(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-black/50 border border-white/[0.1] text-white rounded-lg focus:border-white outline-hidden font-urdu"
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

      {/* Delete Genre Confirmation Modal (Admin) */}
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
