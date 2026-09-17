import React, { useState } from 'react';
import { X, Mail, Lock, User, Sparkles, Download, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'signup', bookTitle = '' }) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      await signInWithGoogle(window.location.href);
    } catch (err) {
      setErrorMsg(err.message || 'Google Sign In error. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        await signUp(email.trim(), password, fullName.trim());
        setSuccessMsg('Account created successfully! You can now download.');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1000);
      } else {
        await signIn(email.trim(), password);
        setSuccessMsg('Signed in successfully!');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 800);
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
        className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Cultural Banner */}
        <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-indigo-950 text-white p-6 sm:p-7 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-36 h-36 bg-blue-500/15 rounded-full blur-2xl pointer-events-none"></div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 text-amber-300 text-[11px] font-bold border border-amber-400/20 mb-3">
            <Download className="w-3.5 h-3.5" />
            <span>मुफ़्त पीडीएफ डाउनलोड सदस्यता / FREE DOWNLOAD ACCESS</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold font-rekhta-serif text-white tracking-tight leading-snug">
            {isSignUp ? 'चेतना डिजिटल पुस्तकालय से जुड़ें' : 'अपने खाते में प्रवेश करें'}
          </h2>
          <p className="text-xs text-stone-300 mt-1.5 leading-relaxed font-normal">
            {bookTitle 
              ? `"${bookTitle}" और अन्य दुर्लभ कृतियों की उच्च गुणवत्ता पीडीएफ डाउनलोड करने के लिए कृपया साइन अप करें।`
              : 'दुर्लभ ग्रंथों, शोध आख्यानों और साहित्यिक कृतियों को डाउनलोड और सुरक्षित करने के लिए साइन अप करें।'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-100 bg-stone-50/80 px-6 pt-3">
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setErrorMsg(''); }}
            className={`flex-1 pb-3 text-xs font-bold transition border-b-2 ${
              isSignUp ? 'border-[#1d4ed8] text-[#1d4ed8]' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            नया खाता बनाएँ (Sign Up)
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setErrorMsg(''); }}
            className={`flex-1 pb-3 text-xs font-bold transition border-b-2 ${
              !isSignUp ? 'border-[#1d4ed8] text-[#1d4ed8]' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            लॉग इन करें (Sign In)
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1-Click Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold rounded-2xl border border-stone-200 shadow-2xs hover:shadow-xs transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google के साथ {isSignUp ? 'साइन अप करें' : 'लॉग इन करें'} (Continue with Google)</span>
          </button>

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-stone-200"></div>
            <span className="text-[11px] text-stone-400 font-medium">या ईमेल के साथ / or with email</span>
            <div className="flex-1 h-px bg-stone-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  पूरा नाम / Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required={isSignUp}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8] outline-hidden transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                ईमेल पता / Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8] outline-hidden transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                पासवर्ड / Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8] outline-hidden transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>कृपया प्रतीक्षा करें / Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{isSignUp ? 'साइन अप करें और डाउनलोड करें' : 'लॉग इन करें और डाउनलोड करें'}</span>
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-center text-stone-400 font-medium pt-1">
            ऑनलाइन पठन सभी के लिए सदैव निःशुल्क और खुला है।
          </p>
        </div>
      </div>
    </div>
  );
}
