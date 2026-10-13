import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, PlusCircle, Check, AlertCircle, Loader2, Trash2 } from 'lucide-react';

export default function SearchableCombobox({
  label,
  value,
  options = [],
  placeholder = "Select or search...",
  searchPlaceholder = "Type to search...",
  type = "genre", // 'format' | 'genre' | 'subgenre'
  lang,
  onChange,
  onCreate,
  onDelete,
  disabled = false
}) {
  const currentLang = lang || localStorage.getItem('chetna_lang') || 'hi';
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Normalize options into { id, label, name_hi, name_en, name_ur }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string') {
      return { id: opt, label: opt, name_hi: opt, name_en: opt, name_ur: '', raw: opt };
    }
    return {
      id: opt.id || opt.value || opt.label,
      label: opt.label || opt['name_' + currentLang] || opt.name_hi || opt.name_en || opt.name || opt.id,
      name_hi: opt.name_hi || '',
      name_en: opt.name_en || '',
      name_ur: opt.name_ur || '',
      raw: opt
    };
  });

  // Find currently selected option label
  const selectedOption = normalizedOptions.find(o => 
    o.id === value || 
    o.label === value || 
    (o.name_hi && o.name_hi === value) || 
    (o.name_en && o.name_en === value) ||
    (o.raw && (o.raw === value || o.raw.id === value || o.raw.name_hi === value || o.raw.name_en === value || o.raw.label === value))
  );

  const displayLabel = selectedOption ? selectedOption.label : (value || placeholder);

  // Filter options based on typed search query across all language fields
  const query = searchQuery.trim().toLowerCase();
  const filteredOptions = query
    ? normalizedOptions.filter(opt =>
        opt.label.toLowerCase().includes(query) ||
        (opt.id && opt.id.toLowerCase().includes(query)) ||
        (opt.name_hi && opt.name_hi.toLowerCase().includes(query)) ||
        (opt.name_en && opt.name_en.toLowerCase().includes(query)) ||
        (opt.name_ur && opt.name_ur.toLowerCase().includes(query))
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
    const confirmMsg = currentLang === 'hi'
      ? `क्या आप "${opt.label}" को हटाना चाहते हैं?`
      : (currentLang === 'ur'
        ? `کیا آپ "${opt.label}" کو حذف کرنا چاہتے ہیں؟`
        : `Are you sure you want to delete "${opt.label}"?`);
    if (window.confirm(confirmMsg)) {
      onDelete(opt.id, opt);
    }
  };

  const notFoundTitle = type === "format"
    ? (currentLang === 'hi' ? 'फॉर्मेट / श्रेणी उपलब्ध नहीं है' : (currentLang === 'ur' ? 'فارمیٹ نہیں ملا' : 'Format not found'))
    : type === "genre"
    ? (currentLang === 'hi' ? 'विधा उपलब्ध नहीं है' : (currentLang === 'ur' ? 'صنف نہیں ملی' : 'Genre not found'))
    : (currentLang === 'hi' ? 'उप-विधा उपलब्ध नहीं है' : (currentLang === 'ur' ? 'ذیلی صنف نہیں ملی' : 'Sub-Genre not found'));

  const notFoundDesc = currentLang === 'hi'
    ? `"${searchQuery}" नाम से कोई विकल्प नहीं मिला।`
    : (currentLang === 'ur'
      ? `"${searchQuery}" کے نام سے کوئی آپشن نہیں ملا۔`
      : `No existing option matches "${searchQuery}".`);

  const createBtnText = currentLang === 'hi'
    ? `+ "${searchQuery.trim()}" नया जोड़ें`
    : (currentLang === 'ur'
      ? `+ "${searchQuery.trim()}" نیا بنائیں`
      : `+ Create "${searchQuery.trim()}"`);

  const creatingText = currentLang === 'hi'
    ? 'जोड़ा जा रहा है...'
    : (currentLang === 'ur'
      ? 'بنایا جا رہا ہے...'
      : 'Creating...');

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 block mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={"w-full px-3.5 py-2.5 text-xs rounded-xl flex items-center justify-between text-left transition cursor-pointer select-none " + (
          isOpen
            ? "border-white/40 ring-1 ring-white/20 bg-[#1e1e1e] text-white"
            : "border border-white/[0.08] hover:border-white/20 bg-[#161616] text-white"
        ) + (disabled ? " opacity-40 cursor-not-allowed bg-black/40" : "")}
      >
        <span className={"truncate font-sans " + (!selectedOption && !value ? "text-zinc-500 font-normal" : "text-white font-medium")}>
          {displayLabel}
        </span>
        <ChevronDown className={"w-4 h-4 text-zinc-400 shrink-0 ml-1.5 transition-transform duration-200 " + (isOpen ? "rotate-180 text-white" : "")} />
      </button>

      {/* Floating Dropdown Menu (Mugen Dark Studio Glass Container) */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#141414]/98 backdrop-blur-2xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-white/[0.1] overflow-hidden z-[9999] animate-fadeIn text-white">
          
          {/* Sticky Search Input Box */}
          <div className="p-2.5 border-b border-white/[0.06] bg-black/40">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-3 py-2 text-xs bg-[#1a1a1a] border border-white/[0.08] focus:border-white/30 rounded-xl outline-hidden text-white placeholder-zinc-500 font-medium"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 divide-y divide-white/[0.03]">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = selectedOption && selectedOption.id === opt.id;
                return (
                  <div
                    key={opt.id}
                    className={"w-full px-3 py-2 text-xs rounded-xl flex items-center justify-between transition group cursor-pointer " + (
                      isSelected
                        ? "bg-white/[0.12] text-white font-bold"
                        : "text-zinc-300 hover:bg-white/[0.06] hover:text-white font-normal"
                    )}
                    onClick={() => {
                      onChange(opt.id, opt);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                  >
                    <span className="truncate flex-1 font-sans">{opt.label}</span>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteItem(e, opt)}
                          title="Delete option"
                          className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 hover:bg-white/[0.08] rounded-lg transition"
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
              <div className="p-4 text-center space-y-2.5">
                <div className="flex items-center justify-center gap-1.5 text-xs text-amber-300 font-medium bg-amber-950/40 py-1.5 px-2.5 rounded-xl border border-amber-800/40">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{notFoundTitle}</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {notFoundDesc}
                </p>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="w-full py-2.5 px-3 bg-white hover:bg-zinc-200 text-black text-xs font-mono uppercase tracking-wider font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
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
              </div>
            )}
          </div>

          {/* Quick Create Footer if typing text that doesn't have an exact match */}
          {searchQuery.trim() && filteredOptions.length > 0 && (
            <div className="p-2 border-t border-white/[0.06] bg-black/40">
              <button
                type="button"
                onClick={handleCreate}
                disabled={isCreating}
                className="w-full py-2 px-3 bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.08] text-xs font-mono uppercase tracking-wider font-semibold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
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
