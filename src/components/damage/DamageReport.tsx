import { useState, useRef, useCallback } from 'react';
import {
  Camera,
  X,
  Upload,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Trash2,
  MapPin,
  Calendar,
  FileText,
  Send,
  Loader2,
  Image as ImageIcon,
  Plus,
  ZoomIn,
  RotateCcw,
} from 'lucide-react';

interface DamagePhoto {
  id: string;
  url: string;
  file?: File;
  annotation?: string;
  timestamp: Date;
}

interface DamageLocation {
  area: string;
  description: string;
}

interface DamageReportProps {
  equipmentId: string;
  equipmentName: string;
  bookingId?: string;
  onSubmit: (report: DamageReportData) => Promise<void>;
  onClose: () => void;
  className?: string;
}

export interface DamageReportData {
  equipmentId: string;
  bookingId?: string;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  description: string;
  damageLocations: DamageLocation[];
  photos: DamagePhoto[];
  estimatedCost?: number;
  reportedAt: Date;
  gpsLocation?: { lat: number; lng: number };
}

const severityConfig = {
  minor: {
    label: 'Minor',
    description: 'Cosmetic damage, scratches, small dents',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: '🟡',
  },
  moderate: {
    label: 'Moderate',
    description: 'Functional issues, medium damage',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: '🟠',
  },
  major: {
    label: 'Major',
    description: 'Significant damage affecting operation',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: '🔴',
  },
  critical: {
    label: 'Critical',
    description: 'Equipment non-operational or safety hazard',
    color: 'bg-red-200 text-red-800 border-red-300',
    icon: '⛔',
  },
};

const damageAreas = [
  'Body/Frame',
  'Engine/Motor',
  'Hydraulics',
  'Electrical',
  'Tires/Tracks',
  'Controls/Cabin',
  'Attachments',
  'Safety Features',
  'Lights/Signals',
  'Other',
];

