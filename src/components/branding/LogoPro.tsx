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
      icon: '#0F766E', // Deeper teal - more professional
      text: '#111827', // Gray-900 - strong contrast
    },
    light: {
      icon: '#FFFFFF',
      text: '#FFFFFF',
    },
    dark: {
      icon: '#111827',
      text: '#111827',
    },
    monochrome: {
      icon: '#374151', // Gray-700 - corporate gray
      text: '#1F2937', // Gray-800
    },
  };

  const currentSize = sizes[size];
  const currentVariant = variants[variant];

  return (
    <div className={`flex items-center ${currentSize.spacing} ${className}`}>
      {/* Clean, Corporate Mark - Industrial Sophistication */}
      <div className="relative" style={{ width: currentSize.icon, height: currentSize.icon }}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {minimal ? (
            // Minimal square variant - bold and confident
            <>
              <rect
                x="15"
                y="15"
                width="70"
                height="70"
                rx="8"
                stroke={currentVariant.icon}
                strokeWidth="5"
                fill="none"
              />
              <rect
                x="35"
                y="35"
                width="30"
                height="30"
                rx="3"
                fill={currentVariant.icon}
              />
            </>
          ) : (
            // Professional industrial mark - represents equipment/machinery
            <>
              {/* Bold geometric structure */}
              <rect
                x="20"
                y="25"
                width="28"
                height="50"
                rx="3"
                fill={currentVariant.icon}
              />
              
              {/* Secondary element - creates depth */}
              <rect
                x="52"
                y="35"
                width="28"
                height="30"
                rx="3"
                fill={currentVariant.icon}
                opacity="0.7"
              />
              
              {/* Connecting bar - professional detail */}
              <rect
                x="32"
                y="45"
                width="28"
                height="8"
                rx="2"
                fill={currentVariant.icon}
              />
              
              {/* Subtle accent line for sophistication */}
              <line
                x1="28"
                y1="32"
                x2="28"
                y2="68"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.3"
              />
              
              {/* Subtle accent mark - premium detail */}
              <circle
                cx="74"
                cy="40"
                r="2.5"
                fill={currentVariant.icon}
                opacity="0.5"
              />
            </>
          )}
        </svg>
      </div>

      {/* Professional Wordmark - Corporate Typography */}
      {showText && (
        <span
          className={`font-bold tracking-tight leading-none ${currentSize.text}`}
          style={{ 
            color: currentVariant.text,
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            letterSpacing: '-0.03em'
          }}
        >
          Islakayd
        </span>
      )}
    </div>
  );
}
