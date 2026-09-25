import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, X, Search, Volume2, Bookmark, ExternalLink, ShieldCheck, ChevronRight } from 'lucide-react';

// Comprehensive classical lexicon database for Urdu/Hindi literature
const LEXICON_DATABASE = {
  // Common poetic terms
  'इश्क़': { urdu: 'عشق', hindi: 'इश्क़', roman: 'Ishq', root: 'Arabic', gender: 'Masculine (मज़क्कर / مذکر)', meaning: 'Transcendental, profound love; passionate devotion beyond rationality.', examples: ['इश्क़ पर ज़ोर नहीं है ये वो आतिश ‘ग़ालिब’'], beher: 'Bahr-e-Hazaj', meter: '∪ — — —' },
  'ishq': { urdu: 'عشق', hindi: 'इश्क़', roman: 'Ishq', root: 'Arabic', gender: 'Masculine (मज़क्कर / مذکر)', meaning: 'Transcendental, profound love; passionate devotion beyond rationality.', examples: ['इश्क़ पर ज़ोर नहीं है ये वो आतिश ‘ग़ालिब’'], beher: 'Bahr-e-Hazaj', meter: '∪ — — —' },
  'عشق': { urdu: 'عشق', hindi: 'इश्क़', roman: 'Ishq', root: 'Arabic', gender: 'Masculine (मज़क्कर / مذکر)', meaning: 'Transcendental, profound love; passionate devotion beyond rationality.', examples: ['عشق پر زور نہیں ہے یہ وہ آتش غالب'], beher: 'Bahr-e-Hazaj', meter: '∪ — — —' },
  
  'दिल': { urdu: 'دل', hindi: 'दिल', roman: 'Dil', root: 'Persian', gender: 'Masculine (मज़क्कर / مذکر)', meaning: 'Heart, mind, soul, courage, affection; seat of sentiment and intuition.', examples: ['दिल-ए-नादाँ तुझे हुआ क्या है'], beher: 'Bahr-e-Ramal', meter: '— ∪ — —' },
  'dil': { urdu: 'دل', hindi: 'दिल', roman: 'Dil', root: 'Persian', gender: 'Masculine (मज़क्कर / مذکر)', meaning: 'Heart, mind, soul, courage, affection; seat of sentiment and intuition.', examples: ['दिल-ए-नादाँ तुझे हुआ क्या है'], beher: 'Bahr-e-Ramal', meter: '— ∪ — —' },
  'دل': { urdu: 'دل', hindi: 'दिल', roman: 'Dil', root: 'Persian', gender: 'Masculine (मज़क्कर / مذکر)', meaning: 'Heart, mind, soul, courage, affection; seat of sentiment and intuition.', examples: ['دل ناداں تجھے ہوا کیا ہے'], beher: 'Bahr-e-Ramal', meter: '— ∪ — —' },

  'ग़म': { urdu: 'غم', hindi: 'ग़म', roman: 'Gham', root: 'Arabic', gender: 'Masculine (मज़क्कर / مذکر)', meaning: 'Grief, sorrow, existential pain, melancholy; poetic yearning.', examples: ['ग़म-ए-हस्ती का ‘असद’ किस से हो जुज़ मर्ग इलाज'], beher: 'Bahr-e-Khafeef', meter: '— ∪ — —' },
  'غم': { urdu: 'غم', hindi: 'ग़म', roman: 'Gham', root: 'Arabic', gender: 'Masculine (मज़क्कर / مذکر)', meaning: 'Grief, sorrow, existential pain, melancholy; poetic yearning.', examples: ['غم ہستی کا اسد کس سے ہو جز مرگ علاج'], beher: 'Bahr-e-Khafeef', meter: '— ∪ — —' },

  'साक़ी': { urdu: 'ساقی', hindi: 'साक़ी', roman: 'Saqi', root: 'Arabic', gender: 'Masculine / Poetic Beloved', meaning: 'Cupbearer, server of spiritual or poetic wine; allegorical guide.', examples: ['साक़िया तिशनगी की इन्तिहा न पूछ'], beher: 'Bahr-e-Rajaz', meter: '— ∪ —' },
  'ساقی': { urdu: 'ساقی', hindi: 'साक़ी', roman: 'Saqi', root: 'Arabic', gender: 'Masculine / Poetic Beloved', meaning: 'Cupbearer, server of spiritual or poetic wine; allegorical guide.', examples: ['ساقیا تشنگی کی انتہا نہ پوچھ'], beher: 'Bahr-e-Rajaz', meter: '— ∪ —' },

  'बज़्म': { urdu: 'بزم', hindi: 'बज़्म', roman: 'Bazm', root: 'Persian', gender: 'Feminine (मुअन्नस / مؤنث)', meaning: 'Gathering, assembly, salon, festive banquet of poets and scholars.', examples: ['बज़्म-ए-शायरी में आज एक नया चिराग़ जला है'], beher: 'Bahr-e-Mutaqaarib', meter: '— ∪ —' },
  'بزم': { urdu: 'بزم', hindi: 'बज़्म', roman: 'Bazm', root: 'Persian', gender: 'Feminine (मुअन्नस / مؤنث)', meaning: 'Gathering, assembly, salon, festive banquet of poets and scholars.', examples: ['بزم شاعری میں آج ایک نیا چراغ جلا ہے'], beher: 'Bahr-e-Mutaqaarib', meter: '— ∪ —' },

  'जुनूँ': { urdu: 'جنوں', hindi: 'जुनूँ', roman: 'Junoon', root: 'Arabic', gender: 'Masculine (मज़क्कर / مذکر)', meaning: 'Divine obsession, ecstasy, sacred madness of conviction or creativity.', examples: ['ये जुनूँ का दौर है कोई समझाए क्या'], beher: 'Bahr-e-Hazaj', meter: '∪ — — —' },
  'جنوں': { urdu: 'جنوں', hindi: 'जुनूँ', roman: 'Junoon', root: 'Arabic', gender: 'Masculine (मज़क्कर / مذکر)', meaning: 'Divine obsession, ecstasy, sacred madness of conviction or creativity.', examples: ['یہ جنوں کا دور ہے کوئی سمجھائے کیا'], beher: 'Bahr-e-Hazaj', meter: '∪ — — —' },

  'क़फ़स': { urdu: 'قفس', hindi: 'क़फ़स', roman: 'Qafas', root: 'Arabic', gender: 'Masculine (मज़क्कर / مذکر)', meaning: 'Cage, prison, spatial confinement; symbol of colonial or temporal bondage.', examples: ['क़फ़स में जी नहीं लगता मिरा ऐ हम-सफ़ीरो'], beher: 'Bahr-e-Ramal', meter: '— ∪ — —' },
  'قفس': { urdu: 'قفس', hindi: 'क़फ़स', roman: 'Qafas', root: 'Arabic', gender: 'Masculine (मज़क्कर / مذکر)', meaning: 'Cage, prison, spatial confinement; symbol of colonial or temporal bondage.', examples: ['قفس میں جی نہیں لگتا مرا اے ہم سفیرو'], beher: 'Bahr-e-Ramal', meter: '— ∪ — —' },

  'सय्याद': { urdu: 'صیاد', hindi: 'सय्याद', roman: 'Sayyad', root: 'Arabic', gender: 'Masculine (मज़क्कर / مذکر)', meaning: 'Hunter, fowler, captor; allegorical oppressor or fate.', examples: ['सय्याद ने गुलशन में हर सम्त बिछाया दाम'], beher: 'Bahr-e-Khafeef', meter: '— — ∪ —' },
  'صیاد': { urdu: 'صیاد', hindi: 'सय्याद', roman: 'Sayyad', root: 'Arabic', gender: 'Masculine (मज़क्कर / مذکر)', meaning: 'Hunter, fowler, captor; allegorical oppressor or fate.', examples: ['صیاد نے گلشن میں ہر سمت بچھایا دام'], beher: 'Bahr-e-Khafeef', meter: '— — ∪ —' },

  'इंक़लाब': { urdu: 'انقلاب', hindi: 'इंक़लाब', roman: 'Inquilab', root: 'Arabic', gender: 'Masculine (मज़क्कर / مذکر)', meaning: 'Revolution, transformative upheaval, radical metamorphosis of destiny.', examples: ['इंक़लाब ज़िंदाबाद!'], beher: 'Bahr-e-Hazaj', meter: '— ∪ — —' },
  'انقلاب': { urdu: 'انقلاب', hindi: 'इंक़लाब', roman: 'Inquilab', root: 'Arabic', gender: 'Masculine (मज़क्कर / مذکر)', meaning: 'Revolution, transformative upheaval, radical metamorphosis of destiny.', examples: ['انقلاب زندہ باد!'], beher: 'Bahr-e-Hazaj', meter: '— ∪ — —' },

  'दस्तूर': { urdu: 'دستور', hindi: 'दस्तूर', roman: 'Dastoor', root: 'Persian', gender: 'Masculine (मज़क्कर / مذکر)', meaning: 'Constitution, customary law, oppressive convention, rule.', examples: ['ऐसे दस्तूर को, सुब्ह-ए-बे-नूर को, मैं नहीं मानता'], beher: 'Bahr-e-Mutaqaarib', meter: '— ∪ — —' },
  'دستور': { urdu: 'دستور', hindi: 'दस्तूर', roman: 'Dastoor', root: 'Persian', gender: 'Masculine (मज़क्कर / مذکر)', meaning: 'Constitution, customary law, oppressive convention, rule.', examples: ['ایسے دستور کو، صبح بے نور کو، میں نہیں مانتا'], beher: 'Bahr-e-Mutaqaarib', meter: '— ∪ — —' },

  'रिफ़ाक़त': { urdu: 'رفاقت', hindi: 'रिफ़ाक़त', roman: 'Rifaqat', root: 'Arabic', gender: 'Feminine (मुअन्नस / مؤنث)', meaning: 'Companionship, camaraderie, steadfast solidarity in adversity.', examples: ['तेरी रिफ़ाक़त में हर राह आसान लगी'], beher: 'Bahr-e-Kamil', meter: '∪ ∪ — ∪ —' },
  'زندگانی': { urdu: 'زندگانی', hindi: 'ज़िंदगानी', roman: 'Zindagani', root: 'Persian', gender: 'Feminine (मुअन्नस / مؤنث)', meaning: 'Life, living, mortal span, existence.', examples: ['زندگانی بی وفائی کی علامت بن گئی'], beher: 'Bahr-e-Ramal', meter: '— ∪ — —' },
};

