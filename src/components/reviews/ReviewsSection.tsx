import { useState, useEffect } from 'react';
import { Star, CheckCircle2, MessageSquare, ChevronDown } from 'lucide-react';
import { getReviews, createReview } from '../../services/database';
import type { Review } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface ReviewsSectionProps {
  equipmentId: string;
  bookingId?: string;
  reviewerId?: string;
  revieweeId?: string;
  canReview?: boolean;
  className?: string;
}

function StarRating({
  rating,
  onRate,
  size = 'md',
}: {
  rating: number;
  onRate?: (r: number) => void;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [hover, setHover] = useState(0);
  const sz = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-7 h-7' : 'w-5 h-5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${sz} ${
            s <= (hover || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          } ${onRate ? 'cursor-pointer' : ''} transition-colors`}
          onMouseEnter={() => onRate && setHover(s)}
          onMouseLeave={() => onRate && setHover(0)}
          onClick={() => onRate?.(s)}
        />
      ))}
    </div>
  );
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-6 text-gray-600 text-right">{label}</span>
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div className="bg-yellow-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-gray-500 text-xs">{pct}%</span>
    </div>
  );
}

export default function ReviewsSection({
  equipmentId,
  bookingId,
  reviewerId: _reviewerId,
  revieweeId,
  canReview = false,
  className = '',
}: ReviewsSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent');
  const [visibleCount, setVisibleCount] = useState(5);

  // Form state
  const [formRating, setFormRating] = useState(0);
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formCondition, setFormCondition] = useState(0);
  const [formComm, setFormComm] = useState(0);
  const [formPunctuality, setFormPunctuality] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [equipmentId]);

  async function loadReviews() {
    setLoading(true);
    try {
      const data = await getReviews({ equipmentId, limit: 100 });
      setReviews(data);
    } catch (e) {
      console.error('Failed to load reviews:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!user) { setError('Please log in to leave a review.'); return; }
    if (formRating === 0) { setError('Please select an overall rating.'); return; }
    if (formComment.trim().length < 10) { setError('Please write at least 10 characters.'); return; }

    setSubmitting(true);
    setError('');
    try {
      await createReview({
        booking_id: bookingId || null,
        equipment_id: equipmentId,
        reviewer_id: user.id,
        reviewee_id: revieweeId || null,
        rating: formRating,
        title: formTitle || null,
        comment: formComment,
        is_equipment_review: true,
        equipment_condition: formCondition || undefined,
        communication: formComm || undefined,
        punctuality: formPunctuality || undefined,
      });
      setSuccess(true);
      setShowForm(false);
      await loadReviews();
    } catch (e: unknown) {
      if ((e as {code?: string})?.code === '23505') {
        setError('You have already reviewed this booking.');
      } else {
        setError('Failed to submit review. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Computed stats
  const total = reviews.length;
  const avg = total > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
  const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => { dist[r.rating] = (dist[r.rating] || 0) + 1; });

  const sorted = [...reviews].sort((a, b) =>
    sortBy === 'rating'
      ? b.rating - a.rating
      : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const alreadyReviewed = user && reviews.some((r) => r.reviewer_id === user.id);

  if (loading) {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          Reviews {total > 0 && <span className="text-gray-500 font-normal text-base">({total})</span>}
        </h2>
        {canReview && !alreadyReviewed && !success && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Write a Review
          </button>
        )}
        {success && (
          <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" /> Review submitted!
          </span>
        )}
      </div>

      {/* Rating summary */}
      {total > 0 && (
        <div className="bg-gray-50 rounded-2xl p-5 flex flex-col sm:flex-row gap-6">
          <div className="flex flex-col items-center justify-center min-w-[100px]">
            <span className="text-5xl font-bold text-gray-900">{avg.toFixed(1)}</span>
            <StarRating rating={Math.round(avg)} size="sm" />
            <span className="text-gray-500 text-xs mt-1">{total} review{total !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((s) => (
              <RatingBar key={s} label={`${s}★`} count={dist[s] || 0} total={total} />
            ))}
          </div>
        </div>
      )}

      {/* Review form */}
      {showForm && (
        <div className="border border-blue-200 rounded-2xl p-5 bg-blue-50/50 space-y-4">
          <h3 className="font-semibold text-gray-900">Your Review</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Overall Rating *</label>
            <StarRating rating={formRating} onRate={setFormRating} size="lg" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Condition', val: formCondition, set: setFormCondition },
              { label: 'Communication', val: formComm, set: setFormComm },
              { label: 'Punctuality', val: formPunctuality, set: setFormPunctuality },
            ].map(({ label, val, set }) => (
              <div key={label}>
                <label className="block text-xs text-gray-500 mb-1">{label}</label>
                <StarRating rating={val} onRate={set} size="sm" />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Summarise your experience"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Review *</label>
            <textarea
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
              placeholder="Tell others about your experience with this equipment..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sort controls */}
      {total > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Sort by:</span>
          {(['recent', 'rating'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                sortBy === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 text-gray-600 hover:border-blue-400'
              }`}
            >
              {s === 'recent' ? 'Most Recent' : 'Highest Rated'}
            </button>
          ))}
        </div>
      )}

      {/* Review list */}
      {total === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Star className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No reviews yet</p>
          <p className="text-sm mt-1">Be the first to review this equipment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.slice(0, visibleCount).map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
          {visibleCount < total && (
            <button
              onClick={() => setVisibleCount((c) => c + 5)}
              className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
              Show more reviews ({total - visibleCount} remaining)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [showResponse, setShowResponse] = useState(false);
  const reviewerName = (review.reviewer as {full_name?: string})?.full_name || 'Anonymous';
  const isVerified = (review.reviewer as {is_verified?: boolean})?.is_verified || false;
  const date = new Date(review.created_at).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
            {reviewerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-gray-900 text-sm">{reviewerName}</span>
              {isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />}
            </div>
            <span className="text-xs text-gray-400">{date}</span>
          </div>
        </div>
        <StarRating rating={review.rating} size="sm" />
      </div>

      {review.title && (
        <p className="font-semibold text-gray-800 text-sm mb-1">{review.title}</p>
      )}
      {review.comment && (
        <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
      )}

      {/* Aspect ratings */}
      {(review.equipment_condition || review.communication || review.punctuality) && (
        <div className="mt-3 flex flex-wrap gap-3">
          {review.equipment_condition && (
            <AspectBadge label="Condition" rating={review.equipment_condition} />
          )}
          {review.communication && (
            <AspectBadge label="Communication" rating={review.communication} />
          )}
          {review.punctuality && (
            <AspectBadge label="Punctuality" rating={review.punctuality} />
          )}
        </div>
      )}

      {/* Owner response */}
      {review.response && (
        <div className="mt-3">
          <button
            onClick={() => setShowResponse(!showResponse)}
            className="text-xs text-blue-600 flex items-center gap-1 hover:underline"
          >
            <MessageSquare className="w-3 h-3" />
            {showResponse ? 'Hide' : 'View'} owner response
          </button>
          {showResponse && (
            <div className="mt-2 bg-blue-50 rounded-xl p-3 text-sm text-gray-700">
              <p className="font-medium text-gray-800 mb-1 text-xs">Owner Response</p>
              {review.response}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AspectBadge({ label, rating }: { label: string; rating: number }) {
  return (
    <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1">
      <span className="text-xs text-gray-500">{label}</span>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-3 h-3 ${s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
          />
        ))}
      </div>
    </div>
  );
}

