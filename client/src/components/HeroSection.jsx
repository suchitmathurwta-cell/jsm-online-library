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
  Bookmark,
  ExternalLink
} from 'lucide-react';
import { getBooks } from '../services/supabaseApi';
import { Link } from 'react-router-dom';

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
      setSearchQuery?.(val.trim());

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

  // Curator Spotlight Acquisitions
  const spotlightItems = [
    {
      titleEn: 'Godan (Complete Edition)',
      titleHi: 'गोदान (सम्पूर्ण संस्करण)',
      author: 'Munshi Premchand',
      authorHi: 'मुंशी प्रेमचंद',
      category: 'novel',
      era: '1936 · Progressive Era',
      tag: 'Curator Spotlight',
      desc: 'The definitive epic of rural peasant struggle and colonial feudalism in northern India.'
    },
    {
      titleEn: 'Gitanjali (Song Offerings)',
      titleHi: 'गीतांजलि (काव्य संकलन)',
      author: 'Rabindranath Tagore',
      authorHi: 'रवींद्रनाथ टैगोर',
      category: 'poetry',
      era: '1910 · Bengal Renaissance',
      tag: 'Featured Acquisition',
      desc: 'Nobel-laureate verses exploring humanity, divine love, and cultural harmony.'
    },
    {
      titleEn: 'Divan-e-Ghalib (Urdu-Hindi)',
      titleHi: 'दीवान-ए-ग़ालिब',
      author: 'Mirza Asadullah Khan Ghalib',
      authorHi: 'मिर्ज़ा ग़ालिब',
      category: 'poetry',
      era: '1841 · Late Mughal',
      tag: 'Rare Folio',
      desc: 'Foundational Ghazal prosody illuminating existential irony and philosophical doubt.'
    }
  ];

  return (
    <section className="bg-[#FAFAFA] pt-14 pb-16 border-b border-black/[0.05]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Top Minimalist Tag */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-medium">
            Featured Acquisitions · Curator Spotlight
          </span>
        </div>

        {/* Title & Mission Header in Geist Sans */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#111111] font-sans tracking-tight leading-tight flex flex-wrap items-center gap-3">
            <span>{t.hero.title}</span>
            <span className="text-xs font-mono font-medium text-zinc-600 bg-zinc-100 px-3 py-1 rounded-full border border-black/[0.06]">
              {t.hero.openAccessBadge || 'Open Access Digital Archive'}
            </span>
          </h1>

          <div className="text-zinc-500 text-sm sm:text-[15px] font-sans leading-relaxed mt-3 relative max-w-3xl">
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
        </div>

        {/* Curator Spotlight Showcase Grid (3 Asymmetrical Minimalist Studio Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {spotlightItems.map((item, idx) => (
            <div
              key={idx}
              className="group p-5 rounded-3xl bg-white border border-black/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.05)] hover:border-black/15 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-black/[0.04]">
                    {item.tag}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {item.era}
                  </span>
                </div>

                <div className="text-xs text-zinc-400 font-sans mb-1">
                  {lang === 'hi' ? item.authorHi : item.author}
                </div>
                <h3 className="text-base font-bold text-[#111111] tracking-tight font-sans group-hover:text-black">
                  {lang === 'hi' ? item.titleHi : item.titleEn}
                </h3>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed line-clamp-2">
                  {item.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-black/[0.05] flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-400 uppercase">
                  {item.category}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setLocalQuery(lang === 'hi' ? item.titleHi : item.titleEn);
                    setSearchQuery?.(lang === 'hi' ? item.titleHi : item.titleEn);
                    const catElement = document.getElementById('catalog');
                    if (catElement) catElement.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#111111] group-hover:translate-x-0.5 transition-transform cursor-pointer"
                >
                  <span>Explore In Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-black" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Minimalist Studio Search Bar (⌘K integrated) */}
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
              id="catalog-search-input"
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
                              className="px-3 py-1 bg-zinc-100 hover:bg-black hover:text-white text-zinc-700 text-xs font-medium rounded-lg transition"
                            >
                              Read
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Thinker / Author Quick Search Pills */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider mr-1">
            {t.hero.popularAuthors || 'Archive Masters:'}
          </span>
          {thinkerChips.slice(0, 7).map((tObj, idx) => {
            const authorLabel = tObj[lang] || tObj.hi || tObj.en;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setLocalQuery(authorLabel);
                  setSearchQuery?.(authorLabel);
                  const catElement = document.getElementById('catalog');
                  if (catElement) catElement.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3 py-1 bg-white hover:bg-zinc-100 border border-black/[0.06] text-zinc-600 hover:text-black text-xs font-sans rounded-full transition-colors cursor-pointer"
              >
                {authorLabel}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
