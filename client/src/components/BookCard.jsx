import React from 'react';
import { BookOpen, Download, Eye, Sparkles, FileCheck, Edit3, Trash2 } from 'lucide-react';
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
    <div className="group bg-[#141414] rounded-[24px] border border-white/[0.08] hover:border-white/20 transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      
      {/* Top Cover Image Area */}
      <div
        onClick={() => onSelectBook && onSelectBook(book)}
        className="relative bg-black p-3.5 flex items-center justify-center cursor-pointer overflow-hidden border-b border-white/[0.06]"
      >
        <div className="relative w-full aspect-[3/4] max-h-56 rounded-xl overflow-hidden bg-zinc-900 flex items-center justify-center">
          <img
            src={book.cover_url}
            alt={title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Minimalist Spine Shade */}
          <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* Hover Overlay Buttons to Read & Download (Desktop) */}
          <div className="hidden sm:flex absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-col items-center justify-center gap-2 p-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenReader && onOpenReader(book);
              }}
              className="px-3.5 py-1.5 bg-white hover:bg-zinc-200 text-black font-mono text-[11px] uppercase tracking-wider font-semibold rounded-full shadow-sm flex items-center gap-1.5 transition transform hover:scale-105 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-black" />
              <span>{t?.card?.readOnline || 'Read Online'}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownloadBook && onDownloadBook(book);
              }}
              className="px-3.5 py-1.5 bg-white/[0.1] hover:bg-white/[0.2] border border-white/[0.2] text-white font-mono text-[10px] uppercase tracking-wider rounded-full shadow-sm flex items-center gap-1.5 transition transform hover:scale-105 cursor-pointer"
            >
              <Download className="w-3 h-3 text-white" />
              <span>{t?.card?.downloadPdf || 'Download PDF'}</span>
            </button>
          </div>
        </div>

        {/* User Uploaded vs Featured Badge */}
        {isUserUploaded ? (
          <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md text-emerald-400 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
            <FileCheck className="w-2.5 h-2.5" />
            <span>{t?.card?.uploadedEdition || 'Archival Edition'}</span>
          </div>
        ) : book.is_featured ? (
          <div className="absolute top-2.5 left-2.5 bg-white text-black font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
            <Sparkles className="w-2.5 h-2.5 text-black" />
            <span>{t?.card?.featured || 'Featured'}</span>
          </div>
        ) : null}

        {/* Admin Quick Edit & Delete Button */}
        {onEditBook && (
          <AdminOnly>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditBook(book);
              }}
              title={t?.admin?.editBtn || 'Edit / Delete Book'}
              className="absolute top-2.5 right-2.5 z-20 px-2 py-1 bg-black/90 hover:bg-amber-400 hover:text-black text-amber-300 rounded-lg border border-amber-400/50 transition cursor-pointer flex items-center gap-1 shadow-md"
            >
              <Edit3 className="w-3 h-3" />
              <Trash2 className="w-3 h-3 text-red-400 group-hover:text-current" />
            </button>
          </AdminOnly>
        )}

        {/* Year Badge */}
        {book.year && (
          <div className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-xs text-zinc-400 font-mono text-[9.5px] px-2 py-0.5 rounded-md border border-white/[0.08]">
            {book.year}
          </div>
        )}
      </div>

      {/* Book Metadata Section */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3
            onClick={() => onSelectBook && onSelectBook(book)}
            className="text-sm font-bold text-white line-clamp-1 group-hover:text-zinc-200 cursor-pointer leading-tight tracking-tight font-sans"
            title={title}
          >
            {title}
          </h3>

          {secondaryTitle && (
            <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5 font-sans">
              {secondaryTitle}
            </p>
          )}

          <p className="text-xs text-zinc-400 mt-1.5 line-clamp-1 font-mono uppercase tracking-wider">
            {author}
          </p>
        </div>

        {/* Bottom Details Row */}
        <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-zinc-500" />
              <span>{book.views_count || 0}</span>
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3 text-zinc-500" />
              <span>{book.downloads_count || 0}</span>
            </span>
          </div>

          {book.pages && (
            <span className="tracking-widest">[{book.pages} PP.]</span>
          )}
        </div>

        {/* Touch-friendly Mobile Read & Download Row */}
        <div className="sm:hidden grid grid-cols-2 gap-1.5 mt-2.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenReader && onOpenReader(book);
            }}
            className="py-1.5 px-2 rounded-xl bg-white text-black text-[10.5px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer active:scale-95"
          >
            <BookOpen className="w-3 h-3 shrink-0" />
            <span>{lang === 'hi' ? 'पढ़ें' : lang === 'ur' ? 'پڑھیں' : 'Read'}</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDownloadBook && onDownloadBook(book);
            }}
            className="py-1.5 px-2 rounded-xl bg-white/[0.08] text-white border border-white/[0.15] text-[10.5px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer active:scale-95"
          >
            <Download className="w-3 h-3 shrink-0" />
            <span>PDF</span>
          </button>
        </div>

        {/* Mobile-friendly Admin Action Button Row */}
        {onEditBook && (
          <AdminOnly>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEditBook(book);
              }}
              className="mt-2 w-full py-1.5 px-3 rounded-xl bg-amber-400/15 hover:bg-amber-400 hover:text-black text-amber-300 border border-amber-400/40 text-[11px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>{lang === 'hi' ? 'संपादित / हटाएं' : lang === 'ur' ? 'ترمیم / حذف' : 'Edit / Delete'}</span>
            </button>
          </AdminOnly>
        )}
      </div>

    </div>
  );
}
