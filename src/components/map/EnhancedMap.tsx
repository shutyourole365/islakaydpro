import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin,
  Navigation,
  Minus,
  Plus,
  Layers,
  Filter,
  X,
  Star,
  Clock,
  Truck,
  Search,
  ChevronDown,
  ChevronUp,
  Route,
  Target,
  Compass,
  Map as MapIcon,
  Satellite,
  Thermometer,
  Wind,
  Droplets,
  Sun,
  Globe,
} from 'lucide-react';
import type { Equipment } from '../../types';

interface EnhancedMapProps {
  equipment: Equipment[];
  onEquipmentClick: (equipment: Equipment) => void;
  selectedId?: string;
  userLocation?: { lat: number; lng: number } | null;
  className?: string;
}

interface MapFilters {
  category: string;
  priceRange: [number, number];
  rating: number;
  availableNow: boolean;
  deliveryAvailable: boolean;
}

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
}

type MapStyle = 'roadmap' | 'satellite' | 'terrain' | 'dark';

export default function EnhancedMap({
  equipment,
  onEquipmentClick,
  selectedId,
  userLocation: initialUserLocation,
  className = '',
}: EnhancedMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [hoveredEquipment, setHoveredEquipment] = useState<Equipment | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [showWeather, setShowWeather] = useState(true);
  const [mapStyle, setMapStyle] = useState<MapStyle>('roadmap');
  const [routeMode, setRouteMode] = useState(false);
  const [clusteringEnabled, setClusteringEnabled] = useState(true);
  const [userLocation, setUserLocation] = useState(initialUserLocation);
  const [nearbyCount, setNearbyCount] = useState(0);
  const [searchRadius, setSearchRadius] = useState(10);
  const [showRadiusRing, setShowRadiusRing] = useState(true);
  
  const [filters, setFilters] = useState<MapFilters>({
    category: 'all',
    priceRange: [0, 1000],
    rating: 0,
    availableNow: false,
    deliveryAvailable: false,
  });

  const [weather] = useState<WeatherData>({
    temp: 72,
    condition: 'sunny',
    humidity: 45,
    wind: 8,
  });

  const tileLayerUrls: Record<MapStyle, string> = {
    roadmap: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  };

  const getWeatherIcon = () => {
    switch (weather.condition) {
      case 'sunny': return <Sun className="w-4 h-4 text-amber-500" />;
      case 'cloudy': return <Globe className="w-4 h-4 text-gray-500" />;
      case 'rainy': return <Droplets className="w-4 h-4 text-blue-500" />;
      default: return <Sun className="w-4 h-4 text-amber-500" />;
    }
  };

  const filteredEquipment = equipment.filter(item => {
    if (filters.category !== 'all' && item.category_id !== filters.category) return false;
    if (item.daily_rate < filters.priceRange[0] || item.daily_rate > filters.priceRange[1]) return false;
    if (item.rating < filters.rating) return false;
    if (filters.availableNow && item.availability_status !== 'available') return false;
    return true;
  });

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance) return;

    const initMap = async () => {
      try {
        const L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');

        const map = L.map(mapRef.current!, {
          center: userLocation ? [userLocation.lat, userLocation.lng] : [39.8283, -98.5795],
          zoom: userLocation ? 12 : 4,
          zoomControl: false,
          attributionControl: false,
        });

        L.tileLayer(tileLayerUrls[mapStyle], { maxZoom: 19 }).addTo(map);

        setMapInstance(map);
        setIsLoading(false);

        // Count nearby equipment
        if (userLocation) {
          const nearby = equipment.filter(item => {
            if (!item.latitude || !item.longitude) return false;
            const dist = calculateDistance(userLocation.lat, userLocation.lng, item.latitude, item.longitude);
            return dist <= searchRadius;
          });
          setNearbyCount(nearby.length);
        }
      } catch (error) {
        console.error('Error loading map:', error);
        setMapError('Failed to load map. Please try again later.');
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      if (mapInstance) mapInstance.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update tile layer when style changes
  useEffect(() => {
    if (!mapInstance) return;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapInstance.eachLayer((layer: any) => {
      if (layer._url) {
        mapInstance.removeLayer(layer);
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;
    L.tileLayer(tileLayerUrls[mapStyle], { maxZoom: 19 }).addTo(mapInstance);
  }, [mapInstance, mapStyle, tileLayerUrls]);

  // Add markers
  useEffect(() => {
    if (!mapInstance) return;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;

    // Clear existing markers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapInstance.eachLayer((layer: any) => {
      if (layer._icon) mapInstance.removeLayer(layer);
    });

    // Add equipment markers
    filteredEquipment.forEach(item => {
      if (!item.latitude || !item.longitude) return;

      const isSelected = selectedId === item.id;
      const markerHtml = `
        <div class="equipment-marker ${isSelected ? 'selected' : ''}">
          <div class="marker-container" style="
            background: ${isSelected ? 'linear-gradient(135deg, #0d9488, #10b981)' : 'white'};
            color: ${isSelected ? 'white' : '#1f2937'};
            padding: 6px 12px;
            border-radius: 999px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-weight: 600;
            font-size: 13px;
            white-space: nowrap;
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            $${item.daily_rate}/day
          </div>
        </div>
      `;

      const icon = L.divIcon({
        html: markerHtml,
        className: 'custom-marker',
        iconSize: [80, 40],
        iconAnchor: [40, 40],
      });

      const marker = L.marker([item.latitude, item.longitude], { icon })
        .addTo(mapInstance)
        .on('click', () => onEquipmentClick(item))
        .on('mouseover', () => setHoveredEquipment(item))
        .on('mouseout', () => setHoveredEquipment(null));
    });

    // Add user location marker
    if (userLocation) {
      const userIcon = L.divIcon({
        html: `
          <div style="
            width: 20px;
            height: 20px;
            background: #3b82f6;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(59,130,246,0.5);
          "></div>
        `,
        className: 'user-location-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(mapInstance)
        .bindPopup('Your Location');

      // Add radius ring if enabled
      if (showRadiusRing) {
        L.circle([userLocation.lat, userLocation.lng], {
          radius: searchRadius * 1609.34, // miles to meters
          color: '#0d9488',
          fillColor: '#0d9488',
          fillOpacity: 0.1,
          weight: 2,
          dashArray: '5, 5',
        }).addTo(mapInstance);
      }
    }

    // Fit bounds to show all equipment
    if (filteredEquipment.length > 0 && !userLocation) {
      const validEquipment = filteredEquipment.filter(e => e.latitude && e.longitude);
      if (validEquipment.length > 0) {
        const bounds = L.latLngBounds(validEquipment.map(e => [e.latitude!, e.longitude!]));
        mapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    }
  }, [mapInstance, filteredEquipment, selectedId, userLocation, showRadiusRing, searchRadius, onEquipmentClick]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleLocate = useCallback(() => {
    if (navigator.geolocation && mapInstance) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(newLocation);
          mapInstance.setView([newLocation.lat, newLocation.lng], 12);

          const nearby = equipment.filter(item => {
            if (!item.latitude || !item.longitude) return false;
            const dist = calculateDistance(newLocation.lat, newLocation.lng, item.latitude, item.longitude);
            return dist <= searchRadius;
          });
          setNearbyCount(nearby.length);
        },
        (error) => console.error('Geolocation error:', error)
      );
    }
  }, [mapInstance, equipment, searchRadius]);

  const handleZoomIn = () => mapInstance?.zoomIn();
  const handleZoomOut = () => mapInstance?.zoomOut();

  const handleRouteToEquipment = (item: Equipment) => {
    if (!userLocation || !item.latitude || !item.longitude) return;
    const distance = calculateDistance(userLocation.lat, userLocation.lng, item.latitude, item.longitude);
    alert(`Distance to ${item.title}: ${distance.toFixed(1)} miles\n\nOpening directions in Google Maps...`);
    window.open(`https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${item.latitude},${item.longitude}`);
  };

  return (
    <div className={`relative bg-gray-100 rounded-2xl overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 font-medium">Loading enhanced map...</p>
          </div>
        </div>
      )}

      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center p-6">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">{mapError}</p>
          </div>
        </div>
      )}

      <div ref={mapRef} className="w-full h-full min-h-[500px]" />

      {/* Search Bar */}
      <div className="absolute top-4 left-4 right-20 z-[1000]">
        <div className="bg-white rounded-xl shadow-lg flex items-center gap-2 px-4 py-3 max-w-md">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search location or equipment..."
            className="flex-1 bg-transparent outline-none text-gray-800"
          />
          <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-lg ${showFilters ? 'bg-teal-100 text-teal-600' : 'text-gray-400 hover:bg-gray-100'}`}>
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {showFilters && (
          <div className="mt-2 p-4 bg-white rounded-xl shadow-lg max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Map Filters</h4>
              <button onClick={() => setShowFilters(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Price Range ($/day)</label>
              <div className="flex items-center gap-3 mt-1">
                <input
                  type="number"
                  value={filters.priceRange[0]}
                  onChange={(e) => setFilters(f => ({ ...f, priceRange: [+e.target.value, f.priceRange[1]] }))}
                  className="w-20 px-2 py-1 border rounded-lg"
                  placeholder="Min"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  value={filters.priceRange[1]}
                  onChange={(e) => setFilters(f => ({ ...f, priceRange: [f.priceRange[0], +e.target.value] }))}
                  className="w-20 px-2 py-1 border rounded-lg"
                  placeholder="Max"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Minimum Rating</label>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setFilters(f => ({ ...f, rating }))}
                    className={`p-1 ${filters.rating >= rating ? 'text-amber-500' : 'text-gray-300'}`}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.availableNow}
                  onChange={(e) => setFilters(f => ({ ...f, availableNow: e.target.checked }))}
                  className="w-4 h-4 rounded text-teal-500"
                />
                <span className="text-sm">Available now</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.deliveryAvailable}
                  onChange={(e) => setFilters(f => ({ ...f, deliveryAvailable: e.target.checked }))}
                  className="w-4 h-4 rounded text-teal-500"
                />
                <span className="text-sm">Delivery available</span>
              </label>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Search Radius</label>
              <div className="flex items-center gap-3 mt-1">
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(+e.target.value)}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-gray-600 w-16">{searchRadius} mi</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
        <button onClick={handleZoomIn} className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50">
          <Plus className="w-5 h-5 text-gray-700" />
        </button>
        <button onClick={handleZoomOut} className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50">
          <Minus className="w-5 h-5 text-gray-700" />
        </button>
        <div className="w-10 h-px bg-gray-200 my-1" />
        <button onClick={handleLocate} className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50">
          <Navigation className="w-5 h-5 text-gray-700" />
        </button>
        <button onClick={() => setShowLayerPanel(!showLayerPanel)} className={`w-10 h-10 rounded-lg shadow-lg flex items-center justify-center ${showLayerPanel ? 'bg-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
          <Layers className="w-5 h-5" />
        </button>
        <button onClick={() => setRouteMode(!routeMode)} className={`w-10 h-10 rounded-lg shadow-lg flex items-center justify-center ${routeMode ? 'bg-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
          <Route className="w-5 h-5" />
        </button>
      </div>

      {/* Layer Panel */}
      {showLayerPanel && (
        <div className="absolute top-16 right-16 z-[1000] bg-white rounded-xl shadow-lg p-4 w-48 space-y-3">
          <h4 className="font-semibold text-gray-900">Map Style</h4>
          {(['roadmap', 'satellite', 'terrain', 'dark'] as MapStyle[]).map(style => (
            <button
              key={style}
              onClick={() => setMapStyle(style)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${mapStyle === style ? 'bg-teal-100 text-teal-700' : 'hover:bg-gray-50'}`}
            >
              {style === 'roadmap' && <MapIcon className="w-4 h-4" />}
              {style === 'satellite' && <Satellite className="w-4 h-4" />}
              {style === 'terrain' && <Compass className="w-4 h-4" />}
              {style === 'dark' && <Globe className="w-4 h-4" />}
              <span className="capitalize text-sm">{style}</span>
            </button>
          ))}
          <div className="border-t pt-3 space-y-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={clusteringEnabled}
                onChange={(e) => setClusteringEnabled(e.target.checked)}
                className="rounded text-teal-500"
              />
              Enable clustering
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showRadiusRing}
                onChange={(e) => setShowRadiusRing(e.target.checked)}
                className="rounded text-teal-500"
              />
              Show search radius
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showWeather}
                onChange={(e) => setShowWeather(e.target.checked)}
                className="rounded text-teal-500"
              />
              Show weather
            </label>
          </div>
        </div>
      )}

      {/* Weather Widget */}
      {showWeather && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur rounded-full px-4 py-2 shadow-lg flex items-center gap-4">
          <div className="flex items-center gap-2">
            {getWeatherIcon()}
            <span className="font-semibold">{weather.temp}°F</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <Droplets className="w-3 h-3" />
            {weather.humidity}%
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <Wind className="w-3 h-3" />
            {weather.wind}mph
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="absolute bottom-4 left-4 z-[1000] flex items-center gap-3">
        <div className="bg-white rounded-xl shadow-lg px-4 py-2 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-teal-500" />
            <span className="text-sm font-medium">{filteredEquipment.length} listings</span>
          </div>
          {userLocation && (
            <>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">{nearbyCount} within {searchRadius}mi</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Hovered Equipment Card */}
      {hoveredEquipment && (
        <div className="absolute bottom-4 right-4 z-[1000] max-w-sm pointer-events-none">
          <div className="bg-white rounded-xl shadow-xl p-4 pointer-events-auto">
            <div className="flex gap-3">
              <img
                src={hoveredEquipment.images[0]}
                alt={hoveredEquipment.title}
                className="w-24 h-24 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">{hoveredEquipment.title}</h4>
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  {hoveredEquipment.rating.toFixed(1)} ({hoveredEquipment.total_reviews})
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                  <MapPin className="w-3 h-3" />
                  {hoveredEquipment.location}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-teal-600 font-bold">${hoveredEquipment.daily_rate}/day</p>
                  {userLocation && hoveredEquipment.latitude && hoveredEquipment.longitude && (
                    <span className="text-xs text-gray-400">
                      {calculateDistance(userLocation.lat, userLocation.lng, hoveredEquipment.latitude, hoveredEquipment.longitude).toFixed(1)} mi
                    </span>
                  )}
                </div>
              </div>
            </div>
            {routeMode && userLocation && (
              <button
                onClick={() => handleRouteToEquipment(hoveredEquipment)}
                className="w-full mt-3 py-2 bg-teal-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-teal-600"
              >
                <Route className="w-4 h-4" />
                Get Directions
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
