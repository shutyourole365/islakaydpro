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
  const uid = useId();
  const gradientId = `lg-${uid}`;
  const sheenId = `sh-${uid}`;
  const glowId = `gl-${uid}`;

  const sizes = {
    sm: { icon: 32, text: 'text-lg', spacing: 'gap-2.5' },
    md: { icon: 40, text: 'text-xl', spacing: 'gap-3' },
    lg: { icon: 48, text: 'text-2xl', spacing: 'gap-3.5' },
    xl: { icon: 64, text: 'text-3xl', spacing: 'gap-4' },
  };

  // Each variant carries a 3-stop gradient for a richer, more dimensional tile.
  const variants = {
    default: {
      g1: '#2DD4BF', g2: '#10B981', g3: '#0891B2', // teal-400 → emerald-500 → cyan-600
      mark: '#FFFFFF',
      textClass: 'text-gray-900 dark:text-white',
    },
    light: {
      g1: '#5EEAD4', g2: '#34D399', g3: '#22D3EE',
      mark: '#FFFFFF',
      textClass: 'text-white',
    },
    dark: {
      g1: '#2DD4BF', g2: '#10B981', g3: '#0891B2',
      mark: '#FFFFFF',
      textClass: 'text-gray-900',
    },
    monochrome: {
      g1: '#A1A1AA', g2: '#71717A', g3: '#52525B',
      mark: '#FFFFFF',
      textClass: 'text-zinc-600',
    },
  };

  const currentSize = sizes[size];
  const v = variants[variant];

  return (
    <div className={`group flex items-center ${currentSize.spacing} ${className}`}>
      {/* Badge mark: a glassy gradient tile with a refined "K" monogram */}
      <svg
        width={currentSize.icon}
        height={currentSize.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role={showText ? undefined : 'img'}
        aria-label={showText ? undefined : 'Islakayd logo'}
        aria-hidden={showText ? true : undefined}
        className="transition-transform duration-300 ease-out group-hover:scale-105 group-hover:-rotate-3"
        style={{ filter: 'drop-shadow(0 4px 10px rgba(13,148,136,0.35))' }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={v.g1} />
            <stop offset="52%" stopColor={v.g2} />
            <stop offset="100%" stopColor={v.g3} />
          </linearGradient>
          {/* Top-left glassy sheen */}
          <linearGradient id={sheenId} x1="0%" y1="0%" x2="60%" y2="80%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          {/* Soft radial glow behind the mark */}
          <radialGradient id={glowId} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Base gradient tile */}
        <rect x="2" y="2" width="44" height="44" rx="14" fill={`url(#${gradientId})`} />
        {/* Inner radial glow for depth */}
        <rect x="2" y="2" width="44" height="44" rx="14" fill={`url(#${glowId})`} />
        {/* Glassy sheen sweep */}
        <path d="M2 16 Q2 2 16 2 L40 2 Q24 10 16 26 Q8 40 2 30 Z" fill={`url(#${sheenId})`} />
        {/* Crisp inner highlight border */}
        <rect x="2.75" y="2.75" width="42.5" height="42.5" rx="13.25" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1.5" />

        {minimal ? (
          <circle cx="24" cy="24" r="9" stroke={v.mark} strokeWidth="4.5" fill="none" />
        ) : (
          <>
            {/* Vertical stem of the K */}
            <rect x="14" y="12" width="5.25" height="24" rx="2.6" fill={v.mark} />
            {/* Diagonal arms of the K — upper arm reaches up for a sense of motion/growth */}
            <path
              d="M32 13 L22 24 L32 35"
              stroke={v.mark}
              strokeWidth="5.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Orbit dot — the "shared between people" accent */}
            <circle cx="35.5" cy="23.5" r="2.4" fill={v.mark} />
            <circle cx="35.5" cy="23.5" r="4.4" stroke={v.mark} strokeOpacity="0.4" strokeWidth="1.2" fill="none" />
          </>
        )}
      </svg>

      {showText && (
        <span
          className={`font-bold tracking-tight leading-none ${currentSize.text} ${v.textClass}`}
          style={{ letterSpacing: '-0.03em' }}
        >
          Isla
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(120deg, ${v.g1}, ${v.g3})` }}
          >
            kayd
          </span>
        </span>
      )}
    </div>
  );
}
