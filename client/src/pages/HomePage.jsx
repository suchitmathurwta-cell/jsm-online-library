import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Layers } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import CategoryTiles from '../components/CategoryTiles';
import BookCard from '../components/BookCard';
import BookGrid from '../components/BookGrid';
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

      {/* 2. Taxonomy Overview: 9 Uniform, Neat & Tidy Tiles */}
      <div id="taxonomy-overview" data-section-id="taxonomy-overview">
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
                CURATED ARCHIVAL STREAMS • CONTINUOUS FLOW
              </span>
            </div>
            <span className="font-mono text-xs text-zinc-400">
              [CONTINUE SCROLLING TO PROGRESS THROUGH TAXONOMY SECTIONS]
            </span>
          </div>

          {categories.map((cat, idx) => {
            const formattedIdx = idx < 9 ? `0${idx + 1}` : `${idx + 1}`;
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
                            {cat.name_en}
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

                    <div className="flex items-center gap-3 shrink-0">
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
                        <span>Explore All Genres</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Layer 2: Genre Cards (Uniform, Neat & Saturated with Color) */}
                {genres.length > 0 && (
                  <div className="mb-10">
                    <div className="flex items-center gap-2 mb-5">
                      <span
                        className="w-2 h-2 rounded-full inline-block animate-pulse"
                        style={{ backgroundColor: color.hex, boxShadow: `0 0 10px ${color.hex}` }}
                      />
                      <h3
                        className="text-xs font-mono uppercase tracking-[0.2em] font-black"
                        style={{ color: color.hex }}
                      >
                        GENRES UNDER — {catName}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {genres.slice(0, 6).map((g) => {
                        const gTitle = g[`name_${lang}`] || g.name_hi || g.name_en;
                        const gDesc = g[`description_${lang}`] || g.description_hi || g.description_en;
                        const subCount = g.subgenres_count || (g.subgenres && g.subgenres.length) || 0;

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
                              <h4 className="text-lg font-bold text-white tracking-tight font-sans mb-2">
                                {gTitle}
                              </h4>

                              {gDesc && (
                                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed line-clamp-3 font-sans">
                                  {gDesc}
                                </p>
                              )}
                            </div>

                            <div className="mt-5 pt-3.5 border-t border-white/[0.08] flex items-center justify-end">
                              <span
                                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider font-bold transition-transform group-hover:translate-x-1"
                                style={{ color: color.hex }}
                              >
                                <span>EXPLORE SUB-GENRES</span>
                                <ArrowRight className="w-3.5 h-3.5" />
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
                        KEY ARCHIVAL WORKS — {catName}
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
            COMPREHENSIVE REPOSITORY
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-sans">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'All Archival Works'}
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
    </div>
  );
}
