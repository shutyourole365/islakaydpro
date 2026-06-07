export type ThemeName = 'light' | 'dark' | 'system';
export type ColorTheme = 'default' | 'ocean' | 'sunset' | 'forest' | 'cosmic';
export type AccessibilityMode = 'none' | 'high-contrast' | 'reduced-motion' | 'dyslexia-friendly';

export interface ThemeConfig {
  name: ThemeName;
  colorTheme: ColorTheme;
  accessibilityMode: AccessibilityMode;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export const COLOR_THEMES: Record<ColorTheme, { light: ColorPalette; dark: ColorPalette }> = {
  default: {
    light: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#ec4899',
      background: '#ffffff',
      foreground: '#1f2937',
      border: '#e5e7eb',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#0ea5e9',
    },
    dark: {
      primary: '#60a5fa',
      secondary: '#a78bfa',
      accent: '#f472b6',
      background: '#111827',
      foreground: '#f3f4f6',
      border: '#374151',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#38bdf8',
    },
  },
  ocean: {
    light: {
      primary: '#0369a1',
      secondary: '#0c4a6e',
      accent: '#06b6d4',
      background: '#f0f9ff',
      foreground: '#082f49',
      border: '#cffafe',
      success: '#14b8a6',
      warning: '#f59e0b',
      error: '#dc2626',
      info: '#0284c7',
    },
    dark: {
      primary: '#38bdf8',
      secondary: '#7dd3fc',
      accent: '#22d3ee',
      background: '#001f3f',
      foreground: '#e0f2fe',
      border: '#164e63',
      success: '#2dd4bf',
      warning: '#fbbf24',
      error: '#fca5a5',
      info: '#38bdf8',
    },
  },
  sunset: {
    light: {
      primary: '#ea580c',
      secondary: '#ca8a04',
      accent: '#dc2626',
      background: '#fff7ed',
      foreground: '#7c2d12',
      border: '#fed7aa',
      success: '#059669',
      warning: '#d97706',
      error: '#b91c1c',
      info: '#f97316',
    },
    dark: {
      primary: '#fb923c',
      secondary: '#facc15',
      accent: '#fca5a5',
      background: '#3f1f0f',
      foreground: '#fed7aa',
      border: '#92400e',
      success: '#10b981',
      warning: '#fbbf24',
      error: '#fca5a5',
      info: '#fb923c',
    },
  },
  forest: {
    light: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#10b981',
      background: '#f0fdf4',
      foreground: '#064e3b',
      border: '#a7f3d0',
      success: '#059669',
      warning: '#ca8a04',
      error: '#dc2626',
      info: '#06b6d4',
    },
    dark: {
      primary: '#34d399',
      secondary: '#6ee7b7',
      accent: '#2dd4bf',
      background: '#051b15',
      foreground: '#d1fae5',
      border: '#065f46',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#2dd4bf',
    },
  },
  cosmic: {
    light: {
      primary: '#7c3aed',
      secondary: '#a855f7',
      accent: '#ec4899',
      background: '#faf5ff',
      foreground: '#3f0f64',
      border: '#e9d5ff',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4',
    },
    dark: {
      primary: '#c084fc',
      secondary: '#d8b4fe',
      accent: '#f472b6',
      background: '#2d1b4e',
      foreground: '#f3e8ff',
      border: '#6d28d9',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#fca5a5',
      info: '#22d3ee',
    },
  },
};
