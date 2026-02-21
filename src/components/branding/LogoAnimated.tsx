import { useState, useEffect, useRef, useCallback } from 'react';

interface LogoAnimatedProps {
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'light' | 'dark' | 'mono' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  animated?: boolean;
  interactive?: boolean;
  loading?: boolean;
  showTagline?: boolean;
  onLoadComplete?: () => void;
  reducedMotion?: boolean;
  iconOnly?: boolean;
  glowIntensity?: 'none' | 'low' | 'medium' | 'high';
}

type AnimationState = 'idle' | 'intro' | 'hover' | 'loading' | 'pulse';

export default function LogoAnimated({
  className = '',
  showText = true,
  variant = 'default',
  size = 'md',
  animated = true,
  interactive = true,
  loading = false,
  showTagline = false,
  onLoadComplete,
  reducedMotion = false,
  iconOnly = false,
  glowIntensity = 'medium',
}: LogoAnimatedProps) {
  const [animationState, setAnimationState] = useState<AnimationState>('intro');
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [introComplete, setIntroComplete] = useState(!animated);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle intro animation completion
  useEffect(() => {
    if (!animated || reducedMotion) {
      setIntroComplete(true);
      setAnimationState('idle');
      return;
    }

    const timer = setTimeout(() => {
      setIntroComplete(true);
      setAnimationState('idle');
      onLoadComplete?.();
    }, 1800);

    return () => clearTimeout(timer);
  }, [animated, reducedMotion, onLoadComplete]);

  // Handle loading state
  useEffect(() => {
    if (loading) {
      setAnimationState('loading');
    } else if (introComplete) {
      setAnimationState(isHovered ? 'hover' : 'idle');
    }
  }, [loading, introComplete, isHovered]);

  // Periodic subtle pulse
  useEffect(() => {
    if (!animated || loading || !introComplete || reducedMotion) return;

    const interval = setInterval(() => {
      if (!isHovered) {
        setAnimationState('pulse');
        setTimeout(() => setAnimationState('idle'), 800);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [animated, loading, introComplete, isHovered, reducedMotion]);

  const handleMouseEnter = useCallback(() => {
    if (!interactive) return;
    setIsHovered(true);
    if (introComplete && !loading) setAnimationState('hover');
  }, [interactive, introComplete, loading]);

  const handleMouseLeave = useCallback(() => {
    if (!interactive) return;
    setIsHovered(false);
    setIsPressed(false);
    if (introComplete && !loading) setAnimationState('idle');
  }, [interactive, introComplete, loading]);

  const sizes = {
    xs: { icon: 24, text: 'text-sm', tagline: 'text-[7px]', gap: 'gap-1.5', stroke: 2.2 },
    sm: { icon: 32, text: 'text-lg', tagline: 'text-[8px]', gap: 'gap-2', stroke: 2.4 },
    md: { icon: 40, text: 'text-xl', tagline: 'text-[9px]', gap: 'gap-2.5', stroke: 2.5 },
    lg: { icon: 52, text: 'text-2xl', tagline: 'text-[10px]', gap: 'gap-3', stroke: 2.8 },
    xl: { icon: 64, text: 'text-3xl', tagline: 'text-xs', gap: 'gap-3.5', stroke: 3 },
    '2xl': { icon: 80, text: 'text-4xl', tagline: 'text-sm', gap: 'gap-4', stroke: 3.2 },
  };

  const variants = {
    default: {
      primary: '#0d9488',
      secondary: '#14b8a6',
      accent: '#5eead4',
      text: 'text-gray-900',
      highlight: 'text-teal-600',
    },
    light: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      accent: '#e2e8f0',
      text: 'text-white',
      highlight: 'text-white/80',
    },
    dark: {
      primary: '#0f172a',
      secondary: '#1e293b',
      accent: '#334155',
      text: 'text-slate-900',
      highlight: 'text-slate-700',
    },
    mono: {
      primary: '#18181b',
      secondary: '#27272a',
      accent: '#3f3f46',
      text: 'text-zinc-900',
      highlight: 'text-zinc-700',
    },
    gradient: {
      primary: '#0d9488',
      secondary: '#059669',
      accent: '#34d399',
      text: 'text-gray-900',
      highlight: 'text-emerald-600',
    },
  };

  const glowSettings = {
    none: 0,
    low: 4,
    medium: 8,
    high: 14,
  };

  const currentSize = sizes[size];
  const currentVariant = variants[variant];
  const glowBlur = glowSettings[glowIntensity];
  // Use crypto for secure random UID
  function getRandomUID() {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const arr = new Uint32Array(1);
      window.crypto.getRandomValues(arr);
      return 'ik-' + arr[0].toString(36).slice(0, 6);
    }
    return 'ik-' + Math.random().toString(36).slice(2, 8);
  }
  const uid = getRandomUID();

  const iconSize = currentSize.icon;
  const strokeW = currentSize.stroke;
  const showIntro = animationState === 'intro' && animated && !reducedMotion;

  return (
    <div
      ref={containerRef}
      className={`flex items-center ${currentSize.gap} ${className} select-none cursor-pointer`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={() => interactive && setIsPressed(true)}
      onMouseUp={() => interactive && setIsPressed(false)}
      role="img"
      aria-label="Islakayd - Equipment Rental"
    >
      {/* Icon Container */}
      <div
        className="relative flex-shrink-0"
        style={{
          width: iconSize,
          height: iconSize,
          transform: isPressed ? 'scale(0.94)' : isHovered ? 'scale(1.04)' : 'scale(1)',
          transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Glow layer */}
        {glowIntensity !== 'none' && (
          <div
            className="absolute inset-0 rounded-full transition-all duration-500"
            style={{
              background: `radial-gradient(circle, ${currentVariant.primary}40 0%, transparent 70%)`,
              filter: `blur(${glowBlur}px)`,
              opacity: isHovered ? 0.9 : 0.5,
              transform: animationState === 'pulse' ? 'scale(1.15)' : 'scale(1)',
            }}
          />
        )}

        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Primary Gradient */}
            <linearGradient id={`${uid}-main`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={currentVariant.primary}>
                {animated && !reducedMotion && (
                  <animate
                    attributeName="stop-color"
                    values={`${currentVariant.primary};${currentVariant.secondary};${currentVariant.primary}`}
                    dur="6s"
                    repeatCount="indefinite"
                  />
                )}
              </stop>
              <stop offset="100%" stopColor={currentVariant.secondary}>
                {animated && !reducedMotion && (
                  <animate
                    attributeName="stop-color"
                    values={`${currentVariant.secondary};${currentVariant.accent};${currentVariant.secondary}`}
                    dur="6s"
                    repeatCount="indefinite"
                  />
                )}
              </stop>
            </linearGradient>

            {/* Shimmer Gradient */}
            <linearGradient id={`${uid}-shimmer`} x1="-200%" y1="0%" x2="200%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="50%" stopColor="white" stopOpacity="0.3" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
              {animated && !reducedMotion && (
                <animateTransform
                  attributeName="gradientTransform"
                  type="translate"
                  from="-2 0"
                  to="2 0"
                  dur="3s"
                  repeatCount="indefinite"
                />
              )}
            </linearGradient>

            {/* Soft Shadow */}
            <filter id={`${uid}-shadow`} x="-25%" y="-25%" width="150%" height="150%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={currentVariant.primary} floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Background Circle - Clean like Airbnb */}
          <circle
            cx="24"
            cy="24"
            r="23"
            fill={`url(#${uid}-main)`}
            filter={`url(#${uid}-shadow)`}
            style={{
              opacity: showIntro ? 0 : 1,
              transform: showIntro ? 'scale(0)' : animationState === 'pulse' ? 'scale(1.02)' : 'scale(1)',
              transformOrigin: '24px 24px',
              transition: 'transform 0.4s ease-out, opacity 0.4s ease-out',
            }}
          >
            {showIntro && (
              <>
                <animate attributeName="opacity" from="0" to="1" dur="0.5s" fill="freeze" begin="0.1s" />
                <animateTransform
                  attributeName="transform"
                  type="scale"
                  from="0"
                  to="1"
                  dur="0.6s"
                  fill="freeze"
                  begin="0.1s"
                  calcMode="spline"
                  keySplines="0.34, 1.56, 0.64, 1"
                />
              </>
            )}
          </circle>

          {/* Shimmer overlay */}
          <circle
            cx="24"
            cy="24"
            r="23"
            fill={`url(#${uid}-shimmer)`}
            style={{
              opacity: showIntro ? 0 : isHovered ? 0.8 : 0.4,
              transition: 'opacity 0.3s ease',
            }}
          />

          {/* The Symbol - Minimalist "IK" Monogram */}
          <g>
            {/* Left bar (I) */}
            <line
              x1="15"
              y1="14"
              x2="15"
              y2="34"
              stroke="white"
              strokeWidth={strokeW}
              strokeLinecap="round"
              style={{
                strokeDasharray: 20,
                strokeDashoffset: showIntro ? 20 : 0,
                transition: 'stroke-dashoffset 0.5s ease-out 0.4s',
              }}
            />

            {/* Connecting Flow (represents sharing/transfer) */}
            <path
              d="M15 24 Q24 14, 33 24 Q24 34, 15 24"
              stroke="white"
              strokeWidth={strokeW * 0.9}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              style={{
                strokeDasharray: 70,
                strokeDashoffset: showIntro ? 70 : 0,
                transition: 'stroke-dashoffset 0.8s ease-out 0.6s',
              }}
            />

            {/* Right bar (K stem) */}
            <line
              x1="33"
              y1="14"
              x2="33"
              y2="34"
              stroke="white"
              strokeWidth={strokeW}
              strokeLinecap="round"
              style={{
                strokeDasharray: 20,
                strokeDashoffset: showIntro ? 20 : 0,
                transition: 'stroke-dashoffset 0.5s ease-out 0.5s',
              }}
            />

            {/* Node dots - represent equipment connection points */}
            {[[15, 14], [15, 34], [33, 14], [33, 34]].map(([cx, cy], i) => (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={strokeW * 0.9}
                fill="white"
                style={{
                  opacity: showIntro ? 0 : 1,
                  transform: isHovered ? 'scale(1.25)' : 'scale(1)',
                  transformOrigin: `${cx}px ${cy}px`,
                  transition: `opacity 0.3s ease ${1 + i * 0.08}s, transform 0.25s ease ${i * 0.04}s`,
                }}
              />
            ))}

            {/* Center flow indicator */}
            <circle
              cx="24"
              cy="24"
              r={strokeW * 0.7}
              fill="white"
              style={{
                opacity: showIntro ? 0 : isHovered ? 1 : 0.9,
                transform: isHovered ? 'scale(1.3)' : 'scale(1)',
                transformOrigin: '24px 24px',
                transition: 'all 0.3s ease 1.4s',
              }}
            >
              {animated && !reducedMotion && (
                <animate
                  attributeName="opacity"
                  values="0.9;1;0.9"
                  dur="2s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
          </g>

          {/* Loading State */}
          {loading && (
            <g style={{ transformOrigin: '24px 24px' }} className="animate-spin">
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="25 75"
                strokeLinecap="round"
                opacity="0.9"
              />
            </g>
          )}

          {/* Hover ring */}
          {isHovered && animated && !reducedMotion && (
            <circle
              cx="24"
              cy="24"
              r="26"
              fill="none"
              stroke={currentVariant.accent}
              strokeWidth="1.5"
              opacity="0.6"
              className="animate-ping"
              style={{ animationDuration: '2s' }}
            />
          )}
        </svg>
      </div>

      {/* Wordmark */}
      {showText && !iconOnly && (
        <div className="flex flex-col overflow-hidden">
          {/* Brand name with staggered reveal */}
          <div className={`font-semibold tracking-tight ${currentSize.text} flex`}>
            {'Islakayd'.split('').map((char, i) => {
              const isHighlight = i >= 4;
              return (
                <span
                  key={i}
                  className={`inline-block transition-all duration-300 ${isHighlight ? currentVariant.highlight : currentVariant.text}`}
                  style={{
                    opacity: showIntro ? 0 : 1,
                    transform: showIntro ? 'translateY(100%)' : isHovered ? 'translateY(-1px)' : 'translateY(0)',
                    transitionDelay: showIntro ? `${0.9 + i * 0.05}s` : `${i * 0.015}s`,
                  }}
                >
                  {char}
                </span>
              );
            })}
          </div>

          {/* Tagline */}
          {showTagline && (
            <span
              className={`tracking-[0.15em] uppercase font-medium ${currentSize.tagline} ${
                variant === 'light' ? 'text-white/50' : 'text-gray-400'
              } transition-all duration-500`}
              style={{
                opacity: showIntro ? 0 : isHovered ? 1 : 0.7,
                transform: showIntro ? 'translateY(8px)' : 'translateY(0)',
                transitionDelay: showIntro ? '1.4s' : '0s',
              }}
            >
              Rent Anything
            </span>
          )}
        </div>
      )}

      {/* Accessibility: Reduced motion support */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

// Named exports for consumers
export const logoVariants = ['default', 'light', 'dark', 'mono', 'gradient'] as const;
export const logoSizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
export type LogoVariant = typeof logoVariants[number];
export type LogoSize = typeof logoSizes[number];
