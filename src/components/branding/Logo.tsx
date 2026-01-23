interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: 'light' | 'dark' | 'color';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

export default function Logo({
  className = '',
  showText = true,
  variant = 'color',
  size = 'md',
  animated = true,
}: LogoProps) {
  const sizes = {
    sm: { icon: 'w-8 h-8', text: 'text-lg', gap: 'gap-1.5' },
    md: { icon: 'w-10 h-10', text: 'text-2xl', gap: 'gap-2' },
    lg: { icon: 'w-12 h-12', text: 'text-3xl', gap: 'gap-2.5' },
    xl: { icon: 'w-16 h-16', text: 'text-4xl', gap: 'gap-3' },
  };

  const variants = {
    light: {
      primary: '#ffffff',
      secondary: '#f1f5f9',
      accent: '#94a3b8',
      text: 'text-white',
    },
    dark: {
      primary: '#0f172a',
      secondary: '#1e293b',
      accent: '#334155',
      text: 'text-gray-900',
    },
    color: {
      primary: '#0d9488',
      secondary: '#14b8a6',
      accent: '#2dd4bf',
      text: 'text-gray-900',
    },
  };

  const currentSize = sizes[size];
  const currentVariant = variants[variant];

  const uniqueId = `logo-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex items-center ${currentSize.gap} ${className} group`}>
      <div className={`${currentSize.icon} relative flex-shrink-0`}>
        <svg
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id={`${uniqueId}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={currentVariant.primary} />
              <stop offset="100%" stopColor={currentVariant.secondary} />
            </linearGradient>
            <linearGradient id={`${uniqueId}-shine`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.3" />
              <stop offset="50%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <filter id={`${uniqueId}-shadow`} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor={currentVariant.primary} floodOpacity="0.3" />
            </filter>
            <clipPath id={`${uniqueId}-clip`}>
              <rect x="4" y="4" width="48" height="48" rx="14" />
            </clipPath>
          </defs>

          <g filter={`url(#${uniqueId}-shadow)`}>
            <rect
              x="4"
              y="4"
              width="48"
              height="48"
              rx="14"
              fill={`url(#${uniqueId}-bg)`}
              className={animated ? 'transition-all duration-300 group-hover:scale-105 origin-center' : ''}
              style={{ transformOrigin: '28px 28px' }}
            />
          </g>

          <rect
            x="4"
            y="4"
            width="48"
            height="48"
            rx="14"
            fill={`url(#${uniqueId}-shine)`}
          />

          <g clipPath={`url(#${uniqueId}-clip)`}>
            <g className={animated ? 'animate-float' : ''}>
              <path
                d="M20 38V22C20 19.2386 22.2386 17 25 17H31C33.7614 17 36 19.2386 36 22V38"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                className={animated ? 'transition-all duration-300' : ''}
              />

              <rect
                x="25"
                y="23"
                width="6"
                height="6"
                rx="1"
                fill="white"
                fillOpacity="0.9"
                className={animated ? 'animate-pulse-slow' : ''}
              />

              <path
                d="M23 38V33"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M33 38V33"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              <path
                d="M16 38H40"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>

            <g className={animated ? 'animate-bounce-subtle' : ''}>
              <circle
                cx="40"
                cy="16"
                r="8"
                fill="#f59e0b"
                className={animated ? 'transition-transform duration-300 group-hover:scale-110' : ''}
                style={{ transformOrigin: '40px 16px' }}
              />
              <circle
                cx="40"
                cy="16"
                r="8"
                fill="url(#${uniqueId}-shine)"
              />

              <g className={animated ? 'animate-arrow' : ''}>
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

          <style>
            {`
              @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-1px); }
              }
              @keyframes pulse-slow {
                0%, 100% { opacity: 0.9; }
                50% { opacity: 0.6; }
              }
              @keyframes bounce-subtle {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-2px); }
              }
              @keyframes arrow-move {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-1px); }
              }
              .animate-float { animation: float 3s ease-in-out infinite; }
              .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
              .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
              .animate-arrow { animation: arrow-move 1.5s ease-in-out infinite; }
            `}
          </style>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-bold tracking-tight ${currentSize.text} ${currentVariant.text} ${
              animated ? 'transition-all duration-300 group-hover:tracking-normal' : ''
            }`}
          >
            <span className={animated ? 'inline-block transition-transform duration-300 group-hover:-translate-y-0.5' : ''}>
              Isla
            </span>
            <span
              className={`${
                variant === 'color' ? 'text-teal-500' : ''
              } ${animated ? 'inline-block transition-transform duration-300 group-hover:-translate-y-0.5 delay-75' : ''}`}
            >
              kayd
            </span>
          </span>
          <span
            className={`text-xs tracking-widest uppercase ${
              variant === 'light' ? 'text-gray-300' : 'text-gray-500'
            } ${animated ? 'opacity-0 -translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0' : 'opacity-100'}`}
          >
            Equipment Rental
          </span>
        </div>
      )}
    </div>
  );
}
