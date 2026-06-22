import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Star, ShieldCheck, Package, CalendarDays, MessageSquare, BadgeCheck } from 'lucide-react';
import type { Profile, Equipment, Review } from '../../types';
import { getProfile, getEquipment, getReviews } from '../../services/database';
import EquipmentCard from '../equipment/EquipmentCard';

interface OwnerProfilePageProps {
  ownerId: string;
  onBack: () => void;
  onEquipmentClick: (equipment: Equipment) => void;
  onMessage?: (ownerId: string) => void;
  onFavoriteClick?: (equipmentId: string) => void;
  favorites?: Set<string>;
}

function memberSince(dateString?: string): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('default', { month: 'long', year: 'numeric' });
}

function timeAgo(dateString: string): string {
  const days = Math.floor((Date.now() - new Date(dateString).getTime()) / 86_400_000);
  if (days < 1) return 'Today';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function OwnerProfilePage({
  ownerId,
  onBack,
  onEquipmentClick,
  onMessage,
  onFavoriteClick,
  favorites,
}: OwnerProfilePageProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Equipment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      getProfile(ownerId),
      getEquipment({ ownerId, limit: 12 }),
      getReviews({ revieweeId: ownerId, limit: 6 }),
    ])
      .then(([p, eq, rv]) => {
        if (!active) return;
        setProfile(p);
        setListings(eq.data);
        setReviews(rv);
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [ownerId]);

  const initials = (profile?.full_name || 'U')
    .split(' ').map(p => p.charAt(0)).slice(0, 2).join('').toUpperCase();

  const ratingValue = profile?.rating || 0;
  const reviewCount = profile?.total_reviews || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {loading ? (
          <div className="space-y-6">
            <div className="h-44 rounded-3xl skeleton-shimmer" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-72 rounded-2xl skeleton-shimmer" />
              ))}
            </div>
          </div>
        ) : !profile ? (
          <div className="text-center py-24">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">Profile not found</p>
            <p className="text-gray-500 dark:text-gray-400 mt-1">This owner may no longer be available.</p>
          </div>
        ) : (
          <>
            {/* Header card */}
            <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft p-6 sm:p-8">
              <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-10 w-64 h-64 bg-gradient-to-br from-teal-400/15 to-cyan-500/15 blur-3xl rounded-full" />
              <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name || 'Owner'} className="w-24 h-24 rounded-2xl object-cover shadow-lg" />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.full_name || 'Equipment Owner'}</h1>
                    {profile.is_verified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xs font-semibold">
                        <BadgeCheck className="w-3.5 h-3.5" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                    {reviewCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="font-semibold text-gray-900 dark:text-white">{ratingValue.toFixed(1)}</span>
                        ({reviewCount})
                      </span>
                    )}
                    {profile.location && (
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.location}</span>
                    )}
                    <span className="flex items-center gap-1"><CalendarDays className="w-4 h-4" /> Joined {memberSince(profile.created_at)}</span>
                  </div>
                  {profile.bio && (
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 max-w-2xl">{profile.bio}</p>
                  )}
                </div>
                {onMessage && (
                  <button
                    onClick={() => onMessage(profile.id)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl shadow-brand hover:shadow-brand-lg hover:-translate-y-0.5 transition-all flex-shrink-0"
                  >
                    <MessageSquare className="w-4 h-4" /> Message
                  </button>
                )}
              </div>

              {/* Stat strip */}
              <div className="relative grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 text-gray-900 dark:text-white font-bold text-xl">
                    <Package className="w-5 h-5 text-teal-500" /> {listings.length}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Listings</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 text-gray-900 dark:text-white font-bold text-xl">
                    <Star className="w-5 h-5 text-amber-500" /> {ratingValue > 0 ? ratingValue.toFixed(1) : '—'}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Avg rating</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 text-gray-900 dark:text-white font-bold text-xl">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" /> {profile.total_rentals ?? reviewCount}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completed rentals</p>
                </div>
              </div>
            </div>

            {/* Listings */}
            <section className="mt-10">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Listings {listings.length > 0 && <span className="text-gray-400 font-normal">({listings.length})</span>}
              </h2>
              {listings.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <Package className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No active listings right now.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((item) => (
                    <EquipmentCard
                      key={item.id}
                      equipment={item}
                      onEquipmentClick={onEquipmentClick}
                      onFavoriteClick={(id) => onFavoriteClick?.(id)}
                      isFavorite={favorites?.has(item.id) ?? false}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Reviews */}
            {reviews.length > 0 && (
              <section className="mt-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent reviews</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {review.reviewer?.avatar_url ? (
                            <img src={review.reviewer.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xs font-semibold">
                              {(review.reviewer?.full_name || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{review.reviewer?.full_name || 'Renter'}</p>
                            <p className="text-xs text-gray-400">{timeAgo(review.created_at)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-200 dark:text-gray-700'}`} />
                          ))}
                        </div>
                      </div>
                      {review.comment && <p className="text-sm text-gray-600 dark:text-gray-300">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
