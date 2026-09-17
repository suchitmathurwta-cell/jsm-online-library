import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import CategoryGenresPage from './pages/CategoryGenresPage';
import SubGenresPage from './pages/SubGenresPage';
import BooksListingPage from './pages/BooksListingPage';
import BookDetailModal from './components/BookDetailModal';
import HikmahPdfReader from './components/HikmahPdfReader';
import UploadBookModal from './components/UploadBookModal';
import AdminManageModal from './components/AdminManageModal';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getCategoriesWithHierarchy, getBooks, incrementDownloads, incrementViews } from './services/supabaseApi';
import { translations } from './locales/translations';

function MainApp() {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('chetna_lang') || 'hi';
  });

  const { user } = useAuth();
  const t = translations[lang] || translations.hi;
  const isRtl = lang === 'ur';

  useEffect(() => {
    localStorage.setItem('chetna_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    if (isRtl) {
      document.body.classList.add('font-urdu');
    } else {
      document.body.classList.remove('font-urdu');
    }
  }, [lang, isRtl]);

  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [selectedBook, setSelectedBook] = useState(null);
  const [readingBook, setReadingBook] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingDownloadBook, setPendingDownloadBook] = useState(null);

  const fetchCategories = async () => {
    try {
      const data = await getCategoriesWithHierarchy();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories from Supabase:', err);
    }
  };

  const fetchBooksData = async () => {
    setIsLoading(true);
    try {
      const data = await getBooks({
        search: searchQuery,
        sort: sortBy,
        limit: 150
      });
      setBooks(data);
    } catch (err) {
      console.error('Error fetching books from Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBooksData();
  }, [searchQuery, sortBy]);

  const executeDownload = async (book) => {
    if (!book || !book.id) return;
    try {
      incrementDownloads(book.id).catch(console.error);
      const downloadUrl = book.file_url;
      if (downloadUrl) {
        try {
          const res = await fetch(downloadUrl);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const blob = await res.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          const rawName = book.title_en || book.title_hi || 'chetna_ebook';
          const safeName = rawName.replace(/[/\\?%*:|"<>]/g, '_') + '.pdf';
          a.download = safeName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
        } catch (fetchErr) {
          // Fallback if CORS or network issue
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.target = '_blank';
          a.download = (book.title_en || book.title_hi || 'chetna_ebook') + '.pdf';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      }
      setBooks((prev) =>
        prev.map((b) => (b.id === book.id ? { ...b, downloads_count: (b.downloads_count || 0) + 1 } : b))
      );
    } catch (e) {
      console.error('Download error:', e);
    }
  };

  const handleDownloadBook = (book) => {
    if (!book) return;
    if (!user) {
      // Save pending download and current UI state in localStorage for OAuth redirects & page reloads
      try {
        localStorage.setItem('chetna_pending_download', JSON.stringify(book));
        if (selectedBook) {
          localStorage.setItem('chetna_pending_selected_book', JSON.stringify(selectedBook));
        }
        if (readingBook) {
          localStorage.setItem('chetna_pending_reading_book', JSON.stringify(readingBook));
        }
      } catch (e) {}

      setPendingDownloadBook(book);
      setIsAuthModalOpen(true);
      return;
    }
    executeDownload(book);
  };

  const handleAuthSuccess = () => {
    if (pendingDownloadBook) {
      executeDownload(pendingDownloadBook);
      setPendingDownloadBook(null);
    }
    try {
      localStorage.removeItem('chetna_pending_download');
      localStorage.removeItem('chetna_pending_selected_book');
      localStorage.removeItem('chetna_pending_reading_book');
    } catch (e) {}
  };

  // Auto-trigger pending download when user signs in (including Google OAuth redirect)
  useEffect(() => {
    if (user) {
      const storedPending = localStorage.getItem('chetna_pending_download');
      if (storedPending) {
        try {
          const book = JSON.parse(storedPending);
          if (book && book.id) {
            executeDownload(book);
          }
        } catch (e) {
          console.error('Error executing stored pending download:', e);
        } finally {
          localStorage.removeItem('chetna_pending_download');
        }
      }

      const storedSelected = localStorage.getItem('chetna_pending_selected_book');
      if (storedSelected) {
        try {
          const b = JSON.parse(storedSelected);
          if (b) setSelectedBook(b);
        } catch (e) {}
        localStorage.removeItem('chetna_pending_selected_book');
      }

      const storedReading = localStorage.getItem('chetna_pending_reading_book');
      if (storedReading) {
        try {
          const b = JSON.parse(storedReading);
          if (b) setReadingBook(b);
        } catch (e) {}
        localStorage.removeItem('chetna_pending_reading_book');
      }
    }
  }, [user]);

  const handleOpenReader = (book) => {
    if (book && book.id) {
      incrementViews(book.id).catch(console.error);
    }
    setReadingBook(book);
  };

  return (
    <BrowserRouter>
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className={'min-h-screen flex flex-col bg-[#faf8f5] text-[#1e293b] ' + (isRtl ? 'font-urdu' : '')}
      >
        {/* Sticky Header */}
        <Header
          lang={lang}
          setLang={setLang}
          t={t}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchSubmit={() => {
            const catElement = document.getElementById('catalog');
            if (catElement) catElement.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Dynamic Route Pages */}
        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  lang={lang}
                  t={t}
                  categories={categories}
                  books={books}
                  isLoading={isLoading}
                  onSelectBook={(book) => setSelectedBook(book)}
                  onOpenReader={handleOpenReader}
                  onDownloadBook={handleDownloadBook}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  onRefreshCategories={fetchCategories}
                />
              }
            />

            <Route
              path="/category/:categorySlug"
              element={
                <CategoryGenresPage
                  lang={lang}
                  t={t}
                  categories={categories}
                  books={books}
                  onSelectBook={(book) => setSelectedBook(book)}
                  onOpenReader={handleOpenReader}
                  onDownloadBook={handleDownloadBook}
                  onRefreshCategories={fetchCategories}
                />
              }
            />

            <Route
              path="/category/:categorySlug/:genreSlug"
              element={
                <SubGenresPage
                  lang={lang}
                  t={t}
                  categories={categories}
                  books={books}
                  onSelectBook={(book) => setSelectedBook(book)}
                  onOpenReader={handleOpenReader}
                  onDownloadBook={handleDownloadBook}
                  onRefreshCategories={fetchCategories}
                />
              }
            />

            <Route
              path="/category/:categorySlug/:genreSlug/:subgenreSlug"
              element={
                <BooksListingPage
                  lang={lang}
                  t={t}
                  categories={categories}
                  onSelectBook={(book) => setSelectedBook(book)}
                  onOpenReader={handleOpenReader}
                  onDownloadBook={handleDownloadBook}
                  onRefreshCategories={fetchCategories}
                />
              }
            />
          </Routes>
        </main>

        <Footer lang={lang} t={t} />

        {/* Detail Modal */}
        {selectedBook && (
          <BookDetailModal
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
            onOpenReader={(b) => {
              setSelectedBook(null);
              handleOpenReader(b);
            }}
            onDownloadBook={handleDownloadBook}
            lang={lang}
            t={t}
          />
        )}

        {/* Reader Modal (Open to All without signup) */}
        {readingBook && (
          <HikmahPdfReader
            book={readingBook}
            onClose={() => setReadingBook(null)}
            onDownloadBook={handleDownloadBook}
            lang={lang}
            t={t}
          />
        )}

        {/* Upload Modal with Supabase Integration */}
        {isUploadOpen && (
          <UploadBookModal
            isOpen={isUploadOpen}
            onClose={() => setIsUploadOpen(false)}
            onSuccess={() => {
              fetchBooksData();
              fetchCategories();
            }}
            lang={lang}
            t={t}
          />
        )}

        {/* Admin Manage Modal with Supabase CRUD */}
        {isAdminOpen && (
          <AdminManageModal
            onClose={() => setIsAdminOpen(false)}
            onOpenUpload={() => {
              setIsAdminOpen(false);
              setIsUploadOpen(true);
            }}
            onOpenReader={handleOpenReader}
            onDownloadBook={handleDownloadBook}
            onBookDeleted={() => {
              fetchBooksData();
              fetchCategories();
            }}
            lang={lang}
            t={t}
          />
        )}

        {/* Auth Modal for Gated Downloads */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => {
            setIsAuthModalOpen(false);
            setPendingDownloadBook(null);
            try {
              localStorage.removeItem('chetna_pending_download');
              localStorage.removeItem('chetna_pending_selected_book');
              localStorage.removeItem('chetna_pending_reading_book');
            } catch (e) {}
          }}
          onSuccess={handleAuthSuccess}
          bookTitle={pendingDownloadBook?.title_hi || pendingDownloadBook?.title_en || ''}
        />
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
