import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, BookOpen, Loader2, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { getBookById, incrementViews, incrementDownloads } from '../services/supabaseApi';
import { translations } from '../locales/translations';

export default function DedicatedReaderPage({ lang = 'hi', t, onDownloadBook }) {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useIframeFallback, setUseIframeFallback] = useState(false);

  const currentLang = lang || localStorage.getItem('chetna_lang') || 'hi';
  const tr = t || translations[currentLang] || translations.hi;

  useEffect(() => {
    async function loadBookData() {
      if (!bookId) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await getBookById(bookId);
        if (data) {
          setBook(data);
          incrementViews(bookId).catch(console.error);
        } else {
          setError('Book or treatise could not be found in archive.');
        }
      } catch (err) {
        console.error('Error loading book in dedicated reader:', err);
        setError(err.message || 'Error retrieving document.');
      } finally {
        setIsLoading(false);
      }
    }
    loadBookData();
  }, [bookId]);

  const handleDownload = async () => {
    if (!book || !book.file_url) return;
    try {
      if (book.id) incrementDownloads(book.id).catch(console.error);
      const res = await fetch(book.file_url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const rawName = book.title_en || book.title_hi || 'chetna_work';
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
      window.open(book.file_url, '_blank');
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-[#111111] flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-2xl bg-white border border-black/[0.08] shadow-sm flex items-center justify-center mb-4">
          <BookOpen className="w-6 h-6 text-[#111111] animate-pulse" />
        </div>
        <p className="text-xs font-mono tracking-wider uppercase text-zinc-400">
          Mounting Document Canvas...
        </p>
        <Loader2 className="w-4 h-4 animate-spin text-zinc-500 mt-2" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-[#111111] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md p-8 rounded-3xl bg-white border border-black/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          <AlertCircle className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold mb-2 text-[#111111]">
            {currentLang === 'hi' ? 'रचना उपलब्ध नहीं है' : 'Treatise Not Found'}
          </h2>
          <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
            {error || 'The document link may have expired or was removed from the archive.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 bg-[#111111] hover:bg-black text-white text-xs font-medium rounded-full inline-flex items-center gap-2 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Catalog</span>
          </button>
        </div>
      </div>
    );
  }

  const primaryTitle = book.title_hi || book.title_en || 'Untitled Document';
  const secondaryTitle = book.title_en && book.title_hi && book.title_en !== book.title_hi ? book.title_en : null;
  const authorName = book.author_hi || book.author_en || 'Unknown Author';
  const eraBadge = book.historical_era || book.category || 'Archive Item';

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] flex flex-col font-sans">
      {/* 1. Header: Minimalist Mugen Utility Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-black/[0.06] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Left: ← Back to Archive Link (Preserves Previous Filters) */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200/80 text-xs font-medium text-[#111111] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Archive</span>
          </button>

          <span className="h-4 w-px bg-zinc-200 hidden sm:inline-block" />

          {/* Minimalist Brand Glyph */}
          <Link to="/" className="hidden md:flex items-center gap-2 group">
            <span className="w-6 h-6 rounded-lg bg-[#111111] text-white flex items-center justify-center text-[11px] font-bold">
              चे
            </span>
            <span className="text-xs font-bold tracking-tight text-[#111111]">
              CHETNA
            </span>
          </Link>
        </div>

        {/* Center: Title, Author, Era in Geist Sans */}
        <div className="flex-1 text-center truncate max-w-xl px-2">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-sm sm:text-base font-bold text-[#111111] tracking-tight truncate">
              {primaryTitle}
            </h1>
            {secondaryTitle && (
              <span className="text-xs text-zinc-400 hidden lg:inline truncate">
                ({secondaryTitle})
              </span>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 mt-0.5 text-[11px] font-mono text-zinc-500">
            <span>{authorName}</span>
            <span>·</span>
            <span className="uppercase px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-black/[0.04]">
              {eraBadge}
            </span>
          </div>
        </div>

        {/* Right: Actions Bar ("Download PDF" action pill + viewer controls) */}
        <div className="flex items-center gap-2">
          {book.file_url && (
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-full bg-[#111111] hover:bg-black text-white text-xs font-medium transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
          )}

          {/* Fallback viewer toggle */}
          <button
            onClick={() => setUseIframeFallback((prev) => !prev)}
            title="Toggle native frame render"
            className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. Main Canvas: Full-Height Container (h-[85vh], rounded-3xl, hairline border) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        <div className="relative w-full h-[85vh] rounded-3xl border border-black/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.03)] bg-white overflow-hidden flex flex-col">
          {book.file_url ? (
            useIframeFallback ? (
              <iframe
                src={book.file_url}
                title={primaryTitle}
                className="w-full h-full border-none rounded-3xl"
              />
            ) : (
              <div className="w-full h-full overflow-auto bg-zinc-50">
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                  <div className="h-full">
                    <Viewer
                      fileUrl={book.file_url}
                      renderError={(error) => (
                        <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                          <AlertCircle className="w-8 h-8 text-zinc-400 mb-2" />
                          <p className="text-sm font-semibold text-zinc-800">
                            Could not render PDF directly via worker
                          </p>
                          <p className="text-xs text-zinc-500 mt-1 max-w-md">
                            {error.message || 'Worker network access restricted.'}
                          </p>
                          <button
                            onClick={() => setUseIframeFallback(true)}
                            className="mt-4 px-4 py-2 bg-[#111111] text-white text-xs rounded-full cursor-pointer"
                          >
                            Switch to Embedded Frame
                          </button>
                        </div>
                      )}
                    />
                  </div>
                </Worker>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <BookOpen className="w-10 h-10 text-zinc-300 mb-3" />
              <p className="text-sm font-semibold text-zinc-700">No PDF asset attached to this record.</p>
              <button
                onClick={handleBack}
                className="mt-4 px-4 py-2 rounded-full bg-zinc-100 text-xs font-medium text-black"
              >
                Go Back
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
