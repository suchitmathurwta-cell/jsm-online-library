import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer({ lang = 'hi', t, onOpenUpload, onOpenAdmin }) {
  return (
    <footer className="bg-[#080808] text-zinc-400 pt-16 pb-12 border-t border-white/[0.08]">
      <div className="max-w-[1440px] mx-auto px-6">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-white/[0.06]">
          
          {/* Col 1: Brand & Purpose */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black font-sans font-bold text-sm shadow-xs">
                <span>{lang === 'ur' ? 'چ' : (lang === 'en' ? 'CH' : 'चे')}</span>
              </div>
              <span className="font-sans text-xl font-bold tracking-tight text-white">
                {t.brand || 'CHETNA'}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 bg-white/[0.06] px-2.5 py-0.5 rounded-full border border-white/[0.08]">
                {t.brandSubtitle || 'ARCHIVE'}
              </span>
            </div>

            <p className="text-xs text-zinc-400 font-sans leading-relaxed max-w-sm">
              {t.footer?.about || 'Digital cultural conscience, philosophical discourse, and open-access literary preservation repository.'}
            </p>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={onOpenUpload}
                className="px-4 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-mono uppercase tracking-wider font-semibold rounded-full shadow-xs transition cursor-pointer"
              >
                + {t.nav?.uploadBook || 'UPLOAD WORK'}
              </button>
              <button
                onClick={onOpenAdmin}
                className="px-4 py-2 bg-[#141414] hover:bg-white/[0.08] text-zinc-300 hover:text-white text-xs font-mono uppercase tracking-wider rounded-full transition cursor-pointer border border-white/[0.08]"
              >
                ⚙️ {t.nav?.manageLibrary || 'MANAGE'}
              </button>
            </div>
          </div>

          {/* Col 2: Major Genres */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="text-xs font-mono uppercase tracking-[0.25em] text-white">
              {t.footer?.majorGenres || 'PRIMARY DOMAINS'}
            </h4>
            <ul className="space-y-1.5 text-xs text-zinc-400 font-sans">
              <li><Link to="/category/novel" className="hover:text-white transition">Novel & Fiction</Link></li>
              <li><Link to="/category/story" className="hover:text-white transition">Story & Katha</Link></li>
              <li><Link to="/category/poetry" className="hover:text-white transition">Poetry & Nazm</Link></li>
              <li><Link to="/category/cultural-conscience" className="hover:text-white transition">Cultural Conscience</Link></li>
              <li><Link to="/category/vimarsh" className="hover:text-white transition">Discourse & Vimarsh</Link></li>
              <li><Link to="/category/satire" className="hover:text-white transition">Satire & Vyangya</Link></li>
            </ul>
          </div>

          {/* Col 3: Institutional Mandate */}
          <div className="md:col-span-4 space-y-2.5">
            <h4 className="text-xs font-mono uppercase tracking-[0.25em] text-white">
              OPEN ACCESS MANDATE
            </h4>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Preserving South Asian intellectual heritage with trilingual dignity across Devanagari, Nastaliq, and Romanized scripts. All materials hosted are public cultural common property.
            </p>
            <div className="pt-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              SUPABASE CLOUD • VECTORIZED PDF STREAMING • SCRIPT PARITY
            </div>
          </div>

        </div>

        {/* Bottom Credits Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
          <p>© {new Date().getFullYear()} CHETNA DIGITAL ARCHIVES • PUBLIC TRUST</p>
          <div className="flex items-center gap-4 text-zinc-400">
            <span className="hover:text-white transition cursor-pointer">PRIVACY</span>
            <span>•</span>
            <span className="hover:text-white transition cursor-pointer">TERMS</span>
            <span>•</span>
            <span className="hover:text-white transition cursor-pointer">COLOPHON</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
