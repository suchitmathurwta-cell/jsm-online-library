import React, { useState } from 'react';
import { Type, Sparkles, BookOpen, Share2, Copy, Check, Sliders, ChevronDown } from 'lucide-react';

// Classical editorial masterpieces with Nastaliq, Devanagari, and Roman transliterations
const EDITORIAL_CORPUS = {
  default: [
    {
      id: 1,
      ur: 'دلِ ناداں تجھے ہوا کیا ہے\nآخر اس درد کی دوا کیا ہے',
      hi: 'दिल-ए-नादाँ तुझे हुआ क्या है\nआख़िर इस दर्द की दवा क्या है',
      roman: 'Dil-e-naadaañ tujhe hua kya hai\nAakhir is dard ki dawa kya hai',
      meter: '— ∪ — — | — ∪ — — | — ∪ —'
    },
    {
      id: 2,
      ur: 'ہم ہیں مشتاق اور وہ بیزار\nیا الٰہی یہ ماجرا کیا ہے',
      hi: 'हम हैं मुश्ताक़ और वो बेज़ार\nया इलाही ये माजरा क्या है',
      roman: 'Hum hain mushtaaq aur woh bezaar\nYaa ilaahi yeh maajra kya hai',
      meter: '— ∪ — — | — ∪ — — | — ∪ —'
    },
    {
      id: 3,
      ur: 'میں بھی منہ میں زبان رکھتا ہوں\nکاش پوچھو کہ مدعا کیا ہے',
      hi: 'मैं भी मुँह में ज़बान रखता हूँ\nकाश पूछो कि मुद्दआ क्या है',
      roman: 'Main bhi munh mein zabaan rakhta hoon\nKaash poochho ke muddaa kya hai',
      meter: '— ∪ — — | — ∪ — — | — ∪ —'
    },
    {
      id: 4,
      ur: 'جب کہ تجھ بن نہیں کوئی موجود\nپھر یہ ہنگامہ اے خدا کیا ہے',
      hi: 'जब कि तुझ बिन नहीं कोई मौजूद\nफिर ये हंगामा ऐ ख़ुदा क्या है',
      roman: 'Jab ke tujh bin nahin koi maujood\nPhir yeh hungaama ai khuda kya hai',
      meter: '— ∪ — — | — ∪ — — | — ∪ —'
    },
    {
      id: 5,
      ur: 'جان تم پر نثار کرتا ہوں\nمیں نہیں جانتا دعا کیا ہے',
      hi: 'जान तुम पर निसार करता हूँ\nमैं नहीं जानता दुआ क्या है',
      roman: 'Jaan tum par nisaar karta hoon\nMain nahin jaanta dua kya hai',
      meter: '— ∪ — — | — ∪ — — | — ∪ —'
    }
  ],
  dastoor: [
    {
      id: 1,
      ur: 'دیپ جس کا محلات ہی میں جلے\nچند لوگوں کی خوشیوں کو لے کر چلے\nوہ جو سائے میں ہر مصلحت کے پلے\nایسے دستور کو، صبحِ بے نور کو\nمیں نہیں مانتا، میں نہیں جانتا',
      hi: 'दीप जिस का महलात ही में जले\nचंद लोगों की खुशियों को ले कर चले\nवह जो साए में हर मसलहत के पले\nऐसे दस्तूर को, सुब्ह-ए-बे-नूर को\nमैं नहीं मानता, मैं नहीं जानता',
      roman: 'Deep jis ka mahallaat hi mein jale\nChand logon ki khushiyon ko le kar chale\nWoh jo saaye mein har maslahat ke pale\nAise dastoor ko, subh-e-be-noor ko\nMain nahin maanta, main nahin jaanta',
      meter: '— ∪ — — | — ∪ — — | — ∪ —'
    },
    {
      id: 2,
      ur: 'میں بھی خائف نہیں تختۂ دار سے\nمیں بھی منصور ہوں کہہ دو اغیار سے\nکیوں ڈراتے ہو زنداں کی دیوار سے\nظلم کی بات کو، جہل کی رات کو\nمیں نہیں مانتا، میں نہیں جانتا',
      hi: 'मैं भी ख़ाइफ़ नहीं तख़्त-ए-दार से\nमैं भी मंसूर हूँ कह दो अग़्यार से\nक्यों डराते हो ज़िन्दाँ की दीवार से\nज़ुल्म की बात को, जहल की रात को\nमैं नहीं मानता, मैं नहीं जानता',
      roman: 'Main bhi khaaif nahin takhta-e-daar se\nMain bhi Mansoor hoon keh do aghyaar se\nKyon daraate ho zindaan ki deewar se\nZulm ki baat ko, jahal ki raat ko\nMain nahin maanta, main nahin jaanta',
      meter: '— ∪ — — | — ∪ — — | — ∪ —'
    }
  ]
};

