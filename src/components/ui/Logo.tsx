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

// Minimal "IK" monogram inside a rounded square. Flat fill (no gradient)
// matches the Vercel/Linear/Spotify-style minimal mark direction. Uses
// Plus Jakarta Sans 800, which is already loaded for the app (see
// tailwind.config.js `display` font stack + the Google Fonts <link> in
// index.html).
function LogoMark({ className = '', inverse = false }: { className?: string; inverse?: boolean }) {
  return (
    <svg
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Solid background — cyan-600 in default mode, white when used on
          a dark transparent header (inverse). */}
      <rect
        width="48"
        height="48"
        rx="11"
        fill={inverse ? '#ffffff' : '#0891b2'}
      />
      <text
        x="24"
        y="24"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'Plus Jakarta Sans', Inter, system-ui, sans-serif"
        fontWeight="800"
        fontSize="22"
        letterSpacing="-1.2"
        fill={inverse ? '#0891b2' : '#ffffff'}
      >
        IK
      </text>
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
      className={`leading-none font-display ${className}`}
      style={{ fontWeight: 800, letterSpacing: '-0.025em' }}
    >
      <span
        className={
          inverse
            ? 'text-white'
            : 'bg-gradient-to-r from-cyan-700 via-cyan-600 to-teal-600 bg-clip-text text-transparent dark:from-cyan-300 dark:via-cyan-200 dark:to-teal-300'
        }
      >
        IslaKayd
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
    return <LogoMark className={`${s.icon} ${className}`} inverse={inverse} />;
  }

  if (variant === 'wordmark') {
    return <Wordmark className={`${s.text} ${className}`} inverse={inverse} />;
  }

  return (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      <LogoMark className={s.icon} inverse={inverse} />
      <Wordmark className={s.text} inverse={inverse} />
    </span>
  );
}
