import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Mic,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  BookOpen,
  ArrowRight,
  Loader2,
  FileText,
  Compass,
  Bookmark
} from 'lucide-react';

export default function HeroSection({
  t,
  lang = 'hi',
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  categories = [],
  selectedCategory,
  onSelectCategory,
  onOpenReader,
  onSelectBook
}) {
  const [expanded, setExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery || '');
  const [liveResults, setLiveResults] = useState([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const searchBoxRef = useRef(null);
  const liveSearchTimeoutRef = useRef(null);

  useEffect(() => {
    setLocalQuery(searchQuery || '');
  }, [searchQuery]);

  // Click outside listener to close live search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setLocalQuery(val);

    if (liveSearchTimeoutRef.current) {
      clearTimeout(liveSearchTimeoutRef.current);
    }

    if (!val || !val.trim()) {
      setLiveResults([]);
      setIsSearchingLive(false);
      setDropdownOpen(false);
      setSearchQuery?.('');
      return;
    }

    setDropdownOpen(true);
    setIsSearchingLive(true);

    liveSearchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(val.trim())}`);
        const data = await res.json();
        if (data.success) {
          setLiveResults(data.results || []);
        }
      } catch (err) {
        console.warn('Live search notice:', err);
      } finally {
        setIsSearchingLive(false);
      }
    }, 180);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (liveSearchTimeoutRef.current) clearTimeout(liveSearchTimeoutRef.current);
    setDropdownOpen(false);
    setSearchQuery?.(localQuery);
    if (onSearchSubmit) onSearchSubmit(localQuery);
  };

  const handleClear = () => {
    setLocalQuery('');
    setLiveResults([]);
    setDropdownOpen(false);
    setSearchQuery?.('');
    if (onSearchSubmit) onSearchSubmit('');
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert(
        lang === 'hi'
          ? 'आपके ब्राउज़र में वॉइस सर्च समर्थित नहीं है।'
          : lang === 'ur'
          ? 'آپ کے براؤزر میں وائس سرچ کی سہولت موجود نہیں۔'
          : 'Voice search is not supported in this browser.'
      );
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'ur' ? 'ur-PK' : 'en-US';
    recognition.interimResults = false;

    setIsListening(true);
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setLocalQuery(transcript);
      setSearchQuery?.(transcript);
      if (onSearchSubmit) onSearchSubmit(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const thinkerChips = [
    { num: '01', hi: 'मुंशी प्रेमचंद', en: 'Premchand', ur: 'پریم چند' },
    { num: '02', hi: 'रवींद्रनाथ टैगोर', en: 'Rabindranath Tagore', ur: 'ٹیگور' },
    { num: '03', hi: 'संत कबीर', en: 'Kabir', ur: 'کبیر' },
    { num: '04', hi: 'डॉ. बी.आर. आंबेडकर', en: 'Dr. B.R. Ambedkar', ur: 'ڈاکٹر امبیڈکر' },
    { num: '05', hi: 'मीर अनीस (मर्सिया)', en: 'Mir Anees', ur: 'میر انیس' },
    { num: '06', hi: 'मिर्ज़ा ग़ालिब', en: 'Mirza Ghalib', ur: 'مرزا غالب' },
    { num: '07', hi: 'फ़ैज़ अहमद फ़ैज़', en: 'Faiz Ahmad Faiz', ur: 'فیض احمد فیض' },
    { num: '08', hi: 'महादेवी वर्मा', en: 'Mahadevi Varma', ur: 'مہادیوی ورما' },
    { num: '09', hi: 'हरिशंकर परसाई', en: 'Harishankar Parsai', ur: 'ہری شنکر پرسائی' }
  ];

  return (
    <section className="relative bg-[#F7F5F0] text-[#121110] pt-12 pb-16 lg:py-20 border-b border-[#DDD7CD]">
      {/* Background Architectural Grid Accent */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(#121110 0.75px, transparent 0.75px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Asymmetric Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Opening Statement & Omnibox Search Console */}
          <div className="lg:col-span-7 flex flex-col">
            
            {/* Archival Ledger Pre-title */}
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest text-[#9B382A] uppercase font-bold bg-[#EFECE6] border border-[#DDD7CD] px-3 py-1 rounded-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9B382A] animate-pulse"></span>
                <span>OPEN ARCHIVAL REPOSITORY // {new Date().getFullYear()}</span>
              </span>
              <span className="text-[11px] font-mono text-[#524E48] hidden sm:inline">
                VOL. IV • PERMANENT ACCESS
              </span>
            </div>

            {/* Editorial Title */}
            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-[54px] font-normal leading-[1.08] tracking-tight text-[#121110] mb-5">
              <span>{t.hero.title}</span>
            </h1>

            {/* Expansible Editorial Statement */}
            <div className="relative text-sm sm:text-[15px] leading-relaxed text-[#524E48] font-sans mb-8 max-w-2xl border-l-2 border-[#9B382A]/30 pl-4">
              <p className={expanded ? '' : 'line-clamp-3'}>
                {t.hero.descriptionMain}
              </p>
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#9B382A] hover:text-[#852E22] mt-2 cursor-pointer transition-colors"
              >
                <span>{expanded ? `[ — ${t.hero.readLess} ]` : `[ + ${t.hero.readMore} ]`}</span>
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Archival Omnibox Search Console */}
            <div ref={searchBoxRef} className="relative z-30 mb-7 max-w-2xl">
              <form
                onSubmit={handleFormSubmit}
                className="relative flex items-center p-1.5 bg-[#FFFFFF] rounded-md border border-[#DDD7CD] shadow-sm hover:border-[#121110]/40 focus-within:border-[#9B382A] focus-within:ring-2 focus-within:ring-[#9B382A]/10 transition-all duration-200"
              >
                <div className="pl-3 pr-2 text-[#524E48] pointer-events-none flex items-center justify-center">
                  {isSearchingLive ? (
                    <Loader2 className="w-4 h-4 text-[#9B382A] animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 text-[#524E48]" />
                  )}
                </div>

                <input
                  type="text"
                  value={localQuery}
                  onChange={handleInputChange}
                  onFocus={() => {
                    if (localQuery.trim()) setDropdownOpen(true);
                  }}
                  placeholder={t.hero.searchPlaceholder}
                  autoComplete="off"
                  className="w-full py-2.5 sm:py-3 text-sm sm:text-[15px] text-[#121110] placeholder-[#524E48]/60 bg-transparent outline-none font-sans font-normal"
                />

                {localQuery && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1.5 mr-1 text-[#524E48] hover:text-[#121110] rounded hover:bg-[#EFECE6] transition cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  title="Voice Search"
                  className={`p-2.5 mr-1.5 text-[#524E48] hover:text-[#9B382A] rounded hover:bg-[#EFECE6] transition cursor-pointer ${
                    isListening ? 'animate-pulse text-red-600 bg-red-50' : ''
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Primary Search Trigger Button */}
                <button
                  type="submit"
                  className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#9B382A] hover:bg-[#852E22] text-[#FFFFFF] text-xs font-mono font-medium uppercase tracking-wider rounded-sm shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <span>{t.hero.searchBtn}</span>
                </button>
              </form>

              {/* Live Search Autocomplete Dropdown Overlay */}
              {dropdownOpen && localQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#FAF9F6] rounded-md shadow-xl border border-[#DDD7CD] overflow-hidden z-50 animate-fadeIn">
                  
                  <div className="px-4 py-2.5 bg-[#EFECE6] border-b border-[#DDD7CD] flex items-center justify-between text-xs font-mono text-[#524E48]">
                    <span className="flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5 text-[#9B382A]" />
                      <span>
                        {lang === 'hi'
                          ? `अभिलेखागार खोज: "${localQuery}"`
                          : lang === 'ur'
                          ? `تلاش کے نتائج: "${localQuery}"`
                          : `Archival Query: "${localQuery}"`}
                      </span>
                    </span>
                    <span className="text-[10px] uppercase font-bold text-[#121110] bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#DDD7CD]">
                      {liveResults.length} {t.sections.worksUnit}
                    </span>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-[#DDD7CD]/60">
                    {liveResults.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[#524E48] font-sans">
                        {isSearchingLive ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 text-[#9B382A] animate-spin" />
                            <span>{lang === 'hi' ? 'अभिलेखों में खोज हो रही है...' : 'Scanning manuscripts and treatises...'}</span>
                          </div>
                        ) : (
                          <span>{t.sections.noResults}</span>
                        )}
                      </div>
                    ) : (
                      liveResults.map((book) => {
                        const title = book['title_' + lang] || book.title_hi || book.title_en;
                        const author = book['author_' + lang] || book.author_hi || book.author_en;

                        return (
                          <div
                            key={book.id}
                            className="p-3.5 hover:bg-[#EFECE6] transition flex items-center justify-between gap-3 cursor-pointer group"
                            onClick={() => {
                              setDropdownOpen(false);
                              if (onSelectBook) onSelectBook(book);
                            }}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-10 h-13 bg-[#FFFFFF] rounded-sm overflow-hidden shadow-2xs shrink-0 flex items-center justify-center border border-[#DDD7CD]">
                                {book.cover_url ? (
                                  <img src={book.cover_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <FileText className="w-4 h-4 text-[#524E48]" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs sm:text-sm font-serif font-bold text-[#121110] group-hover:text-[#9B382A] truncate">
                                  {title}
                                </h4>
                                <p className="text-[11px] text-[#524E48] truncate mt-0.5 font-sans">
                                  {author} • <span className="font-mono text-[#121110]">{book.year || 'Archive'}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {onOpenReader && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDropdownOpen(false);
                                    onOpenReader(book);
                                  }}
                                  className="px-3 py-1 bg-[#121110] hover:bg-[#9B382A] text-[#FFFFFF] text-[11px] font-mono uppercase tracking-wider rounded-sm transition cursor-pointer flex items-center gap-1.5"
                                >
                                  <BookOpen className="w-3 h-3" />
                                  <span>{t.card.readOnline}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer to View Full Results in Catalog */}
                  <button
                    type="button"
                    onClick={handleFormSubmit}
                    className="w-full py-2.5 px-4 bg-[#EFECE6] hover:bg-[#E5E1D8] border-t border-[#DDD7CD] text-xs font-mono font-medium text-[#9B382A] flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <span>
                      {lang === 'hi'
                        ? `समग्र ग्रंथ-सूची में परिणाम देखें (${localQuery})`
                        : `View all matching manuscripts in catalog`}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                </div>
              )}
            </div>

            {/* Thinker Indices / Curatorial Ledger Strip */}
            <div className="flex flex-col gap-2.5 max-w-2xl">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#524E48] font-semibold flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-[#9B382A]" />
                <span>{t.hero.keyThinkers}:</span>
              </span>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {thinkerChips.map((s, idx) => {
                  const label = s[lang] || s.hi;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const q = s.en || s.hi;
                        setLocalQuery(q);
                        setSearchQuery?.(q);
                        if (onSearchSubmit) onSearchSubmit(q);
                      }}
                      className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-mono bg-[#FFFFFF] hover:bg-[#EFECE6] text-[#121110] hover:text-[#9B382A] border border-[#DDD7CD] hover:border-[#9B382A]/50 transition-all cursor-pointer"
                    >
                      <span className="text-[10px] text-[#524E48] group-hover:text-[#9B382A] font-light">
                        {s.num}
                      </span>
                      <span className="font-sans font-medium text-[12px]">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Curator's Landmark Folio / Canonical Plate */}
          <div className="lg:col-span-5 hidden lg:flex flex-col">
            <div className="relative bg-[#FFFFFF] rounded-md border border-[#DDD7CD] p-6 shadow-sm overflow-hidden">
              
              {/* Top Accent Ledger Line */}
              <div className="absolute top-0 inset-x-0 h-1 bg-[#9B382A]"></div>
              
              {/* Folio Header */}
              <div className="flex items-center justify-between border-b border-[#DDD7CD] pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#9B382A]" />
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#524E48] font-bold">
                    CANONICAL FOLIO // SELECTION
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#244238] bg-[#EAEFEA] px-2 py-0.5 rounded border border-[#244238]/20 font-bold uppercase">
                  OPEN ACCESSION
                </span>
              </div>

              {/* Monograph Highlight Body */}
              <div className="space-y-4">
                <div className="text-[11px] font-mono text-[#524E48] flex items-center justify-between">
                  <span>ACCESSION № 1936-HIN</span>
                  <span>PREMCHAND CANON</span>
                </div>

                <div className="border-l-2 border-[#9B382A] pl-3.5">
                  <h3 className="font-editorial text-2xl font-normal text-[#121110] leading-snug">
                    {lang === 'hi' ? 'गोदान (किसान जीवन का महाकाव्य)' : (lang === 'ur' ? 'گودان (پریم چند)' : 'Godan (The Peasant Epic)')}
                  </h3>
                  <p className="text-xs font-mono text-[#524E48] mt-1">
                    {lang === 'hi' ? 'मुंशी प्रेमचंद • १९३६' : (lang === 'ur' ? 'منشی پریم چند • ۱۹۳۶' : 'Munshi Premchand • 1936')}
                  </p>
                </div>

                <p className="text-xs text-[#524E48] font-sans leading-relaxed">
                  {lang === 'hi'
                    ? 'औपनिवेशिक भारत के कृषक वर्ग की आर्थिक, सामाजिक और मानवीय त्रासदी का कालजयी दस्तावेज। चेतना अभिलेखागार में संपूर्ण मूल प्रति पाठकों और शोधार्थियों के लिए खुली है।'
                    : (lang === 'ur'
                    ? 'ہندوستانی کسان اور دیہی سماج کے مسائل و المیہ کا شاہکار۔ چیتنا کتب خانے میں قارئین و محققین کے لیے مکمل طور پر دستیاب۔'
                    : 'The defining socio-economic chronicle of rural agrarian India under colonial rule. Preserved in Chetna’s open permanent repository for unrestricted reading and scholarly research.')}
                </p>

                {/* Ledger Metadata Details */}
                <div className="bg-[#FAF9F6] p-3 rounded border border-[#DDD7CD] grid grid-cols-2 gap-3 text-[11px] font-mono">
                  <div>
                    <span className="text-[#524E48] block text-[10px]">PRESERVATION</span>
                    <span className="font-bold text-[#121110]">Full Unabridged PDF</span>
                  </div>
                  <div>
                    <span className="text-[#524E48] block text-[10px]">SCRIPT DUALITY</span>
                    <span className="font-bold text-[#121110]">Devanagari / Nastaliq</span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <a
                    href="#catalog"
                    onClick={(e) => {
                      e.preventDefault();
                      const catalogEl = document.getElementById('catalog');
                      if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#121110] hover:bg-[#9B382A] text-[#FFFFFF] text-xs font-mono uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
                  >
                    <span>ENTER CATALOG LEDGER</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

