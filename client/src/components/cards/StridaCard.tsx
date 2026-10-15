import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Download } from 'lucide-react';

export interface StridaCardProps {
  index: number | string;
  primaryTitle: string;
  vernacularTitle?: string;
  summary?: string;
  scriptTag?: string;
  year?: string | number;
  workCount?: number;
  to?: string;
  onClick?: () => void;
  // Document specific actions
  bookId?: string;
  fileUrl?: string;
  onOpenReader?: () => void;
  onDownload?: () => void;
  author?: string;
  coverImage?: string;
}

export function StridaCard({
  index,
  primaryTitle,
  vernacularTitle,
  summary,
  scriptTag = 'Devanagari',
  year,
  workCount,
  to,
  onClick,
  bookId,
  fileUrl,
  onOpenReader,
  onDownload,
  author,
  coverImage,
}: StridaCardProps) {
  // Format numeric index into prominent 01, 02, 03 badge
  const formattedIndex =
    typeof index === 'number'
      ? index < 9
        ? `0${index + 1}`
        : `${index + 1}`
      : String(index).padStart(2, '0');

  const destination = to || (bookId ? `/read/${bookId}` : '#');

  return (
    <div
      onClick={onClick}
      className="group relative rounded-[28px] overflow-hidden bg-[#161616] border border-white/[0.08] p-8 sm:p-12 transition-all duration-300 hover:border-white/[0.2] hover:bg-[#1a1a1a] flex flex-col justify-between"
    >
      {/* Background Graphic Ambient Accent */}
      {coverImage && (
        <div
          className="absolute inset-0 bg-cover bg-center z-0 opacity-20 transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-30 pointer-events-none"
          style={{ backgroundImage: `url(${coverImage})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#161616]/80 to-[#161616] z-1 pointer-events-none" />

      {/* Main Full-Area Link Action */}
      <Link to={destination} className="absolute inset-0 z-10">
        <span className="sr-only">View {primaryTitle}</span>
      </Link>

      {/* Top Header: Index Watermark in large Geist Mono */}
      <div className="relative z-2 flex items-start justify-between mb-8">
        <span className="font-mono text-4xl sm:text-6xl font-bold text-zinc-700 select-none tracking-tight group-hover:text-zinc-600 transition-colors">
          {formattedIndex}
        </span>

        {/* Script / Format Badge */}
        {scriptTag && (
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-white/[0.06] text-zinc-300 border border-white/[0.08] backdrop-blur-md">
            {scriptTag}
          </span>
        )}
      </div>

      {/* Typography Lockup */}
      <div className="relative z-2 max-w-2xl mb-8">
        {vernacularTitle && (
          <p className="text-zinc-400 text-sm mb-2 font-medium tracking-normal">
            {vernacularTitle}
          </p>
        )}

        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white font-sans group-hover:text-zinc-100 transition-colors">
          {primaryTitle}
        </h2>

        {author && (
          <p className="font-mono text-xs text-zinc-400 uppercase tracking-wider mt-2">
            By {author}
          </p>
        )}

        {summary && (
          <p className="text-zinc-400 text-sm max-w-xl mt-3 leading-relaxed font-sans line-clamp-3">
            {summary}
          </p>
        )}
      </div>

      {/* Footer Row: Metadata badges & Action arrow */}
      <div className="relative z-2 pt-6 border-t border-white/[0.08] flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {year && (
            <span className="font-mono text-[11px] text-zinc-400 bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/[0.06]">
              {year}
            </span>
          )}

          {typeof workCount === 'number' && (
            <span className="font-mono text-[11px] text-zinc-400 bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/[0.06]">
              [{workCount} WORKS]
            </span>
          )}

          {/* Quick Reader / Download Direct Trigger Buttons (if Document) */}
          {bookId && (
            <div className="flex items-center gap-1.5 z-20">
              {onOpenReader && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenReader();
                  }}
                  className="px-2.5 py-1 rounded-full bg-white/[0.08] hover:bg-white text-zinc-300 hover:text-black text-[10px] font-mono uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>Read</span>
                </button>
              )}
              {onDownload && fileUrl && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload();
                  }}
                  className="px-2.5 py-1 rounded-full bg-white/[0.08] hover:bg-white text-zinc-300 hover:text-black text-[10px] font-mono uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>PDF</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Action Arrow (↗) in large font-mono */}
        <span className="text-zinc-500 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all font-mono text-xl sm:text-2xl font-bold shrink-0">
          ↗
        </span>
      </div>
    </div>
  );
}

export default StridaCard;
