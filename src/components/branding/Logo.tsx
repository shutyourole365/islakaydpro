interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: 'light' | 'dark' | 'color';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Logo({
  className = '',
  showText = true,
  variant = 'color',
  size = 'md',
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
      secondary: '#e2e8f0',
      text: 'text-white',
    },
    dark: {
      primary: '#0f172a',
      secondary: '#334155',
      text: 'text-gray-900',
    },
    color: {
      primary: '#0d9488',
      secondary: '#10b981',
      text: 'text-gray-900',
    },
  };

  const currentSize = sizes[size];
  const currentVariant = variants[variant];

  return (
    <div className={`flex items-center ${currentSize.gap} ${className}`}>
      <div className={`${currentSize.icon} relative flex-shrink-0`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={currentVariant.primary} />
              <stop offset="100%" stopColor={currentVariant.secondary} />
            </linearGradient>
            <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
            </filter>
          </defs>

          <rect
            x="4"
            y="4"
            width="40"
            height="40"
            rx="12"
            fill="url(#logoGradient)"
            filter="url(#logoShadow)"
          />

          <path
            d="M16 32V20C16 17.7909 17.7909 16 20 16H28C30.2091 16 32 17.7909 32 20V32"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          <circle cx="24" cy="24" r="4" fill="white" />

          <path
            d="M20 32V28"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M28 32V28"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <path
            d="M14 32H34"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <circle cx="36" cy="12" r="4" fill="#fbbf24" />
          <path
            d="M34 12L36 10L38 12"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <span className={`font-bold tracking-tight ${currentSize.text} ${currentVariant.text}`}>
          Islakayd
        </span>
      )}
    </div>
  );
}
