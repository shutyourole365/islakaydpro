import { useState } from 'react';
import {
  Plus,
  Search,
  Heart,
  MessageSquare,
  BarChart3,
  Package,
  Calendar,
  MapPin,
  X,
  Zap,
} from 'lucide-react';

interface QuickActionsProps {
  onListEquipment: () => void;
  onSearch: () => void;
  onViewFavorites: () => void;
  onViewMessages: () => void;
  onViewAnalytics: () => void;
  onBulkBooking: () => void;
  onViewBookings: () => void;
  onNearbyEquipment: () => void;
}

export default function QuickActions({
  onListEquipment,
  onSearch,
  onViewFavorites,
  onViewMessages,
  onViewAnalytics,
  onBulkBooking,
  onViewBookings,
  onNearbyEquipment,
}: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: Plus,
      label: 'List Equipment',
      action: onListEquipment,
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Add new equipment for rent'
    },
    {
      icon: Search,
      label: 'Search',
      action: onSearch,
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Find equipment to rent'
    },
    {
      icon: Heart,
      label: 'Favorites',
      action: onViewFavorites,
      color: 'bg-red-500 hover:bg-red-600',
      description: 'View saved equipment'
    },
    {
      icon: MessageSquare,
      label: 'Messages',
      action: onViewMessages,
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Check conversations'
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      action: onViewAnalytics,
      color: 'bg-teal-500 hover:bg-teal-600',
      description: 'View your performance'
    },
    {
      icon: Package,
      label: 'Bulk Booking',
      action: onBulkBooking,
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'Book multiple items'
    },
    {
      icon: Calendar,
      label: 'My Bookings',
      action: onViewBookings,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      description: 'Manage your rentals'
    },
    {
      icon: MapPin,
      label: 'Nearby',
      action: onNearbyEquipment,
      color: 'bg-pink-500 hover:bg-pink-600',
      description: 'Find equipment near you'
    },
  ];

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative">
          {/* Action Buttons */}
          {isOpen && (
            <div className="absolute bottom-16 right-0 space-y-3 mb-2">
              {actions.map((action, index) => (
                <div
                  key={action.label}
                  className={`flex items-center space-x-3 animate-in slide-in-from-right-${index + 1}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Tooltip */}
                  <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg opacity-0 animate-in fade-in-0 slide-in-from-right-full whitespace-nowrap">
                    <div className="font-medium">{action.label}</div>
                    <div className="text-gray-300 text-xs">{action.description}</div>
                  </div>

                  {/* Button */}
                  <button
                    onClick={() => {
                      action.action();
                      setIsOpen(false);
                    }}
                    className={`w-12 h-12 rounded-full ${action.color} text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center`}
                  >
                    <action.icon className="w-6 h-6" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Main FAB */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-14 h-14 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl transform transition-all duration-200 flex items-center justify-center ${
              isOpen ? 'rotate-45' : ''
            }`}
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Zap className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}