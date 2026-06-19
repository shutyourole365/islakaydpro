import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUnreadNotificationCount, subscribeToNotifications, getUnreadMessageCount, subscribeToMessages } from '../../services/database';
import {
  Search,
  Menu,
  X,
  User,
  Heart,
  MessageSquare,
  Bell,
  Plus,
  ChevronDown,
  LogOut,
  Settings,
  LayoutDashboard,
  Package,
  Wrench,
  Calendar,
  Users,
  Info,
  HelpCircle,
  ShieldCheck,
  Mail,
  Briefcase,
  Newspaper,
  PenSquare,
  Handshake,
  TrendingUp,
  LayoutGrid,
  HardHat,
  Drill,
  Camera,
  Music,
  Trees,
  Truck,
  Sparkles,
  Lightbulb,
  Dumbbell,
  Home,
  Plane,
  PartyPopper,
  ArrowRight,
} from 'lucide-react';
import NotificationsDropdown from '../notifications/NotificationsDropdown';
import LogoPro from '../branding/LogoPro';
import ThemeToggle from '../ui/ThemeToggle';

interface HeaderProps {
  onSearchClick: () => void;
  onAuthClick: (mode?: 'signin' | 'signup') => void;
  isAuthenticated: boolean;
  onNavigate: (page: string) => void;
  onListEquipment: () => void;
  onSignOut: () => void;
  onSelectCategory?: (slug: string) => void;
  offsetTop?: boolean;
  currentPage: string;
}

const exploreCategories = [
  { label: 'Construction', slug: 'construction', Icon: HardHat },
  { label: 'Power Tools', slug: 'power-tools', Icon: Drill },
  { label: 'Photography', slug: 'photography', Icon: Camera },
  { label: 'Audio & DJ', slug: 'audio', Icon: Music },
  { label: 'Landscaping', slug: 'landscaping', Icon: Trees },
  { label: 'Events & Parties', slug: 'events', Icon: PartyPopper },
  { label: 'Vehicles', slug: 'vehicles', Icon: Truck },
  { label: 'Cleaning', slug: 'cleaning', Icon: Sparkles },
  { label: 'Drones & Aerial', slug: 'drones', Icon: Plane },
  { label: 'Lighting', slug: 'lighting', Icon: Lightbulb },
  { label: 'Sports & Rec', slug: 'sports', Icon: Dumbbell },
  { label: 'Home Improvement', slug: 'home-improvement', Icon: Home },
];

const companyLinks = [
  { label: 'About Us', page: 'about', Icon: Info },
  { label: 'Careers', page: 'careers', Icon: Briefcase },
  { label: 'Press', page: 'press', Icon: Newspaper },
  { label: 'Blog', page: 'blog', Icon: PenSquare },
  { label: 'Partnerships', page: 'partnerships', Icon: Handshake },
  { label: 'Investors', page: 'investors', Icon: TrendingUp },
];

const supportLinks = [
  { label: 'Help Center', page: 'help', Icon: HelpCircle },
  { label: 'Safety', page: 'safety', Icon: ShieldCheck },
  { label: 'Trust & Verification', page: 'trust', Icon: ShieldCheck },
  { label: 'Contact Us', page: 'contact', Icon: Mail },
];

const profileLinks = [
  { label: 'Dashboard', page: 'dashboard', Icon: LayoutDashboard },
  { label: 'My Listings', page: 'dashboard', Icon: Package },
  { label: 'Favorites', page: 'dashboard', Icon: Heart },
  { label: 'Settings', page: 'dashboard', Icon: Settings },
  { label: 'Maintenance', page: 'maintenance', Icon: Wrench },
  { label: 'Smart Scheduler', page: 'scheduler', Icon: Calendar },
  { label: 'Referrals', page: 'referrals', Icon: Users },
];

