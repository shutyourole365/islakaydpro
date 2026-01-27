/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps, prefer-const */
import { useState, useEffect } from 'react';
import { Shield, DollarSign, AlertTriangle, CheckCircle, FileText, Camera } from 'lucide-react';

interface DamageReportWizardProps {
  bookingId: string;
  equipmentTitle: string;
  equipmentImages: string[];
  depositAmount: number;
  onComplete: (report: DamageReport) => void;
  onClose: () => void;
}

interface DamageReport {
  id: string;
  bookingId: string;
  reportedAt: Date;
  severity: 'none' | 'minor' | 'moderate' | 'severe';
  description: string;
  photos: string[];
  estimatedCost: number;
  resolution: 'pending' | 'approved' | 'disputed' | 'resolved';
}

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  status: 'unchecked' | 'ok' | 'issue';
  photo?: string;
  notes?: string;
}

export default function DamageReportWizard({
  bookingId,
  equipmentTitle,
  equipmentImages: _equipmentImages,
  depositAmount,
  onComplete,
  onClose,
}: DamageReportWizardProps) {
  // equipmentImages reserved for comparison view
  const [step, setStep] = useState(1);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: '1', label: 'Physical Condition', description: 'Check for dents, scratches, or cracks', status: 'unchecked' },
    { id: '2', label: 'Functionality', description: 'Verify all features work correctly', status: 'unchecked' },
    { id: '3', label: 'Accessories', description: 'Confirm all accessories are present', status: 'unchecked' },
    { id: '4', label: 'Cleanliness', description: 'Check if equipment is clean', status: 'unchecked' },
    { id: '5', label: 'Safety Features', description: 'Verify safety mechanisms work', status: 'unchecked' },
  ]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'none' | 'minor' | 'moderate' | 'severe'>('none');
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const issueCount = checklist.filter((item) => item.status === 'issue').length;
  const checkedCount = checklist.filter((item) => item.status !== 'unchecked').length;

  // Auto-calculate severity based on issues
  useEffect(() => {
    if (issueCount === 0) {
      setSeverity('none');
      setEstimatedCost(0);
    } else if (issueCount === 1) {
      setSeverity('minor');
      setEstimatedCost(Math.min(depositAmount * 0.1, 50));
    } else if (issueCount <= 3) {
      setSeverity('moderate');
      setEstimatedCost(Math.min(depositAmount * 0.3, 200));
    } else {
      setSeverity('severe');
      setEstimatedCost(Math.min(depositAmount * 0.5, 500));
    }
  }, [issueCount, depositAmount]);

  const updateChecklistItem = (id: string, status: 'ok' | 'issue', notes?: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status, notes } : item))
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // In production, you'd upload to storage and get URLs
      const newPhotos = Array.from(files).map((file) => URL.createObjectURL(file));
      setPhotos((prev) => [...prev, ...newPhotos]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const report: DamageReport = {
      id: `dmg-${Date.now()}`,
      bookingId,
      reportedAt: new Date(),
      severity,
      description,
      photos,
      estimatedCost,
      resolution: severity === 'none' ? 'resolved' : 'pending',
    };
    
    onComplete(report);
    setIsSubmitting(false);
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'none':
        return 'text-green-600 bg-green-100';
      case 'minor':
        return 'text-yellow-600 bg-yellow-100';
      case 'moderate':
        return 'text-orange-600 bg-orange-100';
      case 'severe':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Equipment Return Check</h2>
                <p className="text-gray-600">{equipmentTitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Step {step} of 3</span>
              <span>{checkedCount}/{checklist.length} items checked</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Checklist */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 mb-4">Inspection Checklist</h3>
              
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    item.status === 'ok'
                      ? 'border-green-200 bg-green-50'
                      : item.status === 'issue'
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{item.label}</div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateChecklistItem(item.id, 'ok')}
                        className={`p-2 rounded-lg transition-all ${
                          item.status === 'ok'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-green-100'
                        }`}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => updateChecklistItem(item.id, 'issue')}
                        className={`p-2 rounded-lg transition-all ${
                          item.status === 'issue'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-red-100'
                        }`}
                      >
                        <AlertTriangle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {item.status === 'issue' && (
                    <textarea
                      placeholder="Describe the issue..."
                      value={item.notes || ''}
                      onChange={(e) => updateChecklistItem(item.id, 'issue', e.target.value)}
                      className="mt-3 w-full p-3 border border-red-200 rounded-lg text-sm resize-none"
                      rows={2}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Step 2: Photos & Details */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-900">Photo Documentation</h3>
              
              {/* Photo Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Camera className="w-12 h-12 text-gray-400 mb-3" />
                  <span className="text-gray-600">Click to upload photos</span>
                  <span className="text-sm text-gray-400">or drag and drop</span>
                </label>
              </div>

              {/* Photo Grid */}
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                      <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add any additional details about the equipment condition..."
                  className="w-full p-4 border border-gray-200 rounded-xl resize-none"
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-900">Review & Submit</h3>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm text-gray-500 mb-1">Condition Assessment</div>
                  <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium capitalize ${getSeverityColor(severity)}`}>
                    {severity === 'none' ? 'No Issues' : `${severity} Damage`}
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm text-gray-500 mb-1">Estimated Cost</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${estimatedCost.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Deposit Info */}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 text-blue-700 mb-2">
                  <DollarSign className="w-5 h-5" />
                  <span className="font-medium">Deposit Information</span>
                </div>
                <div className="text-sm text-blue-600">
                  Deposit: ${depositAmount.toFixed(2)}
                  {severity === 'none' ? (
                    <span className="ml-2 text-green-600">→ Full refund pending</span>
                  ) : (
                    <span className="ml-2 text-orange-600">→ ${(depositAmount - estimatedCost).toFixed(2)} refund pending</span>
                  )}
                </div>
              </div>

              {/* Issues Summary */}
              {issueCount > 0 && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <div className="flex items-center gap-2 text-red-700 mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">{issueCount} Issue(s) Reported</span>
                  </div>
                  <ul className="text-sm text-red-600 space-y-1">
                    {checklist
                      .filter((item) => item.status === 'issue')
                      .map((item) => (
                        <li key={item.id}>• {item.label}: {item.notes || 'No details provided'}</li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Photos */}
              {photos.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">{photos.length} Photo(s) Attached</div>
                  <div className="flex gap-2">
                    {photos.slice(0, 4).map((photo, index) => (
                      <div key={index} className="w-16 h-16 rounded-lg overflow-hidden">
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {photos.length > 4 && (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
                        +{photos.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && checkedCount < checklist.length}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Submit Report
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
