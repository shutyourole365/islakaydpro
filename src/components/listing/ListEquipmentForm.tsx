import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  Plus,
  DollarSign,
  MapPin,
  CheckCircle2,
  Camera,
  Info,
} from 'lucide-react';
import type { Category } from '../../types';

interface ListEquipmentFormProps {
  categories: Category[];
  onClose: () => void;
  onSubmit: (data: EquipmentFormData) => void;
}

interface EquipmentFormData {
  title: string;
  category_id: string;
  description: string;
  brand: string;
  model: string;
  condition: string;
  daily_rate: number;
  weekly_rate: number;
  monthly_rate: number;
  deposit_amount: number;
  location: string;
  features: string[];
  images: string[];
  min_rental_days: number;
  max_rental_days: number;
}

const sampleImages = [
  'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg',
  'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg',
];

export default function ListEquipmentForm({
  categories,
  onClose,
  onSubmit,
}: ListEquipmentFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<EquipmentFormData>({
    title: '',
    category_id: '',
    description: '',
    brand: '',
    model: '',
    condition: 'excellent',
    daily_rate: 0,
    weekly_rate: 0,
    monthly_rate: 0,
    deposit_amount: 0,
    location: '',
    features: [],
    images: [],
    min_rental_days: 1,
    max_rental_days: 30,
  });
  const [newFeature, setNewFeature] = useState('');

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onSubmit(formData);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const addSampleImage = (url: string) => {
    if (!formData.images.includes(url)) {
      setFormData({
        ...formData,
        images: [...formData.images, url],
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.title && formData.category_id && formData.description;
      case 2:
        return formData.images.length > 0;
      case 3:
        return formData.daily_rate > 0 && formData.location;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gray-50">
      <div className="h-full flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
              <span>Cancel</span>
            </button>
            <h1 className="text-xl font-semibold text-gray-900">List Your Equipment</h1>
            <div className="w-20" />
          </div>
        </div>

        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        s < step
                          ? 'bg-teal-500 text-white'
                          : s === step
                          ? 'bg-teal-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        s <= step ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {s === 1 && 'Details'}
                      {s === 2 && 'Photos'}
                      {s === 3 && 'Pricing'}
                      {s === 4 && 'Review'}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full bg-teal-500 transition-all ${
                        s < step ? 'w-full' : s === step ? 'w-1/2' : 'w-0'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-8">
          <div className="max-w-3xl mx-auto px-6">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Tell us about your equipment
                  </h2>
                  <p className="text-gray-600">
                    Start with the basic details to help renters find your listing
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Equipment Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., CAT 320 Excavator - 20 Ton"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData({ ...formData, category_id: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500 bg-white"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    placeholder="Describe your equipment, its condition, and what's included..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="e.g., Caterpillar"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Model
                    </label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="e.g., 320 GC"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Condition
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {['new', 'excellent', 'good', 'fair'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormData({ ...formData, condition: c })}
                        className={`px-4 py-3 rounded-xl border text-sm font-medium capitalize transition-colors ${
                          formData.condition === c
                            ? 'border-teal-500 bg-teal-50 text-teal-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Features
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                      placeholder="Add a feature (e.g., GPS, AC, Low Hours)"
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-4 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Add photos of your equipment
                  </h2>
                  <p className="text-gray-600">
                    High-quality photos help renters understand what they're getting
                  </p>
                </div>

                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-4">
                    Drag and drop photos here, or click to browse
                  </p>
                  <button className="px-6 py-3 bg-teal-500 text-white font-medium rounded-xl hover:bg-teal-600 transition-colors">
                    <Upload className="w-5 h-5 inline mr-2" />
                    Upload Photos
                  </button>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-700 font-medium mb-1">
                      For demo purposes, click sample images below:
                    </p>
                    <div className="flex gap-2 mt-2">
                      {sampleImages.map((url, index) => (
                        <button
                          key={index}
                          onClick={() => addSampleImage(url)}
                          className="w-20 h-20 rounded-lg overflow-hidden border-2 border-transparent hover:border-teal-500 transition-colors"
                        >
                          <img
                            src={url}
                            alt={`Sample ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {formData.images.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Added Photos ({formData.images.length})
                    </p>
                    <div className="grid grid-cols-4 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden">
                          <img
                            src={image}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          {index === 0 && (
                            <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
                              Cover
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Set your pricing
                  </h2>
                  <p className="text-gray-600">
                    Choose competitive rates to attract more renters
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Daily Rate *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.daily_rate || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, daily_rate: Number(e.target.value) })
                        }
                        placeholder="0.00"
                        className="w-full pl-12 pr-16 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        /day
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Weekly Rate (optional)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={formData.weekly_rate || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              weekly_rate: Number(e.target.value),
                            })
                          }
                          placeholder="0.00"
                          className="w-full pl-12 pr-16 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                          /week
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Monthly Rate (optional)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={formData.monthly_rate || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              monthly_rate: Number(e.target.value),
                            })
                          }
                          placeholder="0.00"
                          className="w-full pl-12 pr-16 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                          /month
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Security Deposit
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.deposit_amount || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            deposit_amount: Number(e.target.value),
                          })
                        }
                        placeholder="0.00"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1.5">
                      Refundable upon safe return of equipment
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Location *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        placeholder="City, State"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Minimum Rental Days
                      </label>
                      <input
                        type="number"
                        value={formData.min_rental_days}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            min_rental_days: Number(e.target.value),
                          })
                        }
                        min={1}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Maximum Rental Days
                      </label>
                      <input
                        type="number"
                        value={formData.max_rental_days}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            max_rental_days: Number(e.target.value),
                          })
                        }
                        min={1}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Review your listing
                  </h2>
                  <p className="text-gray-600">
                    Make sure everything looks good before publishing
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  {formData.images.length > 0 && (
                    <img
                      src={formData.images[0]}
                      alt={formData.title}
                      className="w-full h-64 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {formData.title || 'Untitled Equipment'}
                    </h3>
                    <p className="text-gray-500 flex items-center gap-1.5 mb-4">
                      <MapPin className="w-4 h-4" />
                      {formData.location || 'Location not set'}
                    </p>
                    <p className="text-gray-600 mb-4">
                      {formData.description || 'No description provided'}
                    </p>

                    {formData.features.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {formData.features.map((feature, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-2xl font-bold text-gray-900">
                            ${formData.daily_rate}
                          </span>
                          <span className="text-gray-500">/day</span>
                        </div>
                        {formData.weekly_rate > 0 && (
                          <span className="text-gray-500">
                            ${formData.weekly_rate}/week
                          </span>
                        )}
                        {formData.monthly_rate > 0 && (
                          <span className="text-gray-500">
                            ${formData.monthly_rate}/month
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-700 font-medium">
                      Your listing is ready to publish!
                    </p>
                    <p className="text-sm text-green-600">
                      Once published, your equipment will be visible to thousands of renters.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                step === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-colors ${
                isStepValid()
                  ? 'bg-teal-500 text-white hover:bg-teal-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {step === totalSteps ? 'Publish Listing' : 'Continue'}
              {step < totalSteps && <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
