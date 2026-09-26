import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Download,
  Share2,
  Quote,
  Check,
  Compass
} from 'lucide-react';
import { getLocalizedEra, getLocalizedLanguage } from '../locales/translations';

export default function BookDetailModal({
  book,
  onClose,
  onOpenReader,
  onDownloadBook,
  lang = 'hi',
  t
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [citationFormat, setCitationFormat] = useState('chicago');

  if (!book) return null;

  const title = book[`title_${lang}`] || book.title_hi || book.title_en;
  const author = book[`author_${lang}`] || book.author_hi || book.author_en;
  const localizedEra = getLocalizedEra(book.era, lang);
  const localizedLang = getLocalizedLanguage(book.language, lang);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const citations = {
    chicago: `${book.author_hi || book.author_en}. ${book.title_hi || book.title_en}. ${book.publisher || (lang === 'hi' ? 'चेतना डिजिटल अभिलेखागार' : 'Chetna Digital Archive')}, ${book.year || '2026'}.`,
    apa: `${book.author_en || book.author_hi} (${book.year || '2026'}). ${book.title_en || book.title_hi}. ${book.publisher || (lang === 'hi' ? 'चेतना डिजिटल अभिलेखागार' : 'Chetna Digital Archive')}.`,
    mla: `${book.author_hi || book.author_en}. "${book.title_hi || book.title_en}." ${book.publisher || (lang === 'hi' ? 'चेतना डिजिटल अभिलेखागार' : 'Chetna Digital Archive')}, ${book.year || '2026'}.`,
    humanities: `[${book.year || 2026} CE] ${book.author_hi || book.author_en}. ${book.title_hi || book.title_en}. ${lang === 'hi' ? 'चेतना मुक्त पुस्तकालय द्वारा डिजिटाइज़्ड एवं संरक्षित।' : 'Digitized & Preserved by Chetna Open Digital Library.'}`
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#121110]/80 backdrop-blur-[2px] overflow-y-auto">
      <div
        className="relative bg-[#FFFFFF] rounded-sm max-w-4xl w-full shadow-2xl overflow-hidden border border-[#DDD7CD] my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#DDD7CD] bg-[#FAF9F6]">
          <div className="text-xs font-mono text-[#524E48] flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-[#9B382A]" />
            <span className="font-bold text-[#121110]">CHETNA ARCHIVES</span>
            <span>/</span>
            <span className="text-[#9B382A] font-semibold uppercase">{book.category}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-sm hover:bg-[#EFECE6] text-[#524E48] hover:text-[#121110] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
            
            {/* Left Column: Cover & Primary Actions */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-[260px] aspect-[3/4] rounded-xs overflow-hidden shadow-lg border border-[#DDD7CD] bg-[#121110] group">
                <img
                  src={book.cover_url}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/40 to-transparent pointer-events-none"></div>
                {book.is_featured && (
                  <div className="absolute top-2 left-2 bg-[#9B382A] text-white font-mono text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-xs shadow-xs">
                    CANONICAL
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="w-full max-w-[260px] flex flex-col gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenReader(book);
                  }}
                  className="w-full py-2.5 bg-[#121110] hover:bg-[#9B382A] text-white text-xs font-mono uppercase tracking-wider rounded-sm shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#FFFFFF]" />
                  <span>{t.details.startReading}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDownloadBook(book)}
                  className="w-full py-2.5 bg-[#9B382A] hover:bg-[#852E22] text-white text-xs font-mono uppercase tracking-wider rounded-sm shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.details.downloadNow}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full py-2 bg-[#EFECE6] hover:bg-[#E5E1D8] text-[#121110] text-xs font-mono uppercase tracking-wider rounded-sm flex items-center justify-center gap-2 transition cursor-pointer border border-[#DDD7CD]"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-[#244238]" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? t.details.linkCopied : t.details.share}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Metadata, Citation Generator & Overview */}
            <div className="md:col-span-7 flex flex-col justify-between">
              <div>
                <h1 className="font-editorial text-2xl sm:text-3xl font-normal text-[#121110] leading-snug">
                  {title}
                </h1>

                {book.title_en && book.title_en !== title && (
                  <p className="text-xs font-sans text-[#524E48] italic mt-0.5">
                    {book.title_en}
                  </p>
                )}

                {/* Author Name */}
                <div className="mt-3 pb-3 border-b border-[#DDD7CD]">
                  <p className="text-[10px] font-mono text-[#524E48] uppercase tracking-wider">{t.details.author}</p>
                  <p className="text-base font-serif font-bold text-[#9B382A] mt-0.5">
                    {author}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4 text-xs font-mono">
                  <div className="bg-[#FAF9F6] p-2.5 rounded-sm border border-[#DDD7CD]">
                    <span className="text-[#524E48] block text-[10px] uppercase">{t.details.pubYear}</span>
                    <span className="font-bold text-[#121110] text-xs mt-0.5 block">{book.year ? `${book.year} CE` : '—'}</span>
                  </div>

                  <div className="bg-[#FAF9F6] p-2.5 rounded-sm border border-[#DDD7CD]">
                    <span className="text-[#524E48] block text-[10px] uppercase">{t.details.language}</span>
                    <span className="font-bold text-[#121110] text-xs mt-0.5 block truncate">{localizedLang}</span>
                  </div>

                  <div className="bg-[#FAF9F6] p-2.5 rounded-sm border border-[#DDD7CD]">
                    <span className="text-[#524E48] block text-[10px] uppercase">{t.details.pageCount}</span>
                    <span className="font-bold text-[#121110] text-xs mt-0.5 block">{book.pages || 150} {t.card.pages}</span>
                  </div>

                  <div className="bg-[#FAF9F6] p-2.5 rounded-sm border border-[#DDD7CD]">
                    <span className="text-[#524E48] block text-[10px] uppercase">{t.details.totalDownloads}</span>
                    <span className="font-bold text-[#244238] text-xs mt-0.5 block">{(book.downloads_count || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Era & Genre */}
                <div className="mb-3 text-xs flex flex-wrap items-center gap-2">
                  {localizedEra && (
                    <span className="px-2 py-0.5 bg-[#EFECE6] text-[#121110] rounded-sm font-mono text-[11px] border border-[#DDD7CD]">
                      {localizedEra}
                    </span>
                  )}
                  {book.genre && (
                    <span className="px-2 py-0.5 bg-[#FAF9F6] text-[#9B382A] rounded-sm font-mono text-[11px] border border-[#DDD7CD]">
                      {book.genre}
                    </span>
                  )}
                </div>

                {/* Description */}
                <div className="mb-4">
                  <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#524E48] font-bold mb-1">
                    {t.details.description}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[#524E48] leading-relaxed bg-[#FAF9F6] p-3 rounded-sm border border-[#DDD7CD] font-sans">
                    {book[`description_${lang}`] || book.description || book.description_en}
                  </p>
                </div>

                {/* Academic Citation Generator Box */}
                <div className="bg-[#EFECE6] p-3 rounded-sm border border-[#DDD7CD] text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider font-bold text-[#121110]">
                      <Quote className="w-3.5 h-3.5 text-[#9B382A]" />
                      <span>{t.details.cite}</span>
                    </div>

                    {/* Format Selector */}
                    <div className="flex items-center gap-1 bg-[#FFFFFF] p-0.5 rounded-sm border border-[#DDD7CD]">
                      {['chicago', 'apa', 'mla', 'humanities'].map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => setCitationFormat(fmt)}
                          className={`px-1.5 py-0.5 rounded-xs text-[10px] font-mono uppercase font-bold transition cursor-pointer ${
                            citationFormat === fmt ? 'bg-[#9B382A] text-white' : 'text-[#524E48] hover:bg-[#EFECE6]'
                          }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="font-mono text-[11px] text-[#121110] bg-[#FFFFFF] p-2.5 rounded-sm border border-[#DDD7CD] select-all">
                    {citations[citationFormat] || citations.chicago}
                  </p>

                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={handleCopyCitation}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[#121110] hover:bg-[#9B382A] text-white font-mono text-[10px] uppercase tracking-wider rounded-sm cursor-pointer transition"
                    >
                      {copiedCitation ? <Check className="w-3 h-3 text-white" /> : <Quote className="w-3 h-3 text-white" />}
                      <span>{copiedCitation ? t.details.citationCopied : t.details.copyCitation}</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Bottom Note */}
              <div className="mt-4 pt-2 border-t border-[#DDD7CD] text-[10px] font-mono text-[#524E48] flex items-center justify-between">
                <span>{t.details.footerNote}</span>
                <span>ACCESSION ID: {book.id}</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

