import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Search,
  X,
  ArrowRight,
  Home,
  Package,
  MessageSquare,
  User,
  Settings,
  HelpCircle,
  Calendar,
  Heart,
  Bell,
  FileText,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { useKeyboardShortcut, useShortcutEvent } from '../../hooks/useKeyboardShortcuts';
import { FocusTrap } from '../../utils/accessibility';

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  category: 'navigation' | 'action' | 'search' | 'recent';
  keywords?: string[];
  onSelect: () => void;
  shortcut?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (path: string) => void;
  customCommands?: CommandItem[];
}

// Default commands
const getDefaultCommands = (onNavigate?: (path: string) => void): CommandItem[] => [
  {
    id: 'nav-home',
    title: 'Go to Home',
    description: 'Return to the homepage',
    icon: <Home className="w-4 h-4" />,
    category: 'navigation',
    keywords: ['home', 'main', 'start'],
    onSelect: () => onNavigate?.('/'),
    shortcut: 'G H',
  },
  {
    id: 'nav-browse',
    title: 'Browse Equipment',
    description: 'Search and filter equipment',
    icon: <Package className="w-4 h-4" />,
    category: 'navigation',
    keywords: ['browse', 'search', 'find', 'equipment', 'list'],
    onSelect: () => onNavigate?.('/browse'),
    shortcut: 'G B',
  },
  {
    id: 'nav-dashboard',
    title: 'Dashboard',
    description: 'View your dashboard',
    icon: <User className="w-4 h-4" />,
    category: 'navigation',
    keywords: ['dashboard', 'account', 'profile', 'my'],
    onSelect: () => onNavigate?.('/dashboard'),
    shortcut: 'G D',
  },
  {
    id: 'nav-messages',
    title: 'Messages',
    description: 'View your conversations',
    icon: <MessageSquare className="w-4 h-4" />,
    category: 'navigation',
    keywords: ['messages', 'chat', 'inbox', 'conversations'],
    onSelect: () => onNavigate?.('/messages'),
    shortcut: 'G M',
  },
  {
    id: 'nav-bookings',
    title: 'My Bookings',
    description: 'View your rental bookings',
    icon: <Calendar className="w-4 h-4" />,
    category: 'navigation',
    keywords: ['bookings', 'rentals', 'reservations'],
    onSelect: () => onNavigate?.('/bookings'),
  },
  {
    id: 'nav-favorites',
    title: 'Favorites',
    description: 'View saved equipment',
    icon: <Heart className="w-4 h-4" />,
    category: 'navigation',
    keywords: ['favorites', 'saved', 'wishlist', 'liked'],
    onSelect: () => onNavigate?.('/favorites'),
  },
  {
    id: 'nav-notifications',
    title: 'Notifications',
    description: 'View your notifications',
    icon: <Bell className="w-4 h-4" />,
    category: 'navigation',
    keywords: ['notifications', 'alerts', 'updates'],
    onSelect: () => onNavigate?.('/notifications'),
  },
  {
    id: 'nav-settings',
    title: 'Settings',
    description: 'Manage your account settings',
    icon: <Settings className="w-4 h-4" />,
    category: 'navigation',
    keywords: ['settings', 'preferences', 'config', 'options'],
    onSelect: () => onNavigate?.('/settings'),
  },
  {
    id: 'action-list',
    title: 'List Equipment',
    description: 'Create a new equipment listing',
    icon: <FileText className="w-4 h-4" />,
    category: 'action',
    keywords: ['list', 'create', 'new', 'add', 'equipment', 'rent out'],
    onSelect: () => onNavigate?.('/list'),
  },
  {
    id: 'action-ai',
    title: 'Open AI Assistant',
    description: 'Get help from Kayd AI',
    icon: <Zap className="w-4 h-4" />,
    category: 'action',
    keywords: ['ai', 'assistant', 'help', 'kayd', 'chat'],
    onSelect: () => document.dispatchEvent(new CustomEvent('open-ai-assistant')),
  },
  {
    id: 'action-help',
    title: 'Help & Support',
    description: 'Get help with using Islakayd',
    icon: <HelpCircle className="w-4 h-4" />,
    category: 'action',
    keywords: ['help', 'support', 'faq', 'contact'],
    onSelect: () => onNavigate?.('/help'),
  },
];

