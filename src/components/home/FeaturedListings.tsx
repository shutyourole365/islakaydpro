import { Star, ArrowRight } from 'lucide-react';
import type { Equipment } from '../../types';
import EquipmentCard from '../equipment/EquipmentCard';

interface FeaturedListingsProps {
  equipment: Equipment[];
  onEquipmentClick: (equipment: Equipment) => void;
  onFavoriteClick: (equipmentId: string) => void;
  favorites: Set<string>;
  onAddToComparison?: (equipment: Equipment) => void;
  onViewAll?: () => void;
  isLoading?: boolean;
}

export default function FeaturedListings({
  equipment,
  onEquipmentClick,
  onFavoriteClick,
  favorites,
  onAddToComparison,
  onViewAll,
  isLoading = false,
}: FeaturedListingsProps) {
  return (
    <section className="relative py-28 bg-white dark:bg-gray-950 overflow-hidden">
      {/* Decorative depth */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 w-[28rem] h-[28rem] bg-teal-500/10 dark:bg-teal-500/[0.07] rounded-full blur-[120px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-24 w-[28rem] h-[28rem] bg-emerald-500/10 dark:bg-emerald-500/[0.06] rounded-full blur-[120px]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-amber-500/20 rounded-full text-sm font-semibold mb-5">
              <Star className="w-4 h-4 fill-amber-500" />
              Featured Equipment
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-3 text-balance">
              Top-rated equipment <span className="text-gradient-animated">near you</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 text-pretty">
              Discover highly-rated equipment from verified owners
            </p>
          </div>
          <button
            onClick={() => onViewAll?.()}
            className="group flex items-center gap-2 text-teal-600 dark:text-teal-400 font-semibold hover:gap-3 transition-all"
          >
            View All
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-soft border border-gray-100 dark:border-gray-700 animate-pulse">
                <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                </div>
              </div>
            ))
          ) : (
            equipment.slice(0, 8).map((item, index) => (
              <div
                key={item.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${Math.min(index * 60, 480)}ms`, animationFillMode: 'both' }}
              >
                <EquipmentCard
                  equipment={item}
                  onEquipmentClick={onEquipmentClick}
                  onFavoriteClick={onFavoriteClick}
                  isFavorite={favorites.has(item.id)}
                  onAddToComparison={onAddToComparison}
                  showCompareButton={true}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
