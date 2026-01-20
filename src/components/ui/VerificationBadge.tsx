import { Shield, CheckCircle2, Star, Award, Clock, Zap } from 'lucide-react';

type BadgeType = 'verified' | 'trusted' | 'top-rated' | 'fast-response' | 'superhost' | 'new';

interface VerificationBadgeProps {
  type: BadgeType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const badgeConfig: Record<BadgeType, {
  icon: typeof Shield;
  label: string;
  bgColor: string;
  textColor: string;
  iconColor: string;
}> = {
  verified: {
    icon: Shield,
    label: 'Verified',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    iconColor: 'text-blue-500',
  },
  trusted: {
    icon: CheckCircle2,
    label: 'Trusted',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-700',
    iconColor: 'text-teal-500',
  },
  'top-rated': {
    icon: Star,
    label: 'Top Rated',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    iconColor: 'text-amber-500',
  },
  'fast-response': {
    icon: Zap,
    label: 'Fast Response',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    iconColor: 'text-emerald-500',
  },
  superhost: {
    icon: Award,
    label: 'Superhost',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700',
    iconColor: 'text-rose-500',
  },
  new: {
    icon: Clock,
    label: 'New',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    iconColor: 'text-gray-500',
  },
};

export default function VerificationBadge({
  type,
  size = 'md',
  showLabel = true,
  className = '',
}: VerificationBadgeProps) {
  const config = badgeConfig[type];
  const Icon = config.icon;

  const sizes = {
    sm: {
      container: 'px-2 py-1 gap-1',
      icon: 'w-3 h-3',
      text: 'text-xs',
    },
    md: {
      container: 'px-2.5 py-1.5 gap-1.5',
      icon: 'w-4 h-4',
      text: 'text-sm',
    },
    lg: {
      container: 'px-3 py-2 gap-2',
      icon: 'w-5 h-5',
      text: 'text-base',
    },
  };

  const currentSize = sizes[size];

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${config.bgColor} ${config.textColor}
        ${currentSize.container}
        ${className}
      `}
    >
      <Icon className={`${currentSize.icon} ${config.iconColor}`} />
      {showLabel && <span className={currentSize.text}>{config.label}</span>}
    </span>
  );
}

interface TrustScoreProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TrustScore({
  score,
  maxScore = 100,
  size = 'md',
  className = '',
}: TrustScoreProps) {
  const percentage = (score / maxScore) * 100;

  const getColor = () => {
    if (percentage >= 90) return { bg: 'bg-emerald-500', text: 'text-emerald-600' };
    if (percentage >= 70) return { bg: 'bg-teal-500', text: 'text-teal-600' };
    if (percentage >= 50) return { bg: 'bg-amber-500', text: 'text-amber-600' };
    return { bg: 'bg-red-500', text: 'text-red-600' };
  };

  const colors = getColor();

  const sizes = {
    sm: { container: 'w-24', height: 'h-1.5', text: 'text-xs' },
    md: { container: 'w-32', height: 'h-2', text: 'text-sm' },
    lg: { container: 'w-40', height: 'h-2.5', text: 'text-base' },
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${currentSize.container} ${currentSize.height} bg-gray-200 rounded-full overflow-hidden`}>
        <div
          className={`h-full ${colors.bg} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={`font-semibold ${colors.text} ${currentSize.text}`}>
        {score}
      </span>
    </div>
  );
}
