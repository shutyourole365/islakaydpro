import { useState } from 'react';
import {
  Shield,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Award,
  User,
  Calendar,
  DollarSign,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  X,
  ChevronRight,
  Info,
  Lock,
  FileText,
} from 'lucide-react';
import type { Profile, Review } from '../../types';

interface RenterTrustScoreProps {
  userId: string;
  viewMode?: 'full' | 'compact' | 'badge';
  onClose?: () => void;
}

interface TrustFactor {
  name: string;
  score: number;
  maxScore: number;
  icon: React.ReactNode;
  description: string;
  color: string;
}

interface TrustHistory {
  date: string;
  event: string;
  scoreChange: number;
  type: 'positive' | 'negative' | 'neutral';
}

// Mock user profile data
const mockProfile: Profile & { trustScore?: number } = {
  id: 'user1',
  full_name: 'John Smith',
  avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
  phone: '+1 555-123-4567',
  bio: 'Experienced contractor with 10+ years in construction',
  location: 'San Francisco, CA',
  rating: 4.8,
  total_reviews: 42,
  total_rentals: 87,
  is_verified: true,
  is_admin: false,
  verification_level: 'complete',
  identity_verified: true,
  phone_verified: true,
  email_verified: true,
  business_verified: true,
  two_factor_enabled: true,
  last_login: null,
  account_status: 'active',
  preferred_payment_methods: ['card', 'bank'],
  notification_preferences: { email: true, push: true, sms: true },
  created_at: '2023-06-15T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  trustScore: 92,
};

// Mock reviews
const mockReviews: Review[] = [
  {
    id: '1',
    booking_id: 'b1',
    equipment_id: null,
    reviewer_id: 'owner1',
    reviewee_id: 'user1',
    rating: 5,
    title: null,
    comment: 'Excellent renter! Equipment returned in perfect condition.',
    response: null,
    is_equipment_review: false,
    equipment_condition: 5,
    communication: 5,
    punctuality: 5,
    created_at: '2025-01-20T10:00:00Z',
    updated_at: '2025-01-20T10:00:00Z',
  },
  {
    id: '2',
    booking_id: 'b2',
    equipment_id: null,
    reviewer_id: 'owner2',
    reviewee_id: 'user1',
    rating: 5,
    title: null,
    comment: 'Great communication throughout the rental period.',
    response: null,
    is_equipment_review: false,
    equipment_condition: 5,
    communication: 5,
    punctuality: 4,
    created_at: '2025-01-10T10:00:00Z',
    updated_at: '2025-01-10T10:00:00Z',
  },
  {
    id: '3',
    booking_id: 'b3',
    equipment_id: null,
    reviewer_id: 'owner3',
    reviewee_id: 'user1',
    rating: 4,
    title: null,
    comment: 'Good renter, minor delay on return but communicated well.',
    response: null,
    is_equipment_review: false,
    equipment_condition: 4,
    communication: 5,
    punctuality: 3,
    created_at: '2024-12-15T10:00:00Z',
    updated_at: '2024-12-15T10:00:00Z',
  },
];

// Trust history
const mockTrustHistory: TrustHistory[] = [
  { date: '2025-01-20', event: 'Completed rental with 5-star review', scoreChange: 2, type: 'positive' },
  { date: '2025-01-15', event: 'Verified business credentials', scoreChange: 5, type: 'positive' },
  { date: '2025-01-10', event: 'Completed rental with 5-star review', scoreChange: 2, type: 'positive' },
  { date: '2024-12-20', event: 'On-time return streak (10 rentals)', scoreChange: 3, type: 'positive' },
  { date: '2024-12-15', event: 'Late return (-1 day)', scoreChange: -2, type: 'negative' },
  { date: '2024-11-30', event: 'Enabled two-factor authentication', scoreChange: 3, type: 'positive' },
];

