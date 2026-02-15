import { useState, useCallback } from 'react';
import { useKeyboardShortcut, useShortcutEvent } from './useKeyboardShortcuts';

/**
 * Hook to manage command palette state
 */
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  // Global shortcut to open
  useKeyboardShortcut('ctrl+k', open);
  useKeyboardShortcut('meta+k', open);

  // Listen for search events from other shortcuts
  useShortcutEvent('search', open);

  return { isOpen, open, close, toggle };
}
