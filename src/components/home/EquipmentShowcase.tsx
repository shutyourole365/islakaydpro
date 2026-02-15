import { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Heart,
  Share2,
  Eye,
  Award,
  Zap,
  Shield,
  Truck,
  Clock,
  Users,
  CheckCircle,
} from 'lucide-react';
import { Button } from '../ui/Button';
import type { Equipment } from '../../types';

interface EquipmentShowcaseProps {
  equipment: Equipment[];
  onEquipmentClick: (equipment: Equipment) => void;
  onFavoriteClick: (equipmentId: string) => void;
  favorites: Set<string>;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  onAddToComparison?: (equipment: Equipment) => void;
  onQuickBook?: (equipment: Equipment) => void;
  showDetailedPreview?: boolean;
}

export default function EquipmentShowcase({
  equipment,
  onEquipmentClick,
  onFavoriteClick,
  favorites,
  autoPlay = true,
  autoPlayInterval = 5000,
  onAddToComparison,
  onQuickBook,
  showDetailedPreview = true,
}: EquipmentShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animationType, setAnimationType] = useState<'fade' | 'slide' | 'zoom'>('fade');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAutoPlaying || equipment.length <= 1) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % equipment.length);
        setIsTransitioning(false);
      }, 300);
    }, autoPlayInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, equipment.length, autoPlayInterval]);

  const goToPrevious = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + equipment.length) % equipment.length);
      setIsTransitioning(false);
    }, 300);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % equipment.length);
      setIsTransitioning(false);
    }, 300);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    if (index === currentIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
    setIsAutoPlaying(false);
  };

  const toggleAnimation = () => {
    const animations: ('fade' | 'slide' | 'zoom')[] = ['fade', 'slide', 'zoom'];
    const currentIndex = animations.indexOf(animationType);
    setAnimationType(animations[(currentIndex + 1) % animations.length]);
  };

  const getAnimationClasses = () => {
    const baseClasses = "transition-all duration-500 ease-in-out";
    if (isTransitioning) {
      switch (animationType) {
        case 'fade':
          return `${baseClasses} opacity-0 scale-95`;
        case 'slide':
          return `${baseClasses} transform translate-x-4 opacity-0`;
        case 'zoom':
          return `${baseClasses} scale-110 opacity-0`;
        default:
          return baseClasses;
      }
    }
    return `${baseClasses} opacity-100 scale-100 translate-x-0`;
  };

  if (equipment.length === 0) {
    return (
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-8 text-white text-center">
        <Award className="w-16 h-16 mx-auto mb-4 opacity-80" />
        <h3 className="text-2xl font-bold mb-2">Featured Equipment Showcase</h3>
        <p className="text-teal-100">No equipment available at the moment</p>
      </div>
    );
  }

  const currentEquipment = equipment[currentIndex];

  return (
    <div className="relative bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative p-8">
        <div className={`flex flex-col lg:flex-row items-center gap-8 ${getAnimationClasses()}`}>
          {/* Equipment Image */}
          <div className="flex-shrink-0">
            <div className="relative">
              <img
                src={currentEquipment.images[0] || '/placeholder-equipment.jpg'}
                alt={currentEquipment.title}
                className="w-80 h-60 object-cover rounded-xl shadow-2xl"
              />
              {/* Featured Badge */}
              <div className="absolute top-4 left-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                <Award className="w-4 h-4" />
                FEATURED
              </div>
              {/* Rating Badge */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {currentEquipment.rating.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Equipment Details */}
          <div className="flex-1 text-white space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-3xl font-bold">{currentEquipment.title}</h3>
                {currentEquipment.owner?.is_verified && (
                  <span title="Verified Owner">
                    <Shield className="w-6 h-6 text-green-400" />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-teal-100 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{currentEquipment.location || 'Location not specified'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{currentEquipment.total_reviews} reviews</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{currentEquipment.total_bookings || 0} bookings</span>
                </div>
              </div>
              <p className="text-teal-100 text-lg leading-relaxed max-w-2xl">
                {currentEquipment.description || 'Professional equipment available for rent. Perfect for your project needs.'}
              </p>
            </div>

            {/* Enhanced Features */}
            {showDetailedPreview && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm">Quick Setup</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-sm">Insured</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
                  <Truck className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">Delivery</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm">Available</span>
                </div>
              </div>
            )}

            {/* Pricing */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold">${currentEquipment.daily_rate}</span>
                <span className="text-teal-200">per day</span>
              </div>
              <div className="flex gap-4 text-teal-200 text-sm">
                {currentEquipment.weekly_rate && (
                  <span>${currentEquipment.weekly_rate} weekly</span>
                )}
                {currentEquipment.monthly_rate && (
                  <span>${currentEquipment.monthly_rate} monthly</span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Min {currentEquipment.min_rental_days || 1} day{currentEquipment.min_rental_days !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => onEquipmentClick(currentEquipment)}
                className="bg-white text-teal-600 hover:bg-gray-100 px-6 py-3 font-semibold transform hover:scale-105 transition-transform"
              >
                View Details
              </Button>
              {onQuickBook && (
                <Button
                  onClick={() => onQuickBook(currentEquipment)}
                  className="bg-yellow-500 text-black hover:bg-yellow-400 px-6 py-3 font-semibold transform hover:scale-105 transition-transform"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Quick Book
                </Button>
              )}
              <Button
                onClick={() => onFavoriteClick(currentEquipment.id)}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-teal-600 px-6 py-3 transform hover:scale-105 transition-transform"
              >
                <Heart className={`w-4 h-4 mr-2 ${favorites.has(currentEquipment.id) ? 'fill-current text-red-400' : ''}`} />
                {favorites.has(currentEquipment.id) ? 'Saved' : 'Save'}
              </Button>
              {onAddToComparison && (
                <Button
                  onClick={() => onAddToComparison(currentEquipment)}
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-teal-600 px-6 py-3 transform hover:scale-105 transition-transform"
                >
                  Compare
                </Button>
              )}
              <button className="p-3 border border-white/30 rounded-lg text-white hover:bg-white/10 transition-all transform hover:scale-105">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {equipment.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {equipment.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
            {equipment.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Auto-play Toggle and Animation Controls */}
        {equipment.length > 1 && (
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={toggleAnimation}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors text-xs font-bold"
              title={`Animation: ${animationType}`}
            >
              {animationType === 'fade' ? 'F' : animationType === 'slide' ? 'S' : 'Z'}
            </button>
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
              title={isAutoPlaying ? 'Pause auto-play' : 'Start auto-play'}
            >
              {isAutoPlaying ? (
                <div className="w-3 h-3 bg-white rounded-sm" />
              ) : (
                <div className="w-0 h-0 border-l-2 border-white ml-0.5" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}