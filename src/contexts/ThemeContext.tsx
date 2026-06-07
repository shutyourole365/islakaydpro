import { createContext, useEffect, useState, ReactNode } from 'react';
import type { ThemeName, ColorTheme, AccessibilityMode, ColorPalette } from '../types/theme';
import { COLOR_THEMES } from '../types/theme';

interface ThemeContextType {
  theme: ThemeName;
  resolvedTheme: 'light' | 'dark';
  colorTheme: ColorTheme;
  accessibilityMode: AccessibilityMode;
  colorPalette: ColorPalette;
  setTheme: (theme: ThemeName) => void;
  setColorTheme: (colorTheme: ColorTheme) => void;
  setAccessibilityMode: (mode: AccessibilityMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'islakayd-theme';
const COLOR_THEME_STORAGE_KEY = 'islakayd-color-theme';
const ACCESSIBILITY_MODE_STORAGE_KEY = 'islakayd-accessibility-mode';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): ThemeName {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored as ThemeName;
  }
  return 'system';
}

function getStoredColorTheme(): ColorTheme {
  if (typeof window === 'undefined') return 'default';
  const stored = localStorage.getItem(COLOR_THEME_STORAGE_KEY);
  const validThemes: ColorTheme[] = ['default', 'ocean', 'sunset', 'forest', 'cosmic'];
  if (validThemes.includes(stored as ColorTheme)) {
    return stored as ColorTheme;
  }
  return 'default';
}

function getStoredAccessibilityMode(): AccessibilityMode {
  if (typeof window === 'undefined') return 'none';
  const stored = localStorage.getItem(ACCESSIBILITY_MODE_STORAGE_KEY);
  const validModes: AccessibilityMode[] = ['none', 'high-contrast', 'reduced-motion', 'dyslexia-friendly'];
  if (validModes.includes(stored as AccessibilityMode)) {
    return stored as AccessibilityMode;
  }
  return 'none';
}

function getInitialResolvedTheme(): 'light' | 'dark' {
  const theme = getStoredTheme();
  return theme === 'system' ? getSystemTheme() : theme;
}

function getColorPalette(resolvedTheme: 'light' | 'dark', colorTheme: ColorTheme): ColorPalette {
  return COLOR_THEMES[colorTheme][resolvedTheme];
}

function applyThemeVariables(palette: ColorPalette, accessibilityMode: AccessibilityMode) {
  const root = document.documentElement;
  const keys = Object.keys(palette) as Array<keyof ColorPalette>;

  keys.forEach((key) => {
    root.style.setProperty(`--color-${key}`, palette[key]);
  });

  // Apply accessibility modes
  if (accessibilityMode === 'high-contrast') {
    root.classList.add('high-contrast-mode');
  } else {
    root.classList.remove('high-contrast-mode');
  }

  if (accessibilityMode === 'reduced-motion') {
    root.classList.add('reduced-motion-mode');
  } else {
    root.classList.remove('reduced-motion-mode');
  }

  if (accessibilityMode === 'dyslexia-friendly') {
    root.classList.add('dyslexia-friendly-mode');
  } else {
    root.classList.remove('dyslexia-friendly-mode');
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(getStoredTheme);
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(getStoredColorTheme);
  const [accessibilityMode, setAccessibilityModeState] = useState<AccessibilityMode>(getStoredAccessibilityMode);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(getInitialResolvedTheme);

  // Update resolved theme based on theme setting and system preference
  useEffect(() => {
    const resolved = theme === 'system' ? getSystemTheme() : theme;

    if (resolved !== resolvedTheme) {
      setResolvedTheme(resolved);
    }

    // Apply to document
    const root = document.documentElement;
    if (resolved === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const newResolved = getSystemTheme();
        setResolvedTheme(newResolved);
        if (newResolved === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, resolvedTheme]);

  // Apply color theme and accessibility settings
  useEffect(() => {
    const palette = getColorPalette(resolvedTheme, colorTheme);
    applyThemeVariables(palette, accessibilityMode);
  }, [resolvedTheme, colorTheme, accessibilityMode]);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  const setColorTheme = (newColorTheme: ColorTheme) => {
    setColorThemeState(newColorTheme);
    localStorage.setItem(COLOR_THEME_STORAGE_KEY, newColorTheme);
  };

  const setAccessibilityMode = (newMode: AccessibilityMode) => {
    setAccessibilityModeState(newMode);
    localStorage.setItem(ACCESSIBILITY_MODE_STORAGE_KEY, newMode);
  };

  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const colorPalette = getColorPalette(resolvedTheme, colorTheme);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        colorTheme,
        accessibilityMode,
        colorPalette,
        setTheme,
        setColorTheme,
        setAccessibilityMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