export default function RenterTrustScore({ userId, viewMode = 'full', onClose }: RenterTrustScoreProps) {
  void userId; // For future API integration
  const [activeTab, setActiveTab] = useState<'overview' | 'factors' | 'history' | 'reviews'>('overview');

  const profile = mockProfile;
  const trustScore = profile.trustScore || 0;

  // Calculate trust factors
  const trustFactors: TrustFactor[] = [
    {
      name: 'Verification Level',
      score: profile.is_verified ? 20 : 5,
      maxScore: 20,
      icon: <Shield className="w-5 h-5" />,
      description: 'Identity, email, phone, and business verified',
      color: 'text-green-600',
    },
    {
      name: 'Rental History',
      score: Math.min(25, (profile.total_rentals || 0) * 0.3),
      maxScore: 25,
      icon: <Calendar className="w-5 h-5" />,
      description: `${profile.total_rentals} completed rentals`,
      color: 'text-blue-600',
    },
    {
      name: 'Average Rating',
      score: Math.round((profile.rating || 0) * 5),
      maxScore: 25,
      icon: <Star className="w-5 h-5" />,
      description: `${profile.rating} average from ${profile.total_reviews} reviews`,
      color: 'text-yellow-600',
    },
    {
      name: 'Payment History',
      score: 18,
      maxScore: 20,
      icon: <DollarSign className="w-5 h-5" />,
      description: '100% on-time payments',
      color: 'text-purple-600',
    },
    {
      name: 'Account Security',
      score: profile.two_factor_enabled ? 10 : 5,
      maxScore: 10,
      icon: <Lock className="w-5 h-5" />,
      description: 'Two-factor authentication enabled',
      color: 'text-teal-600',
    },
  ];

  const totalMaxScore = trustFactors.reduce((sum, f) => sum + f.maxScore, 0);
  const calculatedScore = trustFactors.reduce((sum, f) => sum + f.score, 0);
  const scorePercentage = Math.round((calculatedScore / totalMaxScore) * 100);

  // Get trust level
  const getTrustLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-100', badge: 'Trusted Renter' };
    if (score >= 75) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-100', badge: 'Verified Renter' };
    if (score >= 50) return { level: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100', badge: 'Active Renter' };
    return { level: 'Building', color: 'text-gray-600', bg: 'bg-gray-100', badge: 'New Renter' };
  };

  const trustLevel = getTrustLevel(trustScore);

  // Badge view
  if (viewMode === 'badge') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${trustLevel.bg} cursor-pointer`}
        onClick={onClose}
      >
        <Shield className={`w-4 h-4 ${trustLevel.color}`} />
        <span className={`text-sm font-medium ${trustLevel.color}`}>{trustScore}</span>
      </div>
    );
  }

  // Compact view
  if (viewMode === 'compact') {
    return (
      <div
        className="flex items-center gap-3 p-3 bg-white rounded-lg border shadow-sm cursor-pointer hover:border-teal-300 transition-colors"
        onClick={onClose}
      >
        <div className={`p-2 rounded-full ${trustLevel.bg}`}>
          <Shield className={`w-5 h-5 ${trustLevel.color}`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">{trustScore}</span>
            <span className={`text-sm ${trustLevel.color}`}>Trust Score</span>
          </div>
          <p className="text-xs text-gray-500">{trustLevel.badge}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
      </div>
    );
  }

  // Full view
  return (
    <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-6 text-white">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={profile.avatar_url || 'https://via.placeholder.com/80'}
                alt={profile.full_name || 'User'}
                className="w-16 h-16 rounded-full border-2 border-white/30"
              />
              {profile.is_verified && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">{profile.full_name}</h2>
              <p className="text-teal-100 text-sm">{profile.location}</p>
              <div className="flex items-center gap-2 mt-1">
                <Award className="w-4 h-4" />
                <span className="text-sm">{trustLevel.badge}</span>
              </div>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Trust Score Circle */}
        <div className="flex items-center justify-center mt-6">
          <div className="relative">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.2)" strokeWidth="12" fill="none" />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="white"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(trustScore / 100) * 352} 352`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold">{trustScore}</span>
              <span className="text-sm text-teal-100">Trust Score</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'factors', label: 'Trust Factors' },
            { id: 'history', label: 'History' },
            { id: 'reviews', label: 'Reviews' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto max-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-teal-600">{profile.total_rentals}</div>
                <div className="text-xs text-gray-500">Rentals</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center text-2xl font-bold text-yellow-500">
                  {profile.rating}
                  <Star className="w-4 h-4 ml-1" />
                </div>
                <div className="text-xs text-gray-500">Rating</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">100%</div>
                <div className="text-xs text-gray-500">On-time</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {new Date().getFullYear() - new Date(profile.created_at).getFullYear()}y
                </div>
                <div className="text-xs text-gray-500">Member</div>
              </div>
            </div>

            {/* Verification Status */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-600" />
                Verification Status
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Identity', verified: profile.identity_verified },
                  { label: 'Email', verified: profile.email_verified },
                  { label: 'Phone', verified: profile.phone_verified },
                  { label: 'Business', verified: profile.business_verified },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    {item.verified ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-gray-300" />
                    )}
                    <span className={item.verified ? 'text-gray-700' : 'text-gray-400'}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Trend */}
            <div className={`p-4 rounded-lg ${trustLevel.bg}`}>
              <div className="flex items-center gap-2">
                <TrendingUp className={`w-5 h-5 ${trustLevel.color}`} />
                <span className={`font-medium ${trustLevel.color}`}>Trust Score Trend</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Your trust score has increased by 8 points in the last 30 days. Keep up the great work!
              </p>
            </div>
          </div>
        )}

        {activeTab === 'factors' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Info className="w-4 h-4" />
              Your trust score is calculated from these factors:
            </div>
            {trustFactors.map((factor) => (
              <div key={factor.name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gray-100 ${factor.color}`}>{factor.icon}</div>
                    <div>
                      <h4 className="font-medium">{factor.name}</h4>
                      <p className="text-xs text-gray-500">{factor.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-lg">{factor.score}</span>
                    <span className="text-gray-400">/{factor.maxScore}</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full transition-all"
                    style={{ width: `${(factor.score / factor.maxScore) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Score</span>
                <span className="font-bold text-xl text-teal-600">
                  {calculatedScore}/{totalMaxScore} ({scorePercentage}%)
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            {mockTrustHistory.map((event, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div
                  className={`p-2 rounded-full ${
                    event.type === 'positive'
                      ? 'bg-green-100 text-green-600'
                      : event.type === 'negative'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {event.type === 'positive' ? (
                    <ThumbsUp className="w-4 h-4" />
                  ) : event.type === 'negative' ? (
                    <ThumbsDown className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{event.event}</p>
                  <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                </div>
                <div
                  className={`font-bold ${
                    event.scoreChange > 0 ? 'text-green-600' : event.scoreChange < 0 ? 'text-red-600' : 'text-gray-500'
                  }`}
                >
                  {event.scoreChange > 0 ? '+' : ''}
                  {event.scoreChange}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {mockReviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-600">Equipment Owner</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{review.comment}</p>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>Equipment: {review.equipment_condition}/5</span>
                  <span>Communication: {review.communication}/5</span>
                  <span>Punctuality: {review.punctuality}/5</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t p-4 bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <FileText className="w-4 h-4" />
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </div>
          <button className="flex items-center gap-1 text-teal-600 hover:text-teal-700">
            <MessageSquare className="w-4 h-4" />
            Report Issue
          </button>
        </div>
      </div>
    </div>
  );
}
