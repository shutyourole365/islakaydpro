import { useState, useEffect, useRef } from 'react';
import {
  Search, Menu, X, Heart, MessageSquare, Bell, Plus,
  ChevronDown, LogOut, Settings, LayoutDashboard, Package, HelpCircle,
} from 'lucide-react';
import NotificationsDropdown from '../notifications/NotificationsDropdown';
import LogoPro from '../branding/LogoPro';

interface HeaderProps {
  onSearchClick: () => void;
  onAuthClick: () => void;
  isAuthenticated: boolean;
  onNavigate: (page: string) => void;
  onListEquipment: () => void;
  onSignOut: () => void;
  currentPage: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string | null;
  unreadCount?: number;
}

export default function Header({
  onSearchClick,
  onAuthClick,
  isAuthenticated,
  onNavigate,
  onListEquipment,
  onSignOut,
  currentPage,
  userName,
  userEmail,
  userAvatar,
  unreadCount = 0,
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isHomePage = currentPage === 'home';
  const showTransparent = isHomePage && !isScrolled;
  const displayName = userName || userEmail?.split('@')[0] || 'User';
  const displayEmail = userEmail || '';
  const initials = displayName.charAt(0).toUpperCase();

  const navLinkClass = `text-sm font-medium transition-colors hover:text-teal-500 ${
    showTransparent ? 'text-white/90' : 'text-gray-700'
  }`;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showTransparent
          ? 'bg-gradient-to-b from-black/50 to-transparent'
          : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[4.5rem]">
          <div className="flex items-center gap-10">
            <button onClick={() => onNavigate('home')} className="flex items-center">
              <LogoPro variant={showTransparent ? 'light' : 'default'} size="md" showText />
            </button>

            <nav className="hidden lg:flex items-center gap-7">
              <button onClick={() => onNavigate('browse')} className={navLinkClass}>
                Browse
              </button>
              <button
                onClick={() => {
                  onNavigate('home');
                  setTimeout(() => {
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className={navLinkClass}
              >
                How It Works
              </button>
              <button onClick={() => onNavigate('support')} className={navLinkClass}>
                Support
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onSearchClick}
              className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                showTransparent
                  ? 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                  : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="text-sm">Search...</span>
              <kbd
                className={`hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono ${
                  showTransparent ? 'bg-white/20 text-white/70' : 'bg-gray-200 text-gray-400'
                }`}
              >
                /
              </kbd>
            </button>

            {isAuthenticated ? (
              <>
                <button
                  onClick={onListEquipment}
                  className={`hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    showTransparent
                      ? 'bg-white text-gray-900 hover:bg-gray-100'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  List Equipment
                </button>

                <div className="hidden sm:flex items-center gap-1">
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className={`p-2 rounded-full transition-colors ${
                      showTransparent ? 'text-white hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className={`p-2 rounded-full transition-colors ${
                      showTransparent ? 'text-white hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                  <div ref={notifRef} className="relative">
                    <button
                      onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                      className={`p-2 rounded-full transition-colors relative ${
                        showTransparent ? 'text-white hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                      )}
                    </button>
                    <NotificationsDropdown
                      isOpen={isNotificationsOpen}
                      onClose={() => setIsNotificationsOpen(false)}
                    />
                  </div>
                </div>

                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className={`flex items-center gap-1.5 p-1 rounded-full transition-colors ${
                      showTransparent ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                    }`}
                  >
                    {userAvatar ? (
                      <img src={userAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-sm font-semibold">
                        {initials}
                      </div>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${
                        isProfileMenuOpen ? 'rotate-180' : ''
                      } ${showTransparent ? 'text-white' : 'text-gray-500'}`}
                    />
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-900 text-sm truncate">{displayName}</p>
                        <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
                      </div>
                      <div className="py-1">
                        {[
                          { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
                          { icon: Package, label: 'My Listings', page: 'dashboard' },
                          { icon: Heart, label: 'Favorites', page: 'dashboard' },
                          { icon: Settings, label: 'Settings', page: 'dashboard' },
                          { icon: HelpCircle, label: 'Support', page: 'support' },
                        ].map((item) => (
                          <button
                            key={item.label}
                            onClick={() => {
                              onNavigate(item.page);
                              setIsProfileMenuOpen(false);
                            }}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full"
                          >
                            <item.icon className="w-4 h-4 text-gray-400" />
                            {item.label}
                          </button>
                        ))}
                      </div>
                      <div className="border-t border-gray-100 py-1">
                        <button
                          onClick={() => {
                            onSignOut();
                            setIsProfileMenuOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={onAuthClick}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    showTransparent ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={onAuthClick}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    showTransparent
                      ? 'bg-white text-gray-900 hover:bg-gray-100'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}
                >
                  Get Started
                </button>
              </div>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-full transition-colors ${
                showTransparent ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl">
          <div className="px-4 py-5 space-y-3">
            <button
              onClick={() => { onSearchClick(); setIsMobileMenuOpen(false); }}
              className="flex items-center gap-3 w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-500"
            >
              <Search className="w-5 h-5" />
              <span className="text-sm">Search equipment...</span>
            </button>

            <nav className="space-y-0.5">
              {[
                { label: 'Browse Equipment', page: 'browse' },
                { label: 'How It Works', page: 'home' },
                { label: 'Support', page: 'support' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => { onNavigate(item.page); setIsMobileMenuOpen(false); }}
                  className="block w-full text-left px-4 py-3 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {isAuthenticated ? (
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <button
                  onClick={() => { onListEquipment(); setIsMobileMenuOpen(false); }}
                  className="w-full py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors"
                >
                  List Equipment
                </button>
                <button
                  onClick={() => { onNavigate('dashboard'); setIsMobileMenuOpen(false); }}
                  className="w-full py-2.5 rounded-xl text-gray-700 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { onNavigate('notifications'); setIsMobileMenuOpen(false); }}
                  className="w-full py-2.5 rounded-xl text-gray-700 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                  )}
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <button
                  onClick={() => { onAuthClick(); setIsMobileMenuOpen(false); }}
                  className="w-full py-2.5 rounded-xl text-gray-700 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { onAuthClick(); setIsMobileMenuOpen(false); }}
                  className="w-full py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors"
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
