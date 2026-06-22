import { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Share2,
  Star,
  MapPin,
  Shield,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Truck,
  AlertCircle,
  Info,
  DollarSign,
  Grid3x3,
} from 'lucide-react';
import type { Equipment, Review, EquipmentAvailability } from '../../types';
import { getReviews, getEquipmentAvailability } from '../../services/database';
import ShareEquipment from './ShareEquipment';
import PriceNegotiator from '../negotiation/PriceNegotiator';
import MaintenancePredictor from '../predictive/MaintenancePredictor';

interface EquipmentDetailProps {
  equipment: Equipment;
  onClose: () => void;
  onBook: (equipment: Equipment, dates: { start: string; end: string }) => void;
  onMessage: (equipment: Equipment) => void;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  onViewOwner?: (ownerId: string) => void;
}

function timeAgo(dateString: string): string {
  const days = Math.floor((Date.now() - new Date(dateString).getTime()) / 86_400_000);
  if (days < 1) return 'Today';
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  return `${Math.floor(months / 12)} year${Math.floor(months / 12) === 1 ? '' : 's'} ago`;
}

export default function EquipmentDetail({
  equipment,
  onClose,
  onBook,
  onMessage,
  isFavorite,
  onFavoriteToggle,
  onViewOwner,
}: EquipmentDetailProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showNegotiator, setShowNegotiator] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [blockedRanges, setBlockedRanges] = useState<EquipmentAvailability[]>([]);
  const [calOffset, setCalOffset] = useState(0);

  const images = equipment.images?.length ? equipment.images : [];
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    let active = true;
    setReviewsLoading(true);
    getReviews({ equipmentId: equipment.id, limit: 6 })
      .then((data) => { if (active) setReviews(data); })
      .catch(() => { if (active) setReviews([]); })
      .finally(() => { if (active) setReviewsLoading(false); });
    return () => { active = false; };
  }, [equipment.id]);

  useEffect(() => {
    let active = true;
    getEquipmentAvailability(equipment.id, today)
      .then((ranges) => { if (active) setBlockedRanges(ranges); })
      .catch(() => {});
    return () => { active = false; };
  }, [equipment.id, today]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') setLightboxIndex((i) => (i === null ? 0 : (i + 1) % images.length));
      if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i === null ? 0 : (i - 1 + images.length) % images.length));
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lightboxIndex, images.length]);

  const pricing = (() => {
    if (!startDate || !endDate) return null;
    const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000);
    if (days <= 0) return null;
    const subtotal = days * equipment.daily_rate;
    const serviceFee = subtotal * 0.12;
    return { days, subtotal, serviceFee, total: subtotal + serviceFee + equipment.deposit_amount };
  })();

  const ratingValue = equipment.rating || (reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0);
  const reviewCount = equipment.total_reviews || reviews.length;

  // Rating distribution for the breakdown bars
  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    return { star, count, pct: reviews.length ? (count / reviews.length) * 100 : 0 };
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center sm:p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-5xl my-0 sm:my-6 bg-white dark:bg-gray-800 sm:rounded-3xl shadow-2xl overflow-hidden">
        {/* Top bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur border-b border-gray-100 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button
              onClick={onFavoriteToggle}
              aria-label="Toggle favorite"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              {isFavorite ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-5 sm:px-8 pt-6">
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mb-2">{equipment.title}</h1>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-700 dark:text-gray-200 mb-5">
            {reviewCount > 0 && (
              <>
                <span className="flex items-center gap-1 font-medium">
                  <Star className="w-4 h-4 fill-gray-900 dark:fill-white text-gray-900 dark:text-white" />
                  {ratingValue.toFixed(1)}
                </span>
                <span className="text-gray-400">·</span>
                <span className="underline">{reviewCount} review{reviewCount === 1 ? '' : 's'}</span>
                <span className="text-gray-400">·</span>
              </>
            )}
            <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <MapPin className="w-4 h-4" /> {equipment.location || 'Location on request'}
            </span>
          </div>

          {/* Airbnb-style photo gallery */}
          {images.length > 0 && (
            <div className="relative grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden aspect-[2/1] mb-8">
              <button
                onClick={() => setLightboxIndex(0)}
                className={`relative overflow-hidden group ${images.length > 1 ? 'col-span-2 row-span-2' : 'col-span-4 row-span-2'}`}
              >
                <img src={images[0]} alt={equipment.title} className="w-full h-full object-cover group-hover:brightness-95 transition-all" />
              </button>
              {images.slice(1, 5).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxIndex(i + 1)}
                  className="relative overflow-hidden group col-span-1 row-span-1"
                >
                  <img src={img} alt={`${equipment.title} ${i + 2}`} className="w-full h-full object-cover group-hover:brightness-95 transition-all" />
                </button>
              ))}
              {images.length > 1 && (
                <button
                  onClick={() => setLightboxIndex(0)}
                  className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium rounded-lg border border-gray-900/10 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Grid3x3 className="w-4 h-4" /> Show all photos
                </button>
              )}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-10 pb-10">
            {/* Left: content */}
            <div className="lg:col-span-2">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 pb-6 border-b border-gray-100 dark:border-gray-700">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full text-sm font-medium">
                  <Shield className="w-4 h-4" /> Verified owner
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium capitalize">
                  <CheckCircle2 className="w-4 h-4" /> {equipment.condition} condition
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                  <Truck className="w-4 h-4" /> Delivery available
                </span>
              </div>

              {/* Owner */}
              <button
                type="button"
                onClick={() => onViewOwner?.(equipment.owner_id)}
                disabled={!onViewOwner}
                className="flex items-center gap-4 py-6 border-b border-gray-100 dark:border-gray-700 w-full text-left group/owner disabled:cursor-default"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold overflow-hidden">
                  {equipment.owner?.avatar_url
                    ? <img src={equipment.owner.avatar_url} alt="" className="w-full h-full object-cover" />
                    : (equipment.owner?.full_name?.charAt(0) || 'O')}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white group-hover/owner:text-teal-600 dark:group-hover/owner:text-teal-400 transition-colors">Hosted by {equipment.owner?.full_name || 'the owner'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    {(equipment.owner?.rating ?? 5).toFixed(1)} · {equipment.owner?.total_reviews ?? 0} reviews
                    {equipment.owner?.is_verified && <span className="ml-1 inline-flex items-center gap-1 text-teal-600"><Shield className="w-3.5 h-3.5" /> Verified</span>}
                  </p>
                </div>
                {onViewOwner && (
                  <span className="ml-auto text-sm font-medium text-teal-600 dark:text-teal-400 opacity-0 group-hover/owner:opacity-100 transition-opacity">View profile →</span>
                )}
              </button>

              {/* Description */}
              {equipment.description && (
                <div className="py-6 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">About this equipment</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{equipment.description}</p>
                </div>
              )}

              {/* Features */}
              {equipment.features.length > 0 && (
                <div className="py-6 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">What's included</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {equipment.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                        <CheckCircle2 className="w-5 h-5 text-teal-500 flex-shrink-0" /> {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specifications */}
              {Object.keys(equipment.specifications).length > 0 && (
                <div className="py-6 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Specifications</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                    {Object.entries(equipment.specifications).map(([k, v]) => (
                      <div key={k} className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400 capitalize">{k}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className="py-6">
                <div className="flex items-center gap-2 mb-6">
                  <Star className="w-5 h-5 fill-gray-900 dark:fill-white text-gray-900 dark:text-white" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {ratingValue > 0 ? `${ratingValue.toFixed(1)} · ${reviewCount} review${reviewCount === 1 ? '' : 's'}` : 'No reviews yet'}
                  </h2>
                </div>

                {reviews.length > 0 && (
                  <div className="grid sm:grid-cols-2 gap-x-10 gap-y-2 mb-8 max-w-md">
                    {distribution.map(({ star, pct, count }) => (
                      <div key={star} className="flex items-center gap-3 text-sm">
                        <span className="w-3 text-gray-600 dark:text-gray-300">{star}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-900 dark:bg-white rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-6 text-right text-xs text-gray-400">{count}</span>
                      </div>
                    ))}
                  </div>
                )}

                {reviewsLoading ? (
                  <div className="grid sm:grid-cols-2 gap-6">
                    {[0, 1].map((i) => (
                      <div key={i} className="animate-pulse space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                          <div className="space-y-1.5"><div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" /><div className="h-2.5 w-16 bg-gray-100 dark:bg-gray-700/60 rounded" /></div>
                        </div>
                        <div className="h-3 w-full bg-gray-100 dark:bg-gray-700/60 rounded" />
                        <div className="h-3 w-4/5 bg-gray-100 dark:bg-gray-700/60 rounded" />
                      </div>
                    ))}
                  </div>
                ) : reviews.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">Be the first to review this equipment after your rental.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
                    {reviews.map((r) => (
                      <div key={r.id}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
                            {r.reviewer?.avatar_url
                              ? <img src={r.reviewer.avatar_url} alt="" className="w-full h-full object-cover" />
                              : (r.reviewer?.full_name?.charAt(0) || 'U')}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{r.reviewer?.full_name || 'Renter'}</p>
                            <p className="text-xs text-gray-400">{timeAgo(r.created_at)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 mb-1.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(r.rating) ? 'fill-amber-500 text-amber-500' : 'text-gray-200 dark:text-gray-600'}`} />
                          ))}
                        </div>
                        {r.title && <p className="font-medium text-gray-900 dark:text-white text-sm mb-1">{r.title}</p>}
                        {r.comment && <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: sticky booking card */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-20">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg ring-1 ring-gray-200 dark:ring-gray-700">
                  <div className="flex items-baseline justify-between mb-5">
                    <div>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">${equipment.daily_rate}</span>
                      <span className="text-gray-500 dark:text-gray-400"> / day</span>
                    </div>
                    {reviewCount > 0 && (
                      <span className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-200">
                        <Star className="w-4 h-4 fill-gray-900 dark:fill-white text-gray-900 dark:text-white" /> {ratingValue.toFixed(1)}
                      </span>
                    )}
                  </div>

                  <div className="rounded-xl border border-gray-300 dark:border-gray-700 divide-y divide-gray-300 dark:divide-gray-700 mb-4">
                    <div className="grid grid-cols-2 divide-x divide-gray-300 dark:divide-gray-700">
                      <label className="p-3 cursor-pointer">
                        <span className="block text-[11px] font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Start</span>
                        <input type="date" min={today} value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full text-sm text-gray-900 dark:text-white focus:outline-none bg-transparent" />
                      </label>
                      <label className="p-3 cursor-pointer">
                        <span className="block text-[11px] font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">End</span>
                        <input type="date" min={startDate || today} value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full text-sm text-gray-900 dark:text-white focus:outline-none bg-transparent" />
                      </label>
                    </div>
                  </div>

                  {/* Availability mini-calendar */}
                  {(() => {
                    const base = new Date();
                    base.setDate(1);
                    base.setMonth(base.getMonth() + calOffset);
                    const year = base.getFullYear();
                    const month = base.getMonth();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const firstDow = new Date(year, month, 1).getDay();
                    const monthLabel = base.toLocaleString('default', { month: 'long', year: 'numeric' });

                    const isBlocked = (day: number) => {
                      const d = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      return blockedRanges.some(r => d >= r.start_date && d <= r.end_date);
                    };
                    const isPast = (day: number) => {
                      const d = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      return d < today;
                    };
                    const cells = Array.from({ length: firstDow }, (_, i) => <div key={`e${i}`} />);
                    for (let d = 1; d <= daysInMonth; d++) {
                      const past = isPast(d);
                      const blocked = !past && isBlocked(d);
                      cells.push(
                        <div
                          key={d}
                          className={`flex items-center justify-center text-[11px] rounded-md h-6 w-full font-medium ${
                            past ? 'text-gray-300 dark:text-gray-600' :
                            blocked ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' :
                            'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {d}
                        </div>
                      );
                    }

                    return (
                      <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <button onClick={() => setCalOffset(o => Math.max(0, o - 1))} disabled={calOffset === 0} className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30">
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{monthLabel}</span>
                          <button onClick={() => setCalOffset(o => Math.min(3, o + 1))} disabled={calOffset === 3} className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-7 gap-0.5 mb-1">
                          {['S','M','T','W','T','F','S'].map((d, i) => (
                            <div key={i} className="text-center text-[10px] font-semibold text-gray-400 uppercase">{d}</div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-0.5">{cells}</div>
                        {blockedRanges.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                            <div className="w-3 h-3 rounded-sm bg-red-100 dark:bg-red-900/40" />
                            <span className="text-[10px] text-gray-400">Unavailable</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <div className="flex items-center gap-2 px-3 py-2 mb-4 bg-gray-50 dark:bg-gray-700/40 rounded-lg text-xs text-gray-500 dark:text-gray-400">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    Min {equipment.min_rental_days} · max {equipment.max_rental_days} days
                  </div>

                  <button
                    onClick={() => onBook(equipment, { start: startDate, end: endDate })}
                    disabled={!pricing}
                    className="w-full py-3.5 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {pricing ? 'Reserve now' : 'Select dates'}
                  </button>
                  {!pricing && <p className="text-center text-xs text-gray-400 mt-2">You won't be charged yet</p>}

                  {pricing && (
                    <div className="mt-5 space-y-3 text-sm">
                      <div className="flex justify-between text-gray-600 dark:text-gray-300">
                        <span className="underline">${equipment.daily_rate} × {pricing.days} day{pricing.days === 1 ? '' : 's'}</span>
                        <span>${pricing.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-300">
                        <span className="underline">Service fee</span>
                        <span>${pricing.serviceFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-300">
                        <span className="underline">Refundable deposit</span>
                        <span>${equipment.deposit_amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-gray-900 dark:text-white pt-3 border-t border-gray-200 dark:border-gray-700">
                        <span>Total</span>
                        <span>${pricing.total.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button
                      onClick={() => onMessage(equipment)}
                      className="py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-4 h-4" /> Message
                    </button>
                    <button
                      onClick={() => setShowNegotiator(true)}
                      className="py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <DollarSign className="w-4 h-4" /> Offer
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 px-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  Free cancellation up to 48 hours before pickup. Deposit fully refundable on return.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && images.length > 0 && (
        <div className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center" onClick={() => setLightboxIndex(null)}>
          <button onClick={() => setLightboxIndex(null)} aria-label="Close gallery" className="absolute top-5 right-5 p-2 text-white/80 hover:text-white">
            <X className="w-7 h-7" />
          </button>
          <span className="absolute top-6 left-6 text-white/80 text-sm">{lightboxIndex + 1} / {images.length}</span>
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + images.length) % images.length); }}
                aria-label="Previous" className="absolute left-4 sm:left-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % images.length); }}
                aria-label="Next" className="absolute right-4 sm:right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <img
            src={images[lightboxIndex]}
            alt={`${equipment.title} ${lightboxIndex + 1}`}
            className="max-w-[92vw] max-h-[88vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <ShareEquipment
        equipmentId={equipment.id}
        equipmentTitle={equipment.title}
        equipmentImage={equipment.images[0]}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {showNegotiator && pricing && (
        <PriceNegotiator
          equipmentId={equipment.id}
          equipmentTitle={equipment.title}
          originalDailyRate={equipment.daily_rate}
          ownerId={equipment.owner_id}
          ownerName={equipment.owner?.full_name || 'Owner'}
          rentalDays={pricing.days}
          onAccepted={() => setShowNegotiator(false)}
          onRejected={() => setShowNegotiator(false)}
          onClose={() => setShowNegotiator(false)}
        />
      )}

      {showMaintenance && (
        <MaintenancePredictor
          equipmentId={equipment.id}
          equipmentTitle={equipment.title}
          category={equipment.category_id ?? ''}
          hoursUsed={500}
          lastMaintenanceDate={new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)}
          onScheduleMaintenance={() => setShowMaintenance(false)}
          onClose={() => setShowMaintenance(false)}
        />
      )}
    </div>
  );
}
