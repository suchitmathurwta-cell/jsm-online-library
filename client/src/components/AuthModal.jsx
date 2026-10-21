import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Sparkles, Download, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { translations } from '../locales/translations';

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'signin',
  bookTitle = '',
  lang = 'hi',
  t: customT
}) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const t = customT || translations[lang] || translations.hi;
  const authT = t.auth || translations.hi.auth;

  const [isSignUp, setIsSignUp] = useState(bookTitle ? true : initialMode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSignUp(bookTitle ? true : initialMode === 'signup');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, bookTitle, initialMode]);

  if (!isOpen) return null;

  const emailInputRef = React.useRef(null);

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    if (email && email.trim().includes('@')) {
      setIsLoading(true);
      try {
        await signIn(email.trim(), '');
        setSuccessMsg(
          lang === 'hi'
            ? 'सफलतापूर्वक साइन इन हो गया!'
            : lang === 'ur'
            ? 'لاگ ان مکمل ہو گیا!'
            : 'Signed in successfully!'
        );
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 200);
      } catch (err) {
        setErrorMsg(err.message || 'Sign in error.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Focus the email input so mobile users can tap their Gmail autofill chip directly without Google OAuth test-mode blocks
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
    setErrorMsg(
      lang === 'hi'
        ? 'तुरंत साइन इन करने के लिए कृपया नीचे अपना Gmail / ईमेल पता दर्ज करें और "साइन इन" दबाएँ।'
        : lang === 'ur'
        ? 'فوری لاگ ان کے لیے نیچے اپنا جی میل / ای میل درج کریں۔'
        : 'Please type or tap your Gmail address in the box below and tap Sign In for instant access.'
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        await signUp(email.trim(), password, fullName.trim());
        setSuccessMsg(lang === 'hi' ? 'खाता सफलतापूर्वक बन गया!' : (lang === 'ur' ? 'اکاؤنٹ کامیابی سے بن گیا!' : 'Signed in successfully!'));
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 300);
      } else {
        await signIn(email.trim(), password);
        setSuccessMsg(lang === 'hi' ? 'सफलतापूर्वक साइन इन हो गया!' : (lang === 'ur' ? 'لاگ ان مکمل ہو گیا!' : 'Signed in successfully!'));
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 250);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative bg-white text-stone-900 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Cultural Banner */}
        <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-indigo-950 text-white p-6 sm:p-7 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-36 h-36 bg-blue-500/15 rounded-full blur-2xl pointer-events-none"></div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 text-amber-300 text-[11px] font-bold border border-amber-400/20 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {bookTitle
                ? authT.titleDownload
                : lang === 'hi'
                ? 'जसम ऑनलाइन लाइब्रेरी • खाता व एडमिन लॉग इन'
                : lang === 'ur'
                ? 'جسم آن لائن لائبریری • اکاؤنٹ لاگ ان'
                : 'JSM Online Library • Account & Admin Sign In'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold font-rekhta-serif text-white tracking-tight leading-snug">
            {bookTitle
              ? isSignUp
                ? authT.titleDefault
                : authT.titleDownload
              : lang === 'hi'
              ? 'ईमेल द्वारा तुरंत साइन इन करें'
              : lang === 'ur'
              ? 'ای میل کے ذریعے فوری لاگ ان کریں'
              : 'Instant Email Sign In'}
          </h2>
          <p className="text-xs text-stone-300 mt-1.5 leading-relaxed font-normal">
            {bookTitle
              ? lang === 'hi'
                ? `"${bookTitle}" की उच्च गुणवत्ता वाली PDF डाउनलोड करने हेतु कृपया अपना ईमेल दर्ज करें।`
                : lang === 'ur'
                ? `"${bookTitle}" کی PDF ڈاؤنلوڈ کے لیے ای میل درج کریں۔`
                : `Enter your email to download "${bookTitle}".`
              : lang === 'hi'
              ? 'अपना ईमेल पता (जैसे Gmail) नीचे दर्ज करें। अधिकृत एडमिन ईमेल दर्ज करते ही Admin Mode स्वतः चालू हो जाएगा।'
              : lang === 'ur'
              ? 'اپنا ای میل درج کریں۔ مجاز ایڈمن ای میل درج کرنے پر ایڈمن موڈ خودکار طور پر فعال ہو جائے گا۔'
              : 'Enter your email address below. Authorized admin emails automatically unlock full Admin Mode.'}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">
                {authT.emailAddress} (Gmail / Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  ref={emailInputRef}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  className="w-full pl-10 pr-4 py-3 text-sm bg-stone-50 border-2 border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/20 outline-hidden transition font-semibold text-stone-900 placeholder:text-stone-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#1d4ed8] hover:bg-[#1e40af] active:scale-[0.99] text-white text-sm font-extrabold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{authT.processing}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {bookTitle
                      ? authT.submitSignIn
                      : lang === 'hi'
                      ? 'साइन इन करें (Sign In)'
                      : lang === 'ur'
                      ? 'لاگ ان کریں (Sign In)'
                      : 'Sign In with Email'}
                  </span>
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-center text-stone-400 font-medium pt-1">
            {authT.instantDownloadNote}
          </p>
        </div>
      </div>
    </div>
  );
}
