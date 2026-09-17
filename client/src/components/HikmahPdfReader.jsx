import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
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
  Sun,
  Moon,
  Coffee,
  Sparkles,
  FileText,
  Bookmark,
  Layout,
  ExternalLink,
  PanelLeft,
  ArrowUp
} from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Subcomponent: Continuous Vertical Page Canvas with Lazy High-DPI Rendering
function ContinuousPage({
  pdfDoc,
  pageNum,
  totalPages,
  scale,
  pageBg,
  onVisible
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const renderTaskRef = useRef(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onVisible?.(pageNum);
            renderPage();
          }
        });
      },
      { rootMargin: '600px 0px 600px 0px', threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [pageNum, scale, pdfDoc]);

  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;
    try {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const page = await pdfDoc.getPage(pageNum);
      const dpr = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: scale * dpr });
      const displayViewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.style.height = `${displayViewport.height}px`;
      canvas.style.width = `${displayViewport.width}px`;

      const task = page.render({
        canvasContext: context,
        viewport: viewport
      });
      renderTaskRef.current = task;
      await task.promise;
      setRendered(true);
    } catch (err) {
      if (err?.name !== 'RenderingCancelledException') {
        console.warn(`Render notice for page ${pageNum}:`, err);
      }
    }
  }, [pdfDoc, pageNum, scale]);

  return (
    <div
      ref={containerRef}
      id={`pdf-page-${pageNum}`}
      className={`relative ${pageBg} rounded-lg overflow-hidden shadow-2xl transition-all flex flex-col items-center justify-center shrink-0 mb-8 border border-black/10`}
      style={{ minHeight: '380px' }}
    >
      <canvas ref={canvasRef} className="block max-w-full" />
      
      {/* Page Number Footer Pill */}
      <div className="absolute bottom-2 right-3 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow border border-white/20 opacity-75 hover:opacity-100 transition">
        {pageNum} / {totalPages}
      </div>
    </div>
  );
}

