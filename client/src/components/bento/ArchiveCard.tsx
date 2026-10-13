import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCategoryGraphic } from '../../data/categoryGraphics';

export interface ArchiveCardProps {
  title: string;
  vernacularTitle?: string;
  category: string;
  workCount: number;
  slug: string;
  colSpan?: string;
  aspectRatio?: string;
  coverImage?: string;
  onClick?: () => void;
  // Backward compatibility alias props
  titleEn?: string;
  id?: string;
  indexNumber?: string | number;
  subtitle?: string;
  subdivisionCount?: number;
  icon?: any;
  href?: string;
  isSelected?: boolean;
}

export function ArchiveCard({
  title,
  vernacularTitle,
  category,
  workCount = 0,
  slug,
  colSpan = 'md:col-span-6',
  aspectRatio = 'aspect-[16/11]',
  coverImage,
  onClick,
  titleEn,
  id,
  href,
}: ArchiveCardProps) {
  const displayTitle = title || titleEn || 'Archive Category';
  const targetSlug = slug || id || '';
  const destination = href || `/category/${targetSlug}`;

  const graphic = getCategoryGraphic(targetSlug);
  const resolvedCover = coverImage || graphic?.image || graphic?.remoteFallback;
  const gradientClass = graphic?.accentGradient || 'from-zinc-800/20 via-zinc-900/60 to-black';

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[24px] bg-[#141414] border border-white/[0.08] ${colSpan} ${aspectRatio}`}
    >
      <Link className="absolute inset-0 z-30" to={destination}>
        <span className="sr-only">Open {displayTitle}</span>
      </Link>

      {/* Ambient Archival Visual / Cover Layer */}
      {resolvedCover && (
        <div
          className="absolute inset-0 bg-cover bg-center z-0 transition-all duration-700 ease-out group-hover:scale-105 opacity-40 group-hover:opacity-60"
          style={{ backgroundImage: `url(${resolvedCover})` }}
        />
      )}

      {/* Multi-stop ambient dark gradient for high legibility */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} z-10 transition-transform duration-700 ease-out group-hover:scale-105 opacity-90`} />

      {/* Deep vignette at the bottom behind pinned typography */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-15 pointer-events-none" />

      {/* Subtle geometric grid / archival radial texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.05),transparent_70%)] z-15 pointer-events-none" />

      {/* Top Floating Badges */}
      <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.12] text-zinc-200">
          {category}
        </span>
        <span className="font-mono text-[10px] tracking-widest text-zinc-300 bg-black/40 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/[0.06]">
          [{workCount} WORKS]
        </span>
      </div>

      {/* Bottom Pinned Typography */}
      <div className="absolute bottom-6 left-6 right-6 z-20">
        {graphic?.motif && (
          <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-400 mb-1 opacity-80">
            {graphic.motif}
          </p>
        )}
        {vernacularTitle && (
          <p className="font-sans text-sm text-zinc-300 mb-1 tracking-normal font-medium">
            {vernacularTitle}
          </p>
        )}
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-bold tracking-[-0.03em] text-white group-hover:text-zinc-100 transition-colors font-sans">
            {displayTitle}
          </h2>
          <span className="text-zinc-400 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform font-mono text-lg shrink-0">
            ↗
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default ArchiveCard;
