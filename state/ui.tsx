'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type ThemePreset = 'default' | 'ocean' | 'forest' | 'sunset' | 'monochrome';

type ThemePrefsContextValue = {
  accentPreset: ThemePreset;
  setAccentPreset: (preset: ThemePreset) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
};

const ACCENT_STORAGE_KEY = 'commons-theme-accent';
const HIGH_CONTRAST_STORAGE_KEY = 'commons-theme-high-contrast';

const ThemePrefsContext = createContext<ThemePrefsContextValue | null>(null);

function readStoredAccent(): ThemePreset {
  if (typeof window === 'undefined') return 'default';
  const stored = window.localStorage.getItem(ACCENT_STORAGE_KEY);
  return (stored as ThemePreset) || 'default';
}

function readStoredHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(HIGH_CONTRAST_STORAGE_KEY) === 'true';
}

export function ThemePrefsProvider({ children }: { children: React.ReactNode }) {
  const [accentPreset, setAccentPresetState] = useState<ThemePreset>(() => readStoredAccent());
  const [highContrast, setHighContrastState] = useState<boolean>(() => readStoredHighContrast());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(ACCENT_STORAGE_KEY, accentPreset);
  }, [accentPreset]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(HIGH_CONTRAST_STORAGE_KEY, highContrast ? 'true' : 'false');
  }, [highContrast]);

  const setAccentPreset = useCallback((preset: ThemePreset) => {
    setAccentPresetState(preset);
  }, []);

  const setHighContrast = useCallback((value: boolean) => {
    setHighContrastState(value);
  }, []);

  const value = useMemo(
    () => ({ accentPreset, setAccentPreset, highContrast, setHighContrast }),
    [accentPreset, setAccentPreset, highContrast, setHighContrast],
  );

  return <ThemePrefsContext.Provider value={value}>{children}</ThemePrefsContext.Provider>;
}

export function useThemePrefs() {
  const ctx = useContext(ThemePrefsContext);
  if (!ctx) {
    throw new Error('useThemePrefs must be used within ThemePrefsProvider');
  }
  return ctx;
}
