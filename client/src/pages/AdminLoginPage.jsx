import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage({ lang = 'hi', t }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAsAdmin, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';
  const al = t.adminLogin || {};

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Google Sign-In failed');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await loginAsAdmin(email, password);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.error || (lang === 'hi' ? 'अमान्य क्रेडेंशियल या अनधिकृत ईमेल' : (lang === 'ur' ? 'غلط اسناد یا غیر مجاز ای میل' : 'Invalid credentials or unauthorized admin email')));
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center px-4 py-8 animate-fadeIn">
      <div className="max-w-md w-full">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{al.returnLink || 'Return to Library'}</span>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-2xl border border-stone-200/90 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-amber-400/20 via-blue-500/10 to-transparent rounded-full blur-2xl pointer-events-none"></div>

          {/* Card Header */}
          <div className="flex items-center gap-3.5 mb-6 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-stone-900 via-stone-800 to-indigo-950 text-amber-300 flex items-center justify-center shadow-md border border-amber-400/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#1d4ed8] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/70">
                {al.badge || 'Security & Administration'}
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-rekhta-serif tracking-tight mt-1">
                {al.title || 'Administrator Sign In'}
              </h1>
            </div>
          </div>

          <p className="text-xs text-stone-500 mb-6 leading-relaxed">
            {al.subtitle || 'Sign in with an authorized administrator email account to access library management.'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-In for Authorized Admin Email */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-2.5 px-4 mb-4 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold rounded-2xl border border-stone-200 shadow-2xs hover:shadow-xs transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{t.auth?.googleBtn || 'Continue with Google'}</span>
          </button>

          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-stone-200"></div>
            <span className="text-[11px] text-stone-400 font-medium">{t.auth?.orEmail || 'or with email'}</span>
            <div className="flex-1 h-px bg-stone-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-stone-700 block mb-1.5">
                {al.emailLabel || 'Administrator Email'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/15 outline-hidden transition font-medium text-stone-900 placeholder:text-stone-400"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1.5">
                {al.passwordLabel || 'Password'} <span className="text-[10px] font-normal text-stone-400">({lang === 'hi' ? 'वैकल्पिक / Optional' : lang === 'ur' ? 'اختیاری / Optional' : 'Optional'})</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={lang === 'hi' ? 'वैकल्पिक (केवल अधिकृत ईमेल से साइन इन करें)' : 'Optional for authorized admin emails'}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  className="w-full pl-10 pr-11 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/15 outline-hidden transition font-mono font-semibold text-stone-900 placeholder:text-stone-400"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-700 transition rounded-lg cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:-translate-y-0.5"
            >
              <span>{isLoading ? (al.verifying || '...') : (al.enterBtn || 'Sign In as Administrator')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-stone-100 text-center text-[11px] text-stone-400">
            <span>{al.footerNote || 'JSM Library Security System'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
