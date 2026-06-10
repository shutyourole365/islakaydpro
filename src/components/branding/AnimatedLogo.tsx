import { useState, useEffect } from 'react';

interface AnimatedLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animated?: boolean;
  variant?: 'default' | 'white' | 'gradient';
}

export default function AnimatedLogo({ 
  size = 'md', 
  showText = true, 
  animated = true,
  variant = 'default'
}: AnimatedLogoProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);

  // Subtle pulse animation every few seconds
  useEffect(() => {
    if (!animated) return;
    
    const interval = setInterval(() => {
      setPulseActive(true);
      setTimeout(() => setPulseActive(false), 1000);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [animated]);

  const sizeClasses = {
    sm: { icon: 'w-8 h-8', text: 'text-lg' },
    md: { icon: 'w-10 h-10', text: 'text-xl' },
    lg: { icon: 'w-14 h-14', text: 'text-2xl' },
    xl: { icon: 'w-20 h-20', text: 'text-4xl' },
  };

  const textColors = {
    default: 'text-gray-900',
    white: 'text-white',
    gradient: 'bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-600 bg-clip-text text-transparent',
  };

  const iconColors = {
    default: { primary: '#0D9488', secondary: '#14B8A6', accent: '#F59E0B' },
    white: { primary: '#FFFFFF', secondary: '#E5E7EB', accent: '#FBBF24' },
    gradient: { primary: '#0D9488', secondary: '#06B6D4', accent: '#F59E0B' },
  };

  const colors = iconColors[variant];

  return (
    <div 
      className="flex items-center gap-3 cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Icon */}
      <div className={`relative ${sizeClasses[size].icon}`}>
        {/* Outer glow effect */}
        <div 
          className={`absolute inset-0 bg-teal-400 rounded-xl blur-xl transition-opacity duration-500 ${
            isHovered || pulseActive ? 'opacity-40' : 'opacity-0'
          }`}
        />
        
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`relative w-full h-full transition-transform duration-500 ${
            isHovered ? 'scale-110' : ''
          } ${pulseActive ? 'animate-pulse' : ''}`}
        >
          {/* Background shape with gradient */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.primary} />
              <stop offset="100%" stopColor={colors.secondary} />
            </linearGradient>
            <linearGradient id="shineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.3" />
              <stop offset="50%" stopColor="white" stopOpacity="0" />
              <stop offset="100%" stopColor="white" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          {/* Main rounded square background */}
          <rect
            x="4"
            y="4"
            width="56"
            height="56"
            rx="16"
            fill="url(#logoGradient)"
            className={`transition-all duration-300 ${isHovered ? 'filter drop-shadow-lg' : ''}`}
          />
          
          {/* Shine overlay */}
          <rect
            x="4"
            y="4"
            width="56"
            height="56"
            rx="16"
            fill="url(#shineGradient)"
          />
          
          {/* Equipment/Key icon - stylized "I" with gear elements */}
          <g className={`transition-transform duration-500 origin-center ${isHovered ? 'rotate-12' : ''}`}>
            {/* Central key/tool shape */}
            <path
              d="M32 14C35.866 14 39 17.134 39 21C39 23.76 37.4 26.14 35.08 27.26L35.08 42C35.08 43.7 33.7 45.08 32 45.08C30.3 45.08 28.92 43.7 28.92 42L28.92 27.26C26.6 26.14 25 23.76 25 21C25 17.134 28.134 14 32 14Z"
              fill="white"
              className={`transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-95'}`}
            />
            
            {/* Key teeth */}
            <rect x="28" y="38" width="8" height="3" rx="1" fill="white" opacity="0.9" />
            <rect x="28" y="44" width="8" height="3" rx="1" fill="white" opacity="0.9" />
            
            {/* Gear cog elements around the key head */}
            <circle cx="32" cy="21" r="4" fill={colors.primary} />
            <circle cx="32" cy="21" r="2" fill="white" />
            
            {/* Rotating gear teeth */}
            <g className={`origin-center transition-transform duration-1000 ${animated && isHovered ? 'animate-spin' : ''}`} style={{ transformOrigin: '32px 21px' }}>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <rect
                  key={i}
                  x="31"
                  y="12"
                  width="2"
                  height="4"
                  rx="1"
                  fill="white"
                  opacity="0.8"
                  transform={`rotate(${angle} 32 21)`}
                />
              ))}
            </g>
          </g>
          
          {/* Accent dot */}
          <circle
            cx="48"
            cy="48"
            r="4"
            fill={colors.accent}
            className={`transition-all duration-300 ${isHovered ? 'animate-ping' : ''}`}
          />
          <circle cx="48" cy="48" r="4" fill={colors.accent} />
        </svg>
      </div>

      {/* Animated Text */}
      {showText && (
        <div className="flex flex-col">
          <span 
            className={`font-bold tracking-tight ${sizeClasses[size].text} ${textColors[variant]} transition-all duration-300 ${
              isHovered ? 'tracking-wide' : ''
            }`}
          >
            <span className="inline-block transition-transform duration-300" style={{ transitionDelay: '0ms' }}>I</span>
            <span className="inline-block transition-transform duration-300" style={{ transitionDelay: '20ms' }}>s</span>
            <span className="inline-block transition-transform duration-300" style={{ transitionDelay: '40ms' }}>l</span>
            <span className="inline-block transition-transform duration-300" style={{ transitionDelay: '60ms' }}>a</span>
            <span className={`inline-block transition-all duration-300 ${isHovered ? 'text-teal-500' : ''}`} style={{ transitionDelay: '80ms' }}>k</span>
            <span className="inline-block transition-transform duration-300" style={{ transitionDelay: '100ms' }}>a</span>
            <span className="inline-block transition-transform duration-300" style={{ transitionDelay: '120ms' }}>y</span>
            <span className="inline-block transition-transform duration-300" style={{ transitionDelay: '140ms' }}>d</span>
          </span>
          {size !== 'sm' && (
            <span className={`text-xs tracking-widest uppercase ${
              variant === 'white' ? 'text-gray-300' : 'text-gray-500'
            } transition-all duration-300 ${isHovered ? 'tracking-[0.2em] text-teal-600' : ''}`}>
              Equipment Rental
            </span>
          )}
        </div>
      )}
    </div>
  );
}
