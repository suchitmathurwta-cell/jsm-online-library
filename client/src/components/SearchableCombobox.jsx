import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, PlusCircle, Check, AlertCircle, Loader2, Trash2, Sparkles } from 'lucide-react';
import { transliterateAll, clientSideTransliterateFallback, detectLanguage, enforceScript } from '../services/transliterationService';

export default function SearchableCombobox({
  label,
  value,
  options = [],
  placeholder = 'Select or search...',
  searchPlaceholder = 'Type in English, Hindi, or Urdu...',
  type = 'genre', // 'format' | 'genre' | 'subgenre'
  lang,
  onChange,
  onCreate,
  onDelete,
  disabled = false,
  dark = true
}) {
  const currentLang = lang || localStorage.getItem('chetna_lang') || 'hi';
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTrilingual, setPreviewTrilingual] = useState({ hi: '', en: '', ur: '' });
  const [isCreating, setIsCreating] = useState(false);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus search input on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 40);
    } else {
      setSearchQuery('');
      setPreviewTrilingual({ hi: '', en: '', ur: '' });
    }
  }, [isOpen]);

  // Live trilingual preview when typing a new Format / Genre / Subgenre in the combobox
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setPreviewTrilingual({ hi: '', en: '', ur: '' });
      return;
    }
    const detected = detectLanguage(trimmed);
    const syncRes = clientSideTransliterateFallback(trimmed, detected);
    setPreviewTrilingual({
      hi: enforceScript(syncRes.hi || trimmed, 'hi'),
      en: enforceScript(syncRes.en || trimmed, 'en'),
      ur: enforceScript(syncRes.ur || trimmed, 'ur')
    });

    const timer = setTimeout(async () => {
      try {
        const asyncRes = await transliterateAll(trimmed, detected);
        if (asyncRes) {
          setPreviewTrilingual({
            hi: asyncRes.hi || syncRes.hi,
            en: asyncRes.en || syncRes.en,
            ur: asyncRes.ur || syncRes.ur
          });
        }
      } catch (e) {}
    }, 220);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Normalize options into { id, label, name_hi, name_en, name_ur }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string') {
      return { id: opt, label: opt, name_hi: opt, name_en: opt, name_ur: '', raw: opt };
    }
    return {
      id: opt.id || opt.value || opt.label,
      label:
        opt.label ||
        opt['name_' + currentLang] ||
        opt.name_hi ||
        opt.name_en ||
        opt.name ||
        opt.id,
      name_hi: opt.name_hi || '',
      name_en: opt.name_en || '',
      name_ur: opt.name_ur || '',
      raw: opt
    };
  });

  // Find currently selected option label
  const selectedOption = normalizedOptions.find(
    (o) =>
      o.id === value ||
      o.label === value ||
      (o.name_hi && o.name_hi === value) ||
      (o.name_en && o.name_en === value) ||
      (o.raw &&
        (o.raw === value ||
          o.raw.id === value ||
          o.raw.name_hi === value ||
          o.raw.name_en === value ||
          o.raw.label === value))
  );

  const displayLabel = selectedOption ? selectedOption.label : value || placeholder;

  // Filter options based on typed search query across all language fields + transliterated equivalents
  const query = searchQuery.trim().toLowerCase();
  const filteredOptions = query
    ? normalizedOptions.filter(
        (opt) =>
          opt.label.toLowerCase().includes(query) ||
          (opt.id && opt.id.toLowerCase().includes(query)) ||
          (opt.name_hi && opt.name_hi.toLowerCase().includes(query)) ||
          (opt.name_en && opt.name_en.toLowerCase().includes(query)) ||
          (opt.name_ur && opt.name_ur.toLowerCase().includes(query)) ||
          (previewTrilingual.hi && opt.name_hi && opt.name_hi.includes(previewTrilingual.hi)) ||
          (previewTrilingual.en &&
            opt.name_en &&
            opt.name_en.toLowerCase().includes(previewTrilingual.en.toLowerCase()))
      )
    : normalizedOptions;

  const handleCreate = async () => {
    if (!searchQuery.trim() || isCreating) return;
    setIsCreating(true);
    try {
      if (onCreate) {
        await onCreate(searchQuery.trim());
      }
      setIsOpen(false);
      setSearchQuery('');
    } catch (err) {
      console.error('Error creating option:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteItem = (e, opt) => {
    e.stopPropagation();
    if (!onDelete) return;
    const confirmMsg =
      currentLang === 'hi'
        ? `क्या आप "${opt.label}" को हटाना चाहते हैं?`
        : currentLang === 'ur'
        ? `کیا آپ "${opt.label}" کو حذف کرنا چاہتے ہیں؟`
        : `Are you sure you want to delete "${opt.label}"?`;
    if (window.confirm(confirmMsg)) {
      onDelete(opt.id, opt);
    }
  };

  const notFoundTitle =
    type === 'format'
      ? currentLang === 'hi'
        ? 'श्रेणी उपलब्ध नहीं है'
        : currentLang === 'ur'
        ? 'فارمیٹ نہیں ملا'
        : 'Category not found'
      : type === 'genre'
      ? currentLang === 'hi'
        ? 'विधा उपलब्ध नहीं है'
        : currentLang === 'ur'
        ? 'صنف نہیں ملی'
        : 'Genre not found'
      : currentLang === 'hi'
      ? 'उप-विधा उपलब्ध नहीं है'
      : currentLang === 'ur'
      ? 'ذیلی صنف نہیں ملی'
      : 'Sub-Genre not found';

  const typeName =
    type === 'format'
      ? currentLang === 'hi'
        ? 'श्रेणी'
        : currentLang === 'ur'
        ? 'فارمیٹ'
        : 'category'
      : type === 'genre'
      ? currentLang === 'hi'
        ? 'विधा'
        : currentLang === 'ur'
        ? 'صنف'
        : 'genre'
      : currentLang === 'hi'
      ? 'उप-विधा'
      : currentLang === 'ur'
      ? 'ذیلی صنف'
      : 'sub-genre';

  const createBtnText = searchQuery.trim()
    ? currentLang === 'hi'
      ? `+ "${searchQuery.trim()}" नया जोड़ें`
      : currentLang === 'ur'
      ? `+ "${searchQuery.trim()}" نیا بنائیں`
      : `+ Create "${searchQuery.trim()}"`
    : currentLang === 'hi'
    ? `+ नया ${typeName} जोड़ें`
    : currentLang === 'ur'
    ? `+ نیا ${typeName} بنائیں`
    : `+ Create new ${typeName}`;

  const creatingText =
    currentLang === 'hi'
      ? 'जोड़ा जा रहा है...'
      : currentLang === 'ur'
      ? 'بنایا جا رہا ہے...'
      : 'Creating...';

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label
          className={`text-xs block mb-1.5 ${
            dark
              ? 'text-zinc-300 font-mono text-[11px] uppercase tracking-wider font-bold'
              : 'font-bold text-stone-800'
          }`}
        >
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 text-xs border rounded-xl flex items-center justify-between text-left transition shadow-xs cursor-pointer ${
          dark
            ? isOpen
              ? 'border-amber-400 ring-1 ring-amber-400/30 bg-[#1e1e1e] text-white'
              : 'border-white/[0.14] hover:border-white/[0.3] bg-[#181818] text-white'
            : isOpen
            ? 'border-[#1d4ed8] ring-2 ring-[#1d4ed8]/20 bg-white text-stone-900'
            : 'border-stone-300 hover:border-stone-400 bg-white text-stone-900'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`truncate font-medium ${
            !selectedOption && !value
              ? dark
                ? 'text-zinc-500'
                : 'text-stone-400'
              : dark
              ? 'text-white font-medium'
              : 'text-stone-900 font-semibold'
          }`}
        >
          {displayLabel}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 ml-1.5 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-amber-400' : dark ? 'text-zinc-400' : 'text-stone-400'
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`mt-1.5 rounded-2xl shadow-2xl border overflow-hidden z-[9999] animate-fadeIn backdrop-blur-xl ${
            dark
              ? 'bg-[#161616] border-white/[0.15] text-white'
              : 'bg-white border-stone-200 text-stone-900'
          }`}
        >
          {/* Sticky Search / Create Input Box */}
          <div
            className={`p-2.5 border-b ${
              dark ? 'border-white/[0.08] bg-[#1c1c1c]' : 'border-stone-100 bg-stone-50/90'
            }`}
          >
            <div className="relative flex items-center">
              <Search
                className={`w-3.5 h-3.5 absolute left-2.5 pointer-events-none ${
                  dark ? 'text-zinc-400' : 'text-stone-400'
                }`}
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    e.preventDefault();
                    handleCreate();
                  }
                }}
                placeholder={searchPlaceholder}
                className={`w-full pl-8 pr-3 py-2 text-xs rounded-xl outline-hidden font-medium ${
                  dark
                    ? 'bg-[#242424] border border-white/[0.15] focus:border-amber-400 text-white placeholder-zinc-500'
                    : 'bg-white border border-stone-300 focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/20 text-stone-900 placeholder-stone-400'
                }`}
              />
            </div>

            {/* Live Trilingual Auto-Translate Preview when typing */}
            {searchQuery.trim() && (
              <div
                className={`mt-2 p-2 rounded-xl border text-[10.5px] flex flex-wrap items-center gap-x-3 gap-y-1 ${
                  dark
                    ? 'bg-black/60 border-white/[0.08] text-zinc-300'
                    : 'bg-blue-50/70 border-blue-100 text-stone-700'
                }`}
              >
                <span className="font-mono font-bold text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>AUTO TRILINGUAL:</span>
                </span>
                <span>
                  <strong>हिंदी:</strong> {previewTrilingual.hi || '...'}
                </span>
                <span>
                  <strong>ENG:</strong> {previewTrilingual.en || '...'}
                </span>
                <span>
                  <strong>اردو:</strong> {previewTrilingual.ur || '...'}
                </span>
              </div>
            )}
          </div>

          {/* Options List */}
          <div
            className={`max-h-52 overflow-y-auto p-1 divide-y ${
              dark ? 'divide-white/[0.04]' : 'divide-stone-50'
            }`}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = selectedOption && selectedOption.id === opt.id;
                return (
                  <div
                    key={opt.id}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl flex items-center justify-between transition group cursor-pointer ${
                      dark
                        ? isSelected
                          ? 'bg-white/[0.12] text-white font-semibold'
                          : 'text-zinc-300 hover:bg-white/[0.06] hover:text-white'
                        : isSelected
                        ? 'bg-blue-50 text-[#1d4ed8] font-bold'
                        : 'text-stone-700 hover:bg-stone-50 font-normal'
                    }`}
                    onClick={() => {
                      onChange(opt.id, opt);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                  >
                    <span className="truncate flex-1">{opt.label}</span>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteItem(e, opt)}
                          title="Delete option"
                          className="opacity-80 sm:opacity-0 sm:group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-400 hover:bg-white/[0.08] rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              /* If No Matches Found: Show Notice and Create Option */
              <div className="p-3.5 text-center space-y-2">
                <div
                  className={`flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 px-2.5 rounded-xl border ${
                    dark
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{notFoundTitle}</span>
                </div>
                {searchQuery.trim() && (
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={isCreating}
                    className={`w-full py-2.5 px-3 text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition font-mono uppercase tracking-wider cursor-pointer disabled:opacity-50 ${
                      dark
                        ? 'bg-amber-400 text-black hover:bg-amber-300'
                        : 'bg-[#1d4ed8] hover:bg-[#1e40af] text-white'
                    }`}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{creatingText}</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4" />
                        <span>{createBtnText}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Create Footer if typing text that doesn't have an exact match */}
          {searchQuery.trim() && filteredOptions.length > 0 && (
            <div
              className={`p-2 border-t ${
                dark ? 'border-white/[0.08] bg-[#1a1a1a]' : 'border-stone-100 bg-stone-50/70'
              }`}
            >
              <button
                type="button"
                onClick={handleCreate}
                disabled={isCreating}
                className={`w-full py-2 px-3 text-xs font-mono uppercase tracking-wider font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm disabled:opacity-50 ${
                  dark
                    ? 'bg-amber-400 hover:bg-amber-300 text-black'
                    : 'bg-white hover:bg-blue-50 text-[#1d4ed8] hover:text-[#1e40af] border border-blue-200/80'
                }`}
              >
                {isCreating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <PlusCircle className="w-3.5 h-3.5" />
                )}
                <span>{createBtnText}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
