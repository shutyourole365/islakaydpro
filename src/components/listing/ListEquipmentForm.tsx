import { useState, useRef } from 'react';
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
  Loader2,
  Sparkles,
  Wand2,
} from 'lucide-react';
import type { Category } from '../../types';
import { uploadMultipleFiles } from '../../services/storage';
import { supabase } from '../../lib/supabase';
import { generateListingDescription, suggestRentalPricing } from '../../services/ai';

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

const inputBase =
  'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-teal-500 dark:focus:border-teal-400';

const labelBase = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

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
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [genError, setGenError] = useState('');
  const [ownerNotes, setOwnerNotes] = useState('');
  const [suggestingPrice, setSuggestingPrice] = useState(false);
  const [priceReasoning, setPriceReasoning] = useState('');
  const [priceError, setPriceError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onSubmit(formData);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({ ...formData, features: [...formData.features, newFeature.trim()] });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) });
  };

  const handleSuggestPricing = async () => {
    if (!formData.title) return;
    setSuggestingPrice(true);
    setPriceError('');
    setPriceReasoning('');
    try {
      const categoryName = categories.find(c => c.id === formData.category_id)?.name;
      const suggestion = await suggestRentalPricing({
        title: formData.title,
        brand: formData.brand || undefined,
        model: formData.model || undefined,
        condition: formData.condition,
        category: categoryName,
      });
      setFormData(prev => ({
        ...prev,
        daily_rate: suggestion.daily,
        weekly_rate: suggestion.weekly,
        monthly_rate: suggestion.monthly,
        deposit_amount: suggestion.deposit,
      }));
      setPriceReasoning(suggestion.reasoning);
    } catch {
      setPriceError('Could not suggest pricing — try again or enter manually.');
    } finally {
      setSuggestingPrice(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.title) return;
    setGeneratingDesc(true);
    setGenError('');
    try {
      const categoryName = categories.find(c => c.id === formData.category_id)?.name;
      const description = await generateListingDescription({
        title: formData.title,
        brand: formData.brand || undefined,
        model: formData.model || undefined,
        condition: formData.condition,
        category: categoryName,
        features: formData.features.length > 0 ? formData.features : undefined,
        notes: ownerNotes || undefined,
      });
      setFormData(prev => ({ ...prev, description }));
    } catch {
      setGenError('Could not generate description — please check your AI is enabled.');
    } finally {
      setGeneratingDesc(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImages(true);
    setUploadError('');

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id ?? 'anonymous';
    const basePath = `${userId}/${Date.now()}`;

    const results = await uploadMultipleFiles(files, basePath);
    const urls = results.filter(r => r.url).map(r => r.url as string);
    const failed = results.filter(r => r.error).length;

    if (urls.length > 0) {
      setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
    }
    if (failed > 0) {
      setUploadError(`${failed} image(s) failed to upload. Please try again.`);
    }

    setUploadingImages(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return formData.title && formData.category_id && formData.description;
      case 2: return formData.images.length > 0;
      case 3: return formData.daily_rate > 0 && formData.location;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gray-50 dark:bg-gray-900">
      <div className="h-full flex flex-col">

        {/* Top bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
              <span>Cancel</span>
            </button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">List Your Equipment</h1>
            <div className="w-20" />
          </div>
        </div>

        {/* Step progress */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        s <= step
                          ? 'bg-teal-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
                    </div>
                    <span className={`text-sm font-medium ${s <= step ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                      {s === 1 && 'Details'}
                      {s === 2 && 'Photos'}
                      {s === 3 && 'Pricing'}
                      {s === 4 && 'Review'}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-gray-200 dark:bg-gray-600">
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-8">
          <div className="max-w-3xl mx-auto px-6">

            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Tell us about your equipment
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Start with the basic details to help renters find your listing
                  </p>
                </div>

                <div>
                  <label className={labelBase}>Equipment Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., CAT 320 Excavator - 20 Ton"
                    className={`${inputBase} focus:ring-4 focus:ring-teal-500/10`}
                  />
                </div>

                <div>
                  <label className={labelBase}>Category *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className={inputBase}
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description *
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateDescription}
                      disabled={!formData.title || generatingDesc}
                      title={!formData.title ? 'Enter a title first' : 'Generate description with AI'}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-brand-gradient text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      {generatingDesc ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" />Writing…</>
                      ) : (
                        <><Wand2 className="w-3.5 h-3.5" /><Sparkles className="w-3 h-3" />Generate with AI</>
                      )}
                    </button>
                  </div>

                  {!formData.description && (
                    <input
                      type="text"
                      value={ownerNotes}
                      onChange={(e) => setOwnerNotes(e.target.value)}
                      placeholder="Optional: any extra context for AI (e.g. 'comes with 3 drill bits, used twice')"
                      className={`${inputBase} py-2 text-sm mb-2`}
                    />
                  )}

                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                    placeholder="Describe your equipment, its condition, and what's included — or use AI to write it for you ✨"
                    className={`${inputBase} focus:ring-4 focus:ring-teal-500/10 resize-none`}
                  />
                  {genError && <p className="text-xs text-red-500 mt-1">{genError}</p>}
                  {formData.description && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      ✏️ You can edit this — the AI draft is just a starting point.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelBase}>Brand</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="e.g., Caterpillar"
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className={labelBase}>Model</label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="e.g., 320 GC"
                      className={inputBase}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelBase}>Condition</label>
                  <div className="grid grid-cols-4 gap-3">
                    {['new', 'excellent', 'good', 'fair'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormData({ ...formData, condition: c })}
                        className={`px-4 py-3 rounded-xl border text-sm font-medium capitalize transition-colors ${
                          formData.condition === c
                            ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                            : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelBase}>Features</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                      placeholder="Add a feature (e.g., GPS, AC, Low Hours)"
                      className={inputBase}
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      aria-label="Add feature"
                      className="px-4 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          aria-label="Remove feature"
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Add photos of your equipment
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    High-quality photos help renters understand what they're getting
                  </p>
                </div>

                <div
                  className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl p-12 text-center hover:border-teal-400 dark:hover:border-teal-500 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    {uploadingImages ? (
                      <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                    ) : (
                      <Camera className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {uploadingImages ? 'Uploading…' : 'Drag and drop photos here, or click to browse'}
                  </p>
                  <button
                    type="button"
                    disabled={uploadingImages}
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="px-6 py-3 bg-teal-500 text-white font-medium rounded-xl hover:bg-teal-600 transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-5 h-5 inline mr-2" />
                    Upload Photos
                  </button>
                </div>

                {uploadError && <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>}

                {formData.images.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
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
                            aria-label="Remove image"
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

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Set your pricing
                    </h2>
                    <button
                      type="button"
                      onClick={handleSuggestPricing}
                      disabled={!formData.title || suggestingPrice}
                      title="Let AI suggest market rates for this gear"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-brand-gradient text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm mt-1"
                    >
                      {suggestingPrice ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" />Researching…</>
                      ) : (
                        <><Sparkles className="w-3.5 h-3.5" />Suggest Prices</>
                      )}
                    </button>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose competitive rates to attract more renters
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                  <div>
                    <label className={labelBase}>Daily Rate *</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.daily_rate || ''}
                        onChange={(e) => setFormData({ ...formData, daily_rate: Number(e.target.value) })}
                        placeholder="0.00"
                        className={`${inputBase} pl-12 pr-16`}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                        /day
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelBase}>Weekly Rate (optional)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={formData.weekly_rate || ''}
                          onChange={(e) => setFormData({ ...formData, weekly_rate: Number(e.target.value) })}
                          placeholder="0.00"
                          className={`${inputBase} pl-12 pr-16`}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                          /week
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className={labelBase}>Monthly Rate (optional)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={formData.monthly_rate || ''}
                          onChange={(e) => setFormData({ ...formData, monthly_rate: Number(e.target.value) })}
                          placeholder="0.00"
                          className={`${inputBase} pl-12 pr-16`}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                          /month
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelBase}>Security Deposit</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.deposit_amount || ''}
                        onChange={(e) => setFormData({ ...formData, deposit_amount: Number(e.target.value) })}
                        placeholder="0.00"
                        className={`${inputBase} pl-12`}
                      />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                      Refundable upon safe return of equipment
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                  <div>
                    <label className={labelBase}>Location *</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="City, State"
                        className={`${inputBase} pl-12`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelBase}>Minimum Rental Days</label>
                      <input
                        type="number"
                        value={formData.min_rental_days}
                        onChange={(e) => setFormData({ ...formData, min_rental_days: Number(e.target.value) })}
                        min={1}
                        className={inputBase}
                      />
                    </div>
                    <div>
                      <label className={labelBase}>Maximum Rental Days</label>
                      <input
                        type="number"
                        value={formData.max_rental_days}
                        onChange={(e) => setFormData({ ...formData, max_rental_days: Number(e.target.value) })}
                        min={1}
                        className={inputBase}
                      />
                    </div>
                  </div>

                  {priceReasoning && (
                    <div className="flex items-start gap-2 px-4 py-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-100 dark:border-teal-800 text-sm text-teal-800 dark:text-teal-300 mt-2">
                      <Sparkles className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                      <span><strong>AI tip:</strong> {priceReasoning}</span>
                    </div>
                  )}
                  {priceError && <p className="text-xs text-red-500 mt-1">{priceError}</p>}
                </div>
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Review your listing
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Make sure everything looks good before publishing
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {formData.images.length > 0 && (
                    <img
                      src={formData.images[0]}
                      alt={formData.title}
                      className="w-full h-64 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {formData.title || 'Untitled Equipment'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-4">
                      <MapPin className="w-4 h-4" />
                      {formData.location || 'Location not set'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {formData.description || 'No description provided'}
                    </p>

                    {formData.features.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {formData.features.map((feature, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            ${formData.daily_rate}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">/day</span>
                        </div>
                        {formData.weekly_rate > 0 && (
                          <span className="text-gray-500 dark:text-gray-400">
                            ${formData.weekly_rate}/week
                          </span>
                        )}
                        {formData.monthly_rate > 0 && (
                          <span className="text-gray-500 dark:text-gray-400">
                            ${formData.monthly_rate}/month
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 flex items-start gap-3 border border-green-100 dark:border-green-800">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                      Your listing is ready to publish!
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-500">
                      Once published, your equipment will be visible to thousands of renters.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer nav */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                step === 1
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all ${
                isStepValid()
                  ? 'bg-brand-gradient text-white hover:opacity-90 shadow-pop'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
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
