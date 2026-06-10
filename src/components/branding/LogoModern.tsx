import { useState, useEffect } from 'react';

interface LogoModernProps {
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'light' | 'dark' | 'gradient' | 'neon';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  animated?: boolean;
  interactive?: boolean;
  showTagline?: boolean;
  glowIntensity?: 'none' | 'low' | 'medium' | 'high';
}

export default function LogoModern({
  className = '',
  showText = true,
  variant = 'default',
  size = 'md',
  animated = true,
  interactive = true,
  showTagline = false,
  glowIntensity = 'medium',
}: LogoModernProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [rotationPhase, setRotationPhase] = useState(0);

  useEffect(() => {
    if (!animated) return;
    const interval = setInterval(() => {
      setRotationPhase((prev) => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, [animated]);

  const sizes = {
    xs: { container: 'w-24 h-8', icon: 24, text: 'text-sm', tagline: 'text-[7px]', iconPadding: 'p-1' },
    sm: { container: 'w-32 h-10', icon: 32, text: 'text-base', tagline: 'text-[8px]', iconPadding: 'p-1.5' },
    md: { container: 'w-40 h-12', icon: 40, text: 'text-lg', tagline: 'text-[9px]', iconPadding: 'p-2' },
    lg: { container: 'w-52 h-14', icon: 52, text: 'text-xl', tagline: 'text-[10px]', iconPadding: 'p-2.5' },
    xl: { container: 'w-64 h-16', icon: 64, text: 'text-2xl', tagline: 'text-xs', iconPadding: 'p-3' },
    '2xl': { container: 'w-80 h-20', icon: 80, text: 'text-3xl', tagline: 'text-sm', iconPadding: 'p-4' },
  };

  const variants = {
    default: {
      bg: 'from-teal-500 via-emerald-500 to-cyan-500',
      text: 'text-gray-900',
      glow: 'shadow-teal-500/50',
      accent: 'text-teal-600',
    },
    light: {
      bg: 'from-white via-gray-50 to-slate-100',
      text: 'text-white',
      glow: 'shadow-white/30',
      accent: 'text-white/80',
    },
    dark: {
      bg: 'from-slate-800 via-gray-900 to-zinc-900',
      text: 'text-slate-900',
      glow: 'shadow-slate-900/50',
      accent: 'text-slate-700',
    },
    gradient: {
      bg: 'from-violet-500 via-purple-500 to-fuchsia-500',
      text: 'text-gray-900',
      glow: 'shadow-purple-500/50',
      accent: 'text-purple-600',
    },
    neon: {
      bg: 'from-cyan-400 via-blue-500 to-purple-600',
      text: 'text-gray-900',
      glow: 'shadow-cyan-400/60',
      accent: 'text-cyan-500',
    },
  };

  const glowSettings = {
    none: '',
    low: 'drop-shadow-sm',
    medium: 'drop-shadow-md',
    high: 'drop-shadow-lg',
  };

  const currentSize = sizes[size];
  const currentVariant = variants[variant];
  const glowClass = glowSettings[glowIntensity];

  return (
    <div
      className={`flex items-center gap-3 ${className}`}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
    >
      {/* Modern IK Monogram Icon */}
      <div className="relative group">
        <div
          className={`
            relative rounded-xl bg-gradient-to-br ${currentVariant.bg}
            ${currentSize.iconPadding}
            transition-all duration-500
            ${interactive && isHovered ? 'scale-110 rotate-6' : 'scale-100 rotate-0'}
            ${glowIntensity !== 'none' ? `shadow-lg ${currentVariant.glow}` : ''}
          `}
          style={{
            width: currentSize.icon,
            height: currentSize.icon,
          }}
        >
          {/* Animated Background Pattern */}
          {animated && (
            <div
              className="absolute inset-0 opacity-20 rounded-xl"
              style={{
                background: `conic-gradient(from ${rotationPhase}deg, transparent 0%, white 50%, transparent 100%)`,
              }}
            />
          )}

          {/* IK Monogram */}
          <svg
            viewBox="0 0 100 100"
            className={`relative z-10 ${glowClass}`}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Letter I */}
            <path
              d="M 25,20 L 25,80 M 20,20 L 30,20 M 20,80 L 30,80"
              stroke="white"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              className={animated ? 'animate-pulse-soft' : ''}
            />

            {/* Letter K with modern twist */}
            <path
              d="M 50,20 L 50,80 M 50,45 L 75,20 M 50,55 L 75,80"
              stroke="white"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              className={animated ? 'animate-pulse-soft' : ''}
              style={{ animationDelay: '0.1s' }}
            />

            {/* Accent dot */}
            <circle
              cx="85"
              cy="25"
              r="4"
              fill="white"
              className={animated ? 'animate-bounce-soft' : ''}
            />
          </svg>

          {/* Shimmer effect */}
          {animated && (
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(45deg, transparent 30%, white 50%, transparent 70%)',
                backgroundSize: '200% 200%',
                animation: 'shimmer 2s infinite',
              }}
            />
          )}
        </div>

        {/* Orbiting particles effect on hover */}
        {animated && interactive && isHovered && (
          <>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
              <div className={`absolute top-0 left-1/2 w-1 h-1 rounded-full bg-gradient-to-r ${currentVariant.bg}`} />
            </div>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }}>
              <div className={`absolute bottom-0 right-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-r ${currentVariant.bg}`} />
            </div>
          </>
        )}
      </div>

      {/* Text */}
      {showText && !showTagline && (
        <div className="flex flex-col">
          <span
            className={`
              font-bold tracking-tight leading-none
              ${currentSize.text}
              ${currentVariant.text}
              ${interactive && isHovered ? 'tracking-wide' : ''}
              transition-all duration-300
            `}
          >
            Islakayd
          </span>
        </div>
      )}

      {/* Text with Tagline */}
      {showText && showTagline && (
        <div className="flex flex-col gap-0.5">
          <span
            className={`
              font-bold tracking-tight leading-none
              ${currentSize.text}
              ${currentVariant.text}
              ${interactive && isHovered ? 'tracking-wide' : ''}
              transition-all duration-300
            `}
          >
            Islakayd
          </span>
          <span
            className={`
              font-medium tracking-wider uppercase leading-none
              ${currentSize.tagline}
              ${currentVariant.accent}
              opacity-70
            `}
          >
            Rent Anything, Anywhere
          </span>
        </div>
      )}
    </div>
  );
}
