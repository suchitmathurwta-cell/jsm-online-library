import React from 'react';
import { getCategoryColor } from '../data/categoryColors';

/**
 * AuroraStreamBackdrop
 * Renders an ethereal, fluid Northern Lights (Aurora Borealis) ambient glow
 * across the right-hand main content stream that smoothly transitions color
 * tokens whenever the active category section changes.
 */
export default function AuroraStreamBackdrop({ activeSection = 'novel' }) {
  const color = getCategoryColor(activeSection);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none sticky top-0 h-0 w-full overflow-visible z-0 select-none"
    >
      <div className="absolute top-0 left-0 right-0 h-[620px] overflow-hidden">
        {/* Atmospheric Ambient Glow 1: Primary Organic Wave */}
        <div
          className="absolute -top-[20%] left-[5%] w-[85vw] max-w-[950px] h-[520px] blur-[115px] mix-blend-screen opacity-45 sm:opacity-55 animate-aurora-1 transition-all duration-1000 ease-out"
          style={{
            background: `radial-gradient(ellipse at 40% 30%, ${color.hex}75 0%, ${color.subtleHex}35 50%, transparent 75%)`,
          }}
        />

        {/* Atmospheric Ambient Glow 2: Harmonic Counter Wave */}
        <div
          className="absolute -top-[10%] -right-[5%] w-[75vw] max-w-[850px] h-[500px] blur-[130px] mix-blend-screen opacity-35 sm:opacity-45 animate-aurora-2 transition-all duration-1000 ease-out"
          style={{
            background: `radial-gradient(ellipse at 65% 35%, ${color.lightHex}60 0%, ${color.hex}35 45%, transparent 70%)`,
          }}
        />

        {/* Atmospheric Ambient Glow 3: Central Swelling Light Pillar */}
        <div
          className="absolute top-[0%] left-[20%] w-[65vw] max-w-[700px] h-[420px] blur-[100px] mix-blend-screen opacity-30 sm:opacity-40 animate-aurora-3 transition-all duration-1000 ease-out"
          style={{
            background: `radial-gradient(circle at 50% 20%, ${color.hex}45 0%, transparent 65%)`,
          }}
        />

        {/* Aurora Shimmer Beam: Sweeping subtle horizontal ray */}
        <div
          className="absolute top-[8%] -left-[10%] -right-[10%] h-[140px] blur-3xl opacity-35 animate-aurora-shimmer transition-all duration-1000 ease-out"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${color.lightHex}35 50%, transparent 100%)`,
          }}
        />

        {/* Subtle Horizon Vignette: Seamless melt into #0E0E0E */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0E0E0E]/40 via-60% to-[#0E0E0E] pointer-events-none" />
      </div>
    </div>
  );
}
