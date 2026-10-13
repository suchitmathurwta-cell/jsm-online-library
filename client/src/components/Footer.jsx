import React from 'react';
import { BookOpen, Globe, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer({ lang = 'hi', t, onOpenUpload, onOpenAdmin }) {
  return (
    <footer className="bg-white text-zinc-600 pt-16 pb-12 border-t border-black/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-black/[0.06]">
          
          {/* Col 1: Brand & Purpose */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#111111] flex items-center justify-center text-white font-sans font-bold text-sm shadow-xs">
                <span>{lang === 'ur' ? 'چ' : (lang === 'en' ? 'CH' : 'चे')}</span>
              </div>
              <span className="font-sans text-xl font-bold tracking-tight text-[#111111]">
                {t.brand || 'CHETNA'}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">
                {t.brandSubtitle || 'E-Library'}
              </span>
            </div>

            <p className="text-xs text-zinc-500 font-sans leading-relaxed max-w-sm">
              {t.footer?.about || 'Digital cultural conscience, philosophical discourse, and open-access literary preservation repository.'}
            </p>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={onOpenUpload}
                className="px-4 py-1.5 bg-[#111111] hover:bg-black text-white text-xs font-medium rounded-full shadow-xs transition cursor-pointer"
              >
                + {t.nav?.uploadBook || 'Upload E-Book'}
              </button>
              <button
                onClick={onOpenAdmin}
                className="px-4 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-[#111111] text-xs font-medium rounded-full transition cursor-pointer border border-zinc-200"
              >
                ⚙️ {t.nav?.manageLibrary || 'Manage'}
              </button>
            </div>
          </div>

          {/* Col 2: Major Genres */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#111111]">
              {t.footer?.majorGenres || 'Primary Domains'}
            </h4>
            <ul className="space-y-1.5 text-xs text-zinc-500 font-sans">
              <li><Link to="/category/novel" className="hover:text-black transition">Novel & Fiction</Link></li>
              <li><Link to="/category/story" className="hover:text-black transition">Story & Katha</Link></li>
              <li><Link to="/category/poetry" className="hover:text-black transition">Poetry & Nazm</Link></li>
              <li><Link to="/category/cultural-conscience" className="hover:text-black transition">Cultural Conscience</Link></li>
              <li><Link to="/category/vimarsh" className="hover:text-black transition">Discourse & Vimarsh</Link></li>
              <li><Link to="/category/satire" className="hover:text-black transition">Satire & Vyagya</Link></li>
            </ul>
          </div>

          {/* Col 3: Institutional Mandate */}
          <div className="md:col-span-4 space-y-2.5">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#111111]">
              Open Access Mandate
            </h4>
            <p className="text-xs text-zinc-500 font-sans leading-relaxed">
              Preserving South Asian intellectual heritage with uncompromised trilingual equality across Devanagari, Nastaliq, and Romanized scripts. All materials hosted are public cultural common property.
            </p>
            <div className="pt-2 text-[11px] font-mono text-zinc-400">
              Supabase Cloud • Vectorized PDF Streaming • Trilingual Parity
            </div>
          </div>

        </div>

        {/* Bottom Credits Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-zinc-400">
          <p>© {new Date().getFullYear()} Chetna Digital Archives. Non-commercial cultural public trust.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-black transition cursor-pointer">Privacy</span>
            <span>•</span>
            <span className="hover:text-black transition cursor-pointer">Terms</span>
            <span>•</span>
            <span className="hover:text-black transition cursor-pointer">Colophon</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
