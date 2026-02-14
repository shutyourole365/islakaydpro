import { useId } from 'react';

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
  const gradientId = useId();

  const sizes = {
    sm: { icon: 28, text: 'text-base', spacing: 'gap-2' },
    md: { icon: 36, text: 'text-xl', spacing: 'gap-2.5' },
    lg: { icon: 44, text: 'text-2xl', spacing: 'gap-3' },
    xl: { icon: 56, text: 'text-3xl', spacing: 'gap-3.5' },
  };

  const variants = {
    default: {
      primary: '#0D9488',
      secondary: '#14B8A6',
      accent: '#2DD4BF',
      text: '#111827',
    },
    light: {
      primary: '#FFFFFF',
      secondary: '#F0FDFA',
      accent: '#CCFBF1',
      text: '#FFFFFF',
    },
    dark: {
      primary: '#0D9488',
      secondary: '#14B8A6',
      accent: '#2DD4BF',
      text: '#F9FAFB',
    },
    monochrome: {
      primary: '#4B5563',
      secondary: '#6B7280',
      accent: '#9CA3AF',
      text: '#374151',
    },
  };

  const s = sizes[size];
  const v = variants[variant];

  return (
    <div className={`flex items-center ${s.spacing} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Islakayd logo"
        style={{ width: s.icon, height: s.icon }}
      >
        <defs>
          <linearGradient id={`${gradientId}-main`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={v.primary} />
            <stop offset="100%" stopColor={v.accent} />
          </linearGradient>
          <linearGradient id={`${gradientId}-shine`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.3" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {minimal ? (
          <>
            <rect x="20" y="20" width="60" height="60" rx="16" fill={`url(#${gradientId}-main)`} />
            <path
              d="M38 50 L46 58 L62 42"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        ) : (
          <>
            <rect x="8" y="8" width="84" height="84" rx="22" fill={`url(#${gradientId}-main)`} />
            <rect x="8" y="8" width="84" height="42" rx="22" fill={`url(#${gradientId}-shine)`} />
            <path
              d="M32 38 L50 28 L68 38"
              stroke="white"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.9"
            />
            <path
              d="M32 50 L50 40 L68 50"
              stroke="white"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.7"
            />
            <path
              d="M32 62 L50 52 L68 62"
              stroke="white"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.5"
            />
          </>
        )}
      </svg>

      {showText && (
        <span
          className={`font-bold tracking-tight leading-none ${s.text}`}
          style={{
            color: v.text,
            letterSpacing: '-0.03em',
          }}
        >
          Islakayd
        </span>
      )}
    </div>
  );
}
