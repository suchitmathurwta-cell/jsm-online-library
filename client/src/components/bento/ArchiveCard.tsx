import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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
      {coverImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-700 ease-out group-hover:scale-105 opacity-30 group-hover:opacity-40"
          style={{ backgroundImage: `url(${coverImage})` }}
        />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 via-zinc-900/60 to-black z-10 transition-transform duration-700 ease-out group-hover:scale-105" />

      {/* Subtle geometric grid / archival radial texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.03),transparent_70%)] z-10 pointer-events-none" />

      {/* Top Floating Badges */}
      <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/[0.08] text-zinc-300">
          {category}
        </span>
        <span className="font-mono text-[10px] tracking-widest text-zinc-400">
          [{workCount} WORKS]
        </span>
      </div>

      {/* Bottom Pinned Typography */}
      <div className="absolute bottom-6 left-6 right-6 z-20">
        {vernacularTitle && (
          <p className="font-sans text-sm text-zinc-400 mb-1 tracking-normal font-medium">
            {vernacularTitle}
          </p>
        )}
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-bold tracking-[-0.03em] text-white group-hover:text-zinc-200 transition-colors font-sans">
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
