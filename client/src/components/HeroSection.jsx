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
  FileText
} from 'lucide-react';

export default function HeroSection({
  t,
  lang,
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
      alert(lang === 'hi' ? 'आपके ब्राउज़र में वॉइस सर्च समर्थित नहीं है।' : (lang === 'ur' ? 'آپ کے براؤزر میں وائس سرچ کی سہولت موجود نہیں۔' : 'Voice search is not supported in this browser.'));
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : (lang === 'ur' ? 'ur-PK' : 'en-US');
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
    { hi: 'मुंशी प्रेमचंद', en: 'Premchand', ur: 'پریم چند' },
    { hi: 'रवींद्रनाथ टैगोर', en: 'Rabindranath Tagore', ur: 'ٹیگور' },
    { hi: 'मीर अनीस (मर्सिया)', en: 'Mir Anees (Marsiya)', ur: 'میر انیس (مرثیہ)' },
    { hi: 'संत कबीर', en: 'Kabir', ur: 'کبیر' },
    { hi: 'महात्मा गांधी', en: 'Mahatma Gandhi', ur: 'مہاتما گاندھی' },
    { hi: 'डॉ. बी.आर. आंबेडकर', en: 'Dr. B.R. Ambedkar', ur: 'ڈاکٹر امبیڈکر' },
    { hi: 'जयशंकर प्रसाद', en: 'Jaishankar Prasad', ur: 'جئے شنکر پرساد' },
    { hi: 'महादेवी वर्मा', en: 'Mahadevi Varma', ur: 'مہادیوی ورما' },
    { hi: 'हरिशंकर परसाई', en: 'Harishankar Parsai', ur: 'ہری شنکر پرسائی' },
    { hi: 'मिर्ज़ा ग़ालिब', en: 'Mirza Ghalib', ur: 'مرزا غالب' },
    { hi: 'फ़ैज़ अहमद फ़ैज़', en: 'Faiz Ahmad Faiz', ur: 'فیض احمد فیض' }
  ];

  return (
    <section className="bg-gradient-to-b from-[#faf8f5] via-white to-[#fbf9f6] pt-12 pb-16 border-b border-stone-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Title & Badge with Generous Breathing Room */}
        <div className="mb-4">
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#0f172a] font-rekhta-serif tracking-tight leading-tight flex flex-wrap items-center gap-3">
            <span>{t.hero.title}</span>
            <span className="text-xs font-sans font-semibold text-[#1d4ed8] bg-blue-50/90 px-3.5 py-1 rounded-full border border-blue-200/70 shadow-2xs">
              {t.hero.openAccessBadge}
            </span>
          </h1>
        </div>

        {/* Mission Statement Accordion with Refined Typography */}
        <div className="text-stone-600 text-sm sm:text-[15px] leading-relaxed mb-9 relative max-w-4xl">
          <p className={`${expanded ? '' : 'line-clamp-2'} transition-all`}>
            {t.hero.descriptionMain}
          </p>
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#1d4ed8] hover:text-[#1e40af] mt-2 cursor-pointer transition-colors"
          >
            <span>{expanded ? t.hero.readLess : t.hero.readMore}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Floating Modern Search Container */}
        <div ref={searchBoxRef} className="relative max-w-4xl mx-auto z-30">
          <form
            onSubmit={handleFormSubmit}
            className="relative flex items-center p-1.5 sm:p-2 bg-white rounded-2xl border border-stone-200/90 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_-4px_rgba(0,0,0,0.1)] focus-within:shadow-[0_12px_40px_-4px_rgba(29,78,216,0.12)] focus-within:border-[#1d4ed8]/70 transition-all duration-300"
          >
            <div className="pl-3.5 pr-2 text-stone-400 pointer-events-none flex items-center justify-center">
              {isSearchingLive ? (
                <Loader2 className="w-5 h-5 text-[#1d4ed8] animate-spin" />
              ) : (
                <Search className="w-5 h-5 text-stone-400" />
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
              className="w-full py-2.5 sm:py-3 text-sm sm:text-base text-stone-900 placeholder-stone-400 bg-transparent outline-hidden font-medium cursor-text"
            />

            {localQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 mr-1 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleVoiceSearch}
              title="Voice Search"
              className={`p-2.5 mr-1.5 text-stone-500 hover:text-[#1d4ed8] rounded-xl hover:bg-stone-100 transition cursor-pointer ${
                isListening ? 'animate-pulse text-red-600 bg-red-50' : ''
              }`}
            >
              <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Integrated Modern Pill Search Button */}
            <button
              type="submit"
              className="hidden sm:flex items-center gap-1.5 px-6 py-3 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs hover:shadow transition cursor-pointer shrink-0"
            >
              <span>{t.hero.searchBtn}</span>
            </button>
          </form>

          {/* Live Search Autocomplete Dropdown Overlay with Elevated Aesthetics */}
          {dropdownOpen && localQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2.5 bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-stone-200/90 overflow-hidden z-50 animate-fadeIn">
              
              <div className="p-3.5 bg-stone-50/90 border-b border-stone-100 flex items-center justify-between text-xs font-bold text-stone-600">
                <span className="flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-[#1d4ed8]" />
                  <span>Search results for "{localQuery}"</span>
                </span>
                <span className="text-[11px] font-semibold text-stone-400 bg-white px-2 py-0.5 rounded-full border border-stone-200/60 shadow-2xs">
                  {liveResults.length} {liveResults.length === 1 ? 'match' : 'matches'}
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-stone-100/80">
                {liveResults.length === 0 ? (
                  <div className="p-6 text-center text-xs text-stone-500">
                    {isSearchingLive ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 text-[#1d4ed8] animate-spin" />
                        <span>Searching treatises and archives...</span>
                      </div>
                    ) : (
                      <span>No direct title matches found for "{localQuery}". Press Enter to search entire archive texts.</span>
                    )}
                  </div>
                ) : (
                  liveResults.map((book) => {
                    const title = book[`title_${lang}`] || book.title_hi || book.title_en;
                    const author = book[`author_${lang}`] || book.author_hi || book.author_en;

                    return (
                      <div
                        key={book.id}
                        className="p-3.5 hover:bg-blue-50/60 transition flex items-center justify-between gap-3 cursor-pointer group"
                        onClick={() => {
                          setDropdownOpen(false);
                          if (onSelectBook) onSelectBook(book);
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-13 bg-stone-100 rounded-lg overflow-hidden shadow-2xs shrink-0 flex items-center justify-center border border-stone-200">
                            {book.cover_url ? (
                              <img src={book.cover_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <FileText className="w-4 h-4 text-stone-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-[#1d4ed8] truncate font-hindi-serif">
                              {title}
                            </h4>
                            <p className="text-[11px] text-stone-500 truncate mt-0.5 font-medium">
                              {author} • <span className="font-semibold text-stone-700">{book.year || 'Archive'}</span>
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
                              className="px-3.5 py-1.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-[11px] font-bold rounded-xl shadow-2xs flex items-center gap-1 transition cursor-pointer hover:-translate-y-0.5"
                            >
                              <BookOpen className="w-3 h-3" />
                              <span>Read</span>
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
                className="w-full py-3 px-4 bg-stone-50 hover:bg-stone-100/90 border-t border-stone-200/70 text-xs font-bold text-[#1d4ed8] flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <span>Press Enter or click to filter catalog results for "{localQuery}"</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

            </div>
          )}

          {/* Refined Author & Thinker Chips with Soft Neutral Pills */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mt-5 text-xs text-stone-500">
            <span className="font-semibold text-stone-800 flex items-center gap-1.5 mr-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {t.hero.keyThinkers}
            </span>
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
                  className="px-3 py-1 rounded-full text-xs font-medium bg-white hover:bg-blue-50/80 text-stone-700 hover:text-[#1d4ed8] border border-stone-200/80 hover:border-blue-300 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
