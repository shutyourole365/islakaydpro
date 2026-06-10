import { useState, useEffect } from 'react';
import {
  Search,
  Menu,
  X,
  User,
  Heart,
  MessageSquare,
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
import RealTimeNotifications from '../notifications/RealTimeNotifications';
import ThemeToggle from '../ui/ThemeToggle';
import Logo from '../ui/Logo';
import { useAuth } from '../../contexts/AuthContext';

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
  const { user, profile } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCompanyMenuOpen, setIsCompanyMenuOpen] = useState(false);
  const [isSupportMenuOpen, setIsSupportMenuOpen] = useState(false);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Account';
  const displayEmail = user?.email || '';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

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
      if (!target.closest('.company-menu') && !target.closest('.company-button')) {
        setIsCompanyMenuOpen(false);
      }
      if (!target.closest('.support-menu') && !target.closest('.support-button')) {
        setIsSupportMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const isHomePage = currentPage === 'home';
  const showTransparent = isHomePage && !isScrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 backdrop-blur-2xl ${
        showTransparent
          ? 'bg-gradient-to-b from-black/30 via-black/10 to-transparent border-b border-white/5 shadow-none'
          : 'bg-white/90 dark:bg-gray-950/90 backdrop-blur-3xl border-b border-gray-200/40 dark:border-gray-700/40 shadow-2xl dark:shadow-2xl'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-12">
            <button onClick={() => onNavigate('home')} aria-label="Go to home page" className="flex items-center">
              <Logo
                size="md"
                inverse={showTransparent}
              />
            </button>

            <nav className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => onNavigate('browse')}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 relative group ${
                  showTransparent ? 'text-white/90 hover:text-white hover:bg-white/20' : 'text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gradient-to-r hover:from-teal-50/80 hover:to-cyan-50/80 dark:hover:bg-teal-900/20 hover:scale-[1.02]'
                }`}
              >
                Browse Equipment
                <span className="absolute bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 rounded-full group-hover:w-full transition-all duration-300 opacity-0 group-hover:opacity-100"></span>
              </button>
              <button
                onClick={() => onNavigate('requests')}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 relative group ${
                  currentPage === 'requests'
                    ? (showTransparent ? 'text-white bg-white/20' : 'text-teal-600 dark:text-teal-400 bg-gradient-to-r from-teal-100/60 to-cyan-100/60 dark:from-teal-900/40 dark:to-cyan-900/40')
                    : (showTransparent ? 'text-white/90 hover:text-white hover:bg-white/20' : 'text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gradient-to-r hover:from-teal-50/80 hover:to-cyan-50/80 dark:hover:bg-teal-900/20 hover:scale-[1.02]')
                }`}
              >
                Wanted
                <span className={`absolute bottom-1 left-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 rounded-full transition-all duration-300 ${currentPage === 'requests' ? 'w-full opacity-100' : 'w-0 group-hover:w-full opacity-0 group-hover:opacity-100'}`}></span>
              </button>
              <button
                onClick={() => onNavigate('help')}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 relative group ${
                  showTransparent ? 'text-white/90 hover:text-white hover:bg-white/20' : 'text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gradient-to-r hover:from-teal-50/80 hover:to-cyan-50/80 dark:hover:bg-teal-900/20 hover:scale-[1.02]'
                }`}
              >
                Help
                <span className="absolute bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 rounded-full group-hover:w-full transition-all duration-300 opacity-0 group-hover:opacity-100"></span>
              </button>
              <button
                onClick={() => onNavigate('about')}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 relative group ${
                  showTransparent ? 'text-white/90 hover:text-white hover:bg-white/20' : 'text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gradient-to-r hover:from-teal-50/80 hover:to-cyan-50/80 dark:hover:bg-teal-900/20 hover:scale-[1.02]'
                }`}
              >
                About
                <span className="absolute bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 rounded-full group-hover:w-full transition-all duration-300 opacity-0 group-hover:opacity-100"></span>
              </button>
              <button
                onClick={() => {
                  onNavigate('home');
                  setTimeout(() => {
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 relative group ${
                  showTransparent ? 'text-white/90 hover:text-white hover:bg-white/20' : 'text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gradient-to-r hover:from-teal-50/80 hover:to-cyan-50/80 dark:hover:bg-teal-900/20 hover:scale-[1.02]'
                }`}
              >
                How It Works
                <span className="absolute bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 rounded-full group-hover:w-full transition-all duration-300 opacity-0 group-hover:opacity-100"></span>
              </button>
              
              {/* Company Dropdown */}
              <div className="relative company-menu">
                <button
                  onClick={() => setIsCompanyMenuOpen(!isCompanyMenuOpen)}
                  className={`company-button flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 relative group ${
                    showTransparent ? 'text-white/90 hover:text-white hover:bg-white/20' : 'text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gradient-to-r hover:from-teal-50/80 hover:to-cyan-50/80 dark:hover:bg-teal-900/20 hover:scale-[1.02]'
                  }`}
                >
                  Company
                  <ChevronDown className={`w-4 h-4 transition-all duration-300 ${isCompanyMenuOpen ? 'rotate-180 text-teal-600 dark:text-teal-400' : ''}`} />
                  <span className="absolute bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 rounded-full group-hover:w-full transition-all duration-300 opacity-0 group-hover:opacity-100"></span>
                </button>
                {isCompanyMenuOpen && (
                  <div className="absolute top-full left-0 mt-3 w-56 bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl rounded-xl shadow-2xl border border-gray-200/40 dark:border-gray-700/50 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <button
                      onClick={() => {
                        onNavigate('about');
                        setIsCompanyMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-all duration-200"
                    >
                      About Us
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('careers');
                        setIsCompanyMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-all duration-200"
                    >
                      Careers
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('press');
                        setIsCompanyMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-all duration-200"
                    >
                      Press
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('blog');
                        setIsCompanyMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-all duration-200"
                    >
                      Blog
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('partnerships');
                        setIsCompanyMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-all duration-200"
                    >
                      Partnerships
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('investors');
                        setIsCompanyMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-all duration-200"
                    >
                      Investors
                    </button>
                  </div>
                )}
              </div>

              {/* Support Dropdown */}
              <div className="relative support-menu">
                <button
                  onClick={() => setIsSupportMenuOpen(!isSupportMenuOpen)}
                  className={`support-button flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 relative group ${
                    showTransparent ? 'text-white/90 hover:text-white hover:bg-white/20' : 'text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gradient-to-r hover:from-teal-50/80 hover:to-cyan-50/80 dark:hover:bg-teal-900/20 hover:scale-[1.02]'
                  }`}
                >
                  Support
                  <ChevronDown className={`w-4 h-4 transition-all duration-300 ${isSupportMenuOpen ? 'rotate-180 text-teal-600 dark:text-teal-400' : ''}`} />
                  <span className="absolute bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 rounded-full group-hover:w-full transition-all duration-300 opacity-0 group-hover:opacity-100"></span>
                </button>
                {isSupportMenuOpen && (
                  <div className="absolute top-full left-0 mt-3 w-56 bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl rounded-xl shadow-2xl border border-gray-200/40 dark:border-gray-700/50 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <button
                      onClick={() => {
                        onNavigate('help');
                        setIsSupportMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-all duration-200"
                    >
                      Help Center
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('safety');
                        setIsSupportMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-all duration-200"
                    >
                      Safety
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('trust');
                        setIsSupportMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-all duration-200"
                    >
                      Trust & Verification
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('contact');
                        setIsSupportMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-all duration-200"
                    >
                      Contact Us
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onSearchClick}
              className={`hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-300 hover:scale-[1.02] ${
                showTransparent
                  ? 'border-white/40 bg-white/15 text-white hover:bg-white/25 backdrop-blur-md'
                  : 'border-gray-300/60 dark:border-gray-600/60 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-600 dark:text-gray-300 hover:border-teal-300 dark:hover:border-teal-600/60 hover:bg-gradient-to-r hover:from-teal-50/60 hover:to-cyan-50/60 dark:hover:bg-teal-900/20'
              }`}

            >
              <Search className="w-4 h-4" />
              <span className="text-sm">Search equipment...</span>
              <kbd
                className={`hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs ${
                  showTransparent ? 'bg-white/20 text-white/70' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                /
              </kbd>
            </button>

            {isAuthenticated ? (
              <>
                <button
                  onClick={onListEquipment}
                  className={`hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 shadow-lg ${
                    showTransparent
                      ? 'bg-white text-gray-900 hover:bg-teal-50 shadow-xl'
                      : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-2xl hover:shadow-teal-500/40'
                  }`}

                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">List Equipment</span>
                </button>

                <div className="hidden sm:flex items-center gap-2">
                  <button                    aria-label="Favorites"                    onClick={() => onNavigate('dashboard')}
                    className={`p-2.5 rounded-full transition-all duration-300 hover:scale-110 ${
                      showTransparent
                        ? 'text-white hover:bg-white/20'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-teal-100/50 dark:hover:bg-teal-900/30 hover:text-teal-600 dark:hover:text-teal-400'
                    }`}
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                  <button                    aria-label="Messages"                    onClick={() => onNavigate('messaging')}
                    className={`p-2.5 rounded-full transition-all duration-300 hover:scale-110 relative ${
                      showTransparent
                        ? 'text-white hover:bg-white/20'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-teal-100/50 dark:hover:bg-teal-900/30 hover:text-teal-600 dark:hover:text-teal-400'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  </button>
                  <RealTimeNotifications className="notifications-menu" />
                  <ThemeToggle variant="dropdown" />
                </div>

                <div className="relative profile-menu">
                  <button                    aria-label="Open profile menu"                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className={`profile-button flex items-center gap-2 p-1.5 rounded-full transition-all duration-300 hover:scale-105 ${
                      showTransparent ? 'hover:bg-white/20' : 'hover:bg-teal-100/50 dark:hover:bg-teal-900/30'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center overflow-hidden">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                      ) : initials ? (
                        <span className="text-sm font-semibold text-white">{initials}</span>
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isProfileMenuOpen ? 'rotate-180' : ''
                      } ${showTransparent ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}
                    />
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-2xl border border-gray-200/40 dark:border-gray-700/50 py-2 overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">{displayName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{displayEmail}</p>
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
                        <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>
                        <button
                         
                          onClick={() => {
                            onNavigate('maintenance');
                            setIsProfileMenuOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full"
                        >
                          <Wrench className="w-5 h-5 text-gray-400" />
                          Maintenance
                        </button>
                        <button
                         
                          onClick={() => {
                            onNavigate('scheduler');
                            setIsProfileMenuOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full"
                        >
                          <Calendar className="w-5 h-5 text-gray-400" />
                          Smart Scheduler
                        </button>
                        <button
                         
                          onClick={() => {
                            onNavigate('referrals');
                            setIsProfileMenuOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full"
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
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
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

            <button              aria-label="Toggle mobile menu"              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2.5 rounded-full transition-colors ${
                showTransparent ? 'text-white hover:bg-white/10' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-xl">
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

            <nav className="space-y-1">
              <button
               
                onClick={() => {
                  onNavigate('browse');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Browse Equipment
              </button>
              <button
               
                onClick={() => {
                  onNavigate('home');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                How It Works
              </button>
              <button
               
                onClick={() => {
                  onNavigate('home');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                For Business
              </button>
              <button
               
                onClick={() => {
                  onNavigate('home');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Support
              </button>
            </nav>

            {isAuthenticated ? (
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
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
                  className="w-full py-3 rounded-xl text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Dashboard
                </button>
                <div className="pt-2 space-y-2">
                  <button
                   
                    onClick={() => {
                      onNavigate('maintenance');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-2 px-3 rounded-lg text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    <Wrench className="w-4 h-4" />
                    Maintenance
                  </button>
                  <button
                   
                    onClick={() => {
                      onNavigate('scheduler');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-2 px-3 rounded-lg text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Smart Scheduler
                  </button>
                  <button
                   
                    onClick={() => {
                      onNavigate('referrals');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-2 px-3 rounded-lg text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Referrals
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                <button
                  onClick={onAuthClick}
                  className="w-full py-3 rounded-xl text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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

