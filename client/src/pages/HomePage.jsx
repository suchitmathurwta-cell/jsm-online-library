import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import CategoryTiles from '../components/CategoryTiles';
import FeaturedShelf from '../components/FeaturedShelf';
import BookGrid from '../components/BookGrid';

export default function HomePage({
  t,
  lang,
  categories,
  books,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  onSelectBook,
  onOpenReader,
  onDownloadBook,
  onEditBook,
  onOpenUpload,
  onRefreshCategories
}) {
  const navigate = useNavigate();

  const handleSelectCategory = (catId) => {
    if (!catId || catId === 'all') {
      const catElement = document.getElementById('catalog');
      if (catElement) catElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/category/' + catId);
    }
  };

  const popularBooks = books.filter((b) => b.is_featured || (b.downloads_count && b.downloads_count > 40000));
  const magazinesBooks = books.filter((b) => b.category === 'magazines');
  const vimarshBooks = books.filter((b) => b.category === 'vimarsh');
  const novelBooks = books.filter((b) => b.category === 'novel');
  const poetryBooks = books.filter((b) => b.category === 'poetry');
  const conscienceBooks = books.filter((b) => b.category === 'cultural-conscience');
  const satireBooks = books.filter((b) => b.category === 'satire');

  return (
    <div className="flex flex-col animate-fadeIn">
      {/* Hero Section */}
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

      {/* 9 Category Tiles Grid (Layer 1 Navigation) */}
      <CategoryTiles
        t={t}
        lang={lang}
        categories={categories}
        selectedCategory="all"
        onSelectCategory={handleSelectCategory}
        onRefreshCategories={onRefreshCategories}
      />

      {/* Featured Literary Shelves */}
      {!searchQuery && popularBooks.length > 0 && (
        <FeaturedShelf
          title={t.sections.popularCollections}
          subtitle={t.sections.popularSub}
          books={popularBooks}
          lang={lang}
          t={t}
          onSelectBook={onSelectBook}
          onOpenReader={onOpenReader}
          onDownloadBook={onDownloadBook}
          onEditBook={onEditBook}
          onViewAll={() => {
            setSortBy('popular');
            const catElement = document.getElementById('catalog');
            if (catElement) catElement.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}

      {!searchQuery && magazinesBooks.length > 0 && (
        <FeaturedShelf
          title={t.sections.magazinesCollection}
          subtitle={t.sections.magazinesSub}
          books={magazinesBooks}
          lang={lang}
          t={t}
          onSelectBook={onSelectBook}
          onOpenReader={onOpenReader}
          onDownloadBook={onDownloadBook}
          onEditBook={onEditBook}
          onViewAll={() => navigate('/category/magazines')}
        />
      )}

      {!searchQuery && vimarshBooks.length > 0 && (
        <FeaturedShelf
          title={t.sections.vimarshCollection}
          subtitle={t.sections.vimarshSub}
          books={vimarshBooks}
          lang={lang}
          t={t}
          onSelectBook={onSelectBook}
          onOpenReader={onOpenReader}
          onDownloadBook={onDownloadBook}
          onEditBook={onEditBook}
          onViewAll={() => navigate('/category/vimarsh')}
        />
      )}

      {!searchQuery && novelBooks.length > 0 && (
        <FeaturedShelf
          title={t.sections.novelCollection}
          subtitle={t.sections.novelSub}
          books={novelBooks}
          lang={lang}
          t={t}
          onSelectBook={onSelectBook}
          onOpenReader={onOpenReader}
          onDownloadBook={onDownloadBook}
          onEditBook={onEditBook}
          onViewAll={() => navigate('/category/novel')}
        />
      )}

      {!searchQuery && poetryBooks.length > 0 && (
        <FeaturedShelf
          title={t.sections.poetryCollection}
          subtitle={t.sections.poetrySub}
          books={poetryBooks}
          lang={lang}
          t={t}
          onSelectBook={onSelectBook}
          onOpenReader={onOpenReader}
          onDownloadBook={onDownloadBook}
          onEditBook={onEditBook}
          onViewAll={() => navigate('/category/poetry')}
        />
      )}

      {!searchQuery && conscienceBooks.length > 0 && (
        <FeaturedShelf
          title={t.sections.conscienceCollection}
          subtitle={t.sections.conscienceSub}
          books={conscienceBooks}
          lang={lang}
          t={t}
          onSelectBook={onSelectBook}
          onOpenReader={onOpenReader}
          onDownloadBook={onDownloadBook}
          onEditBook={onEditBook}
          onViewAll={() => navigate('/category/cultural-conscience')}
        />
      )}

      {!searchQuery && satireBooks.length > 0 && (
        <FeaturedShelf
          title={t.sections.satireCollection}
          subtitle={t.sections.satireSub}
          books={satireBooks}
          lang={lang}
          t={t}
          onSelectBook={onSelectBook}
          onOpenReader={onOpenReader}
          onDownloadBook={onDownloadBook}
          onEditBook={onEditBook}
          onViewAll={() => navigate('/category/satire')}
        />
      )}

      {/* Main General Catalog Grid */}
      <main className="flex-1">
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
