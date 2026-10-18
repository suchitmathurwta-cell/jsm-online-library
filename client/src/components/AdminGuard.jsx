import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, ShieldAlert, ShieldCheck, KeyRound, Eye, EyeOff, LogOut, X, Check, ArrowRight, Lock } from 'lucide-react';

export function AdminOnly({ children, fallback = null }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) return fallback;
  return <>{children}</>;
}

export function VisitorOnly({ children, fallback = null }) {
  const { isAdmin } = useAuth();
  if (isAdmin) return fallback;
  return <>{children}</>;
}

export function AdminToggleFloatingBadge({ onOpenAdminModal, lang = 'hi', t }) {
  const { isAdmin, toggleAdminRole, setIsPasscodeModalOpen } = useAuth();
  const ag = t?.adminGuard || {};

  if (!isAdmin) {
    return (
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => setIsPasscodeModalOpen(true)}
          title={ag.adminMode || "Admin Access"}
          className="group flex items-center gap-1.5 px-3 py-1.5 bg-stone-900/90 hover:bg-stone-900 text-stone-300 hover:text-amber-300 text-[11px] font-semibold rounded-full shadow-lg border border-stone-700/80 backdrop-blur-md transition-all duration-200 cursor-pointer opacity-40 hover:opacity-100 hover:scale-105"
        >
          <KeyRound className="w-3 h-3 text-amber-400 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">{ag.adminMode || 'Admin Mode'}</span>
          <span className="text-[9px] bg-stone-800 text-stone-400 px-1 py-0.5 rounded border border-stone-700 font-mono">
            {ag.shortcut || 'Ctrl+⇧+A'}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 animate-in slide-in-from-bottom-3 duration-300">
      <div className="flex items-center gap-1.5 bg-[#111111] text-white p-1.5 pr-3 rounded-full shadow-lg border border-black/10 backdrop-blur-md">
        <div className="w-5 h-5 rounded-full bg-white text-[#111111] flex items-center justify-center font-bold text-[10px] shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5" />
        </div>
        <span className="text-[11px] font-mono font-medium tracking-wide text-zinc-200">
          {ag.adminMode || 'ADMIN'}
        </span>
        <span className="text-zinc-600">|</span>
        {onOpenAdminModal && (
          <button
            onClick={onOpenAdminModal}
            className="text-[11px] text-zinc-300 hover:text-white hover:underline cursor-pointer transition font-medium"
          >
            {ag.cms || 'CMS ⚙️'}
          </button>
        )}
        <span className="text-zinc-600">|</span>
        <button
          onClick={toggleAdminRole}
          title={ag.visitorView || "Switch to Visitor View"}
          className="flex items-center gap-1 text-[11px] text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 px-2 py-0.5 rounded-full border border-zinc-700 cursor-pointer transition font-medium"
        >
          <Eye className="w-3 h-3 text-zinc-400" />
          <span>{ag.visitorView || 'Visitor'}</span>
        </button>
      </div>
    </div>
  );
}

export function AdminQuickChallengeModal({ lang = 'hi', t }) {
  const { isPasscodeModalOpen, setIsPasscodeModalOpen, isAdmin, loginAsAdmin, logoutAdmin, toggleAdminRole } = useAuth();
  const [inputVal, setInputVal] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const ag = t?.adminGuard || {};

  if (!isPasscodeModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const res = loginAsAdmin(inputVal);
    if (res.success) {
      setSuccessMsg(ag.activated || '✓ Admin Mode Activated!');
      setInputVal('');
      setTimeout(() => {
        setIsPasscodeModalOpen(false);
        setSuccessMsg('');
      }, 700);
    } else {
      setErrorMsg(res.error || (ag.invalidPasscode || 'Invalid admin passcode'));
    }
  };

  const handleToggleVisitor = () => {
    toggleAdminRole();
    setIsPasscodeModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => {
            setIsPasscodeModalOpen(false);
            setErrorMsg('');
            setSuccessMsg('');
          }}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-md">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900 font-rekhta-serif">
              {ag.gateTitle || 'JSM Library Administration'}
            </h3>
            <p className="text-xs text-stone-500">
              {ag.gateSubtitle || 'Sign in to manage books and collections'}
            </p>
          </div>
        </div>

        {isAdmin ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold">{ag.currentAdmin || 'You are currently in Admin Mode'}</p>
                <p className="text-amber-800/80 mt-0.5">
                  {ag.currentAdminDesc || 'You can manage and edit categories, collections, themes, and book records.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleToggleVisitor}
                className="flex-1 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-amber-400" />
                <span>{ag.switchToVisitor || 'Switch to Visitor View'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  logoutAdmin();
                  setIsPasscodeModalOpen(false);
                }}
                className="py-2.5 px-4 bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-700 text-xs font-semibold rounded-xl border border-stone-200 transition flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{ag.logout || 'Log Out'}</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600">
              <p className="font-semibold text-stone-800 mb-1">
                {ag.enterPasscodeTitle || 'Enter Master Admin Passcode'}
              </p>
              <p className="text-[11.5px] text-stone-500 leading-relaxed">
                {ag.enterPasscodeDesc || 'Authorized administrators can enter their admin passcode to manage the library catalog.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                {ag.passcodeLabel || 'Admin Passcode'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder={ag.passcodePlaceholder || 'e.g. jsm2026'}
                  autoFocus
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  className="w-full pl-4 pr-11 py-2.5 text-sm bg-stone-50 hover:bg-white focus:bg-white border border-stone-300 focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/20 rounded-xl outline-hidden transition font-mono font-semibold text-stone-900 placeholder:text-stone-400 placeholder:font-sans placeholder:font-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-700 transition rounded-lg cursor-pointer"
                  title={showPassword ? "Hide passcode" : "Show passcode"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-stone-400">
                {lang === 'hi' ? 'पासकोड: jsm2026' : (lang === 'ur' ? 'پاس کوڈ: jsm2026' : 'Passcode: jsm2026')}
              </p>
            </div>

            {errorMsg && (
              <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5 bg-red-50 p-2.5 rounded-xl border border-red-200">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </p>
            )}

            {successMsg && (
              <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsPasscodeModalOpen(false)}
                className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
              >
                {ag.cancel || 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#111111] hover:bg-black text-white text-xs font-medium rounded-full shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>{ag.unlockBtn || 'Unlock Admin Mode'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
          <span>{ag.shortcut ? `${ag.shortcut}` : 'Ctrl + Shift + A'}</span>
          <span className="text-[10px]">JSM Security</span>
        </div>
      </div>
    </div>
  );
}
