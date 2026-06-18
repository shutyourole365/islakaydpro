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
    sm: { icon: 32, text: 'text-lg', spacing: 'gap-2.5' },
    md: { icon: 40, text: 'text-xl', spacing: 'gap-3' },
    lg: { icon: 48, text: 'text-2xl', spacing: 'gap-3.5' },
    xl: { icon: 64, text: 'text-3xl', spacing: 'gap-4' },
  };

  const variants = {
    default: {
      gradient1: '#14B8A6', // teal-500
      gradient2: '#0891B2', // cyan-600
      mark: '#FFFFFF',
      textClass: 'text-gray-900 dark:text-white',
      accentClass: 'text-teal-500',
    },
    light: {
      gradient1: '#2DD4BF', // teal-400
      gradient2: '#22D3EE', // cyan-400
      mark: '#FFFFFF',
      textClass: 'text-white',
      accentClass: 'text-teal-300',
    },
    dark: {
      gradient1: '#14B8A6',
      gradient2: '#0891B2',
      mark: '#FFFFFF',
      textClass: 'text-gray-900',
      accentClass: 'text-teal-600',
    },
    monochrome: {
      gradient1: '#71717A', // zinc-500
      gradient2: '#52525B', // zinc-600
      mark: '#FFFFFF',
      textClass: 'text-zinc-600',
      accentClass: 'text-zinc-500',
    },
  };

  const currentSize = sizes[size];
  const v = variants[variant];

  return (
    <div className={`flex items-center ${currentSize.spacing} ${className}`}>
      {/* Badge mark: gradient tile with a geometric "K" cut by an upward motion arm */}
      <svg
        width={currentSize.icon}
        height={currentSize.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role={showText ? undefined : 'img'}
        aria-label={showText ? undefined : 'Islakayd logo'}
        aria-hidden={showText ? true : undefined}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={v.gradient1} />
            <stop offset="100%" stopColor={v.gradient2} />
          </linearGradient>
        </defs>

        <rect x="2" y="2" width="44" height="44" rx="13" fill={`url(#${gradientId})`} />

        {minimal ? (
          <circle cx="24" cy="24" r="9" stroke={v.mark} strokeWidth="4.5" fill="none" />
        ) : (
          <>
            {/* Vertical stem of the K */}
            <rect x="13.5" y="12" width="5.5" height="24" rx="2.75" fill={v.mark} />
            {/* Diagonal arms of the K */}
            <path
              d="M31.5 13.5 L22 24 L31.5 34.5"
              stroke={v.mark}
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Orbit dot — the "shared between people" accent */}
            <circle cx="35.5" cy="24" r="2.6" fill={v.mark} opacity="0.85" />
          </>
        )}
      </svg>

      {showText && (
        <span
          className={`font-bold tracking-tight leading-none ${currentSize.text} ${v.textClass}`}
          style={{ letterSpacing: '-0.03em' }}
        >
          Isla<span className={v.accentClass}>kayd</span>
        </span>
      )}
    </div>
  );
}
