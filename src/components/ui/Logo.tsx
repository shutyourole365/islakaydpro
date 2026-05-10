import { useId } from 'react';

interface LogoProps {
  variant?: 'full' | 'icon' | 'wordmark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  inverse?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { icon: 'w-7 h-7', text: 'text-lg', gap: 'gap-2' },
  md: { icon: 'w-9 h-9', text: 'text-xl', gap: 'gap-2.5' },
  lg: { icon: 'w-11 h-11', text: 'text-2xl', gap: 'gap-3' },
  xl: { icon: 'w-14 h-14', text: 'text-3xl', gap: 'gap-3.5' },
};

function LogoMark({ className = '' }: { className?: string }) {
  const uid = useId().replace(/:/g, '');
  const gradId = `ik-grad-${uid}`;
  const accentId = `ik-accent-${uid}`;
  return (
    <svg
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="120%" y2="120%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>
        <linearGradient id={accentId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Modern rounded background */}
      <rect width="48" height="48" rx="11" fill={`url(#${gradId})`} />

      {/* Island silhouette - modern, geometric */}
      <g fill="white">
        {/* Main island shape - smooth organic curves */}
        <path d="M 12 28 Q 10 24 12 20 Q 14 16 18 16 Q 22 15 24 14 Q 26 15 28 16 Q 32 16 34 20 Q 36 24 34 28 Q 32 32 28 33 Q 24 34 20 34 Q 16 32 14 30 Z" />
        {/* Water reflection accent */}
        <ellipse cx="24" cy="35.5" rx="14" ry="2.5" fill="white" opacity="0.25" />
      </g>

      {/* Accent highlight */}
      <ellipse cx="22" cy="22" rx="6" ry="5" fill={`url(#${accentId})`} />
    </svg>
  );
}

function Wordmark({
  className = '',
  inverse = false,
}: {
  className?: string;
  inverse?: boolean;
}) {
  return (
    <span
      className={`font-display font-bold tracking-tight leading-none ${className}`}
    >
      <span
        className={
          inverse
            ? 'text-white'
            : 'bg-gradient-to-r from-cyan-600 via-cyan-500 to-teal-600 bg-clip-text text-transparent dark:from-cyan-300 dark:via-cyan-200 dark:to-teal-300'
        }
      >
        Isla
      </span>
      <span className={inverse ? 'text-white' : 'text-slate-900 dark:text-slate-50'}>
        Kayd
      </span>
    </span>
  );
}

export default function Logo({
  variant = 'full',
  size = 'md',
  inverse = false,
  className = '',
}: LogoProps) {
  const s = sizeMap[size];

  if (variant === 'icon') {
    return <LogoMark className={`${s.icon} ${className}`} />;
  }

  if (variant === 'wordmark') {
    return <Wordmark className={`${s.text} ${className}`} inverse={inverse} />;
  }

  return (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      <LogoMark className={`${s.icon} drop-shadow-sm`} />
      <Wordmark className={s.text} inverse={inverse} />
    </span>
  );
}
