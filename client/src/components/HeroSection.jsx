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
import { getBooks } from '../services/supabaseApi';

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
  const debounceTimeoutRef = useRef(null);

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

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
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

    debounceTimeoutRef.current = setTimeout(async () => {
      // 1. Immediately sync global catalog query
      setSearchQuery?.(val.trim());

      // 2. Query Supabase directly for fast live dropdown previews
      try {
        const results = await getBooks({ search: val.trim(), limit: 6 });
        setLiveResults(results || []);
      } catch (err) {
        console.warn('Live search fallback error:', err);
      } finally {
        setIsSearchingLive(false);
      }
    }, 200);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
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
    { hi: 'मुंशी प्रेमचंद', en: 'Premchand', ur: 'پریم چند' },
    { hi: 'रवींद्रनाथ टैगोर', en: 'Rabindranath Tagore', ur: 'ٹیگور' },
    { hi: 'मीर अनीस', en: 'Mir Anees', ur: 'میر انیس' },
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
    <section className="bg-[#FAFAFA] pt-14 pb-16 border-b border-black/[0.05]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Title & Badge with High-Key Minimalist Studio Typography */}
        <div className="mb-4">
          <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#111111] font-sans tracking-tight leading-tight flex flex-wrap items-center gap-3">
            <span>{t.hero.title}</span>
            <span className="text-xs font-mono font-medium text-zinc-600 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200/80">
              {t.hero.openAccessBadge || 'Open Access Digital Archive'}
            </span>
          </h1>
        </div>

        {/* Mission Statement Accordion */}
        <div className="text-zinc-500 text-sm sm:text-[15px] font-sans leading-relaxed mb-8 relative max-w-3xl">
          <p className={`${expanded ? '' : 'line-clamp-2'} transition-all`}>
            {t.hero.descriptionMain}
          </p>
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 text-xs font-medium text-[#111111] hover:underline mt-2 cursor-pointer transition-colors"
          >
            <span>{expanded ? t.hero.readLess || 'Less' : t.hero.readMore || 'Read More'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Minimalist Floating Search Container */}
        <div ref={searchBoxRef} className="relative max-w-3xl z-30">
          <form
            onSubmit={handleFormSubmit}
            className="relative flex items-center p-1.5 sm:p-2 bg-white rounded-2xl border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] focus-within:shadow-[0_12px_36px_rgba(0,0,0,0.07)] focus-within:border-black/20 transition-all duration-300"
          >
            <div className="pl-3.5 pr-2 text-zinc-400 pointer-events-none flex items-center justify-center">
              {isSearchingLive ? (
                <Loader2 className="w-5 h-5 text-zinc-700 animate-spin" />
              ) : (
                <Search className="w-5 h-5 text-zinc-400" />
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
              className="w-full py-2.5 sm:py-3 text-sm sm:text-base text-[#111111] placeholder-zinc-400 bg-transparent outline-hidden font-sans cursor-text font-normal"
            />

            {localQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 mr-1 text-zinc-400 hover:text-black rounded-full hover:bg-zinc-100 transition cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleVoiceSearch}
              title="Voice Search"
              className={`p-2.5 mr-1.5 text-zinc-400 hover:text-black rounded-xl hover:bg-zinc-100 transition cursor-pointer ${
                isListening ? 'animate-pulse text-red-500 bg-red-50' : ''
              }`}
            >
              <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* High-Key Minimalist Pill Search Button */}
            <button
              type="submit"
              className="hidden sm:flex items-center gap-1.5 px-6 py-2.5 bg-[#111111] hover:bg-black text-white text-xs sm:text-sm font-medium rounded-xl shadow-xs transition cursor-pointer shrink-0"
            >
              <span>{t.hero.searchBtn}</span>
            </button>
          </form>

          {/* Live Search Autocomplete Dropdown */}
          {dropdownOpen && localQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-black/[0.08] overflow-hidden z-50 animate-fadeIn">
              
              <div className="p-3 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between text-xs font-medium text-zinc-600">
                <span className="flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-zinc-500" />
                  <span>
                    {lang === 'hi'
                      ? `"${localQuery}" के खोज परिणाम`
                      : lang === 'ur'
                      ? `"${localQuery}" کے نتائج`
                      : `Results for "${localQuery}"`}
                  </span>
                </span>
                <span className="text-[11px] font-mono text-zinc-500 bg-white px-2 py-0.5 rounded-full border border-zinc-200">
                  {liveResults.length} {t.sections.worksUnit || 'treatises'}
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100">
                {liveResults.length === 0 ? (
                  <div className="p-6 text-center text-xs text-zinc-500">
                    {isSearchingLive ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 text-zinc-600 animate-spin" />
                        <span>Searching treatises...</span>
                      </div>
                    ) : (
                      <span>{t.sections.noResults || 'No direct title matches found'}</span>
                    )}
                  </div>
                ) : (
                  liveResults.map((book) => {
                    const title = book['title_' + lang] || book.title_hi || book.title_en;
                    const author = book['author_' + lang] || book.author_hi || book.author_en;

                    return (
                      <div
                        key={book.id}
                        className="p-3 hover:bg-zinc-50 transition flex items-center justify-between gap-3 cursor-pointer group"
                        onClick={() => {
                          setDropdownOpen(false);
                          if (onSelectBook) onSelectBook(book);
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-9 h-12 bg-zinc-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center border border-zinc-200">
                            {book.cover_url ? (
                              <img src={book.cover_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <FileText className="w-4 h-4 text-zinc-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs sm:text-sm font-bold text-[#111111] group-hover:text-black truncate font-sans">
                              {title}
                            </h4>
                            <p className="text-[11px] text-zinc-500 truncate mt-0.5 font-medium">
                              {author} • <span className="text-zinc-700">{book.year || ''}</span>
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
                              className="px-3 py-1 bg-[#111111] hover:bg-black text-white text-[11px] font-medium rounded-full shadow-2xs flex items-center gap-1 transition cursor-pointer"
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

              {/* View all in catalog footer */}
              <button
                type="button"
                onClick={handleFormSubmit}
                className="w-full py-2.5 px-4 bg-zinc-50 hover:bg-zinc-100 border-t border-zinc-100 text-xs font-medium text-[#111111] flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <span>Filter full catalog results for "{localQuery}"</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Minimalist Author & Thinker Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-5 text-xs text-zinc-500">
            <span className="font-medium text-[#111111] flex items-center gap-1.5 mr-1 font-sans">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              {t.hero.keyThinkers || 'Key Thinkers'}:
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
                  className="px-3 py-1 rounded-full text-xs font-medium bg-white hover:bg-zinc-100 text-zinc-700 hover:text-black border border-zinc-200 shadow-[0_2px_6px_rgba(0,0,0,0.02)] transition-all cursor-pointer"
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
