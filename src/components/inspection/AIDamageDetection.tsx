import { useState, useRef, useCallback } from 'react';
import {
  Camera,
  Upload,
  Scan,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Shield,
  FileText,
  Info,
} from 'lucide-react';

interface AIDamageDetectionProps {
  equipmentId: string;
  equipmentTitle: string;
  type: 'pre-rental' | 'post-rental';
  previousPhotos?: string[];
  onComplete?: (report: DamageReport) => void;
  onClose: () => void;
}

interface DetectedDamage {
  id: string;
  type: 'scratch' | 'dent' | 'crack' | 'stain' | 'missing-part' | 'wear' | 'other';
  severity: 'minor' | 'moderate' | 'major';
  location: string;
  confidence: number;
  boundingBox: { x: number; y: number; width: number; height: number };
  estimatedCost: number;
  description: string;
}

interface DamageReport {
  equipmentId: string;
  type: 'pre-rental' | 'post-rental';
  photos: string[];
  damages: DetectedDamage[];
  overallCondition: 'excellent' | 'good' | 'fair' | 'poor';
  totalEstimatedCost: number;
  timestamp: Date;
  aiConfidence: number;
}

export default function AIDamageDetection({
  equipmentId,
  equipmentTitle: _equipmentTitle,
  type,
  previousPhotos = [],
  onComplete,
  onClose,
}: AIDamageDetectionProps) {
  // equipmentTitle reserved for display in future enhancement
  const [photos, setPhotos] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [damages, setDamages] = useState<DetectedDamage[]>([]);
  const [selectedDamage, setSelectedDamage] = useState<DetectedDamage | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [showComparison, setShowComparison] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1920, height: 1080 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      alert('Could not access camera. Please upload photos instead.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPhotos(prev => [...prev, dataUrl]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const analyzePhotos = async () => {
    if (photos.length === 0) {
      alert('Please add at least one photo to analyze');
      return;
    }

    setAnalyzing(true);

    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Generate mock damage detection results
    const mockDamages: DetectedDamage[] = [
      {
        id: '1',
        type: 'scratch',
        severity: 'minor',
        location: 'Front panel, upper right',
        confidence: 0.94,
        boundingBox: { x: 60, y: 20, width: 15, height: 8 },
        estimatedCost: 45,
        description: 'Surface scratch approximately 3cm in length. Does not affect functionality.',
      },
      {
        id: '2',
        type: 'wear',
        severity: 'minor',
        location: 'Handle grip',
        confidence: 0.87,
        boundingBox: { x: 10, y: 50, width: 20, height: 30 },
        estimatedCost: 0,
        description: 'Normal wear on handle grip consistent with regular use.',
      },
    ];

    // Randomly decide if there are damages
    const hasDamages = Math.random() > 0.4;
    setDamages(hasDamages ? mockDamages : []);
    setAnalyzed(true);
    setAnalyzing(false);
  };

  const generateReport = useCallback((): DamageReport => {
    const totalCost = damages.reduce((sum, d) => sum + d.estimatedCost, 0);
    const avgConfidence = damages.length > 0
      ? damages.reduce((sum, d) => sum + d.confidence, 0) / damages.length
      : 1;

    let condition: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';
    if (damages.some(d => d.severity === 'major')) condition = 'poor';
    else if (damages.some(d => d.severity === 'moderate')) condition = 'fair';
    else if (damages.length > 0) condition = 'good';

    return {
      equipmentId,
      type,
      photos,
      damages,
      overallCondition: condition,
      totalEstimatedCost: totalCost,
      timestamp: new Date(),
      aiConfidence: avgConfidence,
    };
  }, [damages, equipmentId, photos, type]);

  const handleComplete = () => {
    const report = generateReport();
    if (onComplete) {
      onComplete(report);
    }
    onClose();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'moderate': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'major': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDamageTypeIcon = (damageType: string) => {
    switch (damageType) {
      case 'scratch': return '⚡';
      case 'dent': return '🔘';
      case 'crack': return '💔';
      case 'stain': return '💧';
      case 'missing-part': return '❌';
      case 'wear': return '⏳';
      default: return '⚠️';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-t-3xl text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Scan className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI Damage Detection</h2>
                <p className="text-sm text-white/80">
                  {type === 'pre-rental' ? 'Pre-rental Inspection' : 'Post-rental Inspection'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!analyzed ? (
            <>
              {/* Photo Capture Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Capture Equipment Photos
                </h3>
                
                {cameraActive ? (
                  <div className="relative aspect-video bg-black rounded-2xl overflow-hidden mb-4">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
                      <button
                        onClick={stopCamera}
                        className="px-6 py-2 bg-white/20 backdrop-blur text-white rounded-full"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={capturePhoto}
                        className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg"
                      >
                        <div className="w-12 h-12 bg-red-500 rounded-full" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <button
                      onClick={startCamera}
                      className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors"
                    >
                      <Camera className="w-12 h-12 text-gray-400 mb-3" />
                      <span className="font-medium text-gray-700">Take Photo</span>
                      <span className="text-sm text-gray-500">Use camera</span>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors"
                    >
                      <Upload className="w-12 h-12 text-gray-400 mb-3" />
                      <span className="font-medium text-gray-700">Upload Photos</span>
                      <span className="text-sm text-gray-500">From device</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                )}

                {/* Photo Grid */}
                {photos.length > 0 && (
                  <div className="grid grid-cols-4 gap-3">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group aspect-square rounded-xl overflow-hidden">
                        <img
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-colors"
                    >
                      <ImageIcon className="w-8 h-8" />
                    </button>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">Tips for best results</p>
                    <ul className="text-sm text-blue-600 mt-2 space-y-1">
                      <li>• Take photos in good lighting</li>
                      <li>• Capture all sides of the equipment</li>
                      <li>• Include close-ups of any visible damage</li>
                      <li>• Minimum 4 photos recommended</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Analyze Button */}
              <button
                onClick={analyzePhotos}
                disabled={photos.length === 0 || analyzing}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Scan className="w-5 h-5" />
                    Analyze Photos ({photos.length})
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              {/* Analysis Results */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Photo Viewer */}
                <div>
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3">
                    <img
                      src={photos[activePhoto]}
                      alt="Analyzed"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Damage Overlays */}
                    {damages.map((damage) => (
                      <button
                        key={damage.id}
                        onClick={() => setSelectedDamage(damage)}
                        className={`absolute border-2 rounded ${
                          selectedDamage?.id === damage.id ? 'border-red-500' : 'border-orange-400'
                        } animate-pulse cursor-pointer`}
                        style={{
                          left: `${damage.boundingBox.x}%`,
                          top: `${damage.boundingBox.y}%`,
                          width: `${damage.boundingBox.width}%`,
                          height: `${damage.boundingBox.height}%`,
                        }}
                      >
                        <span className="absolute -top-6 left-0 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                          {getDamageTypeIcon(damage.type)} {damage.type}
                        </span>
                      </button>
                    ))}

                    {damages.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
                        <div className="text-center">
                          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-2" />
                          <p className="font-semibold text-green-700">No damage detected</p>
                        </div>
                      </div>
                    )}

                    {/* Comparison Toggle */}
                    {previousPhotos.length > 0 && (
                      <button
                        onClick={() => setShowComparison(!showComparison)}
                        className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 rounded-full text-sm font-medium text-gray-700 shadow"
                      >
                        <Eye className="w-4 h-4 inline mr-1" />
                        Compare
                      </button>
                    )}
                  </div>

                  {/* Photo Thumbnails */}
                  <div className="flex gap-2 overflow-x-auto">
                    {photos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => setActivePhoto(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                          activePhoto === index ? 'border-orange-500' : 'border-transparent'
                        }`}
                      >
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Damage List */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Detection Results
                    </h3>
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Shield className="w-4 h-4" />
                      AI Confidence: {Math.round(generateReport().aiConfidence * 100)}%
                    </span>
                  </div>

                  {damages.length === 0 ? (
                    <div className="bg-green-50 rounded-xl p-6 text-center">
                      <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <h4 className="font-semibold text-green-800 mb-2">
                        Equipment in Excellent Condition
                      </h4>
                      <p className="text-green-600 text-sm">
                        No damage or wear detected. Ready for rental!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {damages.map((damage) => (
                        <button
                          key={damage.id}
                          onClick={() => setSelectedDamage(damage)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                            selectedDamage?.id === damage.id
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-100 hover:border-orange-200'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{getDamageTypeIcon(damage.type)}</span>
                              <span className="font-semibold text-gray-900 capitalize">
                                {damage.type.replace('-', ' ')}
                              </span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(damage.severity)}`}>
                              {damage.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{damage.description}</p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">{damage.location}</span>
                            {damage.estimatedCost > 0 && (
                              <span className="font-medium text-red-600">
                                Est. ${damage.estimatedCost}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-500"
                              style={{ width: `${damage.confidence * 100}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {Math.round(damage.confidence * 100)}% confidence
                          </p>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Summary */}
                  {damages.length > 0 && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-900">Estimated Repair Cost</span>
                        <span className="text-xl font-bold text-red-600">
                          ${damages.reduce((sum, d) => sum + d.estimatedCost, 0)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        This is an AI estimate. Actual costs may vary based on professional assessment.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setAnalyzed(false);
                    setDamages([]);
                  }}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Re-analyze
                </button>
                <button
                  onClick={handleComplete}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Generate Report
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
