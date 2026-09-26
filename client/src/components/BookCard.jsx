import React from 'react';
import { BookOpen, Download, Eye, FileText, Edit3 } from 'lucide-react';
import { AdminOnly } from './AdminGuard';

export default function BookCard({
  book,
  lang,
  t,
  onSelectBook,
  onOpenReader,
  onDownloadBook,
  onEditBook
}) {
  const title = book[`title_${lang}`] || book.title_hi || book.title_en;
  const author = book[`author_${lang}`] || book.author_hi || book.author_en;
  
  // Secondary title: only show if the other script actually exists and is not identical
  let secondaryTitle = null;
  if (lang === 'en' && book.title_hi) {
    secondaryTitle = book.title_hi;
  } else if (lang === 'hi' && book.title_en && book.title_en !== book.title_hi) {
    secondaryTitle = book.title_en;
  } else if (lang === 'ur') {
    if (book.title_hi) secondaryTitle = book.title_hi;
    else if (book.title_en) secondaryTitle = book.title_en;
  }

  const isUserUploaded = book.id && book.id.startsWith('chetna-17');

  return (
    <article className="group bg-[#FAF8F5] border border-[#D5CFC4] hover:border-[#161514] transition-all duration-200 flex flex-col justify-between overflow-hidden">
      
      {/* Plate Header / Cover Area */}
      <div
        onClick={() => onSelectBook(book)}
        className="relative bg-[#F4F1EA] p-3 flex items-center justify-center cursor-pointer overflow-hidden border-b border-[#D5CFC4]"
      >
        <div className="relative w-full aspect-[3/4] max-h-52 bg-[#EAE6DC] border border-[#D5CFC4] overflow-hidden flex items-center justify-center">
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-3 text-center text-[#7A746B]">
              <FileText className="w-8 h-8 mb-1" />
              <span className="font-editorial text-xs italic">{title}</span>
            </div>
          )}

          {/* Quiet Monograph Action Overlay */}
          <div className="absolute inset-0 bg-[#161514]/75 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex flex-col items-center justify-center gap-2 p-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenReader(book);
              }}
              className="w-full max-w-[140px] py-1.5 px-3 bg-[#F4F1EA] hover:bg-white text-[#161514] text-xs font-mono font-medium rounded-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#A83324]" />
              <span>{t.card.readOnline}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownloadBook(book);
              }}
              className="w-full max-w-[140px] py-1 px-3 bg-[#A83324] hover:bg-[#8C2A1E] text-white text-[11px] font-mono rounded-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>{t.card.downloadPdf}</span>
            </button>
          </div>
        </div>

        {/* Factual Monograph Badges */}
        {isUserUploaded ? (
          <div className="absolute top-2 left-2 bg-[#161514] text-[#F4F1EA] font-mono text-[9px] px-1.5 py-0.5 rounded-xs border border-[#161514]">
            {t.card.uploadedEdition}
          </div>
        ) : book.is_featured ? (
          <div className="absolute top-2 left-2 bg-[#A83324] text-white font-mono text-[9px] px-1.5 py-0.5 rounded-xs">
            {t.card.featured}
          </div>
        ) : null}

        {/* Admin Quick Edit Button */}
        {onEditBook && (
          <AdminOnly>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditBook(book);
              }}
              title={t.admin?.editBtn || 'संपादित करें'}
              className="absolute top-2 right-2 p-1 bg-[#161514] text-[#EAE6DC] hover:text-[#A83324] rounded-xs border border-[#4A463F] transition cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          </AdminOnly>
        )}

        {/* Temporal Year Plate */}
        {book.year && (
          <div className="absolute bottom-2 right-2 bg-[#161514]/85 text-[#F4F1EA] font-mono text-[9.5px] px-1.5 py-0.5 rounded-xs">
            {book.year}
          </div>
        )}
      </div>

      {/* Plate Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <h3
            onClick={() => onSelectBook(book)}
            className="font-editorial font-bold text-[#161514] text-[15px] leading-snug group-hover:text-[#A83324] transition-colors cursor-pointer line-clamp-2"
            title={title}
          >
            {title}
          </h3>

          {secondaryTitle && (
            <p className="text-[11px] font-mono text-[#7A746B] mt-0.5 line-clamp-1">
              {secondaryTitle}
            </p>
          )}

          <p className="text-xs font-serif text-[#4A463F] mt-1.5 line-clamp-1 italic">
            {author}
          </p>
        </div>

        {/* Quiet Rule & Metadata Bar */}
        <div className="mt-3 pt-2.5 border-t border-[#D5CFC4] flex items-center justify-between text-[10.5px] font-mono text-[#7A746B]">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1" title={`${book.views_count || 0} ${t.card.views}`}>
              <Eye className="w-3 h-3 text-[#7A746B]" />
              <span>{(book.views_count || 0).toLocaleString()}</span>
            </span>
            <span className="flex items-center gap-1 text-[#1E3D34]" title={`${book.downloads_count || 0} ${t.card.downloads}`}>
              <Download className="w-3 h-3" />
              <span>{(book.downloads_count || 0).toLocaleString()}</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onOpenReader(book)}
              title={t.card.readOnline}
              className="p-1 text-[#7A746B] hover:text-[#161514] hover:bg-[#EAE6DC] rounded-xs transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDownloadBook(book)}
              title={t.card.downloadPdf}
              className="p-1 text-[#7A746B] hover:text-[#1E3D34] hover:bg-[#EAE6DC] rounded-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </article>
  );
}

