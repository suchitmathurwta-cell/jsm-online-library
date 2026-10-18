import React, { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Sparkles,
  Plus,
  Layers,
  ChevronRight,
  ChevronLeft,
  FolderTree,
  FolderOpen
} from 'lucide-react';
import SearchableCombobox from './SearchableCombobox';
import { getCategoriesWithHierarchy, uploadBookFile, createBookRecord, createFormat, deleteFormat, createGenre, deleteGenre, createSubgenre, deleteSubgenre } from '../services/supabaseApi';
import { DEFAULT_CATEGORIES } from '../data/categoriesData';
import { translations, getLocalizedEra } from '../locales/translations';
import { transliterateAll, detectLanguage, getTrilingualNames } from '../services/transliterationService';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const HISTORICAL_ERA_KEYS = [
  "contemporary",
  "post-independence",
  "progressive",
  "chhayavad",
  "dwivedi",
  "bharatendu",
  "late mughal",
  "bhakti",
  "classical"
];

export default function UploadBookModal({
  isOpen,
  onClose,
  onBookUploaded,
  onCategoryCreated,
  onSubGenreCreated,
  categories = [],
  lang = 'hi',
  t
}) {
  const tr = t || translations[lang] || translations.hi;
  const u = tr.upload;
  const a = tr.admin;

  const [fileQueue, setFileQueue] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [allCategories, setAllCategories] = useState(
    categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES
  );
  const [translatingField, setTranslatingField] = useState(null);

  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const translationTimeoutRef = useRef(null);

  const fetchUpdatedCategories = async () => {
    try {
      const data = await getCategoriesWithHierarchy();
      if (data && data.length > 0) {
        setAllCategories(data);
      }
    } catch (e) {
      console.warn('Error fetching categories in UploadBookModal:', e);
    }
  };

  useEffect(() => {
    if (categories && categories.length > 0) {
      setAllCategories(categories);
    } else {
      fetchUpdatedCategories();
    }
  }, [categories, isOpen]);

  if (!isOpen) return null;

  const processSinglePdf = async (file) => {
    let cleanName = file.name.replace(/\.(pdf|epub)$/i, '');
    
    // 1. Remove trailing scan/copy indicators like (1), (2), -cs, _cs, -scan
    cleanName = cleanName.replace(/\s*\(\d+\)$/g, '');
    cleanName = cleanName.replace(/[-_]cs$/i, '');
    cleanName = cleanName.replace(/[-_]scan$/i, '');

    // 2. Extract Year if present at the end (e.g. -1976 or _1976 or 1976)
    let extractedYear = new Date().getFullYear().toString();
    const yearMatch = cleanName.match(/[-_\s]+(1[89]\d\d|20\d\d)$/);
    if (yearMatch) {
      extractedYear = yearMatch[1];
      cleanName = cleanName.replace(/[-_\s]+(1[89]\d\d|20\d\d)$/, '');
    }

    let extractedTitle = cleanName;
    let extractedAuthor = '';

    if (/\bby\b/i.test(cleanName)) {
      const parts = cleanName.split(/\bby\b/i);
      extractedTitle = parts[0].replace(/[-_]+/g, ' ').trim();
      extractedAuthor = parts.slice(1).join(' by ').replace(/[-_]+/g, ' ').trim();
    } else if (cleanName.includes('-')) {
      const parts = cleanName.split('-');
      if (parts.length >= 2) {
        extractedTitle = parts[0].replace(/[-_]+/g, ' ').trim();
        extractedAuthor = parts.slice(1).join(' ').replace(/[-_]+/g, ' ').trim();
      }
    } else {
      extractedTitle = cleanName.replace(/[-_]+/g, ' ').trim();
    }

    const catsList = (allCategories && allCategories.length > 0) ? allCategories : DEFAULT_CATEGORIES;
    const defaultFormat = catsList[0] || { id: 'novel', genres: [] };
    const defaultGenre = defaultFormat.genres?.[0] || { id: 'social-realism', subgenres: [] };
    const defaultSub = defaultGenre.subgenres?.[0] || { id: 'general' };

    const detectedLang = detectLanguage(extractedTitle);

    const item = {
      file,
      fileName: file.name,
      title_hi: '',
      title_en: '',
      title_ur: '',
      author_hi: '',
      author_en: extractedAuthor || '',
      author_ur: '',
      category: defaultFormat.id, // Format
      genre: defaultGenre.id, // Genre
      subgenre: defaultSub.id, // Subgenre
      era: 'contemporary',
      year: extractedYear,
      publisher: lang === 'hi' ? 'जेएसएम ऑनलाइन लाइब्रेरी' : (lang === 'ur' ? 'جے ایس ایم آن لائن لائبریری' : 'JSM Online Library'),
      description: '',
      description_en: '',
      coverFile: null,
      coverPreview: null,
      pages: 50,
      is_featured: false
    };

    // Extract Cover from PDF Page 1 if PDF
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        item.pages = pdf.numPages;

        const page1 = await pdf.getPage(1);
        const viewport = page1.getViewport({ scale: 0.6 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page1.render({ canvasContext: ctx, viewport }).promise;
        item.coverPreview = canvas.toDataURL('image/jpeg', 0.85);
      } catch (e) {
        console.warn('PDF thumbnail extraction notice:', e);
      }
    }

    // Auto-transliterate Title across all 3 languages
    try {
      const titleTrans = await transliterateAll(extractedTitle, detectedLang);
      if (titleTrans) {
        item.title_hi = titleTrans.hi || extractedTitle;
        item.title_en = titleTrans.en || extractedTitle;
        item.title_ur = titleTrans.ur || extractedTitle;
      }
    } catch (e) {
      console.warn('Title transliteration notice:', e);
      item.title_hi = extractedTitle;
      item.title_en = extractedTitle;
      item.title_ur = extractedTitle;
    }

    // Auto-transliterate Author if extracted
    if (extractedAuthor) {
      try {
        const authorLang = detectLanguage(extractedAuthor);
        const authorTrans = await transliterateAll(extractedAuthor, authorLang);
        if (authorTrans) {
          item.author_hi = authorTrans.hi || extractedAuthor;
          item.author_en = authorTrans.en || extractedAuthor;
          item.author_ur = authorTrans.ur || extractedAuthor;
        }
      } catch (e) {
        console.warn('Author transliteration notice:', e);
        item.author_hi = extractedAuthor;
        item.author_en = extractedAuthor;
        item.author_ur = extractedAuthor;
      }
    }

    return item;
  };

  const handleSelectFiles = async (e) => {
    const files = Array.from(e.target.files || []).filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf') || f.name.toLowerCase().endsWith('.epub') || (f.type && f.type.includes('epub')));
    if (files.length === 0) return;

    setStatusMessage({ type: 'info', text: lang === 'hi' ? `${files.length} PDF फ़ाइलों का विश्लेषण हो रहा है...` : (lang === 'ur' ? `${files.length} فائلوں کی جانچ ہو رہی ہے...` : `Analyzing ${files.length} PDF files...`) });
    const newItems = [];
    for (const file of files) {
      const itm = await processSinglePdf(file);
      newItems.push(itm);
    }

    setFileQueue(prev => [...prev, ...newItems]);
    setStatusMessage({ type: '', text: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []).filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf') || f.name.toLowerCase().endsWith('.epub') || (f.type && f.type.includes('epub')));
    if (files.length === 0) return;

    setStatusMessage({ type: 'info', text: lang === 'hi' ? `${files.length} PDF फ़ाइलों का विश्लेषण हो रहा है...` : (lang === 'ur' ? `${files.length} فائلوں کی جانچ ہو رہی ہے...` : `Analyzing ${files.length} PDF files...`) });
    const newItems = [];
    for (const file of files) {
      const itm = await processSinglePdf(file);
      newItems.push(itm);
    }

    setFileQueue(prev => [...prev, ...newItems]);
    setStatusMessage({ type: '', text: '' });
  };

  const handleRemoveFromQueue = (index, e) => {
    e.stopPropagation();
    setFileQueue(prev => {
      const next = prev.filter((_, i) => i !== index);
      if (selectedIndex >= next.length) {
        setSelectedIndex(Math.max(0, next.length - 1));
      }
      return next;
    });
  };

  const updateCurrentItem = (updates) => {
    setFileQueue(prev => {
      const next = [...prev];
      if (next[selectedIndex]) {
        next[selectedIndex] = { ...next[selectedIndex], ...updates };
      }
      return next;
    });
  };

  const currentItem = fileQueue[selectedIndex];

  const handleAutoTranslateField = (fieldName, text, sourceLanguage, immediate = false) => {
    if (!text || text.trim().length < 1) return;
    if (translationTimeoutRef.current) clearTimeout(translationTimeoutRef.current);

    const execute = async () => {
      setTranslatingField(fieldName);
      try {
        const trans = await transliterateAll(text.trim(), sourceLanguage);
        if (trans) {
          const updates = {};
          if (fieldName === 'title') {
            if (sourceLanguage !== 'hi' || !currentItem?.title_hi) updates.title_hi = trans.hi;
            if (sourceLanguage !== 'en' || !currentItem?.title_en) updates.title_en = trans.en;
            if (sourceLanguage !== 'ur' || !currentItem?.title_ur) updates.title_ur = trans.ur;
          } else if (fieldName === 'author') {
            if (sourceLanguage !== 'hi' || !currentItem?.author_hi) updates.author_hi = trans.hi;
            if (sourceLanguage !== 'en' || !currentItem?.author_en) updates.author_en = trans.en;
            if (sourceLanguage !== 'ur' || !currentItem?.author_ur) updates.author_ur = trans.ur;
          }
          updateCurrentItem(updates);
        }
      } catch (e) {
        console.warn('Auto-transliteration error:', e);
      } finally {
        setTranslatingField(null);
      }
    };

    if (immediate) {
      execute();
    } else {
      setTranslatingField(fieldName);
      translationTimeoutRef.current = setTimeout(execute, 150);
    }
  };

  const handleCustomCover = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateCurrentItem({
        coverFile: file,
        coverPreview: ev.target?.result
      });
    };
    reader.readAsDataURL(file);
  };

  const catsList = (allCategories && allCategories.length > 0) ? allCategories : DEFAULT_CATEGORIES;

  // Format options
  const formatOptions = catsList.map(c => ({
    id: c.id,
    label: c['name_' + lang] || c.name_hi || c.name_en || c.id,
    name_hi: c.name_hi,
    name_en: c.name_en,
    raw: c
  }));

  // Active format object
  const activeFormatObj = catsList.find(c => c.id === currentItem?.category) || catsList[0];

  // Genre options conditional on active format
  const availableGenres = (activeFormatObj?.genres && activeFormatObj.genres.length > 0)
    ? activeFormatObj.genres
    : (DEFAULT_CATEGORIES.find(c => c.id === (activeFormatObj?.id || currentItem?.category))?.genres || []);

  const genreOptions = availableGenres.map(g => ({
    id: g.id,
    label: g['name_' + lang] || g.name_hi || g.name_en || g.id,
    name_hi: g.name_hi,
    name_en: g.name_en,
    raw: g
  }));

  // Active genre object
  const activeGenreObj = availableGenres.find(g => g.id === currentItem?.genre) || availableGenres[0];

  // Subgenre options conditional on active genre
  const availableSubgenres = (activeGenreObj?.subgenres && activeGenreObj.subgenres.length > 0)
    ? activeGenreObj.subgenres
    : (DEFAULT_CATEGORIES.find(c => c.id === activeFormatObj?.id)?.genres?.find(g => g.id === activeGenreObj?.id)?.subgenres || []);

  const subgenreOptions = availableSubgenres.map(sg => ({
    id: sg.id,
    label: sg['name_' + lang] || sg.name_hi || sg.name_en || sg.name || sg.id,
    name_hi: sg.name_hi,
    name_en: sg.name_en,
    raw: sg
  }));

  // Hierarchy Handlers with Supabase sync and immediate UI responsiveness
  const handleCreateFormat = async (name) => {
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || ('fmt-' + Date.now());
    const { name_en, name_hi, name_ur } = await getTrilingualNames(name);
    try {
      await createFormat({ id, name_hi: name_hi || name, name_en: name_en || name, name_ur });
    } catch (e) {
      console.warn('createFormat DB notice:', e);
    }
    const newFormat = { id, name_hi: name_hi || name, name_en: name_en || name, name_ur, genres: [] };
    setAllCategories(prev => [...prev, newFormat]);
    updateCurrentItem({ category: id, genre: '', subgenre: '' });
  };

  const handleDeleteFormat = async (id) => {
    try {
      await deleteFormat(id);
    } catch (e) {
      console.warn('deleteFormat DB notice:', e);
    }
    setAllCategories(prev => prev.filter(c => c.id !== id));
  };

  const handleCreateGenre = async (name) => {
    const catId = currentItem?.category || activeFormatObj?.id;
    if (!catId) return;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || ('gnr-' + Date.now());
    const { name_en, name_hi, name_ur } = await getTrilingualNames(name);
    try {
      await createGenre({ id, category_id: catId, name_hi: name_hi || name, name_en: name_en || name, name_ur });
    } catch (e) {
      console.warn('createGenre DB notice:', e);
    }
    const newGenre = { id, category_id: catId, name_hi: name_hi || name, name_en: name_en || name, name_ur, subgenres: [] };
    setAllCategories(prev => prev.map(c => {
      if (c.id === catId) {
        return { ...c, genres: [...(c.genres || []), newGenre] };
      }
      return c;
    }));
    updateCurrentItem({ genre: id, subgenre: '' });
  };

  const handleDeleteGenre = async (id) => {
    const catId = currentItem?.category || activeFormatObj?.id;
    try {
      await deleteGenre(catId, id);
    } catch (e) {
      console.warn('deleteGenre DB notice:', e);
    }
    setAllCategories(prev => prev.map(c => {
      if (c.id === catId) {
        return { ...c, genres: (c.genres || []).filter(g => g.id !== id) };
      }
      return c;
    }));
  };

  const handleCreateSubGenre = async (name) => {
    const catId = currentItem?.category || activeFormatObj?.id;
    const gnrId = currentItem?.genre || activeGenreObj?.id || 'general';
    if (!catId) return;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || ('sub-' + Date.now());
    const { name_en, name_hi, name_ur } = await getTrilingualNames(name);
    try {
      await createSubgenre({
        id,
        category_id: catId,
        genre_id: gnrId,
        name_hi: name_hi || name,
        name_en: name_en || name,
        name_ur
      });
    } catch (e) {
      console.warn('createSubgenre DB notice:', e);
    }
    const newSub = { id, category_id: catId, genre_id: gnrId, name_hi: name_hi || name, name_en: name_en || name, name_ur };
    setAllCategories(prev => prev.map(c => {
      if (c.id === catId) {
        return {
          ...c,
          genres: (c.genres || []).map(g => {
            if (g.id === gnrId) {
              return { ...g, subgenres: [...(g.subgenres || []), newSub] };
            }
            return g;
          })
        };
      }
      return c;
    }));
    updateCurrentItem({ subgenre: id });
  };

  const handleDeleteSubGenre = async (id) => {
    const catId = currentItem?.category || activeFormatObj?.id;
    const gnrId = currentItem?.genre || activeGenreObj?.id;
    try {
      await deleteSubgenre(catId, gnrId, id);
    } catch (e) {
      console.warn('deleteSubgenre DB notice:', e);
    }
    setAllCategories(prev => prev.map(c => {
      if (c.id === catId) {
        return {
          ...c,
          genres: (c.genres || []).map(g => {
            if (g.id === gnrId) {
              return { ...g, subgenres: (g.subgenres || []).filter(s => s.id !== id) };
            }
            return g;
          })
        };
      }
      return c;
    }));
  };

  // Submission handler
  const handleSubmitAll = async () => {
    if (fileQueue.length === 0) return;

    for (let i = 0; i < fileQueue.length; i++) {
      const item = fileQueue[i];
      if (!item.title_hi && !item.title_en && !item.title_ur) {
        setStatusMessage({
          type: 'error',
          text: lang === 'hi' ? `फ़ाइल #${i + 1} (${item.fileName}) में शीर्षक भरना आवश्यक है!` : (lang === 'ur' ? `فائل نمبر ${i + 1} کے لیے عنوان درکار ہے!` : `File #${i + 1} (${item.fileName}) is missing a title!`)
        });
        setSelectedIndex(i);
        return;
      }
    }

    setIsSubmitting(true);
    setUploadProgress(5);
    setStatusMessage({ type: 'info', text: u.uploading });

    let successCount = 0;

    for (let i = 0; i < fileQueue.length; i++) {
      const item = fileQueue[i];
      try {
        let pdfPublicUrl = '';
        let coverPublicUrl = '';

        try {
          const pdfRes = await uploadBookFile(item.file, 'books');
          pdfPublicUrl = typeof pdfRes === 'string' ? pdfRes : (pdfRes?.publicUrl || '');
        } catch (storageErr) {
          console.warn('Storage upload fallback:', storageErr);
        }

        if (item.coverFile) {
          try {
            const coverRes = await uploadBookFile(item.coverFile, 'covers');
            coverPublicUrl = typeof coverRes === 'string' ? coverRes : (coverRes?.publicUrl || '');
          } catch (covErr) {
            console.warn('Cover upload notice:', covErr);
          }
        } else if (item.coverPreview && item.coverPreview.startsWith('data:')) {
          try {
            const blobRes = await fetch(item.coverPreview);
            const blob = await blobRes.blob();
            const coverFileFromBlob = new File([blob], `cover_${Date.now()}.jpg`, { type: 'image/jpeg' });
            const coverRes = await uploadBookFile(coverFileFromBlob, 'covers');
            coverPublicUrl = typeof coverRes === 'string' ? coverRes : (coverRes?.publicUrl || '');
          } catch (bErr) {
            console.warn('Blob thumbnail upload notice:', bErr);
          }
        }

        if (!pdfPublicUrl) {
          try {
            const formData = new FormData();
            formData.append('pdf', item.file);
            if (item.coverFile) formData.append('cover', item.coverFile);
            if (item.coverPreview && !item.coverFile) formData.append('coverBase64', item.coverPreview);
            formData.append('title_hi', item.title_hi || item.title_en || item.fileName);
            formData.append('title_en', item.title_en || item.title_hi || item.fileName);
            formData.append('title_ur', item.title_ur || item.title_hi || item.title_en);
            formData.append('author_hi', item.author_hi || item.author_en || '');
            formData.append('author_en', item.author_en || item.author_hi || '');
            formData.append('author_ur', item.author_ur || item.author_hi || '');
            formData.append('category', item.category || 'novel');
            formData.append('genre', item.genre || 'general');
            formData.append('subgenre', item.subgenre || 'general');
            formData.append('era', getLocalizedEra(item.era, 'en'));
            formData.append('year', item.year || new Date().getFullYear().toString());
            formData.append('publisher', item.publisher || 'JSM Online Library');
            formData.append('pages', parseInt(item.pages) || 50);
            formData.append('description', item.description || '');
            formData.append('is_featured', Boolean(item.is_featured));

            const apiRes = await fetch('/api/books/upload', {
              method: 'POST',
              body: formData
            });
            const apiData = await apiRes.json();
            if (apiData.success && apiData.book) {
              pdfPublicUrl = apiData.book.file_url;
              if (!coverPublicUrl) coverPublicUrl = apiData.book.cover_url;
            }
          } catch (fallbackErr) {
            console.error('Local upload fallback error:', fallbackErr);
          }
        }

        const bookPayload = {
          title_hi: item.title_hi || item.title_en || item.fileName,
          title_en: item.title_en || item.title_hi || item.fileName,
          title_ur: item.title_ur || item.title_hi || item.title_en,
          author_hi: item.author_hi || item.author_en || '',
          author_en: item.author_en || item.author_hi || '',
          author_ur: item.author_ur || item.author_hi || '',
          category: item.category || 'novel',
          genre: item.genre || 'general',
          subgenre: item.subgenre || 'general',
          era: getLocalizedEra(item.era, 'en'),
          year: item.year || new Date().getFullYear().toString(),
          publisher: item.publisher || 'JSM Online Library',
          pages: parseInt(item.pages) || 50,
          description: item.description || '',
          description_en: item.description_en || item.description || '',
          language: 'Hindi & Urdu',
          file_url: pdfPublicUrl || '',
          cover_url: coverPublicUrl || '',
          is_featured: Boolean(item.is_featured),
          downloads_count: 0,
          views_count: 0
        };

        const createdBook = await createBookRecord(bookPayload);
        successCount++;
        if (onBookUploaded) onBookUploaded(createdBook);
      } catch (itemErr) {
        console.error(`Failed to upload item ${i}:`, itemErr);
      }

      setUploadProgress(Math.round(((i + 1) / fileQueue.length) * 100));
    }

    setUploadProgress(100);
    setIsSubmitting(false);

    if (successCount === fileQueue.length) {
      setStatusMessage({ type: 'success', text: u.successMsg });
      setTimeout(() => {
        onClose();
      }, 1400);
    } else {
      setStatusMessage({
        type: 'warning',
        text: lang === 'hi' ? `${successCount}/${fileQueue.length} फ़ाइलें अपलोड हुईं।` : (lang === 'ur' ? `${successCount}/${fileQueue.length} فائلیں محفوظ ہوئیں۔` : `Uploaded ${successCount} of ${fileQueue.length} files.`)
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
      <div className="bg-[#121212]/95 backdrop-blur-xl border border-white/[0.1] rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-fadeIn text-[#FAFAFA] font-sans shadow-2xl">
        
        {/* 1. Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#141414] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] text-white flex items-center justify-center border border-white/[0.08] shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg tracking-tight font-sans">
                {u.modalTitle}
              </h3>
              <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">
                {u.modalSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Notification Bar */}
        {statusMessage.text && (
          <div className={"px-6 py-2.5 text-xs font-semibold flex items-center justify-between border-b " + (
            statusMessage.type === 'error' ? 'bg-red-500/10 text-red-300 border-red-500/20' :
            statusMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' :
            statusMessage.type === 'warning' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' :
            'bg-white/[0.06] text-zinc-300 border-white/[0.08]'
          )}>
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
              {statusMessage.type === 'info' && <Loader2 className="w-4 h-4 text-white animate-spin" />}
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage({ type: '', text: '' })} className="text-zinc-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 2. Main Two-Column Body Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Column: Upload Queue & File Dropzone */}
          <div className="w-full md:w-72 lg:w-80 border-r border-white/[0.08] bg-[#0E0E0E] flex flex-col shrink-0">
            <div className="p-3.5 border-b border-white/[0.08] flex items-center justify-between bg-[#141414]">
              <span className="text-xs font-mono font-bold text-zinc-400 tracking-wider uppercase">
                {u.queueHeader} ({fileQueue.length})
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 hover:text-white text-xs font-mono uppercase tracking-wider rounded-lg border border-white/[0.08] flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{u.addMoreFiles}</span>
              </button>
            </div>

            {/* Dropzone Area */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={"m-3 p-4 border-2 border-dashed rounded-2xl text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 " + (
                isDragging
                  ? "border-white/50 bg-white/[0.08] scale-[0.99]"
                  : "border-white/[0.15] hover:border-white/[0.3] hover:bg-white/[0.04] bg-white/[0.02]"
              )}
            >
              <Upload className="w-6 h-6 text-zinc-400" />
              <div className="text-xs font-bold text-zinc-200">
                {u.dragDrop}
              </div>
              <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                .PDF, .EPUB (Drag & Drop)
              </div>
            </div>

            {/* Scrollable File List */}
            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5 divide-y divide-white/[0.04]">
              {fileQueue.length === 0 ? (
                <div className="text-center py-8 text-xs text-zinc-500 font-mono italic">
                  {u.queueEmpty}
                </div>
              ) : (
                fileQueue.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedIndex(idx)}
                      className={"p-2.5 rounded-xl text-xs flex items-center justify-between gap-2 transition cursor-pointer border " + (
                        isSelected
                          ? "bg-white/[0.08] border-white/[0.2] shadow-xs font-semibold text-white"
                          : "bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.06] text-zinc-400 hover:text-zinc-200"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-10 bg-[#161616] rounded-md border border-white/[0.08] flex items-center justify-center shrink-0 overflow-hidden">
                          {item.coverPreview ? (
                            <img src={item.coverPreview} alt="Cover" className="w-full h-full object-cover" />
                          ) : (
                            <FileText className="w-4 h-4 text-zinc-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs text-white font-hindi-serif">
                            {item['title_' + lang] || item.title_hi || item.title_en || item.fileName}
                          </p>
                          <span className="text-[10px] text-zinc-500 font-mono block truncate">
                            {item.pages} {tr.card.pagesUnit} • {item['author_' + lang] || item.author_hi || item.author_en || ''}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleRemoveFromQueue(idx, e)}
                        className="p-1 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-white/[0.08] transition shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="application/pdf,application/epub+zip,.pdf,.epub"
              onChange={handleSelectFiles}
              className="hidden"
            />
          </div>

          {/* Right Column: Active Item Editor */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4 bg-[#121212]">
            {currentItem ? (
              <>
                {/* 1. File Pagination Pill Header */}
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 flex items-center justify-between font-mono text-xs text-zinc-300">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-zinc-400" />
                    <span className="truncate">{selectedIndex + 1} / {fileQueue.length}: {currentItem.fileName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-zinc-400 shrink-0">
                    <button
                      onClick={() => setSelectedIndex(Math.max(0, selectedIndex - 1))}
                      disabled={selectedIndex === 0}
                      className="p-1 rounded hover:bg-white/[0.08] text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedIndex(Math.min(fileQueue.length - 1, selectedIndex + 1))}
                      disabled={selectedIndex === fileQueue.length - 1}
                      className="p-1 rounded hover:bg-white/[0.08] text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 2. Auto-Translation Notice */}
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-3 flex items-start gap-2.5 text-xs text-zinc-400 font-sans">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    {u.autoTranslateNotice}
                  </div>
                </div>

                {/* 3. Centered Cover Image Block */}
                <div className="flex items-center justify-center gap-6 p-4 bg-white/[0.02] rounded-2xl border border-white/[0.08]">
                  <div className="w-24 aspect-[3/4] bg-[#181818] rounded-xl overflow-hidden border border-white/[0.08] shadow-sm shrink-0 flex items-center justify-center">
                    {currentItem.coverPreview ? (
                      <img src={currentItem.coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-7 h-7 text-zinc-600" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">{u.coverFileLabel}</h5>
                    <p className="text-[11px] text-zinc-500">
                      {u.coverHelp}
                    </p>
                    <div className="flex items-center gap-2 pt-1.5">
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCustomCover}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        className="px-3.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.08] rounded-lg text-xs font-mono uppercase tracking-wider transition cursor-pointer"
                      >
                        {u.chooseFile}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Multi-Script Title Inputs */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <span>{lang === 'hi' ? 'रचना का शीर्षक' : (lang === 'ur' ? 'کتاب کا عنوان' : 'Book Title')}</span>
                      <span className="text-[10px] text-zinc-500 font-normal">
                        ({lang === 'hi' ? 'हिंदी • English • اردو' : (lang === 'ur' ? 'ہندی • انگریزی • اردو' : 'Hindi • English • Urdu')})
                      </span>
                    </label>
                    <div className="flex items-center gap-2">
                      {translatingField === 'title' ? (
                        <span className="text-[10.5px] text-emerald-400 flex items-center gap-1 font-mono uppercase tracking-wider animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>{u.transliterating || 'Transliterating...'}</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const val = currentItem.title_en || currentItem.title_hi || currentItem.title_ur;
                            if (val) handleAutoTranslateField('title', val, currentItem.title_en ? 'en' : (currentItem.title_hi ? 'hi' : 'ur'), true);
                          }}
                          className="text-[10px] font-mono uppercase tracking-wider text-zinc-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] px-2 py-0.5 rounded border border-white/[0.08] transition cursor-pointer flex items-center gap-1"
                          title="Click to automatically fill title in all 3 languages"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Auto-Fill</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={u.titleHi || 'शीर्षक (हिंदी)'}
                        value={currentItem.title_hi || ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          updateCurrentItem({ title_hi: v });
                          handleAutoTranslateField('title', v, 'hi');
                        }}
                        onBlur={(e) => {
                          if (e.target.value) handleAutoTranslateField('title', e.target.value, 'hi', true);
                        }}
                        className="w-full pl-3.5 pr-11 py-2 text-xs border border-white/[0.08] focus:border-white/30 rounded-xl outline-hidden bg-[#181818] text-white font-hindi-serif shadow-xs focus:ring-1 focus:ring-white/20"
                      />
                      <span className="absolute top-2 right-2 text-[9px] font-mono font-bold text-zinc-400 bg-white/[0.06] border border-white/[0.08] px-1.5 py-0.5 rounded pointer-events-none">HIN</span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={u.titleEn || 'Title (English) *'}
                        value={currentItem.title_en || ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          updateCurrentItem({ title_en: v });
                          handleAutoTranslateField('title', v, 'en');
                        }}
                        onBlur={(e) => {
                          if (e.target.value) handleAutoTranslateField('title', e.target.value, 'en', true);
                        }}
                        className="w-full pl-3.5 pr-11 py-2 text-xs border border-white/[0.08] focus:border-white/30 rounded-xl outline-hidden bg-[#181818] text-white shadow-xs focus:ring-1 focus:ring-white/20"
                      />
                      <span className="absolute top-2 right-2 text-[9px] font-mono font-bold text-zinc-400 bg-white/[0.06] border border-white/[0.08] px-1.5 py-0.5 rounded pointer-events-none">ENG</span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        dir="rtl"
                        placeholder={u.titleUr || 'عنوان (اردو)'}
                        value={currentItem.title_ur || ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          updateCurrentItem({ title_ur: v });
                          handleAutoTranslateField('title', v, 'ur');
                        }}
                        onBlur={(e) => {
                          if (e.target.value) handleAutoTranslateField('title', e.target.value, 'ur', true);
                        }}
                        className="w-full pr-3.5 pl-11 py-2 text-xs border border-white/[0.08] focus:border-white/30 rounded-xl outline-hidden bg-[#181818] text-white font-urdu shadow-xs text-right focus:ring-1 focus:ring-white/20"
                      />
                      <span className="absolute top-2 left-2 text-[9px] font-mono font-bold text-zinc-400 bg-white/[0.06] border border-white/[0.08] px-1.5 py-0.5 rounded pointer-events-none">URD</span>
                    </div>
                  </div>
                </div>

                {/* 5. Multi-Script Author Inputs */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <span>{lang === 'hi' ? 'रचनाकार / लेखक' : (lang === 'ur' ? 'مصنف / تخلیق کار' : 'Author / Creator')}</span>
                      <span className="text-[10px] text-zinc-500 font-normal">
                        ({lang === 'hi' ? 'हिंदी • English • उर्दू' : (lang === 'ur' ? 'ہندی • انگریزی • اردو' : 'Hindi • English • Urdu')})
                      </span>
                    </label>
                    <div className="flex items-center gap-2">
                      {translatingField === 'author' ? (
                        <span className="text-[10.5px] text-emerald-400 flex items-center gap-1 font-mono uppercase tracking-wider animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>{u.transliterating || 'Transliterating...'}</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const val = currentItem.author_en || currentItem.author_hi || currentItem.author_ur;
                            if (val) handleAutoTranslateField('author', val, currentItem.author_en ? 'en' : (currentItem.author_hi ? 'hi' : 'ur'), true);
                          }}
                          className="text-[10px] font-mono uppercase tracking-wider text-zinc-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] px-2 py-0.5 rounded border border-white/[0.08] transition cursor-pointer flex items-center gap-1"
                          title="Click to automatically fill author in all 3 languages"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Auto-Fill</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={u.authorHi || 'रचनाकार (हिंदी)'}
                        value={currentItem.author_hi || ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          updateCurrentItem({ author_hi: v });
                          handleAutoTranslateField('author', v, 'hi');
                        }}
                        onBlur={(e) => {
                          if (e.target.value) handleAutoTranslateField('author', e.target.value, 'hi', true);
                        }}
                        className="w-full pl-3.5 pr-11 py-2 text-xs border border-white/[0.08] focus:border-white/30 rounded-xl outline-hidden bg-[#181818] text-white font-hindi-serif shadow-xs focus:ring-1 focus:ring-white/20"
                      />
                      <span className="absolute top-2 right-2 text-[9px] font-mono font-bold text-zinc-400 bg-white/[0.06] border border-white/[0.08] px-1.5 py-0.5 rounded pointer-events-none">HIN</span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={u.authorEn || 'Author (English) *'}
                        value={currentItem.author_en || ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          updateCurrentItem({ author_en: v });
                          handleAutoTranslateField('author', v, 'en');
                        }}
                        onBlur={(e) => {
                          if (e.target.value) handleAutoTranslateField('author', e.target.value, 'en', true);
                        }}
                        className="w-full pl-3.5 pr-11 py-2 text-xs border border-white/[0.08] focus:border-white/30 rounded-xl outline-hidden bg-[#181818] text-white shadow-xs focus:ring-1 focus:ring-white/20"
                      />
                      <span className="absolute top-2 right-2 text-[9px] font-mono font-bold text-zinc-400 bg-white/[0.06] border border-white/[0.08] px-1.5 py-0.5 rounded pointer-events-none">ENG</span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        dir="rtl"
                        placeholder={u.authorUr || 'مصنف (اردو)'}
                        value={currentItem.author_ur || ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          updateCurrentItem({ author_ur: v });
                          handleAutoTranslateField('author', v, 'ur');
                        }}
                        onBlur={(e) => {
                          if (e.target.value) handleAutoTranslateField('author', e.target.value, 'ur', true);
                        }}
                        className="w-full pr-3.5 pl-11 py-2 text-xs border border-white/[0.08] focus:border-white/30 rounded-xl outline-hidden bg-[#181818] text-white font-urdu shadow-xs text-right focus:ring-1 focus:ring-white/20"
                      />
                      <span className="absolute top-2 left-2 text-[9px] font-mono font-bold text-zinc-400 bg-white/[0.06] border border-white/[0.08] px-1.5 py-0.5 rounded pointer-events-none">URD</span>
                    </div>
                  </div>
                </div>

                {/* 6. 3-TIER HIERARCHY */}
                <div className="space-y-3 p-4 bg-white/[0.02] rounded-2xl border border-white/[0.08]">
                  <div className="flex items-center gap-2 pb-1 border-b border-white/[0.06]">
                    <FolderTree className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                      {u.tierHeader}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {/* Level 1: Format */}
                    <div>
                      <SearchableCombobox
                        label={u.formatLabel}
                        type="format"
                        value={currentItem.category}
                        options={formatOptions}
                        searchPlaceholder={u.category}
                        lang={lang}
                        dark={true}
                        onChange={(catId, opt) => {
                          const targetCat = catsList.find(c => c.id === catId);
                          const firstGenre = targetCat?.genres?.[0];
                          const firstSub = firstGenre?.subgenres?.[0];
                          updateCurrentItem({
                            category: catId,
                            genre: firstGenre?.id || '',
                            subgenre: firstSub?.id || ''
                          });
                        }}
                        onCreate={handleCreateFormat}
                        onDelete={handleDeleteFormat}
                      />
                    </div>

                    {/* Level 2: Genre */}
                    <div>
                      <SearchableCombobox
                        label={u.genreLabel}
                        type="genre"
                        value={currentItem.genre}
                        options={genreOptions}
                        searchPlaceholder={u.genre}
                        lang={lang}
                        dark={true}
                        onChange={(genreId, opt) => {
                          const targetGenre = availableGenres.find(g => g.id === genreId);
                          const firstSub = targetGenre?.subgenres?.[0];
                          updateCurrentItem({
                            genre: genreId,
                            subgenre: firstSub?.id || ''
                          });
                        }}
                        onCreate={handleCreateGenre}
                        onDelete={handleDeleteGenre}
                      />
                    </div>

                    {/* Level 3: Subgenre */}
                    <div>
                      <SearchableCombobox
                        label={u.subgenreLabel}
                        type="subgenre"
                        value={currentItem.subgenre}
                        options={subgenreOptions}
                        searchPlaceholder={u.subgenre}
                        lang={lang}
                        dark={true}
                        onChange={(subId, opt) => {
                          updateCurrentItem({ subgenre: subId });
                        }}
                        onCreate={handleCreateSubGenre}
                        onDelete={handleDeleteSubGenre}
                      />
                    </div>
                  </div>
                </div>

                {/* 7. Era & Year */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                      {u.era}
                    </label>
                    <select
                      value={currentItem.era}
                      onChange={(e) => updateCurrentItem({ era: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-white/[0.08] focus:border-white/30 rounded-xl outline-hidden bg-[#181818] text-white shadow-xs cursor-pointer"
                    >
                      {HISTORICAL_ERA_KEYS.map(k => (
                        <option key={k} value={k} className="bg-[#181818] text-white">{getLocalizedEra(k, lang)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                      {u.year}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1936"
                      value={currentItem.year}
                      onChange={(e) => updateCurrentItem({ year: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs border border-white/[0.08] focus:border-white/30 rounded-xl outline-hidden bg-[#181818] text-white shadow-xs focus:ring-1 focus:ring-white/20"
                    />
                  </div>
                </div>

                {/* 8. Publisher & Page Count */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                      {u.publisher}
                    </label>
                    <input
                      type="text"
                      placeholder={u.publisher}
                      value={currentItem.publisher}
                      onChange={(e) => updateCurrentItem({ publisher: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs border border-white/[0.08] focus:border-white/30 rounded-xl outline-hidden bg-[#181818] text-white shadow-xs focus:ring-1 focus:ring-white/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                      {u.pages}
                    </label>
                    <input
                      type="number"
                      value={currentItem.pages}
                      onChange={(e) => updateCurrentItem({ pages: parseInt(e.target.value) || 1 })}
                      className="w-full px-3.5 py-2 text-xs border border-white/[0.08] focus:border-white/30 rounded-xl outline-hidden bg-[#181818] text-white shadow-xs focus:ring-1 focus:ring-white/20"
                    />
                  </div>
                </div>

                {/* 9. Description */}
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                    {u.description}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={u.description}
                    value={currentItem.description}
                    onChange={(e) => updateCurrentItem({ description: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-white/[0.08] focus:border-white/30 rounded-xl outline-hidden bg-[#181818] text-white shadow-xs resize-none focus:ring-1 focus:ring-white/20"
                  />
                </div>

                {/* 10. Featured Flag */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="featuredCheckbox"
                    checked={currentItem.is_featured}
                    onChange={(e) => updateCurrentItem({ is_featured: e.target.checked })}
                    className="w-4 h-4 rounded border-white/[0.2] bg-[#181818] text-white focus:ring-white/30 cursor-pointer"
                  />
                  <label htmlFor="featuredCheckbox" className="text-xs font-mono text-zinc-300 cursor-pointer">
                    {u.highlightLandmark}
                  </label>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center text-zinc-500 font-mono space-y-2">
                <FileText className="w-12 h-12 stroke-[1.5]" />
                <p className="text-sm font-semibold text-zinc-400">{u.noFileSelected}</p>
                <p className="text-xs">{u.noFileSelectedSub}</p>
              </div>
            )}
          </div>

        </div>

        {/* 3. Footer Action Bar */}
        <div className="px-6 py-4 border-t border-white/[0.08] bg-[#141414] flex items-center justify-between shrink-0">
          <div className="text-xs font-mono text-zinc-400 font-medium">
            {fileQueue.length > 0 ? (
              <span><strong className="text-white">{fileQueue.length}</strong> {u.readyToPreserve}</span>
            ) : (
              <span>{u.queueEmpty}</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white rounded-xl transition cursor-pointer"
            >
              {u.cancel}
            </button>
            <button
              type="button"
              onClick={handleSubmitAll}
              disabled={isSubmitting || fileQueue.length === 0}
              className="px-6 py-2.5 bg-white hover:bg-zinc-200 text-black text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-mono uppercase tracking-wider"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{u.uploading} ({uploadProgress}%)</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>{u.uploadAll} ({fileQueue.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
