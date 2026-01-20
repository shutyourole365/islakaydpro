import { useEffect, useRef, useState } from 'react';
import { MapPin, X, Navigation, Layers, Minus, Plus } from 'lucide-react';
import type { Equipment } from '../../types';

interface EquipmentMapProps {
  equipment: Equipment[];
  onEquipmentClick: (equipment: Equipment) => void;
  selectedId?: string;
  className?: string;
}

interface MapMarker {
  equipment: Equipment;
  element: HTMLDivElement;
}

export default function EquipmentMap({
  equipment,
  onEquipmentClick,
  selectedId,
  className = '',
}: EquipmentMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [hoveredEquipment, setHoveredEquipment] = useState<Equipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

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

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
        }).addTo(map);

        L.control.attribution({
          position: 'bottomright',
        }).addTo(map);

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
  }, []);

  useEffect(() => {
    if (!mapInstance) return;

    markers.forEach(({ element }) => element.remove());

    const newMarkers: MapMarker[] = [];
    const L = (window as any).L;

    equipment.forEach((item) => {
      if (!item.latitude || !item.longitude) return;

      const markerElement = document.createElement('div');
      markerElement.className = `equipment-marker ${selectedId === item.id ? 'selected' : ''}`;
      markerElement.innerHTML = `
        <div class="marker-container">
          <div class="marker-price">$${item.daily_rate}/day</div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerElement,
        className: 'custom-marker-icon',
        iconSize: [80, 40],
        iconAnchor: [40, 40],
      });

      const marker = L.marker([item.latitude, item.longitude], {
        icon: customIcon,
      }).addTo(mapInstance);

      marker.on('click', () => onEquipmentClick(item));
      marker.on('mouseover', () => setHoveredEquipment(item));
      marker.on('mouseout', () => setHoveredEquipment(null));

      newMarkers.push({ equipment: item, element: markerElement });
    });

    setMarkers(newMarkers);

    if (equipment.length > 0) {
      const validEquipment = equipment.filter((e) => e.latitude && e.longitude);
      if (validEquipment.length > 0) {
        const bounds = L.latLngBounds(
          validEquipment.map((e) => [e.latitude!, e.longitude!])
        );
        mapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    }
  }, [mapInstance, equipment, selectedId, onEquipmentClick]);

  const handleZoomIn = () => {
    if (mapInstance) {
      mapInstance.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstance) {
      mapInstance.zoomOut();
    }
  };

  const handleLocate = () => {
    if (navigator.geolocation && mapInstance) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          mapInstance.setView(
            [position.coords.latitude, position.coords.longitude],
            12
          );
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  return (
    <div className={`relative bg-gray-100 rounded-2xl overflow-hidden ${className}`}>
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
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 font-medium">Loading map...</p>
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

      <div ref={mapRef} className="w-full h-full min-h-[400px]" />

      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <Plus className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <Minus className="w-5 h-5 text-gray-700" />
        </button>
        <div className="w-10 h-px bg-gray-200 my-1" />
        <button
          onClick={handleLocate}
          className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <Navigation className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {hoveredEquipment && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] pointer-events-none">
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
    </div>
  );
}
