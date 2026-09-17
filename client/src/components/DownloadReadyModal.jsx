import React, { useState } from 'react';
import { Download, CheckCircle2, BookOpen, X, Loader2 } from 'lucide-react';

export default function DownloadReadyModal({
  book,
  onClose,
  onDownloadAgain,
  lang = 'hi',
  t
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  if (!book) return null;

  const title = book['title_' + lang] || book.title_hi || book.title_en || 'ई-पुस्तक';
  const author = book['author_' + lang] || book.author_hi || book.author_en || '';

  const dr = t?.downloadReady || {};

  const handleDownloadClick = async () => {
    setIsDownloading(true);
    try {
      if (onDownloadAgain) {
        await onDownloadAgain(book);
      }
      setDownloaded(true);
    } catch (e) {
      console.error('Download error in modal:', e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-stone-200 text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-indigo-950 text-white p-6 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{dr.badge || 'AUTHENTICATION COMPLETE'}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold font-rekhta-serif text-white tracking-tight">
            {dr.title || 'Your Book is Ready'}
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            {dr.subtitle || 'Download access has been unlocked.'}
          </p>
        </div>

        <div className="p-6 sm:p-7 space-y-5 flex flex-col items-center">
          <div className="flex items-center gap-4 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 w-full text-left">
            <div className="w-14 h-20 bg-stone-800 rounded-lg overflow-hidden shrink-0 shadow-sm border border-stone-200">
              {book.cover_url ? (
                <img src={book.cover_url} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-400">
                  <BookOpen className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-stone-900 font-rekhta-serif truncate">
                {title}
              </h3>
              <p className="text-xs text-stone-500 truncate mt-0.5">
                {author}
              </p>
              <span className="inline-block text-[10px] font-bold text-[#1d4ed8] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60 mt-1.5 uppercase">
                {book.category || 'PDF E-Book'}
              </span>
            </div>
          </div>

          <button
            onClick={handleDownloadClick}
            disabled={isDownloading}
            className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{dr.downloading || 'Downloading...'}</span>
              </>
            ) : downloaded ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                <span>{dr.downloadAgain || 'Download Again'}</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5 animate-bounce" />
                <span>{dr.downloadNow || 'Download PDF'}</span>
              </>
            )}
          </button>

          <p className="text-[11.5px] text-stone-500 leading-relaxed font-normal">
            {dr.autoDownloadNote || 'If download does not start automatically, please click the button above.'}
          </p>

          <button
            onClick={onClose}
            className="text-xs text-stone-400 hover:text-stone-700 font-semibold transition cursor-pointer pt-1"
          >
            {dr.returnLibrary || 'Return to Library'}
          </button>
        </div>
      </div>
    </div>
  );
}
