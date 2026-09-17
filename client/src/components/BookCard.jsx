import React from 'react';
import { BookOpen, Download, Eye, Sparkles, FileCheck, Edit3 } from 'lucide-react';
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
  const secondaryTitle = lang === 'en' ? (book.title_hi || book.title_ur) : book.title_en;
  const isUserUploaded = book.id && book.id.startsWith('chetna-17');

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1.5">
      
      {/* Top Cover Image Area */}
      <div
        onClick={() => onSelectBook(book)}
        className="relative bg-gradient-to-b from-stone-50 via-stone-100/50 to-stone-100 p-3.5 flex items-center justify-center cursor-pointer overflow-hidden border-b border-stone-100"
      >
        <div className="relative w-full aspect-[3/4] max-h-56 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow bg-stone-900 flex items-center justify-center">
          <img
            src={book.cover_url}
            alt={title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/35 via-transparent to-transparent pointer-events-none"></div>

          {/* Hover Overlay Buttons to Read & Download */}
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenReader(book);
              }}
              className="px-4 py-2 bg-white text-stone-900 font-bold text-xs rounded-xl shadow-md hover:bg-stone-50 flex items-center gap-1.5 transition transform hover:scale-105 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#1d4ed8]" />
              <span>{t.card.readOnline}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownloadBook(book);
              }}
              className="px-3.5 py-1.5 bg-[#1d4ed8] text-white font-semibold text-[11px] rounded-xl shadow-md hover:bg-[#1e40af] flex items-center gap-1.5 transition transform hover:scale-105 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>{t.card.downloadPdf}</span>
            </button>
          </div>
        </div>

        {/* User Uploaded vs Featured Badge */}
        {isUserUploaded ? (
          <div className="absolute top-2.5 left-2.5 bg-emerald-600 text-white font-bold text-[9.5px] px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
            <FileCheck className="w-2.5 h-2.5" />
            <span>Uploaded Edition</span>
          </div>
        ) : book.is_featured ? (
          <div className="absolute top-2.5 left-2.5 bg-amber-500 text-stone-950 font-bold text-[9.5px] px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>{t.card.featured}</span>
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
              title="Edit Book Metadata (Admin)"
              className="absolute top-2.5 right-2.5 p-1.5 bg-stone-900/90 hover:bg-stone-900 text-amber-400 rounded-lg shadow-md border border-stone-700 transition cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          </AdminOnly>
        )}

        {/* Year Badge */}
        {book.year && (
          <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-xs text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-amber-400/30">
            {book.year}
          </div>
        )}
      </div>

      {/* Book Metadata Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3
            onClick={() => onSelectBook(book)}
            className="font-hindi-serif font-bold text-stone-900 text-[14.5px] leading-snug group-hover:text-[#1d4ed8] transition-colors cursor-pointer line-clamp-2"
            title={title}
          >
            {title}
          </h3>

          {secondaryTitle && secondaryTitle !== title && (
            <p className="text-[11px] text-stone-400 italic mt-0.5 line-clamp-1">
              {secondaryTitle}
            </p>
          )}

          <p className="text-xs font-semibold text-[#1d4ed8] mt-1.5 line-clamp-1">
            {author}
          </p>
        </div>

        {/* Stats & Actions */}
        <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-0.5" title={`${book.views_count || 0} views`}>
              <Eye className="w-3 h-3 text-stone-400" />
              <span>{(book.views_count || 0).toLocaleString()}</span>
            </span>
            <span className="flex items-center gap-0.5 text-emerald-700 font-medium" title={`${book.downloads_count || 0} downloads`}>
              <Download className="w-3 h-3" />
              <span>{(book.downloads_count || 0).toLocaleString()}</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onOpenReader(book)}
              title={t.card.readOnline}
              className="p-1.5 text-stone-500 hover:text-white hover:bg-[#1d4ed8] rounded-lg transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDownloadBook(book)}
              title={t.card.downloadPdf}
              className="p-1.5 text-stone-500 hover:text-white hover:bg-emerald-700 rounded-lg transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
