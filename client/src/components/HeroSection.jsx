import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Mic,
  ChevronDown,
  ChevronUp,
  X,
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
      desc: 'The definitive epic of rural peasant struggle and colonial feudalism in northern India.',
      image: '/images/categories/spotlight-godan.jpg',
      remoteFallback: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
      gradient: 'from-amber-950/40 via-zinc-950/80 to-black'
    },
    {
      titleEn: 'Gitanjali (Song Offerings)',
      titleHi: 'गीतांजलि (काव्य संकलन)',
      author: 'Rabindranath Tagore',
      authorHi: 'रवींद्रनाथ टैगोर',
      category: 'poetry',
      era: '1910 · Bengal Renaissance',
      tag: 'Featured Acquisition',
      desc: 'Nobel-laureate verses exploring humanity, divine love, and cultural harmony.',
      image: '/images/categories/poetry.jpg',
      remoteFallback: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=1000&q=80',
      gradient: 'from-purple-950/40 via-zinc-950/80 to-black'
    },
    {
      titleEn: 'Divan-e-Ghalib (Urdu-Hindi)',
      titleHi: 'दीवान-ए-ग़ालिब',
      author: 'Mirza Asadullah Khan Ghalib',
      authorHi: 'मिर्ज़ा ग़ालिब',
      category: 'poetry',
      era: '1841 · Late Mughal',
      tag: 'Rare Folio',
      desc: 'Foundational Ghazal prosody illuminating existential irony and philosophical doubt.',
      image: '/images/categories/spotlight-faiz.jpg',
      remoteFallback: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=1000&q=80',
      gradient: 'from-blue-950/40 via-zinc-950/80 to-black'
    }
  ];

  return (
    <section className="text-white pb-12 border-b border-white/[0.08]">
      <div className="w-full">
        
        {/* Top Monospace Tag */}
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-400">
            FEATURED ACQUISITIONS • CURATOR SPOTLIGHT
          </span>
        </div>

        {/* Title & Mission Header in Bold Neo-Grotesque */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-[-0.04em] leading-tight flex flex-wrap items-center gap-4">
            <span>{t.hero.title}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/[0.08] text-zinc-300">
              {t.hero.openAccessBadge || 'OPEN ACCESS DIGITAL ARCHIVE'}
            </span>
          </h1>

          <div className="text-zinc-400 text-sm sm:text-base leading-relaxed mt-4 max-w-3xl">
            <p className={`${expanded ? '' : 'line-clamp-2'} transition-all`}>
              {t.hero.descriptionMain}
            </p>
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-white hover:text-zinc-300 mt-2 cursor-pointer transition-colors"
            >
              <span>{expanded ? t.hero.readLess || 'Less' : t.hero.readMore || 'Read More'}</span>
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Curator Spotlight Showcase Grid (3 Cinematic Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {spotlightItems.map((item, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden p-6 rounded-[24px] bg-[#141414] border border-white/[0.08] hover:border-white/20 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Graphical Visual Layer (reduced dark shade by 40%) */}
              <div
                className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-700 ease-out group-hover:scale-105 opacity-60 group-hover:opacity-80"
                style={{ backgroundImage: `url(${item.image || item.remoteFallback})` }}
              />
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient || 'from-zinc-900/40 via-black/50 to-black/60'} z-10 opacity-55`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent z-15 pointer-events-none" />

              <div className="relative z-20">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full bg-white/[0.08] text-zinc-200 border border-white/[0.12] backdrop-blur-md">
                    {item.tag}
                  </span>
                  <span className="font-mono text-[10px] tracking-wider text-zinc-400 bg-black/40 px-2 py-0.5 rounded-full border border-white/[0.06]">
                    {item.era}
                  </span>
                </div>

                <div className="text-xs text-zinc-300 font-medium mb-1">
                  {lang === 'hi' ? item.authorHi : item.author}
                </div>
                <h3 className="text-lg font-bold text-white tracking-[-0.03em] group-hover:text-zinc-100">
                  {lang === 'hi' ? item.titleHi : item.titleEn}
                </h3>
                <p className="text-xs text-zinc-300 mt-2 leading-relaxed line-clamp-2">
                  {item.desc}
                </p>
              </div>

              <div className="relative z-20 mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between">
                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
                  {item.category}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const query = lang === 'hi' ? item.titleHi : item.titleEn;
                    setLocalQuery(query);
                    setSearchQuery?.(query);
                    const catElement = document.getElementById('catalog');
                    if (catElement) catElement.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-white group-hover:translate-x-1 transition-transform cursor-pointer"
                >
                  <span>EXPLORE</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Minimalist Studio Search Bar (⌘K integrated) */}
        <div ref={searchBoxRef} className="relative max-w-3xl z-30">
          <form
            onSubmit={handleFormSubmit}
            className="relative flex items-center p-2 bg-[#141414] rounded-2xl border border-white/[0.08] focus-within:border-white/30 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          >
            <div className="pl-3.5 pr-2 text-zinc-400 pointer-events-none flex items-center justify-center">
              {isSearchingLive ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
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
              className="w-full py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder-zinc-500 bg-transparent outline-hidden font-sans cursor-text font-normal"
            />

            {localQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 mr-1 text-zinc-400 hover:text-white rounded-full hover:bg-white/[0.06] transition cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleVoiceSearch}
              title="Voice Search"
              className={`p-2.5 mr-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition cursor-pointer ${
                isListening ? 'animate-pulse text-red-500 bg-red-950/40' : ''
              }`}
            >
              <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* High-Contrast Search Pill Button */}
            <button
              type="submit"
              className="hidden sm:flex items-center gap-1.5 px-6 py-2.5 bg-white hover:bg-zinc-200 text-black text-xs font-mono uppercase tracking-wider font-semibold rounded-xl transition cursor-pointer shrink-0"
            >
              <span>{t.hero.searchBtn}</span>
            </button>
          </form>

          {/* Live Search Autocomplete Dropdown */}
          {dropdownOpen && localQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#141414] rounded-2xl shadow-2xl border border-white/[0.1] overflow-hidden z-50 animate-fadeIn">
              <div className="p-3 bg-black/60 border-b border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-zinc-400" />
                  <span>
                    {lang === 'hi'
                      ? `"${localQuery}" के खोज परिणाम`
                      : lang === 'ur'
                      ? `"${localQuery}" کے نتائج`
                      : `Results for "${localQuery}"`}
                  </span>
                </span>
                <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.06] px-2 py-0.5 rounded-full border border-white/[0.08]">
                  {liveResults.length} {t.sections.worksUnit || 'treatises'}
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.06]">
                {liveResults.length === 0 ? (
                  <div className="p-6 text-center text-xs font-mono text-zinc-400 uppercase">
                    {isSearchingLive ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                        <span>Searching catalog...</span>
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
                        className="p-3.5 hover:bg-white/[0.04] transition flex items-center justify-between gap-3 cursor-pointer group"
                        onClick={() => {
                          setDropdownOpen(false);
                          if (onSelectBook) onSelectBook(book);
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-9 h-12 bg-black rounded-lg overflow-hidden shrink-0 flex items-center justify-center border border-white/[0.08]">
                            {book.cover_url ? (
                              <img src={book.cover_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <FileText className="w-4 h-4 text-zinc-500" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-zinc-200 truncate">
                              {title}
                            </h4>
                            <p className="text-[11px] text-zinc-400 truncate mt-0.5 font-mono">
                              {author} • <span>{book.year || ''}</span>
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
                              className="px-3 py-1 bg-white hover:bg-zinc-200 text-black text-xs font-mono uppercase font-semibold rounded-lg transition"
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
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.2em] mr-1">
            {t.hero.popularAuthors || 'ARCHIVE MASTERS:'}
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
                className="px-3 py-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white text-xs font-mono uppercase rounded-full transition-colors cursor-pointer"
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
