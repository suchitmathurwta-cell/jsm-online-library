import React, { useState } from 'react';
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
  Sparkles,
  Plus,
  Check,
  ChevronRight,
  FolderOpen
} from 'lucide-react';

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

const categoryThemes = {
  'novel': {
    cardBg: 'bg-amber-50/60 hover:bg-amber-100/50',
    borderColor: 'border-amber-200/70 hover:border-amber-400/80',
    iconBg: 'bg-amber-100 text-amber-800',
    titleColor: 'text-amber-950',
    subColor: 'text-amber-900/70',
    badgeBg: 'bg-white/90 text-amber-900 border-amber-200/80',
    activeRing: 'ring-2 ring-amber-500 bg-amber-100/80',
    activePill: 'bg-amber-700 text-white shadow-xs',
    inactivePill: 'bg-amber-50/90 text-amber-900 hover:bg-amber-100 border-amber-200/80'
  },
  'story': {
    cardBg: 'bg-emerald-50/60 hover:bg-emerald-100/50',
    borderColor: 'border-emerald-200/70 hover:border-emerald-400/80',
    iconBg: 'bg-emerald-100 text-emerald-800',
    titleColor: 'text-emerald-950',
    subColor: 'text-emerald-900/70',
    badgeBg: 'bg-white/90 text-emerald-900 border-emerald-200/80',
    activeRing: 'ring-2 ring-emerald-500 bg-emerald-100/80',
    activePill: 'bg-emerald-700 text-white shadow-xs',
    inactivePill: 'bg-emerald-50/90 text-emerald-900 hover:bg-emerald-100 border-emerald-200/80'
  },
  'poetry': {
    cardBg: 'bg-purple-50/60 hover:bg-purple-100/50',
    borderColor: 'border-purple-200/70 hover:border-purple-400/80',
    iconBg: 'bg-purple-100 text-purple-800',
    titleColor: 'text-purple-950',
    subColor: 'text-purple-900/70',
    badgeBg: 'bg-white/90 text-purple-900 border-purple-200/80',
    activeRing: 'ring-2 ring-purple-500 bg-purple-100/80',
    activePill: 'bg-purple-700 text-white shadow-xs',
    inactivePill: 'bg-purple-50/90 text-purple-900 hover:bg-purple-100 border-purple-200/80'
  },
  'magazines': {
    cardBg: 'bg-sky-50/60 hover:bg-sky-100/50',
    borderColor: 'border-sky-200/70 hover:border-sky-400/80',
    iconBg: 'bg-sky-100 text-sky-800',
    titleColor: 'text-sky-950',
    subColor: 'text-sky-900/70',
    badgeBg: 'bg-white/90 text-sky-900 border-sky-200/80',
    activeRing: 'ring-2 ring-sky-500 bg-sky-100/80',
    activePill: 'bg-sky-700 text-white shadow-xs',
    inactivePill: 'bg-sky-50/90 text-sky-900 hover:bg-sky-100 border-sky-200/80'
  },
  'vimarsh': {
    cardBg: 'bg-rose-50/60 hover:bg-rose-100/50',
    borderColor: 'border-rose-200/70 hover:border-rose-400/80',
    iconBg: 'bg-rose-100 text-rose-800',
    titleColor: 'text-rose-950',
    subColor: 'text-rose-900/70',
    badgeBg: 'bg-white/90 text-rose-900 border-rose-200/80',
    activeRing: 'ring-2 ring-rose-500 bg-rose-100/80',
    activePill: 'bg-rose-700 text-white shadow-xs',
    inactivePill: 'bg-rose-50/90 text-rose-900 hover:bg-rose-100 border-rose-200/80'
  },
  'cultural-conscience': {
    cardBg: 'bg-blue-50/60 hover:bg-blue-100/50',
    borderColor: 'border-blue-200/70 hover:border-blue-400/80',
    iconBg: 'bg-blue-100 text-blue-800',
    titleColor: 'text-blue-950',
    subColor: 'text-blue-900/70',
    badgeBg: 'bg-white/90 text-blue-900 border-blue-200/80',
    activeRing: 'ring-2 ring-blue-500 bg-blue-100/80',
    activePill: 'bg-blue-700 text-white shadow-xs',
    inactivePill: 'bg-blue-50/90 text-blue-900 hover:bg-blue-100 border-blue-200/80'
  },
  'drama': {
    cardBg: 'bg-orange-50/60 hover:bg-orange-100/50',
    borderColor: 'border-orange-200/70 hover:border-orange-400/80',
    iconBg: 'bg-orange-100 text-orange-800',
    titleColor: 'text-orange-950',
    subColor: 'text-orange-900/70',
    badgeBg: 'bg-white/90 text-orange-900 border-orange-200/80',
    activeRing: 'ring-2 ring-orange-500 bg-orange-100/80',
    activePill: 'bg-orange-700 text-white shadow-xs',
    inactivePill: 'bg-orange-50/90 text-orange-900 hover:bg-orange-100 border-orange-200/80'
  },
  'satire': {
    cardBg: 'bg-yellow-50/60 hover:bg-yellow-100/50',
    borderColor: 'border-yellow-200/70 hover:border-yellow-400/80',
    iconBg: 'bg-yellow-100 text-yellow-800',
    titleColor: 'text-yellow-950',
    subColor: 'text-yellow-900/70',
    badgeBg: 'bg-white/90 text-yellow-900 border-yellow-200/80',
    activeRing: 'ring-2 ring-yellow-500 bg-yellow-100/80',
    activePill: 'bg-amber-600 text-white shadow-xs',
    inactivePill: 'bg-yellow-50/90 text-yellow-900 hover:bg-yellow-100 border-yellow-200/80'
  },
  'essays': {
    cardBg: 'bg-teal-50/60 hover:bg-teal-100/50',
    borderColor: 'border-teal-200/70 hover:border-teal-400/80',
    iconBg: 'bg-teal-100 text-teal-800',
    titleColor: 'text-teal-950',
    subColor: 'text-teal-900/70',
    badgeBg: 'bg-white/90 text-teal-900 border-teal-200/80',
    activeRing: 'ring-2 ring-teal-500 bg-teal-100/80',
    activePill: 'bg-teal-700 text-white shadow-xs',
    inactivePill: 'bg-teal-50/90 text-teal-900 hover:bg-teal-100 border-teal-200/80'
  }
};

