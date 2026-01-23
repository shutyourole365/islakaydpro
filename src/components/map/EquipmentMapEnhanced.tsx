import { useEffect, useRef, useState, useCallback } from 'react';
import {
  MapPin,
  Minus,
  Plus,
  Layers,
  Search,
  Filter,
  X,
  List,
  Maximize2,
  LocateFixed,
  Satellite,
} from 'lucide-react';
import type { Equipment } from '../../types';

interface EquipmentMapEnhancedProps {
  equipment: Equipment[];
  onEquipmentClick: (equipment: Equipment) => void;
  selectedId?: string;
  className?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  showLayerControl?: boolean;
  enableClustering?: boolean;
  enableRouting?: boolean;
  userLocation?: { lat: number; lng: number } | null;
}

interface Cluster {
  lat: number;
  lng: number;
  count: number;
  equipment: Equipment[];
}

type MapStyle = 'streets' | 'satellite' | 'terrain' | 'dark';

export default function EquipmentMapEnhanced({
  equipment,
  onEquipmentClick: _onEquipmentClick,
  selectedId: _selectedId,
  className = '',
  showSearch = true,
  showFilters = true,
  showLayerControl = true,
  enableClustering = true,
  enableRouting: _enableRouting = false,
  userLocation: _userLocation = null,
}: EquipmentMapEnhancedProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [hoveredEquipment] = useState<Equipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [mapStyle, setMapStyle] = useState<MapStyle>('streets');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [zoomLevel, setZoomLevel] = useState(4);
  const [, setClusters] = useState<Cluster[]>([]);
  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 1000,
    rating: 0,
    category: '',
    available: true,
  });

  // Filtered equipment based on search and filters
  const filteredEquipment = equipment.filter((item) => {
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (item.daily_rate < filters.priceMin || item.daily_rate > filters.priceMax) {
      return false;
    }
    if (filters.rating && item.rating < filters.rating) {
      return false;
    }
    if (filters.category && item.category?.slug !== filters.category) {
      return false;
    }
    return true;
  });

  // Calculate clusters for zoom level
  const calculateClusters = useCallback((items: Equipment[], zoom: number): Cluster[] => {
    if (!enableClustering || zoom > 10) {
      return items.map(item => ({
        lat: item.latitude || 0,
        lng: item.longitude || 0,
        count: 1,
        equipment: [item],
      }));
    }

    const clusterRadius = 50 / Math.pow(2, zoom - 3);
    const clustered: Cluster[] = [];
    const used = new Set<string>();

    items.forEach((item) => {
      if (!item.latitude || !item.longitude || used.has(item.id)) return;

      const nearby = items.filter((other) => {
        if (!other.latitude || !other.longitude || used.has(other.id)) return false;
        const distance = Math.sqrt(
          Math.pow(item.latitude! - other.latitude!, 2) +
          Math.pow(item.longitude! - other.longitude!, 2)
        );
        return distance < clusterRadius;
      });

      if (nearby.length > 0) {
        const avgLat = nearby.reduce((sum, e) => sum + (e.latitude || 0), 0) / nearby.length;
        const avgLng = nearby.reduce((sum, e) => sum + (e.longitude || 0), 0) / nearby.length;
        clustered.push({
          lat: avgLat,
          lng: avgLng,
          count: nearby.length,
          equipment: nearby,
        });
        nearby.forEach(e => used.add(e.id));
      }
    });

    return clustered;
  }, [enableClustering]);

  useEffect(() => {
    const newClusters = calculateClusters(filteredEquipment, zoomLevel);
    setClusters(newClusters);
  }, [filteredEquipment, zoomLevel, calculateClusters]);

  // Map tile sources
  const tileLayers: Record<MapStyle, { url: string; attribution: string }> = {
    streets: {
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap contributors, &copy; CARTO',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri',
    },
    terrain: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenTopoMap',
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap contributors, &copy; CARTO',
    },
  };

  useEffect(() => {
    if (!mapRef.current || mapInstance) return;

    const initMap = async () => {
      try {
        const L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');

        const map = L.map(mapRef.current!, {
          center: [39.8283, -98.5795],
          zoom: 4,
          zoomControl: false,
          attributionControl: false,
        });

        const { url, attribution } = tileLayers[mapStyle];
        L.tileLayer(url, { maxZoom: 19, attribution }).addTo(map);

        L.control.attribution({ position: 'bottomright' }).addTo(map);

        map.on('zoomend', () => {
          setZoomLevel(map.getZoom());
        });

        setMapInstance(map);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading map:', error);
        setMapError('Failed to load map. Please try again later.');
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle user location
  const handleLocate = () => {
    if (navigator.geolocation && mapInstance) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          mapInstance.setView([position.coords.latitude, position.coords.longitude], 12);
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  const handleZoomIn = () => mapInstance?.zoomIn();
  const handleZoomOut = () => mapInstance?.zoomOut();

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const clearFilters = () => {
    setFilters({
      priceMin: 0,
      priceMax: 1000,
      rating: 0,
      category: '',
      available: true,
    });
    setSearchQuery('');
  };

  const activeFilterCount = [
    filters.priceMin > 0,
    filters.priceMax < 1000,
    filters.rating > 0,
    filters.category !== '',
  ].filter(Boolean).length;

  return (
    <div
      className={`relative bg-gray-100 rounded-2xl overflow-hidden ${className} ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* Custom Map Styles */}
      <style>{`
        .custom-marker-icon {
          background: transparent !important;
          border: none !important;
        }
        .equipment-marker .marker-container {
          background: white;
          border-radius: 9999px;
          padding: 6px 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          cursor: pointer;
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }
        .equipment-marker .marker-container:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        }
        .equipment-marker.selected .marker-container {
          background: #0d9488;
          border-color: #0d9488;
        }
        .equipment-marker .marker-price {
          font-weight: 600;
          font-size: 13px;
          color: #1f2937;
          white-space: nowrap;
        }
        .equipment-marker.selected .marker-price {
          color: white;
        }
        .cluster-marker {
          background: linear-gradient(135deg, #0d9488, #10b981);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.4);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .cluster-marker:hover {
          transform: scale(1.1);
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 font-medium">Loading map...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center p-6">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">{mapError}</p>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full min-h-[500px]" />

      {/* Search Bar */}
      {showSearch && (
        <div className="absolute top-4 left-4 right-20 z-[1000]">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search equipment on map..."
                className="w-full pl-10 pr-4 py-3 bg-white rounded-xl shadow-lg border-0 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            {showFilters && (
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className={`p-3 rounded-xl shadow-lg transition-colors relative ${
                  showFilterPanel ? 'bg-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-5 h-5" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilterPanel && (
            <div className="mt-2 bg-white rounded-xl shadow-lg p-4 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-teal-600 hover:text-teal-700"
                >
                  Clear all
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Min Price</label>
                  <input
                    type="number"
                    value={filters.priceMin}
                    onChange={(e) => setFilters({ ...filters, priceMin: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Max Price</label>
                  <input
                    type="number"
                    value={filters.priceMax}
                    onChange={(e) => setFilters({ ...filters, priceMax: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-sm text-gray-600 mb-1 block">Minimum Rating</label>
                <div className="flex gap-2">
                  {[0, 3, 4, 4.5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setFilters({ ...filters, rating })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filters.rating === rating
                          ? 'bg-teal-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {rating === 0 ? 'Any' : `${rating}+`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowFilterPanel(false)}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
        <button
          onClick={toggleFullscreen}
          className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <Maximize2 className="w-5 h-5 text-gray-700" />
        </button>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <Plus className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Minus className="w-5 h-5 text-gray-700" />
          </button>
        </div>
        <button
          onClick={handleLocate}
          className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <LocateFixed className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Layer Control */}
      {showLayerControl && (
        <div className="absolute bottom-20 right-4 z-[1000]">
          <div className="bg-white rounded-lg shadow-lg p-2">
            <div className="flex gap-1">
              {[
                { id: 'streets', icon: Layers, label: 'Streets' },
                { id: 'satellite', icon: Satellite, label: 'Satellite' },
              ].map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => setMapStyle(layer.id as MapStyle)}
                  className={`p-2 rounded-lg transition-colors ${
                    mapStyle === layer.id
                      ? 'bg-teal-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title={layer.label}
                >
                  <layer.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="bg-white rounded-lg shadow-lg p-1 flex">
          <button
            onClick={() => setViewMode('map')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'map' ? 'bg-teal-500 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-teal-500 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]">
        <div className="bg-white rounded-full shadow-lg px-4 py-2 text-sm font-medium text-gray-700">
          {filteredEquipment.length} results
          {searchQuery && ` for "${searchQuery}"`}
        </div>
      </div>

      {/* Hovered Equipment Card */}
      {hoveredEquipment && (
        <div className="absolute bottom-20 left-4 right-4 z-[1000] pointer-events-none">
          <div className="bg-white rounded-xl shadow-xl p-4 max-w-sm pointer-events-auto">
            <div className="flex gap-3">
              <img
                src={hoveredEquipment.images[0]}
                alt={hoveredEquipment.title}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">
                  {hoveredEquipment.title}
                </h4>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {hoveredEquipment.location}
                </p>
                <p className="text-teal-600 font-semibold mt-2">
                  ${hoveredEquipment.daily_rate}/day
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Close Button */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-16 z-[1001] w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>
      )}
    </div>
  );
}
