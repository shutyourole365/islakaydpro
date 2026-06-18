import { Sparkles, X, ArrowRight } from 'lucide-react';

interface AnnouncementBarProps {
  onAction?: () => void;
  onDismiss: () => void;
  message?: string;
  actionLabel?: string;
}

/**
 * Slim, dismissible promotional bar shown at the very top of the home page.
 * Visibility is controlled by the parent (persisted in localStorage) so the
 * fixed header can offset itself by the bar's height.
 */
export default function AnnouncementBar({
  onAction,
  onDismiss,
  message = 'New: browse 12+ equipment categories with instant booking & $50K damage protection.',
  actionLabel = 'Explore now',
}: AnnouncementBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-10 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-[length:200%_auto] animate-gradient text-white">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-3 text-sm">
        <Sparkles className="w-4 h-4 flex-shrink-0 hidden sm:block" />
        <p className="truncate font-medium">
          <span className="hidden sm:inline">{message}</span>
          <span className="sm:hidden">12+ categories · instant booking · $50K protection</span>
        </p>
        {onAction && (
          <button
            onClick={onAction}
            className="hidden sm:inline-flex items-center gap-1 font-semibold underline-offset-2 hover:underline whitespace-nowrap"
          >
            {actionLabel}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={onDismiss}
          aria-label="Dismiss announcement"
          className="absolute right-3 sm:right-5 p-1 rounded-full hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