export default function CategoryTiles({
  t,
  lang,
  categories = [],
  selectedCategory,
  onSelectCategory,
  selectedSubGenre,
  onSelectSubGenre,
  onCreateSubGenreClick
}) {
  const [showSubGenrePrompt, setShowSubGenrePrompt] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [isSubmittingSub, setIsSubmittingSub] = useState(false);

  // Active Category Object
  const activeCategoryObj = categories.find(c => c.id === selectedCategory);
  const activeSubGenres = activeCategoryObj?.subgenres || [];
  const theme = (activeCategoryObj && categoryThemes[activeCategoryObj.id]) || {
    cardBg: 'bg-stone-50 hover:bg-stone-100',
    borderColor: 'border-stone-200',
    iconBg: 'bg-stone-100 text-stone-800',
    titleColor: 'text-stone-900',
    subColor: 'text-stone-500',
    badgeBg: 'bg-white text-stone-700 border-stone-200',
    activeRing: 'ring-2 ring-[#1d4ed8]',
    activePill: 'bg-stone-900 text-white shadow-xs',
    inactivePill: 'bg-stone-100 text-stone-700 hover:bg-stone-200 border-stone-200'
  };

  const handleCreateSubGenreInline = async (e) => {
    e.preventDefault();
    if (!newSubName.trim() || !selectedCategory || selectedCategory === 'all') return;
    setIsSubmittingSub(true);
    try {
      if (onCreateSubGenreClick) {
        await onCreateSubGenreClick(newSubName.trim(), selectedCategory);
      }
      setNewSubName('');
      setShowSubGenrePrompt(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingSub(false);
    }
  };

  return (
    <section className="py-8 bg-white border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Layer 1: Section Heading */}
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-5 h-1 bg-[#1d4ed8] rounded-full"></div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0f172a] font-rekhta-serif tracking-tight">
              {t.sections.browseBy}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 font-normal pl-7">
            {t.sections.browseBySub}
          </p>
        </div>

        {/* Layer 1: Main Category Buttons / Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          
          {/* 1. All Genres Card */}
          <div className="flex flex-col">
            <button
              onClick={() => {
                onSelectCategory('all');
                if (onSelectSubGenre) onSelectSubGenre('all');
              }}
              className={`group relative rounded-2xl p-3.5 text-left transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between min-h-[118px] border ${
                selectedCategory === 'all'
                  ? 'bg-stone-900 text-white border-stone-900 ring-2 ring-stone-900/20'
                  : 'bg-stone-50 hover:bg-stone-100/80 text-stone-800 border-stone-200/80'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                  selectedCategory === 'all' ? 'bg-white/15 text-amber-300' : 'bg-white text-stone-700 shadow-2xs border border-stone-200/60'
                }`}>
                  <Layers className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border shadow-2xs ${
                  selectedCategory === 'all' ? 'bg-white/20 text-white border-white/20' : 'bg-white text-stone-600 border-stone-200/80'
                }`}>
                  ALL
                </span>
              </div>
              <div className="mt-2.5">
                <h3 className="font-hindi-serif font-bold text-sm leading-snug">
                  {t.sections.allCategories}
                </h3>
                <p className={`text-[10.5px] mt-0.5 line-clamp-1 ${
                  selectedCategory === 'all' ? 'text-stone-300' : 'text-stone-500'
                }`}>
                  {t.sections.allCategoriesSub}
                </p>
              </div>
            </button>
          </div>

          {/* 2+. Dynamic Category Cards */}
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon] || BookOpen;
            const catTheme = categoryThemes[cat.id] || {
              cardBg: 'bg-stone-50 hover:bg-stone-100',
              borderColor: 'border-stone-200',
              iconBg: 'bg-stone-100 text-stone-800',
              titleColor: 'text-stone-900',
              subColor: 'text-stone-500',
              badgeBg: 'bg-white text-stone-700 border-stone-200',
              activeRing: 'ring-2 ring-[#1d4ed8]'
            };

            const isSelected = selectedCategory === cat.id;
            const title = cat[`name_${lang}`] || cat.name_hi || cat.name_en;
            const subtitle = cat[`subtitle_${lang}`] || cat.subtitle_hi || cat.subtitle_en;

            return (
              <div key={cat.id} className="flex flex-col">
                <button
                  onClick={() => {
                    const nextCat = isSelected ? 'all' : cat.id;
                    onSelectCategory(nextCat);
                    if (onSelectSubGenre) onSelectSubGenre('all');
                  }}
                  className={`group relative rounded-2xl p-3.5 text-left transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between min-h-[118px] w-full border ${catTheme.cardBg} ${catTheme.borderColor} ${
                    isSelected ? catTheme.activeRing + ' shadow-sm' : ''
                  }`}
                >
                  {/* Top Row */}
                  <div className="flex items-center justify-between w-full">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-2xs transition-transform group-hover:scale-105 ${catTheme.iconBg}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {cat.count !== undefined && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shadow-2xs ${catTheme.badgeBg}`}>
                        {cat.count} {t.sections.worksUnit}
                      </span>
                    )}
                  </div>

                  {/* Bottom Row */}
                  <div className="mt-2.5">
                    <h3 className={`font-hindi-serif font-bold text-sm leading-snug ${catTheme.titleColor}`}>
                      {title}
                    </h3>
                    {subtitle && (
                      <p className={`text-[10.5px] mt-0.5 line-clamp-1 font-normal ${catTheme.subColor}`}>
                        {subtitle}
                      </p>
                    )}
                  </div>

                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 bg-[#1d4ed8] text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shadow-xs">
                      ✓
                    </div>
                  )}
                </button>
              </div>
            );
          })}

        </div>

        {/* Layer 2: Subsequent Sub-Genre & Sub-Section Layer Inside Selected Main Category */}
        {selectedCategory !== 'all' && activeCategoryObj && (
          <div className="mt-6 pt-5 border-t border-stone-200/90 animate-fadeIn">
            <div className="bg-stone-50/90 rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-xs">
              
              {/* Sub-Layer Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#1d4ed8]"></div>
                  <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>{lang === 'hi' ? 'उप-विधाएँ व विशिष्ट उप-खंड' : (lang === 'ur' ? 'ذیلی اصناف و ابواب' : 'Sub-Genres & Dedicated Sub-Sections')}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                    <span className="text-[#1d4ed8] font-bold normal-case">
                      {activeCategoryObj[`name_${lang}`] || activeCategoryObj.name_hi || activeCategoryObj.name_en}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSubGenrePrompt(!showSubGenrePrompt)}
                    className="text-xs font-bold text-[#1d4ed8] hover:text-[#1e40af] bg-blue-50/80 hover:bg-blue-100/80 px-3 py-1.5 rounded-xl border border-blue-200 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{lang === 'hi' ? '+ नया उप-वर्ग जोड़ें' : '+ Create New Sub-Genre'}</span>
                  </button>
                </div>
              </div>

              {/* Inline Subgenre Creator Form if opened */}
              {showSubGenrePrompt && (
                <form onSubmit={handleCreateSubGenreInline} className="mb-3.5 p-3 bg-white rounded-xl border border-blue-200 flex items-center gap-2 shadow-xs animate-fadeIn">
                  <input
                    type="text"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    placeholder={lang === 'hi' ? 'नए उप-वर्ग का नाम टाइप करें...' : 'Type new sub-genre name (e.g. Marsiya, Ghazal)...'}
                    className="flex-1 px-3 py-1.5 text-xs border border-stone-300 rounded-lg outline-hidden focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8]"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingSub || !newSubName.trim()}
                    className="px-4 py-1.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs font-bold rounded-lg transition cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingSub ? 'Creating...' : '+ Create & Open Sub-Page'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowSubGenrePrompt(false); setNewSubName(''); }}
                    className="px-2.5 py-1.5 text-stone-500 hover:text-stone-800 text-xs rounded-lg transition"
                  >
                    Cancel
                  </button>
                </form>
              )}

              {/* Sub-Genre Pills Layer */}
              <div className="flex flex-wrap items-center gap-2">
                
                {/* "All in Category" Pill */}
                <button
                  type="button"
                  onClick={() => onSelectSubGenre && onSelectSubGenre('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    !selectedSubGenre || selectedSubGenre === 'all'
                      ? theme.activePill || 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300 shadow-2xs'
                  }`}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'hi'
                      ? `समग्र ${activeCategoryObj.name_hi || activeCategoryObj.name_en}`
                      : `All ${activeCategoryObj.name_en || activeCategoryObj.name_hi}`}
                  </span>
                </button>

                {/* Individual Sub-Genre Pills */}
                {activeSubGenres.map((sg) => {
                  const sgTitle = sg[`name_${lang}`] || sg.name_hi || sg.name_en || sg.name;
                  const isSgActive = selectedSubGenre === sg.id || selectedSubGenre === sg.name_hi || selectedSubGenre === sg.name_en;

                  return (
                    <button
                      key={sg.id}
                      type="button"
                      onClick={() => onSelectSubGenre && onSelectSubGenre(isSgActive ? 'all' : sg.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                        isSgActive
                          ? theme.activePill || 'bg-[#1d4ed8] text-white border-[#1d4ed8] shadow-xs'
                          : theme.inactivePill || 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200/90 shadow-2xs'
                      }`}
                    >
                      <span>{sgTitle}</span>
                      {isSgActive && <Check className="w-3.5 h-3.5 ml-0.5" />}
                    </button>
                  );
                })}

                {/* If no subgenres yet */}
                {activeSubGenres.length === 0 && (
                  <span className="text-xs text-stone-400 italic">
                    {lang === 'hi' ? 'कोई उप-वर्ग उपलब्ध नहीं है। ऊपर क्लिक करके जोड़ें।' : 'No sub-genres yet. Click "+ Create New Sub-Genre" to add one.'}
                  </span>
                )}

              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
