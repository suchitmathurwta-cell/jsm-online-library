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
      <div className="fixed inset-0 bg-[#161514] text-[#F4F1EA] flex flex-col items-center justify-center gap-3">
        <BookOpen className="w-10 h-10 text-[#A83324] animate-pulse" />
        <p className="text-xs font-mono tracking-wide">{tr.reader?.openingReader || 'ग्रंथ वाचन कक्ष खुल रहा है...'}</p>
        <Loader2 className="w-4 h-4 animate-spin text-[#7A746B]" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="fixed inset-0 bg-[#161514] text-[#F4F1EA] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-lg font-editorial font-bold mb-2">
          {currentLang === 'hi' ? 'रचना उपलब्ध नहीं है' : (currentLang === 'ur' ? 'کتاب دستیاب نہیں ہے' : 'Treatise Not Found')}
        </h2>
        <p className="text-xs text-[#D5CFC4] mb-6 max-w-sm font-mono">
          {currentLang === 'hi'
            ? 'यह पुस्तक हटा दी गई है या इसका लिंक अमान्य है।'
            : (currentLang === 'ur'
              ? 'یہ کتاب کتب خانے میں موجود نہیں ہے۔'
              : 'This book could not be found or may have been removed.')}
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-[#A83324] hover:bg-[#8C2A1E] text-white text-xs font-mono rounded-xs flex items-center gap-2 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{tr.reader?.backToCatalog || 'सूची पर लौटें'}</span>
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

