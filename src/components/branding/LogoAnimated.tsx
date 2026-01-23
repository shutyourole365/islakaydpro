import { useState, useEffect, useRef } from 'react';

interface LogoAnimatedProps {
  className?: string;
  showText?: boolean;
  variant?: 'light' | 'dark' | 'color' | 'gradient' | 'neon' | 'holographic';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  animated?: boolean;
  interactive?: boolean;
  loading?: boolean;
  badge?: 'new' | 'pro' | 'beta' | 'verified' | null;
  showTagline?: boolean;
  glowIntensity?: 'none' | 'low' | 'medium' | 'high';
  particleEffect?: boolean;
  morphing?: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  angle: number;
}

export default function LogoAnimated({
  className = '',
  showText = true,
  variant = 'gradient',
  size = 'md',
  animated = true,
  interactive = true,
  loading = false,
  badge = null,
  showTagline = false,
  glowIntensity = 'medium',
  particleEffect = false,
  morphing = false,
}: LogoAnimatedProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);
  const [morphPhase, setMorphPhase] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Particle animation
  useEffect(() => {
    if (!particleEffect || !animated) return;

    const createParticle = (): Particle => ({
      id: Math.random(),
      x: Math.random() * 56,
      y: Math.random() * 56,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 0.5 + 0.2,
      angle: Math.random() * Math.PI * 2,
    });

    setParticles(Array.from({ length: 8 }, createParticle));

    const animate = () => {
      setParticles(prev =>
        prev.map(p => ({
          ...p,
          y: p.y - p.speed,
          x: p.x + Math.sin(p.angle) * 0.3,
          opacity: p.y < 10 ? p.opacity * 0.95 : p.opacity,
        })).filter(p => p.opacity > 0.1).concat(
          Math.random() > 0.7 ? [createParticle()] : []
        ).slice(-12)
      );
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [particleEffect, animated]);

  // Morphing animation
  useEffect(() => {
    if (!morphing || !animated) return;
    const interval = setInterval(() => {
      setMorphPhase(p => (p + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, [morphing, animated]);

  // Track mouse for 3D effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !interactive) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
    });
  };

  const sizes = {
    xs: { icon: 'w-6 h-6', text: 'text-sm', tagline: 'text-[8px]', gap: 'gap-1', badge: 'text-[6px] px-1', particles: 4 },
    sm: { icon: 'w-8 h-8', text: 'text-lg', tagline: 'text-[9px]', gap: 'gap-1.5', badge: 'text-[8px] px-1.5', particles: 6 },
    md: { icon: 'w-10 h-10', text: 'text-2xl', tagline: 'text-[10px]', gap: 'gap-2', badge: 'text-[9px] px-2', particles: 8 },
    lg: { icon: 'w-12 h-12', text: 'text-3xl', tagline: 'text-xs', gap: 'gap-2.5', badge: 'text-[10px] px-2', particles: 10 },
    xl: { icon: 'w-16 h-16', text: 'text-4xl', tagline: 'text-sm', gap: 'gap-3', badge: 'text-xs px-2.5', particles: 12 },
    '2xl': { icon: 'w-20 h-20', text: 'text-5xl', tagline: 'text-base', gap: 'gap-4', badge: 'text-sm px-3', particles: 15 },
    '3xl': { icon: 'w-28 h-28', text: 'text-6xl', tagline: 'text-lg', gap: 'gap-5', badge: 'text-base px-4', particles: 20 },
  };

  const variants = {
    light: {
      primary: '#ffffff',
      secondary: '#f1f5f9',
      accent: '#e2e8f0',
      glow: 'rgba(255, 255, 255, 0.6)',
      text: 'text-white',
      highlight: 'text-white/90',
      gradientStops: ['#ffffff', '#f1f5f9', '#e2e8f0'],
    },
    dark: {
      primary: '#0f172a',
      secondary: '#1e293b',
      accent: '#334155',
      glow: 'rgba(30, 41, 59, 0.5)',
      text: 'text-gray-900',
      highlight: 'text-gray-700',
      gradientStops: ['#0f172a', '#1e293b', '#334155'],
    },
    color: {
      primary: '#0d9488',
      secondary: '#14b8a6',
      accent: '#2dd4bf',
      glow: 'rgba(13, 148, 136, 0.5)',
      text: 'text-gray-900',
      highlight: 'text-teal-600',
      gradientStops: ['#0d9488', '#14b8a6', '#2dd4bf'],
    },
    gradient: {
      primary: '#0d9488',
      secondary: '#059669',
      accent: '#10b981',
      glow: 'rgba(16, 185, 129, 0.6)',
      text: 'text-gray-900',
      highlight: 'text-emerald-600',
      gradientStops: ['#0d9488', '#059669', '#10b981', '#34d399'],
    },
    neon: {
      primary: '#06b6d4',
      secondary: '#22d3ee',
      accent: '#67e8f9',
      glow: 'rgba(6, 182, 212, 0.8)',
      text: 'text-cyan-400',
      highlight: 'text-cyan-300',
      gradientStops: ['#0891b2', '#06b6d4', '#22d3ee', '#67e8f9'],
    },
    holographic: {
      primary: '#8b5cf6',
      secondary: '#a78bfa',
      accent: '#c4b5fd',
      glow: 'rgba(139, 92, 246, 0.7)',
      text: 'text-violet-500',
      highlight: 'text-purple-400',
      gradientStops: ['#7c3aed', '#8b5cf6', '#a78bfa', '#ec4899', '#f472b6'],
    },
  };

  const glowSettings = {
    none: { blur: 0, opacity: 0 },
    low: { blur: 4, opacity: 0.3 },
    medium: { blur: 8, opacity: 0.5 },
    high: { blur: 16, opacity: 0.7 },
  };

  const currentSize = sizes[size];
  const currentVariant = variants[variant];
  const currentGlow = glowSettings[glowIntensity];
  const uniqueId = `logo-anim-${Math.random().toString(36).substr(2, 9)}`;

  const badgeConfig = {
    new: { bg: 'bg-gradient-to-r from-amber-400 to-orange-500', text: 'NEW', icon: '✨' },
    pro: { bg: 'bg-gradient-to-r from-purple-500 to-indigo-600', text: 'PRO', icon: '⭐' },
    beta: { bg: 'bg-gradient-to-r from-blue-500 to-cyan-500', text: 'BETA', icon: '🚀' },
    verified: { bg: 'bg-gradient-to-r from-teal-500 to-emerald-500', text: '✓', icon: '' },
  };

  // 3D transform based on mouse position
  const transform3D = interactive && isHovered
    ? `perspective(200px) rotateX(${-mousePosition.y}deg) rotateY(${mousePosition.x}deg) scale(1.05)`
    : 'perspective(200px) rotateX(0deg) rotateY(0deg) scale(1)';

  // Morphing path data
  const getMorphPath = (phase: number) => {
    const paths = [
      'M20 38V22C20 19.2386 22.2386 17 25 17H31C33.7614 17 36 19.2386 36 22V38',
      'M18 38V24C18 20.6863 20.6863 18 24 18H32C35.3137 18 38 20.6863 38 24V38',
      'M19 38V23C19 19.6863 21.6863 17 25 17H31C34.3137 17 37 19.6863 37 23V38',
      'M20 38V22C20 19.2386 22.2386 17 25 17H31C33.7614 17 36 19.2386 36 22V38',
    ];
    return paths[phase % paths.length];
  };

  return (
    <div
      ref={containerRef}
      className={`flex items-center ${currentSize.gap} ${className} group relative cursor-pointer select-none`}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => {
        interactive && setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
      onMouseDown={() => interactive && setIsPressed(true)}
      onMouseUp={() => interactive && setIsPressed(false)}
    >
      {/* Icon Container with 3D Transform */}
      <div
        className={`${currentSize.icon} relative flex-shrink-0 transition-transform duration-300 ease-out`}
        style={{ transform: transform3D }}
      >
        {/* Outer Glow Ring */}
        {animated && glowIntensity !== 'none' && (
          <div
            className="absolute inset-0 rounded-xl transition-all duration-500"
            style={{
              boxShadow: isHovered
                ? `0 0 ${currentGlow.blur * 2}px ${currentVariant.glow}, 0 0 ${currentGlow.blur * 4}px ${currentVariant.glow}`
                : `0 0 ${currentGlow.blur}px ${currentVariant.glow}`,
              opacity: isHovered ? currentGlow.opacity * 1.5 : currentGlow.opacity,
            }}
          />
        )}

        {/* Loading Ring */}
        {loading && (
          <div className="absolute inset-0 rounded-xl">
            <svg className="w-full h-full" viewBox="0 0 56 56">
              <circle
                cx="28"
                cy="28"
                r="26"
                fill="none"
                stroke={currentVariant.accent}
                strokeWidth="2"
                strokeDasharray="40 120"
                strokeLinecap="round"
                className="animate-spin origin-center"
                style={{ animationDuration: '1.5s' }}
              />
            </svg>
          </div>
        )}

        <svg
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`w-full h-full ${loading ? 'opacity-60' : ''} transition-opacity duration-300`}
        >
          <defs>
            {/* Animated Multi-stop Gradient */}
            <linearGradient id={`${uniqueId}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
              {currentVariant.gradientStops.map((color, i) => (
                <stop
                  key={i}
                  offset={`${(i / (currentVariant.gradientStops.length - 1)) * 100}%`}
                  stopColor={color}
                >
                  {animated && (
                    <animate
                      attributeName="offset"
                      values={`${Math.max(0, (i / (currentVariant.gradientStops.length - 1)) * 100 - 20)}%;${(i / (currentVariant.gradientStops.length - 1)) * 100}%;${Math.min(100, (i / (currentVariant.gradientStops.length - 1)) * 100 + 20)}%;${(i / (currentVariant.gradientStops.length - 1)) * 100}%`}
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  )}
                </stop>
              ))}
            </linearGradient>

            {/* Holographic Shimmer */}
            {variant === 'holographic' && (
              <linearGradient id={`${uniqueId}-holo`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8">
                  <animate attributeName="stop-color" values="#ec4899;#8b5cf6;#06b6d4;#10b981;#ec4899" dur="3s" repeatCount="indefinite" />
                </stop>
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6">
                  <animate attributeName="stop-color" values="#8b5cf6;#06b6d4;#10b981;#ec4899;#8b5cf6" dur="3s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8">
                  <animate attributeName="stop-color" values="#06b6d4;#10b981;#ec4899;#8b5cf6;#06b6d4" dur="3s" repeatCount="indefinite" />
                </stop>
              </linearGradient>
            )}

            {/* Sweeping Shine */}
            <linearGradient id={`${uniqueId}-shine`} x1="-100%" y1="0%" x2="200%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="40%" stopColor="white" stopOpacity="0" />
              <stop offset="50%" stopColor="white" stopOpacity="0.6" />
              <stop offset="60%" stopColor="white" stopOpacity="0" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
              {animated && (
                <animateTransform
                  attributeName="gradientTransform"
                  type="translate"
                  values="-1 0;1 0"
                  dur="3s"
                  repeatCount="indefinite"
                />
              )}
            </linearGradient>

            {/* Neon Glow Filter */}
            <filter id={`${uniqueId}-neon`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur1" />
              <feGaussianBlur stdDeviation="4" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* 3D Shadow */}
            <filter id={`${uniqueId}-shadow`} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor={currentVariant.primary} floodOpacity="0.25" />
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor={currentVariant.primary} floodOpacity="0.15" />
              <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor={currentVariant.primary} floodOpacity="0.1" />
            </filter>

            <clipPath id={`${uniqueId}-clip`}>
              <rect x="4" y="4" width="48" height="48" rx="14" />
            </clipPath>

            {/* Radial Pulse */}
            <radialGradient id={`${uniqueId}-pulse`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={currentVariant.accent} stopOpacity="0.4">
                {animated && isHovered && (
                  <animate attributeName="stop-opacity" values="0.4;0.8;0.4" dur="1.5s" repeatCount="indefinite" />
                )}
              </stop>
              <stop offset="100%" stopColor={currentVariant.accent} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Animated Background Pulse */}
          {animated && isHovered && (
            <rect
              x="-10"
              y="-10"
              width="76"
              height="76"
              rx="24"
              fill={`url(#${uniqueId}-pulse)`}
              className="animate-ping"
              style={{ animationDuration: '2s' }}
            />
          )}

          {/* Main Background */}
          <g filter={`url(#${uniqueId}-shadow)`}>
            <rect
              x="4"
              y="4"
              width="48"
              height="48"
              rx="14"
              fill={variant === 'holographic' ? `url(#${uniqueId}-holo)` : `url(#${uniqueId}-bg)`}
              className={`transition-all duration-500 ${isPressed ? 'scale-95' : ''}`}
              style={{ transformOrigin: '28px 28px' }}
            />
          </g>

          {/* Glass Morphism Layer */}
          <rect
            x="4"
            y="4"
            width="48"
            height="48"
            rx="14"
            fill="white"
            fillOpacity="0.1"
          />

          {/* Shine Sweep */}
          <rect
            x="4"
            y="4"
            width="48"
            height="48"
            rx="14"
            fill={`url(#${uniqueId}-shine)`}
          />

          {/* Particles */}
          {particleEffect && animated && (
            <g clipPath={`url(#${uniqueId}-clip)`}>
              {particles.map(p => (
                <circle
                  key={p.id}
                  cx={p.x}
                  cy={p.y}
                  r={p.size}
                  fill="white"
                  fillOpacity={p.opacity}
                />
              ))}
            </g>
          )}

          {/* Main Icon Group */}
          <g
            clipPath={`url(#${uniqueId}-clip)`}
            filter={variant === 'neon' ? `url(#${uniqueId}-neon)` : undefined}
          >
            {/* Building/Warehouse Structure with Morphing */}
            <g className={animated ? 'animate-logo-float' : ''}>
              <path
                d={morphing ? getMorphPath(morphPhase) : 'M20 38V22C20 19.2386 22.2386 17 25 17H31C33.7614 17 36 19.2386 36 22V38'}
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-700"
              />

              {/* Window with Glow Effect */}
              <g className={animated ? 'animate-logo-window-glow' : ''}>
                <rect
                  x="25"
                  y="23"
                  width="6"
                  height="6"
                  rx="1.5"
                  fill="white"
                  className={`transition-all duration-300 ${isHovered ? 'fill-opacity-100' : 'fill-opacity-90'}`}
                />
                {isHovered && variant === 'neon' && (
                  <rect
                    x="25"
                    y="23"
                    width="6"
                    height="6"
                    rx="1.5"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    className="animate-ping"
                    style={{ opacity: 0.5 }}
                  />
                )}
              </g>

              {/* Door Pillars */}
              <path d="M23 38V33" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M33 38V33" stroke="white" strokeWidth="2.5" strokeLinecap="round" />

              {/* Animated Base Line */}
              <path
                d="M16 38H40"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                className={animated ? 'animate-logo-line-draw' : ''}
              />
            </g>

            {/* Animated Upload Badge */}
            <g className={animated ? 'animate-logo-bounce' : ''}>
              <circle
                cx="40"
                cy="16"
                r="8"
                className={`transition-all duration-300 ${isPressed ? 'scale-90' : isHovered ? 'scale-110' : ''}`}
                style={{ transformOrigin: '40px 16px' }}
              >
                {animated && (
                  <animate
                    attributeName="fill"
                    values="#f59e0b;#fbbf24;#f59e0b"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                )}
              </circle>

              {/* Badge Shine */}
              <circle
                cx="40"
                cy="16"
                r="8"
                fill={`url(#${uniqueId}-shine)`}
              />

              {/* Animated Arrow with Trail */}
              <g className={animated ? 'animate-logo-arrow' : ''}>
                <path
                  d="M37 17L40 14L43 17"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M40 14V20"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className={animated ? 'animate-logo-arrow-trail' : ''}
                />
              </g>
            </g>

            {/* Sparkle Effects */}
            {isHovered && animated && (
              <>
                <circle cx="12" cy="12" r="1" fill="white" className="animate-ping" style={{ animationDelay: '0s' }} />
                <circle cx="44" cy="44" r="1" fill="white" className="animate-ping" style={{ animationDelay: '0.3s' }} />
                <circle cx="48" cy="28" r="0.5" fill="white" className="animate-ping" style={{ animationDelay: '0.6s' }} />
              </>
            )}
          </g>

          {/* Ring Pulse */}
          {isHovered && animated && (
            <>
              <rect
                x="2"
                y="2"
                width="52"
                height="52"
                rx="16"
                fill="none"
                stroke={currentVariant.accent}
                strokeWidth="1"
                className="animate-ping"
                style={{ opacity: 0.4, animationDuration: '1.5s' }}
              />
              <rect
                x="0"
                y="0"
                width="56"
                height="56"
                rx="18"
                fill="none"
                stroke={currentVariant.accent}
                strokeWidth="0.5"
                className="animate-ping"
                style={{ opacity: 0.2, animationDuration: '2s', animationDelay: '0.5s' }}
              />
            </>
          )}
        </svg>

        {/* Badge */}
        {badge && (
          <div
            className={`absolute -top-1 -right-1 ${badgeConfig[badge].bg} text-white ${currentSize.badge} py-0.5 rounded-full font-bold shadow-lg flex items-center gap-0.5 animate-bounce`}
            style={{ animationDuration: '2s' }}
          >
            {badgeConfig[badge].icon && <span>{badgeConfig[badge].icon}</span>}
            {badgeConfig[badge].text}
          </div>
        )}
      </div>

      {/* Text with Stagger Animation */}
      {showText && (
        <div className="flex flex-col overflow-hidden">
          <span className={`font-bold tracking-tight ${currentSize.text} ${currentVariant.text} flex`}>
            {'Islakayd'.split('').map((char, i) => (
              <span
                key={i}
                className={`inline-block transition-all duration-300 ${animated ? 'animate-logo-text-wave' : ''}`}
                style={{
                  animationDelay: `${i * 0.05}s`,
                  transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                  transitionDelay: `${i * 0.02}s`,
                }}
              >
                {i < 4 ? (
                  char
                ) : (
                  <span className={currentVariant.highlight}>{char}</span>
                )}
              </span>
            ))}
          </span>
          {showTagline && (
            <span
              className={`tracking-widest uppercase ${currentSize.tagline} ${
                variant === 'light' || variant === 'neon' ? 'text-gray-300' : 'text-gray-500'
              } transition-all duration-500 ${
                animated ? (isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2') : 'opacity-100'
              }`}
            >
              Equipment Rental
            </span>
          )}
        </div>
      )}

      {/* Custom Animations */}
      <style>{`
        @keyframes logo-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes logo-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          25% { transform: translateY(-3px) scale(1.05); }
          50% { transform: translateY(-1px) scale(1.02); }
          75% { transform: translateY(-2px) scale(1.03); }
        }
        @keyframes logo-arrow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes logo-arrow-trail {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes logo-window-glow {
          0%, 100% { filter: drop-shadow(0 0 0px white); }
          50% { filter: drop-shadow(0 0 4px white); }
        }
        @keyframes logo-line-draw {
          0% { stroke-dasharray: 0 48; }
          100% { stroke-dasharray: 48 0; }
        }
        @keyframes logo-text-wave {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1px); }
        }
        .animate-logo-float { animation: logo-float 3s ease-in-out infinite; }
        .animate-logo-bounce { animation: logo-bounce 2.5s ease-in-out infinite; }
        .animate-logo-arrow { animation: logo-arrow 1.5s ease-in-out infinite; }
        .animate-logo-arrow-trail { animation: logo-arrow-trail 1.5s ease-in-out infinite; }
        .animate-logo-window-glow { animation: logo-window-glow 2s ease-in-out infinite; }
        .animate-logo-line-draw { stroke-dasharray: 48; animation: logo-line-draw 0.8s ease-out forwards; }
        .animate-logo-text-wave { animation: logo-text-wave 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
