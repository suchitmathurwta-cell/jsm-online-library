import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCategoryGraphic } from '../../data/categoryGraphics';
import { getCategoryColor } from '../../data/categoryColors';

export interface ArchiveCardProps {
  title: string;
  vernacularTitle?: string;
  category?: string;
  workCount?: number;
  slug?: string;
  colSpan?: string;
  aspectRatio?: string;
  coverImage?: string;
  indexNumber?: string | number;
  lang?: string;
  onClick?: () => void;
  // Backward compatibility alias props
  titleEn?: string;
  id?: string;
  subtitle?: string;
  subdivisionCount?: number;
  icon?: any;
  href?: string;
  isSelected?: boolean;
}

export function ArchiveCard({
  title,
  category,
  workCount = 0,
  slug,
  colSpan = 'w-full',
  aspectRatio = 'aspect-[16/11]',
  coverImage,
  indexNumber,
  lang = 'en',
  onClick,
  titleEn,
  id,
  href,
}: ArchiveCardProps) {
  const displayTitle = title || titleEn || 'Archive Category';
  const targetSlug = slug || id || '';
  const destination = href || `/category/${targetSlug}`;

  const graphic = getCategoryGraphic(targetSlug);
  const color = getCategoryColor(targetSlug);
  const resolvedCover = coverImage || graphic?.image || graphic?.remoteFallback;
  const gradientClass = graphic?.accentGradient || color.gradient || 'from-zinc-800/20 via-zinc-900/60 to-black';

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[24px] bg-[#141414] border border-white/[0.08] hover:border-white/25 transition-all duration-300 flex flex-col justify-end ${colSpan} ${aspectRatio}`}
      style={{
        boxShadow: `0 8px 30px rgba(0, 0, 0, 0.6)`,
      }}
    >
      <Link className="absolute inset-0 z-30" to={destination}>
        <span className="sr-only">Open {displayTitle}</span>
      </Link>

      {/* Ambient Archival Visual / Cover Layer */}
      {resolvedCover && (
        <div
          className="absolute inset-0 bg-cover bg-center z-0 transition-all duration-700 ease-out group-hover:scale-105 opacity-65 group-hover:opacity-85"
          style={{ backgroundImage: `url(${resolvedCover})` }}
        />
      )}

      {/* Signature Multi-stop Ambient Color Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} z-10 transition-transform duration-700 ease-out group-hover:scale-105 opacity-65`} />

      {/* Vignette at the bottom behind pinned typography */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent z-15 pointer-events-none" />

      {/* Archival subtle geometric/radial sheen */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.06),transparent_70%)] z-15 pointer-events-none" />

      {/* Bottom Pinned Typography - Clean Single-Language Header */}
      <div className="relative z-20 p-6 sm:p-7">
        {lang === 'en' && graphic?.motif && (
          <p
            className="font-mono text-[9px] uppercase tracking-[0.25em] mb-1.5 font-semibold"
            style={{ color: color.hex }}
          >
            {graphic.motif}
          </p>
        )}
        <div className="flex items-end justify-between gap-4">
          <h2
            className={`text-xl sm:text-2xl lg:text-3xl font-bold tracking-[-0.03em] text-white group-hover:text-zinc-100 transition-colors ${
              lang === 'ur' ? 'font-urdu' : 'font-sans'
            } truncate`}
          >
            {displayTitle}
          </h2>
          <span
            className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform font-mono text-lg shrink-0"
            style={{ color: color.hex }}
          >
            ↗
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default ArchiveCard;
