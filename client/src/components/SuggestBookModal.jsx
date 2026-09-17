import React, { useState } from 'react';
import { X, Send, Sparkles, BookMarked, CheckCircle2, Heart } from 'lucide-react';

export default function SuggestBookModal({
  isOpen,
  onClose,
  lang = 'hi',
  t
}) {
  if (!isOpen) return null;

  const s = t?.suggest || {};

  const [bookTitle, setBookTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [category, setCategory] = useState('novel');
  const [reason, setReason] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!bookTitle.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      try {
        const storedSuggestions = JSON.parse(localStorage.getItem('chetna_book_suggestions') || '[]');
        storedSuggestions.push({
          bookTitle,
          authorName,
          category,
          reason,
          userEmail,
          submittedAt: new Date().toISOString()
        });
        localStorage.setItem('chetna_book_suggestions', JSON.stringify(storedSuggestions));
      } catch (e) {}

      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setBookTitle('');
    setAuthorName('');
    setReason('');
    setUserEmail('');
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 my-auto overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-gradient-to-r from-stone-900 via-stone-800 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-rekhta-serif tracking-tight text-white">
                {s.title || 'Suggest a Book for Digitization'}
              </h2>
              <p className="text-[11.5px] text-stone-300 font-normal">
                {s.subtitle || 'Recommend rare manuscripts and literary works'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 font-rekhta-serif">
              {s.successTitle || 'Suggestion Received!'}
            </h3>
            <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
              {s.successDesc || 'Our archival digitization team will review the recommended treatise.'}
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
            >
              {s.done || 'Done'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            <div>
              <label className="font-bold text-stone-700 block mb-1.5">
                {s.bookTitleLabel || 'Book / Treatise Title *'}
              </label>
              <input
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                placeholder={s.bookTitlePlaceholder || 'Enter title of the work...'}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/15 outline-hidden transition"
                required
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1.5">
                  {s.authorLabel || 'Author / Creator'}
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder={s.authorPlaceholder || 'Author name...'}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden transition"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1.5">
                  {s.categoryLabel || 'Category / Format'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden cursor-pointer"
                >
                  <option value="novel">{t.nav.novel}</option>
                  <option value="story">{t.nav.story}</option>
                  <option value="poetry">{t.nav.poetry}</option>
                  <option value="magazines">{t.nav.magazines}</option>
                  <option value="vimarsh">{t.nav.vimarsh}</option>
                  <option value="cultural-conscience">{t.nav.conscience}</option>
                  <option value="satire">{t.nav.satire}</option>
                  <option value="drama">{t.nav.drama}</option>
                  <option value="essays">{t.nav.essays}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1.5">
                {s.reasonLabel || 'Why should this book be added?'}
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows="3"
                placeholder={s.reasonPlaceholder || 'Describe why this work should be preserved in Chetna Library...'}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden leading-relaxed"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1.5">
                {s.emailLabel || 'Your Email (Optional, for notifications)'}
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] outline-hidden transition"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-stone-600 hover:bg-stone-100 rounded-xl font-semibold transition cursor-pointer"
              >
                {s.cancel || 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !bookTitle.trim()}
                className="px-5 py-2.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 hover:-translate-y-0.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? (s.submitting || '...') : (s.submitBtn || 'Submit Recommendation')}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
