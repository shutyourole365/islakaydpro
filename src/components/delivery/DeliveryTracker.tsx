import { useState, useEffect } from 'react';
import {
  Truck,
  MapPin,
  Phone,
  MessageCircle,
  Package,
  CheckCircle,
  AlertCircle,
  Navigation,
  Star,
  RefreshCw,
  Share2,
  Bell,
} from 'lucide-react';

interface DeliveryStatus {
  status: 'preparing' | 'picked_up' | 'in_transit' | 'nearby' | 'delivered';
  timestamp: Date;
  location?: { lat: number; lng: number; address: string };
  note?: string;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  photo: string;
  rating: number;
  vehicleType: string;
  vehiclePlate: string;
}

interface DeliveryInfo {
  id: string;
  equipmentName: string;
  equipmentImage: string;
  pickupAddress: string;
  deliveryAddress: string;
  estimatedArrival: Date;
  actualArrival?: Date;
  driver: Driver;
  statusHistory: DeliveryStatus[];
  currentStatus: DeliveryStatus;
  trackingCode: string;
  specialInstructions?: string;
}

interface DeliveryTrackerProps {
  deliveryId?: string;
  onContactDriver?: () => void;
  onViewDetails?: () => void;
  className?: string;
}

// Demo data
const demoDelivery: DeliveryInfo = {
  id: 'DEL-001',
  equipmentName: 'CAT 320 Excavator',
  equipmentImage: 'https://images.unsplash.com/photo-1580901368919-7738efb0f87e?w=200',
  pickupAddress: '123 Equipment Yard, Industrial Zone',
  deliveryAddress: '456 Construction Site, Downtown',
  estimatedArrival: new Date(Date.now() + 25 * 60 * 1000), // 25 mins
  driver: {
    id: 'DRV-001',
    name: 'Mike Johnson',
    phone: '+1 555-0123',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    rating: 4.9,
    vehicleType: 'Flatbed Truck',
    vehiclePlate: 'ABC 1234',
  },
  trackingCode: 'ISK-TRK-2024-001',
  specialInstructions: 'Gate code: 4521. Ask for site manager.',
  statusHistory: [
    {
      status: 'preparing',
      timestamp: new Date(Date.now() - 90 * 60 * 1000),
      note: 'Equipment being prepared for transport',
    },
    {
      status: 'picked_up',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      location: { lat: 40.7128, lng: -74.006, address: '123 Equipment Yard' },
      note: 'Equipment loaded onto transport vehicle',
    },
    {
      status: 'in_transit',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      location: { lat: 40.7200, lng: -74.010, address: 'Highway 101' },
      note: 'En route to delivery location',
    },
  ],
  currentStatus: {
    status: 'in_transit',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    location: { lat: 40.7350, lng: -73.995, address: 'Main Street' },
    note: 'Driver is 25 minutes away',
  },
};