export default function DamageReport({
  equipmentId,
  equipmentName,
  bookingId,
  onSubmit,
  onClose,
  className = '',
}: DamageReportProps) {
  const [step, setStep] = useState(1);
  const [severity, setSeverity] = useState<DamageReportData['severity']>('minor');
  const [description, setDescription] = useState('');
  const [damageLocations, setDamageLocations] = useState<DamageLocation[]>([]);
  const [photos, setPhotos] = useState<DamagePhoto[]>([]);
  const [estimatedCost, setEstimatedCost] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<DamagePhoto | null>(null);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Get GPS location
  const getLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error('Location error:', error)
      );
    }
  }, []);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          const newPhoto: DamagePhoto = {
            id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            url: reader.result as string,
            file,
            timestamp: new Date(),
          };
          setPhotos((prev) => [...prev, newPhoto]);
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset input
    e.target.value = '';
  };

  // Remove photo
  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  // Add damage location
  const addDamageLocation = (area: string) => {
    if (!damageLocations.find((d) => d.area === area)) {
      setDamageLocations((prev) => [...prev, { area, description: '' }]);
    }
  };

  // Remove damage location
  const removeDamageLocation = (area: string) => {
    setDamageLocations((prev) => prev.filter((d) => d.area !== area));
  };

  // Update damage location description
  const updateLocationDescription = (area: string, description: string) => {
    setDamageLocations((prev) =>
      prev.map((d) => (d.area === area ? { ...d, description } : d))
    );
  };

  // Submit report
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const report: DamageReportData = {
        equipmentId,
        bookingId,
        severity,
        description,
        damageLocations,
        photos,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
        reportedAt: new Date(),
        gpsLocation: gpsLocation || undefined,
      };

      await onSubmit(report);
      onClose();
    } catch (error) {
      console.error('Failed to submit damage report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return severity;
      case 2:
        return photos.length > 0;
      case 3:
        return damageLocations.length > 0;
      case 4:
        return description.length >= 20;
      default:
        return true;
    }
  };

  return (
    <div className={`fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">Report Damage</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{equipmentName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  s <= step ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Step {step} of 5: {
              step === 1 ? 'Severity' :
              step === 2 ? 'Photos' :
              step === 3 ? 'Damage Location' :
              step === 4 ? 'Description' :
              'Review'
            }
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Severity */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                How severe is the damage?
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(severityConfig).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setSeverity(key as DamageReportData['severity'])}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      severity === key
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{config.icon}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{config.label}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{config.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Photos */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Take or upload photos of the damage
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please provide clear photos from multiple angles. This helps with accurate assessment.
              </p>

              {/* Photo Grid */}
              <div className="grid grid-cols-3 gap-3">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img
                      src={photo.url}
                      alt="Damage photo"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                        <ZoomIn className="w-4 h-4 text-gray-700" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(photo.id);
                        }}
                        className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add Photo Buttons */}
                {photos.length < 9 && (
                  <>
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                    >
                      <Camera className="w-6 h-6 text-gray-400" />
                      <span className="text-xs text-gray-500">Camera</span>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                    >
                      <Upload className="w-6 h-6 text-gray-400" />
                      <span className="text-xs text-gray-500">Upload</span>
                    </button>
                  </>
                )}
              </div>

              {/* Hidden inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              {photos.length === 0 && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-start gap-3">
                  <ImageIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      At least one photo is required
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      Clear photos help process your claim faster
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Damage Location */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Where is the damage located?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select all affected areas and add specific details.
              </p>

              <div className="flex flex-wrap gap-2">
                {damageAreas.map((area) => {
                  const isSelected = damageLocations.some((d) => d.area === area);
                  return (
                    <button
                      key={area}
                      onClick={() => isSelected ? removeDamageLocation(area) : addDamageLocation(area)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {isSelected && <CheckCircle className="w-4 h-4 inline mr-1" />}
                      {area}
                    </button>
                  );
                })}
              </div>

              {/* Selected Locations Details */}
              {damageLocations.length > 0 && (
                <div className="space-y-3 mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Add details for each area:
                  </p>
                  {damageLocations.map((location) => (
                    <div key={location.area} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">{location.area}</span>
                        <button
                          onClick={() => removeDamageLocation(location.area)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        value={location.description}
                        onChange={(e) => updateLocationDescription(location.area, e.target.value)}
                        placeholder={`Describe damage to ${location.area}...`}
                        className="w-full p-2 text-sm border rounded-lg resize-none dark:bg-gray-800 dark:border-gray-600"
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Description */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Describe what happened
              </h3>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details about how the damage occurred, when you noticed it, and any relevant circumstances..."
                className="w-full p-4 border rounded-xl resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={6}
              />
              <p className={`text-sm ${description.length >= 20 ? 'text-green-600' : 'text-gray-500'}`}>
                {description.length}/20 minimum characters
              </p>

              {/* Estimated Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estimated Repair Cost (optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              {/* GPS Location */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Location</p>
                      <p className="text-xs text-gray-500">
                        {gpsLocation
                          ? `${gpsLocation.lat.toFixed(4)}, ${gpsLocation.lng.toFixed(4)}`
                          : 'Not captured'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={getLocation}
                    className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200"
                  >
                    {gpsLocation ? 'Update' : 'Capture'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Review your report
              </h3>

              {/* Summary Card */}
              <div className="border dark:border-gray-700 rounded-xl overflow-hidden">
                {/* Severity */}
                <div className="p-4 border-b dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Severity</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${severityConfig[severity].color}`}>
                      {severityConfig[severity].icon} {severityConfig[severity].label}
                    </span>
                  </div>
                </div>

                {/* Photos */}
                <div className="p-4 border-b dark:border-gray-700">
                  <span className="text-sm text-gray-500 block mb-2">Photos ({photos.length})</span>
                  <div className="flex gap-2 overflow-x-auto">
                    {photos.map((photo) => (
                      <img
                        key={photo.id}
                        src={photo.url}
                        alt="Damage"
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    ))}
                  </div>
                </div>

                {/* Locations */}
                <div className="p-4 border-b dark:border-gray-700">
                  <span className="text-sm text-gray-500 block mb-2">Affected Areas</span>
                  <div className="flex flex-wrap gap-1">
                    {damageLocations.map((loc) => (
                      <span
                        key={loc.area}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm"
                      >
                        {loc.area}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="p-4 border-b dark:border-gray-700">
                  <span className="text-sm text-gray-500 block mb-2">Description</span>
                  <p className="text-gray-900 dark:text-white text-sm">{description}</p>
                </div>

                {/* Additional Info */}
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500 block">Estimated Cost</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {estimatedCost ? `$${estimatedCost}` : 'Not provided'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block">Location</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {gpsLocation ? 'Captured' : 'Not captured'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    By submitting this report, you confirm that the information provided is accurate
                    and complete to the best of your knowledge.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t dark:border-gray-700 flex items-center justify-between">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
            {step > 1 ? 'Back' : 'Cancel'}
          </button>

          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Report
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Photo Viewer Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <img
            src={selectedPhoto.url}
            alt="Damage detail"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
