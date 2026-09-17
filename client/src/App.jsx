import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Download, CheckCircle2, Loader2, X } from 'lucide-react';
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
import DownloadReadyModal from './components/DownloadReadyModal';
import Footer from './components/Footer';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getCategoriesWithHierarchy, getBooks, incrementDownloads, incrementViews } from './services/supabaseApi';
import { translations } from './locales/translations';

function MainApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('chetna_lang') || 'hi';
  });

  const { user } = useAuth();
  const t = translations[lang] || translations.hi;
  const isRtl = lang === 'ur';

  const [downloadStatus, setDownloadStatus] = useState(null); // { book, state: 'downloading' | 'completed' | 'error' }
  const [downloadReadyBook, setDownloadReadyBook] = useState(null);

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
    if (!book || !book.id || !book.file_url) return;
    try {
      setDownloadStatus({ book, state: 'downloading' });
      incrementDownloads(book.id).catch(console.error);

      // Fetch the file as a Blob to ensure same-origin native download in browser
      const res = await fetch(book.file_url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();

      const blobUrl = window.URL.createObjectURL(blob);
      const rawName = book.title_en || book.title_hi || 'chetna_ebook';
      const safeName = rawName.replace(/[/\\?%*:|"<>]/g, '_') + '.pdf';

      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = safeName;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        try {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(blobUrl);
        } catch (e) {}
      }, 3000);

      setDownloadStatus({ book, state: 'completed' });
      setBooks((prev) =>
        prev.map((b) => (b.id === book.id ? { ...b, downloads_count: (b.downloads_count || 0) + 1 } : b))
      );
    } catch (err) {
      console.warn('Blob fetch download failed, fallback to direct anchor:', err);
      try {
        const rawName = book.title_en || book.title_hi || 'chetna_ebook';
        const safeName = rawName.replace(/[/\\?%*:|"<>]/g, '_') + '.pdf';
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = book.file_url;
        a.download = safeName;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          try {
            document.body.removeChild(a);
          } catch (e) {}
        }, 1000);
      } catch (e) {}
      setDownloadStatus({ book, state: 'completed' });
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
        } else {
          localStorage.setItem('chetna_pending_selected_book', JSON.stringify(book));
        }
        if (readingBook) {
          localStorage.setItem('chetna_pending_reading_book', JSON.stringify(readingBook));
        }
        const currentPath = window.location.pathname + window.location.search;
        if (currentPath && currentPath !== '/') {
          localStorage.setItem('chetna_auth_redirect_path', currentPath);
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
      localStorage.removeItem('chetna_auth_redirect_path');
    } catch (e) {}
  };

  // Auto-trigger pending download and restore view when user signs in (including Google OAuth redirect)
  useEffect(() => {
    if (user) {
      // 1. Restore previous subroute if redirected to origin
      const savedPath = localStorage.getItem('chetna_auth_redirect_path');
      if (savedPath && savedPath !== location.pathname) {
        localStorage.removeItem('chetna_auth_redirect_path');
        navigate(savedPath, { replace: true });
      }

      // 2. Restore active book modal or reader
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

      // 3. Open DownloadReadyModal and execute pending download
      const storedPending = localStorage.getItem('chetna_pending_download');
      if (storedPending) {
        try {
          const book = JSON.parse(storedPending);
          if (book && book.id) {
            setDownloadReadyBook(book);
            executeDownload(book);
          }
        } catch (e) {
          console.error('Error executing stored pending download:', e);
        } finally {
          localStorage.removeItem('chetna_pending_download');
        }
      }
    }
  }, [user]);

  // Auto-dismiss download status toast after 5 seconds
  useEffect(() => {
    if (downloadStatus && downloadStatus.state === 'completed') {
      const timer = setTimeout(() => {
        setDownloadStatus(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [downloadStatus]);

  const handleOpenReader = (book) => {
    if (book && book.id) {
      incrementViews(book.id).catch(console.error);
    }
    setReadingBook(book);
  };

  return (
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

        {/* Download Feedback Toast */}
        {downloadStatus && (
          <div className="fixed bottom-5 right-5 z-50 max-w-sm sm:max-w-md bg-stone-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-stone-700 flex items-center gap-3.5 animate-in slide-in-from-bottom-5 duration-300">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              downloadStatus.state === 'downloading'
                ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
                : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
            }`}>
              {downloadStatus.state === 'downloading' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate text-stone-100">
                {downloadStatus.book[`title_${lang}`] || downloadStatus.book.title_hi || downloadStatus.book.title_en}
              </p>
              <p className="text-[11px] text-stone-300 mt-0.5">
                {downloadStatus.state === 'downloading' ? (
                  <span className="text-blue-300">
                    PDF फ़ाइल डाउनलोड हो रही है...
                  </span>
                ) : (
                  <span className="text-emerald-400 font-medium">
                    ✓ PDF आपके डिवाइस में सफलतापूर्वक डाउनलोड हो गई!
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => setDownloadStatus(null)}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Download Ready Modal (Post-Auth 1-Click Trigger) */}
        {downloadReadyBook && (
          <DownloadReadyModal
            book={downloadReadyBook}
            onClose={() => setDownloadReadyBook(null)}
            onDownloadAgain={executeDownload}
            lang={lang}
            t={t}
          />
        )}
      </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </BrowserRouter>
  );
}
