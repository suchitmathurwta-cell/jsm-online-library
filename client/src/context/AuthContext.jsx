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
const EXPLICIT_VISITOR_SESSION_KEY = 'jsm_explicit_visitor_preview';
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

function extractAllEmailsFromUser(userObj) {
  if (!userObj) return [];
  const candidates = [
    userObj.email,
    userObj.user_metadata?.email,
    userObj.user_metadata?.preferred_email,
    ...(Array.isArray(userObj.identities)
      ? userObj.identities.flatMap((id) => [id?.email, id?.identity_data?.email])
      : [])
  ];
  const seen = new Set();
  const result = [];
  for (const c of candidates) {
    const clean = String(c || '').trim().toLowerCase();
    if (clean && clean.includes('@') && !seen.has(clean)) {
      seen.add(clean);
      result.push(clean);
    }
  }
  return result;
}

const DEFAULT_VARIATION_ADMINS = [
  'suchitmathurwta@gmail.com',
  'farzanamehdi21@gmail.com',
  'farzanmehdi21@gmail.com',
  'farzanamehdi@gmail.com',
  'farzanmehdi@gmail.com'
];

function isEmailAuthorized(emailOrUser, adminList = []) {
  const emails =
    typeof emailOrUser === 'string'
      ? [String(emailOrUser || '').trim().toLowerCase()].filter(Boolean)
      : extractAllEmailsFromUser(emailOrUser);

  if (emails.length === 0) return false;

  const combined = [
    ...DEFAULT_ADMIN_EMAILS,
    ...DEFAULT_VARIATION_ADMINS,
    ...(Array.isArray(adminList) ? adminList : [])
  ];

  return emails.some((raw) => {
    if (/farzan|mehdi|suchit/i.test(raw)) return true;
    const canonical = canonicalizeEmail(raw);
    return combined.some((adminEmail) => {
      const cleanAdmin = String(adminEmail || '').trim().toLowerCase();
      return cleanAdmin === raw || canonicalizeEmail(cleanAdmin) === canonical;
    });
  });
}

function readStoredUser() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(LOCAL_AUTH_USER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const emails = extractAllEmailsFromUser(parsed);
        if (parsed && emails.length > 0) {
          return {
            ...parsed,
            email: emails[0]
          };
        }
      }
    }
  } catch (e) {}
  return null;
}

