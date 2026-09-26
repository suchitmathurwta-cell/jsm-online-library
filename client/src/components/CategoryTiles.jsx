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
import { AdminOnly } from './AdminGuard';
import { createSubgenre } from '../services/supabaseApi';

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
  const activeCategoryObj = categories.find(c => c.id === selectedCategory);
  const activeSubGenres = activeCategoryObj?.subgenres || [];

  const handleCreateSubGenreInline = async (e) => {
    e.preventDefault();
    if (!newSubName.trim() || !selectedCategory || selectedCategory === 'all') return;
    setIsSubmittingSub(true);
    try {
      if (onCreateSubGenreClick) {
        await onCreateSubGenreClick(newSubName.trim(), selectedCategory);
      } else {
        const subId = newSubName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || ('sg-' + Date.now());
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
    <section className="py-12 bg-[#F7F5F0] border-b border-[#DDD7CD]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header: Classification Ledger */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#DDD7CD]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono tracking-widest text-[#9B382A] uppercase font-bold">
                CANONICAL CLASSIFICATION // DOMAINS
              </span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl text-[#121110] font-normal tracking-tight">
              {t.sections.browseBy}
            </h2>
            <p className="text-xs text-[#524E48] font-sans mt-1">
              {t.sections.browseBySub}
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-[#524E48]">
            <span className="w-2 h-2 rounded-full bg-[#244238]"></span>
            <span>{categories.length} CURATED DOMAINS</span>
          </div>
        </div>

        {/* Classification Matrix Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
          
          {/* 1. All Domains / Samagra Ledger Card */}
          <div className="flex flex-col">
            <button
              onClick={() => {
                onSelectCategory('all');
                if (onSelectSubGenre) onSelectSubGenre('all');
              }}
              className={`group relative rounded-sm p-4 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[130px] border ${
                selectedCategory === 'all'
                  ? 'bg-[#121110] text-[#FFFFFF] border-[#121110] shadow-sm'
                  : 'bg-[#FFFFFF] hover:bg-[#FAF9F6] text-[#121110] border-[#DDD7CD] hover:border-[#121110]/40'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-[10px] font-mono tracking-wider font-semibold ${
                  selectedCategory === 'all' ? 'text-[#DDD7CD]' : 'text-[#524E48]'
                }`}>
                  № 00
                </span>
                <span className={`text-[9.5px] font-mono uppercase px-2 py-0.5 rounded-xs border font-bold ${
                  selectedCategory === 'all'
                    ? 'bg-[#FFFFFF]/20 text-[#FFFFFF] border-[#FFFFFF]/30'
                    : 'bg-[#EFECE6] text-[#524E48] border-[#DDD7CD]'
                }`}>
                  ALL ARCHIVES
                </span>
              </div>

              <div className="mt-4">
                <h3 className="font-editorial text-base sm:text-lg font-medium leading-snug">
                  {t.sections.allCategories}
                </h3>
                <p className={`text-[11px] font-sans mt-0.5 line-clamp-1 ${
                  selectedCategory === 'all' ? 'text-[#DDD7CD]' : 'text-[#524E48]'
                }`}>
                  {t.sections.allCategoriesSub}
                </p>
              </div>

              {selectedCategory === 'all' && (
                <div className="absolute top-0 right-0 w-2 h-2 bg-[#9B382A]"></div>
              )}
            </button>
          </div>

          {/* Dynamic Category Cards */}
          {categories.map((cat, idx) => {
            const Icon = iconMap[cat.icon] || BookOpen;
            const isSelected = selectedCategory === cat.id;
            const title = cat['name_' + lang] || cat.name_hi || cat.name_en;
            const subtitle = cat['subtitle_' + lang] || cat.subtitle_hi || cat.subtitle_en;
            const accessionNum = String(idx + 1).padStart(2, '0');

            return (
              <div key={cat.id} className="flex flex-col">
                <button
                  onClick={() => {
                    const nextCat = isSelected ? 'all' : cat.id;
                    onSelectCategory(nextCat);
                    if (onSelectSubGenre) onSelectSubGenre('all');
                  }}
                  className={`group relative rounded-sm p-4 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[130px] w-full border ${
                    isSelected
                      ? 'bg-[#121110] text-[#FFFFFF] border-[#121110] shadow-sm'
                      : 'bg-[#FFFFFF] hover:bg-[#FAF9F6] text-[#121110] border-[#DDD7CD] hover:border-[#121110]/40'
                  }`}
                >
                  {/* Top Row: Accession Number & Works Count */}
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-[10px] font-mono tracking-wider font-semibold ${
                      isSelected ? 'text-[#DDD7CD]' : 'text-[#524E48]'
                    }`}>
                      № {accessionNum}
                    </span>
                    {cat.count !== undefined && (
                      <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded-xs border font-medium ${
                        isSelected
                          ? 'bg-[#FFFFFF]/15 text-[#FFFFFF] border-[#FFFFFF]/25'
                          : 'bg-[#EFECE6] text-[#524E48] border-[#DDD7CD]'
                      }`}>
                        {cat.count} {t.sections.worksUnit}
                      </span>
                    )}
                  </div>

                  {/* Bottom Row: Icon + Title & Subtitle */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${
                        isSelected ? 'text-[#FFFFFF]' : 'text-[#9B382A]'
                      }`} />
                      <h3 className="font-editorial text-base sm:text-lg font-medium leading-tight truncate">
                        {title}
                      </h3>
                    </div>
                    {subtitle && (
                      <p className={`text-[11px] font-sans line-clamp-1 ${
                        isSelected ? 'text-[#DDD7CD]' : 'text-[#524E48]'
                      }`}>
                        {subtitle}
                      </p>
                    )}
                  </div>

                  {/* Active Indicator Pin */}
                  {isSelected && (
                    <div className="absolute top-0 right-0 w-2 h-2 bg-[#9B382A]"></div>
                  )}
                </button>
              </div>
            );
          })}

        </div>

        {/* Sub-Classification Docket Layer (Layer 2) */}
        {selectedCategory !== 'all' && activeCategoryObj && (
          <div className="mt-6 pt-6 border-t border-[#DDD7CD] animate-fadeIn">
            <div className="bg-[#FAF9F6] rounded-sm p-4 sm:p-6 border border-[#DDD7CD]">
              
              {/* Sub-Layer Docket Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#DDD7CD]/70">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#9B382A]"></span>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#524E48] font-bold flex items-center gap-1.5">
                    <span>{t.hierarchyLayers.subGenresAndSections}</span>
                    <ChevronRight className="w-3 h-3 text-[#524E48]" />
                    <span className="text-[#9B382A] font-bold normal-case">
                      {activeCategoryObj['name_' + lang] || activeCategoryObj.name_hi || activeCategoryObj.name_en}
                    </span>
                  </span>
                </div>

                <AdminOnly>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSubGenrePrompt(!showSubGenrePrompt)}
                      className="text-xs font-mono text-[#9B382A] hover:text-[#852E22] bg-[#EFECE6] hover:bg-[#E5E1D8] px-3 py-1.5 rounded-sm border border-[#DDD7CD] flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t.hierarchyLayers.createSubgenre}</span>
                    </button>
                  </div>
                </AdminOnly>
              </div>

              {/* Inline Subgenre Creator Form (Admin Only) */}
              {showSubGenrePrompt && (
                <AdminOnly>
                  <form onSubmit={handleCreateSubGenreInline} className="mb-4 p-3 bg-[#FFFFFF] rounded-sm border border-[#DDD7CD] flex items-center gap-2 shadow-xs animate-fadeIn">
                    <input
                      type="text"
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      placeholder={lang === 'hi' ? 'नए उप-वर्ग का नाम लिखें...' : (lang === 'ur' ? 'نئی ذیلی صنف کا نام لکھیں...' : 'Type new sub-genre name...')}
                      className="flex-1 px-3 py-1.5 text-xs font-sans border border-[#DDD7CD] rounded-sm outline-none focus:border-[#9B382A]"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingSub || !newSubName.trim()}
                      className="px-4 py-1.5 bg-[#9B382A] hover:bg-[#852E22] text-[#FFFFFF] text-xs font-mono uppercase tracking-wider rounded-sm transition cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingSub ? '...' : (lang === 'hi' ? 'सहेजें' : (lang === 'ur' ? 'محفوظ کریں' : 'Save'))}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowSubGenrePrompt(false); setNewSubName(''); }}
                      className="px-2.5 py-1.5 text-[#524E48] hover:text-[#121110] text-xs font-mono rounded-sm transition cursor-pointer"
                    >
                      {lang === 'hi' ? 'रद्द करें' : (lang === 'ur' ? 'منسوخ کریں' : 'Cancel')}
                    </button>
                  </form>
                </AdminOnly>
              )}

              {/* Sub-Genre Docket Badges */}
              <div className="flex flex-wrap items-center gap-2">
                
                {/* "All in Category" Pill */}
                <button
                  type="button"
                  onClick={() => onSelectSubGenre && onSelectSubGenre('all')}
                  className={`px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
                    !selectedSubGenre || selectedSubGenre === 'all'
                      ? 'bg-[#121110] text-[#FFFFFF] border-[#121110]'
                      : 'bg-[#FFFFFF] hover:bg-[#EFECE6] text-[#524E48] border-[#DDD7CD]'
                  }`}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>
                    {t.hierarchyLayers.allInCategory
                      ? t.hierarchyLayers.allInCategory.replace('{name}', activeCategoryObj['name_' + lang] || activeCategoryObj.name_hi || activeCategoryObj.name_en)
                      : (activeCategoryObj['name_' + lang] || activeCategoryObj.name_en)}
                  </span>
                </button>

                {/* Individual Sub-Genre Badges */}
                {activeSubGenres.map((sg) => {
                  const sgTitle = sg['name_' + lang] || sg.name_hi || sg.name_en || sg.name;
                  const isSgActive = selectedSubGenre === sg.id || selectedSubGenre === sg.name_hi || selectedSubGenre === sg.name_en;

                  return (
                    <button
                      key={sg.id}
                      type="button"
                      onClick={() => onSelectSubGenre && onSelectSubGenre(isSgActive ? 'all' : sg.id)}
                      className={`px-3 py-1.5 rounded-sm text-xs font-sans font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
                        isSgActive
                          ? 'bg-[#9B382A] text-[#FFFFFF] border-[#9B382A]'
                          : 'bg-[#FFFFFF] hover:bg-[#EFECE6] text-[#121110] border-[#DDD7CD]'
                      }`}
                    >
                      <span>{sgTitle}</span>
                      {isSgActive && <Check className="w-3.5 h-3.5 ml-0.5" />}
                    </button>
                  );
                })}

                {/* If no subgenres yet */}
                {activeSubGenres.length === 0 && (
                  <span className="text-xs text-[#524E48] italic font-sans">
                    {t.hierarchyLayers.noSubgenresYet}
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

