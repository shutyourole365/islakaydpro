import { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, Car, Footprints, Bike, Bus, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LiveLocationTrackerProps {
  equipmentLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  pickupTime?: Date;
}

interface TravelEstimate {
  mode: 'driving' | 'walking' | 'cycling' | 'transit';
  duration: number;
  distance: number;
}

export default function LiveLocationTracker({ equipmentLocation, pickupTime }: LiveLocationTrackerProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [travelEstimates, setTravelEstimates] = useState<TravelEstimate[]>([]);
  const [eta, setEta] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Generate realistic travel estimates based on distance
  const generateTravelEstimates = (distanceMiles: number): TravelEstimate[] => {
    return [
      { mode: 'driving', duration: Math.round(distanceMiles * 2.5), distance: distanceMiles }, // ~24 mph avg
      { mode: 'cycling', duration: Math.round(distanceMiles * 5), distance: distanceMiles }, // ~12 mph
      { mode: 'transit', duration: Math.round(distanceMiles * 6), distance: distanceMiles }, // ~10 mph with stops
      { mode: 'walking', duration: Math.round(distanceMiles * 20), distance: distanceMiles }, // ~3 mph
    ];
  };

  useEffect(() => {
    if (!isTracking) return;

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setError(null);

        // Calculate distance and ETA
        const dist = calculateDistance(
          latitude,
          longitude,
          equipmentLocation.lat,
          equipmentLocation.lng
        );
        setDistance(dist);
        
        // Generate travel estimates
        const estimates = generateTravelEstimates(dist);
        setTravelEstimates(estimates);
        
        // Set ETA based on driving
        const drivingTime = estimates.find(e => e.mode === 'driving')?.duration || 0;
        const etaDate = new Date(Date.now() + drivingTime * 60 * 1000);
        setEta(etaDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      },
      (err) => {
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking, equipmentLocation]);

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'driving':
        return <Car className="w-5 h-5" />;
      case 'cycling':
        return <Bike className="w-5 h-5" />;
      case 'transit':
        return <Bus className="w-5 h-5" />;
      case 'walking':
        return <Footprints className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const openNavigation = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${equipmentLocation.lat},${equipmentLocation.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Live Navigation</h3>
              <p className="text-sm text-blue-100">Real-time pickup tracking</p>
            </div>
          </div>
          
          <button
            onClick={() => setIsTracking(!isTracking)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              isTracking
                ? 'bg-white/20 hover:bg-white/30'
                : 'bg-white text-blue-600 hover:bg-blue-50'
            }`}
          >
            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Equipment Location */}
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Pickup Location</div>
            <div className="font-medium text-gray-900">{equipmentLocation.address}</div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Tracking Active */}
        {isTracking && userLocation && (
          <>
            {/* Distance & ETA Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {distance ? distance.toFixed(1) : '--'}
                </div>
                <div className="text-sm text-blue-500">miles away</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-green-600">{eta || '--:--'}</div>
                <div className="text-sm text-green-500">ETA (driving)</div>
              </div>
            </div>

            {/* Travel Mode Options */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Travel Options</div>
              {travelEstimates.map((estimate) => (
                <div
                  key={estimate.mode}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={openNavigation}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      {getModeIcon(estimate.mode)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 capitalize">{estimate.mode}</div>
                      <div className="text-sm text-gray-500">{estimate.distance.toFixed(1)} miles</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{formatDuration(estimate.duration)}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pickup Time Warning */}
            {pickupTime && distance && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span className="text-sm text-amber-700">
                    Pickup scheduled for {pickupTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {travelEstimates[0] && (
                      <span className="font-medium">
                        {' '}— Leave by {new Date(pickupTime.getTime() - travelEstimates[0].duration * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Start Navigation Button */}
        <button
          onClick={openNavigation}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 transition-all"
        >
          <Navigation className="w-5 h-5" />
          Open in Google Maps
        </button>

        {/* Status */}
        {isTracking && userLocation && (
          <div className="flex items-center justify-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            <span>Location tracking active</span>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
