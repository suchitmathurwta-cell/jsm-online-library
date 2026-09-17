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
import { translations } from '../locales/translations';

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
  lang = 'hi',
  t
}) {
  const tr = t || translations[lang] || translations.hi;
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

  const title = book ? (book['title_' + lang] || book.title_hi || book.title_en || 'ई-पुस्तक') : 'ई-पुस्तक';
  const author = book ? (book['author_' + lang] || book.author_hi || book.author_en || '') : '';

  // Load PDF Document
  useEffect(() => {
    if (!book || !book.file_url) return;

    let isMounted = true;
    setIsLoading(true);

    const loadingTask = pdfjsLib.getDocument({
      url: book.file_url,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/cmaps/',
      cMapPacked: true
    });

    loadingTask.promise.then(
      (doc) => {
        if (!isMounted) return;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setIsLoading(false);
      },
      (err) => {
        if (!isMounted) return;
        console.warn('PDF Loading notice:', err);
        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      try {
        loadingTask.destroy();
      } catch (_) {}
    };
  }, [book]);

  // Dual Page Spread Render
  const renderDualPages = useCallback(async () => {
    if (!pdfDoc || viewMode !== 'dual') return;

    // Render Page 1 (Left)
    if (canvasRef1.current) {
      try {
        if (renderTask1Ref.current) renderTask1Ref.current.cancel();
        const page1 = await pdfDoc.getPage(currentPage);
        const dpr = window.devicePixelRatio || 1;
        const viewport1 = page1.getViewport({ scale: scale * dpr });
        const displayViewport1 = page1.getViewport({ scale });
        const canvas = canvasRef1.current;
        const context = canvas.getContext('2d');
        canvas.height = viewport1.height;
        canvas.width = viewport1.width;
        canvas.style.height = `${displayViewport1.height}px`;
        canvas.style.width = `${displayViewport1.width}px`;

        renderTask1Ref.current = page1.render({ canvasContext: context, viewport: viewport1 });
        await renderTask1Ref.current.promise;
      } catch (e) {
        if (e?.name !== 'RenderingCancelledException') console.warn('Spread p1 notice:', e);
      }
    }

    // Render Page 2 (Right) if available
    if (currentPage + 1 <= totalPages && canvasRef2.current) {
      try {
        if (renderTask2Ref.current) renderTask2Ref.current.cancel();
        const page2 = await pdfDoc.getPage(currentPage + 1);
        const dpr = window.devicePixelRatio || 1;
        const viewport2 = page2.getViewport({ scale: scale * dpr });
        const displayViewport2 = page2.getViewport({ scale });
        const canvas = canvasRef2.current;
        const context = canvas.getContext('2d');
        canvas.height = viewport2.height;
        canvas.width = viewport2.width;
        canvas.style.height = `${displayViewport2.height}px`;
        canvas.style.width = `${displayViewport2.width}px`;

        renderTask2Ref.current = page2.render({ canvasContext: context, viewport: viewport2 });
        await renderTask2Ref.current.promise;
      } catch (e) {
        if (e?.name !== 'RenderingCancelledException') console.warn('Spread p2 notice:', e);
      }
    }
  }, [pdfDoc, currentPage, totalPages, scale, viewMode]);

  useEffect(() => {
    if (viewMode === 'dual') {
      renderDualPages();
    }
  }, [renderDualPages, viewMode]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const scrollToPage = (pageNum) => {
    const clamped = Math.max(1, Math.min(pageNum, totalPages));
    setCurrentPage(clamped);
    setPageInput(String(clamped));

    if (viewMode === 'single') {
      const el = document.getElementById(`pdf-page-${clamped}`);
      if (el && scrollContainerRef.current) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    const p = parseInt(pageInput, 10);
    if (!isNaN(p)) {
      scrollToPage(p);
    }
  };

  const goToPrevSpread = () => {
    scrollToPage(currentPage - 2);
  };

  const goToNextSpread = () => {
    scrollToPage(currentPage + 2);
  };

  const handleScrollContainer = (e) => {
    if (e.target.scrollTop > 400) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  // Color Theme Presets
  const themes = {
    light: {
      bg: 'bg-[#f4f4f5]',
      topbar: 'bg-white/95 border-stone-200 text-stone-800',
      pageBg: 'bg-white',
      textColor: 'text-stone-900'
    },
    sepia: {
      bg: 'bg-[#f5ebd7]',
      topbar: 'bg-[#efe0c7]/95 border-[#dec8a7] text-[#3e2c1c]',
      pageBg: 'bg-[#fbf5eb]',
      textColor: 'text-[#3e2c1c]'
    },
    emerald: {
      bg: 'bg-[#06241c]',
      topbar: 'bg-[#0a3529]/95 border-[#125844] text-[#d1fae5]',
      pageBg: 'bg-[#0f4032]',
      textColor: 'text-[#e6f4ea]'
    },
    dark: {
      bg: 'bg-[#18181b]',
      topbar: 'bg-stone-900/95 border-stone-800 text-stone-100',
      pageBg: 'bg-stone-900',
      textColor: 'text-stone-100'
    }
  };

  const activeTheme = themes[theme] || themes.sepia;
  const pageBg = activeTheme.pageBg;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col ${activeTheme.bg} animate-fadeIn select-none`}
    >
      
      {/* Top Navigation Bar */}
      <div className={`px-3 sm:px-6 py-2.5 border-b backdrop-blur-md flex items-center justify-between z-40 shrink-0 ${activeTheme.topbar}`}>
        
        {/* Left Section: Book Title & Author */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={tr.reader.allPages}
            className="p-2 rounded-lg hover:bg-black/10 text-stone-400 hover:text-white transition cursor-pointer"
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <h3 className="font-bold text-xs sm:text-sm truncate font-hindi-serif">
              {title}
            </h3>
            {author && (
              <p className="text-[11px] opacity-75 truncate font-normal">
                {author}
              </p>
            )}
          </div>
        </div>

        {/* Center: Page Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          
          <button
            onClick={() => scrollToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1.5 rounded hover:bg-white/10 text-stone-300 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1 text-xs">
            <input
              type="text"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              className="w-10 text-center py-1 bg-white/10 rounded border border-white/20 text-white font-bold outline-hidden focus:border-[#1d4ed8]"
            />
            <span className="text-stone-400 text-xs">/ {totalPages}</span>
          </form>

          <button
            onClick={() => scrollToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded hover:bg-white/10 text-stone-300 disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

        </div>

        {/* Right Section: View Mode, Theme & Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          
          {/* View Modes */}
          <div className="hidden sm:flex items-center bg-white/10 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('single')}
              title={tr.reader.singlePage}
              className={`px-2.5 py-1 text-xs font-semibold rounded cursor-pointer ${viewMode === 'single' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-300 hover:text-white'}`}
            >
              {tr.reader.singlePage}
            </button>
            <button
              onClick={() => setViewMode('dual')}
              title={tr.reader.dualPage}
              className={`px-2.5 py-1 text-xs font-semibold rounded cursor-pointer ${viewMode === 'dual' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-300 hover:text-white'}`}
            >
              {tr.reader.dualPage}
            </button>
          </div>

          {/* Themes */}
          {viewMode !== 'native' && (
            <div className="hidden lg:flex items-center bg-white/10 rounded-lg p-0.5 gap-0.5">
              <button
                onClick={() => setTheme('light')}
                title={tr.reader.themeLight}
                className={`p-1.5 rounded cursor-pointer ${theme === 'light' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-400 hover:text-white'}`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('sepia')}
                title={tr.reader.themeSepia}
                className={`p-1.5 rounded cursor-pointer ${theme === 'sepia' ? 'bg-[#e2d4bc] text-[#2c1d11] shadow-xs' : 'text-stone-400 hover:text-white'}`}
              >
                <Coffee className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('emerald')}
                title={tr.reader.themeEmerald}
                className={`p-1.5 rounded cursor-pointer ${theme === 'emerald' ? 'bg-[#0f4c3a] text-amber-300 shadow-xs' : 'text-stone-400 hover:text-white'}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                title={tr.reader.themeDark}
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
                title={tr.reader.zoomOut}
                className="p-1.5 text-stone-300 hover:text-white cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-bold px-1.5 text-stone-300">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale(Math.min(2.5, scale + 0.15))}
                title={tr.reader.zoomIn}
                className="p-1.5 text-stone-300 hover:text-white cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Direct PDF Download */}
          <button
            onClick={() => onDownloadBook(book)}
            title={tr.reader.downloadBook}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{tr.card.downloadPdf}</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? tr.reader.exitFullscreen : tr.reader.fullscreen}
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
              <span>{tr.reader.allPages} ({totalPages})</span>
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
              <p className="text-sm font-semibold">{tr.reader.openingReader}</p>
            </div>
          )}

          {/* 1. SINGLE PAGE CONTINUOUS VERTICAL STACKED SCROLL */}
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

          {/* Scroll to Top Floating Button */}
          {showScrollTop && viewMode === 'single' && (
            <button
              onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
              className="fixed bottom-6 right-6 p-3 bg-[#1d4ed8] text-white rounded-full shadow-2xl hover:bg-[#1e40af] transition transform hover:scale-110 cursor-pointer z-30 flex items-center justify-center"
              title={tr.reader.scrollToTop}
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