export default function CommandPalette({ 
  isOpen, 
  onClose, 
  onNavigate,
  customCommands = [] 
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const focusTrapRef = useRef<FocusTrap | null>(null);

  const commands = useMemo(() => {
    return [...getDefaultCommands(onNavigate), ...customCommands];
  }, [onNavigate, customCommands]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) {
      return commands;
    }

    const lowerQuery = query.toLowerCase();
    return commands.filter((cmd) => {
      const titleMatch = cmd.title.toLowerCase().includes(lowerQuery);
      const descMatch = cmd.description?.toLowerCase().includes(lowerQuery);
      const keywordMatch = cmd.keywords?.some(k => k.toLowerCase().includes(lowerQuery));
      return titleMatch || descMatch || keywordMatch;
    });
  }, [commands, query]);

  // Group by category
  const groupedCommands = useMemo(() => {
    return filteredCommands.reduce((acc, cmd) => {
      if (!acc[cmd.category]) acc[cmd.category] = [];
      acc[cmd.category].push(cmd);
      return acc;
    }, {} as Record<string, CommandItem[]>);
  }, [filteredCommands]);

  const categoryOrder = ['recent', 'navigation', 'action', 'search'];
  const sortedCategories = Object.keys(groupedCommands).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  const flatList = sortedCategories.flatMap(cat => groupedCommands[cat]);

  // Focus trap and body scroll lock
  useEffect(() => {
    if (isOpen && containerRef.current) {
      focusTrapRef.current = new FocusTrap(containerRef.current);
      document.body.style.overflow = 'hidden';
      inputRef.current?.focus();
    }

    return () => {
      focusTrapRef.current?.deactivate();
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, flatList.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (flatList[selectedIndex]) {
          flatList[selectedIndex].onSelect();
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [flatList, selectedIndex, onClose]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  const categoryLabels: Record<string, string> = {
    recent: 'Recent',
    navigation: 'Navigation',
    action: 'Actions',
    search: 'Search Results',
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, pages, or equipment..."
            className="flex-1 px-3 py-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
            aria-label="Search commands"
            autoComplete="off"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex px-2 py-1 ml-2 text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {flatList.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No results found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Try searching for something else
              </p>
            </div>
          ) : (
            sortedCategories.map((category) => (
              <div key={category} className="mb-4 last:mb-0">
                <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {categoryLabels[category] || category}
                </div>
                <div className="mt-1">
                  {groupedCommands[category].map((cmd) => {
                    const index = flatList.findIndex(c => c.id === cmd.id);
                    const isSelected = index === selectedIndex;
                    
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => {
                          cmd.onSelect();
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <span className={`flex-shrink-0 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                          {cmd.icon || <ArrowRight className="w-4 h-4" />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{cmd.title}</div>
                          {cmd.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {cmd.description}
                            </div>
                          )}
                        </div>
                        {cmd.shortcut && (
                          <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                            {cmd.shortcut}
                          </kbd>
                        )}
                        {isSelected && (
                          <ChevronRight className="w-4 h-4 text-blue-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 font-mono bg-white dark:bg-gray-700 border rounded">↑</kbd>
              <kbd className="px-1 py-0.5 font-mono bg-white dark:bg-gray-700 border rounded">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 font-mono bg-white dark:bg-gray-700 border rounded">↵</kbd>
              to select
            </span>
          </div>
          <span>
            <kbd className="px-1.5 py-0.5 font-mono bg-white dark:bg-gray-700 border rounded">⌘K</kbd>
            to open
          </span>
        </div>
      </div>
    </div>
  );
}

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
