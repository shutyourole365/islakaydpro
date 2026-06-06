import { createContext, useEffect, useRef, useState, ReactNode } from 'react';

/**
 * Briefly enables a global color transition so light/dark switches cross-fade
 * instead of flipping instantly. The class is removed once the transition has
 * run so it never affects other interactions.
 */
function runThemeTransition() {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.add('theme-transition');
  window.setTimeout(() => root.classList.remove('theme-transition'), 450);
}

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'islakayd-theme';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

function getInitialResolvedTheme(): 'light' | 'dark' {
  const theme = getStoredTheme();
  return theme === 'system' ? getSystemTheme() : theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(getInitialResolvedTheme);
  const lastAppliedRef = useRef<'light' | 'dark' | null>(null);

  // Update resolved theme based on theme setting and system preference
  useEffect(() => {
    const resolved = theme === 'system' ? getSystemTheme() : theme;

    // Only update state if it changed
    if (resolved !== resolvedTheme) {
      setResolvedTheme(resolved);
    }

    // Cross-fade on real changes only — not on the initial paint.
    if (lastAppliedRef.current !== null && lastAppliedRef.current !== resolved) {
      runThemeTransition();
    }
    lastAppliedRef.current = resolved;

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
        runThemeTransition();
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

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
