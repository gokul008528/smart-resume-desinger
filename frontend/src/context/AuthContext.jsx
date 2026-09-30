import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, authPersistence } from '../firebase/config';
import api, { setUnauthorizedHandler } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null); // Mongo user document
  const [loading, setLoading] = useState(true); // initial session check
  const [sessionExpired, setSessionExpired] = useState(false);
  const unauthorizedHandled = useRef(false);

  const fetchProfile = useCallback(async () => {
    const { data } = await api.get('/auth/me');
    setProfile(data.data);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setProfile(null);
  }, []);

  // Called by the API layer on any 401: expire the session once.
  useEffect(() => {
    setUnauthorizedHandler(async () => {
      if (unauthorizedHandled.current) return;
      unauthorizedHandled.current = true;
      setSessionExpired(true);
      try {
        await signOut(auth);
      } catch {
        /* noop */
      }
      setProfile(null);
      setTimeout(() => { unauthorizedHandled.current = false; }, 3000);
    });
  }, []);

  // Persistent auth state listener (single source of truth).
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          await fetchProfile();
        } catch {
          // Backend unreachable or profile missing — keep firebase user,
          // pages will surface errors as needed.
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [fetchProfile]);

  const login = useCallback(async (email, password) => {
    setSessionExpired(false);
    await authPersistence;
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signup = useCallback(async (name, email, password) => {
    setSessionExpired(false);
    await authPersistence;
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setSessionExpired(false);
    await authPersistence;
    await signInWithPopup(auth, googleProvider);
  }, []);

  const resetPassword = useCallback(async (email) => {
    await sendPasswordResetEmail(auth, email);
  }, []);

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        loading,
        sessionExpired,
        clearSessionExpired: () => setSessionExpired(false),
        isAuthenticated: Boolean(firebaseUser),
        login,
        signup,
        loginWithGoogle,
        resetPassword,
        logout,
        refreshProfile,
        setProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
