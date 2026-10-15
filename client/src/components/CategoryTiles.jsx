import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronRight } from 'lucide-react';
import { AdminOnly } from './AdminGuard';
import { createSubgenre } from '../services/supabaseApi';
import ArchiveCard from './bento/ArchiveCard';

// Mugen Asymmetric Grid Specs for the 9 Categories
const bentoLayouts = [
  { colSpan: 'md:col-span-8', aspectRatio: 'aspect-[16/10]' }, // 01 Novel (Large Feature)
  { colSpan: 'md:col-span-4', aspectRatio: 'aspect-[4/3]' },   // 02 Story (Tall Secondary)
  { colSpan: 'md:col-span-4', aspectRatio: 'aspect-[4/3]' },   // 03 Poetry (Grid Regular)
  { colSpan: 'md:col-span-4', aspectRatio: 'aspect-[4/3]' },   // 04 Magazines (Grid Regular)
  { colSpan: 'md:col-span-4', aspectRatio: 'aspect-[4/3]' },   // 05 Discourse (Grid Regular)
  { colSpan: 'md:col-span-6', aspectRatio: 'aspect-[16/11]' }, // 06 Conscience (Split Feature)
  { colSpan: 'md:col-span-6', aspectRatio: 'aspect-[16/11]' }, // 07 Satire (Split Feature)
  { colSpan: 'md:col-span-4', aspectRatio: 'aspect-[4/3]' },   // 08 Drama (Secondary)
  { colSpan: 'md:col-span-8', aspectRatio: 'aspect-[16/10]' }, // 09 Essays (Large Feature)
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
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
    <section className="text-white">
      <div className="w-full py-6">
        
        {/* Mugen Massive Title Lockup */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/[0.08] pb-10 mb-12">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-400 block mb-3">
              CHETNA DIGITAL ARCHIVE • VOL. 01
            </span>
            <h1 className="text-5xl md:text-8xl font-bold tracking-[-0.04em] text-white font-sans">
              Open Repository.
            </h1>
          </div>
          <div className="mt-6 md:mt-0 max-w-sm">
            <p className="font-mono text-xs text-zinc-400 leading-relaxed uppercase tracking-wider">
              Preserving vernacular literature, progressive discourse & digitized manuscripts.
            </p>
          </div>
        </div>

        {/* Mugen Asymmetric Showcase Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-12 gap-4"
        >
          {categories.map((cat, idx) => {
            const layout = bentoLayouts[idx % bentoLayouts.length];
            const titleEn = cat.name_en || cat.name_hi;
            const vernacularTitle =
              lang === 'hi'
                ? cat.name_hi
                : lang === 'ur'
                ? cat.name_ur
                : cat.name_hi !== cat.name_en
                ? cat.name_hi
                : undefined;

            return (
              <motion.div
                key={cat.id}
                variants={itemVariants}
                className={layout.colSpan}
              >
                <ArchiveCard
                  title={titleEn}
                  vernacularTitle={vernacularTitle}
                  category={cat.name_en || 'Taxonomy'}
                  workCount={cat.count || 0}
                  slug={cat.id}
                  colSpan="w-full"
                  aspectRatio={layout.aspectRatio}
                  coverImage={cat.cover_url}
                  onClick={() => {
                    if (onSelectCategory) {
                      onSelectCategory(cat.id);
                    }
                  }}
                />
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
                  <span>{t.hierarchyLayers?.subGenresAndSections || 'SUB-DIVISIONS'}</span>
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
                  <span>{t.admin?.createSubGenre || '+ NEW SUB-GENRE'}</span>
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
                    {sg.count !== undefined && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        isSgActive ? 'bg-black/20 text-black' : 'bg-white/[0.08] text-zinc-400'
                      }`}>
                        {sg.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Inline Admin Form to Create New Sub-Genre */}
            {showSubGenrePrompt && (
              <form onSubmit={handleCreateSubGenreInline} className="mt-6 p-4 rounded-2xl bg-black/50 border border-white/[0.08] flex items-center gap-2">
                <input
                  type="text"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="Sub-Genre Title (e.g. Dalit Literature / Romanticism)..."
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
              </form>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
