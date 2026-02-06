import { useEffect, useRef } from 'react';
import { X, Keyboard, Command } from 'lucide-react';
import { useShortcutsHelp, defaultAppShortcuts } from '../../hooks/useKeyboardShortcuts';
import { FocusTrap } from '../../utils/accessibility';

interface KeyboardShortcutsHelpProps {
  additionalShortcuts?: Array<{
    key: string;
    description: string;
    scope?: string;
  }>;
}

export default function KeyboardShortcutsHelp({ additionalShortcuts = [] }: KeyboardShortcutsHelpProps) {
  const { isOpen, close, shortcuts } = useShortcutsHelp(defaultAppShortcuts);
  const modalRef = useRef<HTMLDivElement>(null);
  const focusTrapRef = useRef<FocusTrap | null>(null);

  const allShortcuts = [...shortcuts, ...additionalShortcuts];

  // Group shortcuts by scope
  const groupedShortcuts = allShortcuts.reduce((acc, shortcut) => {
    const scope = shortcut.scope || 'Global';
    if (!acc[scope]) acc[scope] = [];
    acc[scope].push(shortcut);
    return acc;
  }, {} as Record<string, typeof allShortcuts>);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      focusTrapRef.current = new FocusTrap(modalRef.current);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      focusTrapRef.current?.deactivate();
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Detect OS for key display
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifierKey = isMac ? '⌘' : 'Ctrl';

  const formatKey = (key: string) => {
    return key
      .replace(/CTRL/gi, modifierKey)
      .replace(/META/gi, modifierKey)
      .replace(/ALT/gi, isMac ? '⌥' : 'Alt')
      .replace(/SHIFT/gi, isMac ? '⇧' : 'Shift')
      .replace(/ESCAPE/gi, 'Esc')
      .replace(/ENTER/gi, '↵');
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        className="relative w-full max-w-lg max-h-[80vh] bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Keyboard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 id="shortcuts-title" className="text-lg font-semibold text-gray-900 dark:text-white">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={close}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close shortcuts help"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {Object.entries(groupedShortcuts).map(([scope, scopeShortcuts]) => (
            <div key={scope} className="mb-6 last:mb-0">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                {scope}
              </h3>
              <div className="space-y-2">
                {scopeShortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {shortcut.description}
                    </span>
                    <kbd className="inline-flex items-center gap-1 px-2 py-1 text-xs font-mono bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-sm">
                      {formatKey(shortcut.key).split(' + ').map((part, i, arr) => (
                        <span key={i} className="flex items-center">
                          {part === modifierKey && isMac ? (
                            <Command className="w-3 h-3" />
                          ) : (
                            part
                          )}
                          {i < arr.length - 1 && <span className="mx-0.5 text-gray-400">+</span>}
                        </span>
                      ))}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Press <kbd className="px-1.5 py-0.5 mx-1 text-xs font-mono bg-white dark:bg-gray-700 border rounded">?</kbd> 
            anytime to show this help
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to register the keyboard shortcuts help modal
 */
export function useKeyboardShortcutsModal() {
  const { isOpen, open, close } = useShortcutsHelp(defaultAppShortcuts);
  return { isOpen, open, close };
}
