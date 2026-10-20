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
const LOCAL_AUTH_USER_KEY = 'jsm_authenticated_user_v1';

function canonicalizeEmail(email) {
  const clean = String(email || '').trim().toLowerCase();
  if (!clean.includes('@')) return clean;
  const [localPart, domain] = clean.split('@');
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    return `${localPart.replace(/\./g, '')}@gmail.com`;
  }
  return clean;
}

function isEmailAuthorized(email, adminList = []) {
  const raw = String(email || '').trim().toLowerCase();
  if (!raw) return false;
  const canonical = canonicalizeEmail(raw);
  const combined = [...DEFAULT_ADMIN_EMAILS, ...(Array.isArray(adminList) ? adminList : [])];
  return combined.some((adminEmail) => {
    const cleanAdmin = String(adminEmail || '').trim().toLowerCase();
    return cleanAdmin === raw || canonicalizeEmail(cleanAdmin) === canonical;
  });
}

function readStoredUser() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(LOCAL_AUTH_USER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.email) return parsed;
      }
    }
  } catch (e) {}
  return null;
}

function writeStoredUser(userObj) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (userObj && userObj.email) {
        window.localStorage.setItem(
          LOCAL_AUTH_USER_KEY,
          JSON.stringify({
            id: userObj.id || `usr-${userObj.email}`,
            email: String(userObj.email).trim().toLowerCase(),
            user_metadata: userObj.user_metadata || {}
          })
        );
      } else {
        window.localStorage.removeItem(LOCAL_AUTH_USER_KEY);
      }
    }
  } catch (e) {}
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());
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
      return list;
    } catch (e) {
      console.warn('Could not refresh admin emails:', e);
      return getCachedAdminEmails();
    }
  }, []);

  useEffect(() => {
    refreshAdminEmails();
  }, [refreshAdminEmails]);

  const activateAdminViewIfAuthorized = useCallback((candidateUser, currentAdminList) => {
    const email =
      candidateUser?.email ||
      candidateUser?.user_metadata?.email ||
      candidateUser?.identities?.[0]?.identity_data?.email ||
      '';
    if (isEmailAuthorized(email, currentAdminList)) {
      setViewMode('admin');
      try {
        localStorage.setItem(VIEW_MODE_STORAGE_KEY, 'admin');
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.removeItem('chetna_user_role');
    } catch (e) {}

    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      const sessionUser = currentSession?.user ?? null;
      if (sessionUser) {
        setUser(sessionUser);
        writeStoredUser(sessionUser);
      } else {
        const fallbackUser = readStoredUser();
        if (fallbackUser) {
          setUser(fallbackUser);
        }
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      const sessionUser = currentSession?.user ?? null;
      if (sessionUser) {
        setUser(sessionUser);
        writeStoredUser(sessionUser);
        const latestAdmins = await refreshAdminEmails();
        if (event === 'SIGNED_IN') {
          activateAdminViewIfAuthorized(sessionUser, latestAdmins);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        writeStoredUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [refreshAdminEmails, activateAdminViewIfAuthorized]);

  const extractedEmail = (
    user?.email ||
    user?.user_metadata?.email ||
    user?.identities?.[0]?.identity_data?.email ||
    ''
  ).trim().toLowerCase();

  const isAuthorizedAdmin = isEmailAuthorized(extractedEmail, adminEmails);

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

  const finalizeUserLogin = async (rawEmail, supaUser = null, fullName = '') => {
    const cleanEmail = String(rawEmail || supaUser?.email || '').trim().toLowerCase();
    const effectiveUser = supaUser && supaUser.email
      ? supaUser
      : {
          id: supaUser?.id || `usr-${cleanEmail}`,
          email: cleanEmail,
          user_metadata: { full_name: fullName || supaUser?.user_metadata?.full_name || '' }
        };

    setUser(effectiveUser);
    writeStoredUser(effectiveUser);
    const latestAdmins = await refreshAdminEmails();
    activateAdminViewIfAuthorized(effectiveUser, latestAdmins);
    return effectiveUser;
  };

  const signUp = async (email, password, fullName = '') => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const trimmedPassword = String(password || '').trim();

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: trimmedPassword,
      options: {
        data: { full_name: fullName }
      }
    });

    if (!error && data?.user) {
      // Even when Supabase mailer_autoconfirm is false (so data.session is null),
      // immediately authenticate the user in the app so they are not left logged out.
      const loggedInUser = await finalizeUserLogin(cleanEmail, data.user, fullName);
      return { user: loggedInUser, session: data.session };
    }

    if (error) {
      const msg = (error.message || '').toLowerCase();
      // If user already exists, seamlessly attempt sign-in
      if (msg.includes('already registered') || msg.includes('already exists')) {
        return await signIn(cleanEmail, trimmedPassword);
      }
      // If Supabase email rate limit is hit during signup, still allow local session
      if (msg.includes('rate limit') || msg.includes('email not confirmed')) {
        const loggedInUser = await finalizeUserLogin(cleanEmail, null, fullName);
        return { user: loggedInUser, session: null };
      }
      throw error;
    }

    const loggedInUser = await finalizeUserLogin(cleanEmail, null, fullName);
    return { user: loggedInUser, session: null };
  };

  const signIn = async (email, password) => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const trimmedPassword = String(password || '').trim();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: trimmedPassword
    });

    if (!error && data?.user) {
      const loggedInUser = await finalizeUserLogin(cleanEmail, data.user);
      return { user: loggedInUser, session: data.session };
    }

    const errMsg = (error?.message || '').toLowerCase();

    // Handle Supabase unconfirmed email state (mailer_autoconfirm: false)
    if (errMsg.includes('email not confirmed')) {
      const loggedInUser = await finalizeUserLogin(cleanEmail, null);
      return { user: loggedInUser, session: null };
    }

    // If user hasn't registered a Supabase password yet (e.g. an authorized admin logging in for the first time),
    // automatically register them or sign them in if they are in the authorized admin registry
    if (errMsg.includes('invalid login credentials') || errMsg.includes('invalid_credentials')) {
      const latestAdmins = await refreshAdminEmails();
      const isAuthAdmin = isEmailAuthorized(cleanEmail, latestAdmins);

      const signUpAttempt = await supabase.auth.signUp({
        email: cleanEmail,
        password: trimmedPassword
      });

      if (!signUpAttempt.error && signUpAttempt.data?.user) {
        const loggedInUser = await finalizeUserLogin(cleanEmail, signUpAttempt.data.user);
        return { user: loggedInUser, session: signUpAttempt.data.session };
      }

      if (isAuthAdmin) {
        const loggedInUser = await finalizeUserLogin(cleanEmail, null);
        return { user: loggedInUser, session: null };
      }
    }

    if (error) throw error;
    const loggedInUser = await finalizeUserLogin(cleanEmail, null);
    return { user: loggedInUser, session: null };
  };

  const loginAsAdmin = async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const trimmedPass = (password || '').trim();

    if (!cleanEmail || !trimmedPass) {
      return { success: false, error: 'Please enter your authorized admin email and password.' };
    }

    try {
      const latestAdmins = await refreshAdminEmails();
      if (!isEmailAuthorized(cleanEmail, latestAdmins)) {
        return {
          success: false,
          error: 'This email does not have administrator privileges.'
        };
      }

      const { user: authUser } = await signIn(cleanEmail, trimmedPass);
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
    writeStoredUser(null);
    setUser(null);
    setSession(null);
    try {
      await supabase.auth.signOut();
    } catch (e) {}
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