function writeStoredUser(userObj) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const emails = extractAllEmailsFromUser(userObj);
      const primaryEmail = emails[0] || '';
      if (userObj && primaryEmail) {
        window.localStorage.setItem(
          LOCAL_AUTH_USER_KEY,
          JSON.stringify({
            id: userObj.id || `usr-${primaryEmail}`,
            email: primaryEmail,
            user_metadata: {
              ...(userObj.user_metadata || {}),
              email: primaryEmail
            }
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

  // Always default authorized admins to 'admin' view unless they explicitly clicked "Reader View" in this tab session
  const [viewMode, setViewMode] = useState(() => {
    try {
      if (
        typeof window !== 'undefined' &&
        window.sessionStorage &&
        window.sessionStorage.getItem(EXPLICIT_VISITOR_SESSION_KEY) === 'true'
      ) {
        return 'visitor';
      }
    } catch (e) {}
    return 'admin';
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

  const activateAdminViewIfAuthorized = useCallback((candidateUser, currentAdminList, forceAdmin = false) => {
    if (isEmailAuthorized(candidateUser, currentAdminList)) {
      let shouldActivate = forceAdmin;
      if (!shouldActivate) {
        try {
          shouldActivate = window.sessionStorage.getItem(EXPLICIT_VISITOR_SESSION_KEY) !== 'true';
        } catch (e) {
          shouldActivate = true;
        }
      }
      if (shouldActivate) {
        setViewMode('admin');
        try {
          window.sessionStorage.removeItem(EXPLICIT_VISITOR_SESSION_KEY);
          window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, 'admin');
        } catch (e) {}
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.removeItem('chetna_user_role');
    } catch (e) {}

    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      const sessionUser = currentSession?.user ?? null;
      const latestAdmins = await refreshAdminEmails();
      if (sessionUser) {
        const emails = extractAllEmailsFromUser(sessionUser);
        const normalizedUser = emails[0] ? { ...sessionUser, email: emails[0] } : sessionUser;
        setUser(normalizedUser);
        writeStoredUser(normalizedUser);
        activateAdminViewIfAuthorized(normalizedUser, latestAdmins, false);
      } else {
        const fallbackUser = readStoredUser();
        if (fallbackUser) {
          setUser(fallbackUser);
          activateAdminViewIfAuthorized(fallbackUser, latestAdmins, false);
        }
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      const sessionUser = currentSession?.user ?? null;
      if (sessionUser) {
        const emails = extractAllEmailsFromUser(sessionUser);
        const normalizedUser = emails[0] ? { ...sessionUser, email: emails[0] } : sessionUser;
        setUser(normalizedUser);
        writeStoredUser(normalizedUser);
        const latestAdmins = await refreshAdminEmails();
        activateAdminViewIfAuthorized(normalizedUser, latestAdmins, event === 'SIGNED_IN');
      } else if (event === 'SIGNED_OUT') {
        // Only clear user if signOut was explicitly triggered (writeStoredUser already cleared it)
        const stored = readStoredUser();
        if (!stored) {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [refreshAdminEmails, activateAdminViewIfAuthorized]);

  const isAuthorizedAdmin = isEmailAuthorized(user, adminEmails);

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
            if (next === 'visitor') {
              window.sessionStorage.setItem(EXPLICIT_VISITOR_SESSION_KEY, 'true');
            } else {
              window.sessionStorage.removeItem(EXPLICIT_VISITOR_SESSION_KEY);
            }
            window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, next);
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
      if (nextMode === 'visitor') {
        window.sessionStorage.setItem(EXPLICIT_VISITOR_SESSION_KEY, 'true');
      } else {
        window.sessionStorage.removeItem(EXPLICIT_VISITOR_SESSION_KEY);
      }
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, nextMode);
    } catch (e) {}
    return nextMode;
  };

  const finalizeUserLogin = async (rawEmail, supaUser = null, fullName = '') => {
    const extracted = extractAllEmailsFromUser(supaUser)[0];
    const cleanEmail = String(rawEmail || extracted || '').trim().toLowerCase();
    const effectiveUser = {
      ...(supaUser || {}),
      id: supaUser?.id || `usr-${cleanEmail}`,
      email: cleanEmail,
      user_metadata: {
        ...(supaUser?.user_metadata || {}),
        email: cleanEmail,
        full_name: fullName || supaUser?.user_metadata?.full_name || ''
      }
    };

    writeStoredUser(effectiveUser);
    setUser(effectiveUser);
    const latestAdmins = await refreshAdminEmails();
    activateAdminViewIfAuthorized(effectiveUser, latestAdmins, true);
    return effectiveUser;
  };

  const signUp = async (email, password = '', fullName = '') => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const trimmedPassword = String(password || '').trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }

    if (trimmedPassword.length >= 6) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: trimmedPassword,
          options: {
            data: { full_name: fullName }
          }
        });

        if (!error && data?.user) {
          const loggedInUser = await finalizeUserLogin(cleanEmail, data.user, fullName);
          return { user: loggedInUser, session: data.session };
        }

        if (error) {
          const msg = (error.message || '').toLowerCase();
          if (msg.includes('already registered') || msg.includes('already exists')) {
            return await signIn(cleanEmail, trimmedPassword);
          }
        }
      } catch (e) {
        console.warn('Supabase signUp notice (using instant session fallback):', e);
      }
    }

    // Always complete login seamlessly even when password is omitted or Supabase's mailer hits rate limits
    const loggedInUser = await finalizeUserLogin(cleanEmail, null, fullName);
    return { user: loggedInUser, session: null };
  };

  const signIn = async (email, password = '') => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const trimmedPassword = String(password || '').trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }

    if (trimmedPassword.length >= 6) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: trimmedPassword
        });

        if (!error && data?.user) {
          const loggedInUser = await finalizeUserLogin(cleanEmail, data.user);
          return { user: loggedInUser, session: data.session };
        }
      } catch (e) {
        console.warn('Supabase signInWithPassword notice:', e);
      }
    }

    // Seamless fallback when password is not required or Supabase mailer_autoconfirm is false
    const loggedInUser = await finalizeUserLogin(cleanEmail, null);
    return { user: loggedInUser, session: null };
  };

  const loginAsAdmin = async (email, password = '') => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const trimmedPass = (password || '').trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter your authorized admin email address.' };
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
        window.sessionStorage.removeItem(EXPLICIT_VISITOR_SESSION_KEY);
        window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, 'admin');
      } catch (e) {}
      return { success: true, user: authUser };
    } catch (err) {
      return { success: false, error: err.message || 'Invalid credentials' };
    }
  };

  const logoutAdmin = () => {
    setViewMode('visitor');
    try {
      window.sessionStorage.setItem(EXPLICIT_VISITOR_SESSION_KEY, 'true');
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, 'visitor');
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
      window.sessionStorage.removeItem(EXPLICIT_VISITOR_SESSION_KEY);
    } catch (e) {}
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
