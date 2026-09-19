import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Trash2, Sparkles, BookOpen, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { updateBookRecord, deleteBookRecord } from '../services/supabaseApi';
import { transliterateAll } from '../services/transliterationService';

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
  const translationTimeoutRef = useRef(null);

  const selectedCategoryObj = categories.find((c) => c.id === formData.category);
  const availableGenres = selectedCategoryObj?.genres || [];
  const selectedGenreObj = availableGenres.find((g) => g.id === formData.genre || g.name_en === formData.genre || g.name_hi === formData.genre);
  const availableSubgenres = selectedGenreObj?.subgenres || [];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAutoTranslateField = (fieldName, text, sourceLanguage) => {
    if (!text || text.trim().length < 2) return;
    if (translationTimeoutRef.current) clearTimeout(translationTimeoutRef.current);

    setTranslatingField(fieldName);
    translationTimeoutRef.current = setTimeout(async () => {
      try {
        const trans = await transliterateAll(text.trim(), sourceLanguage);
        if (trans) {
          setFormData(prev => {
            const updates = {};
            if (fieldName === 'title') {
              if (sourceLanguage !== 'hi') updates.title_hi = trans.hi;
              if (sourceLanguage !== 'en') updates.title_en = trans.en;
              if (sourceLanguage !== 'ur') updates.title_ur = trans.ur;
            } else if (fieldName === 'author') {
              if (sourceLanguage !== 'hi') updates.author_hi = trans.hi;
              if (sourceLanguage !== 'en') updates.author_en = trans.en;
              if (sourceLanguage !== 'ur') updates.author_ur = trans.ur;
            }
            return { ...prev, ...updates };
          });
        }
      } catch (e) {
        console.warn('Auto-transliteration error in edit:', e);
      } finally {
        setTranslatingField(null);
      }
    }, 350);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title_hi.trim() && !formData.title_en.trim()) {
      setErrorMsg('Book title is required');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');
    try {
      const payload = {
        ...formData,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 my-auto overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#1d4ed8] text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 font-rekhta-serif">
                {eb.title || 'Edit Book Metadata'}
              </h2>
              <p className="text-xs text-stone-500 font-medium truncate max-w-md">
                {book.title_hi || book.title_en}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="p-6 max-h-[75vh] overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Titles in 3 Languages */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-stone-700 block">
                {eb.title || 'Book Title'} ({lang === 'hi' ? 'हिंदी • English • اردو' : (lang === 'ur' ? 'ہندی • انگریزی • اردو' : 'Hindi • English • Urdu')})
              </label>
              {translatingField === 'title' && (
                <span className="text-[10.5px] text-[#1d4ed8] flex items-center gap-1 font-semibold animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Transliterating...</span>
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder={eb.titleHi || 'Title (Hindi) *'}
                  value={formData.title_hi}
                  onChange={(e) => {
                    const v = e.target.value;
                    handleInputChange('title_hi', v);
                    handleAutoTranslateField('title', v, 'hi');
                  }}
                  className="w-full pl-3 pr-10 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden font-hindi-serif"
                  required
                />
                <span className="absolute top-2 right-2 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded pointer-events-none">HIN</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder={eb.titleEn || 'Title (English)'}
                  value={formData.title_en}
                  onChange={(e) => {
                    const v = e.target.value;
                    handleInputChange('title_en', v);
                    handleAutoTranslateField('title', v, 'en');
                  }}
                  className="w-full pl-3 pr-10 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden"
                />
                <span className="absolute top-2 right-2 text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-1.5 py-0.5 rounded pointer-events-none">ENG</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder={eb.titleUr || 'Title (Urdu)'}
                  value={formData.title_ur}
                  onChange={(e) => {
                    const v = e.target.value;
                    handleInputChange('title_ur', v);
                    handleAutoTranslateField('title', v, 'ur');
                  }}
                  dir="rtl"
                  className="w-full pr-3 pl-10 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden font-urdu text-right"
                />
                <span className="absolute top-2 left-2 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded pointer-events-none">URD</span>
              </div>
            </div>
          </div>

          {/* Authors in 3 Languages */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-stone-700 block">
                {eb.author || 'Author Name'} ({lang === 'hi' ? 'हिंदी • English • اردو' : (lang === 'ur' ? 'ہندی • انگریزی • اردو' : 'Hindi • English • Urdu')})
              </label>
              {translatingField === 'author' && (
                <span className="text-[10.5px] text-[#1d4ed8] flex items-center gap-1 font-semibold animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Transliterating...</span>
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder={eb.authorHi || 'Author Name (Hindi) *'}
                  value={formData.author_hi}
                  onChange={(e) => {
                    const v = e.target.value;
                    handleInputChange('author_hi', v);
                    handleAutoTranslateField('author', v, 'hi');
                  }}
                  className="w-full pl-3 pr-10 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden font-hindi-serif"
                  required
                />
                <span className="absolute top-2 right-2 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded pointer-events-none">HIN</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder={eb.authorEn || 'Author Name (English)'}
                  value={formData.author_en}
                  onChange={(e) => {
                    const v = e.target.value;
                    handleInputChange('author_en', v);
                    handleAutoTranslateField('author', v, 'en');
                  }}
                  className="w-full pl-3 pr-10 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden"
                />
                <span className="absolute top-2 right-2 text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-1.5 py-0.5 rounded pointer-events-none">ENG</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder={eb.authorUr || 'Author Name (Urdu)'}
                  value={formData.author_ur}
                  onChange={(e) => {
                    const v = e.target.value;
                    handleInputChange('author_ur', v);
                    handleAutoTranslateField('author', v, 'ur');
                  }}
                  dir="rtl"
                  className="w-full pr-3 pl-10 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden font-urdu text-right"
                />
                <span className="absolute top-2 left-2 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded pointer-events-none">URD</span>
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
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden cursor-pointer"
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
              <input
                type="text"
                value={formData.genre}
                onChange={(e) => handleInputChange('genre', e.target.value)}
                placeholder="e.g. Social Realism, Ghazal"
                list="genre-options"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden"
              />
              <datalist id="genre-options">
                {availableGenres.map((g) => (
                  <option key={g.id} value={g[`name_${lang}`] || g.name_hi || g.name_en} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                {eb.subgenre || 'Sub-Genre (Layer 3)'}
              </label>
              <input
                type="text"
                value={formData.subgenre}
                onChange={(e) => handleInputChange('subgenre', e.target.value)}
                placeholder="e.g. Agrarian Struggles"
                list="subgenre-options"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden"
              />
              <datalist id="subgenre-options">
                {availableSubgenres.map((sg) => (
                  <option key={sg.id} value={sg[`name_${lang}`] || sg.name_hi || sg.name_en} />
                ))}
              </datalist>
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
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">{eb.era || 'Historical Era'}</label>
              <input
                type="text"
                value={formData.era}
                onChange={(e) => handleInputChange('era', e.target.value)}
                placeholder="e.g. Progressive Era (1936)"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">{eb.year || 'Year'}</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => handleInputChange('year', e.target.value)}
                placeholder="e.g. 1936"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">{eb.pages || 'Pages'}</label>
              <input
                type="number"
                value={formData.pages}
                onChange={(e) => handleInputChange('pages', e.target.value)}
                placeholder="e.g. 340"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden"
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
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden leading-relaxed"
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
          <div className="flex items-center justify-between pt-4 border-t border-stone-200">
            <div>
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2 bg-red-50 p-1.5 rounded-xl border border-red-200">
                  <span className="text-[11px] font-bold text-red-700 pl-1.5">{eb.deleteConfirm || 'Confirm delete?'}</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[10.5px] transition"
                  >
                    {isDeleting ? (eb.deleting || '...') : (eb.confirmBtn || 'Confirm')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2 py-1 bg-stone-200 text-stone-700 rounded-lg text-[10.5px]"
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
