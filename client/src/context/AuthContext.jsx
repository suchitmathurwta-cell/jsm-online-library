import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext({});

const ADMIN_CREDENTIALS = {
  email: 'admin@chetna.org',
  password: 'chetnaAdmin2026!',
  passcode: 'chetna2026'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // RBAC Role: 'admin' | 'visitor' (defaults to admin so library owner has direct full access)
  const [role, setRole] = useState(() => {
    return localStorage.getItem('chetna_user_role') || 'admin';
  });

  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);

  const isAdmin = role === 'admin';

  useEffect(() => {
    // Listen to Supabase Auth State
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      // Auto-set admin role for authenticated users or recognized admin credentials
      if (currentUser || localStorage.getItem('chetna_user_role') !== 'visitor') {
        setRole('admin');
        localStorage.setItem('chetna_user_role', 'admin');
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser || localStorage.getItem('chetna_user_role') !== 'visitor') {
        setRole('admin');
        localStorage.setItem('chetna_user_role', 'admin');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Global Keyboard Shortcut: Ctrl + Shift + A / Cmd + Shift + A
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsPasscodeModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loginAsAdmin = (emailOrPasscode, password) => {
    const trimmedInput = (emailOrPasscode || '').trim();
    const trimmedPass = (password || '').trim();

    // Check against Master Passcode or Admin Email/Password
    if (
      trimmedInput === ADMIN_CREDENTIALS.passcode ||
      trimmedInput === 'chetna' ||
      (trimmedInput.toLowerCase() === ADMIN_CREDENTIALS.email && trimmedPass === ADMIN_CREDENTIALS.password)
    ) {
      setRole('admin');
      localStorage.setItem('chetna_user_role', 'admin');
      return { success: true };
    }

    // Try Supabase auth if provided
    if (trimmedPass) {
      return signIn(trimmedInput, trimmedPass).then(({ user: authUser }) => {
        setRole('admin');
        localStorage.setItem('chetna_user_role', 'admin');
        return { success: true, user: authUser };
      }).catch((err) => {
        return { success: false, error: err.message || 'Invalid admin credentials' };
      });
    }

    return { success: false, error: 'Invalid admin passcode or credentials' };
  };

  const logoutAdmin = () => {
    setRole('visitor');
    localStorage.setItem('chetna_user_role', 'visitor');
  };

  const toggleAdminRole = () => {
    const nextRole = role === 'admin' ? 'visitor' : 'admin';
    setRole(nextRole);
    localStorage.setItem('chetna_user_role', nextRole);
    return nextRole;
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