const statusSteps = [
  { key: 'preparing', label: 'Preparing', icon: Package },
  { key: 'picked_up', label: 'Picked Up', icon: CheckCircle },
  { key: 'in_transit', label: 'In Transit', icon: Truck },
  { key: 'nearby', label: 'Nearby', icon: MapPin },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function DeliveryTracker({
  deliveryId: _deliveryId,
  onContactDriver,
  onViewDetails,
  className = '',
}: DeliveryTrackerProps) {
  void _deliveryId;
  const [delivery, setDelivery] = useState<DeliveryInfo>(demoDelivery);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [notifications, setNotifications] = useState(true);

  // Calculate time remaining
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const diff = delivery.estimatedArrival.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Arriving now');
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);

      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes % 60}m`);
      } else {
        setTimeRemaining(`${minutes} min`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, [delivery.estimatedArrival]);

  // Simulate location updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate driver getting closer
      setDelivery(prev => ({
        ...prev,
        estimatedArrival: new Date(prev.estimatedArrival.getTime() - 60000),
      }));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const refreshStatus = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getCurrentStepIndex = () => {
    return statusSteps.findIndex(s => s.key === delivery.currentStatus.status);
  };

  const shareTracking = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Equipment Delivery Tracking',
        text: `Track your delivery: ${delivery.trackingCode}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/track/${delivery.trackingCode}`);
      alert('Tracking link copied to clipboard!');
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden ${className}`}>
      {/* Header with ETA */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Estimated Arrival</p>
              <p className="text-2xl font-bold">{timeRemaining}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={refreshStatus}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={shareTracking}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="relative">
          <div className="flex justify-between items-center">
            {statusSteps.map((step, index) => {
              const currentIndex = getCurrentStepIndex();
              const isComplete = index <= currentIndex;
              const isCurrent = index === currentIndex;

              return (
                <div key={step.key} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isComplete
                        ? 'bg-white text-blue-600'
                        : 'bg-white/20 text-white/50'
                    } ${isCurrent ? 'ring-4 ring-white/30' : ''}`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs mt-2 ${isComplete ? 'text-white' : 'text-white/50'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/20" style={{ zIndex: 0 }}>
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${(getCurrentStepIndex() / (statusSteps.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Equipment Info */}
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center gap-4">
          <img
            src={delivery.equipmentImage}
            alt={delivery.equipmentName}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {delivery.equipmentName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tracking: {delivery.trackingCode}
            </p>
          </div>
        </div>
      </div>

      {/* Live Map Placeholder */}
      <div className="h-48 bg-gray-100 dark:bg-gray-700 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Navigation className="w-12 h-12 text-blue-500 mx-auto mb-2 animate-pulse" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Live tracking map
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {delivery.currentStatus.location?.address || 'Location updating...'}
            </p>
          </div>
        </div>
        {/* Map controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg shadow flex items-center justify-center">
            <span className="text-lg font-bold text-gray-600 dark:text-gray-400">+</span>
          </button>
          <button className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg shadow flex items-center justify-center">
            <span className="text-lg font-bold text-gray-600 dark:text-gray-400">−</span>
          </button>
        </div>
      </div>

      {/* Driver Info */}
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={delivery.driver.photo}
              alt={delivery.driver.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {delivery.driver.name}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{delivery.driver.rating}</span>
                <span>•</span>
                <span>{delivery.driver.vehicleType}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.open(`tel:${delivery.driver.phone}`)}
              className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl hover:bg-green-200 dark:hover:bg-green-900/50"
            >
              <Phone className="w-5 h-5" />
            </button>
            <button
              onClick={onContactDriver}
              className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Vehicle:</span> {delivery.driver.vehiclePlate}
          </p>
        </div>
      </div>

      {/* Addresses */}
      <div className="p-4 border-b dark:border-gray-700">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Pickup</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {delivery.pickupAddress}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Delivery</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {delivery.deliveryAddress}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Special Instructions */}
      {delivery.specialInstructions && (
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Delivery Instructions
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {delivery.specialInstructions}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status History */}
      <div className="p-4">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <span className="font-medium">Delivery History</span>
          <span className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {showDetails && (
          <div className="mt-4 space-y-4">
            {[...delivery.statusHistory].reverse().map((status, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  {index < delivery.statusHistory.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                    {status.status.replace('_', ' ')}
                  </p>
                  {status.note && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{status.note}</p>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {status.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {status.location && ` • ${status.location.address}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-700">
        <div className="flex gap-3">
          <button
            onClick={() => setNotifications(!notifications)}
            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 ${
              notifications
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Bell className="w-5 h-5" />
            {notifications ? 'Notifications On' : 'Notifications Off'}
          </button>
          <button
            onClick={onViewDetails}
            className="flex-1 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl flex items-center justify-center gap-2"
          >
            <Package className="w-5 h-5" />
            View Booking
          </button>
        </div>
      </div>
    </div>
  );
}