export default function Header({
  onSearchClick,
  onAuthClick,
  isAuthenticated,
  onNavigate,
  onListEquipment,
  onSignOut,
  onSelectCategory,
  offsetTop = false,
  currentPage,
}: HeaderProps) {
  const { user, profile } = useAuth();
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const msgUnsubRef = useRef<(() => void) | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCompanyMenuOpen, setIsCompanyMenuOpen] = useState(false);
  const [isSupportMenuOpen, setIsSupportMenuOpen] = useState(false);
  const [isExploreMenuOpen, setIsExploreMenuOpen] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'My Account';
  const displayEmail = user?.email || '';
  const initials = (profile?.full_name || user?.email || 'U')
    .split(' ')
    .map(part => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

  useEffect(() => {
    if (!user) { setUnreadNotifCount(0); return; }
    getUnreadNotificationCount(user.id).then(setUnreadNotifCount).catch(() => {});
    const unsub = subscribeToNotifications(user.id, () => {
      getUnreadNotificationCount(user.id).then(setUnreadNotifCount).catch(() => {});
    });
    unsubRef.current = unsub?.unsubscribe ? () => unsub.unsubscribe() : null;
    return () => { unsubRef.current?.(); };
  }, [user]);

  // Real-time unread message count
  useEffect(() => {
    if (!user) { setUnreadMsgCount(0); return; }
    getUnreadMessageCount(user.id).then(setUnreadMsgCount).catch(() => {});
    // Subscribe to new messages for this user
    const channel = subscribeToMessages('all', () => {
      getUnreadMessageCount(user.id).then(setUnreadMsgCount).catch(() => {});
    });
    msgUnsubRef.current = channel?.unsubscribe ? () => channel.unsubscribe() : null;
    return () => { msgUnsubRef.current?.(); };
  }, [user?.id]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeAllMenus = () => {
    setIsProfileMenuOpen(false);
    setIsNotificationsOpen(false);
    setIsCompanyMenuOpen(false);
    setIsSupportMenuOpen(false);
    setIsExploreMenuOpen(false);
  };

  const handleCategorySelect = (slug: string) => {
    setIsExploreMenuOpen(false);
    setIsMobileMenuOpen(false);
    if (onSelectCategory) onSelectCategory(slug);
    else onNavigate('browse');
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.profile-menu')) setIsProfileMenuOpen(false);
      if (!target.closest('.notifications-menu')) setIsNotificationsOpen(false);
      if (!target.closest('.company-menu')) setIsCompanyMenuOpen(false);
      if (!target.closest('.support-menu')) setIsSupportMenuOpen(false);
      if (!target.closest('.explore-menu')) setIsExploreMenuOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAllMenus();
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // The light hero needs a solid header; transparent-over-photo mode is retired
  const showTransparent: boolean = false;

  const navItemClass = (page?: string) =>
    `text-sm font-medium transition-colors hover:text-teal-500 ${
      page && currentPage === page
        ? 'text-teal-500'
        : showTransparent
          ? 'text-white/90'
          : 'text-gray-700 dark:text-gray-200'
    }`;

  const dropdownPanelClass =
    'absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50';

  const dropdownItemClass =
    'flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors';

  const scrollToHowItWorks = () => {
    onNavigate('home');
    setTimeout(() => {
      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const renderDropdown = (
    label: string,
    links: typeof companyLinks,
    isOpen: boolean,
    setOpen: (open: boolean) => void,
    menuClass: string
  ) => (
    <div className={`relative ${menuClass}`}>
      <button
        onClick={() => setOpen(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={`flex items-center gap-1 ${navItemClass()}`}
      >
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div role="menu" className={dropdownPanelClass}>
          {links.map(({ label: itemLabel, page, Icon }) => (
            <button
              key={itemLabel}
              role="menuitem"
              onClick={() => {
                onNavigate(page);
                setOpen(false);
              }}
              className={dropdownItemClass}
            >
              <Icon className="w-4 h-4 text-gray-400" />
              {itemLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <header
      className={`fixed left-0 right-0 z-50 transition-all duration-300 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md ${
        offsetTop ? 'top-10' : 'top-0'
      } ${
        isScrolled
          ? 'shadow-lg dark:shadow-gray-950/50'
          : 'border-b border-gray-100 dark:border-gray-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-10">
            <button onClick={() => onNavigate('home')} aria-label="Go to home page" className="flex items-center">
              <LogoPro variant={showTransparent ? 'light' : 'default'} size="md" showText={true} />
            </button>

            <nav className="hidden lg:flex items-center gap-7" aria-label="Primary">
              {/* Explore mega-menu */}
              <div className="relative explore-menu">
                <button
                  onClick={() => setIsExploreMenuOpen(!isExploreMenuOpen)}
                  aria-haspopup="menu"
                  aria-expanded={isExploreMenuOpen}
                  className={`flex items-center gap-1 ${navItemClass()}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Explore
                  <ChevronDown className={`w-4 h-4 transition-transform ${isExploreMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isExploreMenuOpen && (
                  <div
                    role="menu"
                    className="absolute top-full left-0 mt-3 w-[640px] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-5 z-50 animate-fade-in"
                  >
                    <div className="flex items-center justify-between px-2 pb-3 mb-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Browse by category
                      </span>
                      <button
                        onClick={() => { onNavigate('browse'); setIsExploreMenuOpen(false); }}
                        className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 dark:text-teal-400 hover:gap-2 transition-all"
                      >
                        View all <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {exploreCategories.map(({ label, slug, Icon }) => (
                        <button
                          key={slug}
                          role="menuitem"
                          onClick={() => handleCategorySelect(slug)}
                          className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
                        >
                          <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/40 dark:to-emerald-900/40 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:from-teal-500 group-hover:to-emerald-500 group-hover:text-white transition-all">
                            <Icon className="w-5 h-5" />
                          </span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-teal-700 dark:group-hover:text-teal-300">
                            {label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => onNavigate('browse')} className={navItemClass('browse')}>
                Browse Equipment
              </button>
              <button onClick={() => onNavigate('requests')} className={navItemClass('requests')}>
                Wanted
              </button>
              <button onClick={scrollToHowItWorks} className={navItemClass()}>
                How It Works
              </button>
              {renderDropdown('Company', companyLinks, isCompanyMenuOpen, setIsCompanyMenuOpen, 'company-menu')}
              {renderDropdown('Support', supportLinks, isSupportMenuOpen, setIsSupportMenuOpen, 'support-menu')}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onSearchClick}
              className={`hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all ${
                showTransparent
                  ? 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="text-sm">Search equipment...</span>
              <kbd
                className={`hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs ${
                  showTransparent
                    ? 'bg-white/20 text-white/70'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                ⌘K
              </kbd>
            </button>

            {isAuthenticated ? (
              <>
                <button
                  onClick={onListEquipment}
                  className={`hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all ${
                    showTransparent
                      ? 'bg-white text-gray-900 hover:bg-gray-100'
                      : 'bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 bg-[length:200%_auto] hover:bg-[position:right_center] text-white shadow-brand hover:shadow-brand-lg'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">List Equipment</span>
                </button>

                <div className="hidden sm:flex items-center gap-1.5">
                  <button
                    aria-label="Favorites"
                    onClick={() => onNavigate('dashboard')}
                    className={`p-2.5 rounded-full transition-colors ${
                      showTransparent
                        ? 'text-white hover:bg-white/10'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                  <button
                    aria-label={unreadMsgCount > 0 ? `Messages, ${unreadMsgCount} unread` : 'Messages'}
                    onClick={() => onNavigate('dashboard')}
                    className={`p-2.5 rounded-full transition-colors relative ${
                      showTransparent
                        ? 'text-white hover:bg-white/10'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5" />
                    {unreadMsgCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-teal-500 text-white text-[10px] font-bold rounded-full">
                        {unreadMsgCount > 9 ? '9+' : unreadMsgCount}
                      </span>
                    )}
                  </button>
                  <div className="relative notifications-menu">
                    <button
                      onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                      aria-label={unreadNotifCount > 0 ? `Notifications, ${unreadNotifCount} unread` : 'Notifications'}
                      aria-expanded={isNotificationsOpen}
                      className={`p-2.5 rounded-full transition-colors relative ${
                        showTransparent
                          ? 'text-white hover:bg-white/10'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Bell className="w-5 h-5" />
                      {unreadNotifCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
                          {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                        </span>
                      )}
                    </button>
                    <NotificationsDropdown
                      isOpen={isNotificationsOpen}
                      onClose={() => {
                        setIsNotificationsOpen(false);
                        if (user) getUnreadNotificationCount(user.id).then(setUnreadNotifCount).catch(() => {});
                      }}
                    />
                  </div>
                  <ThemeToggle variant="dropdown" />
                </div>

                <div className="relative profile-menu">
                  <button
                    aria-label="Open profile menu"
                    aria-haspopup="menu"
                    aria-expanded={isProfileMenuOpen}
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className={`flex items-center gap-2 p-1.5 rounded-full transition-colors ${
                      showTransparent ? 'hover:bg-white/10' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={displayName}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                        {initials ? (
                          <span className="text-white text-sm font-semibold">{initials}</span>
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''} ${
                        showTransparent ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                      }`}
                    />
                  </button>

                  {isProfileMenuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-60 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">{displayName}</p>
                        {displayEmail && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{displayEmail}</p>
                        )}
                      </div>
                      <div className="py-2">
                        {profileLinks.map(({ label, page, Icon }) => (
                          <button
                            key={label}
                            role="menuitem"
                            onClick={() => {
                              onNavigate(page);
                              setIsProfileMenuOpen(false);
                            }}
                            className={dropdownItemClass}
                          >
                            <Icon className="w-5 h-5 text-gray-400" />
                            {label}
                          </button>
                        ))}
                      </div>
                      <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                        <button
                          role="menuitem"
                          onClick={() => {
                            onSignOut();
                            setIsProfileMenuOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
                        >
                          <LogOut className="w-5 h-5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <ThemeToggle variant="dropdown" />
                <button
                  onClick={() => onAuthClick('signin')}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${
                    showTransparent
                      ? 'text-white hover:bg-white/10'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => onAuthClick('signup')}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    showTransparent
                      ? 'bg-white text-gray-900 hover:bg-gray-100'
                      : 'bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 bg-[length:200%_auto] hover:bg-[position:right_center] text-white shadow-brand hover:shadow-brand-lg'
                  }`}
                >
                  Get Started
                </button>
              </div>
            )}

            <button
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2.5 rounded-full transition-colors ${
                showTransparent
                  ? 'text-white hover:bg-white/10'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-xl max-h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="px-4 py-6 space-y-4">
            <button
              onClick={() => {
                onSearchClick();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-300"
            >
              <Search className="w-5 h-5" />
              <span>Search equipment...</span>
            </button>

            <nav className="space-y-1" aria-label="Mobile">
              {[
                { label: 'Browse Equipment', action: () => onNavigate('browse') },
                { label: 'Wanted', action: () => onNavigate('requests') },
                { label: 'How It Works', action: scrollToHowItWorks },
                { label: 'About Us', action: () => onNavigate('about') },
                { label: 'Help Center', action: () => onNavigate('help') },
                { label: 'Contact Us', action: () => onNavigate('contact') },
              ].map(({ label, action }) => (
                <button
                  key={label}
                  onClick={() => {
                    action();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {label}
                </button>
              ))}
            </nav>

            {/* Category quick-grid */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <span className="block px-4 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Categories
              </span>
              <div className="grid grid-cols-2 gap-2">
                {exploreCategories.slice(0, 8).map(({ label, slug, Icon }) => (
                  <button
                    key={slug}
                    onClick={() => handleCategorySelect(slug)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 dark:border-gray-800 pt-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Appearance</span>
              <ThemeToggle variant="dropdown" />
            </div>

            {isAuthenticated ? (
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                <button
                  onClick={() => {
                    onListEquipment();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 text-white font-medium shadow-brand transition-colors"
                >
                  List Equipment
                </button>
                <button
                  onClick={() => {
                    onNavigate('dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-xl text-gray-700 dark:text-gray-200 font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Dashboard
                </button>
                <div className="pt-2 space-y-2">
                  {[
                    { label: 'Maintenance', page: 'maintenance', Icon: Wrench },
                    { label: 'Smart Scheduler', page: 'scheduler', Icon: Calendar },
                    { label: 'Referrals', page: 'referrals', Icon: Users },
                  ].map(({ label, page, Icon }) => (
                    <button
                      key={label}
                      onClick={() => {
                        onNavigate(page);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-2 px-3 rounded-lg text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    onSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-xl text-red-600 dark:text-red-400 font-medium border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                <button
                  onClick={() => {
                    onAuthClick('signin');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-xl text-gray-700 dark:text-gray-200 font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    onAuthClick('signup');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 text-white font-medium shadow-brand transition-colors"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

