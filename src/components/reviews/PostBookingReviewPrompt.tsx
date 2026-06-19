/**
 * PostBookingReviewPrompt
 * Auto-triggered modal shown to renters after a booking is marked complete.
 * Prompts with a star rating, optional comment, and dismisses gracefully.
 */
import { useState, useEffect } from 'react';
import { Star, X, MessageSquare, ThumbsUp } from 'lucide-react';
import type { Equipment } from '../../types';

interface PostBookingReviewPromptProps {
  equipment: Equipment;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  onDismiss: () => void;
}

export default function PostBookingReviewPrompt({
  equipment,
  onSubmit,
  onDismiss,
}: PostBookingReviewPromptProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Auto-dismiss after success
  useEffect(() => {
    if (submitted) {
      const t = setTimeout(onDismiss, 2500);
      return () => clearTimeout(t);
    }
  }, [submitted, onDismiss]);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      await onSubmit(rating, comment.trim());
      setSubmitted(true);
    } catch {
      // parent handles toast
    } finally {
      setSubmitting(false);
    }
  };

  const starLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];
  const activeRating = hovered || rating;

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ThumbsUp className="w-8 h-8 text-teal-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Thanks for your review!</h3>
          <p className="text-gray-500 text-sm">Your feedback helps the community 🙌</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onDismiss} />
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full">
        {/* Close */}
        <button
          onClick={onDismiss}
          aria-label="Dismiss review prompt"
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Star className="w-7 h-7 text-amber-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">How was your rental?</h3>
          <p className="text-gray-500 text-sm mt-1">
            Your rental of <span className="font-medium text-gray-700">{equipment.title}</span> is complete
          </p>
        </div>

        {/* Star rating */}
        <div className="flex justify-center gap-2 mb-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => setRating(s)}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              aria-label={`Rate ${s} stars`}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-10 h-10 transition-colors ${
                  s <= activeRating
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-200 fill-gray-200'
                }`}
              />
            </button>
          ))}
        </div>
        {activeRating > 0 && (
          <p className="text-center text-sm text-amber-600 font-medium mb-4">
            {starLabels[activeRating]}
          </p>
        )}

        {/* Comment */}
        <div className="mb-5">
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details about your experience (optional)"
              rows={3}
              maxLength={500}
              className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>
          <p className="text-right text-xs text-gray-400 mt-1">{comment.length}/500</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Not now
          </button>
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className="flex-1 px-4 py-3 bg-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Star className="w-4 h-4 fill-current" />
                Submit Review
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
