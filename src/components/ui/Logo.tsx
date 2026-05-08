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
  const shineId = `ik-shine-${uid}`;
  return (
    <svg
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="60%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id={shineId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Rounded squircle base */}
      <rect width="48" height="48" rx="13" fill={`url(#${gradId})`} />
      {/* Gloss highlight */}
      <rect width="48" height="24" rx="13" fill={`url(#${shineId})`} />

      {/* Stylised "IK" monogram with key/spark accent */}
      <g fill="white">
        {/* I bar */}
        <rect x="11" y="12" width="4" height="24" rx="1.5" />
        {/* K stem */}
        <rect x="22" y="12" width="4" height="24" rx="1.5" />
        {/* K upper diagonal */}
        <path d="M26 22 L34 12 L37.5 12 L29 22.5 Z" />
        {/* K lower diagonal */}
        <path d="M26 25 L37.5 36 L34 36 L26 28.5 Z" />
      </g>

      {/* Spark accent dot */}
      <circle cx="38.5" cy="11.5" r="2.2" fill="#fde68a" />
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
            : 'bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent dark:from-teal-300 dark:via-teal-200 dark:to-emerald-300'
        }
      >
        Isla
      </span>
      <span className={inverse ? 'text-white/90' : 'text-gray-900 dark:text-white'}>
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
