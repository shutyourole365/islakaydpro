import { useState, useEffect, useRef } from 'react';
import {
  Plus,
  X,
  Search,
  Home,
  Heart,
  MessageSquare,
  Bell,
  User,
  Settings,
  HelpCircle,
  Sparkles,
  Camera,
  Mic,
  Map,
  Calendar,
  Zap,
  Trophy,
  Gift,
  BarChart3,
  Shield,
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
  badge?: number;
  isNew?: boolean;
}

interface QuickActionsMenuProps {
  actions?: QuickAction[];
  onNavigate: (page: string) => void;
  unreadMessages?: number;
  unreadNotifications?: number;
  className?: string;
}

const defaultActions = (onNavigate: (page: string) => void, unreadMessages: number, unreadNotifications: number): QuickAction[] => [
  { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" />, color: 'from-blue-500 to-indigo-500', action: () => onNavigate('home') },
  { id: 'search', label: 'Search', icon: <Search className="w-5 h-5" />, color: 'from-teal-500 to-emerald-500', action: () => onNavigate('browse') },
  { id: 'ai', label: 'AI Assistant', icon: <Sparkles className="w-5 h-5" />, color: 'from-violet-500 to-purple-500', action: () => {}, isNew: true },
  { id: 'map', label: 'Map View', icon: <Map className="w-5 h-5" />, color: 'from-green-500 to-teal-500', action: () => onNavigate('browse') },
  { id: 'favorites', label: 'Favorites', icon: <Heart className="w-5 h-5" />, color: 'from-pink-500 to-rose-500', action: () => onNavigate('dashboard') },
  { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-5 h-5" />, color: 'from-cyan-500 to-blue-500', action: () => onNavigate('dashboard'), badge: unreadMessages },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" />, color: 'from-amber-500 to-orange-500', action: () => onNavigate('notifications'), badge: unreadNotifications },
  { id: 'calendar', label: 'Bookings', icon: <Calendar className="w-5 h-5" />, color: 'from-indigo-500 to-purple-500', action: () => onNavigate('dashboard') },
  { id: 'rewards', label: 'Rewards', icon: <Trophy className="w-5 h-5" />, color: 'from-yellow-500 to-amber-500', action: () => onNavigate('dashboard'), isNew: true },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, color: 'from-emerald-500 to-green-500', action: () => onNavigate('analytics') },
  { id: 'security', label: 'Security', icon: <Shield className="w-5 h-5" />, color: 'from-slate-500 to-gray-600', action: () => onNavigate('security') },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" />, color: 'from-gray-500 to-gray-600', action: () => onNavigate('dashboard') },
];

export default function QuickActionsMenu({
  actions,
  onNavigate,
  unreadMessages = 3,
  unreadNotifications = 5,
  className = '',
}: QuickActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentActions, setRecentActions] = useState<string[]>(['search', 'messages', 'ai']);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const allActions = actions || defaultActions(onNavigate, unreadMessages, unreadNotifications);

  const filteredActions = searchQuery
    ? allActions.filter(a => a.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : allActions;

  const recentActionItems = recentActions
    .map(id => allActions.find(a => a.id === id))
    .filter(Boolean) as QuickAction[];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      // Close with Escape
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleOpen = () => {
    setIsAnimating(true);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsOpen(false);
      setSearchQuery('');
      setIsAnimating(false);
    }, 200);
  };

  const handleActionClick = (action: QuickAction) => {
    // Add to recent actions
    setRecentActions(prev => {
      const filtered = prev.filter(id => id !== action.id);
      return [action.id, ...filtered].slice(0, 5);
    });
    
    action.action();
    handleClose();
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={isOpen ? handleClose : handleOpen}
        className={`fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? 'bg-gray-900 rotate-45 scale-90'
            : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:shadow-xl hover:scale-110'
        } ${className}`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <Plus className="w-6 h-6 text-white" />
            {(unreadMessages > 0 || unreadNotifications > 0) && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadMessages + unreadNotifications > 9 ? '9+' : unreadMessages + unreadNotifications}
              </span>
            )}
          </>
        )}
      </button>

      {/* Quick Actions Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className={`fixed bottom-24 left-6 z-50 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden ${
            isAnimating ? 'animate-in fade-in slide-in-from-bottom-4 duration-200' : ''
          }`}
        >
          {/* Search header */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search actions..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-gray-200 rounded text-xs text-gray-500">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Recent actions */}
          {!searchQuery && recentActionItems.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 px-1">Recent</p>
              <div className="flex items-center gap-2">
                {recentActionItems.map(action => (
                  <button
                    key={action.id}
                    onClick={() => handleActionClick(action)}
                    className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center text-white shadow-md hover:shadow-lg hover:scale-105 transition-all relative`}
                    title={action.label}
                  >
                    {action.icon}
                    {action.badge && action.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {action.badge > 9 ? '9+' : action.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* All actions grid */}
          <div className="p-3 max-h-80 overflow-y-auto">
            {!searchQuery && <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 px-1">All Actions</p>}
            
            <div className="grid grid-cols-3 gap-2">
              {filteredActions.map((action, index) => (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  className="group relative flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-all"
                  style={{
                    animation: 'fadeInUp 0.3s ease-out forwards',
                    animationDelay: `${index * 0.03}s`,
                    opacity: 0,
                  }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center text-white shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all relative`}>
                    {action.icon}
                    {action.badge && action.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {action.badge > 9 ? '9+' : action.badge}
                      </span>
                    )}
                    {action.isNew && (
                      <span className="absolute -top-1 -left-1 px-1.5 py-0.5 bg-purple-500 text-white text-[8px] font-bold rounded-full uppercase">
                        New
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center">{action.label}</span>
                </button>
              ))}
            </div>

            {filteredActions.length === 0 && (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No actions found</p>
              </div>
            )}
          </div>

          {/* Voice & Help */}
          <div className="p-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title="Voice command">
                <Mic className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title="Camera search">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <HelpCircle className="w-4 h-4" />
              Help
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={handleClose} />
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
