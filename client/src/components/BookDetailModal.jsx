import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Download,
  Share2,
  Quote,
  Check,
  FileText
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
  
  // Secondary title: only show if the other script actually exists and is distinct
  let secondaryTitle = null;
  if (lang === 'en' && book.title_hi) {
    secondaryTitle = book.title_hi;
  } else if (lang === 'hi' && book.title_en && book.title_en !== book.title_hi) {
    secondaryTitle = book.title_en;
  } else if (lang === 'ur') {
    if (book.title_hi) secondaryTitle = book.title_hi;
    else if (book.title_en) secondaryTitle = book.title_en;
  }

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
    chicago: `${book.author_hi || book.author_en || 'लेखक'}. ${book.title_hi || book.title_en}. ${book.publisher || (lang === 'hi' ? 'चेतना मुक्त पुस्तकालय' : 'Chetna Open Library Register')}, ${book.year || '2026'}.`,
    apa: `${book.author_en || book.author_hi || 'Author'} (${book.year || '2026'}). ${book.title_en || book.title_hi}. ${book.publisher || (lang === 'hi' ? 'चेतना मुक्त पुस्तकालय' : 'Chetna Open Library Register')}.`,
    mla: `${book.author_hi || book.author_en || 'Author'}. "${book.title_hi || book.title_en}." ${book.publisher || (lang === 'hi' ? 'चेतना मुक्त पुस्तकालय' : 'Chetna Open Library Register')}, ${book.year || '2026'}.`,
    humanities: `[${book.year || 2026} CE] ${book.author_hi || book.author_en}. ${book.title_hi || book.title_en}. ${lang === 'hi' ? 'चेतना मुक्त पुस्तकालय द्वारा डिजिटाइज़्ड एवं संरक्षित।' : 'Digitized & Preserved in Chetna Open Register.'}`
  };

  const handleCopyCitation = () => {
    const textToCopy = citations[citationFormat] || citations.chicago;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedCitation(true);
      setTimeout(() => setCopiedCitation(false), 2000);
    }
  };

  const treatiseDescription = book[`description_${lang}`] || book.description || book.description_en;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#161514]/75 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative bg-[#FAF8F5] rounded-xs max-w-4xl w-full border border-[#D5CFC4] shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Dossier Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#D5CFC4] bg-[#EAE6DC]">
          <div className="text-xs font-mono text-[#7A746B] flex items-center gap-2">
            <span className="font-bold text-[#161514]">CHETNA</span>
            <span>/</span>
            <span className="uppercase text-[#A83324] font-semibold">{book.category}</span>
            {book.id && (
              <>
                <span>/</span>
                <span className="text-[10px] text-[#7A746B] hidden sm:inline">{book.id}</span>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-xs hover:bg-[#D5CFC4] text-[#7A746B] hover:text-[#161514] transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dossier Content Body */}
        <div className="p-6 sm:p-8 max-h-[82vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
            
            {/* Left Column: Monograph Plate & Primary Actions */}
            <div className="md:col-span-4 flex flex-col items-center">
              <div className="relative w-full max-w-[240px] aspect-[3/4] bg-[#EAE6DC] border border-[#D5CFC4] overflow-hidden flex items-center justify-center">
                {book.cover_url ? (
                  <img
                    src={book.cover_url}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="p-4 text-center text-[#7A746B]">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <span className="font-editorial text-xs italic">{title}</span>
                  </div>
                )}
                {book.is_featured && (
                  <div className="absolute top-2 left-2 bg-[#A83324] text-white font-mono text-[9px] px-1.5 py-0.5 rounded-xs">
                    {t.card?.featured || 'विशिष्ट ग्रंथ'}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="w-full max-w-[240px] flex flex-col gap-2 mt-5">
                <button
                  onClick={() => {
                    onClose();
                    onOpenReader(book);
                  }}
                  className="w-full py-2.5 bg-[#161514] hover:bg-[#A83324] text-white text-xs font-mono font-medium rounded-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{t.details?.startReading || 'ग्रंथ वाचन आरंभ करें'}</span>
                </button>

                <button
                  onClick={() => onDownloadBook(book)}
                  className="w-full py-2 bg-[#1E3D34] hover:bg-[#152a24] text-white text-xs font-mono font-medium rounded-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.details?.downloadNow || 'PDF डाउनलोड'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="w-full py-1.5 bg-[#F4F1EA] hover:bg-white text-[#161514] text-xs font-mono rounded-xs flex items-center justify-center gap-2 transition cursor-pointer border border-[#D5CFC4]"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-[#1E3D34]" /> : <Share2 className="w-3.5 h-3.5 text-[#7A746B]" />}
                  <span>{copiedLink ? (t.details?.linkCopied || 'लिंक कॉपी हो गया') : (t.details?.share || 'साझा करें')}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Intellectual Dossier, Description & Metadata */}
            <div className="md:col-span-8 flex flex-col justify-between">
              <div>
                {/* 1. Title */}
                <h1 className="text-2xl sm:text-3xl font-editorial font-bold text-[#161514] leading-tight">
                  {title}
                </h1>

                {secondaryTitle && (
                  <p className="text-sm font-mono text-[#7A746B] mt-1">
                    {secondaryTitle}
                  </p>
                )}

                {/* 2. Author */}
                <div className="mt-3 pb-3 border-b border-[#D5CFC4]">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A746B] block">
                    {t.details?.author || 'रचनाकार'}
                  </span>
                  <span className="text-base font-editorial italic font-medium text-[#161514] mt-0.5 block">
                    {author}
                  </span>
                </div>

                {/* 3. Description / Overview in Prominent Position */}
                {treatiseDescription && (
                  <div className="my-4">
                    <h3 className="text-[11px] font-mono uppercase tracking-wider text-[#7A746B] mb-1.5">
                      {t.details?.description || 'ग्रंथ विमर्श व अवलोकन'}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#161514] leading-relaxed bg-[#F4F1EA] p-3.5 border border-[#D5CFC4] rounded-xs font-serif">
                      {treatiseDescription}
                    </p>
                  </div>
                )}

                {/* 4. Factual Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4 text-xs font-mono">
                  <div className="bg-[#F4F1EA] p-2 border border-[#D5CFC4]">
                    <span className="text-[#7A746B] block text-[10px] uppercase">{t.details?.pubYear || 'प्रकाशन वर्ष'}</span>
                    <span className="font-bold text-[#161514] text-xs mt-0.5 block">{book.year ? `${book.year} CE` : '—'}</span>
                  </div>

                  <div className="bg-[#F4F1EA] p-2 border border-[#D5CFC4]">
                    <span className="text-[#7A746B] block text-[10px] uppercase">{t.details?.language || 'भाषा'}</span>
                    <span className="font-bold text-[#161514] text-xs mt-0.5 block truncate">{localizedLang}</span>
                  </div>

                  <div className="bg-[#F4F1EA] p-2 border border-[#D5CFC4]">
                    <span className="text-[#7A746B] block text-[10px] uppercase">{t.details?.pageCount || 'पृष्ठ'}</span>
                    <span className="font-bold text-[#161514] text-xs mt-0.5 block">{book.pages || 150}</span>
                  </div>

                  <div className="bg-[#F4F1EA] p-2 border border-[#D5CFC4]">
                    <span className="text-[#7A746B] block text-[10px] uppercase">{t.details?.totalDownloads || 'डाउनलोड'}</span>
                    <span className="font-bold text-[#1E3D34] text-xs mt-0.5 block">{(book.downloads_count || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Era & Genre tags if present */}
                {(localizedEra || book.genre) && (
                  <div className="mb-4 text-xs font-mono flex flex-wrap items-center gap-1.5">
                    {localizedEra && (
                      <span className="px-2 py-0.5 bg-[#EAE6DC] text-[#161514] border border-[#D5CFC4] rounded-xs">
                        {localizedEra}
                      </span>
                    )}
                    {book.genre && (
                      <span className="px-2 py-0.5 bg-[#EAE6DC] text-[#161514] border border-[#D5CFC4] rounded-xs">
                        {book.genre}
                      </span>
                    )}
                  </div>
                )}

                {/* 5. Academic Citation Generator */}
                <div className="bg-[#EAE6DC] p-3 border border-[#D5CFC4] rounded-xs text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#161514] uppercase font-bold">
                      <Quote className="w-3 h-3 text-[#A83324]" />
                      <span>{t.details?.cite || 'संदर्भ उद्धरण (Citation)'}</span>
                    </div>

                    {/* Format Selector */}
                    <div className="flex items-center gap-1 bg-[#FAF8F5] p-0.5 border border-[#D5CFC4] rounded-xs">
                      {['chicago', 'apa', 'mla', 'humanities'].map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setCitationFormat(fmt)}
                          className={`px-1.5 py-0.5 text-[9.5px] uppercase font-mono transition cursor-pointer ${
                            citationFormat === fmt ? 'bg-[#161514] text-white font-bold' : 'text-[#7A746B] hover:text-[#161514]'
                          }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="font-mono text-[10.5px] text-[#161514] bg-[#FAF8F5] p-2 border border-[#D5CFC4] select-all leading-relaxed">
                    {citations[citationFormat] || citations.chicago}
                  </p>

                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleCopyCitation}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#161514] hover:bg-[#A83324] text-white text-[11px] font-mono rounded-xs cursor-pointer transition"
                    >
                      {copiedCitation ? <Check className="w-3 h-3 text-white" /> : <Quote className="w-3 h-3 text-white" />}
                      <span>{copiedCitation ? (t.details?.citationCopied || 'कॉपी हो गया') : (t.details?.copyCitation || 'कॉपी उद्धरण')}</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Bottom Provenance Footnote */}
              <div className="mt-4 pt-2 border-t border-[#D5CFC4] text-[10.5px] font-mono text-[#7A746B] flex items-center justify-between">
                <span>{t.details?.footerNote || 'चेतना मुक्त पुस्तकालय — सार्वभौमिक बौद्धिक संपदा'}</span>
                <span>ID: {book.id}</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
