// Signature Palette & Visual Tokens for Chetna Digital Archive Categories
export const CATEGORY_COLORS = {
  novel: {
    id: 'novel',
    hex: '#F59E0B', // Amber
    subtleHex: '#D97706',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    hoverBorder: 'hover:border-amber-500/50',
    bg: 'bg-amber-500/10',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    gradient: 'from-amber-500/25 via-zinc-950/40 to-black/70',
    glow: 'rgba(245, 158, 11, 0.18)',
    accentBg: '#F59E0B',
  },
  story: {
    id: 'story',
    hex: '#3B82F6', // Cobalt / Sapphire
    subtleHex: '#2563EB',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    hoverBorder: 'hover:border-blue-500/50',
    bg: 'bg-blue-500/10',
    badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    gradient: 'from-blue-500/25 via-zinc-950/40 to-black/70',
    glow: 'rgba(59, 130, 246, 0.18)',
    accentBg: '#3B82F6',
  },
  poetry: {
    id: 'poetry',
    hex: '#10B981', // Emerald / Persian Jade
    subtleHex: '#059669',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    hoverBorder: 'hover:border-emerald-500/50',
    bg: 'bg-emerald-500/10',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    gradient: 'from-emerald-500/25 via-zinc-950/40 to-black/70',
    glow: 'rgba(16, 185, 129, 0.18)',
    accentBg: '#10B981',
  },
  magazines: {
    id: 'magazines',
    hex: '#F43F5E', // Ruby / Velvet Rose
    subtleHex: '#E11D48',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    hoverBorder: 'hover:border-rose-500/50',
    bg: 'bg-rose-500/10',
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    gradient: 'from-rose-500/25 via-zinc-950/40 to-black/70',
    glow: 'rgba(244, 63, 94, 0.18)',
    accentBg: '#F43F5E',
  },
  vimarsh: {
    id: 'vimarsh',
    hex: '#8B5CF6', // Royal Amethyst / Purple
    subtleHex: '#7C3AED',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    hoverBorder: 'hover:border-purple-500/50',
    bg: 'bg-purple-500/10',
    badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    gradient: 'from-purple-500/25 via-zinc-950/40 to-black/70',
    glow: 'rgba(139, 92, 246, 0.18)',
    accentBg: '#8B5CF6',
  },
  'cultural-conscience': {
    id: 'cultural-conscience',
    hex: '#EAB308', // Ochre / Warm Gold
    subtleHex: '#CA8A04',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
    hoverBorder: 'hover:border-yellow-500/50',
    bg: 'bg-yellow-500/10',
    badge: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    gradient: 'from-yellow-500/25 via-zinc-950/40 to-black/70',
    glow: 'rgba(234, 179, 8, 0.18)',
    accentBg: '#EAB308',
  },
  satire: {
    id: 'satire',
    hex: '#F97316', // Coral / Tangerine
    subtleHex: '#EA580C',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
    hoverBorder: 'hover:border-orange-500/50',
    bg: 'bg-orange-500/10',
    badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    gradient: 'from-orange-500/25 via-zinc-950/40 to-black/70',
    glow: 'rgba(249, 115, 22, 0.18)',
    accentBg: '#F97316',
  },
  drama: {
    id: 'drama',
    hex: '#06B6D4', // Luminous Cyan / Teal
    subtleHex: '#0891B2',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    hoverBorder: 'hover:border-cyan-500/50',
    bg: 'bg-cyan-500/10',
    badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    gradient: 'from-cyan-500/25 via-zinc-950/40 to-black/70',
    glow: 'rgba(6, 182, 212, 0.18)',
    accentBg: '#06B6D4',
  },
  essays: {
    id: 'essays',
    hex: '#6366F1', // Indigo / Lapis
    subtleHex: '#4F46E5',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
    hoverBorder: 'hover:border-indigo-500/50',
    bg: 'bg-indigo-500/10',
    badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    gradient: 'from-indigo-500/25 via-zinc-950/40 to-black/70',
    glow: 'rgba(99, 102, 241, 0.18)',
    accentBg: '#6366F1',
  },
};

export function getCategoryColor(catId) {
  if (!catId) {
    return {
      hex: '#A1A1AA',
      subtleHex: '#71717A',
      text: 'text-zinc-300',
      border: 'border-white/10',
      hoverBorder: 'hover:border-white/20',
      bg: 'bg-white/5',
      badge: 'bg-white/10 text-zinc-300 border-white/15',
      gradient: 'from-white/10 via-zinc-950/20 to-black/60',
      glow: 'rgba(255, 255, 255, 0.1)',
      accentBg: '#A1A1AA',
    };
  }

  const normalized = String(catId).toLowerCase().trim();
  if (CATEGORY_COLORS[normalized]) {
    return CATEGORY_COLORS[normalized];
  }

  // Fallbacks for sub-genres or custom IDs based on keyword matching
  if (normalized.includes('novel')) return CATEGORY_COLORS.novel;
  if (normalized.includes('story') || normalized.includes('kahani')) return CATEGORY_COLORS.story;
  if (normalized.includes('poetry') || normalized.includes('kavita') || normalized.includes('ghazal')) return CATEGORY_COLORS.poetry;
  if (normalized.includes('mag') || normalized.includes('patrika')) return CATEGORY_COLORS.magazines;
  if (normalized.includes('vimarsh') || normalized.includes('discourse')) return CATEGORY_COLORS.vimarsh;
  if (normalized.includes('conscience') || normalized.includes('chetna')) return CATEGORY_COLORS['cultural-conscience'];
  if (normalized.includes('satire') || normalized.includes('vyang')) return CATEGORY_COLORS.satire;
  if (normalized.includes('drama') || normalized.includes('natak')) return CATEGORY_COLORS.drama;
  if (normalized.includes('essay') || normalized.includes('nibandh')) return CATEGORY_COLORS.essays;

  return {
    hex: '#A1A1AA',
    subtleHex: '#71717A',
    text: 'text-zinc-300',
    border: 'border-white/10',
    hoverBorder: 'hover:border-white/20',
    bg: 'bg-white/5',
    badge: 'bg-white/10 text-zinc-300 border-white/15',
    gradient: 'from-white/10 via-zinc-950/20 to-black/60',
    glow: 'rgba(255, 255, 255, 0.1)',
    accentBg: '#A1A1AA',
  };
}
