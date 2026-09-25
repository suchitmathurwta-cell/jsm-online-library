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
    <div className="group bg-[#FAF9F6] rounded-2xl border border-[#E2DDD5] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1">
      
      {/* Editorial Cover Presentation Area */}
      <div
        onClick={() => onSelectBook(book)}
        className="relative bg-[#F2EFE9] p-4 flex items-center justify-center cursor-pointer overflow-hidden border-b border-[#E2DDD5]"
      >
        <div className="relative w-full aspect-[3/4] max-h-60 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow bg-[#1E1B18] flex items-center justify-center">
          <img
            src={book.cover_url}
            alt={title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Book Spine Shadow Accent */}
          <div className="absolute inset-y-0 left-0 w-3.5 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none"></div>

          {/* Editorial Hover Action Layer */}
          <div className="absolute inset-0 bg-[#1E1B18]/70 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenReader(book);
              }}
              className="px-4 py-2 bg-[#FAF9F6] text-[#1E1B18] font-bold text-xs rounded-xl shadow-md hover:bg-white flex items-center gap-1.5 transition transform hover:scale-105 cursor-pointer font-editorial"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#BA4E36]" />
              <span>{t.card.readOnline}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownloadBook(book);
              }}
              className="px-3.5 py-1.5 bg-[#BA4E36] text-white font-semibold text-[11px] rounded-xl shadow-md hover:bg-[#a0422d] flex items-center gap-1.5 transition transform hover:scale-105 cursor-pointer font-editorial"
            >
              <Download className="w-3 h-3" />
              <span>{t.card.downloadPdf}</span>
            </button>
          </div>
        </div>

        {/* Edition Badges: Terracotta & Olive */}
        {isUserUploaded ? (
          <div className="absolute top-3 left-3 bg-[#1E1B18] text-[#FAF9F6] font-bold text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1 border border-[#E2DDD5]/40">
            <FileCheck className="w-2.5 h-2.5 text-[#BA4E36]" />
            <span>{t.card.uploadedEdition}</span>
          </div>
        ) : book.is_featured ? (
          <div className="absolute top-3 left-3 bg-[#BA4E36] text-white font-bold text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
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
              title={t.admin.editBtn}
              className="absolute top-3 right-3 p-1.5 bg-[#FAF9F6]/90 hover:bg-white text-[#1E1B18] rounded-lg shadow-md border border-[#E2DDD5] transition cursor-pointer"
            >
              <Edit3 className="w-3 h-3 text-[#BA4E36]" />
            </button>
          </AdminOnly>
        )}

        {/* Publication Year Badge */}
        {book.year && (
          <div className="absolute bottom-3 right-3 bg-[#1E1B18]/80 backdrop-blur-xs text-[#FAF9F6] text-[10px] font-mono px-2 py-0.5 rounded-md border border-[#FAF9F6]/20">
            {book.year}
          </div>
        )}
      </div>

      {/* Book Editorial Typography Section */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3
            onClick={() => onSelectBook(book)}
            className="font-editorial font-bold text-[#1E1B18] text-base leading-snug group-hover:text-[#BA4E36] transition-colors cursor-pointer line-clamp-2"
            title={title}
          >
            {title}
          </h3>

          {secondaryTitle && secondaryTitle !== title && (
            <p className="text-[11px] text-[#66615B] italic mt-0.5 line-clamp-1 font-editorial">
              {secondaryTitle}
            </p>
          )}

          <p className="text-xs font-semibold text-[#BA4E36] mt-1.5 line-clamp-1 font-editorial">
            {author}
          </p>
        </div>

        {/* Stats & Reader Triggers */}
        <div className="pt-3 border-t border-[#E2DDD5] flex items-center justify-between text-[11px] text-[#66615B]">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1 font-mono text-[10px]" title={`${book.views_count || 0} ${t.card.views}`}>
              <Eye className="w-3 h-3 text-[#66615B]" />
              <span>{(book.views_count || 0).toLocaleString()}</span>
            </span>
            <span className="flex items-center gap-1 font-mono text-[10px] text-[#BA4E36] font-medium" title={`${book.downloads_count || 0} ${t.card.downloads}`}>
              <Download className="w-3 h-3" />
              <span>{(book.downloads_count || 0).toLocaleString()}</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onOpenReader(book)}
              title={t.card.readOnline}
              className="p-1.5 text-[#66615B] hover:text-white hover:bg-[#BA4E36] rounded-lg transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDownloadBook(book)}
              title={t.card.downloadPdf}
              className="p-1.5 text-[#66615B] hover:text-white hover:bg-[#1E1B18] rounded-lg transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
