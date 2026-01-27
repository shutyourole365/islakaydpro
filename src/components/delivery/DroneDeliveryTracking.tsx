import { useState, useEffect } from 'react';
import {
  Package,
  MapPin,
  Plane,
  CheckCircle2,
  AlertCircle,
  Navigation,
  Camera,
  Phone,
  Share2,
  XCircle,
  Wind,
  Battery,
  Eye,
} from 'lucide-react';

interface DroneDeliveryTrackingProps {
  bookingId: string;
  equipmentTitle: string;
  pickupLocation: { lat: number; lng: number; address: string };
  deliveryLocation: { lat: number; lng: number; address: string };
  estimatedDelivery: Date;
  onClose?: () => void;
}

interface DroneStatus {
  phase: 'preparing' | 'launching' | 'in-flight' | 'approaching' | 'landing' | 'delivered';
  latitude: number;
  longitude: number;
  altitude: number; // meters
  speed: number; // km/h
  batteryLevel: number; // percentage
  signalStrength: number; // percentage
  temperature: number; // celsius
  eta: number; // minutes
  distanceRemaining: number; // km
  windSpeed: number; // km/h
  droneId: string;
}

interface TrackingEvent {
  time: Date;
  event: string;
  description: string;
  icon: 'package' | 'plane' | 'check' | 'alert' | 'camera';
}

