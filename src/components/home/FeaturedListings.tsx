import { Heart, Star, MapPin, Shield, Clock, ArrowRight } from 'lucide-react';
import type { Equipment } from '../../types';

interface FeaturedListingsProps {
  equipment: Equipment[];
  onEquipmentClick: (equipment: Equipment) => void;
  onFavoriteClick: (equipmentId: string) => void;
  favorites: Set<string>;
}

export default function FeaturedListings({
  equipment,
  onEquipmentClick,
  onFavoriteClick,
  favorites,
}: FeaturedListingsProps) {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-medium mb-4">
              <Star className="w-4 h-4 fill-amber-500" />
              Featured Equipment
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              Top-Rated Equipment Near You
            </h2>
            <p className="text-xl text-gray-600">
              Discover highly-rated equipment from verified owners
            </p>
          </div>
          <a
            href="#"
            className="flex items-center gap-2 text-teal-600 font-semibold hover:text-teal-700 transition-colors"
          >
            View All
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {equipment.map((item, index) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFavoriteClick(item.id);
                  }}
                  className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    favorites.has(item.id)
                      ? 'bg-red-500 text-white'
                      : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${favorites.has(item.id) ? 'fill-white' : ''}`}
                  />
                </button>

                {item.is_featured && (
                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-xs font-semibold text-white flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-white" />
                    Featured
                  </div>
                )}

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-semibold text-gray-900">
                      {item.rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({item.total_reviews})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full">
                    <Shield className="w-4 h-4 text-teal-500" />
                    <span className="text-xs font-medium text-gray-700">Verified</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onEquipmentClick(item)}
                className="w-full p-5 text-left"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-teal-600 transition-colors">
                    {item.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="line-clamp-1">{item.location}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{item.min_rental_days}-{item.max_rental_days} days</span>
                  </div>
                  <span className="capitalize px-2 py-0.5 bg-gray-100 rounded text-xs">
                    {item.condition}
                  </span>
                </div>

                <div className="flex items-end justify-between pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">
                      ${item.daily_rate}
                    </span>
                    <span className="text-gray-500">/day</span>
                  </div>
                  {item.weekly_rate && (
                    <span className="text-sm text-gray-500">
                      ${item.weekly_rate}/week
                    </span>
                  )}
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
