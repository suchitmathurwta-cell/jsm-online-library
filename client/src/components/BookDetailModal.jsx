import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Download,
  Share2,
  Quote,
  Check
} from 'lucide-react';

export default function BookDetailModal({
  book,
  onClose,
  onOpenReader,
  onDownloadBook,
  lang,
  t
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [citationFormat, setCitationFormat] = useState('chicago');

  if (!book) return null;

  const title = book[`title_${lang}`] || book.title_hi || book.title_en;
  const author = book[`author_${lang}`] || book.author_hi || book.author_en;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const citations = {
    chicago: `${book.author_hi || book.author_en}. ${book.title_hi || book.title_en}. ${book.publisher || 'Chetna Digital Preservation Library'}, ${book.year || 'n.d.'}.`,
    apa: `${book.author_en || book.author_hi} (${book.year || 'n.d.'}). ${book.title_en || book.title_hi}. ${book.publisher || 'Chetna Digital Archive'}.`,
    mla: `${book.author_hi || book.author_en}. "${book.title_hi || book.title_en}." ${book.publisher || 'Chetna Digital Archive'}, ${book.year || 'n.d.'}.`,
    humanities: `[${book.year} CE] ${book.author_hi} (${book.author_en}). ${book.title_hi}. Digitized & Preserved by Chetna Open Free Library.`
  };

  const handleCopyCitation = () => {
    const textToCopy = citations[citationFormat] || citations.chicago;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedCitation(true);
      setTimeout(() => setCopiedCitation(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden border border-stone-200 my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="text-xs text-stone-500 font-medium flex items-center gap-2">
            <span>{t.brand}</span>
            <span>/</span>
            <span className="text-[#1d4ed8] font-bold uppercase">{book.category}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
            
            {/* Left Column: Cover & Primary Actions */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-[260px] aspect-[3/4] rounded-lg overflow-hidden shadow-xl border-4 border-stone-100 bg-stone-900 group">
                <img
                  src={book.cover_url}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-y-0 left-0 w-3.5 bg-gradient-to-r from-black/40 to-transparent pointer-events-none"></div>
                {book.is_featured && (
                  <div className="absolute top-2 left-2 bg-amber-500 text-stone-950 font-bold text-[10px] px-2 py-0.5 rounded shadow-xs">
                    {t.card.featured}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="w-full max-w-[260px] flex flex-col gap-2.5 mt-5">
                <button
                  onClick={() => {
                    onClose();
                    onOpenReader(book);
                  }}
                  className="w-full py-3 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{t.details.startReading}</span>
                </button>

                <button
                  onClick={() => onDownloadBook(book)}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{t.details.downloadNow}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer border border-stone-200"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? (lang === 'hi' ? 'लिंक कॉपी हो गया!' : 'Link Copied!') : t.details.share}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Metadata, Citation Generator & Overview */}
            <div className="md:col-span-7 flex flex-col justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-rekhta-serif leading-tight">
                  {title}
                </h1>

                {book.title_en && book.title_en !== title && (
                  <p className="text-sm font-medium text-stone-500 italic mt-0.5">
                    {book.title_en}
                  </p>
                )}

                {/* Author Name */}
                <div className="mt-3 pb-3 border-b border-stone-200">
                  <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">{t.details.author}</p>
                  <p className="text-base font-bold text-stone-900 font-hindi-serif mt-0.5">
                    {author}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4 text-xs">
                  <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                    <span className="text-stone-500 block font-medium">प्रकाशन वर्ष / Year</span>
                    <span className="font-bold text-stone-800 text-xs mt-0.5 block">{book.year} CE</span>
                  </div>

                  <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                    <span className="text-stone-500 block font-medium">भाषा / Language</span>
                    <span className="font-bold text-stone-800 text-xs mt-0.5 block truncate">{book.language || 'Hindi/English'}</span>
                  </div>

                  <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                    <span className="text-stone-500 block font-medium">पृष्ठ / Pages</span>
                    <span className="font-bold text-stone-800 text-xs mt-0.5 block">{book.pages || 150} {t.card.pages}</span>
                  </div>

                  <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                    <span className="text-stone-500 block font-medium">डाउनलोड्स / Downloads</span>
                    <span className="font-bold text-emerald-700 text-xs mt-0.5 block">{(book.downloads_count || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Era & Genre */}
                <div className="mb-3 text-xs flex flex-wrap items-center gap-2 text-stone-600">
                  {book.era && (
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-800 rounded-md font-medium border border-blue-200">
                      {book.era}
                    </span>
                  )}
                  {book.genre && (
                    <span className="px-2.5 py-0.5 bg-amber-50 text-amber-900 rounded-md font-medium border border-amber-200">
                      {book.genre}
                    </span>
                  )}
                </div>

                {/* Description */}
                <div className="mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                    {t.details.description}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200">
                    {book.description || book.description_en}
                  </p>
                </div>

                {/* Academic Citation Generator Box */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Quote className="w-3.5 h-3.5 text-[#1d4ed8]" />
                      <span>{t.details.cite}</span>
                    </div>

                    {/* Format Selector */}
                    <div className="flex items-center gap-1 bg-white p-0.5 rounded border border-slate-300">
                      {['chicago', 'apa', 'mla', 'humanities'].map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setCitationFormat(fmt)}
                          className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold transition cursor-pointer ${
                            citationFormat === fmt ? 'bg-[#1d4ed8] text-white' : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="font-mono text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200 select-all">
                    {citations[citationFormat] || citations.chicago}
                  </p>

                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleCopyCitation}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-[11px] font-semibold rounded cursor-pointer transition"
                    >
                      {copiedCitation ? <Check className="w-3 h-3 text-white" /> : <Quote className="w-3 h-3 text-white" />}
                      <span>{copiedCitation ? 'Copied!' : 'Copy Citation'}</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Bottom Note */}
              <div className="mt-4 pt-2 border-t border-stone-200 text-[11px] text-stone-400 flex items-center justify-between">
                <span>चेतना सांस्कृतिक एवं साहित्यिक विकास मंच • Open Access</span>
                <span>ID: {book.id}</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
