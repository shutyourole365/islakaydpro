import { useState, useEffect, useRef } from 'react';
import { Camera, RotateCcw, ZoomIn, ZoomOut, Maximize2, X, Ruler, Move3D } from 'lucide-react';

interface Equipment3DViewerProps {
  images: string[];
  title: string;
  onClose?: () => void;
}

export default function Equipment3DViewer({ images, title, onClose }: Equipment3DViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showMeasurements, setShowMeasurements] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-rotate through images to simulate 360° view
  useEffect(() => {
    if (isRotating && images.length > 1) {
      autoRotateRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setRotation((prev) => (prev + 360 / images.length) % 360);
      }, 100);
    } else if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current);
    }

    return () => {
      if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    };
  }, [isRotating, images.length]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
    setCurrentIndex(0);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Move3D className="w-6 h-6 text-teal-400" />
          <div>
            <h2 className="text-white font-semibold">{title}</h2>
            <p className="text-gray-400 text-sm">360° Interactive View</p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-6 h-6 text-gray-400" />
        </button>
      </div>

      {/* Main Viewer */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Image */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-100"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
          }}
        >
          <img
            src={images[currentIndex]}
            alt={`${title} - View ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain select-none"
            draggable={false}
          />

          {/* Measurement Overlay */}
          {showMeasurements && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Horizontal measurement */}
              <div className="absolute left-1/4 right-1/4 top-1/2 flex items-center">
                <div className="flex-1 h-0.5 bg-teal-400" />
                <span className="px-2 py-1 bg-teal-500 text-white text-xs rounded mx-1">
                  ~48"
                </span>
                <div className="flex-1 h-0.5 bg-teal-400" />
              </div>
              {/* Vertical measurement */}
              <div className="absolute top-1/4 bottom-1/4 left-1/2 flex flex-col items-center">
                <div className="flex-1 w-0.5 bg-teal-400" />
                <span className="px-2 py-1 bg-teal-500 text-white text-xs rounded my-1 whitespace-nowrap">
                  ~36"
                </span>
                <div className="flex-1 w-0.5 bg-teal-400" />
              </div>
            </div>
          )}
        </div>

        {/* Rotation indicator */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/80 rounded-full backdrop-blur-sm">
            <div 
              className="w-4 h-4 border-2 border-teal-400 rounded-full relative"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <div className="absolute top-0 left-1/2 w-0.5 h-2 bg-teal-400 -translate-x-1/2 -translate-y-1" />
            </div>
            <span className="text-gray-400 text-sm">{Math.round(rotation)}°</span>
          </div>
        </div>

        {/* Image counter */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/80 rounded-full backdrop-blur-sm">
            <Camera className="w-4 h-4 text-teal-400" />
            <span className="text-white text-sm">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
        </div>

        {/* Zoom level */}
        <div className="absolute top-4 right-4">
          <div className="px-3 py-1.5 bg-gray-900/80 rounded-full backdrop-blur-sm">
            <span className="text-white text-sm">{Math.round(zoom * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Image Thumbnails */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setRotation((index / images.length) * 360);
              }}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex ? 'border-teal-400 scale-110' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              isRotating
                ? 'bg-teal-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <RotateCcw className={`w-5 h-5 ${isRotating ? 'animate-spin' : ''}`} />
            <span>{isRotating ? 'Stop' : 'Auto Rotate'}</span>
          </button>

          <div className="flex items-center bg-gray-800 rounded-lg">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-700 rounded-l-lg transition-colors"
            >
              <ZoomOut className="w-5 h-5 text-gray-300" />
            </button>
            <div className="w-px h-6 bg-gray-700" />
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-700 rounded-r-lg transition-colors"
            >
              <ZoomIn className="w-5 h-5 text-gray-300" />
            </button>
          </div>

          <button
            onClick={() => setShowMeasurements(!showMeasurements)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              showMeasurements
                ? 'bg-purple-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Ruler className="w-5 h-5" />
            <span>Measurements</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Maximize2 className="w-5 h-5" />
            <span>Reset</span>
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm mt-3">
          Drag to pan • Scroll to zoom • Click thumbnails to navigate
        </p>
      </div>
    </div>
  );
}
