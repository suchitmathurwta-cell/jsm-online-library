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
    <div className="group bg-white rounded-2xl border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] hover:border-black/15 transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1">
      
      {/* Top Cover Image Area */}
      <div
        onClick={() => onSelectBook && onSelectBook(book)}
        className="relative bg-zinc-50 p-3.5 flex items-center justify-center cursor-pointer overflow-hidden border-b border-black/[0.04]"
      >
        <div className="relative w-full aspect-[3/4] max-h-56 rounded-xl overflow-hidden shadow-2xs group-hover:shadow-md transition-shadow bg-zinc-100 flex items-center justify-center">
          <img
            src={book.cover_url}
            alt={title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Minimalist Micro Spine Shade */}
          <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/20 via-transparent to-transparent pointer-events-none"></div>

          {/* Hover Overlay Buttons to Read & Download */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenReader && onOpenReader(book);
              }}
              className="px-3.5 py-1.5 bg-white hover:bg-zinc-100 text-[#111111] font-sans font-medium text-xs rounded-full shadow-sm flex items-center gap-1.5 transition transform hover:scale-105 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#111111]" />
              <span>{t.card?.readOnline || 'Read Online'}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownloadBook && onDownloadBook(book);
              }}
              className="px-3 py-1.5 bg-[#111111] hover:bg-black text-white font-sans font-medium text-[11px] rounded-full shadow-sm flex items-center gap-1.5 transition transform hover:scale-105 cursor-pointer"
            >
              <Download className="w-3 h-3 text-white" />
              <span>{t.card?.downloadPdf || 'Download PDF'}</span>
            </button>
          </div>
        </div>

        {/* User Uploaded vs Featured Badge */}
        {isUserUploaded ? (
          <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-emerald-800 font-mono text-[9px] px-2 py-0.5 rounded-full shadow-2xs border border-emerald-200/80 flex items-center gap-1">
            <FileCheck className="w-2.5 h-2.5" />
            <span>{t.card?.uploadedEdition || 'Archival Edition'}</span>
          </div>
        ) : book.is_featured ? (
          <div className="absolute top-2.5 left-2.5 bg-[#111111] text-white font-mono text-[9px] px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-zinc-300" />
            <span>{t.card?.featured || 'Featured'}</span>
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
              title={t.admin?.editBtn || 'Edit'}
              className="absolute top-2.5 right-2.5 p-1.5 bg-white/95 hover:bg-white text-zinc-700 hover:text-black rounded-lg shadow-sm border border-zinc-200 transition cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          </AdminOnly>
        )}

        {/* Year Badge */}
        {book.year && (
          <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-xs text-zinc-700 font-mono text-[9.5px] px-2 py-0.5 rounded-md border border-black/[0.06] shadow-2xs">
            {book.year}
          </div>
        )}
      </div>

      {/* Book Metadata Section */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <h3
            onClick={() => onSelectBook && onSelectBook(book)}
            className="text-sm font-bold font-sans text-[#111111] line-clamp-1 group-hover:text-black cursor-pointer leading-tight tracking-tight"
            title={title}
          >
            {title}
          </h3>

          {secondaryTitle && (
            <p className="text-[11px] font-sans text-zinc-400 line-clamp-1 mt-0.5">
              {secondaryTitle}
            </p>
          )}

          <p className="text-xs font-sans text-zinc-600 mt-1.5 line-clamp-1 font-medium">
            {author}
          </p>
        </div>

        {/* Bottom Details Row */}
        <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{book.views_count || 0}</span>
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              <span>{book.downloads_count || 0}</span>
            </span>
          </div>

          {book.pages && (
            <span>{book.pages} {t.card?.pages || 'pp.'}</span>
          )}
        </div>
      </div>

    </div>
  );
}
