import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Download,
  BookOpen,
  Layers,
  Sun,
  Moon,
  Coffee,
  RotateCw,
  FileText
} from 'lucide-react';

// Configure pdfjs worker to unpkg / cdnjs or local
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;

export default function RekhtaPdfReader({
  book,
  onClose,
  onDownloadBook,
  lang,
  t
}) {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(book?.pages || 1);
  const [scale, setScale] = useState(1.0);
  const [viewMode, setViewMode] = useState('dual'); // 'dual' (flipbook spread) or 'single'
  const [theme, setTheme] = useState('sepia'); // 'light', 'sepia', 'dark'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [pageInput, setPageInput] = useState('1');

  const containerRef = useRef(null);
  const canvasRef1 = useRef(null);
  const canvasRef2 = useRef(null);

  const title = book[`title_${lang}`] || book.title_hi || book.title_en;
  const author = book[`author_${lang}`] || book.author_hi || book.author_en;

  // Load PDF Document
  useEffect(() => {
    if (!book || !book.file_url) return;

    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(book.file_url);
        const doc = await loadingTask.promise;
        if (isMounted) {
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
          setCurrentPage(1);
          setPageInput('1');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load PDF with pdfjs:', err);
        if (isMounted) {
          setLoadError('Could not load PDF in interactive mode.');
          setIsLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
    };
  }, [book]);

  // Render Pages on Canvas
  useEffect(() => {
    if (!pdfDoc) return;

    const renderPage = async (pageNumber, canvasRef) => {
      if (!canvasRef.current || pageNumber > pdfDoc.numPages || pageNumber < 1) return;
      try {
        const page = await pdfDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        await page.render(renderContext).promise;
      } catch (e) {
        console.error('Error rendering page:', e);
      }
    };

    if (viewMode === 'single') {
      renderPage(currentPage, canvasRef1);
    } else {
      // Dual page view: Left page and Right page
      renderPage(currentPage, canvasRef1);
      if (currentPage + 1 <= pdfDoc.numPages) {
        renderPage(currentPage + 1, canvasRef2);
      }
    }
  }, [pdfDoc, currentPage, scale, viewMode]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrevPage();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen?.();
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, viewMode, isFullscreen]);

  const goToNextPage = () => {
    const step = viewMode === 'dual' ? 2 : 1;
    if (currentPage + step <= totalPages) {
      const nextP = currentPage + step;
      setCurrentPage(nextP);
      setPageInput(String(nextP));
    } else if (viewMode === 'dual' && currentPage + 1 <= totalPages) {
      setCurrentPage(currentPage + 1);
      setPageInput(String(currentPage + 1));
    }
  };

  const goToPrevPage = () => {
    const step = viewMode === 'dual' ? 2 : 1;
    if (currentPage - step >= 1) {
      const prevP = currentPage - step;
      setCurrentPage(prevP);
      setPageInput(String(prevP));
    } else if (currentPage > 1) {
      setCurrentPage(1);
      setPageInput('1');
    }
  };

  const handlePageJump = (e) => {
    e.preventDefault();
    const num = parseInt(pageInput);
    if (!isNaN(num) && num >= 1 && num <= totalPages) {
      setCurrentPage(num);
    } else {
      setPageInput(String(currentPage));
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Theme Styles
  const themeBg = {
    light: 'bg-[#f4f4f4] text-stone-900',
    sepia: 'bg-[#f5ebd7] text-[#2c1d11]',
    dark: 'bg-[#151515] text-stone-200'
  }[theme];

  const pageBg = {
    light: 'bg-white shadow-xl',
    sepia: 'bg-[#fdf8ee] shadow-2xl border border-[#e8dac0]',
    dark: 'bg-[#222222] shadow-2xl border border-stone-800 text-white'
  }[theme];

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col ${themeBg} select-none overflow-hidden transition-colors duration-200`}
    >
      
      {/* Top Toolbar */}
      <div className="h-14 bg-black/85 backdrop-blur-md text-white px-4 flex items-center justify-between z-20 border-b border-white/10 shrink-0">
        
        {/* Left: Book Info & Back */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            title={t.reader.backToCatalog}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t.reader.backToCatalog}</span>
          </button>

          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold truncate font-hindi-serif">
              {title}
            </h2>
            <p className="text-[10px] text-stone-400 truncate">
              {author} • {book.year}
            </p>
          </div>
        </div>

        {/* Center: Page Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            className="p-1.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <form onSubmit={handlePageJump} className="flex items-center gap-1 text-xs">
            <input
              type="text"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              className="w-10 py-1 text-center bg-white/15 border border-white/20 rounded font-bold text-white text-xs outline-hidden"
            />
            <span className="text-stone-400 text-xs">{t.reader.of} {totalPages}</span>
          </form>

          <button
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Tools: ViewMode, Themes, Zoom, Fullscreen, Download */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* View Mode Toggle (Single vs Dual Page) */}
          <button
            onClick={() => setViewMode(viewMode === 'dual' ? 'single' : 'dual')}
            title={viewMode === 'dual' ? t.reader.singlePage : t.reader.dualPage}
            className={`p-2 rounded transition ${viewMode === 'dual' ? 'bg-[#882d5a] text-white' : 'bg-white/10 text-stone-300 hover:bg-white/20'}`}
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Theme Toggles */}
          <div className="hidden sm:flex items-center bg-white/10 rounded-lg p-0.5">
            <button
              onClick={() => setTheme('light')}
              title={t.reader.themeLight}
              className={`p-1.5 rounded ${theme === 'light' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-400 hover:text-white'}`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('sepia')}
              title={t.reader.themeSepia}
              className={`p-1.5 rounded ${theme === 'sepia' ? 'bg-[#e2d4bc] text-[#2c1d11] shadow-xs' : 'text-stone-400 hover:text-white'}`}
            >
              <Coffee className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              title={t.reader.themeDark}
              className={`p-1.5 rounded ${theme === 'dark' ? 'bg-stone-800 text-amber-400 shadow-xs' : 'text-stone-400 hover:text-white'}`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="hidden md:flex items-center bg-white/10 rounded-lg p-0.5">
            <button
              onClick={() => setScale(Math.max(0.6, scale - 0.15))}
              title={t.reader.zoomOut}
              className="p-1.5 text-stone-300 hover:text-white"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-bold px-1.5 text-stone-300">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale(Math.min(2.0, scale + 0.15))}
              title={t.reader.zoomIn}
              className="p-1.5 text-stone-300 hover:text-white"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Direct Download Button */}
          <button
            onClick={() => onDownloadBook(book)}
            title={t.reader.downloadBook}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t.card.downloadPdf}</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? t.reader.exitFullscreen : t.reader.fullscreen}
            className="p-2 text-stone-300 hover:text-white rounded hover:bg-white/10"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 text-stone-300 hover:text-white rounded hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>

        </div>
      </div>

      {/* Main Reading Stage Area */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center relative">
        
        {isLoading && (
          <div className="flex flex-col items-center gap-3 text-stone-500 animate-pulse">
            <BookOpen className="w-10 h-10 text-[#882d5a]" />
            <p className="text-sm font-semibold">ई-पुस्तक लोड हो रही है...</p>
          </div>
        )}

        {loadError && (
          <div className="text-center p-6 bg-white/80 rounded-xl shadow border border-stone-300 max-w-md text-stone-800">
            <FileText className="w-10 h-10 text-stone-400 mx-auto mb-2" />
            <h3 className="font-bold text-sm mb-1">इंटरैक्टिव रीडर लोड नहीं हो सका</h3>
            <p className="text-xs text-stone-500 mb-4">{loadError}</p>
            <button
              onClick={() => onDownloadBook(book)}
              className="px-4 py-2 bg-[#882d5a] text-white rounded-lg text-xs font-bold"
            >
              PDF डाउनलोड करें और पढ़ें
            </button>
          </div>
        )}

        {!isLoading && !loadError && (
          <div className="flex items-center justify-center gap-4 sm:gap-6 max-w-full">
            
            {/* Left Page (Dual or Single) */}
            <div className={`relative ${pageBg} rounded-md overflow-hidden transition-all duration-300 flex flex-col items-center justify-center`}>
              <canvas ref={canvasRef1} className="max-w-full max-h-[82vh] object-contain block" />
              {/* Spine shadow for dual page */}
              {viewMode === 'dual' && (
                <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-black/25 via-transparent to-transparent pointer-events-none"></div>
              )}
            </div>

            {/* Right Page (Dual Mode only) */}
            {viewMode === 'dual' && currentPage + 1 <= totalPages && (
              <div className={`relative ${pageBg} rounded-md overflow-hidden transition-all duration-300 flex flex-col items-center justify-center`}>
                <canvas ref={canvasRef2} className="max-w-full max-h-[82vh] object-contain block" />
                <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/25 via-transparent to-transparent pointer-events-none"></div>
              </div>
            )}

          </div>
        )}

        {/* Floating Quick Next/Prev Page Overlays for Easy Reading */}
        <button
          onClick={goToPrevPage}
          disabled={currentPage <= 1}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white disabled:opacity-0 transition shadow-lg cursor-pointer hidden md:flex items-center justify-center"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={goToNextPage}
          disabled={currentPage >= totalPages}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white disabled:opacity-0 transition shadow-lg cursor-pointer hidden md:flex items-center justify-center"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

      </div>

      {/* Bottom Progress Bar */}
      <div className="h-1 bg-black/20 w-full">
        <div
          className="h-full bg-[#882d5a] transition-all duration-300"
          style={{ width: `${(currentPage / Math.max(1, totalPages)) * 100}%` }}
        ></div>
      </div>

    </div>
  );
}
