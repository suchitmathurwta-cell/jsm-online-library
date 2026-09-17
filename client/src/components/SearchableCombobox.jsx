import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, PlusCircle, Check, AlertCircle, Loader2, Trash2 } from 'lucide-react';

export default function SearchableCombobox({
  label,
  value,
  options = [],
  placeholder = "Select or search...",
  searchPlaceholder = "Type to search...",
  type = "genre", // 'genre' | 'subgenre'
  onChange,
  onCreate,
  onDelete,
  disabled = false
}) {
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
      label: opt.label || opt.name_hi || opt.name_en || opt.name || opt.id,
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
    if (window.confirm(`Are you sure you want to delete "${opt.label}"?`)) {
      onDelete(opt.id, opt);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="text-xs font-bold text-stone-800 block mb-1">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={"w-full px-3.5 py-2.5 text-xs border rounded-xl flex items-center justify-between text-left transition shadow-2xs cursor-pointer " + (
          isOpen
            ? "border-[#1d4ed8] ring-2 ring-[#1d4ed8]/20 bg-white"
            : "border-stone-300 hover:border-stone-400 bg-white"
        ) + (disabled ? " opacity-50 cursor-not-allowed bg-stone-50" : "")}
      >
        <span className={"truncate font-medium " + (!selectedOption && !value ? "text-stone-400" : "text-stone-900 font-semibold")}>
          {displayLabel}
        </span>
        <ChevronDown className={"w-4 h-4 text-stone-400 shrink-0 ml-1.5 transition-transform duration-200 " + (isOpen ? "rotate-180 text-[#1d4ed8]" : "")} />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden z-[9999] animate-fadeIn">
          
          {/* Sticky Search Input Box */}
          <div className="p-2.5 border-b border-stone-100 bg-stone-50/90">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/20 outline-hidden text-stone-900 placeholder-stone-400 font-medium"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1 divide-y divide-stone-50">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = selectedOption && selectedOption.id === opt.id;
                return (
                  <div
                    key={opt.id}
                    className={"w-full px-3 py-2 text-xs rounded-lg flex items-center justify-between transition group cursor-pointer " + (
                      isSelected
                        ? "bg-blue-50 text-[#1d4ed8] font-bold"
                        : "text-stone-700 hover:bg-stone-50 font-normal"
                    )}
                    onClick={() => {
                      onChange(opt.id, opt);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                  >
                    <span className="truncate flex-1">{opt.label}</span>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {isSelected && <Check className="w-4 h-4 text-[#1d4ed8]" />}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteItem(e, opt)}
                          title="Delete option"
                          className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition"
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
                <div className="flex items-center justify-center gap-1.5 text-xs text-amber-700 font-semibold bg-amber-50 py-1.5 px-2.5 rounded-lg border border-amber-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{type === "genre" ? "Genre not found" : "Sub-Genre not found"}</span>
                </div>
                <p className="text-xs text-stone-500">
                  No existing {type === "genre" ? "genre" : "sub-genre"} matches "{searchQuery}".
                </p>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="w-full py-2.5 px-3 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      <span>+ Create "{searchQuery.trim()}"</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Quick Create Footer if typing text that doesn't have an exact match */}
          {searchQuery.trim() && filteredOptions.length > 0 && (
            <div className="p-2 border-t border-stone-100 bg-stone-50/70">
              <button
                type="button"
                onClick={handleCreate}
                disabled={isCreating}
                className="w-full py-2 px-3 bg-white hover:bg-blue-50 text-[#1d4ed8] hover:text-[#1e40af] border border-blue-200/80 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs disabled:opacity-50"
              >
                {isCreating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <PlusCircle className="w-3.5 h-3.5" />
                )}
                <span>+ Create "{searchQuery.trim()}"</span>
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
