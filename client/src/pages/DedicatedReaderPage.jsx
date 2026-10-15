import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, BookOpen, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
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
      <div className="min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-2xl bg-[#141414] border border-white/[0.08] shadow-sm flex items-center justify-center mb-4">
          <BookOpen className="w-6 h-6 text-white animate-pulse" />
        </div>
        <p className="text-xs font-mono tracking-widest uppercase text-zinc-400">
          Mounting Document Canvas...
        </p>
        <Loader2 className="w-4 h-4 animate-spin text-zinc-500 mt-2" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md p-8 rounded-[24px] bg-[#141414] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          <AlertCircle className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold mb-2 text-white">
            {currentLang === 'hi' ? 'रचना उपलब्ध नहीं है' : 'Treatise Not Found'}
          </h2>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
            {error || 'The document link may have expired or was removed from the archive.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 bg-white text-black text-xs font-mono uppercase tracking-wider font-semibold rounded-full inline-flex items-center gap-2 transition hover:bg-zinc-200 cursor-pointer"
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

  const langTag = book.language || (currentLang === 'hi' ? 'Devanagari' : currentLang === 'ur' ? 'Nastaliq' : 'Romanized');

  return (
    <div className="w-full flex flex-col font-sans animate-fadeIn">
      {/* 1. Top Utility Bar */}
      <div className="pb-4 mb-4 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: ← Return to Archive */}
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono uppercase tracking-wider text-zinc-300 border border-white/[0.08] transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Return to Archive</span>
        </button>

        {/* Center: Title, Author, Language tag */}
        <div className="flex-1 text-left sm:text-center truncate px-1">
          <div className="flex items-center sm:justify-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
              {primaryTitle}
            </h1>
            {secondaryTitle && (
              <span className="text-xs text-zinc-500 hidden md:inline truncate">
                ({secondaryTitle})
              </span>
            )}
          </div>
          <div className="flex items-center sm:justify-center gap-2 mt-0.5 text-xs font-mono text-zinc-400">
            <span>{authorName}</span>
            <span>·</span>
            <span className="uppercase px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-300 border border-white/[0.08] text-[10px]">
              {langTag}
            </span>
          </div>
        </div>

        {/* Right: Direct "Download PDF" button pill */}
        <div className="flex items-center gap-2">
          {book.file_url && (
            <button
              onClick={handleDownload}
              className="bg-white text-black font-semibold rounded-full px-4 py-1.5 text-xs font-mono uppercase tracking-wider hover:bg-zinc-200 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          )}

          <button
            onClick={() => setUseIframeFallback((prev) => !prev)}
            title="Toggle viewer mode"
            className="p-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-zinc-400 hover:text-white border border-white/[0.08] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Embedded Viewer Container: h-[82vh] rounded-2xl border border-white/[0.08] bg-[#161616] overflow-hidden */}
      <div className="relative w-full h-[82vh] rounded-2xl border border-white/[0.08] bg-[#161616] overflow-hidden shadow-2xl flex flex-col">
        {book.file_url ? (
          useIframeFallback ? (
            <iframe
              src={book.file_url}
              title={primaryTitle}
              className="w-full h-full border-none rounded-2xl"
            />
          ) : (
            <div className="w-full h-full overflow-auto bg-[#161616]">
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                <div className="h-full">
                  <Viewer
                    fileUrl={book.file_url}
                    renderError={(error) => (
                      <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                        <AlertCircle className="w-8 h-8 text-zinc-400 mb-2" />
                        <p className="text-sm font-semibold text-white">
                          Could not render PDF directly via worker
                        </p>
                        <p className="text-xs text-zinc-400 mt-1 max-w-md font-mono">
                          {error.message || 'Worker network access restricted.'}
                        </p>
                        <button
                          onClick={() => setUseIframeFallback(true)}
                          className="mt-4 px-4 py-2 bg-white text-black font-mono text-xs uppercase font-semibold rounded-full cursor-pointer"
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
            <BookOpen className="w-10 h-10 text-zinc-600 mb-3" />
            <p className="text-sm font-semibold text-zinc-400">No PDF asset attached to this record.</p>
            <button
              onClick={handleBack}
              className="mt-4 px-4 py-2 rounded-full bg-white/[0.06] text-xs font-mono uppercase text-white cursor-pointer"
            >
              ← Return to Archive
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
