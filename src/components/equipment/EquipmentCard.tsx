import { useState } from 'react';
import { Heart, Star, MapPin, Shield, Clock, Eye, Zap } from 'lucide-react';
import type { Equipment } from '../../types';
import { RatingBadge, FeaturedBadge, VerifiedBadge, ConditionBadge } from '../ui/Badge';

interface EquipmentCardProps {
  equipment: Equipment;
  onEquipmentClick: (equipment: Equipment) => void;
  onFavoriteClick: (equipmentId: string) => void;
  isFavorite: boolean;
  variant?: 'default' | 'compact' | 'horizontal';
  showQuickBook?: boolean;
}

export default function EquipmentCard({
  equipment,
  onEquipmentClick,
  onFavoriteClick,
  isFavorite,
  variant = 'default',
  showQuickBook = false,
}: EquipmentCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteClick(equipment.id);
  };

  if (variant === 'horizontal') {
    return (
      <div
        onClick={() => onEquipmentClick(equipment)}
        className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 flex cursor-pointer"
      >
        <div className="relative w-48 flex-shrink-0">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          <img
            src={equipment.images[0]}
            alt={equipment.title}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity`}
          />
          {equipment.is_featured && (
            <div className="absolute top-3 left-3">
              <FeaturedBadge size="sm" />
            </div>
          )}
        </div>
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-teal-600 transition-colors">
                {equipment.title}
              </h3>
              <button
                onClick={handleFavoriteClick}
                className={`p-1.5 rounded-full transition-all ${
                  isFavorite
                    ? 'bg-red-50 text-red-500'
                    : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500' : ''}`} />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="line-clamp-1">{equipment.location}</span>
            </div>
            <div className="flex items-center gap-3">
              <RatingBadge rating={equipment.rating} reviews={equipment.total_reviews} size="sm" />
              {equipment.owner?.is_verified && <VerifiedBadge size="sm" />}
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
            <div>
              <span className="text-xl font-bold text-gray-900">${equipment.daily_rate}</span>
              <span className="text-gray-500 text-sm">/day</span>
            </div>
            {showQuickBook && (
              <button className="px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-lg hover:bg-teal-600 transition-colors">
                Quick Book
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        onClick={() => onEquipmentClick(equipment)}
        className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
      >
        <div className="relative aspect-square overflow-hidden">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          <img
            src={equipment.images[0]}
            alt={equipment.title}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isFavorite
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-gray-600 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
          </button>
        </div>
        <div className="p-3">
          <h3 className="font-medium text-gray-900 text-sm line-clamp-1">{equipment.title}</h3>
          <div className="flex items-center justify-between mt-2">
            <span className="font-bold text-gray-900">${equipment.daily_rate}</span>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              {equipment.rating.toFixed(1)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      onClick={() => onEquipmentClick(equipment)}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <img
          src={equipment.images[0]}
          alt={equipment.title}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
            isFavorite
              ? 'bg-red-500 text-white scale-110'
              : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
        </button>

        {/* Featured Badge */}
        {equipment.is_featured && (
          <div className="absolute top-4 left-4">
            <div className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-xs font-semibold text-white flex items-center gap-1.5 shadow-lg">
              <Zap className="w-3.5 h-3.5 fill-white" />
              Featured
            </div>
          </div>
        )}

        {/* Bottom Badges */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <RatingBadge rating={equipment.rating} reviews={equipment.total_reviews} />
          {equipment.owner?.is_verified && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full">
              <Shield className="w-4 h-4 text-teal-500" />
              <span className="text-xs font-medium text-gray-700">Verified</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-teal-600 transition-colors">
            {equipment.title}
          </h3>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="line-clamp-1">{equipment.location}</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{equipment.min_rental_days}-{equipment.max_rental_days} days</span>
          </div>
          <ConditionBadge condition={equipment.condition} size="sm" />
        </div>

        <div className="flex items-end justify-between pt-4 border-t border-gray-100">
          <div>
            <span className="text-2xl font-bold text-gray-900">${equipment.daily_rate}</span>
            <span className="text-gray-500">/day</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            {equipment.weekly_rate && (
              <span>${equipment.weekly_rate}/wk</span>
            )}
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{equipment.total_bookings}</span>
            </div>
          </div>
        </div>

        {showQuickBook && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEquipmentClick(equipment);
            }}
            className="w-full mt-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            View & Book
          </button>
        )}
      </div>
    </div>
  );
}
