import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, MapPin, Star, Heart, Clock, Zap } from 'lucide-react';
import type { Equipment } from '../../types';

interface RecommendationsProps {
  currentEquipment?: Equipment;
  userBookingHistory?: string[];
  userLocation?: string;
  onEquipmentClick: (equipment: Equipment) => void;
  onFavoriteClick: (equipmentId: string) => void;
  favorites: Set<string>;
}

export default function EquipmentRecommendations({
  currentEquipment,
  userBookingHistory = [],
  userLocation,
  onEquipmentClick,
  onFavoriteClick,
  favorites,
}: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<{
    similar: Equipment[];
    alsoRented: Equipment[];
    nearbyAlternatives: Equipment[];
    trending: Equipment[];
  }>({
    similar: [],
    alsoRented: [],
    nearbyAlternatives: [],
    trending: [],
  });

  useEffect(() => {
    // Simulate recommendation algorithm
    // In production, this would call your recommendation API
    loadRecommendations();
  }, [currentEquipment, userBookingHistory]);

  const loadRecommendations = () => {
    // Demo data - replace with actual API calls
    const demoEquipment: Equipment[] = [
      {
        id: 'rec-1',
        owner_id: 'owner1',
        category_id: 'cat1',
        title: 'Kubota Mini Excavator - 3 Ton',
        description: 'Compact excavator perfect for tight spaces',
        brand: 'Kubota',
        model: 'KX033-4',
        condition: 'excellent',
        daily_rate: 350,
        weekly_rate: 2100,
        monthly_rate: 7000,
        deposit_amount: 1500,
        location: 'Los Angeles, CA',
        latitude: 34.0622,
        longitude: -118.2537,
        images: ['https://images.pexels.com/photos/1078884/pexels-photo-1078884.jpeg'],
        features: ['GPS Navigation', 'AC Cabin', 'Zero Tail Swing'],
        specifications: { weight: '3 tons', reach: '15 ft' },
        availability_status: 'available',
        min_rental_days: 1,
        max_rental_days: 60,
        rating: 4.8,
        total_reviews: 32,
        total_bookings: 67,
        is_featured: false,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'rec-2',
        owner_id: 'owner2',
        category_id: 'cat2',
        title: 'Canon R6 Mark II Camera Body',
        description: 'Latest mirrorless camera for professionals',
        brand: 'Canon',
        model: 'R6 Mark II',
        condition: 'new',
        daily_rate: 135,
        weekly_rate: 750,
        monthly_rate: 2400,
        deposit_amount: 600,
        location: 'San Francisco, CA',
        latitude: 37.7849,
        longitude: -122.4094,
        images: ['https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg'],
        features: ['24MP Sensor', '4K 60fps', 'Image Stabilization'],
        specifications: { sensor: '24MP Full Frame', video: '4K 60fps' },
        availability_status: 'available',
        min_rental_days: 1,
        max_rental_days: 21,
        rating: 5.0,
        total_reviews: 28,
        total_bookings: 92,
        is_featured: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    setRecommendations({
      similar: demoEquipment,
      alsoRented: demoEquipment,
      nearbyAlternatives: demoEquipment,
      trending: demoEquipment,
    });
  };

  const RecommendationCard = ({ equipment, reason }: { equipment: Equipment; reason: string }) => (
    <div className="flex-shrink-0 w-72 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden group cursor-pointer">
      <div className="relative h-48 overflow-hidden" onClick={() => onEquipmentClick(equipment)}>
        <img
          src={equipment.images[0]}
          alt={equipment.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteClick(equipment.id);
          }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${
            favorites.has(equipment.id)
              ? 'bg-red-500 text-white'
              : 'bg-white/90 text-gray-600 hover:bg-white'
          }`}
        >
          <Heart className={`w-5 h-5 ${favorites.has(equipment.id) ? 'fill-white' : ''}`} />
        </button>
        <div className="absolute top-3 left-3 px-3 py-1 bg-purple-500 text-white text-xs font-medium rounded-full">
          {reason}
        </div>
      </div>
      
      <div className="p-4" onClick={() => onEquipmentClick(equipment)}>
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
          {equipment.title}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-medium text-gray-900">{equipment.rating.toFixed(1)}</span>
            <span>({equipment.total_reviews})</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{equipment.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              ${equipment.daily_rate}
            </span>
            <span className="text-sm text-gray-500">/day</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEquipmentClick(equipment);
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-xl hover:shadow-lg transition-all"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 py-8">
      {/* Similar Equipment */}
      {currentEquipment && recommendations.similar.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Similar Equipment</h2>
              <p className="text-gray-600">
                Other options like {currentEquipment.title}
              </p>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {recommendations.similar.map((equipment) => (
              <RecommendationCard
                key={equipment.id}
                equipment={equipment}
                reason="Similar"
              />
            ))}
          </div>
        </section>
      )}

      {/* Frequently Rented Together */}
      {currentEquipment && recommendations.alsoRented.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Frequently Rented Together
              </h2>
              <p className="text-gray-600">
                Equipment often booked with {currentEquipment.brand} {currentEquipment.model}
              </p>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {recommendations.alsoRented.map((equipment) => (
              <RecommendationCard
                key={equipment.id}
                equipment={equipment}
                reason="Popular Combo"
              />
            ))}
          </div>
        </section>
      )}

      {/* Nearby Alternatives */}
      {userLocation && recommendations.nearbyAlternatives.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Nearby Options</h2>
              <p className="text-gray-600">
                Great equipment near {userLocation}
              </p>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {recommendations.nearbyAlternatives.map((equipment) => (
              <RecommendationCard
                key={equipment.id}
                equipment={equipment}
                reason="Nearby"
              />
            ))}
          </div>
        </section>
      )}

      {/* Trending Now */}
      {recommendations.trending.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
              <p className="text-gray-600">
                Most popular equipment this week
              </p>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {recommendations.trending.map((equipment) => (
              <RecommendationCard
                key={equipment.id}
                equipment={equipment}
                reason="🔥 Trending"
              />
            ))}
          </div>
        </section>
      )}

      {/* Based on Your History */}
      {userBookingHistory.length > 0 && (
        <section className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Based on Your History
              </h2>
              <p className="text-gray-600">
                Equipment we think you'll love
              </p>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {recommendations.similar.map((equipment) => (
              <RecommendationCard
                key={equipment.id}
                equipment={equipment}
                reason="For You"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
