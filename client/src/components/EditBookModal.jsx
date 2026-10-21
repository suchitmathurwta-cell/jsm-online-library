import React, { useState, useRef } from 'react';
import { X, Save, Trash2, Sparkles, BookOpen, AlertTriangle, Loader2 } from 'lucide-react';
import { updateBookRecord, deleteBookRecord } from '../services/supabaseApi';
import {
  transliterateAll,
  clientSideTransliterateFallback,
  enforceScript
} from '../services/transliterationService';

export default function EditBookModal({
  book,
  categories = [],
  isOpen,
  onClose,
  onSuccess,
  onDelete,
  lang = 'hi',
  t
}) {
  if (!isOpen || !book) return null;

  const eb = t?.editBook || {};

  const [formData, setFormData] = useState({
    title_hi: book.title_hi || '',
    title_en: book.title_en || '',
    title_ur: book.title_ur || '',
    author_hi: book.author_hi || '',
    author_en: book.author_en || '',
    author_ur: book.author_ur || '',
    category: book.category || 'novel',
    genre: book.genre || '',
    subgenre: book.subgenre || '',
    language: book.language || 'Hindi',
    era: book.era || '',
    year: book.year || '',
    pages: book.pages || '',
    publisher: book.publisher || '',
    description: book.description || '',
    is_featured: !!book.is_featured,
    cover_url: book.cover_url || '',
    file_url: book.file_url || ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [translatingField, setTranslatingField] = useState(null);
  const titleTimeoutRef = useRef(null);
  const authorTimeoutRef = useRef(null);

  const selectedCategoryObj = categories.find((c) => c.id === formData.category);
  const availableGenres = selectedCategoryObj?.genres || [];
  const selectedGenreObj = availableGenres.find(
    (g) =>
      g.id === formData.genre ||
      g.name_en === formData.genre ||
      g.name_hi === formData.genre ||
      g.name_ur === formData.genre
  );
  const availableSubgenres = selectedGenreObj?.subgenres || [];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Non-destructive trilingual auto-translate:
   * 1. Immediately updates the active input (`boxLang`)
   * 2. Synchronously populates the OTHER two scripts (0ms latency)
   * 3. Refines the OTHER two scripts via async API after 300ms without ever overwriting `boxLang`
   */
  const handleFieldInput = (fieldBase, boxLang, val) => {
    const activeFieldKey = `${fieldBase}_${boxLang}`;
    const timeoutRef = fieldBase === 'title' ? titleTimeoutRef : authorTimeoutRef;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const trimmed = (val || '').trim();
    if (!trimmed) {
      setFormData((prev) => ({ ...prev, [activeFieldKey]: val }));
      setTranslatingField(null);
      return;
    }

    const syncTrans = clientSideTransliterateFallback(trimmed);
    const syncUpdates = { [activeFieldKey]: val };
    if (boxLang !== 'hi') syncUpdates[`${fieldBase}_hi`] = enforceScript(syncTrans.hi, 'hi');
    if (boxLang !== 'en') syncUpdates[`${fieldBase}_en`] = enforceScript(syncTrans.en, 'en');
    if (boxLang !== 'ur') syncUpdates[`${fieldBase}_ur`] = enforceScript(syncTrans.ur, 'ur');

    setFormData((prev) => ({ ...prev, ...syncUpdates }));

    if (trimmed.length < 2) return;

    setTranslatingField(fieldBase);
    timeoutRef.current = setTimeout(async () => {
      try {
        const trans = await transliterateAll(trimmed, boxLang);
        if (trans) {
          setFormData((prev) => {
            if ((prev[activeFieldKey] || '').trim() !== trimmed) return prev;
            const asyncUpdates = {};
            if (boxLang !== 'hi' && trans.hi) asyncUpdates[`${fieldBase}_hi`] = trans.hi;
            if (boxLang !== 'en' && trans.en) asyncUpdates[`${fieldBase}_en`] = trans.en;
            if (boxLang !== 'ur' && trans.ur) asyncUpdates[`${fieldBase}_ur`] = trans.ur;
            return { ...prev, ...asyncUpdates };
          });
        }
      } catch (e) {
        console.warn('Auto-transliteration error in edit:', e);
      } finally {
        setTranslatingField(null);
      }
    }, 300);
  };

  const handleExplicitAutoFill = async (fieldBase) => {
    const hiVal = (formData[`${fieldBase}_hi`] || '').trim();
    const enVal = (formData[`${fieldBase}_en`] || '').trim();
    const urVal = (formData[`${fieldBase}_ur`] || '').trim();

    const sourceText = hiVal || enVal || urVal;
    const sourceLang = hiVal ? 'hi' : enVal ? 'en' : urVal ? 'ur' : 'en';
    if (!sourceText) return;

    setTranslatingField(fieldBase);
    try {
      const trans = await transliterateAll(sourceText, sourceLang);
      if (trans) {
        setFormData((prev) => ({
          ...prev,
          [`${fieldBase}_hi`]: trans.hi || prev[`${fieldBase}_hi`],
          [`${fieldBase}_en`]: trans.en || prev[`${fieldBase}_en`],
          [`${fieldBase}_ur`]: trans.ur || prev[`${fieldBase}_ur`]
        }));
      }
    } catch (e) {
      console.warn('Explicit auto-translate failed:', e);
    } finally {
      setTranslatingField(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title_hi.trim() && !formData.title_en.trim() && !formData.title_ur.trim()) {
      setErrorMsg('Book title is required');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');
    try {
      let finalTitleHi = formData.title_hi.trim();
      let finalTitleEn = formData.title_en.trim();
      let finalTitleUr = formData.title_ur.trim();
      const anyTitle = finalTitleHi || finalTitleEn || finalTitleUr;
      if (anyTitle && (!finalTitleHi || !finalTitleEn || !finalTitleUr)) {
        const trans = await transliterateAll(anyTitle);
        finalTitleHi = finalTitleHi || trans.hi || anyTitle;
        finalTitleEn = finalTitleEn || trans.en || anyTitle;
        finalTitleUr = finalTitleUr || trans.ur || anyTitle;
      }

      let finalAuthorHi = formData.author_hi.trim();
      let finalAuthorEn = formData.author_en.trim();
      let finalAuthorUr = formData.author_ur.trim();
      const anyAuthor = finalAuthorHi || finalAuthorEn || finalAuthorUr;
      if (anyAuthor && (!finalAuthorHi || !finalAuthorEn || !finalAuthorUr)) {
        const trans = await transliterateAll(anyAuthor);
        finalAuthorHi = finalAuthorHi || trans.hi || anyAuthor;
        finalAuthorEn = finalAuthorEn || trans.en || anyAuthor;
        finalAuthorUr = finalAuthorUr || trans.ur || anyAuthor;
      }

      const payload = {
        ...formData,
        title_hi: finalTitleHi,
        title_en: finalTitleEn,
        title_ur: finalTitleUr,
        author_hi: finalAuthorHi,
        author_en: finalAuthorEn,
        author_ur: finalAuthorUr,
        pages: formData.pages ? parseInt(formData.pages) : null,
        year: formData.year ? parseInt(formData.year) : null
      };
      await updateBookRecord(book.id, payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating book:', err);
      setErrorMsg(err.message || 'Failed to update book metadata');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBookRecord(book.id);
      if (onDelete) onDelete(book.id);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error deleting book:', err);
      setErrorMsg(err.message || 'Failed to delete book');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 my-auto overflow-hidden animate-in zoom-in-95 duration-200 text-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-[#1d4ed8] text-white shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-stone-900 font-rekhta-serif truncate">
                {eb.title || 'Edit Book Metadata'}
              </h2>
              <p className="text-xs text-stone-500 font-medium truncate max-w-md">
                {book.title_hi || book.title_en}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-xl transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Titles in 3 Languages */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="font-bold text-stone-700 block">
                {eb.title || 'Book Title'} ({lang === 'hi' ? 'हिंदी • English • اردو' : lang === 'ur' ? 'ہندی • انگریزی • اردو' : 'Hindi • English • Urdu'})
              </label>
              <div className="flex items-center gap-2">
                {translatingField === 'title' && (
                  <span className="text-[10.5px] text-[#1d4ed8] flex items-center gap-1 font-semibold animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Transliterating...</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleExplicitAutoFill('title')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1d4ed8] border border-blue-200 text-[10.5px] font-bold transition cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{lang === 'hi' ? 'ऑटो-अनुवाद' : lang === 'ur' ? 'خودکار ترجمہ' : 'Auto-Translate'}</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="relative">
                <input
                  type="text"
                  placeholder={eb.titleHi || 'Title (Hindi) *'}
                  value={formData.title_hi}
                  onChange={(e) => handleFieldInput('title', 'hi', e.target.value)}
                  className="w-full pl-3 pr-11 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden font-hindi-serif text-stone-900"
                />
                <span className="absolute top-2.5 right-2 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded pointer-events-none">HIN</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder={eb.titleEn || 'Title (English)'}
                  value={formData.title_en}
                  onChange={(e) => handleFieldInput('title', 'en', e.target.value)}
                  className="w-full pl-3 pr-11 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden text-stone-900"
                />
                <span className="absolute top-2.5 right-2 text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-1.5 py-0.5 rounded pointer-events-none">ENG</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder={eb.titleUr || 'Title (Urdu)'}
                  value={formData.title_ur}
                  onChange={(e) => handleFieldInput('title', 'ur', e.target.value)}
                  dir="rtl"
                  className="w-full pr-3 pl-11 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden font-urdu text-right text-stone-900"
                />
                <span className="absolute top-2.5 left-2 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded pointer-events-none">URD</span>
              </div>
            </div>
          </div>

          {/* Authors in 3 Languages */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="font-bold text-stone-700 block">
                {eb.author || 'Author Name'} ({lang === 'hi' ? 'हिंदी • English • اردو' : lang === 'ur' ? 'ہندی • انگریزی • اردو' : 'Hindi • English • Urdu'})
              </label>
              <div className="flex items-center gap-2">
                {translatingField === 'author' && (
                  <span className="text-[10.5px] text-[#1d4ed8] flex items-center gap-1 font-semibold animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Transliterating...</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleExplicitAutoFill('author')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1d4ed8] border border-blue-200 text-[10.5px] font-bold transition cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{lang === 'hi' ? 'ऑटो-अनुवाद' : lang === 'ur' ? 'خودکار ترجمہ' : 'Auto-Translate'}</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="relative">
                <input
                  type="text"
                  placeholder={eb.authorHi || 'Author Name (Hindi) *'}
                  value={formData.author_hi}
                  onChange={(e) => handleFieldInput('author', 'hi', e.target.value)}
                  className="w-full pl-3 pr-11 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden font-hindi-serif text-stone-900"
                />
                <span className="absolute top-2.5 right-2 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded pointer-events-none">HIN</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder={eb.authorEn || 'Author Name (English)'}
                  value={formData.author_en}
                  onChange={(e) => handleFieldInput('author', 'en', e.target.value)}
                  className="w-full pl-3 pr-11 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden text-stone-900"
                />
                <span className="absolute top-2.5 right-2 text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-1.5 py-0.5 rounded pointer-events-none">ENG</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder={eb.authorUr || 'Author Name (Urdu)'}
                  value={formData.author_ur}
                  onChange={(e) => handleFieldInput('author', 'ur', e.target.value)}
                  dir="rtl"
                  className="w-full pr-3 pl-11 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden font-urdu text-right text-stone-900"
                />
                <span className="absolute top-2.5 left-2 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded pointer-events-none">URD</span>
              </div>
            </div>
          </div>

          {/* Hierarchy Drilldown: Category, Genre, Sub-Genre */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-100">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                {eb.category || 'Category (Layer 1)'}
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const newCat = e.target.value;
                  const catObj = categories.find((c) => c.id === newCat);
                  const firstGenre = catObj?.genres?.[0];
                  const firstSub = firstGenre?.subgenres?.[0];
                  setFormData((prev) => ({
                    ...prev,
                    category: newCat,
                    genre: firstGenre ? (firstGenre.name_hi || firstGenre.name_en || firstGenre.id) : prev.genre,
                    subgenre: firstSub ? (firstSub.name_hi || firstSub.name_en || firstSub.id) : prev.subgenre
                  }));
                }}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden cursor-pointer text-stone-900"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c[`name_${lang}`] || c.name_hi || c.name_en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                {eb.genre || 'Genre (Layer 2)'}
              </label>
              {availableGenres.length > 0 ? (
                <select
                  value={formData.genre}
                  onChange={(e) => handleInputChange('genre', e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden cursor-pointer text-stone-900"
                >
                  <option value={formData.genre}>{formData.genre || 'Select Genre'}</option>
                  {availableGenres.map((g) => {
                    const label = g[`name_${lang}`] || g.name_hi || g.name_en;
                    return (
                      <option key={g.id} value={g.name_hi || g.name_en || g.id}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.genre}
                  onChange={(e) => handleInputChange('genre', e.target.value)}
                  placeholder="e.g. Social Realism, Ghazal"
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden text-stone-900"
                />
              )}
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                {eb.subgenre || 'Sub-Genre (Layer 3)'}
              </label>
              {availableSubgenres.length > 0 ? (
                <select
                  value={formData.subgenre}
                  onChange={(e) => handleInputChange('subgenre', e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden cursor-pointer text-stone-900"
                >
                  <option value={formData.subgenre}>{formData.subgenre || 'Select Sub-Genre'}</option>
                  {availableSubgenres.map((sg) => {
                    const label = sg[`name_${lang}`] || sg.name_hi || sg.name_en;
                    return (
                      <option key={sg.id} value={sg.name_hi || sg.name_en || sg.id}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.subgenre}
                  onChange={(e) => handleInputChange('subgenre', e.target.value)}
                  placeholder="e.g. Agrarian Struggles"
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden text-stone-900"
                />
              )}
            </div>
          </div>

          {/* Language, Era, Year, Pages */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">{eb.language || 'Language'}</label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden text-stone-900"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">{eb.era || 'Historical Era'}</label>
              <input
                type="text"
                value={formData.era}
                onChange={(e) => handleInputChange('era', e.target.value)}
                placeholder="e.g. Progressive Era (1936)"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden text-stone-900"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">{eb.year || 'Year'}</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => handleInputChange('year', e.target.value)}
                placeholder="e.g. 1936"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden text-stone-900"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">{eb.pages || 'Pages'}</label>
              <input
                type="number"
                value={formData.pages}
                onChange={(e) => handleInputChange('pages', e.target.value)}
                placeholder="e.g. 340"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden text-stone-900"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              {eb.description || 'Description / Synopsis & Cultural Significance'}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows="3"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden leading-relaxed text-stone-900"
            />
          </div>

          {/* Featured Checkbox & Cover Preview */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                className="w-4 h-4 rounded text-[#1d4ed8] focus:ring-[#1d4ed8] border-stone-300 cursor-pointer"
              />
              <span className="font-bold text-stone-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{eb.featureOnHome || 'Feature in prominent homepage collections'}</span>
              </span>
            </label>

            {formData.cover_url && (
              <div className="flex items-center gap-2">
                <img
                  src={formData.cover_url}
                  alt="Cover preview"
                  className="w-8 h-11 object-cover rounded shadow-xs border border-stone-200"
                />
                <span className="text-[11px] text-stone-500 truncate max-w-xs">
                  {eb.coverVerified || 'Cover URL verified'}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-stone-200">
            <div>
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2 bg-red-50 p-1.5 rounded-xl border border-red-200">
                  <span className="text-[11px] font-bold text-red-700 pl-1.5">{eb.deleteConfirm || 'Confirm delete?'}</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[10.5px] transition cursor-pointer"
                  >
                    {isDeleting ? (eb.deleting || '...') : (eb.confirmBtn || 'Confirm')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2 py-1 bg-stone-200 text-stone-700 rounded-lg text-[10.5px] cursor-pointer"
                  >
                    {eb.cancelBtn || 'Cancel'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer font-semibold"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{eb.deleteBook || 'Delete Book'}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-semibold transition cursor-pointer"
              >
                {eb.cancelBtn || 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? (eb.saving || 'Saving...') : (eb.saveBtn || 'Save Metadata')}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