export default function EditorialReadingCanvas({
  book,
  activeWord,
  onSelectWord,
  onOpenContextStudio
}) {
  const [activeScript, setActiveScript] = useState('dual'); // 'nastaliq' | 'devanagari' | 'dual' | 'roman'
  const [fontSize, setFontSize] = useState('text-xl'); // text-lg, text-xl, text-2xl
  const [copiedId, setCopiedId] = useState(null);

  // Check if book matches specific texts or fallback to standard editorial corpus
  const corpus = (book && (book.title_hi?.includes('दस्तूर') || book.title_en?.toLowerCase().includes('dastoor')))
    ? EDITORIAL_CORPUS.dastoor
    : EDITORIAL_CORPUS.default;

  const handleCopyStanza = (item) => {
    let textToCopy = item.hi;
    if (activeScript === 'nastaliq') textToCopy = item.ur;
    else if (activeScript === 'roman') textToCopy = item.roman;
    else if (activeScript === 'dual') textToCopy = `${item.ur}\n\n${item.hi}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Render clickable interactive words
  const renderInteractiveWords = (line, scriptType) => {
    const words = line.split(' ');
    const isNastaliq = scriptType === 'nastaliq';

    return words.map((word, wIdx) => {
      const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()'"?।،؟]/g, '').trim();
      const isSelected = activeWord && cleanWord && (activeWord === cleanWord || activeWord.includes(cleanWord) || cleanWord.includes(activeWord));

      return (
        <span
          key={wIdx}
          onClick={(e) => {
            e.stopPropagation();
            if (cleanWord) {
              onSelectWord(cleanWord);
              if (onOpenContextStudio) onOpenContextStudio();
            }
          }}
          className={`inline-block mx-1 px-1.5 py-0.5 rounded-lg transition-all duration-200 cursor-pointer ${
            isSelected
              ? 'bg-[#BA4E36]/15 border border-[#BA4E36] text-[#BA4E36] font-semibold scale-105 shadow-2xs'
              : 'hover:bg-[#E2DDD5]/60 hover:text-[#BA4E36] border border-transparent'
          }`}
          title="Click to view etymology, root & prosody in Context Studio"
        >
          {word}
        </span>
      );
    });
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'text-lg': return { hi: 'text-lg', ur: 'text-xl', roman: 'text-base' };
      case 'text-2xl': return { hi: 'text-2xl', ur: 'text-3xl', roman: 'text-xl' };
      case 'text-xl':
      default: return { hi: 'text-xl', ur: 'text-2xl', roman: 'text-lg' };
    }
  };

  const sizeClasses = getFontSizeClass();

  return (
    <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 md:py-12 bg-[#FAF9F6]">
      {/* Centered Constrained Container */}
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Document Editorial Header */}
        <header className="text-center pb-8 border-b border-[#E2DDD5] space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F2EFE9] border border-[#E2DDD5] text-xs font-semibold text-[#BA4E36]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Editorial Edition</span>
          </div>

          <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1E1B18] tracking-tight">
            {book ? (book.title_hi || book.title_en || 'दीवान-ए-ग़ालिब') : 'दीवान-ए-ग़ालिब'}
          </h1>

          <p className="text-sm font-editorial text-[#66615B] italic">
            By {book ? (book.author_hi || book.author_en || 'मिर्ज़ा असदुल्लाह ख़ाँ ‘ग़ालिब’') : 'मिर्ज़ा असदुल्लाह ख़ाँ ‘ग़ालिब’'}
          </p>

          {/* Script Segmented Pill Bar & Typographic Controls */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            {/* Segmented Script Pill: [Nastaliq | Devanagari | Dual Script | Roman] */}
            <div className="inline-flex p-1 bg-[#F2EFE9] border border-[#E2DDD5] rounded-2xl shadow-2xs text-xs font-medium">
              {[
                { id: 'nastaliq', label: 'نستعلیق', font: 'font-nastaliq-editorial' },
                { id: 'devanagari', label: 'देवनागरी', font: 'font-devanagari-serif' },
                { id: 'dual', label: 'Dual Script', font: 'font-editorial' },
                { id: 'roman', label: 'Roman', font: 'font-editorial' }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setActiveScript(pill.id)}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${pill.font} ${
                    activeScript === pill.id
                      ? 'bg-[#1E1B18] text-white font-bold shadow-xs'
                      : 'text-[#66615B] hover:text-[#1E1B18]'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Font Size Adjuster */}
            <div className="inline-flex items-center gap-1 bg-[#F2EFE9] border border-[#E2DDD5] rounded-xl px-2 py-1 text-xs">
              <button
                onClick={() => setFontSize('text-lg')}
                className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${fontSize === 'text-lg' ? 'bg-[#1E1B18] text-white' : 'text-[#66615B]'}`}
                title="Small text"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('text-xl')}
                className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${fontSize === 'text-xl' ? 'bg-[#1E1B18] text-white' : 'text-[#66615B]'}`}
                title="Medium text"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('text-2xl')}
                className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${fontSize === 'text-2xl' ? 'bg-[#1E1B18] text-white' : 'text-[#66615B]'}`}
                title="Large text"
              >
                A+
              </button>
            </div>
          </div>
        </header>

        {/* Reading Canvas: Main Poetry / Literary Blocks */}
        <section className="space-y-12 pb-24">
          {corpus.map((stanza, sIdx) => (
            <article
              key={stanza.id || sIdx}
              className="group p-6 sm:p-8 bg-[#FAF9F6] rounded-3xl border border-[#E2DDD5]/70 hover:border-[#BA4E36]/30 shadow-xs hover:shadow-md transition-all duration-300 relative"
            >
              {/* Stanza Index & Meter Anchor */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E2DDD5]/50 text-xs text-[#66615B]">
                <span className="font-mono font-semibold tracking-wider text-[11px] text-[#BA4E36]">
                  SHE'R #{sIdx + 1}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#66615B] hidden sm:inline" title="Metrical pattern">
                    {stanza.meter}
                  </span>
                  <button
                    onClick={() => handleCopyStanza(stanza)}
                    className="p-1.5 rounded-lg hover:bg-[#F2EFE9] text-[#66615B] hover:text-[#1E1B18] transition cursor-pointer"
                    title="Copy She'r"
                  >
                    {copiedId === stanza.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Verses Container */}
              <div className="py-6 space-y-6 text-center select-text">
                
                {/* 1. NASTALIQ SCRIPT (Unclipped line-height leading-[2.4]) */}
                {(activeScript === 'nastaliq' || activeScript === 'dual') && (
                  <div
                    dir="rtl"
                    className={`font-nastaliq-editorial ${sizeClasses.ur} leading-[2.4] text-[#1E1B18] tracking-wide`}
                  >
                    {stanza.ur.split('\n').map((line, lIdx) => (
                      <p key={lIdx} className="my-2">
                        {renderInteractiveWords(line, 'nastaliq')}
                      </p>
                    ))}
                  </div>
                )}

                {/* 2. DEVANAGARI SCRIPT (leading-relaxed) */}
                {(activeScript === 'devanagari' || activeScript === 'dual') && (
                  <div
                    dir="ltr"
                    className={`font-devanagari-serif ${sizeClasses.hi} leading-relaxed text-[#1E1B18] font-normal`}
                  >
                    {stanza.hi.split('\n').map((line, lIdx) => (
                      <p key={lIdx} className="my-1.5">
                        {renderInteractiveWords(line, 'devanagari')}
                      </p>
                    ))}
                  </div>
                )}

                {/* 3. ROMAN TRANSLITERATION */}
                {activeScript === 'roman' && (
                  <div
                    dir="ltr"
                    className={`font-editorial ${sizeClasses.roman} leading-relaxed text-[#1E1B18] italic`}
                  >
                    {stanza.roman.split('\n').map((line, lIdx) => (
                      <p key={lIdx} className="my-1.5">
                        {renderInteractiveWords(line, 'roman')}
                      </p>
                    ))}
                  </div>
                )}

              </div>

              {/* Interactive Helper Hint */}
              <div className="pt-2 text-center">
                <span className="text-[10px] text-[#66615B] opacity-0 group-hover:opacity-100 transition-opacity">
                  Click any word to inspect etymology, root, and meter
                </span>
              </div>
            </article>
          ))}
        </section>

      </div>
    </main>
  );
}
