import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Scroll,
  Feather,
  Theater,
  Brain,
  Smile,
  FileText,
  Newspaper,
  MessagesSquare,
  Layers,
  ArrowRight,
  Plus,
  ChevronRight,
  FolderOpen
} from 'lucide-react';
import { AdminOnly } from './AdminGuard';
import { createSubgenre } from '../services/supabaseApi';
import { containerVariants, itemVariants } from './BentoGrid';

const iconMap = {
  BookOpen,
  Scroll,
  Feather,
  Theater,
  Brain,
  Smile,
  FileText,
  Newspaper,
  MessagesSquare,
  Layers
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
  const [isSubmittingSub, setIsSubmittingSub] = useState(false);

  // Active Category Object
  const activeCategoryObj = categories.find((c) => c.id === selectedCategory);
  const activeSubGenres = activeCategoryObj?.subgenres || [];

  const handleCreateSubGenreInline = async (e) => {
    e.preventDefault();
    if (!newSubName.trim() || !selectedCategory || selectedCategory === 'all') return;
    setIsSubmittingSub(true);
    try {
      if (onCreateSubGenreClick) {
        await onCreateSubGenreClick(newSubName.trim(), selectedCategory);
      } else {
        const subId =
          newSubName
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') || 'sg-' + Date.now();
        const firstGenreId = activeCategoryObj?.genres?.[0]?.id || 'general';
        await createSubgenre({
          id: subId,
          category_id: selectedCategory,
          genre_id: firstGenreId,
          name_hi: newSubName.trim(),
          name_en: newSubName.trim()
        });
        if (onRefreshCategories) await onRefreshCategories();
      }
      setNewSubName('');
      setShowSubGenrePrompt(false);
    } catch (err) {
      console.error('Error creating subgenre:', err);
    } finally {
      setIsSubmittingSub(false);
    }
  };

  return (
    <section className="py-12 bg-[#FAFAFA] border-b border-black/[0.05]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header: Minimalist Studio Typography */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 pb-4 border-b border-black/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#111111] rounded-full inline-block"></span>
              <h2 className="text-sm font-mono uppercase tracking-wider text-[#111111]">
                {t.sections.browseBy || 'Taxonomy & Domains'}
              </h2>
            </div>
            <p className="text-xs text-zinc-500 mt-1 pl-3.5">
              {t.sections.browseBySub || 'Primary Cultural & Literary Divisions'}
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400 mt-1 sm:mt-0">
            {categories.length} {t.hierarchyLayers?.genresUnit || 'Domains'}
          </span>
        </div>

        {/* Asymmetrical Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {/* Bento Tile 0: All Categories Overview (Spans 2 cols on md/lg for asymmetric balance) */}
          <motion.div
            variants={itemVariants}
            onClick={() => {
              onSelectCategory('all');
              if (onSelectSubGenre) onSelectSubGenre('all');
            }}
            className={`group sm:col-span-2 relative p-6 rounded-3xl bg-white border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] hover:border-black/15 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
              selectedCategory === 'all'
                ? 'ring-2 ring-[#111111] border-transparent'
                : ''
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-zinc-100 text-[#111111] flex items-center justify-center transition-transform group-hover:scale-105">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-medium border border-zinc-200/60">
                  ALL
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#111111] tracking-tight font-sans">
                {t.sections.allCategories}
              </h3>
              <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed max-w-md font-sans">
                {t.sections.allCategoriesSub}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400">
                {categories.reduce((acc, c) => acc + (c.count || 0), 0)} works indexed
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#111111] group-hover:translate-x-1 transition-transform">
                <span>View Register</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </motion.div>

          {/* 9 Category Bento Tiles */}
          {categories.map((cat, idx) => {
            const Icon = iconMap[cat.icon] || BookOpen;
            const isSelected = selectedCategory === cat.id;
            const title = cat['name_' + lang] || cat.name_hi || cat.name_en;
            const subtitle = cat['subtitle_' + lang] || cat.subtitle_hi || cat.subtitle_en;
            // Bento asymmetry: make every 4th tile span 2 columns on lg
            const isFeatured = idx === 1 || idx === 4;

            return (
              <motion.div
                key={cat.id}
                variants={itemVariants}
                onClick={() => {
                  const nextCat = isSelected ? 'all' : cat.id;
                  onSelectCategory(nextCat);
                  if (onSelectSubGenre) onSelectSubGenre('all');
                }}
                className={`group ${
                  isFeatured ? 'sm:col-span-2' : 'col-span-1'
                } relative p-6 rounded-3xl bg-white border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] hover:border-black/15 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  isSelected ? 'ring-2 ring-[#111111] border-transparent' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-100 text-[#111111] flex items-center justify-center transition-transform group-hover:scale-105">
                      <Icon className="w-5 h-5" />
                    </div>
                    {cat.count !== undefined && (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-50 text-zinc-500 border border-zinc-200/60">
                        {cat.count}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[#111111] tracking-tight font-sans">
                    {title}
                  </h3>

                  {subtitle && (
                    <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed line-clamp-2 font-sans">
                      {subtitle}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-zinc-400">
                    {cat.subgenres?.length || cat.genres?.length || 0} sub-divisions
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#111111] group-hover:translate-x-1 transition-transform">
                    <span>Explore</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Inline Sub-Genre Expansion Container (Layer 1 ➔ Layer 2 inline peek) */}
        {selectedCategory !== 'all' && activeCategoryObj && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-6 rounded-3xl bg-white border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.03)]"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <span>{t.hierarchyLayers?.subGenresAndSections || 'Sub-Divisions'}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-[#111111] font-bold normal-case">
                    {activeCategoryObj['name_' + lang] || activeCategoryObj.name_hi || activeCategoryObj.name_en}
                  </span>
                </span>
              </div>

              <AdminOnly>
                <button
                  type="button"
                  onClick={() => setShowSubGenrePrompt(!showSubGenrePrompt)}
                  className="text-xs font-medium text-[#111111] hover:text-black px-3 py-1.5 rounded-full border border-zinc-200 hover:border-black flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{t.hierarchyLayers?.createSubgenre || '+ Create New Sub-Genre'}</span>
                </button>
              </AdminOnly>
            </div>

            {/* Inline Subgenre Creator Form (Admin Only) */}
            {showSubGenrePrompt && (
              <AdminOnly>
                <form
                  onSubmit={handleCreateSubGenreInline}
                  className="mb-4 p-3 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center gap-2 animate-fadeIn"
                >
                  <input
                    type="text"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    placeholder={
                      lang === 'hi'
                        ? 'नए उप-वर्ग का नाम लिखें...'
                        : lang === 'ur'
                        ? 'نئی ذیلی صنف کا نام لکھیں...'
                        : 'Enter new sub-genre title...'
                    }
                    className="flex-1 px-3 py-2 text-xs border border-zinc-200 rounded-xl outline-hidden focus:border-black bg-white"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingSub || !newSubName.trim()}
                    className="px-4 py-2 bg-[#111111] hover:bg-black text-white text-xs font-medium rounded-xl transition cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingSub ? '...' : '+ Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSubGenrePrompt(false)}
                    className="px-3 py-2 text-xs text-zinc-500 hover:text-black cursor-pointer"
                  >
                    Cancel
                  </button>
                </form>
              </AdminOnly>
            )}

            {/* Sub-genres Chips */}
            {activeSubGenres.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectSubGenre && onSelectSubGenre('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                    !selectedSubGenre || selectedSubGenre === 'all'
                      ? 'bg-[#111111] text-white shadow-xs'
                      : 'bg-zinc-50 text-zinc-600 hover:text-black border border-zinc-200'
                  }`}
                >
                  All ({activeSubGenres.length})
                </button>

                {activeSubGenres.map((sg) => {
                  const sgTitle = sg['name_' + lang] || sg.name_hi || sg.name_en;
                  const isSgActive = selectedSubGenre === sg.id || selectedSubGenre === sg.name_hi;

                  return (
                    <button
                      key={sg.id}
                      type="button"
                      onClick={() => onSelectSubGenre && onSelectSubGenre(sg.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                        isSgActive
                          ? 'bg-[#111111] text-white shadow-xs'
                          : 'bg-white text-zinc-700 hover:text-black border border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <span>{sgTitle}</span>
                      {sg.count !== undefined && (
                        <span className="text-[10px] opacity-60 font-mono">
                          {sg.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-zinc-400">
                <FolderOpen className="w-6 h-6 mx-auto mb-1 opacity-40" />
                <p>{t.hierarchyLayers?.noWorksDesc || 'No sub-genres cataloged yet under this domain.'}</p>
              </div>
            )}
          </motion.div>
        )}

      </div>
    </section>
  );
}
