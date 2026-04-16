interface LogoProProps {
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'light' | 'dark' | 'monochrome';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  minimal?: boolean;
}

export default function LogoPro({
  className = '',
  showText = true,
  variant = 'default',
  size = 'md',
  minimal = false,
}: LogoProProps) {
  
  const sizes = {
    sm: { container: 'h-8', icon: 32, text: 'text-lg', spacing: 'gap-2.5' },
    md: { container: 'h-10', icon: 40, text: 'text-xl', spacing: 'gap-3' },
    lg: { container: 'h-12', icon: 48, text: 'text-2xl', spacing: 'gap-3.5' },
    xl: { container: 'h-16', icon: 64, text: 'text-3xl', spacing: 'gap-4' },
  };

  const variants = {
    default: {
      icon: '#18181B', // Zinc-900 - modern tech feel
      text: '#18181B',
      gradient1: '#14B8A6', // Teal-500
      gradient2: '#06B6D4', // Cyan-500
    },
    light: {
      icon: '#FFFFFF',
      text: '#FFFFFF',
      gradient1: '#FFFFFF',
      gradient2: '#FFFFFF',
    },
    dark: {
      icon: '#18181B',
      text: '#18181B',
      gradient1: '#14B8A6',
      gradient2: '#06B6D4',
    },
    monochrome: {
      icon: '#52525B', // Zinc-600
      text: '#3F3F46',
      gradient1: '#71717A',
      gradient2: '#52525B',
    },
  };

  const currentSize = sizes[size];
  const currentVariant = variants[variant];

  return (
    <div className={`flex items-center ${currentSize.spacing} ${className}`}>
      {/* Abstract Tech Mark - Stripe/Notion Style */}
      <div className="relative" style={{ width: currentSize.icon, height: currentSize.icon }}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={currentVariant.gradient1} />
              <stop offset="100%" stopColor={currentVariant.gradient2} />
            </linearGradient>
          </defs>
          
          {minimal ? (
            // Ultra-minimal abstract shape
            <>
              <path
                d="M 30,50 Q 30,30 50,30 Q 70,30 70,50 Q 70,70 50,70 Q 30,70 30,50"
                stroke="url(#logoGradient)"
                strokeWidth="4"
                fill="none"
              />
              <circle cx="50" cy="50" r="8" fill="url(#logoGradient)" />
            </>
          ) : (
            // Sleek abstract symbol - modern tech aesthetic
            <>
              {/* Main abstract shape - flowing curves */}
              <path
                d="M 25,35 L 50,20 L 75,35 L 75,65 L 50,80 L 25,65 Z"
                fill="url(#logoGradient)"
                opacity="0.15"
              />
              
              {/* Bold primary element */}
              <path
                d="M 30,40 L 50,28 L 70,40 L 70,50 L 50,62 L 30,50 Z"
                fill={currentVariant.icon}
              />
              
              {/* Accent line - creates depth */}
              <path
                d="M 40,44 L 50,38 L 60,44"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.4"
              />
              
              {/* Bottom geometric accent */}
              <path
                d="M 35,55 L 50,63 L 65,55 L 65,68 L 50,76 L 35,68 Z"
                fill={currentVariant.icon}
                opacity="0.6"
              />
            </>
          )}
        </svg>
      </div>

      {/* Modern Wordmark - Tech Company Style */}
      {showText && (
        <span
          className={`font-semibold tracking-tight leading-none ${currentSize.text}`}
          style={{ 
            color: currentVariant.text,
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            letterSpacing: '-0.025em',
            fontWeight: 600
          }}
        >
          Islakayd
        </span>
      )}
    </div>
  );
}
