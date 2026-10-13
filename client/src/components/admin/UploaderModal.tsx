import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { uploadBookFile, createBookRecord } from '../../services/supabaseApi';

export interface UploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories?: any[];
  onUploadSuccess?: (book: any) => void;
  onSuccess?: (book: any) => void;
  lang?: string;
  t?: any;
}

export const UploaderModal: React.FC<UploaderModalProps> = ({
  isOpen,
  onClose,
  categories = [],
  onUploadSuccess,
  onSuccess,
  lang = 'hi',
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Form Fields
  const [categoryId, setCategoryId] = useState('');
  const [genreId, setGenreId] = useState('');
  const [subgenreId, setSubgenreId] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [titleHi, setTitleHi] = useState('');
  const [authorEn, setAuthorEn] = useState('');
  const [authorHi, setAuthorHi] = useState('');
  const [scriptLang, setScriptLang] = useState('hi');
  const [historicalEra, setHistoricalEra] = useState('contemporary');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive cascaded genres and subgenres
  const activeCategory = categories.find((c) => c.id === categoryId);
  const availableGenres = activeCategory?.genres || [];
  const activeGenre = availableGenres.find((g: any) => g.id === genreId);
  const availableSubgenres = activeGenre?.subgenres || [];

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCategoryId(val);
    setGenreId('');
    setSubgenreId('');
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setGenreId(val);
    setSubgenreId('');
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage('');
    const validExtensions = ['.pdf', '.epub'];
    const lowerName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => lowerName.endsWith(ext));

    if (!isValid) {
      setErrorMessage('Please select a valid .pdf or .epub file.');
      return;
    }

    if (file.size > 150 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 150MB limit.');
      return;
    }

    setSelectedFile(file);

    if (!titleEn && !titleHi) {
      const cleanBase = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .trim();
      setTitleEn(cleanBase);
      setTitleHi(cleanBase);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please attach a .pdf or .epub file to upload.');
      return;
    }

    if (!categoryId) {
      setErrorMessage('Please select a taxonomy Category.');
      return;
    }

    if (!titleEn && !titleHi) {
      setErrorMessage('Please specify at least one title (Title or Vernacular Title).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setUploadProgress('Uploading file to Supabase storage...');

    try {
      const fileUrl = await uploadBookFile(selectedFile, 'books');

      setUploadProgress('Indexing metadata into library catalog...');

      const record = {
        title_en: titleEn.trim() || titleHi.trim(),
        title_hi: titleHi.trim() || titleEn.trim(),
        author_en: authorEn.trim() || authorHi.trim() || 'Chetna Archive',
        author_hi: authorHi.trim() || authorEn.trim() || 'चेतना संग्रह',
        category: categoryId,
        genre: genreId || null,
        subgenre: subgenreId || null,
        language: scriptLang,
        script: scriptLang === 'hi' ? 'Devanagari' : scriptLang === 'ur' ? 'Nastaliq' : 'Latin',
        historical_era: historicalEra,
        file_url: fileUrl,
        file_name: selectedFile.name,
        file_size_bytes: selectedFile.size,
        format: selectedFile.name.toLowerCase().endsWith('.epub') ? 'epub' : 'pdf',
        is_featured: false,
      };

      const created = await createBookRecord(record);

      setSuccessMessage(`"${titleEn || titleHi}" successfully indexed into archive!`);
      if (onUploadSuccess) onUploadSuccess(created);
      if (onSuccess) onSuccess(created);

      setTimeout(() => {
        resetForm();
        onClose();
      }, 1800);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setErrorMessage(err.message || 'Failed to upload and ingest work. Please check your connection.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setTitleEn('');
    setTitleHi('');
    setAuthorEn('');
    setAuthorHi('');
    setCategoryId('');
    setGenreId('');
    setSubgenreId('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: 'spring', stiffness: 450, damping: 32 }}
          className="relative w-full max-w-2xl bg-[#141414] rounded-[24px] border border-white/[0.1] shadow-[0_24px_50px_rgba(0,0,0,0.8)] p-6 sm:p-8 my-8 overflow-hidden font-sans text-white"
        >
          {/* Top Bar Header */}
          <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] mb-6">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-white" />
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-400 block">
                  MUGEN STUDIO INGESTION · ADMIN ONLY
                </span>
                <h2 className="text-xl font-bold text-white tracking-[-0.03em]">
                  Ingest Literary Work
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/[0.08]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Drag and Drop Dropzone */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-2">
                DOCUMENT ASSET (.PDF, .EPUB)
              </label>

              {!selectedFile ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? 'border-white bg-white/[0.04]'
                      : 'border-white/[0.1] hover:border-white/30 bg-black/40 hover:bg-black/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.epub,application/pdf,application/epub+zip"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-[#141414] border border-white/[0.08] text-white flex items-center justify-center mx-auto mb-3">
                    <UploadCloud className="w-6 h-6 text-zinc-300" />
                  </div>
                  <p className="text-sm font-semibold text-white">
                    Drag and drop manuscript file here
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Supports high-resolution PDF or EPUB up to 150MB
                  </p>
                  <span className="inline-block mt-3 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-[10px] font-mono uppercase tracking-wider text-zinc-300">
                    Browse Local File
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-black/50 border border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#141414] border border-white/[0.08] flex items-center justify-center text-white">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white truncate max-w-[280px] sm:max-w-[380px]">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] font-mono text-zinc-400">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · {selectedFile.name.split('.').pop()?.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    disabled={isSubmitting}
                    className="p-2 text-zinc-400 hover:text-red-400 rounded-lg hover:bg-white/[0.06] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* 2. Cascading Dropdowns: Category -> Genre -> Sub-genre */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Category */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-1.5">
                  1. CATEGORY *
                </label>
                <div className="relative">
                  <select
                    value={categoryId}
                    onChange={handleCategoryChange}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/[0.1] text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-white focus:border-white appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#141414]">Select Category...</option>
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id} className="bg-[#141414]">
                        {c.name_en || c.name_hi} ({c.name_hi || c.name_en})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Genre */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-1.5">
                  2. GENRE
                </label>
                <div className="relative">
                  <select
                    value={genreId}
                    onChange={handleGenreChange}
                    disabled={!categoryId || availableGenres.length === 0}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/[0.1] text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-white focus:border-white appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <option value="" className="bg-[#141414]">Select Genre...</option>
                    {availableGenres.map((g: any) => (
                      <option key={g.id} value={g.id} className="bg-[#141414]">
                        {g.name_en || g.name_hi}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Sub-genre */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-1.5">
                  3. SUB-GENRE
                </label>
                <div className="relative">
                  <select
                    value={subgenreId}
                    onChange={(e) => setSubgenreId(e.target.value)}
                    disabled={!genreId || availableSubgenres.length === 0}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/[0.1] text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-white focus:border-white appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <option value="" className="bg-[#141414]">Select Sub-genre...</option>
                    {availableSubgenres.map((sg: any) => (
                      <option key={sg.id} value={sg.id} className="bg-[#141414]">
                        {sg.name_en || sg.name_hi}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* 3. Titles and Authors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-1.5">
                  PRIMARY TITLE (LATIN) *
                </label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. Godan, Rag Darbari"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/[0.1] text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-1.5">
                  VERNACULAR TITLE (DEVANAGARI / URDU)
                </label>
                <input
                  type="text"
                  value={titleHi}
                  onChange={(e) => setTitleHi(e.target.value)}
                  placeholder="उदा. गोदान, राग दरबारी"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/[0.1] text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-1.5">
                  AUTHOR NAME (ENGLISH)
                </label>
                <input
                  type="text"
                  value={authorEn}
                  onChange={(e) => setAuthorEn(e.target.value)}
                  placeholder="e.g. Munshi Premchand"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/[0.1] text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-1.5">
                  AUTHOR NAME (VERNACULAR)
                </label>
                <input
                  type="text"
                  value={authorHi}
                  onChange={(e) => setAuthorHi(e.target.value)}
                  placeholder="उदा. मुंशी प्रेमचंद"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/[0.1] text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>
            </div>

            {/* 4. Language Script & Historical Era */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-1.5">
                  LANGUAGE / SCRIPT
                </label>
                <select
                  value={scriptLang}
                  onChange={(e) => setScriptLang(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/[0.1] text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-white cursor-pointer"
                >
                  <option value="hi" className="bg-[#141414]">Devanagari (देवनागरी / Hindi)</option>
                  <option value="ur" className="bg-[#141414]">Nastaliq (اردو / Urdu)</option>
                  <option value="en" className="bg-[#141414]">Romanized (English)</option>
                  <option value="sa" className="bg-[#141414]">Sanskrit (संस्कृत)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-1.5">
                  HISTORICAL ERA
                </label>
                <select
                  value={historicalEra}
                  onChange={(e) => setHistoricalEra(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/[0.1] text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-white cursor-pointer"
                >
                  <option value="contemporary" className="bg-[#141414]">Contemporary (समकालीन)</option>
                  <option value="post-independence" className="bg-[#141414]">Post-Independence (स्वातंत्र्योत्तर)</option>
                  <option value="progressive" className="bg-[#141414]">Progressive Movement (प्रगतिवाद)</option>
                  <option value="chhayavad" className="bg-[#141414]">Chhayavad (छायावाद)</option>
                  <option value="dwivedi" className="bg-[#141414]">Dwivedi Era (द्विवेदी युग)</option>
                  <option value="bharatendu" className="bg-[#141414]">Bharatendu Era (भारतेन्दु युग)</option>
                  <option value="bhakti" className="bg-[#141414]">Bhakti Period (भक्तिकाल)</option>
                  <option value="classical" className="bg-[#141414]">Classical / Ancient (प्राचीन)</option>
                </select>
              </div>
            </div>

            {/* Feedback Alerts */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Actions Bar */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                {uploadProgress || 'PROTECTED VIA SUPABASE RBAC'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !selectedFile}
                  className="px-6 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-mono uppercase tracking-wider font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Ingesting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ingest into Archive</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UploaderModal;
