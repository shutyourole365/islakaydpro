import { ReactNode } from 'react';
import {
  Search,
  Package,
  Heart,
  Calendar,
  MessageSquare,
  Bell,
  MapPin,
  FileX,
  WifiOff,
  AlertTriangle,
  LucideIcon,
} from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function EmptyState({
  icon: Icon = Package,
  title,
  description,
  action,
  secondaryAction,
  children,
  size = 'md',
}: EmptyStateProps) {
  const sizes = {
    sm: {
      icon: 'w-12 h-12',
      iconWrapper: 'w-16 h-16',
      title: 'text-lg',
      description: 'text-sm',
      padding: 'py-8',
    },
    md: {
      icon: 'w-16 h-16',
      iconWrapper: 'w-24 h-24',
      title: 'text-xl',
      description: 'text-base',
      padding: 'py-12',
    },
    lg: {
      icon: 'w-20 h-20',
      iconWrapper: 'w-32 h-32',
      title: 'text-2xl',
      description: 'text-lg',
      padding: 'py-16',
    },
  };

  const s = sizes[size];

  return (
    <div className={`flex flex-col items-center justify-center text-center ${s.padding}`}>
      <div className={`${s.iconWrapper} bg-gray-100 rounded-full flex items-center justify-center mb-6`}>
        <Icon className={`${s.icon} text-gray-400`} />
      </div>
      <h3 className={`font-semibold text-gray-900 mb-2 ${s.title}`}>{title}</h3>
      {description && (
        <p className={`text-gray-600 mb-6 max-w-md ${s.description}`}>{description}</p>
      )}
      {children && <div className="mb-6">{children}</div>}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <Button onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Pre-built empty states for common scenarios

export function NoSearchResults({ query, onClear }: { query?: string; onClear?: () => void }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={query ? `We couldn't find anything matching "${query}". Try adjusting your search or filters.` : 'Try adjusting your search or filters to find what you\'re looking for.'}
      action={onClear ? { label: 'Clear Search', onClick: onClear } : undefined}
    />
  );
}

export function NoEquipment({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={Package}
      title="No equipment yet"
      description="Start earning money by listing your equipment. It's free to list and you set your own prices."
      action={onAdd ? { label: 'List Equipment', onClick: onAdd } : undefined}
    />
  );
}

export function NoFavorites({ onBrowse }: { onBrowse?: () => void }) {
  return (
    <EmptyState
      icon={Heart}
      title="No saved items"
      description="Save equipment you're interested in to easily find them later."
      action={onBrowse ? { label: 'Browse Equipment', onClick: onBrowse } : undefined}
    />
  );
}

export function NoBookings({ onBrowse }: { onBrowse?: () => void }) {
  return (
    <EmptyState
      icon={Calendar}
      title="No bookings yet"
      description="Start renting equipment to see your bookings here."
      action={onBrowse ? { label: 'Browse Equipment', onClick: onBrowse } : undefined}
    />
  );
}

export function NoMessages({ onStartChat }: { onStartChat?: () => void }) {
  return (
    <EmptyState
      icon={MessageSquare}
      title="No messages"
      description="When you contact equipment owners or receive inquiries, your conversations will appear here."
      action={onStartChat ? { label: 'Start a Conversation', onClick: onStartChat } : undefined}
    />
  );
}

export function NoNotifications() {
  return (
    <EmptyState
      icon={Bell}
      title="No notifications"
      description="You're all caught up! We'll notify you when something important happens."
    />
  );
}

export function NoLocationAccess({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon={MapPin}
      title="Location access denied"
      description="Enable location access to see equipment near you. You can also search by entering a location manually."
      action={onRetry ? { label: 'Enable Location', onClick: onRetry } : undefined}
    />
  );
}

export function FileNotFound({ onGoBack }: { onGoBack?: () => void }) {
  return (
    <EmptyState
      icon={FileX}
      title="Page not found"
      description="The page you're looking for doesn't exist or has been moved."
      action={onGoBack ? { label: 'Go Back', onClick: onGoBack } : undefined}
    />
  );
}

export function OfflineState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon={WifiOff}
      title="You're offline"
      description="Check your internet connection and try again."
      action={onRetry ? { label: 'Retry', onClick: onRetry } : undefined}
    />
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <EmptyState
      icon={AlertTriangle}
      title="Something went wrong"
      description={message || "We couldn't load this content. Please try again."}
      action={onRetry ? { label: 'Try Again', onClick: onRetry } : undefined}
    />
  );
}
