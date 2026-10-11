'use client';

import React, { createContext, useContext, useEffect } from 'react';

/**
 * SURGE ships a single mid-tone ("Mist") theme.
 *
 * The public API (types, provider, hook) is unchanged so existing consumers keep
 * working, but the mode is fixed: `resolvedTheme` is always 'light' (the class set
 * the Mist palette is built on — see the RGB variables in globals.css) and
 * `setThemeMode` is a no-op. The `dark` class is never applied.
 */
export type ThemeMode = 'auto' | 'dark' | 'light';

interface ThemeContextType {
  themeMode: ThemeMode;
  resolvedTheme: 'dark' | 'light';
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const FIXED_VALUE: ThemeContextType = {
  themeMode: 'light',
  resolvedTheme: 'light',
  setThemeMode: () => {},
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
    root.setAttribute('data-theme', 'light');
  }, []);

  return <ThemeContext.Provider value={FIXED_VALUE}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