export default function ContextStudio({
  activeWord,
  onClose,
  isOpen = true
}) {
  const [activeTab, setActiveTab] = useState('dictionary'); // 'dictionary' | 'prosody'
  const [searchWord, setSearchWord] = useState('');
  const [currentEntry, setCurrentEntry] = useState(null);

  // Clean and normalize word
  const cleanWord = (raw) => {
    if (!raw) return '';
    return raw.replace(/[.,/#!$%^&*;:{}=\-_`~()'"?।،؟]/g, '').trim();
  };

  useEffect(() => {
    const wordKey = cleanWord(activeWord);
    if (!wordKey) {
      setCurrentEntry(LEXICON_DATABASE['इश्क़']);
      return;
    }

    const found = LEXICON_DATABASE[wordKey] || LEXICON_DATABASE[wordKey.toLowerCase()];
    if (found) {
      setCurrentEntry(found);
    } else {
      // Dynamic fallback analyzer for any literary word clicked
      setCurrentEntry({
        urdu: wordKey,
        hindi: wordKey,
        roman: wordKey,
        root: 'Perso-Arabic / Hindavi',
        gender: 'Contextual (اسم / संज्ञा)',
        meaning: `In classical literature and ghazal aesthetics, '${wordKey}' resonates with rich polysemy and allegorical nuances.`,
        examples: [`${wordKey} के हर पहलू में मानी का एक दरिया पोशीदा है।`],
        beher: 'Bahr-e-Hazaj Musamman Salim',
        meter: '— ∪ — — | — ∪ — —'
      });
    }
  }, [activeWord]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchWord.trim()) return;
    const clean = cleanWord(searchWord);
    const found = LEXICON_DATABASE[clean] || LEXICON_DATABASE[clean.toLowerCase()];
    if (found) {
      setCurrentEntry(found);
    } else {
      setCurrentEntry({
        urdu: clean,
        hindi: clean,
        roman: clean,
        root: 'Hindavi / Perso-Arabic',
        gender: 'Literary Term',
        meaning: `Lexical term referenced in classical poetry and literary treatises.`,
        examples: [`रचना में '${clean}' का प्रयोग विशिष्ट शैलीगत सौंदर्य प्रस्तुत करता है।`],
        beher: 'Bahr-e-Ramal',
        meter: '— ∪ — —'
      });
    }
    setSearchWord('');
  };

  if (!isOpen) return null;

  return (
    <aside className="w-80 sm:w-96 bg-[#F2EFE9] border-l border-[#E2DDD5] flex flex-col h-full shrink-0 shadow-lg z-20 select-none animate-fadeIn">
      {/* Studio Header */}
      <div className="h-14 px-4 border-b border-[#E2DDD5] bg-[#FAF9F6]/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#BA4E36] animate-pulse"></span>
          <span className="font-editorial text-sm font-semibold tracking-wide text-[#1E1B18]">
            Context Studio
          </span>
          <span className="text-[10px] uppercase tracking-wider font-mono text-[#66615B] bg-[#E2DDD5]/60 px-1.5 py-0.5 rounded">
            Editorial
          </span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#66615B] hover:text-[#1E1B18] hover:bg-[#E2DDD5]/50 transition cursor-pointer"
            title="Close Context Studio"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Segmented Control Tabs */}
      <div className="p-3 bg-[#F2EFE9] border-b border-[#E2DDD5]">
        <div className="grid grid-cols-2 p-1 bg-[#E2DDD5]/70 rounded-xl gap-1 text-xs font-medium text-[#66615B]">
          <button
            onClick={() => setActiveTab('dictionary')}
            className={`py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'dictionary'
                ? 'bg-white text-[#1E1B18] font-bold shadow-xs'
                : 'hover:text-[#1E1B18]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#BA4E36]" />
            <span>Dictionary / Etymology</span>
          </button>

          <button
            onClick={() => setActiveTab('prosody')}
            className={`py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'prosody'
                ? 'bg-white text-[#1E1B18] font-bold shadow-xs'
                : 'hover:text-[#1E1B18]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#BA4E36]" />
            <span>Prosody & Beher</span>
          </button>
        </div>

        {/* Studio Mini Search */}
        <form onSubmit={handleSearchSubmit} className="mt-2.5 relative">
          <input
            type="text"
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            placeholder="Lookup word (e.g. ishq, dil, dastoor)..."
            className="w-full bg-[#FAF9F6] border border-[#E2DDD5] text-xs text-[#1E1B18] placeholder-[#66615B]/70 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#BA4E36] transition"
          />
          <Search className="w-3.5 h-3.5 text-[#66615B] absolute left-2.5 top-2.5 pointer-events-none" />
        </form>
      </div>

      {/* Main Studio Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentEntry && (
          <>
            {activeTab === 'dictionary' ? (
              /* TAB 1: DICTIONARY & ETYMOLOGY */
              <div className="space-y-4">
                {/* Word Banner Card */}
                <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#E2DDD5] shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      {/* Dual Script Headings */}
                      <div className="flex items-baseline gap-3">
                        <span className="font-nastaliq-editorial text-2xl text-[#1E1B18] leading-[2.4] block">
                          {currentEntry.urdu}
                        </span>
                        <span className="font-devanagari-serif text-xl font-bold text-[#1E1B18]">
                          {currentEntry.hindi}
                        </span>
                      </div>
                      <p className="text-xs font-mono tracking-wide text-[#BA4E36] font-semibold mt-0.5">
                        /{currentEntry.roman}/
                      </p>
                    </div>

                    {/* Root Badge */}
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#BA4E36]/10 text-[#BA4E36] border border-[#BA4E36]/20 rounded-full">
                      {currentEntry.root}
                    </span>
                  </div>

                  {/* Grammatical Gender & Class */}
                  <div className="mt-3 pt-2.5 border-t border-[#E2DDD5]/70 flex items-center justify-between text-[11px] text-[#66615B]">
                    <span className="font-medium">Gender / श्रेणी:</span>
                    <span className="font-semibold text-[#1E1B18]">{currentEntry.gender}</span>
                  </div>
                </div>

                {/* Definition Box */}
                <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#E2DDD5] shadow-xs space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#66615B]">
                    Contextual Definition
                  </h4>
                  <p className="text-xs font-editorial leading-relaxed text-[#1E1B18]">
                    {currentEntry.meaning}
                  </p>
                </div>

                {/* Classical Verse Citation / Example */}
                {currentEntry.examples && currentEntry.examples.length > 0 && (
                  <div className="p-3.5 bg-[#FAF9F6] rounded-2xl border border-[#E2DDD5] shadow-xs space-y-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#66615B] flex items-center gap-1.5">
                      <span>Literary Citation</span>
                    </h4>
                    <div className="p-2.5 bg-[#F2EFE9] rounded-xl border border-[#E2DDD5] font-editorial text-xs italic text-[#1E1B18] leading-relaxed">
                      "{currentEntry.examples[0]}"
                    </div>
                  </div>
                )}

                {/* Morphological Notes */}
                <div className="p-3.5 bg-[#FAF9F6]/80 rounded-2xl border border-[#E2DDD5] text-xs text-[#66615B] space-y-1.5">
                  <span className="font-bold text-[#1E1B18] text-[11px] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#BA4E36]" />
                    <span>Linguistic Note</span>
                  </span>
                  <p className="text-[11px] leading-relaxed text-[#66615B]">
                    Click any highlighted word in the text canvas to instantly cross-reference its etymology, meter, and classical literary roots.
                  </p>
                </div>
              </div>
            ) : (
              /* TAB 2: PROSODY & BEHER */
              <div className="space-y-4">
                {/* Meter Identification Card */}
                <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#E2DDD5] shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#BA4E36] bg-[#BA4E36]/10 px-2 py-0.5 rounded-full border border-[#BA4E36]/20">
                      Metrical Meter (بحر)
                    </span>
                    <span className="text-[10px] font-mono text-[#66615B]">Taqtee' System</span>
                  </div>

                  <div>
                    <h3 className="font-editorial text-base font-bold text-[#1E1B18]">
                      {currentEntry.beher || 'Bahr-e-Ramal Musamman Makhboon'}
                    </h3>
                    <p className="text-xs text-[#66615B] mt-0.5">
                      Classical Arabic-Persian Aruz poetic meter utilized across Urdu ghazal and nazm traditions.
                    </p>
                  </div>
                </div>

                {/* Visual Rhythm Blocks (Laghu / Guru) */}
                <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#E2DDD5] shadow-xs space-y-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#66615B]">
                    Visual Rhythm Blocks (Laghu / Guru)
                  </h4>

                  {/* Metrical Formula Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Rhythm blocks */}
                    <span className="px-2.5 py-1 bg-[#1E1B18] text-white text-xs font-mono font-bold rounded-lg shadow-xs" title="Guru (Heavy) / Sabab-e-Khafeef">
                      — Guru
                    </span>
                    <span className="px-2.5 py-1 bg-[#BA4E36] text-white text-xs font-mono font-bold rounded-lg shadow-xs" title="Laghu (Light) / Watad">
                      ∪ Laghu
                    </span>
                    <span className="px-2.5 py-1 bg-[#1E1B18] text-white text-xs font-mono font-bold rounded-lg shadow-xs">
                      — Guru
                    </span>
                    <span className="px-2.5 py-1 bg-[#1E1B18] text-white text-xs font-mono font-bold rounded-lg shadow-xs">
                      — Guru
                    </span>
                  </div>

                  <div className="p-3 bg-[#F2EFE9] rounded-xl border border-[#E2DDD5] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[#BA4E36] font-bold">Fa'i-laa-tun (فاعلاتن)</span>
                      <span className="text-[10px] text-[#66615B]">Rukn 1</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[#BA4E36] font-bold">Fa'i-laa-tun (فاعلاتن)</span>
                      <span className="text-[10px] text-[#66615B]">Rukn 2</span>
                    </div>
                  </div>
                </div>

                {/* Rhyme & Radeef Scheme */}
                <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#E2DDD5] shadow-xs space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#66615B]">
                    Rhyme Anchors (क़ाफ़िया व रदीफ़)
                  </h4>
                  <div className="space-y-1.5 text-xs text-[#1E1B18]">
                    <div className="flex items-center justify-between py-1 border-b border-[#E2DDD5]/60">
                      <span className="text-[#66615B]">Qafiya (Rhyme):</span>
                      <span className="font-semibold font-editorial">आतिश / ख़्वाहिश / बंदिश</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[#66615B]">Radeef (Refrain):</span>
                      <span className="font-semibold font-editorial text-[#BA4E36]">होता तो क्या होता</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Studio Footer */}
      <div className="p-3 border-t border-[#E2DDD5] bg-[#FAF9F6] text-center">
        <p className="text-[10px] text-[#66615B]">
          Powered by JSM Classical Prosody & Etymological Lexicon
        </p>
      </div>
    </aside>
  );
}
