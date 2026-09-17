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

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const HISTORICAL_ERAS = [
  "Contemporary Era (2000–Present) / समकालीन युग",
  "Post-Independence Era (1947–1980) / स्वातंत्र्योत्तर काल",
  "Progressive Era (1930–1947) / प्रगतिशील दौर",
  "Chhayavad Era (1918–1936) / छायावाद युग",
  "Dwivedi Era (1900–1918) / द्विवेदी युग",
  "Bharatendu Era (1868–1900) / भारतेंदु युग",
  "Late Mughal & British Colonial (1800–1857) / उत्तर मुग़ल काल",
  "Bhakti & Sufi Movement (1400–1750) / भक्ति व सूफ़ी काल",
  "Classical & Ancient Heritage / प्राचीन व शास्त्रीय काल"
];

export default function UploadBookModal({
  isOpen,
  onClose,
  onBookUploaded,
  onCategoryCreated,
  onSubGenreCreated,
  categories = [],
  lang,
  t
}) {
  const [fileQueue, setFileQueue] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [allCategories, setAllCategories] = useState(categories || []);
  const [translatingField, setTranslatingField] = useState(null);

  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const translationTimeoutRef = useRef(null);

  const fetchUpdatedCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setAllCategories(data.categories || []);
      }
    } catch (e) {
      console.error(e);
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
    const baseName = file.name.replace(/\.pdf$/i, '');
    const cleanName = baseName.replace(/[-_]+/g, ' ').trim();

    const defaultFormat = allCategories[0] || { id: 'novel', genres: [] };
    const defaultGenre = defaultFormat.genres?.[0] || { id: 'social-realism', subgenres: [] };
    const defaultSub = defaultGenre.subgenres?.[0] || { id: 'general' };

    const item = {
      file,
      fileName: file.name,
      title_hi: cleanName,
      title_en: cleanName,
      title_ur: cleanName,
      author_hi: '',
      author_en: '',
      author_ur: '',
      category: defaultFormat.id, // Format
      genre: defaultGenre.id, // Genre (conditional on format)
      subgenre: defaultSub.id, // Subgenre (conditional on genre)
      era: 'Contemporary Era (2000–Present) / समकालीन युग',
      year: new Date().getFullYear().toString(),
      publisher: 'चेतना डिजिटल अभिलेखागार',
      description: '',
      description_en: '',
      coverFile: null,
      coverPreview: null,
      pages: 50,
      is_featured: false
    };

    // Extract Cover from PDF Page 1
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

    // Auto-translate initial title
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanName, sourceLang: 'auto' })
      });
      const data = await res.json();
      if (data && data.translations) {
        if (data.translations.hi) item.title_hi = data.translations.hi;
        if (data.translations.en) item.title_en = data.translations.en;
        if (data.translations.ur) item.title_ur = data.translations.ur;
      }
    } catch (_) {}

    return item;
  };

  const handleFilesAdded = async (files) => {
    const pdfFiles = Array.from(files).filter(
      f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );

    if (pdfFiles.length === 0) {
      setStatusMessage({ type: 'error', text: 'Please select valid PDF files.' });
      return;
    }

    setStatusMessage({ type: 'info', text: 'Analyzing ' + pdfFiles.length + ' PDF file(s)...' });
    
    const newItems = [];
    for (const file of pdfFiles) {
      const item = await processSinglePdf(file);
      newItems.push(item);
    }

    setFileQueue(prev => [...prev, ...newItems]);
    setStatusMessage({ type: 'success', text: 'Added ' + pdfFiles.length + ' file(s) to queue.' });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const handleSelectFiles = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesAdded(e.target.files);
    }
  };

  const currentItem = fileQueue[selectedIndex] || null;

  const updateCurrentItem = (fields) => {
    setFileQueue(prev => {
      if (!prev || !prev[selectedIndex]) return prev;
      const next = [...prev];
      next[selectedIndex] = { ...next[selectedIndex], ...fields };
      return next;
    });
  };

  const handleAutoTranslateField = (fieldGroup, text, sourceLang) => {
    if (translationTimeoutRef.current) {
      clearTimeout(translationTimeoutRef.current);
    }

    if (!text || !text.trim()) return;

    setTranslatingField(fieldGroup);

    translationTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: text.trim(), sourceLang })
        });
        const data = await res.json();
        if (data && data.success && data.translations) {
          setFileQueue(prev => {
            if (!prev || !prev[selectedIndex]) return prev;
            const next = [...prev];
            const item = next[selectedIndex];
            if (fieldGroup === 'title') {
              next[selectedIndex] = {
                ...item,
                title_hi: sourceLang === 'hi' ? text : (data.translations.hi || item.title_hi),
                title_en: sourceLang === 'en' ? text : (data.translations.en || item.title_en),
                title_ur: sourceLang === 'ur' ? text : (data.translations.ur || item.title_ur)
              };
            } else if (fieldGroup === 'author') {
              next[selectedIndex] = {
                ...item,
                author_hi: sourceLang === 'hi' ? text : (data.translations.hi || item.author_hi),
                author_en: sourceLang === 'en' ? text : (data.translations.en || item.author_en),
                author_ur: sourceLang === 'ur' ? text : (data.translations.ur || item.author_ur)
              };
            }
            return next;
          });
        }
      } catch (err) {
        console.warn('Auto translation warning:', err);
      } finally {
        setTranslatingField(null);
      }
    }, 350);
  };

  // 1. Create New Format (Level 1)
  const handleCreateFormat = async (typedName) => {
    try {
      setStatusMessage({ type: 'info', text: 'Creating new Format "' + typedName + '"...' });
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: typedName })
      });
      const data = await res.json();
      if (data.success && data.category) {
        await fetchUpdatedCategories();
        updateCurrentItem({
          category: data.category.id,
          genre: '',
          subgenre: ''
        });
        if (onCategoryCreated) onCategoryCreated(data.category);
        setStatusMessage({ type: 'success', text: 'Created & selected new format: "' + (data.category.name_hi || data.category.name_en) + '"' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Error creating format: ' + err.message });
    }
  };

  // 1b. Delete Format (Level 1)
  const handleDeleteFormat = async (formatId) => {
    try {
      const res = await fetch('/api/categories/' + formatId, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await fetchUpdatedCategories();
        setStatusMessage({ type: 'success', text: 'Deleted format successfully.' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 2. Create New Genre (Level 2 - under active Format)
  const handleCreateGenre = async (typedName) => {
    const activeFormatId = currentItem?.category || 'novel';
    try {
      setStatusMessage({ type: 'info', text: 'Creating new genre "' + typedName + '" under ' + activeFormatId + '...' });
      const res = await fetch('/api/categories/' + activeFormatId + '/genres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: typedName })
      });
      const data = await res.json();
      if (data.success && data.genre) {
        await fetchUpdatedCategories();
        updateCurrentItem({
          genre: data.genre.id,
          subgenre: ''
        });
        setStatusMessage({ type: 'success', text: 'Created & selected new genre: "' + (data.genre.name_hi || data.genre.name_en) + '"' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Error creating genre: ' + err.message });
    }
  };

  // 2b. Delete Genre (Level 2)
  const handleDeleteGenre = async (genreId) => {
    const activeFormatId = currentItem?.category || 'novel';
    try {
      const res = await fetch('/api/categories/' + activeFormatId + '/genres/' + genreId, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await fetchUpdatedCategories();
        setStatusMessage({ type: 'success', text: 'Deleted genre successfully.' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Create New Subgenre (Level 3 - under active Genre)
  const handleCreateSubGenre = async (typedName) => {
    const activeFormatId = currentItem?.category || 'novel';
    const activeGenreId = currentItem?.genre || 'social-realism';
    try {
      setStatusMessage({ type: 'info', text: 'Creating new sub-genre "' + typedName + '"...' });
      const res = await fetch('/api/categories/' + activeFormatId + '/genres/' + activeGenreId + '/subgenres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: typedName })
      });
      const data = await res.json();
      if (data.success && data.subgenre) {
        await fetchUpdatedCategories();
        updateCurrentItem({ subgenre: data.subgenre.id });
        if (onSubGenreCreated) onSubGenreCreated(data.subgenre);
        setStatusMessage({ type: 'success', text: 'Created & selected new sub-genre: "' + (data.subgenre.name_hi || data.subgenre.name_en) + '"' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Error creating sub-genre: ' + err.message });
    }
  };

  // 3b. Delete Subgenre (Level 3)
  const handleDeleteSubGenre = async (subId) => {
    const activeFormatId = currentItem?.category || 'novel';
    const activeGenreId = currentItem?.genre || 'social-realism';
    try {
      const res = await fetch('/api/categories/' + activeFormatId + '/genres/' + activeGenreId + '/subgenres/' + subId, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        await fetchUpdatedCategories();
        setStatusMessage({ type: 'success', text: 'Deleted sub-genre successfully.' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 1. Format Options
  const formatOptions = allCategories.map(c => ({
    id: c.id,
    label: (c.name_hi || c.name_en) + (c.name_en && c.name_en !== c.name_hi ? ' (' + c.name_en + ')' : ''),
    name_hi: c.name_hi || '',
    name_en: c.name_en || '',
    name_ur: c.name_ur || '',
    raw: c
  }));

  // 2. Genre Options (CONDITIONAL based on selected Format)
  const activeFormatObj = allCategories.find(c => c.id === currentItem?.category) || allCategories[0];
  const genreOptions = (activeFormatObj?.genres || []).map(g => ({
    id: g.id,
    label: (g.name_hi || g.name_en) + (g.name_en && g.name_en !== g.name_hi ? ' (' + g.name_en + ')' : ''),
    name_hi: g.name_hi || '',
    name_en: g.name_en || '',
    name_ur: g.name_ur || '',
    raw: g
  }));

  // 3. Subgenre Options (CONDITIONAL based on selected Genre)
  const activeGenreObj = (activeFormatObj?.genres || []).find(
    g => g.id === currentItem?.genre || g.name_en?.toLowerCase() === currentItem?.genre?.toLowerCase() || g.name_hi === currentItem?.genre
  ) || activeFormatObj?.genres?.[0];

  const subgenreOptions = (activeGenreObj?.subgenres || []).map(sg => ({
    id: sg.id,
    label: (sg.name_hi || sg.name_en) + (sg.name_en && sg.name_en !== sg.name_hi ? ' (' + sg.name_en + ')' : ''),
    name_hi: sg.name_hi || '',
    name_en: sg.name_en || '',
    name_ur: sg.name_ur || '',
    raw: sg
  }));

  const handleRemoveFromQueue = (index, e) => {
    e?.stopPropagation();
    setFileQueue(prev => {
      const next = prev.filter((_, i) => i !== index);
      if (selectedIndex >= next.length) {
        setSelectedIndex(Math.max(0, next.length - 1));
      }
      return next;
    });
  };

  const handleCustomCover = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    updateCurrentItem({
      coverFile: file,
      coverPreview: URL.createObjectURL(file)
    });
  };

  const handleSubmitAll = async () => {
    if (fileQueue.length === 0) {
      setStatusMessage({ type: 'error', text: 'Queue is empty. Please add PDF files to upload.' });
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);
    setStatusMessage({ type: 'info', text: 'Uploading ' + fileQueue.length + ' book(s) into Chetna Digital Library...' });

    let successCount = 0;

    for (let i = 0; i < fileQueue.length; i++) {
      const item = fileQueue[i];
      setUploadProgress(Math.round(((i + 1) / fileQueue.length) * 100));

      const formData = new FormData();
      formData.append('pdf', item.file);
      if (item.coverFile) {
        formData.append('cover', item.coverFile);
      }
      formData.append('title_hi', item.title_hi || item.title_en || 'अनाम कृति');
      formData.append('title_en', item.title_en || item.title_hi || 'Untitled Literary Work');
      formData.append('title_ur', item.title_ur || item.title_hi || 'نامعلوم کتاب');
      formData.append('author_hi', item.author_hi || item.author_en || 'अज्ञात रचनाकार');
      formData.append('author_en', item.author_en || item.author_hi || 'Unknown Author');
      formData.append('author_ur', item.author_ur || item.author_hi || 'نامعلوم مصنف');
      formData.append('category', item.category || 'novel');
      formData.append('genre', item.genre || 'social-realism');
      formData.append('subgenre', item.subgenre || 'general');
      formData.append('era', item.era || 'Contemporary Era (2000–Present) / समकालीन युग');
      formData.append('year', item.year || new Date().getFullYear().toString());
      formData.append('publisher', item.publisher || 'चेतना डिजिटल अभिलेखागार');
      formData.append('pages', item.pages || 50);
      formData.append('description', item.description || '');
      formData.append('description_en', item.description_en || '');
      formData.append('is_featured', item.is_featured ? 'true' : 'false');
      formData.append('language', 'Hindi / English / Urdu');
      formData.append('tag', 'साहित्य');

      try {
        let pdfUrl = '';
        let coverUrl = '';
        if (item.file) {
          pdfUrl = await uploadBookFile(item.file, 'books');
        }
        if (item.coverFile) {
          coverUrl = await uploadBookFile(item.coverFile, 'covers');
        }

        const bookRecord = await createBookRecord({
          title_hi: item.title_hi || item.title_en || 'अनाम कृति',
          title_en: item.title_en || item.title_hi || 'Untitled Literary Work',
          title_ur: item.title_ur || item.title_hi || '',
          author_hi: item.author_hi || item.author_en || 'अज्ञात रचनाकार',
          author_en: item.author_en || item.author_hi || 'Unknown Author',
          author_ur: item.author_ur || item.author_hi || '',
          category: item.category || 'novel',
          genre: item.genre || 'social-realism',
          subgenre: item.subgenre || 'general',
          era: item.era || 'Contemporary Era (2000–Present) / समकालीन युग',
          year: String(item.year || new Date().getFullYear()),
          publisher: item.publisher || 'चेतना डिजिटल अभिलेखागार',
          pages: parseInt(item.pages) || 50,
          description: item.description || '',
          description_en: item.description_en || '',
          is_featured: !!item.is_featured,
          language: 'Hindi / English / Urdu',
          tag: 'साहित्य',
          file_url: pdfUrl,
          cover_url: coverUrl
        });

        if (bookRecord) {
          successCount++;
          if (onBookUploaded) onBookUploaded(bookRecord);
        }
      } catch (err) {
        console.error('Failed to upload ' + item.fileName + ' to Supabase:', err);
      }
    }

    setUploadProgress(100);
    setIsSubmitting(false);

    if (successCount === fileQueue.length) {
      setStatusMessage({ type: 'success', text: 'Successfully uploaded all ' + successCount + ' e-books to Chetna Library!' });
      setTimeout(() => {
        onClose();
      }, 1400);
    } else {
      setStatusMessage({ type: 'warning', text: 'Uploaded ' + successCount + ' of ' + fileQueue.length + ' files. Check console for errors.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-fadeIn">
        
        {/* 1. Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1d4ed8] flex items-center justify-center border border-blue-200/80 shadow-2xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-lg font-rekhta-serif tracking-tight">
                Upload E-Books (Multi-File Batch Uploader)
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                3-Tier Hierarchy: Select Format ➔ Conditional Genre ➔ Conditional Subgenre
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Message Notification Bar */}
        {statusMessage.text && (
          <div className={"px-6 py-2.5 text-xs font-semibold flex items-center justify-between border-b " + (
            statusMessage.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' :
            statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
            statusMessage.type === 'warning' ? 'bg-amber-50 text-amber-800 border-amber-200' :
            'bg-blue-50 text-blue-800 border-blue-200'
          )}>
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
              {statusMessage.type === 'info' && <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />}
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage({ type: '', text: '' })} className="text-stone-400 hover:text-stone-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 2. Main Two-Column Body Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Column: Upload Queue & File Dropzone */}
          <div className="w-full md:w-72 lg:w-80 border-r border-stone-200 bg-stone-50/60 flex flex-col shrink-0">
            <div className="p-3.5 border-b border-stone-200 flex items-center justify-between bg-white">
              <span className="text-xs font-bold text-stone-700 tracking-wider">
                UPLOAD QUEUE ({fileQueue.length})
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#1d4ed8] text-xs font-bold rounded-lg border border-blue-200/80 flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add PDFs</span>
              </button>
            </div>

            {/* Dropzone Area */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={"m-3 p-4 border-2 border-dashed rounded-xl text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 " + (
                isDragging
                  ? "border-[#1d4ed8] bg-blue-50/50 scale-[0.99]"
                  : "border-stone-300 hover:border-[#1d4ed8] hover:bg-white bg-white/70"
              )}
            >
              <Upload className="w-7 h-7 text-[#1d4ed8]/70" />
              <div className="text-xs font-bold text-stone-700">
                Drag & Drop PDF Files Here
              </div>
              <div className="text-[10.5px] text-stone-400 font-medium">
                Supports multiple simultaneous e-books
              </div>
            </div>

            {/* Scrollable File List */}
            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5 divide-y divide-stone-100">
              {fileQueue.length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-400 italic">
                  No files added yet. Drop PDF files above.
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
                          ? "bg-white border-[#1d4ed8] shadow-sm ring-1 ring-[#1d4ed8]/30 font-semibold"
                          : "bg-white hover:bg-stone-100 border-stone-200/70 text-stone-700"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-10 bg-stone-100 rounded-md border border-stone-200 flex items-center justify-center shrink-0 overflow-hidden">
                          {item.coverPreview ? (
                            <img src={item.coverPreview} alt="Cover" className="w-full h-full object-cover" />
                          ) : (
                            <FileText className="w-4 h-4 text-stone-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs text-stone-900 font-hindi-serif">
                            {item.title_hi || item.title_en || item.fileName}
                          </p>
                          <span className="text-[10px] text-stone-400 block truncate">
                            {item.pages} pgs • {item.author_hi || item.author_en || 'Unknown'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleRemoveFromQueue(idx, e)}
                        className="p-1 text-stone-400 hover:text-red-600 rounded-lg hover:bg-stone-100 transition shrink-0"
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
              accept="application/pdf"
              onChange={handleSelectFiles}
              className="hidden"
            />
          </div>

          {/* Right Column: Active Item Editor */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4">
            {currentItem ? (
              <>
                {/* 1. File Pagination Pill Header */}
                <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1d4ed8]">
                    <FileText className="w-4 h-4" />
                    <span>File {selectedIndex + 1} of {fileQueue.length}: {currentItem.fileName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-stone-400">
                    <button
                      onClick={() => setSelectedIndex(Math.max(0, selectedIndex - 1))}
                      disabled={selectedIndex === 0}
                      className="p-1 rounded hover:bg-blue-100 text-stone-600 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedIndex(Math.min(fileQueue.length - 1, selectedIndex + 1))}
                      disabled={selectedIndex === fileQueue.length - 1}
                      className="p-1 rounded hover:bg-blue-100 text-stone-600 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 2. Auto-Translation Notice */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-bold">Auto-Translation Active:</span> Typing Title or Author in any one language automatically transliterates & populates the other languages.
                  </div>
                </div>

                {/* 3. Centered Cover Image Block */}
                <div className="flex items-center justify-center gap-6 p-4 bg-stone-50/60 rounded-xl border border-stone-200">
                  <div className="w-24 aspect-[3/4] bg-stone-100 rounded-lg overflow-hidden border border-stone-200 shadow-sm shrink-0 flex items-center justify-center">
                    {currentItem.coverPreview ? (
                      <img src={currentItem.coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-7 h-7 text-stone-300" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-stone-800">Cover Image (Optional)</h5>
                    <p className="text-[11px] text-stone-500">
                      If omitted, Page 1 thumbnail is extracted automatically
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
                        className="px-3.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-2xs transition cursor-pointer"
                      >
                        Choose File
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Multi-Script Title Inputs */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
                    <span>Book Title (पुस्तक का नाम) *</span>
                    {translatingField === 'title' && (
                      <span className="text-[10.5px] text-[#1d4ed8] flex items-center gap-1 font-semibold">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Transliterating...</span>
                      </span>
                    )}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <input
                      type="text"
                      placeholder="Title (हिंदी / देवनागरी)"
                      value={currentItem.title_hi}
                      onChange={(e) => {
                        const v = e.target.value;
                        updateCurrentItem({ title_hi: v });
                        handleAutoTranslateField('title', v, 'hi');
                      }}
                      className="px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1d4ed8] focus:border-[#1d4ed8] outline-hidden bg-white text-stone-900 font-hindi-serif shadow-2xs"
                    />
                    <input
                      type="text"
                      placeholder="Title (English)"
                      value={currentItem.title_en}
                      onChange={(e) => {
                        const v = e.target.value;
                        updateCurrentItem({ title_en: v });
                        handleAutoTranslateField('title', v, 'en');
                      }}
                      className="px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1d4ed8] focus:border-[#1d4ed8] outline-hidden bg-white text-stone-900 shadow-2xs"
                    />
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="کتاب کا نام (اردو)"
                      value={currentItem.title_ur}
                      onChange={(e) => {
                        const v = e.target.value;
                        updateCurrentItem({ title_ur: v });
                        handleAutoTranslateField('title', v, 'ur');
                      }}
                      className="px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1d4ed8] focus:border-[#1d4ed8] outline-hidden bg-white text-stone-900 font-urdu shadow-2xs text-right"
                    />
                  </div>
                </div>

                {/* 5. Multi-Script Author Inputs */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
                    <span>Author / Creator (रचनाकार / लेखक) *</span>
                    {translatingField === 'author' && (
                      <span className="text-[10.5px] text-[#1d4ed8] flex items-center gap-1 font-semibold">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Transliterating...</span>
                      </span>
                    )}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <input
                      type="text"
                      placeholder="Author (हिंदी / देवनागरी)"
                      value={currentItem.author_hi}
                      onChange={(e) => {
                        const v = e.target.value;
                        updateCurrentItem({ author_hi: v });
                        handleAutoTranslateField('author', v, 'hi');
                      }}
                      className="px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1d4ed8] focus:border-[#1d4ed8] outline-hidden bg-white text-stone-900 shadow-2xs"
                    />
                    <input
                      type="text"
                      placeholder="Author (English)"
                      value={currentItem.author_en}
                      onChange={(e) => {
                        const v = e.target.value;
                        updateCurrentItem({ author_en: v });
                        handleAutoTranslateField('author', v, 'en');
                      }}
                      className="px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1d4ed8] focus:border-[#1d4ed8] outline-hidden bg-white text-stone-900 shadow-2xs"
                    />
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="مصنف کا نام (اردو)"
                      value={currentItem.author_ur}
                      onChange={(e) => {
                        const v = e.target.value;
                        updateCurrentItem({ author_ur: v });
                        handleAutoTranslateField('author', v, 'ur');
                      }}
                      className="px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1d4ed8] focus:border-[#1d4ed8] outline-hidden bg-white text-stone-900 font-urdu shadow-2xs text-right"
                    />
                  </div>
                </div>

                {/* 6. 3-TIER HIERARCHY: Format -> Conditional Genre -> Conditional Subgenre */}
                <div className="space-y-3 p-4 bg-stone-50/90 rounded-2xl border border-stone-200">
                  <div className="flex items-center gap-2 pb-1 border-b border-stone-200/80">
                    <FolderTree className="w-4 h-4 text-[#1d4ed8]" />
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                      3-Tier Classification Hierarchy
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {/* Level 1: Format */}
                    <div>
                      <SearchableCombobox
                        label="1. Format / प्रारूप *"
                        type="format"
                        value={currentItem.category}
                        options={formatOptions}
                        searchPlaceholder="Search or create format..."
                        onChange={(catId, opt) => {
                          const targetCat = allCategories.find(c => c.id === catId);
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

                    {/* Level 2: Genre (CONDITIONAL on Format) */}
                    <div>
                      <SearchableCombobox
                        label="2. Genre / विधा *"
                        type="genre"
                        value={currentItem.genre}
                        options={genreOptions}
                        searchPlaceholder="Search or create genre under this format..."
                        onChange={(genreId, opt) => {
                          const targetGenre = (activeFormatObj?.genres || []).find(g => g.id === genreId);
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

                    {/* Level 3: Subgenre (CONDITIONAL on Genre) */}
                    <div>
                      <SearchableCombobox
                        label="3. Subgenre / उप-विधा *"
                        type="subgenre"
                        value={currentItem.subgenre}
                        options={subgenreOptions}
                        searchPlaceholder="Search or create subgenre under this genre..."
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
                    <label className="text-xs font-bold text-stone-800 block mb-1">
                      Historical Era / Epoch (Dropdown)
                    </label>
                    <select
                      value={currentItem.era}
                      onChange={(e) => updateCurrentItem({ era: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1d4ed8] outline-hidden bg-white shadow-2xs cursor-pointer"
                    >
                      {HISTORICAL_ERAS.map(he => (
                        <option key={he} value={he}>{he}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-800 block mb-1">
                      Year (CE)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1936"
                      value={currentItem.year}
                      onChange={(e) => updateCurrentItem({ year: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1d4ed8] outline-hidden bg-white shadow-2xs"
                    />
                  </div>
                </div>

                {/* 8. Publisher & Page Count */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-800 block mb-1">
                      Publisher / Source (प्रकाशक / स्रोत)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. सरस्वती प्रेस, इलाहाबाद"
                      value={currentItem.publisher}
                      onChange={(e) => updateCurrentItem({ publisher: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1d4ed8] outline-hidden bg-white shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-800 block mb-1">
                      Page Count (पृष्ठ संख्या)
                    </label>
                    <input
                      type="number"
                      value={currentItem.pages}
                      onChange={(e) => updateCurrentItem({ pages: parseInt(e.target.value) || 1 })}
                      className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1d4ed8] outline-hidden bg-white shadow-2xs"
                    />
                  </div>
                </div>

                {/* 9. Description */}
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Book Synopsis & Cultural Significance (सार व महत्व)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter short description of the book..."
                    value={currentItem.description}
                    onChange={(e) => updateCurrentItem({ description: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1d4ed8] outline-hidden bg-white shadow-2xs resize-none"
                  />
                </div>

                {/* 10. Featured Flag */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="featuredCheckbox"
                    checked={currentItem.is_featured}
                    onChange={(e) => updateCurrentItem({ is_featured: e.target.checked })}
                    className="w-4 h-4 text-[#1d4ed8] rounded border-stone-300 focus:ring-[#1d4ed8] cursor-pointer"
                  />
                  <label htmlFor="featuredCheckbox" className="text-xs font-semibold text-stone-700 cursor-pointer">
                    Highlight as Landmark Masterpiece (Feature on Homepage Shelves)
                  </label>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center text-stone-400 space-y-2">
                <FileText className="w-12 h-12 stroke-[1.5]" />
                <p className="text-sm font-semibold">No file selected from queue</p>
                <p className="text-xs">Select or add a PDF file from the left sidebar to edit details.</p>
              </div>
            )}
          </div>

        </div>

        {/* 3. Footer Action Bar */}
        <div className="px-6 py-3.5 border-t border-stone-200 bg-stone-50 flex items-center justify-between shrink-0">
          <div className="text-xs text-stone-500 font-medium">
            {fileQueue.length > 0 ? (
              <span>Queue: <strong>{fileQueue.length}</strong> file(s) ready to preserve</span>
            ) : (
              <span>Upload queue is empty</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-200/60 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitAll}
              disabled={isSubmitting || fileQueue.length === 0}
              className="px-5 py-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading ({uploadProgress}%)...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload & Preserve All ({fileQueue.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
