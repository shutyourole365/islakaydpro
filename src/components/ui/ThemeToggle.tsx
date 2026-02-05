import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useState, useRef, useEffect } from 'react';

interface ThemeToggleProps {
  variant?: 'icon' | 'dropdown' | 'full';
  className?: string;
}

export default function ThemeToggle({ variant = 'icon', className = '' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
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
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ];

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${className}`}
        aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
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

  // Full variant - shows all options
  return (
    <div className={`flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
      {themes.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all
            ${theme === value
              ? 'bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          aria-label={`Set ${label} theme`}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
