import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Loader2, ArrowLeft } from 'lucide-react';
import HikmahPdfReader from '../components/HikmahPdfReader';
import { getBookById, incrementViews, incrementDownloads } from '../services/supabaseApi';
import { translations } from '../locales/translations';

export default function ReaderPage({ lang, t }) {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentLang = lang || localStorage.getItem('chetna_lang') || 'hi';
  const tr = t || translations[currentLang] || translations.hi;

  useEffect(() => {
    async function loadBook() {
      if (!bookId) return;
      setIsLoading(true);
      try {
        const data = await getBookById(bookId);
        if (data) {
          setBook(data);
          incrementViews(bookId).catch(console.error);
        } else {
          setError('Book not found');
        }
      } catch (err) {
        console.error('Error loading book in reader:', err);
        setError(err.message || 'Error loading book');
      } finally {
        setIsLoading(false);
      }
    }
    loadBook();
  }, [bookId]);

  const handleDownload = async (bookToDownload) => {
    const b = bookToDownload || book;
    if (!b || !b.file_url) return;
    try {
      if (b.id) incrementDownloads(b.id).catch(console.error);
      const res = await fetch(b.file_url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const rawName = b.title_en || b.title_hi || 'chetna_ebook';
      const safeName = rawName.replace(/[/\\?%*:|"<>]/g, '_') + '.pdf';

      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = safeName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        try {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(blobUrl);
        } catch (e) {}
      }, 3000);
    } catch (err) {
      window.open(b.file_url, '_blank');
    }
  };

  const handleClose = () => {
    try {
      window.close();
    } catch (e) {}
    // If window.close() didn't close tab (e.g. navigation within same tab)
    if (!window.closed) {
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#18181b] text-white flex flex-col items-center justify-center gap-3">
        <BookOpen className="w-12 h-12 text-[#1d4ed8] animate-pulse" />
        <p className="text-sm font-semibold">{tr.reader?.openingReader || 'Opening reader...'}</p>
        <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="fixed inset-0 bg-[#18181b] text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-lg font-bold mb-2 font-rekhta-serif">
          {currentLang === 'hi' ? 'रचना उपलब्ध नहीं है' : (currentLang === 'ur' ? 'کتاب دستیاب نہیں ہے' : 'Treatise Not Found')}
        </h2>
        <p className="text-xs text-stone-400 mb-6 max-w-sm">
          {currentLang === 'hi'
            ? 'यह पुस्तक हटा दी गई है या इसका लिंक अमान्य है।'
            : (currentLang === 'ur'
              ? 'یہ کتاب کتب خانے میں موجود نہیں ہے۔'
              : 'This book could not be found or may have been removed.')}
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{tr.reader?.backToCatalog || 'Return to Library'}</span>
        </button>
      </div>
    );
  }

  return (
    <HikmahPdfReader
      book={book}
      onClose={handleClose}
      onDownloadBook={handleDownload}
      lang={currentLang}
      t={tr}
    />
  );
}
