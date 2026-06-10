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
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-teal-50 text-teal-700',
    secondary: 'bg-gray-900 text-white',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    info: 'bg-blue-50 text-blue-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}
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
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm ${sizes[size]}`}>
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
