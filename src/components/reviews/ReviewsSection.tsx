import { useState } from 'react';
import { Star, ThumbsUp, MessageSquare, Filter, ChevronDown, User, CheckCircle2 } from 'lucide-react';

interface Review {
  id: string;
  author: {
    name: string;
    avatar: string | null;
    isVerified: boolean;
  };
  rating: number;
  date: string;
  title: string;
  content: string;
  helpful: number;
  response?: {
    author: string;
    content: string;
    date: string;
  };
  images?: string[];
}

interface ReviewsSectionProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
  className?: string;
}

const sampleReviews: Review[] = [
  {
    id: '1',
    author: {
      name: 'Michael Chen',
      avatar: null,
      isVerified: true,
    },
    rating: 5,
    date: '2 weeks ago',
    title: 'Excellent equipment, professional service',
    content: 'The equipment was in perfect condition and exactly as described. Pickup was smooth and the owner was very helpful with instructions. Would definitely rent again!',
    helpful: 12,
    response: {
      author: 'Heavy Equipment Rentals LLC',
      content: 'Thank you for your kind words, Michael! We appreciate your business and look forward to serving you again.',
      date: '1 week ago',
    },
  },
  {
    id: '2',
    author: {
      name: 'Sarah Johnson',
      avatar: null,
      isVerified: true,
    },
    rating: 5,
    date: '1 month ago',
    title: 'Great experience overall',
    content: 'Used this for a weekend project and it worked perfectly. Clean, well-maintained, and easy to operate. The delivery option was a huge time saver.',
    helpful: 8,
  },
  {
    id: '3',
    author: {
      name: 'David Williams',
      avatar: null,
      isVerified: false,
    },
    rating: 4,
    date: '1 month ago',
    title: 'Good equipment, minor delay',
    content: 'Equipment worked great for our construction project. Only minor issue was a slight delay in pickup, but the owner communicated well about it.',
    helpful: 5,
  },
];

export default function ReviewsSection({
  averageRating = 4.9,
  totalReviews = 47,
  ratingDistribution = { 5: 38, 4: 7, 3: 2, 2: 0, 1: 0 },
  className = '',
}: Partial<ReviewsSectionProps>) {
  const [reviews] = useState<Review[]>(sampleReviews);
  const [filter, setFilter] = useState<'all' | 'positive' | 'critical'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent');
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set());

  const markHelpful = (reviewId: string) => {
    setHelpfulReviews((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const filteredReviews = reviews.filter((review) => {
    if (filter === 'positive') return review.rating >= 4;
    if (filter === 'critical') return review.rating < 4;
    return true;
  });

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizes = {
      sm: 'w-3.5 h-3.5',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    };
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizes[size]} ${
              star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 overflow-hidden ${className}`}>
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Reviews</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900">{averageRating}</div>
              <div className="mt-2">{renderStars(Math.round(averageRating), 'lg')}</div>
              <p className="text-sm text-gray-500 mt-1">{totalReviews} reviews</p>
            </div>
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratingDistribution[stars] || 0;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 w-8">{stars}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col justify-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'positive' | 'critical')}
                  className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer"
                >
                  <option value="all">All Reviews</option>
                  <option value="positive">Positive</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'recent' | 'helpful')}
                  className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer"
                >
                  <option value="recent">Most Recent</option>
                  <option value="helpful">Most Helpful</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {filteredReviews.map((review) => (
          <div key={review.id} className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                {review.author.avatar ? (
                  <img
                    src={review.author.avatar}
                    alt={review.author.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{review.author.name}</span>
                    {review.author.isVerified && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 text-xs font-medium rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  {renderStars(review.rating)}
                </div>

                {review.title && (
                  <h4 className="font-medium text-gray-900 mt-3">{review.title}</h4>
                )}

                <p className="text-gray-600 mt-2">{review.content}</p>

                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {review.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Review image ${index + 1}`}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 mt-4">
                  <button
                    onClick={() => markHelpful(review.id)}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${
                      helpfulReviews.has(review.id)
                        ? 'text-teal-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${helpfulReviews.has(review.id) ? 'fill-current' : ''}`} />
                    Helpful ({review.helpful + (helpfulReviews.has(review.id) ? 1 : 0)})
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    Reply
                  </button>
                </div>

                {review.response && (
                  <div className="mt-4 ml-4 p-4 bg-gray-50 rounded-xl border-l-4 border-teal-500">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{review.response.author}</span>
                      <span className="text-xs text-gray-500">{review.response.date}</span>
                    </div>
                    <p className="text-gray-600 mt-2 text-sm">{review.response.content}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <button className="w-full py-3 text-center text-teal-600 hover:text-teal-700 font-medium transition-colors">
          View All {totalReviews} Reviews
        </button>
      </div>
    </div>
  );
}
