import React from 'react';
import { BookOpen, Globe, Sparkles } from 'lucide-react';

export default function Footer({ lang, t, onOpenUpload, onOpenAdmin }) {
  return (
    <footer className="bg-[#0f172a] text-stone-300 pt-12 pb-8 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-stone-800">
          
          {/* Col 1: Brand & Purpose */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-blue-800 flex items-center justify-center text-amber-200 font-bold text-base shadow-xs">
                <span>चे</span>
              </div>
              <span className="font-rekhta-serif text-3xl font-extrabold tracking-tight text-white">
                {t.brand}
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/20">
                {t.brandSubtitle}
              </span>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              {t.footer.about}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={onOpenUpload}
                className="px-3.5 py-1.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                + {t.nav.uploadBook}
              </button>
              <button
                onClick={onOpenAdmin}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium rounded-lg transition cursor-pointer"
              >
                ⚙️ {t.nav.manageLibrary}
              </button>
            </div>
          </div>

          {/* Col 2: Major Genres */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              {lang === 'hi' ? 'प्रमुख साहित्यिक विधाएँ' : (lang === 'ur' ? 'اہم اصنافِ ادب' : 'Major Genres')}
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-400">
              <li><span className="hover:text-white transition cursor-pointer">• {t.nav.novel}</span></li>
              <li><span className="hover:text-white transition cursor-pointer">• {t.nav.story}</span></li>
              <li><span className="hover:text-white transition cursor-pointer">• {t.nav.poetry}</span></li>
              <li><span className="hover:text-white transition cursor-pointer">• {t.nav.conscience}</span></li>
              <li><span className="hover:text-white transition cursor-pointer">• {t.nav.satire}</span></li>
              <li><span className="hover:text-white transition cursor-pointer">• {t.nav.drama}</span></li>
            </ul>
          </div>

          {/* Col 3: Affiliated Literary & Cultural Institutions */}
          <div className="md:col-span-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              {t.footer.initiatives}
            </h4>
            <div className="space-y-1.5 text-xs text-stone-400">
              <p>• National Council for Promotion of Literature & Culture</p>
              <p>• Sahitya Akademi Open Digital Repository</p>
              <p>• Universal Human Conscience & Ethics Archives</p>
              <p>• Asiatic Society & Classical Manuscript Preservation</p>
              <p>• Premchand & Tagore Literary Heritage Trusts</p>
            </div>
          </div>

        </div>

        {/* Bottom Rights */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-3">
          <p>{t.footer.rights}</p>
          <div className="flex items-center gap-4 text-stone-400">
            <span>Open Access Library</span>
            <span>•</span>
            <span>Cultural Conscience & Development</span>
            <span>•</span>
            <span>Free PDF Downloads</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
