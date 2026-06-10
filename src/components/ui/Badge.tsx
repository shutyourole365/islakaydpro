import { Star, Shield, MapPin, Clock } from 'lucide-react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = '',
}: BadgeProps) {
  const variants = {
    default: 'bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600/50',
    primary: 'bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/40 dark:to-cyan-900/40 text-teal-700 dark:text-teal-300 border border-teal-200/50 dark:border-teal-700/50',
    secondary: 'bg-gradient-to-r from-gray-900 to-gray-800 text-white border border-gray-700/50',
    success: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40 text-green-700 dark:text-green-300 border border-green-200/50 dark:border-green-700/50',
    warning: 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/40 dark:to-orange-900/40 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-700/50',
    danger: 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/40 dark:to-pink-900/40 text-red-700 dark:text-red-300 border border-red-200/50 dark:border-red-700/50',
    info: 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50',
  };

  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3.5 py-1.5 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-300 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}

export function RatingBadge({ rating, reviews, size = 'md' }: { rating: number; reviews?: number; size?: 'sm' | 'md' }) {
  const sizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md border border-white/40 shadow-lg ${sizes[size]}`}>
      <Star className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-amber-500 fill-amber-500`} />
      <span className="font-semibold text-gray-900">{rating.toFixed(1)}</span>
      {reviews !== undefined && (
        <span className="text-gray-500">({reviews})</span>
      )}
    </span>
  );
}

export function VerifiedBadge({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <Badge variant="primary" size={size} icon={<Shield className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />}>
      Verified
    </Badge>
  );
}

export function FeaturedBadge({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <Badge variant="warning" size={size} icon={<Star className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} fill-amber-500`} />}>
      Featured
    </Badge>
  );
}

export function LocationBadge({ location, size = 'md' }: { location: string; size?: 'sm' | 'md' }) {
  return (
    <Badge variant="default" size={size} icon={<MapPin className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />}>
      {location}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: 'available' | 'rented' | 'maintenance' | 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' }) {
  const statusConfig = {
    available: { variant: 'success' as const, label: 'Available' },
    rented: { variant: 'info' as const, label: 'Rented' },
    maintenance: { variant: 'warning' as const, label: 'Maintenance' },
    pending: { variant: 'warning' as const, label: 'Pending' },
    confirmed: { variant: 'success' as const, label: 'Confirmed' },
    active: { variant: 'info' as const, label: 'Active' },
    completed: { variant: 'default' as const, label: 'Completed' },
    cancelled: { variant: 'danger' as const, label: 'Cancelled' },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}

export function DurationBadge({ minDays, maxDays, size = 'md' }: { minDays: number; maxDays: number; size?: 'sm' | 'md' }) {
  return (
    <Badge variant="default" size={size} icon={<Clock className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />}>
      {minDays}-{maxDays} days
    </Badge>
  );
}

export function ConditionBadge({ condition, size = 'md' }: { condition: string; size?: 'sm' | 'md' }) {
  const conditionVariants: Record<string, 'success' | 'warning' | 'default'> = {
    excellent: 'success',
    good: 'success',
    fair: 'warning',
    poor: 'default',
  };

  return (
    <Badge variant={conditionVariants[condition] || 'default'} size={size} className="capitalize">
      {condition}
    </Badge>
  );
}
