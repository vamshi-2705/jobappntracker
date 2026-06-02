import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accentColor') || '#2563eb');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const mapping = {
      '#2563eb': { primary: '#2563eb', dark: '#1d4ed8', light: '#60a5fa', bg: 'rgba(37, 99, 235, 0.15)' },
      '#0d9488': { primary: '#0d9488', dark: '#0f766e', light: '#2dd4bf', bg: 'rgba(13, 148, 136, 0.15)' },
      '#10b981': { primary: '#10b981', dark: '#059669', light: '#34d399', bg: 'rgba(16, 185, 129, 0.15)' },
      '#f59e0b': { primary: '#f59e0b', dark: '#d97706', light: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)' },
      '#ec4899': { primary: '#ec4899', dark: '#db2777', light: '#f472b6', bg: 'rgba(236, 72, 153, 0.15)' },
      '#ef4444': { primary: '#ef4444', dark: '#dc2626', light: '#f87171', bg: 'rgba(239, 68, 68, 0.15)' },
    }[accentColor] || { primary: '#2563eb', dark: '#1d4ed8', light: '#60a5fa', bg: 'rgba(37, 99, 235, 0.15)' };

    document.documentElement.style.setProperty('--primary', mapping.primary);
    document.documentElement.style.setProperty('--primary-dark', mapping.dark);
    document.documentElement.style.setProperty('--primary-light', mapping.light);
    document.documentElement.style.setProperty('--primary-bg', mapping.bg);
    localStorage.setItem('accentColor', accentColor);
  }, [accentColor]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
