import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'srd-theme'; // 'light' | 'dark' | 'system'

function resolveTheme(preference) {
  if (preference === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return preference;
}

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(() => localStorage.getItem(STORAGE_KEY) || 'system');
  const [effective, setEffective] = useState(() => resolveTheme(localStorage.getItem(STORAGE_KEY) || 'system'));

  useEffect(() => {
    const resolved = resolveTheme(preference);
    setEffective(resolved);
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    localStorage.setItem(STORAGE_KEY, preference);
  }, [preference]);

  // React to OS theme changes while in system mode.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      if (preference === 'system') {
        const resolved = media.matches ? 'dark' : 'light';
        setEffective(resolved);
        document.documentElement.classList.toggle('dark', resolved === 'dark');
      }
    };
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [preference]);

  const setTheme = useCallback((mode) => setPreference(mode), []);

  return (
    <ThemeContext.Provider value={{ theme: preference, effectiveTheme: effective, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
