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
    sm: { container: 'h-8', icon: 32, text: 'text-lg', spacing: 'gap-2' },
    md: { container: 'h-10', icon: 40, text: 'text-xl', spacing: 'gap-2.5' },
    lg: { container: 'h-12', icon: 48, text: 'text-2xl', spacing: 'gap-3' },
    xl: { container: 'h-16', icon: 64, text: 'text-3xl', spacing: 'gap-4' },
  };

  const variants = {
    default: {
      icon: '#14B8A6', // Teal-500
      text: '#0F172A', // Slate-900
    },
    light: {
      icon: '#FFFFFF',
      text: '#FFFFFF',
    },
    dark: {
      icon: '#0F172A',
      text: '#0F172A',
    },
    monochrome: {
      icon: '#64748B', // Slate-500
      text: '#475569', // Slate-600
    },
  };

  const currentSize = sizes[size];
  const currentVariant = variants[variant];

  return (
    <div className={`flex items-center ${currentSize.spacing} ${className}`}>
      {/* Minimalist Icon - Inspired by Airbnb's "Bélo" */}
      <div className="relative" style={{ width: currentSize.icon, height: currentSize.icon }}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {minimal ? (
            // Ultra-minimal circle variant (like Uber)
            <>
              <circle
                cx="50"
                cy="50"
                r="35"
                stroke={currentVariant.icon}
                strokeWidth="4"
                fill="none"
              />
              <path
                d="M 40,35 L 40,65 M 60,35 L 60,50 L 75,35 M 60,55 L 75,65"
                stroke={currentVariant.icon}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          ) : (
            // Professional geometric symbol
            <>
              {/* Outer frame - rounded square */}
              <rect
                x="10"
                y="10"
                width="80"
                height="80"
                rx="16"
                stroke={currentVariant.icon}
                strokeWidth="3.5"
                fill="none"
              />
              
              {/* Letter "I" - clean vertical line */}
              <line
                x1="35"
                y1="30"
                x2="35"
                y2="70"
                stroke={currentVariant.icon}
                strokeWidth="5"
                strokeLinecap="round"
              />
              
              {/* Letter "K" - modern angular design */}
              <line
                x1="55"
                y1="30"
                x2="55"
                y2="70"
                stroke={currentVariant.icon}
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M 55,45 L 72,30"
                stroke={currentVariant.icon}
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M 55,55 L 72,70"
                stroke={currentVariant.icon}
                strokeWidth="5"
                strokeLinecap="round"
              />
              
              {/* Accent dot (brand mark) */}
              <circle
                cx="78"
                cy="28"
                r="3.5"
                fill={currentVariant.icon}
              />
            </>
          )}
        </svg>
      </div>

      {/* Wordmark - Clean, professional typography */}
      {showText && (
        <span
          className={`font-semibold tracking-tight leading-none ${currentSize.text}`}
          style={{ color: currentVariant.text }}
        >
          Islakayd
        </span>
      )}
    </div>
  );
}
