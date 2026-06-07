import type { ThemeName, ColorTheme, AccessibilityMode } from '../types/theme';

export const THEME_LABELS: Record<ThemeName, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

export const COLOR_THEME_LABELS: Record<ColorTheme, string> = {
  default: 'Default',
  ocean: 'Ocean Blue',
  sunset: 'Warm Sunset',
  forest: 'Forest Green',
  cosmic: 'Cosmic Purple',
};

export const ACCESSIBILITY_MODE_LABELS: Record<AccessibilityMode, string> = {
  none: 'Normal',
  'high-contrast': 'High Contrast',
  'reduced-motion': 'Reduced Motion',
  'dyslexia-friendly': 'Dyslexia-Friendly',
};

export const ACCESSIBILITY_DESCRIPTIONS: Record<AccessibilityMode, string> = {
  none: 'Standard display',
  'high-contrast': 'Increased contrast for better visibility',
  'reduced-motion': 'Reduced animations and transitions',
  'dyslexia-friendly': 'OpenDyslexic font for improved readability',
};

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: more)').matches;
}

export function getRecommendedAccessibilityMode(): AccessibilityMode {
  if (prefersReducedMotion()) return 'reduced-motion';
  if (prefersHighContrast()) return 'high-contrast';
  return 'none';
}

export function syncThemePreferences() {
  const root = document.documentElement;
  const theme = root.style.getPropertyValue('--theme') || 'light';
  const colorTheme = root.style.getPropertyValue('--color-theme') || 'default';
  const accessibilityMode = root.style.getPropertyValue('--accessibility-mode') || 'none';

  return { theme, colorTheme, accessibilityMode };
}
