import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  X,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  Info,
  Maximize2,
  Download,
  Share2,
  Check,
  Loader2,
  Smartphone,
  Ruler,
  Box,
  Eye,
} from 'lucide-react';
import type { Equipment } from '../../types';

interface ARPreviewProps {
  equipment: Equipment;
  onClose: () => void;
  className?: string;
}

interface Transform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export default function ARPreview({ equipment, onClose, className = '' }: ARPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transform, setTransform] = useState<Transform>({ x: 50, y: 50, scale: 1, rotation: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<'place' | 'measure' | 'view'>('place');

  // Initialize camera
  const initCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setHasPermission(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Camera error:', err);
      setHasPermission(false);
      setError('Camera access denied. Please enable camera permissions to use AR preview.');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    initCamera();

    return () => {
      // Cleanup camera stream
      if (video?.srcObject) {
        const tracks = (video.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [initCamera]);

  // Handle drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeMode !== 'place') return;
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current || activeMode !== 'place') return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setTransform(prev => ({
      ...prev,
      x: Math.max(10, Math.min(90, x)),
      y: Math.max(10, Math.min(90, y)),
    }));
  }, [isDragging, activeMode]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (activeMode !== 'place') return;
    setIsDragging(true);
    e.preventDefault();
  };

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current || activeMode !== 'place') return;
    
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    
    setTransform(prev => ({
      ...prev,
      x: Math.max(10, Math.min(90, x)),
      y: Math.max(10, Math.min(90, y)),
    }));
  }, [isDragging, activeMode]);

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Controls
  const handleZoomIn = () => {
    setTransform(prev => ({ ...prev, scale: Math.min(prev.scale + 0.2, 3) }));
  };

  const handleZoomOut = () => {
    setTransform(prev => ({ ...prev, scale: Math.max(prev.scale - 0.2, 0.3) }));
  };

  const handleRotate = () => {
    setTransform(prev => ({ ...prev, rotation: (prev.rotation + 45) % 360 }));
  };

  const handleReset = () => {
    setTransform({ x: 50, y: 50, scale: 1, rotation: 0 });
  };

  // Capture image
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame
    ctx.drawImage(video, 0, 0);
    
    // Draw equipment overlay
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = equipment.images[0];
    
    img.onload = () => {
      const x = (transform.x / 100) * canvas.width - (200 * transform.scale) / 2;
      const y = (transform.y / 100) * canvas.height - (200 * transform.scale) / 2;
      
      ctx.save();
      ctx.translate(x + (200 * transform.scale) / 2, y + (200 * transform.scale) / 2);
      ctx.rotate((transform.rotation * Math.PI) / 180);
      ctx.drawImage(img, -(200 * transform.scale) / 2, -(200 * transform.scale) / 2, 200 * transform.scale, 200 * transform.scale);
      ctx.restore();
      
      setCapturedImage(canvas.toDataURL('image/png'));
    };
  };

  const handleDownload = () => {
    if (!capturedImage) return;
    const link = document.createElement('a');
    link.download = `ar-preview-${equipment.title.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = capturedImage;
    link.click();
  };

  const handleShare = async () => {
    if (!capturedImage) return;
    
    try {
      const blob = await (await fetch(capturedImage)).blob();
      const file = new File([blob], 'ar-preview.png', { type: 'image/png' });
      
      if (navigator.share) {
        await navigator.share({
          title: `AR Preview: ${equipment.title}`,
          text: `Check out this ${equipment.title} in my space!`,
          files: [file],
        });
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const modes = [
    { id: 'place', label: 'Place', icon: Move },
    { id: 'measure', label: 'Measure', icon: Ruler },
    { id: 'view', label: 'View', icon: Eye },
  ];

  return (
    <div className={`fixed inset-0 z-[200] bg-black flex flex-col ${className}`}>
      {/* Camera View */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Video feed */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
        />

        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
              <p className="text-white text-lg">Initializing camera...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black p-8">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                <Camera className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Camera Access Required</h3>
              <p className="text-gray-400 mb-6">{error}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={initCamera}
                  className="px-6 py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Equipment overlay */}
        {hasPermission && !isLoading && (
          <div
            className="absolute cursor-move select-none"
            style={{
              left: `${transform.x}%`,
              top: `${transform.y}%`,
              transform: `translate(-50%, -50%) scale(${transform.scale}) rotate(${transform.rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div className="relative">
              <img
                src={equipment.images[0]}
                alt={equipment.title}
                className="w-48 h-48 object-contain drop-shadow-2xl"
                style={{
                  filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))',
                }}
                draggable={false}
              />
              
              {/* Placement indicator */}
              {activeMode === 'place' && (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-2 bg-teal-500/30 rounded-full blur-sm" />
              )}

              {/* Measurement guides */}
              {activeMode === 'measure' && equipment.specifications && (
                <div className="absolute -right-4 top-0 bottom-0 flex items-center">
                  <div className="w-px h-full bg-teal-500 relative">
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-teal-500 rounded-full" />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-teal-500 rounded-full" />
                    <div className="absolute top-1/2 left-3 -translate-y-1/2 bg-black/70 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
                      {equipment.specifications.height || 'Size varies'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AR Grid overlay */}
        {hasPermission && !isLoading && activeMode === 'place' && (
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full opacity-20">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        )}

        {/* Captured image preview */}
        {capturedImage && (
          <div className="absolute inset-0 bg-black flex items-center justify-center p-4">
            <div className="relative max-w-2xl w-full">
              <img src={capturedImage} alt="Captured" className="w-full rounded-2xl shadow-2xl" />
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
                <button
                  onClick={() => setCapturedImage(null)}
                  className="p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <button
                  onClick={handleDownload}
                  className="p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
                >
                  <Download className="w-6 h-6" />
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
                >
                  <Share2 className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setCapturedImage(null)}
                  className="flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-full font-medium hover:bg-teal-600 transition-colors"
                >
                  <Check className="w-5 h-5" />
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        {!capturedImage && (
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent">
            <button
              onClick={onClose}
              className="p-2.5 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center">
              <h3 className="text-white font-semibold">{equipment.title}</h3>
              <p className="text-white/70 text-sm">${equipment.daily_rate}/day</p>
            </div>

            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2.5 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
            >
              <Info className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Info panel */}
        {showInfo && !capturedImage && (
          <div className="absolute top-20 right-4 bg-black/80 backdrop-blur-sm rounded-2xl p-4 text-white max-w-xs">
            <h4 className="font-semibold mb-2">{equipment.title}</h4>
            <p className="text-sm text-white/70 mb-3">{equipment.description?.slice(0, 100)}...</p>
            {equipment.specifications && (
              <div className="space-y-1 text-sm">
                {Object.entries(equipment.specifications).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-white/50 capitalize">{key}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mode selector */}
        {hasPermission && !isLoading && !capturedImage && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full p-1">
            {modes.map(mode => (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id as typeof activeMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeMode === mode.id
                    ? 'bg-teal-500 text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <mode.icon className="w-4 h-4" />
                {mode.label}
              </button>
            ))}
          </div>
        )}

        {/* Controls */}
        {hasPermission && !isLoading && !capturedImage && showControls && (
          <div className="absolute bottom-4 left-0 right-0 px-4">
            <div className="flex items-center justify-between max-w-lg mx-auto">
              {/* Transform controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleZoomOut}
                  className="p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
                >
                  <ZoomOut className="w-6 h-6" />
                </button>
                <button
                  onClick={handleZoomIn}
                  className="p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
                >
                  <ZoomIn className="w-6 h-6" />
                </button>
                <button
                  onClick={handleRotate}
                  className="p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>
              </div>

              {/* Capture button */}
              <button
                onClick={handleCapture}
                className="w-20 h-20 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
              >
                <div className="w-16 h-16 rounded-full border-4 border-gray-300" />
              </button>

              {/* Right controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
                >
                  <Maximize2 className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setShowControls(!showControls)}
                  className="p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
                >
                  <Box className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {hasPermission && !isLoading && !capturedImage && activeMode === 'place' && (
          <div className="absolute bottom-44 left-1/2 -translate-x-1/2 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm">
              <Smartphone className="w-4 h-4" />
              Drag to position • Pinch to resize
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
