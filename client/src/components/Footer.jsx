import React from 'react';
import { BookOpen, Globe, Plus, Settings } from 'lucide-react';

export default function Footer({ lang = 'hi', t, onOpenUpload, onOpenAdmin }) {
  return (
    <footer className="bg-[#121110] text-[#EFECE6] pt-14 pb-10 border-t border-[#2A2723]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Colophon Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-[#2A2723]">
          
          {/* Col 1: Brand & Colophon Mission Statement */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm bg-[#9B382A] flex items-center justify-center text-[#FFFFFF] font-serif font-bold text-base shadow-xs">
                <span>{lang === 'ur' ? 'چ' : 'चे'}</span>
              </div>
              <span className="font-editorial text-2xl font-normal tracking-tight text-[#FFFFFF]">
                {t.brand}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#DDD7CD] bg-[#2A2723] px-2.5 py-0.5 rounded-sm border border-[#DDD7CD]/20">
                {t.brandSubtitle}
              </span>
            </div>

            <p className="text-xs text-[#DDD7CD]/75 font-sans leading-relaxed max-w-sm">
              {t.footer.about}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onOpenUpload}
                className="px-3.5 py-2 bg-[#9B382A] hover:bg-[#852E22] text-[#FFFFFF] text-xs font-mono uppercase tracking-wider rounded-sm transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.nav.uploadBook}</span>
              </button>
              <button
                type="button"
                onClick={onOpenAdmin}
                className="px-3 py-2 bg-[#1A1816] hover:bg-[#25221F] text-[#DDD7CD] hover:text-[#FFFFFF] text-xs font-mono uppercase tracking-wider rounded-sm border border-[#2A2723] transition cursor-pointer flex items-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5 text-[#9B382A]" />
                <span>{t.nav.manageLibrary}</span>
              </button>
            </div>
          </div>

          {/* Col 2: Major Cultural Domains */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#9B382A] font-bold">
              {t.footer.majorGenres}
            </h4>
            <ul className="space-y-2 text-xs font-sans text-[#DDD7CD]/70">
              <li><span className="hover:text-[#FFFFFF] transition cursor-pointer">№ 01 — {t.nav.novel}</span></li>
              <li><span className="hover:text-[#FFFFFF] transition cursor-pointer">№ 02 — {t.nav.story}</span></li>
              <li><span className="hover:text-[#FFFFFF] transition cursor-pointer">№ 03 — {t.nav.poetry}</span></li>
              <li><span className="hover:text-[#FFFFFF] transition cursor-pointer">№ 04 — {t.nav.conscience}</span></li>
              <li><span className="hover:text-[#FFFFFF] transition cursor-pointer">№ 05 — {t.nav.satire}</span></li>
              <li><span className="hover:text-[#FFFFFF] transition cursor-pointer">№ 06 — {t.nav.drama}</span></li>
            </ul>
          </div>

          {/* Col 3: Affiliated Literary & Cultural Institutions */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#9B382A] font-bold">
              {t.footer.initiatives}
            </h4>
            <div className="space-y-2 text-xs font-sans text-[#DDD7CD]/70">
              <p>• {lang === 'hi' ? 'साहित्य अकादमी राष्ट्रीय डिजिटल अभिलेखागार' : (lang === 'ur' ? 'قومی ادبی و ثقافتی کونسل' : 'National Council for Promotion of Literature & Culture')}</p>
              <p>• {lang === 'hi' ? 'सार्वभौमिक मानवीय चेतना एवं नीतिशास्त्र संग्रह' : (lang === 'ur' ? 'ساہتیہ اکیڈمی اوپن ڈیجیٹل ریپوزٹری' : 'Sahitya Akademi Open Digital Repository')}</p>
              <p>• {lang === 'hi' ? 'एशियाटिक सोसाइटी एवं प्राचीन पांडुलिपि संरक्षण' : (lang === 'ur' ? 'ایشیاٹک سوسائٹی و قدیم مخطوطات تحفظ' : 'Asiatic Society & Classical Manuscript Preservation')}</p>
              <p>• {lang === 'hi' ? 'प्रेमचंद एवं टैगोर साहित्यिक विरासत ट्रस्ट' : (lang === 'ur' ? 'پریم چند و ٹیگور لٹریری ہیریٹیج ٹرسٹ' : 'Premchand & Tagore Literary Heritage Trusts')}</p>
            </div>
          </div>

        </div>

        {/* Bottom Rights & Permanent Access Statement */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#DDD7CD]/60 gap-3">
          <p>{t.footer.rights} // {new Date().getFullYear()}</p>
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-[#DDD7CD]/75">
            <span>{t.footer.openAccess}</span>
            <span>•</span>
            <span>{t.footer.culturalConscience}</span>
            <span>•</span>
            <span>{t.footer.freeDownloads}</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

