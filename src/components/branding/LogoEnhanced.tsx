import { useState, useEffect } from 'react';

interface LogoEnhancedProps {
  className?: string;
  showText?: boolean;
  variant?: 'light' | 'dark' | 'color' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  animated?: boolean;
  interactive?: boolean;
  loading?: boolean;
  badge?: 'new' | 'pro' | 'beta' | null;
}

export default function LogoEnhanced({
  className = '',
  showText = true,
  variant = 'color',
  size = 'md',
  animated = true,
  interactive = true,
  loading = false,
  badge = null,
}: LogoEnhancedProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [, setPulseCount] = useState(0);

  // Periodic pulse animation for attention
  useEffect(() => {
    if (!animated) return;
    const interval = setInterval(() => {
      setPulseCount(p => p + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, [animated]);

  const sizes = {
    xs: { icon: 'w-6 h-6', text: 'text-sm', tagline: 'text-[8px]', gap: 'gap-1', badge: 'text-[8px] px-1' },
    sm: { icon: 'w-8 h-8', text: 'text-lg', tagline: 'text-[9px]', gap: 'gap-1.5', badge: 'text-[9px] px-1.5' },
    md: { icon: 'w-10 h-10', text: 'text-2xl', tagline: 'text-[10px]', gap: 'gap-2', badge: 'text-[10px] px-2' },
    lg: { icon: 'w-12 h-12', text: 'text-3xl', tagline: 'text-xs', gap: 'gap-2.5', badge: 'text-xs px-2' },
    xl: { icon: 'w-16 h-16', text: 'text-4xl', tagline: 'text-sm', gap: 'gap-3', badge: 'text-sm px-2.5' },
    '2xl': { icon: 'w-20 h-20', text: 'text-5xl', tagline: 'text-base', gap: 'gap-4', badge: 'text-base px-3' },
  };

  const variants = {
    light: {
      primary: '#ffffff',
      secondary: '#f1f5f9',
      accent: '#94a3b8',
      glow: 'rgba(255, 255, 255, 0.4)',
      text: 'text-white',
      highlight: 'text-white/90',
    },
    dark: {
      primary: '#0f172a',
      secondary: '#1e293b',
      accent: '#334155',
      glow: 'rgba(15, 23, 42, 0.3)',
      text: 'text-gray-900',
      highlight: 'text-gray-700',
    },
    color: {
      primary: '#0d9488',
      secondary: '#14b8a6',
      accent: '#2dd4bf',
      glow: 'rgba(13, 148, 136, 0.4)',
      text: 'text-gray-900',
      highlight: 'text-teal-600',
    },
    gradient: {
      primary: '#0d9488',
      secondary: '#059669',
      accent: '#10b981',
      glow: 'rgba(16, 185, 129, 0.5)',
      text: 'text-gray-900',
      highlight: 'text-emerald-600',
    },
  };

  const currentSize = sizes[size];
  const currentVariant = variants[variant];
  const uniqueId = `logo-enhanced-${Math.random().toString(36).substr(2, 9)}`;

  const badgeConfig = {
    new: { bg: 'bg-gradient-to-r from-amber-400 to-orange-500', text: 'NEW' },
    pro: { bg: 'bg-gradient-to-r from-purple-500 to-indigo-600', text: 'PRO' },
    beta: { bg: 'bg-gradient-to-r from-blue-500 to-cyan-500', text: 'BETA' },
  };

  return (
    <div
      className={`flex items-center ${currentSize.gap} ${className} group relative`}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
    >
      {/* Icon Container */}
      <div className={`${currentSize.icon} relative flex-shrink-0`}>
        {/* Loading Ring */}
        {loading && (
          <div className="absolute inset-0 rounded-xl">
            <svg className="w-full h-full animate-spin" viewBox="0 0 56 56">
              <circle
                cx="28"
                cy="28"
                r="26"
                fill="none"
                stroke={currentVariant.accent}
                strokeWidth="2"
                strokeDasharray="40 120"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}

        <svg
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`w-full h-full ${loading ? 'opacity-60' : ''}`}
        >
          <defs>
            {/* Enhanced Gradient */}
            <linearGradient id={`${uniqueId}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={currentVariant.primary}>
                {animated && (
                  <animate
                    attributeName="stop-color"
                    values={`${currentVariant.primary};${currentVariant.secondary};${currentVariant.primary}`}
                    dur="4s"
                    repeatCount="indefinite"
                  />
                )}
              </stop>
              <stop offset="100%" stopColor={currentVariant.secondary}>
                {animated && (
                  <animate
                    attributeName="stop-color"
                    values={`${currentVariant.secondary};${currentVariant.accent};${currentVariant.secondary}`}
                    dur="4s"
                    repeatCount="indefinite"
                  />
                )}
              </stop>
            </linearGradient>

            {/* Shine Effect */}
            <linearGradient id={`${uniqueId}-shine`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.4" />
              <stop offset="30%" stopColor="white" stopOpacity="0.1" />
              <stop offset="70%" stopColor="white" stopOpacity="0" />
            </linearGradient>

            {/* Glow Filter */}
            <filter id={`${uniqueId}-glow`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* 3D Shadow */}
            <filter id={`${uniqueId}-shadow`} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor={currentVariant.primary} floodOpacity="0.2" />
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor={currentVariant.primary} floodOpacity="0.15" />
            </filter>

            <clipPath id={`${uniqueId}-clip`}>
              <rect x="4" y="4" width="48" height="48" rx="14" />
            </clipPath>
          </defs>

          {/* Background with Glow */}
          <g filter={`url(#${uniqueId}-shadow)`}>
            <rect
              x="4"
              y="4"
              width="48"
              height="48"
              rx="14"
              fill={`url(#${uniqueId}-bg)`}
              className={`transition-all duration-500 ${isHovered ? 'scale-105' : ''}`}
              style={{ transformOrigin: '28px 28px' }}
            />
          </g>

          {/* Shine Overlay */}
          <rect
            x="4"
            y="4"
            width="48"
            height="48"
            rx="14"
            fill={`url(#${uniqueId}-shine)`}
            className={`transition-opacity duration-300 ${isHovered ? 'opacity-80' : 'opacity-50'}`}
          />

          {/* Main Icon Group */}
          <g clipPath={`url(#${uniqueId}-clip)`}>
            {/* Building/Warehouse Structure */}
            <g className={animated ? 'animate-logo-float' : ''}>
              <path
                d="M20 38V22C20 19.2386 22.2386 17 25 17H31C33.7614 17 36 19.2386 36 22V38"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />

              {/* Window with Glow Effect */}
              <g filter={isHovered ? `url(#${uniqueId}-glow)` : undefined}>
                <rect
                  x="25"
                  y="23"
                  width="6"
                  height="6"
                  rx="1"
                  fill="white"
                  fillOpacity={isHovered ? '1' : '0.9'}
                  className="transition-all duration-300"
                />
              </g>

              {/* Door Pillars */}
              <path d="M23 38V33" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M33 38V33" stroke="white" strokeWidth="2.5" strokeLinecap="round" />

              {/* Base Line */}
              <path d="M16 38H40" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </g>

            {/* Animated Upload Badge */}
            <g className={animated ? 'animate-logo-bounce' : ''}>
              <circle
                cx="40"
                cy="16"
                r="8"
                fill="#f59e0b"
                className={`transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}
                style={{ transformOrigin: '40px 16px' }}
              />
              <circle
                cx="40"
                cy="16"
                r="8"
                fill={`url(#${uniqueId}-shine)`}
              />

              {/* Animated Arrow */}
              <g className={animated ? 'animate-logo-arrow' : ''}>
                <path
                  d="M37 17L40 14L43 17"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M40 14V20"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </g>
            </g>
          </g>

          {/* Pulse Ring on Hover */}
          {isHovered && animated && (
            <rect
              x="2"
              y="2"
              width="52"
              height="52"
              rx="16"
              fill="none"
              stroke={currentVariant.accent}
              strokeWidth="1"
              className="animate-ping"
              style={{ opacity: 0.3 }}
            />
          )}
        </svg>

        {/* Badge */}
        {badge && (
          <div
            className={`absolute -top-1 -right-1 ${badgeConfig[badge].bg} text-white ${currentSize.badge} py-0.5 rounded-full font-bold shadow-lg`}
          >
            {badgeConfig[badge].text}
          </div>
        )}
      </div>

      {/* Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold tracking-tight ${currentSize.text} ${currentVariant.text}`}>
            <span
              className={`inline-block ${animated ? 'transition-transform duration-300' : ''} ${
                isHovered ? '-translate-y-0.5' : ''
              }`}
            >
              Isla
            </span>
            <span
              className={`${currentVariant.highlight} inline-block ${animated ? 'transition-transform duration-300 delay-75' : ''} ${
                isHovered ? '-translate-y-0.5' : ''
              }`}
            >
              kayd
            </span>
          </span>
          <span
            className={`tracking-widest uppercase ${currentSize.tagline} ${
              variant === 'light' ? 'text-gray-300' : 'text-gray-500'
            } transition-all duration-300 ${
              animated ? (isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1') : 'opacity-100'
            }`}
          >
            Equipment Rental
          </span>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes logo-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1px); }
        }
        @keyframes logo-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes logo-arrow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1.5px); }
        }
        .animate-logo-float { animation: logo-float 3s ease-in-out infinite; }
        .animate-logo-bounce { animation: logo-bounce 2s ease-in-out infinite; }
        .animate-logo-arrow { animation: logo-arrow 1.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
