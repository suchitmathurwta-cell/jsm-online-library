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
    <section className="py-8 bg-[#F4F1EA] border-b border-[#D5CFC4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Domain Spectrum Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-5 pb-3 border-b border-[#D5CFC4]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#A83324] rounded-full inline-block"></span>
              <h2 className="text-sm font-mono uppercase tracking-wider text-[#161514]">
                {t.sections.browseBy || 'वर्गीकरण एवं विधाएँ'}
              </h2>
            </div>
            <p className="text-xs text-[#7A746B] mt-0.5 pl-3.5">
              {t.sections.browseBySub || 'समस्त 9 साहित्यिक व सांस्कृतिक प्रभाग'}
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#7A746B] mt-1 sm:mt-0">
            {categories.length} {t.hierarchyLayers?.genresUnit || 'प्रभाग'}
          </span>
        </div>

        {/* Ruled Domain Spectrum Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-px bg-[#D5CFC4] border border-[#D5CFC4] p-px">
          
          {/* 1. All Domains / Register Button */}
          <button
            onClick={() => {
              onSelectCategory('all');
              if (onSelectSubGenre) onSelectSubGenre('all');
            }}
            className={`group text-left p-3.5 transition-colors cursor-pointer flex flex-col justify-between min-h-[105px] ${
              selectedCategory === 'all'
                ? 'bg-[#161514] text-[#F4F1EA]'
                : 'bg-[#FAF8F5] hover:bg-white text-[#161514]'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className={`w-7 h-7 rounded flex items-center justify-center ${
                selectedCategory === 'all' ? 'text-[#EAE6DC]' : 'text-[#7A746B]'
              }`}>
                <Layers className="w-4 h-4" />
              </span>
              <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                selectedCategory === 'all' ? 'border-[#4A463F] text-[#D5CFC4]' : 'border-[#D5CFC4] text-[#7A746B]'
              }`}>
                ALL
              </span>
            </div>
            <div className="mt-2">
              <h3 className="font-editorial text-sm font-bold leading-snug">
                {t.sections.allCategories}
              </h3>
              <p className={`text-[10px] mt-0.5 line-clamp-1 ${
                selectedCategory === 'all' ? 'text-[#D5CFC4]' : 'text-[#7A746B]'
              }`}>
                {t.sections.allCategoriesSub}
              </p>
            </div>
          </button>

          {/* 2+. Factual 9 Domains */}
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon] || BookOpen;
            const isSelected = selectedCategory === cat.id;
            const title = cat['name_' + lang] || cat.name_hi || cat.name_en;
            const subtitle = cat['subtitle_' + lang] || cat.subtitle_hi || cat.subtitle_en;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  const nextCat = isSelected ? 'all' : cat.id;
                  onSelectCategory(nextCat);
                  if (onSelectSubGenre) onSelectSubGenre('all');
                }}
                className={`group text-left p-3.5 transition-colors cursor-pointer flex flex-col justify-between min-h-[105px] relative ${
                  isSelected
                    ? 'bg-[#EAE6DC] text-[#161514] border-l-2 border-[#A83324]'
                    : 'bg-[#FAF8F5] hover:bg-white text-[#161514]'
                }`}
              >
                {/* Top Row: Icon & Count */}
                <div className="flex items-center justify-between w-full">
                  <span className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
                    isSelected ? 'text-[#A83324]' : 'text-[#7A746B] group-hover:text-[#161514]'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  {cat.count !== undefined && (
                    <span className="text-[10px] font-mono text-[#7A746B]">
                      {cat.count}
                    </span>
                  )}
                </div>

                {/* Bottom Row: Title & Subtitle */}
                <div className="mt-2">
                  <h3 className={`font-editorial text-sm font-bold leading-snug ${
                    isSelected ? 'text-[#A83324]' : 'text-[#161514]'
                  }`}>
                    {title}
                  </h3>
                  {subtitle && (
                    <p className="text-[10px] text-[#7A746B] mt-0.5 line-clamp-1 font-normal">
                      {subtitle}
                    </p>
                  )}
                </div>

                {isSelected && (
                  <span className="absolute top-2 right-2 text-[#A83324] font-bold text-xs">
                    •
                  </span>
                )}
              </button>
            );
          })}

        </div>

        {/* Inline Subgenre / Sub-Section Expansion */}
        {selectedCategory !== 'all' && activeCategoryObj && (
          <div className="mt-4 p-4 bg-[#FAF8F5] border border-[#D5CFC4] rounded-sm animate-fadeIn">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-[#D5CFC4]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#7A746B] flex items-center gap-1.5">
                  <span>{t.hierarchyLayers?.subGenresAndSections || 'प्रभाग उप-वर्ग'}</span>
                  <ChevronRight className="w-3 h-3 text-[#7A746B]" />
                  <span className="text-[#161514] font-bold normal-case">
                    {activeCategoryObj['name_' + lang] || activeCategoryObj.name_hi || activeCategoryObj.name_en}
                  </span>
                </span>
              </div>

              <AdminOnly>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSubGenrePrompt(!showSubGenrePrompt)}
                    className="text-xs font-mono text-[#A83324] hover:text-[#8C2A1E] px-2.5 py-1 rounded border border-[#D5CFC4] hover:border-[#A83324] flex items-center gap-1 transition cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{t.hierarchyLayers?.createSubgenre || '+ उप-वर्ग जोड़ें'}</span>
                  </button>
                </div>
              </AdminOnly>
            </div>

            {/* Inline Subgenre Creator Form (Admin Only) */}
            {showSubGenrePrompt && (
              <AdminOnly>
                <form onSubmit={handleCreateSubGenreInline} className="mb-3 p-2.5 bg-[#F4F1EA] border border-[#D5CFC4] rounded flex items-center gap-2">
                  <input
                    type="text"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    placeholder={lang === 'hi' ? 'नए उप-वर्ग का नाम लिखें...' : (lang === 'ur' ? 'نئی ذیلی صنف کا نام لکھیں...' : 'Type new sub-genre name...')}
                    className="flex-1 px-2.5 py-1 text-xs border border-[#D5CFC4] bg-white rounded outline-hidden focus:border-[#161514]"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingSub || !newSubName.trim()}
                    className="px-3 py-1 bg-[#161514] hover:bg-[#A83324] text-white text-xs font-medium rounded transition cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingSub ? '...' : (lang === 'hi' ? 'सहेजें' : (lang === 'ur' ? 'محفوظ کریں' : 'Save'))}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowSubGenrePrompt(false); setNewSubName(''); }}
                    className="px-2 py-1 text-[#7A746B] hover:text-[#161514] text-xs transition"
                  >
                    {lang === 'hi' ? 'रद्द करें' : (lang === 'ur' ? 'منسوخ کریں' : 'Cancel')}
                  </button>
                </form>
              </AdminOnly>
            )}

            {/* Sub-Genre Ruled Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              
              {/* "All in Category" Pill */}
              <button
                type="button"
                onClick={() => onSelectSubGenre && onSelectSubGenre('all')}
                className={`px-3 py-1 text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer border ${
                  !selectedSubGenre || selectedSubGenre === 'all'
                    ? 'bg-[#161514] text-[#F4F1EA] border-[#161514]'
                    : 'bg-[#F4F1EA] hover:bg-white text-[#4A463F] border-[#D5CFC4]'
                }`}
              >
                <FolderOpen className="w-3 h-3" />
                <span>
                  {t.hierarchyLayers?.allInCategory
                    ? t.hierarchyLayers.allInCategory.replace('{name}', activeCategoryObj['name_' + lang] || activeCategoryObj.name_hi || activeCategoryObj.name_en)
                    : (activeCategoryObj['name_' + lang] || activeCategoryObj.name_en)}
                </span>
              </button>

              {/* Individual Sub-Genre Pills */}
              {activeSubGenres.map((sg) => {
                const sgTitle = sg['name_' + lang] || sg.name_hi || sg.name_en || sg.name;
                const isSgActive = selectedSubGenre === sg.id || selectedSubGenre === sg.name_hi || selectedSubGenre === sg.name_en;

                return (
                  <button
                    key={sg.id}
                    type="button"
                    onClick={() => onSelectSubGenre && onSelectSubGenre(isSgActive ? 'all' : sg.id)}
                    className={`px-3 py-1 text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer border ${
                      isSgActive
                        ? 'bg-[#A83324] text-white border-[#A83324]'
                        : 'bg-[#F4F1EA] hover:bg-white text-[#4A463F] border-[#D5CFC4]'
                    }`}
                  >
                    <span>{sgTitle}</span>
                    {isSgActive && <Check className="w-3 h-3 ml-0.5" />}
                  </button>
                );
              })}

              {/* If no subgenres yet */}
              {activeSubGenres.length === 0 && (
                <span className="text-xs text-[#7A746B] italic font-editorial">
                  {t.hierarchyLayers?.noSubgenresYet || 'कोई उप-वर्ग उपलब्ध नहीं'}
                </span>
              )}

            </div>

          </div>
        )}

      </div>
    </section>
  );
}

