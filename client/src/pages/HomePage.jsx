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
      // Find the entry that has the highest intersection ratio or is currently intersecting
      const visibleEntries = entries.filter((e) => e.isIntersecting);
      if (visibleEntries.length > 0) {
        // Sort by bounding top
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
        <div className="space-y-20 pt-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-300 font-semibold">
                CURATED ARCHIVAL STREAMS • CONTINUOUS BROWSE
              </span>
            </div>
            <span className="font-mono text-xs text-zinc-400">
              [SCROLL DOWN TO PROGRESS THROUGH SECTIONS]
            </span>
          </div>

          {categories.map((cat, idx) => {
            const formattedIdx = idx < 9 ? `0${idx + 1}` : `${idx + 1}`;
            const color = getCategoryColor(cat.id);
            const catName = cat['name_' + lang] || cat.name_hi || cat.name_en;
            const subtitle = cat['subtitle_' + lang] || cat.subtitle_en || cat.subtitle_hi;
            const catBooks = books.filter((b) => b.category === cat.id);
            const subgenres = cat.subgenres || cat.genres?.[0]?.subgenres || [];

            return (
              <section
                key={cat.id}
                id={`section-${cat.id}`}
                data-section-id={cat.id}
                className="scroll-mt-8 pb-16 border-b border-white/[0.08] relative group"
              >
                {/* Subtle Ambient Color Glow for Section */}
                <div
                  className="absolute -top-6 -left-6 -right-6 h-64 rounded-3xl pointer-events-none opacity-20 transition-opacity duration-700 blur-3xl -z-10"
                  style={{
                    background: `radial-gradient(ellipse at top left, ${color.hex}40, transparent 70%)`,
                  }}
                />

                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-5 border-b border-white/[0.06]">
                  <div className="flex items-start gap-4">
                    {/* Prominent Colored Index Watermark */}
                    <span
                      className="font-mono text-4xl sm:text-5xl font-bold tracking-tight select-none shrink-0"
                      style={{ color: color.hex }}
                    >
                      {formattedIdx}
                    </span>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border backdrop-blur-xs font-semibold"
                          style={{
                            color: color.hex,
                            borderColor: `${color.hex}40`,
                            backgroundColor: `${color.hex}15`,
                          }}
                        >
                          {cat.name_en}
                        </span>
                        <span className="font-mono text-[11px] text-zinc-400">
                          [{catBooks.length} WORKS ARCHIVED]
                        </span>
                      </div>

                      <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight font-sans">
                        {catName}
                      </h2>

                      {subtitle && (
                        <p className="text-xs sm:text-sm text-zinc-400 font-sans max-w-2xl leading-relaxed">
                          {subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Section Actions: Explore All & Quick Sub-genre Tags */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
                    <Link
                      to={`/category/${cat.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] hover:border-white/20 transition-all cursor-pointer group/btn"
                    >
                      <span>Explore Full Section</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Sub-Genre Quick Filter / Discovery Pills */}
                {subgenres.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 shrink-0 flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      <span>DIVISIONS:</span>
                    </span>
                    {subgenres.slice(0, 6).map((sg) => (
                      <Link
                        key={sg.id}
                        to={`/category/${cat.id}`}
                        className="px-3 py-1 rounded-full text-[11px] font-mono bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/[0.06] hover:border-white/20 transition-colors whitespace-nowrap shrink-0"
                      >
                        {sg['name_' + lang] || sg.name_hi || sg.name_en}
                      </Link>
                    ))}
                    {subgenres.length > 6 && (
                      <Link
                        to={`/category/${cat.id}`}
                        className="text-[10px] font-mono text-zinc-400 hover:text-white underline underline-offset-2 shrink-0 ml-1"
                      >
                        +{subgenres.length - 6} more
                      </Link>
                    )}
                  </div>
                )}

                {/* Uniform, Neat & Tidy Books Grid for this Category */}
                {catBooks.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {catBooks.slice(0, 8).map((book) => (
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
                ) : (
                  <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center space-y-3">
                    <p className="text-sm font-sans text-zinc-400">
                      Works in {catName} are currently being digitized and indexed.
                    </p>
                    <Link
                      to={`/category/${cat.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-white underline underline-offset-4"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Browse category archive structure</span>
                    </Link>
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
