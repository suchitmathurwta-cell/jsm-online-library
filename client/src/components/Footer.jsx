import React from 'react';
import { BookOpen, Plus, Settings } from 'lucide-react';
import { AdminOnly } from './AdminGuard';

export default function Footer({ lang = 'hi', t, onOpenUpload, onOpenAdmin }) {
  return (
    <footer className="bg-[#161514] text-[#D5CFC4] pt-12 pb-8 border-t border-[#4A463F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-[#4A463F]">
          
          {/* Col 1: Brand & Institutional Mandate */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xs bg-[#F4F1EA] flex items-center justify-center text-[#161514] font-bold text-sm">
                <span className="font-editorial">{lang === 'ur' ? 'چ' : (lang === 'en' ? 'CH' : 'चे')}</span>
              </div>
              <span className="font-editorial text-2xl font-bold tracking-tight text-[#F4F1EA]">
                {lang === 'ur' ? 'چیتنا' : (lang === 'en' ? 'CHETNA' : 'चेतना')}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#D5CFC4] bg-[#4A463F]/50 px-2 py-0.5 rounded-xs border border-[#4A463F]">
                {lang === 'ur' ? 'کتب خانہ' : (lang === 'en' ? 'OPEN REGISTER' : 'मुक्त अभिलेखागार')}
              </span>
            </div>

            <p className="text-xs text-[#D5CFC4] leading-relaxed max-w-sm font-serif">
              {t.footer?.about || 'चेतना दक्षिण एशियाई साहित्यिक, सामाजिक व दार्शनिक विरासत का एक स्वतंत्र, मुक्त एवं गैर-व्यावसायिक डिजिटल अभिलेखागार है। इसका उद्देश्य वैचारिक चेतना और मानवीय विमर्श का संरक्षण है।'}
            </p>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={onOpenUpload}
                className="px-3 py-1.5 bg-[#A83324] hover:bg-[#8C2A1E] text-white text-xs font-mono rounded-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.nav?.uploadBook || 'ग्रंथ जोड़ें'}</span>
              </button>
              <AdminOnly>
                <button
                  onClick={onOpenAdmin}
                  className="px-3 py-1.5 bg-[#4A463F]/40 hover:bg-[#4A463F] text-[#EAE6DC] text-xs font-mono rounded-xs transition cursor-pointer flex items-center gap-1.5 border border-[#4A463F]"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>{t.nav?.manageLibrary || 'प्रबंधन'}</span>
                </button>
              </AdminOnly>
            </div>
          </div>

          {/* Col 2: Major Domains / Classification */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#F4F1EA]">
              {t.footer?.majorGenres || 'साहित्यिक प्रभाग'}
            </h4>
            <ul className="space-y-1 text-xs font-editorial text-[#D5CFC4]">
              <li>• {t.nav?.novel || 'उपन्यास'} (Novel)</li>
              <li>• {t.nav?.story || 'कहानी'} (Story)</li>
              <li>• {t.nav?.poetry || 'कविता व शायरी'} (Poetry)</li>
              <li>• {t.nav?.vimarsh || 'विमर्श व चिंतन'} (Discourse)</li>
              <li>• {t.nav?.conscience || 'सांस्कृतिक चेतना'} (Conscience)</li>
              <li>• {t.nav?.drama || 'नाटक व रंगमंच'} (Drama)</li>
            </ul>
          </div>

          {/* Col 3: Institutional Principles & Provenance */}
          <div className="md:col-span-4 space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#F4F1EA]">
              {lang === 'hi' ? 'संस्थागत सिद्धांत एवं अधिदेश' : (lang === 'ur' ? 'ادارہ جاتی اصول' : 'Institutional Mandate')}
            </h4>
            <div className="space-y-1.5 text-xs text-[#D5CFC4] font-serif leading-relaxed">
              <p>• {lang === 'hi' ? 'सार्वभौमिक मुक्त अभिगम (Universal Open Access) — ज्ञान व साहित्य पर किसी वर्ग का एकाधिकार नहीं।' : 'Universal Open Access — Unrestricted public access to humanistic literature.'}</p>
              <p>• {lang === 'hi' ? 'त्रिभाषी लिपि गरिमा (Trilingual Script Dignity) — देवनागरी, नस्तालीक़ व लैटिन का समान आदर।' : 'Trilingual Script Dignity — Equal parity for Devanagari, Nastaliq & Latin.'}</p>
              <p>• {lang === 'hi' ? 'अकादमिक संदर्भ व उद्धरण (Academic Preservation) — शोधकर्ताओं हेतु मानक उद्धरण प्रारूप।' : 'Scholarly Archiving — Verifiable citation apparatus for research.'}</p>
              <p>• {lang === 'hi' ? 'गैर-व्यावसायिक डिजिटल संरक्षण (Non-commercial Public Domain) — सांस्कृतिक धरोहर की रक्षा।' : 'Non-commercial Preservation — Cultural heritage safeguard.'}</p>
            </div>
          </div>

        </div>

        {/* Bottom Rights & Provenance */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#7A746B] gap-3">
          <p>{t.footer?.rights || 'चेतना ई-पुस्तकालय — गैर-व्यावसायिक सार्वजनिक उपक्रम'}</p>
          <div className="flex items-center gap-3 text-[#D5CFC4]">
            <span>{t.footer?.openAccess || 'सार्वजनिक अभिगम'}</span>
            <span>•</span>
            <span>{t.footer?.culturalConscience || 'सांस्कृतिक चेतना'}</span>
            <span>•</span>
            <span>{t.footer?.freeDownloads || 'निःशुल्क डाउनलोड'}</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

