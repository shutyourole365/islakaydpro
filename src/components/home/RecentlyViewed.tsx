import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import type { Equipment } from '../../types';
import EquipmentCard from '../equipment/EquipmentCard';

interface RecentlyViewedProps {
  onEquipmentClick: (equipment: Equipment) => void;
  onFavoriteClick: (equipmentId: string) => void;
  favorites: Set<string>;
}

export default function RecentlyViewed({ onEquipmentClick, onFavoriteClick, favorites }: RecentlyViewedProps) {
  const [items, setItems] = useState<Equipment[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentlyViewed');
      if (stored) {
        setItems(JSON.parse(stored).slice(0, 4));
      }
    } catch { /* ignore */ }
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Recently Viewed</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(item => (
            <EquipmentCard
              key={item.id}
              equipment={item}
              onEquipmentClick={onEquipmentClick}
              onFavoriteClick={onFavoriteClick}
              isFavorite={favorites.has(item.id)}
              variant="compact"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
