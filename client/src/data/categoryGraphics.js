// High-Fidelity Graphical Asset Registry for Chetna Digital Archive / Mugen Studio Layout
export const categoryGraphics = {
  'cultural-conscience': {
    slug: 'cultural-conscience',
    image: '/images/categories/cultural-conscience.jpg',
    remoteFallback: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
    accentGradient: 'from-amber-950/25 via-zinc-950/40 to-black/60',
    motif: 'PHILOSOPHICAL CONSCIENCE & ETHICS',
    accentColor: '#b45309',
    tag: 'FOUNDATIONAL'
  },
  'novel': {
    slug: 'novel',
    image: '/images/categories/novel.jpg',
    remoteFallback: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80',
    accentGradient: 'from-amber-950/25 via-zinc-950/40 to-black/60',
    motif: 'EPIC NARRATIVES & SOCIAL REALISM',
    accentColor: '#92400e',
    tag: 'LONG-FORM PROSE'
  },
  'story': {
    slug: 'story',
    image: '/images/categories/story.jpg',
    remoteFallback: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?auto=format&fit=crop&w=1200&q=80',
    accentGradient: 'from-emerald-950/25 via-zinc-950/40 to-black/60',
    motif: 'SHORT FICTION & ORAL TRADITIONS',
    accentColor: '#065f46',
    tag: 'NARRATIVE'
  },
  'poetry': {
    slug: 'poetry',
    image: '/images/categories/poetry.jpg',
    remoteFallback: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=1200&q=80',
    accentGradient: 'from-purple-950/25 via-zinc-950/40 to-black/60',
    motif: 'GHAZALS, NAZMS & METRICAL VERSE',
    accentColor: '#6b21a8',
    tag: 'VERSE & PROSODY'
  },
  'magazines': {
    slug: 'magazines',
    image: '/images/categories/magazines.jpg',
    remoteFallback: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
    accentGradient: 'from-blue-950/25 via-zinc-950/40 to-black/60',
    motif: 'LITERARY PERIODICALS & MANIFESTOS',
    accentColor: '#1e40af',
    tag: 'PERIODICALS'
  },
  'vimarsh': {
    slug: 'vimarsh',
    image: '/images/categories/vimarsh.jpg',
    remoteFallback: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
    accentGradient: 'from-rose-950/25 via-zinc-950/40 to-black/60',
    motif: 'CRITICAL DISCOURSE & IDENTITY',
    accentColor: '#be123c',
    tag: 'DISCOURSE'
  },
  'drama': {
    slug: 'drama',
    image: '/images/categories/drama.jpg',
    remoteFallback: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=80',
    accentGradient: 'from-orange-950/25 via-zinc-950/40 to-black/60',
    motif: 'STAGE, PERFORMANCE & PLAYWRIGHTS',
    accentColor: '#c2410c',
    tag: 'THEATRE'
  },
  'satire': {
    slug: 'satire',
    image: '/images/categories/satire.jpg',
    remoteFallback: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=80',
    accentGradient: 'from-yellow-950/25 via-zinc-950/40 to-black/60',
    motif: 'SOCIO-POLITICAL WIT & ALLEGORY',
    accentColor: '#b45309',
    tag: 'SATIRE'
  },
  'essays': {
    slug: 'essays',
    image: '/images/categories/essays.jpg',
    remoteFallback: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80',
    accentGradient: 'from-teal-950/25 via-zinc-950/40 to-black/60',
    motif: 'SCHOLARSHIP, LEXICON & TREATISES',
    accentColor: '#0f766e',
    tag: 'CRITICISM'
  }
};

export const spotlightGraphics = [
  {
    image: '/images/categories/spotlight-godan.jpg',
    remoteFallback: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
    accentGradient: 'from-amber-950/30 via-black/50 to-black/60'
  },
  {
    image: '/images/categories/spotlight-faiz.jpg',
    remoteFallback: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=1000&q=80',
    accentGradient: 'from-purple-950/30 via-black/50 to-black/60'
  },
  {
    image: '/images/categories/spotlight-saraswati.jpg',
    remoteFallback: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1000&q=80',
    accentGradient: 'from-blue-950/30 via-black/50 to-black/60'
  }
];

export function getCategoryGraphic(slug) {
  if (!slug) return null;
  return categoryGraphics[slug] || null;
}
