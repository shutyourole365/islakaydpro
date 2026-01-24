import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface LogoMorphingProps {
  variant?: 'cosmic' | 'ocean' | 'aurora' | 'fire' | 'crystal';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  animated?: boolean;
  showTagline?: boolean;
  interactive?: boolean;
  morphSpeed?: 'slow' | 'medium' | 'fast';
  particleCount?: number;
  onClick?: () => void;
  className?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  angle: number;
  opacity: number;
  hue: number;
}

export default function LogoMorphing({
  variant = 'cosmic',
  size = 'md',
  animated = true,
  showTagline = false,
  interactive = true,
  morphSpeed = 'medium',
  particleCount = 20,
  onClick,
  className = '',
}: LogoMorphingProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [morphPhase, setMorphPhase] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  const sizeConfig = {
    xs: { logo: 32, text: 14, spacing: 6, tagline: 8, particle: 2 },
    sm: { logo: 44, text: 18, spacing: 8, tagline: 10, particle: 3 },
    md: { logo: 56, text: 24, spacing: 10, tagline: 12, particle: 4 },
    lg: { logo: 72, text: 32, spacing: 12, tagline: 14, particle: 5 },
    xl: { logo: 88, text: 40, spacing: 14, tagline: 16, particle: 6 },
    '2xl': { logo: 112, text: 52, spacing: 18, tagline: 20, particle: 8 },
  };

  const config = sizeConfig[size];

  const speedMultiplier = useMemo(() => ({
    slow: 0.5,
    medium: 1,
    fast: 2,
  }), []);

  const colorSchemes = {
    cosmic: {
      primary: ['#8b5cf6', '#6366f1', '#3b82f6'],
      secondary: ['#c084fc', '#818cf8', '#60a5fa'],
      glow: 'rgba(139, 92, 246, 0.6)',
      particles: [280, 240, 220],
      text: 'from-violet-400 via-indigo-400 to-blue-400',
    },
    ocean: {
      primary: ['#06b6d4', '#0891b2', '#0284c7'],
      secondary: ['#22d3ee', '#06b6d4', '#0ea5e9'],
      glow: 'rgba(6, 182, 212, 0.6)',
      particles: [180, 190, 200],
      text: 'from-cyan-400 via-teal-400 to-blue-400',
    },
    aurora: {
      primary: ['#10b981', '#14b8a6', '#06b6d4'],
      secondary: ['#34d399', '#2dd4bf', '#22d3ee'],
      glow: 'rgba(16, 185, 129, 0.6)',
      particles: [150, 170, 180],
      text: 'from-emerald-400 via-teal-400 to-cyan-400',
    },
    fire: {
      primary: ['#f97316', '#ef4444', '#dc2626'],
      secondary: ['#fb923c', '#f87171', '#ef4444'],
      glow: 'rgba(249, 115, 22, 0.6)',
      particles: [20, 30, 40],
      text: 'from-orange-400 via-red-400 to-rose-400',
    },
    crystal: {
      primary: ['#f0abfc', '#e879f9', '#d946ef'],
      secondary: ['#f5d0fe', '#f0abfc', '#e879f9'],
      glow: 'rgba(232, 121, 249, 0.6)',
      particles: [290, 300, 310],
      text: 'from-pink-400 via-fuchsia-400 to-purple-400',
    },
  };

  const colors = colorSchemes[variant];

  // Initialize particles
  useEffect(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * config.particle + 1,
        speed: Math.random() * 0.5 + 0.2,
        angle: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.6 + 0.2,
        hue: colors.particles[Math.floor(Math.random() * colors.particles.length)],
      });
    }
    setParticles(newParticles);
  }, [particleCount, config.particle, colors.particles]);

  // Animation loop
  const animate = useCallback(() => {
    timeRef.current += 0.016 * speedMultiplier[morphSpeed];
    
    setMorphPhase(Math.sin(timeRef.current * 0.5) * 0.5 + 0.5);
    
    setParticles(prev => prev.map(p => ({
      ...p,
      x: (p.x + Math.cos(p.angle) * p.speed + 100) % 100,
      y: (p.y + Math.sin(p.angle) * p.speed + 100) % 100,
      angle: p.angle + 0.01,
      opacity: 0.2 + Math.sin(timeRef.current + p.id) * 0.3,
    })));

    if (animated) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [animated, morphSpeed, speedMultiplier]);

  useEffect(() => {
    setIsLoaded(true);
    if (animated) {
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animated, animate]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePosition({ x: x - 0.5, y: y - 0.5 });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  // Generate morphing SVG paths
  const generateMorphPath = (phase: number) => {
    const cx = 50;
    const cy = 50;
    const points = 6;
    const innerRadius = 20 + phase * 5;
    const outerRadius = 35 + Math.sin(phase * Math.PI * 2) * 5;
    
    let path = '';
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const warp = Math.sin(phase * Math.PI * 2 + i * 0.5) * 3;
      const x = cx + (radius + warp) * Math.cos(angle);
      const y = cy + (radius + warp) * Math.sin(angle);
      path += i === 0 ? `M ${x} ${y}` : ` Q ${cx + radius * 0.3 * Math.cos(angle - 0.3)} ${cy + radius * 0.3 * Math.sin(angle - 0.3)} ${x} ${y}`;
    }
    return path + ' Z';
  };

  // Generate liquid blob path
  const generateLiquidPath = (phase: number) => {
    const points = 8;
    const baseRadius = 30;
    let path = '';
    
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const wave1 = Math.sin(angle * 3 + phase * Math.PI * 4) * 8;
      const wave2 = Math.cos(angle * 2 + phase * Math.PI * 2) * 5;
      const radius = baseRadius + wave1 + wave2;
      const x = 50 + radius * Math.cos(angle);
      const y = 50 + radius * Math.sin(angle);
      
      if (i === 0) {
        path = `M ${x} ${y}`;
      } else {
        const prevAngle = ((i - 1) / points) * Math.PI * 2;
        const cpAngle = (angle + prevAngle) / 2;
        const cpRadius = baseRadius + Math.sin(cpAngle * 4 + phase * Math.PI * 3) * 10;
        const cpX = 50 + cpRadius * Math.cos(cpAngle);
        const cpY = 50 + cpRadius * Math.sin(cpAngle);
        path += ` Q ${cpX} ${cpY} ${x} ${y}`;
      }
    }
    return path;
  };

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`inline-flex items-center gap-${Math.round(config.spacing / 4)} select-none ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      style={{
        transform: interactive ? `perspective(1000px) rotateX(${mousePosition.y * -10}deg) rotateY(${mousePosition.x * 10}deg)` : undefined,
        transition: 'transform 0.1s ease-out',
      }}
    >
      {/* Logo Mark */}
      <div
        className="relative flex items-center justify-center"
        style={{
          width: config.logo,
          height: config.logo,
          filter: isHovered ? `drop-shadow(0 0 ${config.logo / 3}px ${colors.glow})` : `drop-shadow(0 0 ${config.logo / 6}px ${colors.glow})`,
          transition: 'filter 0.3s ease',
        }}
      >
        {/* Particle field */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full overflow-visible"
          style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.5s ease' }}
        >
          {particles.map(particle => (
            <circle
              key={particle.id}
              cx={particle.x}
              cy={particle.y}
              r={particle.size}
              fill={`hsla(${particle.hue}, 80%, 60%, ${particle.opacity})`}
              style={{
                filter: 'blur(0.5px)',
              }}
            />
          ))}
        </svg>

        {/* Main morphing logo */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: `scale(${isHovered ? 1.1 : 1})`,
            transition: 'opacity 0.5s ease, transform 0.3s ease',
          }}
        >
          <defs>
            {/* Animated gradient */}
            <linearGradient id={`morph-gradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.primary[0]}>
                <animate
                  attributeName="stop-color"
                  values={`${colors.primary[0]};${colors.primary[1]};${colors.primary[2]};${colors.primary[0]}`}
                  dur={`${3 / speedMultiplier[morphSpeed]}s`}
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="50%" stopColor={colors.primary[1]}>
                <animate
                  attributeName="stop-color"
                  values={`${colors.primary[1]};${colors.primary[2]};${colors.primary[0]};${colors.primary[1]}`}
                  dur={`${3 / speedMultiplier[morphSpeed]}s`}
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor={colors.primary[2]}>
                <animate
                  attributeName="stop-color"
                  values={`${colors.primary[2]};${colors.primary[0]};${colors.primary[1]};${colors.primary[2]}`}
                  dur={`${3 / speedMultiplier[morphSpeed]}s`}
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>

            {/* Secondary gradient */}
            <radialGradient id={`morph-radial-${variant}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={colors.secondary[0]} stopOpacity="0.8" />
              <stop offset="100%" stopColor={colors.secondary[2]} stopOpacity="0.2" />
            </radialGradient>

            {/* Glow filter */}
            <filter id={`morph-glow-${variant}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Turbulence for organic effect */}
            <filter id={`morph-turbulence-${variant}`}>
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.01"
                numOctaves="3"
                result="noise"
              >
                <animate
                  attributeName="baseFrequency"
                  values="0.01;0.02;0.01"
                  dur={`${5 / speedMultiplier[morphSpeed]}s`}
                  repeatCount="indefinite"
                />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" />
            </filter>
          </defs>

          {/* Background glow */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill={`url(#morph-radial-${variant})`}
            opacity={0.3 + morphPhase * 0.2}
          />

          {/* Outer liquid ring */}
          <path
            d={generateLiquidPath(morphPhase)}
            fill="none"
            stroke={`url(#morph-gradient-${variant})`}
            strokeWidth="2"
            opacity="0.5"
            filter={`url(#morph-glow-${variant})`}
          />

          {/* Main morphing shape */}
          <path
            d={generateMorphPath(morphPhase)}
            fill={`url(#morph-gradient-${variant})`}
            filter={`url(#morph-glow-${variant})`}
          />

          {/* Inner detail */}
          <path
            d={generateMorphPath(morphPhase + 0.5)}
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1"
            transform="scale(0.6) translate(33, 33)"
          />

          {/* Center "I" letter */}
          <g transform="translate(50, 50)">
            <text
              x="0"
              y="0"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="24"
              fontWeight="900"
              fontFamily="Inter, system-ui, sans-serif"
              fill="white"
              style={{
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              }}
            >
              I
            </text>
          </g>

          {/* Orbiting dots */}
          {[0, 1, 2].map(i => {
            const orbitAngle = (morphPhase * Math.PI * 2) + (i * Math.PI * 2 / 3);
            const orbitRadius = 38;
            const x = 50 + orbitRadius * Math.cos(orbitAngle);
            const y = 50 + orbitRadius * Math.sin(orbitAngle);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3"
                fill={colors.secondary[i]}
                opacity={0.8}
              >
                <animate
                  attributeName="r"
                  values="2;4;2"
                  dur={`${1.5 / speedMultiplier[morphSpeed]}s`}
                  begin={`${i * 0.5}s`}
                  repeatCount="indefinite"
                />
              </circle>
            );
          })}
        </svg>

        {/* Pulse rings on hover */}
        {isHovered && animated && (
          <>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="absolute inset-0 rounded-full border-2"
                style={{
                  borderColor: colors.glow,
                  animation: `ping ${1.5 + i * 0.3}s cubic-bezier(0, 0, 0.2, 1) infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <span
          className={`font-black tracking-tight bg-gradient-to-r ${colors.text} bg-clip-text text-transparent`}
          style={{
            fontSize: config.text,
            lineHeight: 1,
            textShadow: isHovered ? `0 0 20px ${colors.glow}` : 'none',
            transition: 'text-shadow 0.3s ease',
          }}
        >
          islakayd
        </span>
        
        {showTagline && (
          <span
            className="text-gray-400 font-medium tracking-wide mt-1"
            style={{ fontSize: config.tagline }}
          >
            Rent Anything
          </span>
        )}
      </div>

      {/* Keyframes for pulse animation */}
      <style>{`
        @keyframes ping {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          75%, 100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
