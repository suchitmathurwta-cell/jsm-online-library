import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import {
  DEFAULT_ADMIN_EMAILS,
  getCachedAdminEmails,
  getAdminEmails,
  addAdminEmailToRegistry,
  removeAdminEmailFromRegistry
} from '../services/supabaseApi';

const AuthContext = createContext({});

const VIEW_MODE_STORAGE_KEY = 'jsm_admin_view_mode';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminEmails, setAdminEmails] = useState(() => getCachedAdminEmails());

  // View mode preference ONLY applies when an authorized admin is signed in ('admin' | 'visitor')
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem(VIEW_MODE_STORAGE_KEY) === 'visitor' ? 'visitor' : 'admin';
    } catch (e) {
      return 'admin';
    }
  });

  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);

  const refreshAdminEmails = useCallback(async () => {
    try {
      const list = await getAdminEmails();
      if (Array.isArray(list) && list.length > 0) {
        setAdminEmails(list);
      }
    } catch (e) {
      console.warn('Could not refresh admin emails:', e);
    }
  }, []);

  useEffect(() => {
    refreshAdminEmails();
  }, [refreshAdminEmails]);

  useEffect(() => {
    // Clean up any legacy insecure role keys so visitors never inherit admin state
    try {
      localStorage.removeItem('chetna_user_role');
    } catch (e) {}

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        refreshAdminEmails();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [refreshAdminEmails]);

  const normalizedUserEmail = (user?.email || '').trim().toLowerCase();
  const isAuthorizedAdmin = Boolean(
    normalizedUserEmail &&
    (adminEmails.includes(normalizedUserEmail) || DEFAULT_ADMIN_EMAILS.includes(normalizedUserEmail))
  );

  // Strictly enforce: a user is in Admin Mode ONLY if they are an authenticated authorized admin AND their viewMode is 'admin'
  const isAdmin = isAuthorizedAdmin && viewMode === 'admin';
  const role = isAdmin ? 'admin' : 'visitor';

  // Keyboard shortcut (Ctrl + Shift + A) ONLY works for authenticated authorized admins
  useEffect(() => {
    if (!isAuthorizedAdmin) return;
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setViewMode((prev) => {
          const next = prev === 'admin' ? 'visitor' : 'admin';
          try {
            localStorage.setItem(VIEW_MODE_STORAGE_KEY, next);
          } catch (err) {}
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthorizedAdmin]);

  const toggleAdminRole = () => {
    if (!isAuthorizedAdmin) return 'visitor';
    const nextMode = viewMode === 'admin' ? 'visitor' : 'admin';
    setViewMode(nextMode);
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, nextMode);
    } catch (e) {}
    return nextMode;
  };

  const loginAsAdmin = async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const trimmedPass = (password || '').trim();

    if (!cleanEmail || !trimmedPass) {
      return { success: false, error: 'Please enter your authorized admin email and password.' };
    }

    try {
      const { user: authUser } = await signIn(cleanEmail, trimmedPass);
      const latestAdmins = await getAdminEmails();
      setAdminEmails(latestAdmins);
      const signedInEmail = (authUser?.email || cleanEmail).toLowerCase();

      if (!latestAdmins.includes(signedInEmail) && !DEFAULT_ADMIN_EMAILS.includes(signedInEmail)) {
        return {
          success: false,
          error: 'This email does not have administrator privileges.'
        };
      }

      setViewMode('admin');
      try {
        localStorage.setItem(VIEW_MODE_STORAGE_KEY, 'admin');
      } catch (e) {}
      return { success: true, user: authUser };
    } catch (err) {
      return { success: false, error: err.message || 'Invalid credentials' };
    }
  };

  const logoutAdmin = () => {
    setViewMode('visitor');
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, 'visitor');
    } catch (e) {}
  };

  const grantAdminAccess = async (newEmail) => {
    if (!isAuthorizedAdmin) {
      throw new Error('Only an authorized administrator can grant admin access.');
    }
    const updated = await addAdminEmailToRegistry(newEmail);
    setAdminEmails(updated);
    return updated;
  };

  const revokeAdminAccess = async (targetEmail) => {
    if (!isAuthorizedAdmin) {
      throw new Error('Only an authorized administrator can revoke admin access.');
    }
    const updated = await removeAdminEmailFromRegistry(targetEmail);
    setAdminEmails(updated);
    return updated;
  };

  const signUp = async (email, password, fullName = '') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        role,
        isAdmin,
        isAuthorizedAdmin,
        adminEmails,
        grantAdminAccess,
        revokeAdminAccess,
        refreshAdminEmails,
        isPasscodeModalOpen,
        setIsPasscodeModalOpen,
        loginAsAdmin,
        logoutAdmin,
        toggleAdminRole,
        signUp,
        signIn,
        signInWithGoogle,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