export default function DroneDeliveryTracking({
  bookingId,
  equipmentTitle,
  pickupLocation,
  deliveryLocation,
  estimatedDelivery: _estimatedDelivery,
  onClose,
}: DroneDeliveryTrackingProps) {
  // estimatedDelivery reserved for display
  const [status, setStatus] = useState<DroneStatus>({
    phase: 'preparing',
    latitude: pickupLocation.lat,
    longitude: pickupLocation.lng,
    altitude: 0,
    speed: 0,
    batteryLevel: 100,
    signalStrength: 100,
    temperature: 22,
    eta: 25,
    distanceRemaining: 5.2,
    windSpeed: 12,
    droneId: 'DRN-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
  });
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [showLiveView, setShowLiveView] = useState(false);
  const [isLive, _setIsLive] = useState(true); // Reserved for live toggle

  useEffect(() => {
    // Initialize with first event
    setEvents([
      {
        time: new Date(),
        event: 'Order Received',
        description: 'Your drone delivery has been scheduled',
        icon: 'package',
      },
    ]);

    // Simulate drone progress
    const interval = setInterval(() => {
      setStatus((prev) => {
        let newPhase = prev.phase;
        let newAltitude = prev.altitude;
        let newSpeed = prev.speed;
        let newEta = prev.eta;
        let newDistance = prev.distanceRemaining;
        let newBattery = prev.batteryLevel;

        // Progress through phases
        if (prev.phase === 'preparing' && Math.random() > 0.7) {
          newPhase = 'launching';
          addEvent('Drone Launching', 'Drone is taking off from hub', 'plane');
        } else if (prev.phase === 'launching' && prev.altitude >= 50) {
          newPhase = 'in-flight';
          addEvent('In Flight', 'Drone is en route to your location', 'plane');
        } else if (prev.phase === 'in-flight' && newDistance <= 1) {
          newPhase = 'approaching';
          addEvent('Approaching', 'Drone is approaching delivery zone', 'plane');
        } else if (prev.phase === 'approaching' && newDistance <= 0.1) {
          newPhase = 'landing';
          addEvent('Landing', 'Drone is descending for delivery', 'plane');
        } else if (prev.phase === 'landing' && newAltitude <= 5) {
          newPhase = 'delivered';
          addEvent('Delivered!', 'Your equipment has arrived', 'check');
        }

        // Update metrics based on phase
        if (newPhase === 'launching') {
          newAltitude = Math.min(100, prev.altitude + 10);
          newSpeed = Math.min(40, prev.speed + 5);
        } else if (newPhase === 'in-flight') {
          newAltitude = 100 + Math.sin(Date.now() / 1000) * 5;
          newSpeed = 65 + Math.random() * 10;
          newDistance = Math.max(0, prev.distanceRemaining - 0.05);
          newEta = Math.max(0, Math.ceil(newDistance / (newSpeed / 60)));
        } else if (newPhase === 'approaching') {
          newAltitude = Math.max(30, prev.altitude - 5);
          newSpeed = Math.max(20, prev.speed - 5);
          newDistance = Math.max(0, prev.distanceRemaining - 0.02);
        } else if (newPhase === 'landing') {
          newAltitude = Math.max(0, prev.altitude - 8);
          newSpeed = Math.max(0, prev.speed - 8);
        }

        // Battery drain
        if (newPhase !== 'preparing' && newPhase !== 'delivered') {
          newBattery = Math.max(20, prev.batteryLevel - 0.1);
        }

        return {
          ...prev,
          phase: newPhase,
          altitude: newAltitude,
          speed: newSpeed,
          eta: newEta,
          distanceRemaining: newDistance,
          batteryLevel: newBattery,
          signalStrength: 85 + Math.random() * 15,
          temperature: 20 + Math.random() * 5,
          windSpeed: 10 + Math.random() * 10,
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const addEvent = (event: string, description: string, icon: TrackingEvent['icon']) => {
    setEvents((prev) => [
      { time: new Date(), event, description, icon },
      ...prev,
    ]);
  };

  const getPhaseProgress = () => {
    const phases = ['preparing', 'launching', 'in-flight', 'approaching', 'landing', 'delivered'];
    return ((phases.indexOf(status.phase) + 1) / phases.length) * 100;
  };

  const getPhaseLabel = () => {
    switch (status.phase) {
      case 'preparing': return 'Preparing Package';
      case 'launching': return 'Taking Off';
      case 'in-flight': return 'In Flight';
      case 'approaching': return 'Approaching';
      case 'landing': return 'Landing';
      case 'delivered': return 'Delivered!';
    }
  };

  const getEventIcon = (icon: TrackingEvent['icon']) => {
    switch (icon) {
      case 'package': return <Package className="w-4 h-4" />;
      case 'plane': return <Plane className="w-4 h-4" />;
      case 'check': return <CheckCircle2 className="w-4 h-4" />;
      case 'alert': return <AlertCircle className="w-4 h-4" />;
      case 'camera': return <Camera className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-sky-500 to-blue-600 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Plane className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Drone Delivery</h2>
              <p className="text-sm text-white/80">ID: {status.droneId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isLive && (
              <span className="flex items-center gap-1 px-3 py-1 bg-red-500 rounded-full text-sm">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </span>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/80">Delivery Progress</span>
            <span className="font-semibold">{getPhaseLabel()}</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${getPhaseProgress()}%` }}
            />
          </div>
        </div>
      </div>

      {/* Map Area (Placeholder) */}
      <div className="relative h-64 bg-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-100 to-blue-50">
          {/* Simulated map with path */}
          <svg className="w-full h-full" viewBox="0 0 400 200">
            {/* Path */}
            <path
              d="M 50 150 Q 200 50 350 150"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            {/* Progress path */}
            <path
              d="M 50 150 Q 200 50 350 150"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeDasharray={`${getPhaseProgress() * 3.5},1000`}
            />
            {/* Pickup marker */}
            <circle cx="50" cy="150" r="8" fill="#22c55e" />
            <text x="50" y="175" textAnchor="middle" className="text-xs fill-gray-600">Pickup</text>
            {/* Delivery marker */}
            <circle cx="350" cy="150" r="8" fill="#ef4444" />
            <text x="350" y="175" textAnchor="middle" className="text-xs fill-gray-600">Delivery</text>
            {/* Drone */}
            <g transform={`translate(${50 + (getPhaseProgress() / 100) * 300}, ${150 - Math.sin((getPhaseProgress() / 100) * Math.PI) * 100})`}>
              <circle r="15" fill="#3b82f6" />
              <text y="5" textAnchor="middle" className="text-lg">🚁</text>
            </g>
          </svg>
        </div>

        {/* ETA Overlay */}
        <div className="absolute top-4 right-4 bg-white rounded-xl shadow-lg p-4">
          <div className="text-3xl font-bold text-gray-900">
            {status.phase === 'delivered' ? '✓' : `${status.eta} min`}
          </div>
          <div className="text-sm text-gray-500">
            {status.phase === 'delivered' ? 'Delivered!' : 'Estimated arrival'}
          </div>
        </div>

        {/* Live View Button */}
        <button
          onClick={() => setShowLiveView(!showLiveView)}
          className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg text-sm font-medium text-gray-700"
        >
          <Eye className="w-4 h-4" />
          {showLiveView ? 'Hide' : 'Drone'} Camera
        </button>
      </div>

      {/* Drone Telemetry */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Live Telemetry</h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <Navigation className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <div className="text-lg font-semibold text-gray-900">{status.altitude.toFixed(0)}m</div>
            <div className="text-xs text-gray-500">Altitude</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <Plane className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <div className="text-lg font-semibold text-gray-900">{status.speed.toFixed(0)}</div>
            <div className="text-xs text-gray-500">km/h</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <Battery className={`w-5 h-5 mx-auto mb-1 ${status.batteryLevel > 50 ? 'text-green-500' : 'text-amber-500'}`} />
            <div className="text-lg font-semibold text-gray-900">{status.batteryLevel.toFixed(0)}%</div>
            <div className="text-xs text-gray-500">Battery</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <Wind className="w-5 h-5 text-cyan-500 mx-auto mb-1" />
            <div className="text-lg font-semibold text-gray-900">{status.windSpeed.toFixed(0)}</div>
            <div className="text-xs text-gray-500">km/h wind</div>
          </div>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Delivery Details</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{equipmentTitle}</p>
              <p className="text-sm text-gray-500">Booking #{bookingId.slice(0, 8)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Delivering to</p>
              <p className="text-sm text-gray-500">{deliveryLocation.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Tracking History</h3>
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {events.map((event, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                event.icon === 'check' ? 'bg-green-100 text-green-600' :
                event.icon === 'alert' ? 'bg-amber-100 text-amber-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {getEventIcon(event.icon)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{event.event}</p>
                <p className="text-sm text-gray-500">{event.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {event.time.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <div className="flex gap-3">
          <button className="flex-1 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50">
            <Phone className="w-5 h-5" />
            Contact Support
          </button>
          <button className="flex-1 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50">
            <Share2 className="w-5 h-5" />
            Share Tracking
          </button>
        </div>
      </div>
    </div>
  );
}
