import { Star, ArrowRight } from 'lucide-react';
import type { Equipment } from '../../types';
import EquipmentCard from '../equipment/EquipmentCard';

interface FeaturedListingsProps {
  equipment: Equipment[];
  onEquipmentClick: (equipment: Equipment) => void;
  onFavoriteClick: (equipmentId: string) => void;
  favorites: Set<string>;
  onAddToComparison?: (equipment: Equipment) => void;
  isLoading?: boolean;
}

export default function FeaturedListings({
  equipment,
  onEquipmentClick,
  onFavoriteClick,
  favorites,
  onAddToComparison,
  isLoading = false,
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
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-soft animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))
          ) : (
            equipment.slice(0, 8).map((item) => (
              <EquipmentCard
                key={item.id}
                equipment={item}
                onEquipmentClick={onEquipmentClick}
                onFavoriteClick={onFavoriteClick}
                isFavorite={favorites.has(item.id)}
                onAddToComparison={onAddToComparison}
                showCompareButton={true}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
