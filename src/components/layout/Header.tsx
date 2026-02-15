import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import NotificationsDropdown from '../notifications/NotificationsDropdown';
import LogoPro from '../branding/LogoPro';
import ThemeToggle from '../ui/ThemeToggle';

interface HeaderProps {
  onSearchClick: () => void;
  onAuthClick: () => void;
  isAuthenticated: boolean;
  onNavigate: (page: string) => void;
  onListEquipment: () => void;
  onSignOut: () => void;
  currentPage: string;
}

export default function Header({
  onSearchClick,
  onAuthClick,
  isAuthenticated,
  onNavigate,
  onListEquipment,
  onSignOut,
  currentPage,
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.profile-menu') && !target.closest('.profile-button')) {
        setIsProfileMenuOpen(false);
      }
      if (!target.closest('.notifications-menu') && !target.closest('.notifications-button')) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const isHomePage = currentPage === 'home';
  const showTransparent = isHomePage && !isScrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showTransparent
          ? 'bg-gradient-to-b from-black/50 to-transparent'
          : 'bg-white shadow-lg'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-12">
            <button onClick={() => onNavigate('home')} className="flex items-center">
              <LogoPro 
                variant={showTransparent ? 'light' : 'default'} 
                size="md" 
                showText={true}
              />
            </button>

            <nav className="hidden lg:flex items-center gap-8">
              <button
                onClick={() => onNavigate('browse')}
                className={`text-sm font-medium transition-colors hover:text-teal-500 ${
                  showTransparent ? 'text-white/90' : 'text-gray-700'
                }`}
              >
                Browse Equipment
              </button>
              <button
                onClick={() => onNavigate('help')}
                className={`text-sm font-medium transition-colors hover:text-teal-500 ${
                  showTransparent ? 'text-white/90' : 'text-gray-700'
                }`}
              >
                Help
              </button>
              <button
                onClick={() => onNavigate('about')}
                className={`text-sm font-medium transition-colors hover:text-teal-500 ${
                  showTransparent ? 'text-white/90' : 'text-gray-700'
                }`}
              >
                About
              </button>
              <button
                onClick={() => {
                  onNavigate('home');
                  setTimeout(() => {
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className={`text-sm font-medium transition-colors hover:text-teal-500 ${
                  showTransparent ? 'text-white/90' : 'text-gray-700'
                }`}
              >
                How It Works
              </button>
              <button
                onClick={() => onNavigate('home')}
                className={`text-sm font-medium transition-colors hover:text-teal-500 ${
                  showTransparent ? 'text-white/90' : 'text-gray-700'
                }`}
              >
                For Business
              </button>
              <button
                onClick={() => onNavigate('home')}
                className={`text-sm font-medium transition-colors hover:text-teal-500 ${
                  showTransparent ? 'text-white/90' : 'text-gray-700'
                }`}
              >
                Support
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onSearchClick}
              className={`hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all ${
                showTransparent
                  ? 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="text-sm">Search equipment...</span>
              <kbd
                className={`hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs ${
                  showTransparent ? 'bg-white/20 text-white/70' : 'bg-gray-200 text-gray-500'
                }`}
              >
                /
              </kbd>
            </button>

            {isAuthenticated ? (
              <>
                <button
                  onClick={onListEquipment}
                  className={`hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all ${
                    showTransparent
                      ? 'bg-white text-gray-900 hover:bg-gray-100'
                      : 'bg-teal-500 text-white hover:bg-teal-600'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">List Equipment</span>
                </button>

                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className={`p-2.5 rounded-full transition-colors ${
                      showTransparent
                        ? 'text-white hover:bg-white/10'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className={`p-2.5 rounded-full transition-colors relative ${
                      showTransparent
                        ? 'text-white hover:bg-white/10'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  </button>
                  <div className="relative notifications-menu">
                    <button
                      onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                      className={`notifications-button p-2.5 rounded-full transition-colors relative ${
                        showTransparent
                          ? 'text-white hover:bg-white/10'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Bell className="w-5 h-5" />
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </button>
                    <NotificationsDropdown
                      isOpen={isNotificationsOpen}
                      onClose={() => setIsNotificationsOpen(false)}
                    />
                  </div>
                  <ThemeToggle variant="dropdown" />
                </div>

                <div className="relative profile-menu">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className={`profile-button flex items-center gap-2 p-1.5 rounded-full transition-colors ${
                      showTransparent ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isProfileMenuOpen ? 'rotate-180' : ''
                      } ${showTransparent ? 'text-white' : 'text-gray-600'}`}
                    />
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="font-semibold text-gray-900 dark:text-white">John Doe</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">john@example.com</p>
                      </div>
                      <div className="py-2">
                        <button
                          onClick={() => {
                            onNavigate('dashboard');
                            setIsProfileMenuOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full"
                        >
                          <LayoutDashboard className="w-5 h-5 text-gray-400" />
                          Dashboard
                        </button>
                        <button
                          onClick={() => {
                            onNavigate('dashboard');
                            setIsProfileMenuOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full"
                        >
                          <Package className="w-5 h-5 text-gray-400" />
                          My Listings
                        </button>
                        <button
                          onClick={() => {
                            onNavigate('dashboard');
                            setIsProfileMenuOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full"
                        >
                          <Heart className="w-5 h-5 text-gray-400" />
                          Favorites
                        </button>
                        <button
                          onClick={() => {
                            onNavigate('dashboard');
                            setIsProfileMenuOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full"
                        >
                          <Settings className="w-5 h-5 text-gray-400" />
                          Settings
                        </button>
                        <div className="border-t border-gray-100 my-2"></div>
                        <button
                          onClick={() => {
                            onNavigate('maintenance');
                            setIsProfileMenuOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors w-full"
                        >
                          <Wrench className="w-5 h-5 text-gray-400" />
                          Maintenance
                        </button>
                        <button
                          onClick={() => {
                            onNavigate('scheduler');
                            setIsProfileMenuOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors w-full"
                        >
                          <Calendar className="w-5 h-5 text-gray-400" />
                          Smart Scheduler
                        </button>
                        <button
                          onClick={() => {
                            onNavigate('referrals');
                            setIsProfileMenuOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors w-full"
                        >
                          <Users className="w-5 h-5 text-gray-400" />
                          Referrals
                        </button>
                      </div>
                      <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                        <button
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
                <button
                  onClick={onAuthClick}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${
                    showTransparent
                      ? 'text-white hover:bg-white/10'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={onAuthClick}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                    showTransparent
                      ? 'bg-white text-gray-900 hover:bg-gray-100'
                      : 'bg-teal-500 text-white hover:bg-teal-600'
                  }`}
                >
                  Get Started
                </button>
              </div>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2.5 rounded-full transition-colors ${
                showTransparent ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl">
          <div className="px-4 py-6 space-y-4">
            <button
              onClick={() => {
                onSearchClick();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-600"
            >
              <Search className="w-5 h-5" />
              <span>Search equipment...</span>
            </button>

            <nav className="space-y-1">
              <button
                onClick={() => {
                  onNavigate('browse');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-3 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Browse Equipment
              </button>
              <button
                onClick={() => {
                  onNavigate('home');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-3 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => {
                  onNavigate('home');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-3 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                For Business
              </button>
              <button
                onClick={() => {
                  onNavigate('home');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-3 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Support
              </button>
            </nav>

            {isAuthenticated ? (
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <button
                  onClick={() => {
                    onListEquipment();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-xl bg-teal-500 text-white font-medium hover:bg-teal-600 transition-colors"
                >
                  List Equipment
                </button>
                <button
                  onClick={() => {
                    onNavigate('dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-xl text-gray-700 font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Dashboard
                </button>
                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => {
                      onNavigate('maintenance');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-2 px-3 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Wrench className="w-4 h-4" />
                    Maintenance
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('scheduler');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-2 px-3 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Smart Scheduler
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('referrals');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-2 px-3 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Referrals
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <button
                  onClick={onAuthClick}
                  className="w-full py-3 rounded-xl text-gray-700 font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={onAuthClick}
                  className="w-full py-3 rounded-xl bg-teal-500 text-white font-medium hover:bg-teal-600 transition-colors"
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
