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

export function AdminToggleFloatingBadge({ onOpenAdminModal, lang = 'hi', t }) {
  const { isAdmin, isAuthorizedAdmin, toggleAdminRole } = useAuth();
  const ag = t?.adminGuard || {};

  // Strictly hide the toggle from general visitors — only authorized admin emails can see it
  if (!isAuthorizedAdmin) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom-3 duration-300">
        <div className="flex items-center gap-1.5 bg-[#111111]/95 text-white p-1.5 pr-3 rounded-full shadow-xl border border-white/15 backdrop-blur-md">
          <div className="w-5 h-5 rounded-full bg-zinc-800 text-amber-400 flex items-center justify-center font-bold text-[10px] border border-white/10">
            <Eye className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-mono font-medium tracking-wide text-zinc-300">
            {ag.visitorView || 'Reader View'}
          </span>
          <span className="text-zinc-600">|</span>
          <button
            onClick={toggleAdminRole}
            title={ag.switchToAdmin || 'Switch to Admin Mode'}
            className="flex items-center gap-1 text-[11px] text-black bg-amber-400 hover:bg-amber-300 px-2.5 py-0.5 rounded-full cursor-pointer transition font-bold"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>{ag.adminMode || 'Admin Mode'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom-3 duration-300">
      <div className="flex items-center gap-1.5 bg-[#111111]/95 text-white p-1.5 pr-3 rounded-full shadow-xl border border-amber-500/30 backdrop-blur-md">
        <div className="w-5 h-5 rounded-full bg-amber-400 text-[#111111] flex items-center justify-center font-bold text-[10px] shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5" />
        </div>
        <span className="text-[11px] font-mono font-medium tracking-wide text-zinc-200">
          {ag.adminMode || 'Admin Mode'}
        </span>
        <span className="text-zinc-600">|</span>
        {onOpenAdminModal && (
          <button
            onClick={onOpenAdminModal}
            className="text-[11px] text-zinc-300 hover:text-white hover:underline cursor-pointer transition font-medium"
          >
            {ag.cms || 'Manage ⚙️'}
          </button>
        )}
        <span className="text-zinc-600">|</span>
        <button
          onClick={toggleAdminRole}
          title={ag.visitorView || 'Switch to Reader View'}
          className="flex items-center gap-1 text-[11px] text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 px-2 py-0.5 rounded-full border border-zinc-700 cursor-pointer transition font-medium"
        >
          <Eye className="w-3 h-3 text-zinc-400" />
          <span>{ag.visitorView || 'Reader View'}</span>
        </button>
      </div>
    </div>
  );
}

export function AdminQuickChallengeModal() {
  // Passcode backdoor modal is disabled so unauthorized users can never trigger or guess a passcode
  return null;
}
