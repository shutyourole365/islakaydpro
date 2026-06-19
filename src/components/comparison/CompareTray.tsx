import { X, Scale, ArrowRight } from 'lucide-react';
import type { Equipment } from '../../types';

const FALLBACK_IMAGE =
  'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=200';

interface CompareTrayProps {
  items: Equipment[];
  /** Max comparable items (matches the handler cap in App). */
  max?: number;
  onRemove: (equipmentId: string) => void;
  onClear: () => void;
  onCompare: () => void;
}

/**
 * Persistent bottom tray that shows the equipment queued for comparison.
 * Displays each item's thumbnail with a quick-remove, a clear-all, and a
 * primary "Compare" action that opens the full comparison view. Fully themed
 * for light and dark mode. Renders nothing when the queue is empty.
 */
export default function CompareTray({ items, max = 4, onRemove, onClear, onCompare }: CompareTrayProps) {
  if (items.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:px-6 pointer-events-none">
      <div className="pointer-events-auto max-w-3xl mx-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl shadow-brand-lg p-3 sm:p-4 animate-fade-in-up">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white">
              <Scale className="w-4 h-4" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Compare equipment</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {items.length} of {max} selected
              </p>
            </div>
          </div>
          <button
            onClick={onClear}
            className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            Clear all
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
                title={item.title}
              >
                <img src={item.images?.[0] || FALLBACK_IMAGE} alt={item.title} className="w-full h-full object-cover" />
                <button
                  onClick={() => onRemove(item.id)}
                  aria-label={`Remove ${item.title} from comparison`}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {Array.from({ length: Math.max(0, max - items.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex-shrink-0 w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700"
                aria-hidden="true"
              />
            ))}
          </div>

          <button
            onClick={onCompare}
            disabled={items.length < 2}
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 bg-[length:200%_auto] hover:bg-[position:right_center] shadow-brand transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[position:left_center]"
          >
            Compare
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {items.length < 2 && (
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 text-center">
            Add at least one more item to compare.
          </p>
        )}
      </div>
    </div>
  );
}