export default function HikmahPdfReader({
  book,
  onClose,
  onDownloadBook,
  lang,
  t
}) {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(book?.pages || 1);
  const [scale, setScale] = useState(1.15);
  const [viewMode, setViewMode] = useState('single'); // 'single' (continuous scroll) | 'dual' (spread) | 'native'
  const [theme, setTheme] = useState('sepia'); // 'light' | 'sepia' | 'dark' | 'emerald'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [thumbnails, setThumbnails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageInput, setPageInput] = useState('1');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const canvasRef1 = useRef(null);
  const canvasRef2 = useRef(null);
  const renderTask1Ref = useRef(null);
  const renderTask2Ref = useRef(null);

  const title = book ? (book[`title_${lang}`] || book.title_hi || book.title_en || 'ई-पुस्तक') : 'ई-पुस्तक';
  const author = book ? (book[`author_${lang}`] || book.author_hi || book.author_en || '') : '';

  // Load PDF Document
  useEffect(() => {
    if (!book || !book.file_url) return;

    let isMounted = true;
    setIsLoading(true);

    const loadPdf = async () => {
      try {
        const res = await fetch(book.file_url);
        if (!res.ok) throw new Error(`Failed to fetch PDF: ${res.status}`);
        const arrayBuffer = await res.arrayBuffer();

        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/cmaps/',
          cMapPacked: true
        });

        const doc = await loadingTask.promise;
        if (isMounted) {
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
          setCurrentPage(1);
          setPageInput('1');
          setIsLoading(false);

          // Generate first 30 thumbnails
          generateThumbnails(doc);
        }
      } catch (err) {
        console.warn('Interactive PDF.js loading notice, switching to native viewer mode:', err);
        if (isMounted) {
          setViewMode('native');
          setIsLoading(false);
        }
      }
    };

    loadPdf();

    // Check stored bookmark
    const saved = localStorage.getItem(`bookmark_${book.id}`);
    if (saved) {
      const p = parseInt(saved);
      if (!isNaN(p)) {
        setCurrentPage(p);
        setPageInput(String(p));
        setIsBookmarked(true);
      }
    }

    return () => {
      isMounted = false;
      if (renderTask1Ref.current) renderTask1Ref.current.cancel();
      if (renderTask2Ref.current) renderTask2Ref.current.cancel();
    };
  }, [book]);

  const generateThumbnails = async (doc) => {
    const thumbs = [];
    const maxThumbs = Math.min(doc.numPages, 40);
    for (let i = 1; i <= maxThumbs; i++) {
      try {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 0.18 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: ctx, viewport }).promise;
        thumbs.push({ pageNum: i, dataUrl: canvas.toDataURL('image/jpeg', 0.7) });
      } catch (_) {}
    }
    setThumbnails(thumbs);
  };

  // Dual Spread Canvas Rendering
  useEffect(() => {
    if (!pdfDoc || viewMode !== 'dual') return;

    const renderPage = async (pageNumber, canvasRef, taskRef) => {
      if (!canvasRef.current || pageNumber > pdfDoc.numPages || pageNumber < 1) return;
      try {
        if (taskRef.current) {
          taskRef.current.cancel();
        }

        const page = await pdfDoc.getPage(pageNumber);
        const dpr = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: scale * dpr });
        const displayViewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvas.style.height = `${displayViewport.height}px`;
        canvas.style.width = `${displayViewport.width}px`;

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        const task = page.render(renderContext);
        taskRef.current = task;
        await task.promise;
      } catch (e) {
        if (e?.name !== 'RenderingCancelledException') {
          console.warn('Dual canvas render notice:', e);
        }
      }
    };

    renderPage(currentPage, canvasRef1, renderTask1Ref);
    if (currentPage + 1 <= pdfDoc.numPages) {
      renderPage(currentPage + 1, canvasRef2, renderTask2Ref);
    }
  }, [pdfDoc, currentPage, scale, viewMode]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen?.();
          setIsFullscreen(false);
        } else {
          onClose();
        }
      } else if (viewMode === 'dual') {
        if (e.key === 'ArrowRight' || e.key === 'PageDown') {
          goToNextSpread();
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          goToPrevSpread();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, viewMode, isFullscreen]);

  const scrollToPage = (pageNum) => {
    setCurrentPage(pageNum);
    setPageInput(String(pageNum));
    if (viewMode === 'single') {
      const el = document.getElementById(`pdf-page-${pageNum}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const goToNextSpread = () => {
    if (currentPage + 2 <= totalPages) {
      const nextP = currentPage + 2;
      setCurrentPage(nextP);
      setPageInput(String(nextP));
    } else if (currentPage + 1 <= totalPages) {
      setCurrentPage(currentPage + 1);
      setPageInput(String(currentPage + 1));
    }
  };

  const goToPrevSpread = () => {
    if (currentPage - 2 >= 1) {
      const prevP = currentPage - 2;
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
      scrollToPage(num);
    } else {
      setPageInput(String(currentPage));
    }
  };

  const toggleBookmark = () => {
    if (isBookmarked) {
      localStorage.removeItem(`bookmark_${book.id}`);
      setIsBookmarked(false);
    } else {
      localStorage.setItem(`bookmark_${book.id}`, String(currentPage));
      setIsBookmarked(true);
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

  const handleScrollContainer = (e) => {
    if (e.target.scrollTop > 500) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  const themeBg = {
    light: 'bg-[#f4f4f4] text-stone-900',
    sepia: 'bg-[#f5ebd7] text-[#2c1d11]',
    dark: 'bg-[#121212] text-stone-200',
    emerald: 'bg-[#031c15] text-[#d4af37]'
  }[theme];

  const pageBg = {
    light: 'bg-white shadow-2xl',
    sepia: 'bg-[#fdf8ee] shadow-2xl border border-[#e8dac0]',
    dark: 'bg-[#1f1f1f] shadow-2xl border border-stone-800 text-white',
    emerald: 'bg-[#082a20] shadow-2xl border border-[#0d4535] text-amber-200'
  }[theme];

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col ${themeBg} select-none overflow-hidden transition-colors duration-200`}
    >
      
      {/* Top Toolbar */}
      <div className="h-14 bg-black/95 backdrop-blur-md text-white px-3 sm:px-4 flex items-center justify-between z-20 border-b border-white/10 shrink-0">
        
        {/* Left: Info & Sidebar Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onClose}
            title={t.reader.backToCatalog}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t.reader.backToCatalog}</span>
          </button>

          {viewMode !== 'native' && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle Page Thumbnails"
              className={`p-1.5 rounded transition cursor-pointer ${sidebarOpen ? 'bg-[#1d4ed8] text-white' : 'bg-white/10 text-stone-300 hover:bg-white/20'}`}
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}

          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold truncate font-hindi-serif">
              {title}
            </h2>
            <p className="text-[10.5px] text-stone-400 truncate flex items-center gap-2">
              <span>{author}</span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">{totalPages} Pages</span>
            </p>
          </div>
        </div>

        {/* Center: Navigation Controls */}
        {viewMode !== 'native' ? (
          <div className="flex items-center gap-1.5 sm:gap-2">
            {viewMode === 'dual' && (
              <button
                onClick={goToPrevSpread}
                disabled={currentPage <= 1}
                className="p-1.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            <form onSubmit={handlePageJump} className="flex items-center gap-1 text-xs">
              <span className="text-stone-400 text-xs hidden sm:inline">Page</span>
              <input
                type="text"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                className="w-11 py-1 text-center bg-white/15 border border-white/20 rounded font-bold text-white text-xs outline-hidden"
              />
              <span className="text-stone-300 text-xs font-medium">/ {totalPages}</span>
            </form>

            {viewMode === 'dual' && (
              <button
                onClick={goToNextSpread}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={toggleBookmark}
              title={isBookmarked ? 'Bookmark Saved' : 'Add Bookmark'}
              className={`p-1.5 rounded transition cursor-pointer hidden sm:inline-flex ${isBookmarked ? 'bg-amber-500 text-stone-950' : 'bg-white/10 text-stone-300 hover:bg-white/20'}`}
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Browser PDF Mode</span>
          </div>
        )}

        {/* Right Tools: View Mode Toggle, Themes, Zoom, Download, Fullscreen */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* View Modes */}
          <div className="flex items-center bg-white/10 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('single')}
              title="Single Page (Continuous Vertical Scroll)"
              className={`px-2 py-1.5 rounded text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${viewMode === 'single' ? 'bg-[#1d4ed8] text-white shadow-xs' : 'text-stone-300 hover:text-white'}`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">Scroll</span>
            </button>
            <button
              onClick={() => setViewMode('dual')}
              title="Dual Page Book Spread"
              className={`px-2 py-1.5 rounded text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${viewMode === 'dual' ? 'bg-[#1d4ed8] text-white shadow-xs' : 'text-stone-300 hover:text-white'}`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">Spread</span>
            </button>
            <button
              onClick={() => setViewMode('native')}
              title="Native Browser PDF Mode"
              className={`p-1.5 rounded text-xs font-semibold transition cursor-pointer ${viewMode === 'native' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-300 hover:text-white'}`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Themes */}
          {viewMode !== 'native' && (
            <div className="hidden sm:flex items-center bg-white/10 rounded-lg p-0.5">
              <button
                onClick={() => setTheme('light')}
                title={t.reader.themeLight}
                className={`p-1.5 rounded cursor-pointer ${theme === 'light' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-400 hover:text-white'}`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('sepia')}
                title={t.reader.themeSepia}
                className={`p-1.5 rounded cursor-pointer ${theme === 'sepia' ? 'bg-[#e2d4bc] text-[#2c1d11] shadow-xs' : 'text-stone-400 hover:text-white'}`}
              >
                <Coffee className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('emerald')}
                title={t.reader.themeEmerald}
                className={`p-1.5 rounded cursor-pointer ${theme === 'emerald' ? 'bg-[#0f4c3a] text-amber-300 shadow-xs' : 'text-stone-400 hover:text-white'}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                title={t.reader.themeDark}
                className={`p-1.5 rounded cursor-pointer ${theme === 'dark' ? 'bg-stone-800 text-amber-400 shadow-xs' : 'text-stone-400 hover:text-white'}`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Zoom */}
          {viewMode !== 'native' && (
            <div className="hidden md:flex items-center bg-white/10 rounded-lg p-0.5">
              <button
                onClick={() => setScale(Math.max(0.6, scale - 0.15))}
                title={t.reader.zoomOut}
                className="p-1.5 text-stone-300 hover:text-white cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-bold px-1.5 text-stone-300">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale(Math.min(2.5, scale + 0.15))}
                title={t.reader.zoomIn}
                className="p-1.5 text-stone-300 hover:text-white cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Direct PDF Download */}
          <button
            onClick={() => onDownloadBook(book)}
            title={t.reader.downloadBook}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t.card.downloadPdf}</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? t.reader.exitFullscreen : t.reader.fullscreen}
            className="p-2 text-stone-300 hover:text-white rounded hover:bg-white/10 cursor-pointer"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 text-stone-300 hover:text-white rounded hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

        </div>
      </div>

      {/* Main Stage */}
      <div className="flex-1 overflow-hidden flex relative">
        
        {/* Thumbnails Sidebar */}
        {sidebarOpen && viewMode !== 'native' && (
          <div className="w-52 bg-stone-900/95 border-r border-white/10 p-3 overflow-y-auto space-y-3 z-30 shrink-0">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs text-stone-300 font-bold">
              <span>All Pages ({totalPages})</span>
              <button onClick={() => setSidebarOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isCurrent = currentPage === pageNum;
                const thumb = thumbnails.find(t => t.pageNum === pageNum);

                return (
                  <button
                    key={pageNum}
                    onClick={() => scrollToPage(pageNum)}
                    className={`rounded p-1 text-center transition cursor-pointer border ${
                      isCurrent
                        ? 'border-[#1d4ed8] bg-blue-900/60 shadow ring-1 ring-[#1d4ed8]'
                        : 'border-white/10 hover:border-white/30 bg-black/30'
                    }`}
                  >
                    <div className="aspect-[3/4] bg-stone-800 rounded overflow-hidden flex items-center justify-center text-[10px] text-stone-400">
                      {thumb ? (
                        <img src={thumb.dataUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>P. {pageNum}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-stone-300 font-bold mt-1 block">{pageNum}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Reader Display Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScrollContainer}
          className="flex-1 overflow-y-auto p-3 sm:p-6 flex flex-col items-center relative scroll-smooth"
        >
          
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-3 text-stone-500 animate-pulse my-auto">
              <BookOpen className="w-12 h-12 text-[#1d4ed8]" />
              <p className="text-sm font-semibold">Opening Complete E-Book in Reader...</p>
            </div>
          )}

          {/* 1. SINGLE PAGE CONTINUOUS VERTICAL STACKED SCROLL (User's Requested Feature) */}
          {!isLoading && viewMode === 'single' && pdfDoc && (
            <div className="w-full flex flex-col items-center py-4">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <ContinuousPage
                  key={idx + 1}
                  pdfDoc={pdfDoc}
                  pageNum={idx + 1}
                  totalPages={totalPages}
                  scale={scale}
                  pageBg={pageBg}
                  onVisible={(p) => {
                    setCurrentPage(p);
                    setPageInput(String(p));
                  }}
                />
              ))}
            </div>
          )}

          {/* 2. DUAL SPREAD FLIPBOOK MODE */}
          {!isLoading && viewMode === 'dual' && pdfDoc && (
            <div className="flex items-center justify-center gap-4 sm:gap-6 max-w-full my-auto py-2">
              
              {/* Page 1 (Left) */}
              <div className={`relative ${pageBg} rounded-md overflow-hidden transition-all duration-300 flex flex-col items-center justify-center shrink-0`}>
                <canvas ref={canvasRef1} className="max-w-full max-h-[84vh] object-contain block" />
                <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-black/25 via-transparent to-transparent pointer-events-none"></div>
              </div>

              {/* Page 2 (Right) */}
              {currentPage + 1 <= totalPages && (
                <div className={`relative ${pageBg} rounded-md overflow-hidden transition-all duration-300 flex flex-col items-center justify-center shrink-0`}>
                  <canvas ref={canvasRef2} className="max-w-full max-h-[84vh] object-contain block" />
                  <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/25 via-transparent to-transparent pointer-events-none"></div>
                </div>
              )}

            </div>
          )}

          {/* 3. NATIVE BROWSER PDF MODE */}
          {!isLoading && viewMode === 'native' && (
            <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl border border-stone-300 bg-white flex flex-col">
              <iframe
                src={`${book.file_url}#toolbar=1&navpanes=1&page=${currentPage}`}
                title={title}
                className="w-full h-full border-0"
              />
            </div>
          )}

          {/* Scroll to Top Floating Button */}
          {showScrollTop && viewMode === 'single' && (
            <button
              onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
              className="fixed bottom-6 right-6 p-3 bg-[#1d4ed8] text-white rounded-full shadow-2xl hover:bg-[#1e40af] transition transform hover:scale-110 cursor-pointer z-30 flex items-center justify-center"
              title="Scroll to Top"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          )}

          {/* Quick Floating Spread Flip Buttons in Dual Mode */}
          {viewMode === 'dual' && (
            <>
              <button
                onClick={goToPrevSpread}
                disabled={currentPage <= 1}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-black/60 hover:bg-black/90 text-white disabled:opacity-0 transition shadow-2xl cursor-pointer hidden md:flex items-center justify-center z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={goToNextSpread}
                disabled={currentPage >= totalPages}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-black/60 hover:bg-black/90 text-white disabled:opacity-0 transition shadow-2xl cursor-pointer hidden md:flex items-center justify-center z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

        </div>

      </div>

      {/* Progress Bar */}
      {viewMode !== 'native' && (
        <div className="h-1 bg-black/20 w-full shrink-0">
          <div
            className="h-full bg-[#1d4ed8] transition-all duration-300"
            style={{ width: `${(currentPage / Math.max(1, totalPages)) * 100}%` }}
          ></div>
        </div>
      )}

    </div>
  );
}
