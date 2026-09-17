import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, Key, ArrowRight, BookOpen, AlertCircle, ArrowLeft } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';

export default function AdminLoginPage({ lang = 'hi', t }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAsAdmin, isAdmin } = useAuth();

  const [authType, setAuthType] = useState('passcode'); // 'passcode' | 'credentials'
  const [passcode, setPasscode] = useState('');
  const [email, setEmail] = useState('admin@chetna.org');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (authType === 'passcode') {
        const res = loginAsAdmin(passcode);
        if (res.success) {
          navigate(from, { replace: true });
        } else {
          setError(res.error || 'Invalid admin passcode');
        }
      } else {
        const res = await loginAsAdmin(email, password);
        if (res.success) {
          navigate(from, { replace: true });
        } else {
          setError(res.error || 'Invalid credentials');
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12 animate-fadeIn">
      <div className="max-w-md w-full">
        
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 mb-6 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>मुख्य पृष्ठ पर वापस जाएँ / Return to Library</span>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-2xl border border-stone-200/90 relative overflow-hidden">
          
          {/* Top Decorative Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-amber-400/20 via-blue-500/10 to-transparent rounded-full blur-2xl pointer-events-none"></div>

          {/* Card Header */}
          <div className="flex items-center gap-3.5 mb-6 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-stone-900 via-stone-800 to-indigo-950 text-amber-300 flex items-center justify-center shadow-md border border-amber-400/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#1d4ed8] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/70">
                Security Administration
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-rekhta-serif tracking-tight mt-1">
                प्रशासक लॉगिन / Admin Portal
              </h1>
            </div>
          </div>

          <p className="text-xs text-stone-500 mb-6 leading-relaxed">
            प्रबंधन एवं संपादकीय नियंत्रण हेतु अपनी क्रेडेंशियल या मास्टर पासकोड दर्ज करें।
          </p>

          {/* Auth Method Selector */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-100 rounded-2xl mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setAuthType('passcode'); setError(''); }}
              className={`py-2 rounded-xl transition ${
                authType === 'passcode'
                  ? 'bg-white text-stone-900 shadow-xs font-bold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              🔑 Master Passcode
            </button>
            <button
              type="button"
              onClick={() => { setAuthType('credentials'); setError(''); }}
              className={`py-2 rounded-xl transition ${
                authType === 'credentials'
                  ? 'bg-white text-stone-900 shadow-xs font-bold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              ✉️ Email & Password
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {authType === 'passcode' ? (
              <div>
                <label className="font-bold text-stone-700 block mb-1.5">
                  Master Admin Key / पासकोड
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter admin passcode (e.g. chetna2026)..."
                    autoFocus
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/15 outline-hidden transition font-medium"
                  />
                  <Key className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="font-bold text-stone-700 block mb-1.5">
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@chetna.org"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/15 outline-hidden transition font-medium"
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/15 outline-hidden transition font-medium"
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:-translate-y-0.5"
            >
              <span>{isLoading ? 'सत्यापित हो रहा है...' : 'प्रशासक पोर्टल में प्रवेश करें / Enter Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Info note */}
          <div className="mt-6 pt-4 border-t border-stone-100 text-center text-[11px] text-stone-400">
            <span>सुरक्षित भूमिका-आधारित पहुँच नियंत्रण प्रणाली (RBAC)</span>
          </div>

        </div>
      </div>
    </div>
  );
}
