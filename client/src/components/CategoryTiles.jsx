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
import ArchiveCard from './bento/ArchiveCard';

const iconMap = {
  novel: BookOpen,
  story: Scroll,
  poetry: Feather,
  magazines: Newspaper,
  vimarsh: Brain,
  'cultural-conscience': Layers,
  satire: Smile,
  drama: Theater,
  essays: FileText,
  default: BookOpen
};

// Asymmetrical Mugen 12-column layout spans
const bentoColSpans = [
  'col-span-12 md:col-span-7 lg:col-span-7', // 01 Novel (Hero/Wide)
  'col-span-12 md:col-span-5 lg:col-span-5', // 02 Story
  'col-span-12 md:col-span-4 lg:col-span-4', // 03 Poetry
  'col-span-12 md:col-span-4 lg:col-span-4', // 04 Magazines
  'col-span-12 md:col-span-4 lg:col-span-4', // 05 Discourse
  'col-span-12 md:col-span-6 lg:col-span-6', // 06 Conscience
  'col-span-12 md:col-span-6 lg:col-span-6', // 07 Satire
  'col-span-12 md:col-span-5 lg:col-span-5', // 08 Drama
  'col-span-12 md:col-span-7 lg:col-span-7', // 09 Essays
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
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 28,
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
    <section className="py-12 bg-[#FAFAFA] border-b border-black/[0.05]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header: Minimalist Mugen Studio Typography */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 pb-4 border-b border-black/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#111111] rounded-full inline-block" />
              <h2 className="text-xs font-mono uppercase tracking-wider text-[#111111]">
                {t.sections.browseBy || '4-Layer Literary Taxonomy · Categories'}
              </h2>
            </div>
            <p className="text-xs text-zinc-500 mt-1 font-sans">
              Asymmetrical 12-Column Archive Bento Grid
            </p>
          </div>

          <div className="mt-3 sm:mt-0 flex items-center gap-3 text-xs font-mono text-zinc-400">
            <span>{categories.length} Taxonomy Domains</span>
            <span>·</span>
            <span>{categories.reduce((acc, c) => acc + (c.count || 0), 0)} Total Works</span>
          </div>
        </div>

        {/* 12-Column Mugen Bento Grid with ArchiveCard */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-12 gap-6"
        >
          {categories.map((cat, idx) => {
            const Icon = iconMap[cat.id] || iconMap.default;
            const isSelected = selectedCategory === cat.id;
            const titleEn = cat.name_en || cat.name_hi;
            const titleVernacular = cat['name_' + lang] || cat.name_hi || cat.name_ur;
            const subtitle = cat['subtitle_' + lang] || cat.subtitle_hi || cat.subtitle_en;
            const colSpan = bentoColSpans[idx % bentoColSpans.length];

            return (
              <motion.div key={cat.id} variants={itemVariants} className={colSpan}>
                <ArchiveCard
                  id={cat.id}
                  indexNumber={idx + 1}
                  titleEn={titleEn}
                  titleVernacular={titleVernacular !== titleEn ? titleVernacular : undefined}
                  subtitle={subtitle}
                  workCount={cat.count || 0}
                  subdivisionCount={cat.subgenres?.length || cat.genres?.length || 0}
                  icon={Icon}
                  colSpan="col-span-12"
                  isSelected={isSelected}
                  onClick={() => {
                    const nextCat = isSelected ? 'all' : cat.id;
                    onSelectCategory(nextCat);
                    if (onSelectSubGenre) onSelectSubGenre('all');
                  }}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Inline Sub-Genre Expansion Container (Layer 1 ➔ Layer 2 inline peek) */}
        {selectedCategory !== 'all' && activeCategoryObj && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.03)]"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <span>{t.hierarchyLayers?.subGenresAndSections || 'Sub-Divisions'}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-black font-semibold">
                    {activeCategoryObj['name_' + lang] || activeCategoryObj.name_hi || activeCategoryObj.name_en}
                  </span>
                </span>
              </div>

              {/* Admin Action: Add Sub-genre */}
              <AdminOnly>
                <button
                  type="button"
                  onClick={() => setShowSubGenrePrompt(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.admin?.createSubGenre || '+ New Sub-Genre'}</span>
                </button>
              </AdminOnly>
            </div>

            {/* Quick Filter Pill Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onSelectSubGenre && onSelectSubGenre('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium font-sans transition cursor-pointer ${
                  selectedSubGenre === 'all' || !selectedSubGenre
                    ? 'bg-[#111111] text-white shadow-xs'
                    : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border border-zinc-200/60'
                }`}
              >
                {t.filters?.allSubGenres || 'All Sub-Divisions'}
              </button>

              {activeSubGenres.map((sg) => {
                const isSgActive = selectedSubGenre === sg.id;
                const sgName = sg['name_' + lang] || sg.name_hi || sg.name_en;
                return (
                  <button
                    key={sg.id}
                    type="button"
                    onClick={() => onSelectSubGenre && onSelectSubGenre(sg.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium font-sans transition cursor-pointer flex items-center gap-1.5 ${
                      isSgActive
                        ? 'bg-[#111111] text-white shadow-xs'
                        : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border border-zinc-200/60'
                    }`}
                  >
                    <span>{sgName}</span>
                    {sg.count !== undefined && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        isSgActive ? 'bg-white/20 text-white' : 'bg-zinc-200/80 text-zinc-500'
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
              <form onSubmit={handleCreateSubGenreInline} className="mt-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center gap-2">
                <input
                  type="text"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="Sub-Genre Title (उदा. दलित विमर्श / Romanticism)..."
                  className="flex-1 px-3 py-2 bg-white rounded-xl border border-zinc-200 text-xs text-[#111111] focus:outline-none focus:ring-1 focus:ring-black"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isSubmittingSub || !newSubName.trim()}
                  className="px-4 py-2 bg-[#111111] text-white text-xs font-medium rounded-xl hover:bg-black disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingSub ? 'Adding...' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubGenrePrompt(false)}
                  className="px-3 py-2 bg-zinc-200 text-zinc-600 text-xs font-medium rounded-xl hover:bg-zinc-300 cursor-pointer"
                >
                  Cancel
                </button>
              </form>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
