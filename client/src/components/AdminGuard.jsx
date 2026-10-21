import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Eye } from 'lucide-react';

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

export function AdminToggleFloatingBadge({ onOpenAdminModal, onOpenUpload, lang = 'hi', t }) {
  const { isAdmin, isAuthorizedAdmin, toggleAdminRole } = useAuth();
  const ag = t?.adminGuard || {};

  // Strictly hide the toggle from general visitors — only authorized admin emails can see it
  if (!isAuthorizedAdmin) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="fixed bottom-4 left-3 right-3 sm:right-auto sm:left-4 z-50 flex justify-start animate-in slide-in-from-bottom-3 duration-300 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 bg-[#0A0A0D] text-white px-3 py-2 sm:py-1.5 rounded-full border-2 border-amber-400 shadow-[0_10px_30px_rgba(0,0,0,0.95),0_0_20px_rgba(245,158,11,0.35)]">
          <div className="w-6 h-6 sm:w-5 sm:h-5 rounded-full bg-zinc-800 text-amber-400 flex items-center justify-center font-bold text-[10px] border border-amber-400/40 shrink-0">
            <Eye className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs sm:text-[11px] font-mono font-bold tracking-wide text-white">
            {ag.visitorView || 'Reader View'}
          </span>
          <span className="text-zinc-500 font-bold">|</span>
          <button
            onClick={toggleAdminRole}
            title={ag.switchToAdmin || 'Switch to Admin Mode'}
            className="flex items-center gap-1.5 text-xs sm:text-[11px] text-black bg-amber-400 hover:bg-amber-300 active:scale-95 px-3 py-1 sm:py-0.5 rounded-full cursor-pointer transition font-extrabold shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{ag.adminMode || 'Admin Mode'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-3 right-3 sm:right-auto sm:left-4 z-50 flex justify-start animate-in slide-in-from-bottom-3 duration-300 pointer-events-none">
      <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 sm:gap-2 bg-[#0A0A0D] text-white px-3 py-2 sm:py-1.5 rounded-full border-2 border-amber-400 shadow-[0_10px_30px_rgba(0,0,0,0.95),0_0_20px_rgba(245,158,11,0.35)]">
        <div className="w-6 h-6 sm:w-5 sm:h-5 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold text-[10px] shadow-xs shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
        <span className="text-xs sm:text-[11px] font-mono font-extrabold tracking-wide text-amber-300">
          {ag.adminMode || 'Admin'}
        </span>
        <span className="text-zinc-500 font-bold">|</span>
        {onOpenUpload && (
          <button
            onClick={onOpenUpload}
            className="text-xs sm:text-[11px] text-black bg-amber-400 hover:bg-amber-300 active:scale-95 px-2.5 py-1 sm:py-0.5 rounded-full cursor-pointer transition font-extrabold shadow-xs"
          >
            ↑ {lang === 'hi' ? 'अपलोड' : lang === 'ur' ? 'اپ لوڈ' : 'Upload'}
          </button>
        )}
        {onOpenAdminModal && (
          <button
            onClick={onOpenAdminModal}
            className="text-xs sm:text-[11px] text-white hover:text-amber-300 bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 sm:py-0.5 rounded-full border border-zinc-600 cursor-pointer transition font-bold"
          >
            {ag.cms || 'Manage ⚙️'}
          </button>
        )}
        <button
          onClick={toggleAdminRole}
          title={ag.visitorView || 'Switch to Reader View'}
          className="flex items-center gap-1 text-xs sm:text-[11px] text-black bg-white hover:bg-zinc-200 active:scale-95 px-2.5 py-1 sm:py-0.5 rounded-full cursor-pointer transition font-extrabold shadow-sm"
        >
          <Eye className="w-3.5 h-3.5 text-black" />
          <span>{ag.visitorView || 'Reader View'}</span>
        </button>
      </div>
    </div>
  );
}

export function AdminQuickChallengeModal() {
  return null;
}
