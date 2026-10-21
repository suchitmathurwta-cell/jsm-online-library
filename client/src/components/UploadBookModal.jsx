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
  FolderTree
} from 'lucide-react';
import SearchableCombobox from './SearchableCombobox';
import {
  getCategoriesWithHierarchy,
  uploadBookFile,
  createBookRecord,
  createFormat,
  deleteFormat,
  createGenre,
  deleteGenre,
  createSubgenre,
  deleteSubgenre
} from '../services/supabaseApi';
import { DEFAULT_CATEGORIES } from '../data/categoriesData';
import { translations, getLocalizedEra } from '../locales/translations';
import {
  transliterateAll,
  detectLanguage,
  getTrilingualNames,
  clientSideTransliterateFallback,
  enforceScript
} from '../services/transliterationService';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const HISTORICAL_ERA_KEYS = [
  'contemporary',
  'post-independence',
  'progressive',
  'chhayavad',
  'dwivedi',
  'bharatendu',
  'late mughal',
  'bhakti',
  'classical'
];

function createDraftItem(catsList, lang) {
  const list = catsList && catsList.length > 0 ? catsList : DEFAULT_CATEGORIES;
  const defaultFormat = list[0] || { id: 'novel', genres: [] };
  const defaultGenre = defaultFormat.genres?.[0] || { id: 'social-realism', subgenres: [] };
  const defaultSub = defaultGenre.subgenres?.[0] || { id: 'general' };

  return {
    file: null,
    fileName: '',
    title_hi: '',
    title_en: '',
    title_ur: '',
    author_hi: '',
    author_en: '',
    author_ur: '',
    category: defaultFormat.id,
    genre: defaultGenre.id,
    subgenre: defaultSub.id,
    era: 'contemporary',
    year: new Date().getFullYear().toString(),
    publisher:
      lang === 'hi'
        ? 'जसम ऑनलाइन लाइब्रेरी'
        : lang === 'ur'
        ? 'جسم آن لائن لائبریری'
        : 'JSM Online Library',
    description: '',
    description_en: '',
    coverFile: null,
    coverPreview: null,
    pages: 50,
    is_featured: false
  };
}

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

  const [allCategories, setAllCategories] = useState(
    categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES
  );
  const [fileQueue, setFileQueue] = useState(() => [
    createDraftItem(categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES, lang)
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [translatingField, setTranslatingField] = useState(null);
  const [lastTitleLang, setLastTitleLang] = useState('en');
  const [lastAuthorLang, setLastAuthorLang] = useState('en');

  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const titleTimeoutRef = useRef(null);
  const authorTimeoutRef = useRef(null);

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

  // Ensure there is always at least 1 editable draft item when modal opens
  useEffect(() => {
    if (isOpen && fileQueue.length === 0) {
      setFileQueue([createDraftItem(allCategories, lang)]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (titleTimeoutRef.current) clearTimeout(titleTimeoutRef.current);
      if (authorTimeoutRef.current) clearTimeout(authorTimeoutRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const processSinglePdf = async (file, existingDraft = null) => {
    let cleanName = file.name.replace(/\.(pdf|epub)$/i, '');

    // 1. Remove trailing scan/copy indicators like (1), (2), -cs, _cs, -scan
    cleanName = cleanName.replace(/\s*\(\d+\)$/g, '');
    cleanName = cleanName.replace(/[-_]cs$/i, '');
    cleanName = cleanName.replace(/[-_]scan$/i, '');

    // 2. Extract Year if present at the end (e.g. -1976 or _1976 or 1976)
    let extractedYear = existingDraft?.year || new Date().getFullYear().toString();
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

    const catsList = allCategories && allCategories.length > 0 ? allCategories : DEFAULT_CATEGORIES;
    const defaultFormat = catsList[0] || { id: 'novel', genres: [] };
    const defaultGenre = defaultFormat.genres?.[0] || { id: 'social-realism', subgenres: [] };
    const defaultSub = defaultGenre.subgenres?.[0] || { id: 'general' };

    const detectedLang = detectLanguage(extractedTitle);

    const hasExistingTitle =
      existingDraft &&
      (existingDraft.title_hi?.trim() || existingDraft.title_en?.trim() || existingDraft.title_ur?.trim());
    const hasExistingAuthor =
      existingDraft &&
      (existingDraft.author_hi?.trim() || existingDraft.author_en?.trim() || existingDraft.author_ur?.trim());

    const item = {
      ...(existingDraft || {}),
      file,
      fileName: file.name,
      title_hi: hasExistingTitle ? existingDraft.title_hi : '',
      title_en: hasExistingTitle ? existingDraft.title_en : '',
      title_ur: hasExistingTitle ? existingDraft.title_ur : '',
      author_hi: hasExistingAuthor ? existingDraft.author_hi : '',
      author_en: hasExistingAuthor ? existingDraft.author_en : extractedAuthor || '',
      author_ur: hasExistingAuthor ? existingDraft.author_ur : '',
      category: existingDraft?.category || defaultFormat.id,
      genre: existingDraft?.genre || defaultGenre.id,
      subgenre: existingDraft?.subgenre || defaultSub.id,
      era: existingDraft?.era || 'contemporary',
      year: extractedYear,
      publisher:
        existingDraft?.publisher ||
        (lang === 'hi'
          ? 'जसम ऑनलाइन लाइब्रेरी'
          : lang === 'ur'
          ? 'جسم آن لائن لائبریری'
          : 'JSM Online Library'),
      description: existingDraft?.description || '',
      description_en: existingDraft?.description_en || '',
      coverFile: existingDraft?.coverFile || null,
      coverPreview: existingDraft?.coverPreview || null,
      pages: existingDraft?.pages || 50,
      is_featured: Boolean(existingDraft?.is_featured)
    };

    // Extract Cover from PDF Page 1 if PDF and no custom cover already chosen
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        item.pages = pdf.numPages;

        if (!item.coverPreview) {
          const page1 = await pdf.getPage(1);
          const viewport = page1.getViewport({ scale: 0.6 });
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page1.render({ canvasContext: ctx, viewport }).promise;
          item.coverPreview = canvas.toDataURL('image/jpeg', 0.85);
        }
      } catch (e) {
        console.warn('PDF thumbnail extraction notice:', e);
      }
    }

    // Auto-transliterate Title across all 3 languages if user hadn't already typed a custom title
    if (!hasExistingTitle && extractedTitle) {
      try {
        const titleTrans = await transliterateAll(extractedTitle, detectedLang);
        if (titleTrans) {
          item.title_hi = titleTrans.hi || extractedTitle;
          item.title_en = titleTrans.en || extractedTitle;
          item.title_ur = titleTrans.ur || extractedTitle;
        }
      } catch (e) {
        item.title_hi = extractedTitle;
        item.title_en = extractedTitle;
        item.title_ur = extractedTitle;
      }
    }

    // Auto-transliterate Author if extracted and user hadn't already typed a custom author
    if (!hasExistingAuthor && extractedAuthor) {
      try {
        const authorLang = detectLanguage(extractedAuthor);
        const authorTrans = await transliterateAll(extractedAuthor, authorLang);
        if (authorTrans) {
          item.author_hi = authorTrans.hi || extractedAuthor;
          item.author_en = authorTrans.en || extractedAuthor;
          item.author_ur = authorTrans.ur || extractedAuthor;
        }
      } catch (e) {
        item.author_hi = extractedAuthor;
        item.author_en = extractedAuthor;
        item.author_ur = extractedAuthor;
      }
    }

    return item;
  };

  const ingestFiles = async (files) => {
    if (!files || files.length === 0) return;

    setStatusMessage({
      type: 'info',
      text:
        lang === 'hi'
          ? `${files.length} PDF फ़ाइलों का विश्लेषण हो रहा है...`
          : lang === 'ur'
          ? `${files.length} فائلوں کی جانچ ہو رہی ہے...`
          : `Analyzing ${files.length} PDF files...`
    });

    const hasUnattachedDraft =
      fileQueue.length === 1 && !fileQueue[0].file;

    const newItems = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const draftToMerge = i === 0 && hasUnattachedDraft ? fileQueue[0] : null;
      const itm = await processSinglePdf(file, draftToMerge);
      newItems.push(itm);
    }

    setFileQueue((prev) => {
      if (prev.length === 1 && !prev[0].file) {
        return newItems;
      }
      return [...prev, ...newItems];
    });
    setStatusMessage({ type: '', text: '' });
  };

  const handleSelectFiles = async (e) => {
    const files = Array.from(e.target.files || []).filter(
      (f) =>
        f.type === 'application/pdf' ||
        f.name.toLowerCase().endsWith('.pdf') ||
        f.name.toLowerCase().endsWith('.epub') ||
        (f.type && f.type.includes('epub'))
    );
    if (files.length === 0) return;
    await ingestFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []).filter(
      (f) =>
        f.type === 'application/pdf' ||
        f.name.toLowerCase().endsWith('.pdf') ||
        f.name.toLowerCase().endsWith('.epub') ||
        (f.type && f.type.includes('epub'))
    );
    if (files.length === 0) return;
    await ingestFiles(files);
  };

  const handleRemoveFromQueue = (index, e) => {
    e.stopPropagation();
    setFileQueue((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) {
        setSelectedIndex(0);
        return [createDraftItem(allCategories, lang)];
      }
      if (selectedIndex >= next.length) {
        setSelectedIndex(Math.max(0, next.length - 1));
      }
      return next;
    });
  };

  const updateItemAtIndex = (targetIdx, updates) => {
    setFileQueue((prev) => {
      const next = [...prev];
      if (next[targetIdx]) {
        next[targetIdx] = { ...next[targetIdx], ...updates };
      }
      return next;
    });
  };

  const updateCurrentItem = (updates) => {
    updateItemAtIndex(selectedIndex, updates);
  };

  const currentItem = fileQueue[selectedIndex] || fileQueue[0];

  // Real-time trilingual auto-translation that NEVER overwrites the active input box while typing
  const handleFieldInput = (fieldGroup, boxLang, rawValue) => {
    const activeIdx = selectedIndex;
    const timeoutRef = fieldGroup === 'title' ? titleTimeoutRef : authorTimeoutRef;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (fieldGroup === 'title') {
      setLastTitleLang(boxLang);
    } else {
      setLastAuthorLang(boxLang);
    }

    const activeKey = `${fieldGroup}_${boxLang}`;
    const trimmed = rawValue.trim();

    if (!trimmed) {
      // If user clears the box, update all 3 fields to empty cleanly without firing a stale timer
      updateItemAtIndex(activeIdx, {
        [`${fieldGroup}_hi`]: '',
        [`${fieldGroup}_en`]: '',
        [`${fieldGroup}_ur`]: ''
      });
      setTranslatingField(null);
      return;
    }

    // 1. Instant synchronous client-side transliteration into the OTHER two boxes
    const detected = detectLanguage(trimmed);
    const syncTrans = clientSideTransliterateFallback(trimmed, detected);
    const immediateUpdates = {
      [activeKey]: rawValue
    };
    if (boxLang !== 'hi') {
      immediateUpdates[`${fieldGroup}_hi`] = enforceScript(syncTrans.hi || trimmed, 'hi');
    }
    if (boxLang !== 'en') {
      immediateUpdates[`${fieldGroup}_en`] = enforceScript(syncTrans.en || trimmed, 'en');
    }
    if (boxLang !== 'ur') {
      immediateUpdates[`${fieldGroup}_ur`] = enforceScript(syncTrans.ur || trimmed, 'ur');
    }
    updateItemAtIndex(activeIdx, immediateUpdates);

    // 2. Debounced high-accuracy async transliteration (Google GTX + Literary Dictionary)
    timeoutRef.current = setTimeout(async () => {
      setTranslatingField(fieldGroup);
      try {
        const trans = await transliterateAll(trimmed, detected);
        if (trans) {
          const asyncUpdates = {};
          if (boxLang !== 'hi') asyncUpdates[`${fieldGroup}_hi`] = trans.hi;
          if (boxLang !== 'en') asyncUpdates[`${fieldGroup}_en`] = trans.en;
          if (boxLang !== 'ur') asyncUpdates[`${fieldGroup}_ur`] = trans.ur;
          updateItemAtIndex(activeIdx, asyncUpdates);
        }
      } catch (err) {
        console.warn('Auto-transliteration notice:', err);
      } finally {
        setTranslatingField(null);
      }
    }, 320);
  };

  // Explicit "Auto-Fill" button: translates from the last edited box (or first non-empty box) and enforces script on ALL 3 boxes
  const handleExplicitAutoFill = async (fieldGroup) => {
    if (!currentItem) return;
    const activeIdx = selectedIndex;
    const preferredLang = fieldGroup === 'title' ? lastTitleLang : lastAuthorLang;
    const seedText =
      (currentItem[`${fieldGroup}_${preferredLang}`] || '').trim() ||
      (currentItem[`${fieldGroup}_en`] || '').trim() ||
      (currentItem[`${fieldGroup}_hi`] || '').trim() ||
      (currentItem[`${fieldGroup}_ur`] || '').trim();

    if (!seedText) return;

    setTranslatingField(fieldGroup);
    try {
      const detected = detectLanguage(seedText);
      const trans = await transliterateAll(seedText, detected);
      if (trans) {
        updateItemAtIndex(activeIdx, {
          [`${fieldGroup}_hi`]: enforceScript(trans.hi || seedText, 'hi'),
          [`${fieldGroup}_en`]: enforceScript(trans.en || seedText, 'en'),
          [`${fieldGroup}_ur`]: enforceScript(trans.ur || seedText, 'ur')
        });
      }
    } catch (e) {
      console.warn('Explicit Auto-Fill error:', e);
    } finally {
      setTranslatingField(null);
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

  const catsList = allCategories && allCategories.length > 0 ? allCategories : DEFAULT_CATEGORIES;

  // Format options
  const formatOptions = catsList.map((c) => ({
    id: c.id,
    label: c['name_' + lang] || c.name_hi || c.name_en || c.id,
    name_hi: c.name_hi,
    name_en: c.name_en,
    name_ur: c.name_ur,
    raw: c
  }));

  // Active format object
  const activeFormatObj = catsList.find((c) => c.id === currentItem?.category) || catsList[0];

  // Genre options conditional on active format
  const availableGenres =
    activeFormatObj?.genres && activeFormatObj.genres.length > 0
      ? activeFormatObj.genres
      : DEFAULT_CATEGORIES.find((c) => c.id === (activeFormatObj?.id || currentItem?.category))
          ?.genres || [];

  const genreOptions = availableGenres.map((g) => ({
    id: g.id,
    label: g['name_' + lang] || g.name_hi || g.name_en || g.id,
    name_hi: g.name_hi,
    name_en: g.name_en,
    name_ur: g.name_ur,
    raw: g
  }));

  // Active genre object
  const activeGenreObj =
    availableGenres.find((g) => g.id === currentItem?.genre) || availableGenres[0];

  // Subgenre options conditional on active genre
  const availableSubgenres =
    activeGenreObj?.subgenres && activeGenreObj.subgenres.length > 0
      ? activeGenreObj.subgenres
      : DEFAULT_CATEGORIES.find((c) => c.id === activeFormatObj?.id)
          ?.genres?.find((g) => g.id === activeGenreObj?.id)?.subgenres || [];

  const subgenreOptions = availableSubgenres.map((sg) => ({
    id: sg.id,
    label: sg['name_' + lang] || sg.name_hi || sg.name_en || sg.name || sg.id,
    name_hi: sg.name_hi,
    name_en: sg.name_en,
    name_ur: sg.name_ur,
    raw: sg
  }));

  // Hierarchy Handlers with Supabase sync and immediate UI responsiveness across all nodal points
  const handleCreateFormat = async (name) => {
    const { name_en, name_hi, name_ur } = await getTrilingualNames(name);
    const id =
      (name_en || name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'fmt-' + Date.now();
    try {
      await createFormat({ id, name_hi: name_hi || name, name_en: name_en || name, name_ur });
    } catch (e) {
      console.warn('createFormat DB notice:', e);
    }
    const newFormat = { id, name_hi: name_hi || name, name_en: name_en || name, name_ur, genres: [] };
    setAllCategories((prev) => [...prev, newFormat]);
    updateCurrentItem({ category: id, genre: '', subgenre: '' });
    if (onCategoryCreated) onCategoryCreated();
  };

  const handleDeleteFormat = async (id) => {
    try {
      await deleteFormat(id);
    } catch (e) {
      console.warn('deleteFormat DB notice:', e);
    }
    setAllCategories((prev) => prev.filter((c) => c.id !== id));
    if (onCategoryCreated) onCategoryCreated();
  };

  const handleCreateGenre = async (name) => {
    const catId = currentItem?.category || activeFormatObj?.id;
    if (!catId) return;
    const { name_en, name_hi, name_ur } = await getTrilingualNames(name);
    const id =
      (name_en || name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'gnr-' + Date.now();
    try {
      await createGenre({
        id,
        category_id: catId,
        name_hi: name_hi || name,
        name_en: name_en || name,
        name_ur
      });
    } catch (e) {
      console.warn('createGenre DB notice:', e);
    }
    const newGenre = {
      id,
      category_id: catId,
      name_hi: name_hi || name,
      name_en: name_en || name,
      name_ur,
      subgenres: []
    };
    setAllCategories((prev) =>
      prev.map((c) => {
        if (c.id === catId) {
          return { ...c, genres: [...(c.genres || []), newGenre] };
        }
        return c;
      })
    );
    updateCurrentItem({ genre: id, subgenre: '' });
    if (onCategoryCreated) onCategoryCreated();
  };

  const handleDeleteGenre = async (id) => {
    const catId = currentItem?.category || activeFormatObj?.id;
    try {
      await deleteGenre(catId, id);
    } catch (e) {
      console.warn('deleteGenre DB notice:', e);
    }
    setAllCategories((prev) =>
      prev.map((c) => {
        if (c.id === catId) {
          return { ...c, genres: (c.genres || []).filter((g) => g.id !== id) };
        }
        return c;
      })
    );
    if (onCategoryCreated) onCategoryCreated();
  };

  const handleCreateSubGenre = async (name) => {
    const catId = currentItem?.category || activeFormatObj?.id;
    const gnrId = currentItem?.genre || activeGenreObj?.id || 'general';
    if (!catId) return;
    const { name_en, name_hi, name_ur } = await getTrilingualNames(name);
    const id =
      (name_en || name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'sub-' + Date.now();
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
    const newSub = {
      id,
      category_id: catId,
      genre_id: gnrId,
      name_hi: name_hi || name,
      name_en: name_en || name,
      name_ur
    };
    setAllCategories((prev) =>
      prev.map((c) => {
        if (c.id === catId) {
          return {
            ...c,
            genres: (c.genres || []).map((g) => {
              if (g.id === gnrId) {
                return { ...g, subgenres: [...(g.subgenres || []), newSub] };
              }
              return g;
            })
          };
        }
        return c;
      })
    );
    updateCurrentItem({ subgenre: id });
    if (onSubGenreCreated) onSubGenreCreated();
    if (onCategoryCreated) onCategoryCreated();
  };

  const handleDeleteSubGenre = async (id) => {
    const catId = currentItem?.category || activeFormatObj?.id;
    const gnrId = currentItem?.genre || activeGenreObj?.id;
    try {
      await deleteSubgenre(catId, gnrId, id);
    } catch (e) {
      console.warn('deleteSubgenre DB notice:', e);
    }
    setAllCategories((prev) =>
      prev.map((c) => {
        if (c.id === catId) {
          return {
            ...c,
            genres: (c.genres || []).map((g) => {
              if (g.id === gnrId) {
                return { ...g, subgenres: (g.subgenres || []).filter((s) => s.id !== id) };
              }
              return g;
            })
          };
        }
        return c;
      })
    );
    if (onSubGenreCreated) onSubGenreCreated();
    if (onCategoryCreated) onCategoryCreated();
  };

  // Submission handler
  const handleSubmitAll = async () => {
    if (fileQueue.length === 0) return;

    for (let i = 0; i < fileQueue.length; i++) {
      const item = fileQueue[i];
      if (!item.file) {
        setStatusMessage({
          type: 'error',
          text:
            lang === 'hi'
              ? 'कृपया अपलोड करने के लिए पहले PDF या EPUB फ़ाइल चुनें!'
              : lang === 'ur'
              ? 'براہ کرم پہلے PDF یا EPUB فائل منتخب کریں!'
              : 'Please select a PDF or EPUB file to upload!'
        });
        setSelectedIndex(i);
        fileInputRef.current?.click();
        return;
      }
      if (!item.title_hi && !item.title_en && !item.title_ur) {
        setStatusMessage({
          type: 'error',
          text:
            lang === 'hi'
              ? `फ़ाइल #${i + 1} (${item.fileName}) में शीर्षक भरना आवश्यक है!`
              : lang === 'ur'
              ? `فائل نمبر ${i + 1} کے لیے عنوان درکار ہے!`
              : `File #${i + 1} (${item.fileName}) is missing a title!`
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
          pdfPublicUrl = typeof pdfRes === 'string' ? pdfRes : pdfRes?.publicUrl || '';
        } catch (storageErr) {
          console.warn('Storage upload fallback:', storageErr);
        }

        if (item.coverFile) {
          try {
            const coverRes = await uploadBookFile(item.coverFile, 'covers');
            coverPublicUrl = typeof coverRes === 'string' ? coverRes : coverRes?.publicUrl || '';
          } catch (covErr) {
            console.warn('Cover upload notice:', covErr);
          }
        } else if (item.coverPreview && item.coverPreview.startsWith('data:')) {
          try {
            const blobRes = await fetch(item.coverPreview);
            const blob = await blobRes.blob();
            const coverFileFromBlob = new File([blob], `cover_${Date.now()}.jpg`, {
              type: 'image/jpeg'
            });
            const coverRes = await uploadBookFile(coverFileFromBlob, 'covers');
            coverPublicUrl = typeof coverRes === 'string' ? coverRes : coverRes?.publicUrl || '';
          } catch (bErr) {
            console.warn('Blob thumbnail upload notice:', bErr);
          }
        }

        // Ensure all 3 scripts are populated even if user only typed in one box
        const seedTitle = item.title_en || item.title_hi || item.title_ur || item.fileName;
        const seedAuthor = item.author_en || item.author_hi || item.author_ur || '';
        const finalTitleHi = item.title_hi || enforceScript(seedTitle, 'hi');
        const finalTitleEn = item.title_en || enforceScript(seedTitle, 'en');
        const finalTitleUr = item.title_ur || enforceScript(seedTitle, 'ur');
        const finalAuthorHi = item.author_hi || (seedAuthor ? enforceScript(seedAuthor, 'hi') : '');
        const finalAuthorEn = item.author_en || (seedAuthor ? enforceScript(seedAuthor, 'en') : '');
        const finalAuthorUr = item.author_ur || (seedAuthor ? enforceScript(seedAuthor, 'ur') : '');

        if (!pdfPublicUrl) {
          try {
            const formData = new FormData();
            formData.append('pdf', item.file);
            if (item.coverFile) formData.append('cover', item.coverFile);
            if (item.coverPreview && !item.coverFile)
              formData.append('coverBase64', item.coverPreview);
            formData.append('title_hi', finalTitleHi);
            formData.append('title_en', finalTitleEn);
            formData.append('title_ur', finalTitleUr);
            formData.append('author_hi', finalAuthorHi);
            formData.append('author_en', finalAuthorEn);
            formData.append('author_ur', finalAuthorUr);
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
          title_hi: finalTitleHi,
          title_en: finalTitleEn,
          title_ur: finalTitleUr,
          author_hi: finalAuthorHi,
          author_en: finalAuthorEn,
          author_ur: finalAuthorUr,
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
        text:
          lang === 'hi'
            ? `${successCount}/${fileQueue.length} फ़ाइलें अपलोड हुईं।`
            : lang === 'ur'
            ? `${successCount}/${fileQueue.length} فائلیں محفوظ ہوئیں۔`
            : `Uploaded ${successCount} of ${fileQueue.length} files.`
      });
    }
  };

  const attachedFilesCount = fileQueue.filter((f) => Boolean(f.file)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/80 backdrop-blur-md">
      <div className="bg-[#121212]/98 backdrop-blur-xl border border-white/[0.12] rounded-2xl sm:rounded-3xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden animate-fadeIn text-[#FAFAFA] font-sans shadow-2xl">
        {/* 1. Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#141414] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-400/15 text-amber-400 flex items-center justify-center border border-amber-400/30 shadow-xs shrink-0">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-sm sm:text-lg tracking-tight font-sans truncate">
                {u.modalTitle}
              </h3>
              <p className="text-[10px] sm:text-xs text-zinc-400 font-mono uppercase tracking-wider truncate">
                {u.modalSubtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Notification Bar */}
        {statusMessage.text && (
          <div
            className={
              'px-4 sm:px-6 py-2.5 text-xs font-semibold flex items-center justify-between border-b shrink-0 ' +
              (statusMessage.type === 'error'
                ? 'bg-red-500/15 text-red-300 border-red-500/30'
                : statusMessage.type === 'success'
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : statusMessage.type === 'warning'
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-white/[0.06] text-zinc-300 border-white/[0.08]')
            }
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              {statusMessage.type === 'error' && (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              {statusMessage.type === 'info' && (
                <Loader2 className="w-4 h-4 text-white animate-spin shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage({ type: '', text: '' })}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 2. Main Body Area: Single unified vertical scroll on mobile so virtual keyboard never crushes input fields */}
        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
          {/* Left Column (Desktop Sidebar / Compact Mobile Top Bar): Upload Queue & File Picker */}
          <div className="w-full md:w-72 lg:w-80 border-b md:border-b-0 md:border-r border-white/[0.08] bg-[#0E0E0E] flex flex-col shrink-0">
            <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between bg-[#141414]">
              <span className="text-xs font-mono font-bold text-zinc-300 tracking-wider uppercase">
                {u.queueHeader} ({attachedFilesCount})
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-mono font-extrabold uppercase tracking-wider rounded-lg flex items-center gap-1 transition cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{u.addMoreFiles || 'Select PDF'}</span>
              </button>
            </div>

            {/* Dropzone Area: Full on desktop or when no file attached; compact on mobile once a file is attached */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={
                'm-3 p-3.5 sm:p-4 border-2 border-dashed rounded-2xl text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 ' +
                (attachedFilesCount > 0 ? 'hidden md:flex ' : 'flex ') +
                (isDragging
                  ? 'border-amber-400 bg-amber-400/10 scale-[0.99]'
                  : 'border-amber-400/40 hover:border-amber-400 bg-white/[0.03] hover:bg-white/[0.06]')
              }
            >
              <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
              <div className="text-xs font-bold text-white">{u.dragDrop}</div>
              <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                .PDF, .EPUB (Tap to Choose File)
              </div>
            </div>

            {/* File Queue List */}
            {attachedFilesCount > 0 && (
              <div className="max-h-32 md:max-h-none md:flex-1 overflow-y-auto px-3 py-2 space-y-1.5 divide-y divide-white/[0.04]">
                {fileQueue.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedIndex(idx)}
                      className={
                        'p-2.5 rounded-xl text-xs flex items-center justify-between gap-2 transition cursor-pointer border ' +
                        (isSelected
                          ? 'bg-amber-400/15 border-amber-400/50 shadow-xs font-semibold text-white'
                          : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.06] text-zinc-400 hover:text-zinc-200')
                      }
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-10 bg-[#161616] rounded-md border border-white/[0.08] flex items-center justify-center shrink-0 overflow-hidden">
                          {item.coverPreview ? (
                            <img
                              src={item.coverPreview}
                              alt="Cover"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FileText className="w-4 h-4 text-amber-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs text-white font-hindi-serif">
                            {item['title_' + lang] ||
                              item.title_hi ||
                              item.title_en ||
                              item.fileName ||
                              'Draft Book'}
                          </p>
                          <span className="text-[10px] text-zinc-400 font-mono block truncate">
                            {item.fileName ? `${item.pages} ${tr.card.pagesUnit} • ${item.fileName}` : 'No PDF attached yet'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleRemoveFromQueue(idx, e)}
                        className="p-1 text-zinc-400 hover:text-red-400 rounded-lg hover:bg-white/[0.08] transition shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="application/pdf,application/epub+zip,.pdf,.epub"
              onChange={handleSelectFiles}
              className="hidden"
            />
          </div>

          {/* Right Column: Active Item Editor (Always Rendered & Editable!) */}
          <div className="flex-1 p-4 sm:p-6 md:overflow-y-auto space-y-4 bg-[#121212]">
            {currentItem && (
              <>
                {/* 1. File Status / Pagination Pill Header */}
                <div className="bg-white/[0.04] border border-white/[0.1] rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2 font-mono text-xs text-zinc-200">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                    {currentItem.fileName ? (
                      <span className="truncate">
                        {selectedIndex + 1} / {fileQueue.length}: {currentItem.fileName}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-amber-300 hover:text-amber-200 underline font-bold truncate cursor-pointer text-left"
                      >
                        {lang === 'hi'
                          ? '📄 PDF फ़ाइल चुनें (या पहले नीचे नाम/विवरण टाइप करें)'
                          : lang === 'ur'
                          ? '📄 PDF فائل منتخب کریں (یا نیچے تفصیلات درج کریں)'
                          : '📄 Tap to attach PDF file (or type book details below first)'}
                      </button>
                    )}
                  </div>
                  {fileQueue.length > 1 && (
                    <div className="flex items-center gap-1 text-zinc-400 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedIndex(Math.max(0, selectedIndex - 1))}
                        disabled={selectedIndex === 0}
                        className="p-1 rounded hover:bg-white/[0.08] text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedIndex(Math.min(fileQueue.length - 1, selectedIndex + 1))
                        }
                        disabled={selectedIndex === fileQueue.length - 1}
                        className="p-1 rounded hover:bg-white/[0.08] text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Auto-Translation Notice */}
                <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3 flex items-start gap-2.5 text-xs text-emerald-200 font-sans">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    {u.autoTranslateNotice ||
                      'Type in any one language (Hindi, English, or Urdu) and the other two scripts will auto-fill automatically.'}
                  </div>
                </div>

                {/* 3. Multi-Script Title Inputs (Placed right at top for easy mobile typing) */}
                <div className="space-y-2 p-3.5 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-200 font-bold flex items-center gap-1.5">
                      <span>
                        {lang === 'hi'
                          ? '1. रचना का शीर्षक'
                          : lang === 'ur'
                          ? '1. کتاب کا عنوان'
                          : '1. Book Title'}
                      </span>
                      <span className="text-[10px] text-amber-400 font-normal">
                        (हिंदी • English • اردو)
                      </span>
                    </label>
                    <div className="flex items-center gap-2 shrink-0">
                      {translatingField === 'title' ? (
                        <span className="text-[10.5px] text-emerald-400 flex items-center gap-1 font-mono uppercase tracking-wider animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>{u.transliterating || 'Translating...'}</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleExplicitAutoFill('title')}
                          className="text-[10px] font-mono uppercase tracking-wider text-black bg-amber-400 hover:bg-amber-300 font-extrabold px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-xs"
                          title="Click to automatically translate title into all 3 languages"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Auto-Translate</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={u.titleEn || 'Title (English) *'}
                        value={currentItem.title_en || ''}
                        onChange={(e) => handleFieldInput('title', 'en', e.target.value)}
                        className="w-full pl-3.5 pr-12 py-2.5 text-sm sm:text-xs border border-white/[0.15] focus:border-amber-400 rounded-xl outline-hidden bg-[#181818] text-white shadow-xs focus:ring-1 focus:ring-amber-400/30"
                      />
                      <span className="absolute top-2.5 right-2 text-[9px] font-mono font-bold text-blue-300 bg-blue-500/20 border border-blue-400/30 px-1.5 py-0.5 rounded pointer-events-none">
                        ENG
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={u.titleHi || 'शीर्षक (हिंदी)'}
                        value={currentItem.title_hi || ''}
                        onChange={(e) => handleFieldInput('title', 'hi', e.target.value)}
                        className="w-full pl-3.5 pr-12 py-2.5 text-sm sm:text-xs border border-white/[0.15] focus:border-amber-400 rounded-xl outline-hidden bg-[#181818] text-white font-hindi-serif shadow-xs focus:ring-1 focus:ring-amber-400/30"
                      />
                      <span className="absolute top-2.5 right-2 text-[9px] font-mono font-bold text-amber-300 bg-amber-500/20 border border-amber-400/30 px-1.5 py-0.5 rounded pointer-events-none">
                        HIN
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        dir="rtl"
                        placeholder={u.titleUr || 'عنوان (اردو)'}
                        value={currentItem.title_ur || ''}
                        onChange={(e) => handleFieldInput('title', 'ur', e.target.value)}
                        className="w-full pr-3.5 pl-12 py-2.5 text-sm sm:text-xs border border-white/[0.15] focus:border-amber-400 rounded-xl outline-hidden bg-[#181818] text-white font-urdu shadow-xs text-right focus:ring-1 focus:ring-amber-400/30"
                      />
                      <span className="absolute top-2.5 left-2 text-[9px] font-mono font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-1.5 py-0.5 rounded pointer-events-none">
                        URD
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Multi-Script Author Inputs */}
                <div className="space-y-2 p-3.5 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-200 font-bold flex items-center gap-1.5">
                      <span>
                        {lang === 'hi'
                          ? '2. रचनाकार / लेखक'
                          : lang === 'ur'
                          ? '2. مصنف / تخلیق کار'
                          : '2. Author / Creator'}
                      </span>
                      <span className="text-[10px] text-amber-400 font-normal">
                        (हिंदी • English • اردو)
                      </span>
                    </label>
                    <div className="flex items-center gap-2 shrink-0">
                      {translatingField === 'author' ? (
                        <span className="text-[10.5px] text-emerald-400 flex items-center gap-1 font-mono uppercase tracking-wider animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>{u.transliterating || 'Translating...'}</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleExplicitAutoFill('author')}
                          className="text-[10px] font-mono uppercase tracking-wider text-black bg-amber-400 hover:bg-amber-300 font-extrabold px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-xs"
                          title="Click to automatically translate author into all 3 languages"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Auto-Translate</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={u.authorEn || 'Author (English) *'}
                        value={currentItem.author_en || ''}
                        onChange={(e) => handleFieldInput('author', 'en', e.target.value)}
                        className="w-full pl-3.5 pr-12 py-2.5 text-sm sm:text-xs border border-white/[0.15] focus:border-amber-400 rounded-xl outline-hidden bg-[#181818] text-white shadow-xs focus:ring-1 focus:ring-amber-400/30"
                      />
                      <span className="absolute top-2.5 right-2 text-[9px] font-mono font-bold text-blue-300 bg-blue-500/20 border border-blue-400/30 px-1.5 py-0.5 rounded pointer-events-none">
                        ENG
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={u.authorHi || 'रचनाकार (हिंदी)'}
                        value={currentItem.author_hi || ''}
                        onChange={(e) => handleFieldInput('author', 'hi', e.target.value)}
                        className="w-full pl-3.5 pr-12 py-2.5 text-sm sm:text-xs border border-white/[0.15] focus:border-amber-400 rounded-xl outline-hidden bg-[#181818] text-white font-hindi-serif shadow-xs focus:ring-1 focus:ring-amber-400/30"
                      />
                      <span className="absolute top-2.5 right-2 text-[9px] font-mono font-bold text-amber-300 bg-amber-500/20 border border-amber-400/30 px-1.5 py-0.5 rounded pointer-events-none">
                        HIN
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        dir="rtl"
                        placeholder={u.authorUr || 'مصنف (اردو)'}
                        value={currentItem.author_ur || ''}
                        onChange={(e) => handleFieldInput('author', 'ur', e.target.value)}
                        className="w-full pr-3.5 pl-12 py-2.5 text-sm sm:text-xs border border-white/[0.15] focus:border-amber-400 rounded-xl outline-hidden bg-[#181818] text-white font-urdu shadow-xs text-right focus:ring-1 focus:ring-amber-400/30"
                      />
                      <span className="absolute top-2.5 left-2 text-[9px] font-mono font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-1.5 py-0.5 rounded pointer-events-none">
                        URD
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. 3-TIER HIERARCHY */}
                <div className="space-y-3 p-4 bg-white/[0.02] rounded-2xl border border-white/[0.08]">
                  <div className="flex items-center gap-2 pb-1 border-b border-white/[0.06]">
                    <FolderTree className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
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
                        onChange={(catId) => {
                          const targetCat = catsList.find((c) => c.id === catId);
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
                        onChange={(genreId) => {
                          const targetGenre = availableGenres.find((g) => g.id === genreId);
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
                        onChange={(subId) => {
                          updateCurrentItem({ subgenre: subId });
                        }}
                        onCreate={handleCreateSubGenre}
                        onDelete={handleDeleteSubGenre}
                      />
                    </div>
                  </div>
                </div>

                {/* 6. Centered Cover Image Block */}
                <div className="flex items-center justify-between sm:justify-center gap-4 sm:gap-6 p-3.5 sm:p-4 bg-white/[0.02] rounded-2xl border border-white/[0.08]">
                  <div className="w-20 sm:w-24 aspect-[3/4] bg-[#181818] rounded-xl overflow-hidden border border-white/[0.08] shadow-sm shrink-0 flex items-center justify-center">
                    {currentItem.coverPreview ? (
                      <img
                        src={currentItem.coverPreview}
                        alt="Cover Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-7 h-7 text-zinc-600" />
                    )}
                  </div>
                  <div className="space-y-1 flex-1 sm:flex-initial">
                    <h5 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
                      {u.coverFileLabel}
                    </h5>
                    <p className="text-[11px] text-zinc-500">{u.coverHelp}</p>
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
                      {HISTORICAL_ERA_KEYS.map((k) => (
                        <option key={k} value={k} className="bg-[#181818] text-white">
                          {getLocalizedEra(k, lang)}
                        </option>
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
                <div className="flex items-center gap-2 pt-1 pb-2">
                  <input
                    type="checkbox"
                    id="featuredCheckbox"
                    checked={currentItem.is_featured}
                    onChange={(e) => updateCurrentItem({ is_featured: e.target.checked })}
                    className="w-4 h-4 rounded border-white/[0.2] bg-[#181818] text-white focus:ring-white/30 cursor-pointer"
                  />
                  <label
                    htmlFor="featuredCheckbox"
                    className="text-xs font-mono text-zinc-300 cursor-pointer"
                  >
                    {u.highlightLandmark}
                  </label>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 3. Footer Action Bar */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-white/[0.08] bg-[#141414] flex items-center justify-between gap-2 shrink-0">
          <div className="text-xs font-mono text-zinc-400 font-medium truncate">
            {attachedFilesCount > 0 ? (
              <span>
                <strong className="text-white">{attachedFilesCount}</strong> {u.readyToPreserve}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-amber-400 hover:underline cursor-pointer"
              >
                + {lang === 'hi' ? 'PDF फ़ाइल जोड़ें' : 'Select PDF File'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-2 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white rounded-xl transition cursor-pointer"
            >
              {u.cancel}
            </button>
            <button
              type="button"
              onClick={handleSubmitAll}
              disabled={isSubmitting}
              className="px-4 sm:px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-extrabold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-mono uppercase tracking-wider"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {u.uploading} ({uploadProgress}%)
                  </span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>
                    {u.uploadAll} ({attachedFilesCount || 1})
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
