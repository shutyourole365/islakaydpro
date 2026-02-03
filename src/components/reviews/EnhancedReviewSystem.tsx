import { useState } from 'react';
import { Star, ThumbsUp, Camera, Shield, Award, TrendingUp, MessageSquare } from 'lucide-react';

interface EnhancedReviewSystemProps {
  equipmentId: string;
  equipmentTitle: string;
  bookingId?: string;
  onSubmit: (review: ReviewData) => Promise<void>;
  onClose: () => void;
}

interface ReviewData {
  rating: number;
  title: string;
  comment: string;
  aspectRatings: {
    condition: number;
    cleanliness: number;
    accuracy: number;
    communication: number;
    value: number;
  };
  photos?: string[];
  wouldRecommend: boolean;
}

export default function EnhancedReviewSystem({
  equipmentId,
  equipmentTitle,
  bookingId,
  onSubmit,
  onClose,
}: EnhancedReviewSystemProps) {
  const [step, setStep] = useState<'rating' | 'aspects' | 'details' | 'photos'  >('rating');
  const [overallRating, setOverallRating] = useState(0);
  const [aspectRatings, setAspectRatings] = useState({
    condition: 0,
    cleanliness: 0,
    accuracy: 0,
    communication: 0,
    value: 0,
  });
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Debug: Track review context
  if (import.meta.env.DEV) {
    console.log('EnhancedReviewSystem:', { equipmentId, bookingId });
  }

  const aspects = [
    { key: 'condition' as const, label: 'Equipment Condition', icon: <Shield className="w-5 h-5" /> },
    { key: 'cleanliness' as const, label: 'Cleanliness', icon: <Star className="w-5 h-5" /> },
    { key: 'accuracy' as const, label: 'Listing Accuracy', icon: <Award className="w-5 h-5" /> },
    { key: 'communication' as const, label: 'Owner Communication', icon: <MessageSquare className="w-5 h-5" /> },
    { key: 'value' as const, label: 'Value for Money', icon: <TrendingUp className="w-5 h-5" /> },
  ];

  const ratingLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + selectedPhotos.length > 5) {
      alert('Maximum 5 photos per review');
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return file.type.startsWith('image/');
    });

    setSelectedPhotos(prev => [...prev, ...validFiles]);
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoUrls(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    if (overallRating === 0) {
      alert('Please select an overall rating');
      return;
    }

    if (!title.trim() || !comment.trim()) {
      alert('Please provide a title and comment');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        rating: overallRating,
        title,
        comment,
        aspectRatings,
        photos: photoUrls,
        wouldRecommend,
      });
      onClose();
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 'rating') return overallRating > 0;
    if (step === 'aspects') return Object.values(aspectRatings).every(r => r > 0);
    if (step === 'details') return title.trim() && comment.trim();
    return true;
  };

  const StarRating = ({ 
    value, 
    onChange, 
    size = 'large' 
  }: { 
    value: number; 
    onChange: (rating: number) => void; 
    size?: 'small' | 'large';
  }) => {
    const [hover, setHover] = useState(0);
    const starSize = size === 'large' ? 'w-12 h-12' : 'w-8 h-8';

    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`${starSize} transition-colors ${
                star <= (hover || value)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div 
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${((['rating', 'aspects', 'details', 'photos'].indexOf(step) + 1) / 4) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Review Your Experience</h2>
          <p className="text-gray-600 mt-1">{equipmentTitle}</p>
        </div>

        <div className="p-6 max-h-[600px] overflow-y-auto">
          {/* Step 1: Overall Rating */}
          {step === 'rating' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                <Star className="w-10 h-10 text-white fill-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">How was your rental?</h3>
                <p className="text-gray-600">Rate your overall experience</p>
              </div>
              
              <div className="flex justify-center">
                <StarRating value={overallRating} onChange={setOverallRating} />
              </div>
              
              {overallRating > 0 && (
                <p className="text-lg font-semibold text-teal-600 animate-in fade-in slide-in-from-bottom-4">
                  {ratingLabels[overallRating - 1]}!
                </p>
              )}
            </div>
          )}

          {/* Step 2: Aspect Ratings */}
          {step === 'aspects' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Rate Specific Aspects</h3>
                <p className="text-gray-600">Help others know what to expect</p>
              </div>

              {aspects.map((aspect) => (
                <div key={aspect.key} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-teal-600">
                        {aspect.icon}
                      </div>
                      <span className="font-semibold text-gray-900">{aspect.label}</span>
                    </div>
                    {aspectRatings[aspect.key] > 0 && (
                      <span className="text-sm font-semibold text-teal-600">
                        {ratingLabels[aspectRatings[aspect.key] - 1]}
                      </span>
                    )}
                  </div>
                  <StarRating
                    value={aspectRatings[aspect.key]}
                    onChange={(rating) => setAspectRatings(prev => ({ ...prev, [aspect.key]: rating }))}
                    size="small"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Step 3: Written Review */}
          {step === 'details' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Share Your Experience</h3>
                <p className="text-gray-600">Help others make informed decisions</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Review Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Great excavator, worked perfectly!"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  maxLength={80}
                />
                <p className="text-xs text-gray-500 mt-1">{title.length}/80 characters</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Review *
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about your experience with this equipment..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 resize-none"
                  rows={6}
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">{comment.length}/1000 characters</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wouldRecommend}
                    onChange={(e) => setWouldRecommend(e.target.checked)}
                    className="mt-1 w-5 h-5 text-teal-500 rounded focus:ring-2 focus:ring-teal-400"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      <ThumbsUp className="w-5 h-5 text-blue-600" />
                      I would recommend this equipment
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Help others find quality equipment they can trust
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Photos */}
          {step === 'photos' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-4">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Add Photos (Optional)</h3>
                <p className="text-gray-600">Show others what to expect</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {photoUrls.map((url, idx) => (
                  <div key={idx} className="relative group aspect-square">
                    <img
                      src={url}
                      alt={`Review ${idx + 1}`}
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button
                      onClick={() => {
                        setSelectedPhotos(prev => prev.filter((_, i) => i !== idx));
                        setPhotoUrls(prev => prev.filter((_, i) => i !== idx));
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                {photoUrls.length < 5 && (
                  <label className="aspect-square border-2 border-dashed border-gray-300 rounded-xl hover:border-teal-400 hover:bg-teal-50 transition-all cursor-pointer flex flex-col items-center justify-center">
                    <Camera className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="p-4 bg-amber-50 rounded-xl flex items-start gap-3">
                <Camera className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Photo Guidelines</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Show equipment condition clearly</li>
                    <li>Include any issues or damages</li>
                    <li>Max 5 photos, 5MB each</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={() => {
              const steps = ['rating', 'aspects', 'details', 'photos'] as const;
              const currentIndex = steps.indexOf(step);
              if (currentIndex > 0) {
                setStep(steps[currentIndex - 1] as 'rating' | 'aspects' | 'details' | 'photos');
              } else {
                onClose();
              }
            }}
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            {step === 'rating' ? 'Cancel' : 'Back'}
          </button>

          <button
            onClick={() => {
              const steps = ['rating', 'aspects', 'details', 'photos'] as const;
              const currentIndex = steps.indexOf(step);
              if (currentIndex < steps.length - 1) {
                setStep(steps[currentIndex + 1] as 'rating' | 'aspects' | 'details' | 'photos');
              } else {
                handleSubmit();
              }
            }}
            disabled={!canProceed() || isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : step === 'photos' ? 'Submit Review' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
