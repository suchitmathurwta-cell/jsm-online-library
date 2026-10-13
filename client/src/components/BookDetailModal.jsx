import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Download,
  Share2,
  Quote,
  Check
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-black/[0.08] my-auto animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50">
          <div className="text-xs text-zinc-500 font-mono flex items-center gap-2">
            <span>{t.brand || 'CHETNA'}</span>
            <span>/</span>
            <span className="text-[#111111] font-bold uppercase">{book.category}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-black transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
            
            {/* Left Column: Cover & Primary Actions */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-[260px] aspect-[3/4] rounded-2xl overflow-hidden shadow-md border border-black/[0.06] bg-zinc-100 group">
                <img
                  src={book.cover_url}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/25 to-transparent pointer-events-none"></div>
                {book.is_featured && (
                  <div className="absolute top-2.5 left-2.5 bg-[#111111] text-white font-mono text-[9px] px-2 py-0.5 rounded-full shadow-xs">
                    {t.card?.featured || 'Featured'}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="w-full max-w-[260px] flex flex-col gap-2 mt-5">
                <button
                  onClick={() => {
                    onClose();
                    onOpenReader(book);
                  }}
                  className="w-full py-2.5 bg-[#111111] hover:bg-black text-white text-xs font-medium rounded-full shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{t.details?.startReading || 'Start Reading'}</span>
                </button>

                <button
                  onClick={() => onDownloadBook(book)}
                  className="w-full py-2.5 border border-zinc-200 hover:border-black bg-white hover:bg-zinc-50 text-[#111111] text-xs font-medium rounded-full shadow-2xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{t.details?.downloadNow || 'Download PDF'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="w-full py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 hover:text-black text-xs font-medium rounded-full flex items-center justify-center gap-1.5 transition cursor-pointer border border-zinc-200/80"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? t.details?.linkCopied || 'Link Copied' : t.details?.share || 'Share'}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Metadata, Citation Generator & Overview */}
            <div className="md:col-span-7 flex flex-col justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#111111] font-sans tracking-tight leading-tight">
                  {title}
                </h1>

                {book.title_en && book.title_en !== title && (
                  <p className="text-xs font-sans text-zinc-400 mt-0.5">
                    {book.title_en}
                  </p>
                )}

                {/* Author Name */}
                <div className="mt-3 pb-3 border-b border-zinc-100">
                  <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">{t.details?.author || 'Author'}</p>
                  <p className="text-base font-bold text-[#111111] font-sans mt-0.5">
                    {author}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4 text-xs font-sans">
                  <div className="bg-zinc-50 p-2.5 rounded-2xl border border-zinc-200/70">
                    <span className="text-zinc-400 block font-mono text-[10px]">{t.details?.pubYear || 'Year'}</span>
                    <span className="font-bold text-[#111111] text-xs mt-0.5 block">{book.year ? `${book.year} CE` : '—'}</span>
                  </div>

                  <div className="bg-zinc-50 p-2.5 rounded-2xl border border-zinc-200/70">
                    <span className="text-zinc-400 block font-mono text-[10px]">{t.details?.language || 'Language'}</span>
                    <span className="font-bold text-[#111111] text-xs mt-0.5 block truncate">{localizedLang}</span>
                  </div>

                  <div className="bg-zinc-50 p-2.5 rounded-2xl border border-zinc-200/70">
                    <span className="text-zinc-400 block font-mono text-[10px]">{t.details?.pageCount || 'Pages'}</span>
                    <span className="font-bold text-[#111111] text-xs mt-0.5 block">{book.pages || 150} {t.card?.pages || 'pp.'}</span>
                  </div>

                  <div className="bg-zinc-50 p-2.5 rounded-2xl border border-zinc-200/70">
                    <span className="text-zinc-400 block font-mono text-[10px]">{t.details?.totalDownloads || 'Downloads'}</span>
                    <span className="font-bold text-[#111111] text-xs mt-0.5 block">{(book.downloads_count || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Era & Genre */}
                <div className="mb-3 text-xs flex flex-wrap items-center gap-2">
                  {localizedEra && (
                    <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-700 rounded-full font-mono text-[11px] border border-zinc-200/80">
                      {localizedEra}
                    </span>
                  )}
                  {book.genre && (
                    <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-700 rounded-full font-mono text-[11px] border border-zinc-200/80">
                      {book.genre}
                    </span>
                  )}
                </div>

                {/* Description */}
                <div className="mb-4">
                  <h3 className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    {t.details?.description || 'Synopsis & Annotation'}
                  </h3>
                  <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200/70 font-sans">
                    {book[`description_${lang}`] || book.description || book.description_en || 'Archival copy digitized and preserved in the Chetna open digital cultural repository.'}
                  </p>
                </div>

                {/* Academic Citation Generator Box */}
                <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 font-bold text-[#111111]">
                      <Quote className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{t.details?.cite || 'Citation'}</span>
                    </div>

                    {/* Format Selector */}
                    <div className="flex items-center gap-1 bg-white p-0.5 rounded-full border border-zinc-200">
                      {['chicago', 'apa', 'mla', 'humanities'].map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setCitationFormat(fmt)}
                          className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-mono font-medium transition cursor-pointer ${
                            citationFormat === fmt ? 'bg-[#111111] text-white' : 'text-zinc-600 hover:bg-zinc-100'
                          }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="font-mono text-[11px] text-zinc-700 bg-white p-2.5 rounded-xl border border-zinc-200 select-all">
                    {citations[citationFormat] || citations.chicago}
                  </p>

                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleCopyCitation}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[#111111] hover:bg-black text-white text-[11px] font-medium rounded-full cursor-pointer transition shadow-xs"
                    >
                      {copiedCitation ? <Check className="w-3 h-3 text-white" /> : <Quote className="w-3 h-3 text-white" />}
                      <span>{copiedCitation ? t.details?.citationCopied || 'Copied' : t.details?.copyCitation || 'Copy Citation'}</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Bottom Note */}
              <div className="mt-4 pt-2 border-t border-zinc-100 text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                <span>{t.details?.footerNote || 'Open Access Cultural Heritage'}</span>
                <span>ID: {book.id}</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
