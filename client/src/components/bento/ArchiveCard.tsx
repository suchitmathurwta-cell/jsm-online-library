import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, BookOpen, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface ArchiveCardProps {
  id?: string;
  indexNumber?: string | number;
  titleEn: string;
  titleVernacular?: string;
  subtitle?: string;
  workCount?: number;
  workCountLabel?: string;
  subdivisionCount?: number;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
  className?: string;
  colSpan?: string;
  isSelected?: boolean;
}

export const ArchiveCard: React.FC<ArchiveCardProps> = ({
  id,
  indexNumber,
  titleEn,
  titleVernacular,
  subtitle,
  workCount = 0,
  workCountLabel,
  subdivisionCount,
  icon: Icon = BookOpen,
  href,
  onClick,
  className = '',
  colSpan = 'col-span-12 md:col-span-6 lg:col-span-4',
  isSelected = false,
}) => {
  const formattedIndex = indexNumber
    ? String(indexNumber).padStart(2, '0')
    : undefined;

  const countBadgeText = workCountLabel || `${workCount.toLocaleString()} works`;

  const cardContent = (
    <motion.div
      whileHover={{ scale: 1.015, y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={onClick}
      className={`group relative flex flex-col justify-between rounded-3xl border border-black/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.02)] bg-white p-6 sm:p-7 transition-all duration-300 cursor-pointer overflow-hidden ${
        isSelected ? 'ring-2 ring-[#111111] border-transparent' : 'hover:border-black/15 hover:shadow-[0_12px_32px_rgba(0,0,0,0.05)]'
      } ${className}`}
    >
      {/* Background ambient gradient accent on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/[0.015] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Top Header Row */}
      <div className="relative z-10 flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          {formattedIndex && (
            <span className="font-mono text-[11px] tracking-wider text-zinc-400 font-medium bg-zinc-100/80 px-2 py-0.5 rounded-full border border-black/[0.04]">
              {formattedIndex}
            </span>
          )}
          <div className="w-9 h-9 rounded-2xl bg-zinc-100/90 text-[#111111] flex items-center justify-center border border-black/[0.04] transition-transform duration-300 group-hover:scale-105">
            <Icon className="w-4 h-4" />
          </div>
        </div>

        {/* Work count pill badge */}
        <span className="font-mono text-[11px] font-medium px-2.5 py-1 rounded-full bg-zinc-100/70 text-zinc-600 border border-black/[0.04] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 group-hover:bg-black transition-colors" />
          {countBadgeText}
        </span>
      </div>

      {/* Central Content: Bilingual Titles */}
      <div className="relative z-10 mb-6">
        {titleVernacular && (
          <div className="text-sm sm:text-base font-medium text-zinc-500 mb-1 tracking-tight font-sans">
            {titleVernacular}
          </div>
        )}
        <h3 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight font-sans leading-tight group-hover:text-black transition-colors">
          {titleEn}
        </h3>
        {subtitle && (
          <p className="mt-2 text-xs sm:text-sm text-zinc-500 leading-relaxed font-sans line-clamp-2">
            {subtitle}
          </p>
        )}
      </div>

      {/* Bottom Utility Footer */}
      <div className="relative z-10 pt-4 border-t border-black/[0.05] flex items-center justify-between">
        <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-zinc-400" />
          <span>
            {subdivisionCount !== undefined
              ? `${subdivisionCount} sub-divisions`
              : 'Archive Layer'}
          </span>
        </div>

        <div className="inline-flex items-center gap-1 text-xs font-medium text-[#111111] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
          <span className="font-sans">Access</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-black transition-colors" />
        </div>
      </div>
    </motion.div>
  );

  if (href) {
    return (
      <Link to={href} className={`${colSpan} block no-underline`}>
        {cardContent}
      </Link>
    );
  }

  return <div className={colSpan}>{cardContent}</div>;
};

export default ArchiveCard;
