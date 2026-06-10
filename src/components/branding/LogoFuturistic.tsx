import { useState, useEffect, useRef } from 'react';

interface LogoFuturisticProps {
  variant?: 'gradient' | 'light' | 'dark' | 'neon' | 'holographic';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  animated?: boolean;
  showTagline?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function LogoFuturistic({
  variant = 'gradient',
  size = 'md',
  animated = true,
  showTagline = false,
  interactive = true,
  onClick,
  className = '',
}: LogoFuturisticProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const sizeConfig = {
    xs: { logo: 28, text: 14, spacing: 6, tagline: 8 },
    sm: { logo: 36, text: 18, spacing: 8, tagline: 10 },
    md: { logo: 48, text: 24, spacing: 10, tagline: 12 },
    lg: { logo: 64, text: 32, spacing: 12, tagline: 14 },
    xl: { logo: 80, text: 40, spacing: 14, tagline: 16 },
    '2xl': { logo: 96, text: 48, spacing: 16, tagline: 18 },
  };

  const config = sizeConfig[size];

  const colorSchemes = {
    gradient: {
      primary: 'url(#futuristic-gradient)',
      secondary: '#0d9488',
      text: '#1f2937',
      glow: 'rgba(16, 185, 129, 0.6)',
      accent: '#10b981',
    },
    light: {
      primary: '#ffffff',
      secondary: '#ffffff',
      text: '#ffffff',
      glow: 'rgba(255, 255, 255, 0.4)',
      accent: '#ffffff',
    },
    dark: {
      primary: '#1f2937',
      secondary: '#374151',
      text: '#1f2937',
      glow: 'rgba(31, 41, 55, 0.4)',
      accent: '#4b5563',
    },
    neon: {
      primary: 'url(#neon-gradient)',
      secondary: '#06b6d4',
      text: '#06b6d4',
      glow: 'rgba(6, 182, 212, 0.8)',
      accent: '#22d3ee',
    },
    holographic: {
      primary: 'url(#holographic-gradient)',
      secondary: '#a855f7',
      text: '#1f2937',
      glow: 'rgba(168, 85, 247, 0.5)',
      accent: '#c084fc',
    },
  };

  const colors = colorSchemes[variant];

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`inline-flex items-center ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        gap: config.spacing,
        transform: interactive && isHovered 
          ? `perspective(1000px) rotateX(${mousePosition.y * -5}deg) rotateY(${mousePosition.x * 5}deg)` 
          : 'perspective(1000px)',
        transition: 'transform 0.15s ease-out',
      }}
    >
      {/* Hexagonal Logo Mark */}
      <div 
        className="relative"
        style={{
          width: config.logo,
          height: config.logo,
          filter: isHovered ? `drop-shadow(0 0 ${config.logo * 0.4}px ${colors.glow})` : `drop-shadow(0 0 ${config.logo * 0.2}px ${colors.glow})`,
          transition: 'filter 0.3s ease',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            {/* Gradient Definitions */}
            <linearGradient id="futuristic-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            
            <linearGradient id="neon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>

            <linearGradient id="holographic-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7">
                {animated && <animate attributeName="stop-color" values="#a855f7;#06b6d4;#10b981;#a855f7" dur="4s" repeatCount="indefinite" />}
              </stop>
              <stop offset="50%" stopColor="#06b6d4">
                {animated && <animate attributeName="stop-color" values="#06b6d4;#10b981;#a855f7;#06b6d4" dur="4s" repeatCount="indefinite" />}
              </stop>
              <stop offset="100%" stopColor="#10b981">
                {animated && <animate attributeName="stop-color" values="#10b981;#a855f7;#06b6d4;#10b981" dur="4s" repeatCount="indefinite" />}
              </stop>
            </linearGradient>

            {/* Glow Filter */}
            <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Clip Path for Hexagon */}
            <clipPath id="hexagon-clip">
              <polygon points="50,2 95,25 95,75 50,98 5,75 5,25" />
            </clipPath>
          </defs>

          {/* Outer Hexagon Ring */}
          <g clipPath="url(#hexagon-clip)">
            <polygon
              points="50,2 95,25 95,75 50,98 5,75 5,25"
              fill="none"
              stroke={colors.primary}
              strokeWidth="3"
              className={animated && isLoaded ? 'animate-draw-hexagon' : ''}
              style={{
                strokeDasharray: animated ? 300 : 0,
                strokeDashoffset: animated && isLoaded ? 0 : 300,
                transition: 'stroke-dashoffset 1.5s ease-out',
              }}
            />
          </g>

          {/* Inner Geometric Pattern */}
          <g filter="url(#logo-glow)">
            {/* Center Diamond */}
            <polygon
              points="50,20 75,50 50,80 25,50"
              fill={colors.primary}
              opacity={isLoaded ? 1 : 0}
              style={{
                transform: `scale(${isLoaded ? 1 : 0.5})`,
                transformOrigin: 'center',
                transition: 'all 0.6s ease-out 0.3s',
              }}
            />

            {/* Top Triangle */}
            <polygon
              points="50,8 70,28 30,28"
              fill={colors.primary}
              opacity={isLoaded ? 0.7 : 0}
              style={{
                transform: `translateY(${isLoaded ? 0 : -10}px)`,
                transition: 'all 0.5s ease-out 0.5s',
              }}
            />

            {/* Bottom Triangle */}
            <polygon
              points="50,92 70,72 30,72"
              fill={colors.primary}
              opacity={isLoaded ? 0.7 : 0}
              style={{
                transform: `translateY(${isLoaded ? 0 : 10}px)`,
                transition: 'all 0.5s ease-out 0.5s',
              }}
            />

            {/* Left Wing */}
            <polygon
              points="8,50 25,35 25,65"
              fill={colors.primary}
              opacity={isLoaded ? 0.5 : 0}
              style={{
                transform: `translateX(${isLoaded ? 0 : -10}px)`,
                transition: 'all 0.5s ease-out 0.7s',
              }}
            />

            {/* Right Wing */}
            <polygon
              points="92,50 75,35 75,65"
              fill={colors.primary}
              opacity={isLoaded ? 0.5 : 0}
              style={{
                transform: `translateX(${isLoaded ? 0 : 10}px)`,
                transition: 'all 0.5s ease-out 0.7s',
              }}
            />
          </g>

          {/* Connection Lines */}
          <g stroke={colors.secondary} strokeWidth="1" opacity={isLoaded ? 0.4 : 0} style={{ transition: 'opacity 0.5s ease-out 0.9s' }}>
            <line x1="50" y1="20" x2="50" y2="8" />
            <line x1="50" y1="80" x2="50" y2="92" />
            <line x1="25" y1="50" x2="8" y2="50" />
            <line x1="75" y1="50" x2="92" y2="50" />
          </g>

          {/* Corner Nodes */}
          {[[20, 15], [80, 15], [15, 50], [85, 50], [20, 85], [80, 85]].map(([cx, cy], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={3}
              fill={colors.accent}
              opacity={isLoaded ? 0.8 : 0}
              style={{
                transition: `opacity 0.3s ease-out ${0.8 + i * 0.1}s`,
              }}
            >
              {animated && (
                <animate
                  attributeName="r"
                  values="2;3;2"
                  dur={`${1.5 + i * 0.2}s`}
                  repeatCount="indefinite"
                />
              )}
            </circle>
          ))}

          {/* Center Orb */}
          <circle
            cx="50"
            cy="50"
            r={isHovered ? 10 : 8}
            fill={colors.primary}
            style={{ transition: 'r 0.3s ease' }}
          >
            {animated && (
              <animate
                attributeName="opacity"
                values="1;0.7;1"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
          </circle>

          {/* Orbiting Particles */}
          {animated && isLoaded && (
            <>
              <circle cx="50" cy="50" r="2" fill={colors.accent}>
                <animateMotion
                  path="M0,0 a25,25 0 1,0 0.01,0"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="50" cy="50" r="1.5" fill={colors.accent} opacity="0.6">
                <animateMotion
                  path="M0,0 a20,20 0 1,1 0.01,0"
                  dur="2.5s"
                  repeatCount="indefinite"
                />
              </circle>
            </>
          )}
        </svg>

        {/* Pulse Ring on Hover */}
        {interactive && isHovered && (
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
              animationDuration: '1.5s',
            }}
          />
        )}
      </div>

      {/* Text Section */}
      <div className="flex flex-col">
        <div 
          className="font-bold tracking-tight flex items-baseline"
          style={{ 
            fontSize: config.text,
            lineHeight: 1,
            color: colors.text,
          }}
        >
          <span
            className={animated && isLoaded ? 'animate-fade-in-letter' : ''}
            style={{
              opacity: isLoaded ? 1 : 0,
              transform: `translateY(${isLoaded ? 0 : 10}px)`,
              transition: 'all 0.4s ease-out 0.2s',
              display: 'inline-block',
              background: variant === 'gradient' || variant === 'holographic' ? 'linear-gradient(135deg, #0d9488 0%, #10b981 50%, #059669 100%)' : 'none',
              WebkitBackgroundClip: variant === 'gradient' || variant === 'holographic' ? 'text' : 'unset',
              WebkitTextFillColor: variant === 'gradient' || variant === 'holographic' ? 'transparent' : 'inherit',
              backgroundClip: variant === 'gradient' || variant === 'holographic' ? 'text' : 'unset',
            }}
          >
            ISLA
          </span>
          <span
            style={{
              opacity: isLoaded ? 1 : 0,
              transform: `translateY(${isLoaded ? 0 : 10}px)`,
              transition: 'all 0.4s ease-out 0.4s',
              display: 'inline-block',
              color: variant === 'neon' ? '#22d3ee' : variant === 'holographic' ? '#a855f7' : colors.accent,
            }}
          >
            KAYD
          </span>
        </div>
        
        {showTagline && (
          <span
            className="tracking-widest uppercase"
            style={{
              fontSize: config.tagline,
              color: variant === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(107,114,128,0.8)',
              marginTop: config.spacing / 4,
              opacity: isLoaded ? 1 : 0,
              transform: `translateY(${isLoaded ? 0 : 5}px)`,
              transition: 'all 0.5s ease-out 0.6s',
              letterSpacing: '0.15em',
            }}
          >
            Future of Rentals
          </span>
        )}
      </div>

      {/* Ambient Glow Background for Neon variant */}
      {variant === 'neon' && animated && (
        <div
          className="absolute -inset-4 -z-10 blur-xl opacity-20"
          style={{
            background: 'linear-gradient(135deg, #06b6d4, #0ea5e9, #06b6d4)',
            animation: 'pulse 2s infinite',
          }}
        />
      )}

      <style>{`
        @keyframes draw-hexagon {
          from { stroke-dashoffset: 300; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes fade-in-letter {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
