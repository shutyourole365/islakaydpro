import { Sun, Moon, Monitor, Palette } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useState, useRef, useEffect } from 'react';
import { THEME_LABELS, COLOR_THEME_LABELS, ACCESSIBILITY_MODE_LABELS, ACCESSIBILITY_DESCRIPTIONS } from '../../lib/themeManager';
import type { ColorTheme, AccessibilityMode } from '../../types/theme';

interface ThemeToggleProps {
  variant?: 'icon' | 'dropdown' | 'full' | 'extended';
  className?: string;
  showColorTheme?: boolean;
  showAccessibility?: boolean;
}

export default function ThemeToggle({
  variant = 'icon',
  className = '',
  showColorTheme = false,
  showAccessibility = false
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme, colorTheme, setColorTheme, accessibilityMode, setAccessibilityMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [openTab, setOpenTab] = useState<'theme' | 'color' | 'accessibility'>('theme');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themes = [
    { value: 'light' as const, label: THEME_LABELS.light, icon: Sun },
    { value: 'dark' as const, label: THEME_LABELS.dark, icon: Moon },
    { value: 'system' as const, label: THEME_LABELS.system, icon: Monitor },
  ];

  const colorThemes: ColorTheme[] = ['default', 'ocean', 'sunset', 'forest', 'cosmic'];
  const accessibilityModes: AccessibilityMode[] = ['none', 'high-contrast', 'reduced-motion', 'dyslexia-friendly'];

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
        className={`p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${className}`}
      >
        {resolvedTheme === 'light' ? (
          <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        ) : (
          <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        )}
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div ref={dropdownRef} className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Toggle theme menu"
        >
          {resolvedTheme === 'light' ? (
            <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-40 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
            {themes.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                aria-label={`Set theme to ${label}`}
                onClick={() => {
                  setTheme(value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors
                  ${theme === value 
                    ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {theme === value && (
                  <span className="ml-auto text-teal-500">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'extended' || (showColorTheme || showAccessibility)) {
    return (
      <div ref={dropdownRef} className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Theme settings"
        >
          <Palette className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 z-50">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setOpenTab('theme')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  openTab === 'theme'
                    ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Theme
              </button>
              {showColorTheme && (
                <button
                  onClick={() => setOpenTab('color')}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    openTab === 'color'
                      ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Colors
                </button>
              )}
              {showAccessibility && (
                <button
                  onClick={() => setOpenTab('accessibility')}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    openTab === 'accessibility'
                      ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  A11y
                </button>
              )}
            </div>

            {openTab === 'theme' && (
              <div className="py-2">
                {themes.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => {
                      setTheme(value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors
                      ${theme === value
                        ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                    {theme === value && <span className="ml-auto">✓</span>}
                  </button>
                ))}
              </div>
            )}

            {showColorTheme && openTab === 'color' && (
              <div className="py-2">
                {colorThemes.map((ct) => (
                  <button
                    key={ct}
                    onClick={() => {
                      setColorTheme(ct);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors
                      ${colorTheme === ct
                        ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                  >
                    <div className="w-4 h-4 rounded-full border-2 border-current" />
                    <span>{COLOR_THEME_LABELS[ct]}</span>
                    {colorTheme === ct && <span className="ml-auto">✓</span>}
                  </button>
                ))}
              </div>
            )}

            {showAccessibility && openTab === 'accessibility' && (
              <div className="py-2">
                {accessibilityModes.map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setAccessibilityMode(mode);
                      setIsOpen(false);
                    }}
                    className={`w-full flex flex-col gap-1 px-4 py-2 text-left transition-colors
                      ${accessibilityMode === mode
                        ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{ACCESSIBILITY_MODE_LABELS[mode]}</span>
                      {accessibilityMode === mode && <span>✓</span>}
                    </div>
                    <span className="text-xs opacity-75">{ACCESSIBILITY_DESCRIPTIONS[mode]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full variant - shows all options
  return (
    <div className={`flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
      {themes.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          aria-label={`Set theme to ${label}`}
          onClick={() => setTheme(value)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all
            ${theme === value
              ? 'bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
