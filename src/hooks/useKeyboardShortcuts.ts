import { useEffect, useCallback, useRef, useState } from 'react';

type KeyModifier = 'ctrl' | 'alt' | 'shift' | 'meta';
type KeyCombo = string; // e.g., "ctrl+k", "shift+enter"

interface ShortcutConfig {
  key: KeyCombo;
  handler: (e: KeyboardEvent) => void;
  description?: string;
  enabled?: boolean;
  preventDefault?: boolean;
  scope?: string;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  scope?: string;
}

/**
 * Parse a key combo string into its parts
 */
function parseKeyCombo(combo: string): { modifiers: Set<KeyModifier>; key: string } {
  const parts = combo.toLowerCase().split('+');
  const key = parts.pop() || '';
  const modifiers = new Set<KeyModifier>();
  
  for (const part of parts) {
    if (part === 'ctrl' || part === 'control') modifiers.add('ctrl');
    else if (part === 'alt' || part === 'option') modifiers.add('alt');
    else if (part === 'shift') modifiers.add('shift');
    else if (part === 'meta' || part === 'cmd' || part === 'command' || part === 'win') modifiers.add('meta');
  }
  
  return { modifiers, key };
}

/**
 * Check if the event matches the key combo
 */
function matchesKeyCombo(e: KeyboardEvent, combo: string): boolean {
  const { modifiers, key } = parseKeyCombo(combo);
  
  // Check modifiers
  if (modifiers.has('ctrl') !== e.ctrlKey) return false;
  if (modifiers.has('alt') !== e.altKey) return false;
  if (modifiers.has('shift') !== e.shiftKey) return false;
  if (modifiers.has('meta') !== e.metaKey) return false;
  
  // Check key
  const eventKey = e.key.toLowerCase();
  return eventKey === key || e.code.toLowerCase() === key || e.code.toLowerCase() === `key${key}`;
}

/**
 * Hook for managing keyboard shortcuts
 */
export function useKeyboardShortcuts(
  shortcuts: ShortcutConfig[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true, scope } = options;
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
                      target.isContentEditable;
      
      for (const shortcut of shortcutsRef.current) {
        if (shortcut.enabled === false) continue;
        if (scope && shortcut.scope && shortcut.scope !== scope) continue;
        
        if (matchesKeyCombo(e, shortcut.key)) {
          // Allow shortcuts with modifiers in inputs
          const hasModifier = e.ctrlKey || e.altKey || e.metaKey;
          if (isInput && !hasModifier) continue;
          
          if (shortcut.preventDefault !== false) {
            e.preventDefault();
          }
          shortcut.handler(e);
          return;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled, scope]);
}

/**
 * Hook for a single keyboard shortcut
 */
export function useKeyboardShortcut(
  combo: string,
  callback: (e: KeyboardEvent) => void,
  options: { enabled?: boolean; preventDefault?: boolean } = {}
) {
  const { enabled = true, preventDefault = true } = options;
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
                      target.isContentEditable;
      
      // Allow shortcuts with modifiers in inputs
      const hasModifier = e.ctrlKey || e.altKey || e.metaKey;
      if (isInput && !hasModifier) return;
      
      if (matchesKeyCombo(e, combo)) {
        if (preventDefault) {
          e.preventDefault();
        }
        callbackRef.current(e);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [combo, enabled, preventDefault]);
}

/**
 * Escape key hook
 */
export function useEscapeKey(callback: () => void, enabled = true) {
  useKeyboardShortcut('escape', callback, { enabled });
}

/**
 * Enter key hook
 */
export function useEnterKey(callback: () => void, enabled = true) {
  useKeyboardShortcut('enter', callback, { enabled, preventDefault: false });
}

/**
 * Hook for showing keyboard shortcuts help modal
 */
export function useShortcutsHelp(shortcuts: ShortcutConfig[]) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  // ? key shows help
  useKeyboardShortcut('shift+/', open);
  useEscapeKey(close, isOpen);

  const formattedShortcuts = shortcuts
    .filter(s => s.description)
    .map(s => ({
      key: s.key.replace(/\+/g, ' + ').toUpperCase(),
      description: s.description!,
      scope: s.scope,
    }));

  return {
    isOpen,
    toggle,
    open,
    close,
    shortcuts: formattedShortcuts,
  };
}

/**
 * Standard app shortcuts configuration
 */
export const defaultAppShortcuts: ShortcutConfig[] = [
  {
    key: 'ctrl+k',
    handler: () => document.dispatchEvent(new CustomEvent('shortcut:search')),
    description: 'Open search',
  },
  {
    key: 'ctrl+/',
    handler: () => document.dispatchEvent(new CustomEvent('shortcut:help')),
    description: 'Show keyboard shortcuts',
  },
  {
    key: 'g+h',
    handler: () => document.dispatchEvent(new CustomEvent('shortcut:home')),
    description: 'Go to home',
  },
  {
    key: 'g+b',
    handler: () => document.dispatchEvent(new CustomEvent('shortcut:browse')),
    description: 'Go to browse',
  },
  {
    key: 'g+d',
    handler: () => document.dispatchEvent(new CustomEvent('shortcut:dashboard')),
    description: 'Go to dashboard',
  },
  {
    key: 'g+m',
    handler: () => document.dispatchEvent(new CustomEvent('shortcut:messages')),
    description: 'Go to messages',
  },
  {
    key: 'escape',
    handler: () => document.dispatchEvent(new CustomEvent('shortcut:escape')),
    description: 'Close modal/dialog',
  },
];

/**
 * Hook to listen for custom shortcut events
 */
export function useShortcutEvent(
  eventName: string,
  callback: () => void,
  enabled = true
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;

    const handler = () => callbackRef.current();
    document.addEventListener(`shortcut:${eventName}`, handler);
    return () => document.removeEventListener(`shortcut:${eventName}`, handler);
  }, [eventName, enabled]);
}

/**
 * Typeahead search - press any letter to start searching
 */
export function useTypeaheadSearch(
  onSearch: (query: string) => void,
  options: { timeout?: number; enabled?: boolean } = {}
) {
  const { timeout = 300, enabled = true } = options;
  const bufferRef = useRef('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
                      target.isContentEditable;
      
      if (isInput) return;
      
      // Only alphanumeric characters
      if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key) && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        bufferRef.current += e.key;
        onSearch(bufferRef.current);
        
        timeoutRef.current = setTimeout(() => {
          bufferRef.current = '';
        }, timeout);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, timeout, onSearch]);
}
