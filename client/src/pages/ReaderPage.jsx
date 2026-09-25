import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Loader2, ArrowLeft, FileText, Sparkles, Sidebar, PanelRightClose, PanelRightOpen } from 'lucide-react';
import HikmahPdfReader from '../components/HikmahPdfReader';
import EditorialReadingCanvas from '../components/EditorialReadingCanvas';
import ContextStudio from '../components/ContextStudio';
import AudioDock from '../components/AudioDock';
import { getBookById, incrementViews, incrementDownloads } from '../services/supabaseApi';
import { translations } from '../locales/translations';

export default function ReaderPage({ lang, t }) {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modern Editorial Reading State
  const [readerMode, setReaderMode] = useState('editorial'); // 'editorial' | 'pdf'
  const [activeWord, setActiveWord] = useState('इश्क़');
  const [isContextStudioOpen, setIsContextStudioOpen] = useState(true);

  const currentLang = lang || localStorage.getItem('chetna_lang') || 'hi';
  const tr = t || translations[currentLang] || translations.hi;

  useEffect(() => {
    async function loadBook() {
      if (!bookId) return;
      setIsLoading(true);
      try {
        const data = await getBookById(bookId);
        if (data) {
          setBook(data);
          incrementViews(bookId).catch(console.error);
        } else {
          setError('Book not found');
        }
      } catch (err) {
        console.error('Error loading book in reader:', err);
        setError(err.message || 'Error loading book');
      } finally {
        setIsLoading(false);
      }
    }
    loadBook();
  }, [bookId]);

  const handleDownload = async (bookToDownload) => {
    const b = bookToDownload || book;
    if (!b || !b.file_url) return;
    try {
      if (b.id) incrementDownloads(b.id).catch(console.error);
      const res = await fetch(b.file_url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const rawName = b.title_en || b.title_hi || 'jsm_publication';
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
    } catch (err) {
      window.open(b.file_url, '_blank');
    }
  };

  const handleClose = () => {
    try {
      window.close();
    } catch (e) {}
    if (!window.closed) {
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#FAF9F6] text-[#1E1B18] flex flex-col items-center justify-center gap-3">
        <BookOpen className="w-10 h-10 text-[#BA4E36] animate-pulse" />
        <p className="text-sm font-semibold font-editorial">{tr.reader?.openingReader || 'Opening reader...'}</p>
        <Loader2 className="w-5 h-5 animate-spin text-[#66615B]" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="fixed inset-0 bg-[#FAF9F6] text-[#1E1B18] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold mb-2 font-editorial text-[#1E1B18]">
          {currentLang === 'hi' ? 'रचना उपलब्ध नहीं है' : (currentLang === 'ur' ? 'کتاب دستیاب نہیں ہے' : 'Treatise Not Found')}
        </h2>
        <p className="text-xs text-[#66615B] mb-6 max-w-sm">
          {currentLang === 'hi'
            ? 'यह पुस्तक हटा दी गई है या इसका लिंक अमान्य है।'
            : (currentLang === 'ur'
              ? 'یہ کتاب کتب خانے میں موجود نہیں ہے۔'
              : 'This book could not be found or may have been removed.')}
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-[#BA4E36] hover:bg-[#a0422d] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{tr.reader?.backToCatalog || 'Return to Library'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#FAF9F6] flex flex-col overflow-hidden font-editorial">
      {/* Slim 56px Editorial Header */}
      <header className="h-14 bg-[#FAF9F6] border-b border-[#E2DDD5] px-4 sm:px-6 flex items-center justify-between z-20 shrink-0 select-none">
        {/* Left: Back button & Book breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-[#66615B] hover:text-[#1E1B18] hover:bg-[#F2EFE9] transition cursor-pointer"
            title="Return to Catalog"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <h1 className="text-sm font-bold text-[#1E1B18] truncate font-editorial">
              {book.title_hi || book.title_en}
            </h1>
            <p className="text-[11px] text-[#66615B] truncate italic">
              {book.author_hi || book.author_en}
            </p>
          </div>
        </div>

        {/* Right: View Mode Toggle & Studio Toggle */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle Pill */}
          <div className="p-1 bg-[#F2EFE9] border border-[#E2DDD5] rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setReaderMode('editorial')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                readerMode === 'editorial'
                  ? 'bg-white text-[#1E1B18] font-bold shadow-2xs'
                  : 'text-[#66615B] hover:text-[#1E1B18]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#BA4E36]" />
              <span className="hidden sm:inline">Editorial Canvas</span>
            </button>
            <button
              onClick={() => setReaderMode('pdf')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                readerMode === 'pdf'
                  ? 'bg-white text-[#1E1B18] font-bold shadow-2xs'
                  : 'text-[#66615B] hover:text-[#1E1B18]'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#BA4E36]" />
              <span className="hidden sm:inline">PDF Edition</span>
            </button>
          </div>

          {/* Context Studio Toggle (visible in editorial mode) */}
          {readerMode === 'editorial' && (
            <button
              onClick={() => setIsContextStudioOpen(!isContextStudioOpen)}
              className={`p-2 rounded-xl border transition cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                isContextStudioOpen
                  ? 'bg-[#BA4E36]/10 border-[#BA4E36]/30 text-[#BA4E36]'
                  : 'bg-[#F2EFE9] border-[#E2DDD5] text-[#66615B] hover:text-[#1E1B18]'
              }`}
              title={isContextStudioOpen ? 'Hide Context Studio' : 'Open Context Studio'}
            >
              {isContextStudioOpen ? (
                <PanelRightClose className="w-4 h-4" />
              ) : (
                <PanelRightOpen className="w-4 h-4" />
              )}
              <span className="hidden md:inline">Studio</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Canvas Area */}
      <div className="flex-1 flex overflow-hidden relative pb-16">
        {readerMode === 'editorial' ? (
          <>
            {/* Centered Editorial Canvas */}
            <EditorialReadingCanvas
              book={book}
              activeWord={activeWord}
              onSelectWord={(w) => setActiveWord(w)}
              onOpenContextStudio={() => setIsContextStudioOpen(true)}
            />

            {/* Docked Right Context Studio */}
            <ContextStudio
              activeWord={activeWord}
              isOpen={isContextStudioOpen}
              onClose={() => setIsContextStudioOpen(false)}
            />
          </>
        ) : (
          /* PDF Facsimile Reader */
          <div className="flex-1 h-full">
            <HikmahPdfReader
              book={book}
              onClose={() => setReaderMode('editorial')}
              onDownloadBook={handleDownload}
              lang={currentLang}
              t={tr}
            />
          </div>
        )}
      </div>

      {/* Footer Audio Dock */}
      <AudioDock
        book={book}
        isPdfMode={readerMode === 'pdf'}
        onTogglePdfMode={() => setReaderMode(readerMode === 'editorial' ? 'pdf' : 'editorial')}
        reciterName="Classical Tarannum (Akashvani Archive)"
      />
    </div>
  );
}
