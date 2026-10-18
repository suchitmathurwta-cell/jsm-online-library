import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronRight } from 'lucide-react';
import { AdminOnly } from './AdminGuard';
import { createSubgenre } from '../services/supabaseApi';
import { getTrilingualNames } from '../services/transliterationService';
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
        const { name_en, name_hi, name_ur } = await getTrilingualNames(newSubName.trim());
        await createSubgenre({
          id: subId,
          category_id: selectedCategory,
          genre_id: firstGenreId,
          name_hi: name_hi || newSubName.trim(),
          name_en: name_en || newSubName.trim(),
          name_ur: name_ur || undefined
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
        
        {/* Title Lockup */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/[0.08] pb-10 mb-10">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-400 block mb-3">
              {lang === 'hi'
                ? 'जेएसएम ऑनलाइन लाइब्रेरी • संग्रह अवलोकन'
                : lang === 'ur'
                ? 'جے ایس ایم آن لائن لائبریری • مجموعات کا جائزہ'
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
          <div className="mt-4 md:mt-0 max-w-sm">
            <p className="font-mono text-xs text-zinc-400 leading-relaxed uppercase tracking-wider">
              {lang === 'hi'
                ? 'भारतीय उपमहाद्वीप के कालजयी साहित्य, विचार और दुर्लभ पांडुलिपियों का संरक्षित डिजिटल संग्रह।'
                : lang === 'ur'
                ? 'کلاسیکی ادب، فکری مضامین اور نایاب مخطوطات کا محفوظ ڈیجیٹل کتب خانہ۔'
                : 'Preserving timeless literature, poetry & progressive thought across 9 curated collections.'}
            </p>
          </div>
        </div>

        {/* Uniform, Neat & Tidy Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {categories.map((cat, idx) => {
            // Language uniformity: strictly one language at a time matching active selection
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
                className="w-full"
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
