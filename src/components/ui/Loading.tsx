import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

export function LoadingSpinner({ size = 'md', color = 'primary', className = '' }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colors = {
    primary: 'text-teal-500',
    white: 'text-white',
    gray: 'text-gray-400',
  };

  return (
    <Loader2 className={`animate-spin ${sizes[size]} ${colors[color]} ${className}`} />
  );
}

interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'gray';
}

export function LoadingDots({ size = 'md', color = 'primary' }: LoadingDotsProps) {
  const sizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const colors = {
    primary: 'bg-teal-500',
    gray: 'bg-gray-400',
  };

  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${sizes[size]} ${colors[color]} rounded-full animate-bounce`}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

interface LoadingBarProps {
  progress?: number;
  indeterminate?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingBar({
  progress = 0,
  indeterminate = false,
  color = 'primary',
  size = 'md',
}: LoadingBarProps) {
  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colors = {
    primary: 'bg-teal-500',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
  };

  return (
    <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizes[size]}`}>
      {indeterminate ? (
        <div
          className={`h-full ${colors[color]} rounded-full animate-pulse`}
          style={{
            animation: 'shimmer 1.5s infinite',
            backgroundSize: '200% 100%',
            backgroundImage: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)`,
          }}
        />
      ) : (
        <div
          className={`h-full ${colors[color]} rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      )}
    </div>
  );
}

interface LoadingOverlayProps {
  message?: string;
  transparent?: boolean;
}

export function LoadingOverlay({ message = 'Loading...', transparent = false }: LoadingOverlayProps) {
  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center z-50 ${
        transparent ? 'bg-white/50' : 'bg-white'
      }`}
    >
      <LoadingSpinner size="xl" />
      {message && <p className="mt-4 text-gray-600 font-medium">{message}</p>}
    </div>
  );
}

interface LoadingPageProps {
  message?: string;
}

export function LoadingPage({ message = 'Loading...' }: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <LoadingSpinner size="xl" />
      <p className="mt-4 text-gray-600 font-medium">{message}</p>
    </div>
  );
}

interface LoadingButtonProps {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export function LoadingButton({
  loading = false,
  loadingText = 'Loading...',
  children,
  className = '',
  disabled = false,
  onClick,
}: LoadingButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`relative inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading && <LoadingSpinner size="sm" color="white" />}
      <span>{loading ? loadingText : children}</span>
    </button>
  );
}

interface LoadingCardProps {
  rows?: number;
}

export function LoadingCard({ rows = 3 }: LoadingCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`h-3 bg-gray-200 rounded ${i === rows - 1 ? 'w-1/2' : 'w-full'} ${
            i < rows - 1 ? 'mb-3' : ''
          }`}
        />
      ))}
    </div>
  );
}

interface LoadingImageProps {
  aspectRatio?: 'square' | 'video' | 'wide' | 'portrait';
  rounded?: boolean;
}

export function LoadingImage({ aspectRatio = 'video', rounded = true }: LoadingImageProps) {
  const aspects = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
    portrait: 'aspect-[3/4]',
  };

  return (
    <div
      className={`${aspects[aspectRatio]} bg-gray-200 animate-pulse ${
        rounded ? 'rounded-xl' : ''
      }`}
    />
  );
}

// Skeleton variants for specific use cases
export function LoadingEquipmentCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="h-6 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export function LoadingEquipmentGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingEquipmentCard key={i} />
      ))}
    </div>
  );
}

export function LoadingListItem() {
  return (
    <div className="flex items-center gap-4 p-4 animate-pulse">
      <div className="w-12 h-12 bg-gray-200 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
  );
}

export function LoadingList({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y divide-gray-100">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingListItem key={i} />
      ))}
    </div>
  );
}

export function LoadingText({ lines = 3, lastLineWidth = '50%' }: { lines?: number; lastLineWidth?: string }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 rounded"
          style={{ width: i === lines - 1 ? lastLineWidth : '100%' }}
        />
      ))}
    </div>
  );
}
