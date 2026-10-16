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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div
        className="relative bg-[#141414] rounded-[24px] max-w-4xl w-full shadow-2xl overflow-hidden border border-white/[0.08] my-auto animate-scaleUp text-white"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="text-[10px] text-zinc-400 font-mono tracking-[0.2em] uppercase flex items-center gap-2">
            <span>{t.brand || 'CHETNA'}</span>
            <span>/</span>
            <span className="text-white font-bold">{book.category}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/[0.05] text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
            
            {/* Left Column: Cover & Primary Actions */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-[260px] aspect-[3/4] rounded-[18px] overflow-hidden shadow-lg border border-white/[0.08] bg-[#080808] group">
                <img
                  src={book.cover_url}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/40 to-transparent pointer-events-none"></div>
                {book.is_featured && (
                  <div className="absolute top-2.5 left-2.5 bg-white text-black font-mono font-bold text-[9px] uppercase px-2 py-0.5 rounded-full shadow-xs">
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
                  className="w-full py-2.5 bg-white hover:bg-zinc-200 text-black text-xs font-semibold rounded-full shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{t.details?.startReading || 'Start Reading'}</span>
                </button>

                <button
                  onClick={() => onDownloadBook(book)}
                  className="w-full py-2.5 border border-white/[0.1] hover:border-white/30 bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-medium rounded-full shadow-2xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{t.details?.downloadNow || 'Download PDF'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="w-full py-2 bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 hover:text-white text-xs font-medium rounded-full flex items-center justify-center gap-1.5 transition cursor-pointer border border-white/[0.06]"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? t.details?.linkCopied || 'Link Copied' : t.details?.share || 'Share'}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Metadata, Citation Generator & Overview */}
            <div className="md:col-span-7 flex flex-col justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white font-sans tracking-tight leading-tight">
                  {title}
                </h1>

                {book.title_en && book.title_en !== title && (
                  <p className="text-xs font-sans text-zinc-400 mt-0.5">
                    {book.title_en}
                  </p>
                )}

                {/* Author Name */}
                <div className="mt-3 pb-3 border-b border-white/[0.08]">
                  <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-[0.2em]">{t.details?.author || 'Author'}</p>
                  <p className="text-base font-bold text-white font-sans mt-0.5">
                    {author}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4 text-xs font-sans">
                  <div className="bg-white/[0.03] p-2.5 rounded-[14px] border border-white/[0.08]">
                    <span className="text-zinc-400 block font-mono text-[10px] uppercase tracking-wider">{t.details?.pubYear || 'Year'}</span>
                    <span className="font-bold text-white text-xs mt-0.5 block">{book.year ? `${book.year} CE` : '—'}</span>
                  </div>

                  <div className="bg-white/[0.03] p-2.5 rounded-[14px] border border-white/[0.08]">
                    <span className="text-zinc-400 block font-mono text-[10px] uppercase tracking-wider">{t.details?.language || 'Language'}</span>
                    <span className="font-bold text-white text-xs mt-0.5 block truncate">{localizedLang}</span>
                  </div>

                  <div className="bg-white/[0.03] p-2.5 rounded-[14px] border border-white/[0.08]">
                    <span className="text-zinc-400 block font-mono text-[10px] uppercase tracking-wider">{t.details?.pageCount || 'Pages'}</span>
                    <span className="font-bold text-white text-xs mt-0.5 block">{book.pages || 150} {t.card?.pages || 'pp.'}</span>
                  </div>

                  <div className="bg-white/[0.03] p-2.5 rounded-[14px] border border-white/[0.08]">
                    <span className="text-zinc-400 block font-mono text-[10px] uppercase tracking-wider">{t.details?.totalDownloads || 'Downloads'}</span>
                    <span className="font-bold text-white text-xs mt-0.5 block">{(book.downloads_count || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Era & Genre */}
                <div className="mb-3 text-xs flex flex-wrap items-center gap-2">
                  {localizedEra && (
                    <span className="px-2.5 py-0.5 bg-white/[0.05] text-zinc-300 rounded-full font-mono text-[10px] tracking-wider border border-white/[0.08]">
                      {localizedEra}
                    </span>
                  )}
                  {book.genre && (
                    <span className="px-2.5 py-0.5 bg-white/[0.05] text-zinc-300 rounded-full font-mono text-[10px] tracking-wider border border-white/[0.08]">
                      {book.genre}
                    </span>
                  )}
                </div>

                {/* Description */}
                <div className="mb-4">
                  <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-1">
                    {t.details?.description || (lang === 'hi' ? 'पुस्तक परिचय' : lang === 'ur' ? 'کتاب کا تعارف' : 'About this Book')}
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed bg-white/[0.03] p-3.5 rounded-[16px] border border-white/[0.08] font-sans">
                    {book[`description_${lang}`] || book.description || book.description_en || (lang === 'hi' ? 'चेतना डिजिटल पुस्तकालय में उपलब्ध प्रामाणिक संस्करण।' : lang === 'ur' ? 'چیتنا ڈیجیٹل کتب خانے میں محفوظ مستند ایڈیشن۔' : 'Preserved digital edition in the Chetna Digital Library.')}
                  </p>
                </div>

                {/* Academic Citation Generator Box */}
                <div className="bg-white/[0.03] p-3.5 rounded-[16px] border border-white/[0.08] text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <Quote className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-mono text-[11px] tracking-wider uppercase">{t.details?.cite || 'Citation'}</span>
                    </div>

                    {/* Format Selector */}
                    <div className="flex items-center gap-1 bg-white/[0.05] p-0.5 rounded-full border border-white/[0.08]">
                      {['chicago', 'apa', 'mla', 'humanities'].map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setCitationFormat(fmt)}
                          className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-mono font-medium transition cursor-pointer ${
                            citationFormat === fmt ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="font-mono text-[11px] text-zinc-300 bg-black/40 p-2.5 rounded-[12px] border border-white/[0.08] select-all">
                    {citations[citationFormat] || citations.chicago}
                  </p>

                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleCopyCitation}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-zinc-200 text-black text-[11px] font-semibold rounded-full cursor-pointer transition shadow-xs"
                    >
                      {copiedCitation ? <Check className="w-3 h-3 text-black" /> : <Quote className="w-3 h-3 text-black" />}
                      <span>{copiedCitation ? t.details?.citationCopied || 'Copied' : t.details?.copyCitation || 'Copy Citation'}</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Bottom Note */}
              <div className="mt-4 pt-2 border-t border-white/[0.08] text-[10px] font-mono text-zinc-400 flex items-center justify-between">
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
