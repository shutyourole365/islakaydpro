import { useState, useMemo } from 'react';
import {
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Shield,
  Truck,
  CreditCard,
  MapPin,
  CheckCircle,
  Check,
  Info,
  Star,
  Tag,
  Gift,
  Lock,
  ArrowRight,
  FileText,
} from 'lucide-react';
import type { Equipment, InsurancePlan } from '../../types';
import SmartScheduler from '../scheduling/SmartScheduler';

interface BookingSystemProps {
  equipment: Equipment;
  onClose: () => void;
  onComplete: (booking: BookingDetails) => void;
  insurancePlans?: InsurancePlan[];
}

interface BookingDetails {
  equipmentId: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  basePrice: number;
  discount: number;
  insurance: InsurancePlan | null;
  serviceFee: number;
  deposit: number;
  total: number;
  delivery: boolean;
  deliveryAddress?: string;
  notes?: string;
  promoCode?: string;
}

type BookingStep = 'dates' | 'options' | 'payment' | 'confirmation';

const defaultInsurancePlans: InsurancePlan[] = [
  {
    id: 'basic',
    name: 'Basic Protection',
    rate: 0.05,
    coverage: 1000,
    features: ['Accidental damage up to $1,000', 'Theft protection', '24/7 support'],
  },
  {
    id: 'standard',
    name: 'Standard Protection',
    rate: 0.1,
    coverage: 5000,
    features: ['Accidental damage up to $5,000', 'Theft protection', 'No deductible', 'Lost item coverage'],
  },
  {
    id: 'premium',
    name: 'Premium Protection',
    rate: 0.15,
    coverage: 10000,
    features: ['Full damage coverage', 'Theft protection', 'No deductible', 'Lost item coverage', 'Rental extension included'],
  },
];

export default function BookingSystem({
  equipment,
  onClose,
  onComplete,
  insurancePlans = defaultInsurancePlans,
}: BookingSystemProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>('dates');
  const [showSmartScheduler, setShowSmartScheduler] = useState(false);
  const [selectedStart, setSelectedStart] = useState<Date | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedInsurance, setSelectedInsurance] = useState<InsurancePlan | null>(null);
  const [deliveryOption, setDeliveryOption] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Calculate rental duration and pricing
  const rentalDays = useMemo(() => {
    if (!selectedStart || !selectedEnd) return 0;
    return Math.ceil((selectedEnd.getTime() - selectedStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }, [selectedStart, selectedEnd]);

  const pricing = useMemo(() => {
    if (rentalDays === 0) {
      return { basePrice: 0, discount: 0, insurance: 0, serviceFee: 0, deposit: 0, total: 0, savedAmount: 0 };
    }

    let basePrice = rentalDays * equipment.daily_rate;
    let discount = 0;

    // Apply weekly/monthly discounts
    if (rentalDays >= 30 && equipment.monthly_rate) {
      const months = Math.floor(rentalDays / 30);
      const remainingDays = rentalDays % 30;
      basePrice = months * equipment.monthly_rate + remainingDays * equipment.daily_rate;
      discount = (rentalDays * equipment.daily_rate) - basePrice;
    } else if (rentalDays >= 7 && equipment.weekly_rate) {
      const weeks = Math.floor(rentalDays / 7);
      const remainingDays = rentalDays % 7;
      basePrice = weeks * equipment.weekly_rate + remainingDays * equipment.daily_rate;
      discount = (rentalDays * equipment.daily_rate) - basePrice;
    }

    // Apply promo discount
    if (promoApplied) {
      discount += basePrice * promoDiscount;
      basePrice = basePrice * (1 - promoDiscount);
    }

    const insuranceAmount = selectedInsurance ? basePrice * selectedInsurance.rate : 0;
    const deliveryFee = deliveryOption === 'delivery' ? 50 : 0;
    const serviceFee = basePrice * 0.12;
    const deposit = equipment.deposit_amount;
    const total = basePrice + insuranceAmount + serviceFee + deliveryFee + deposit;
    const savedAmount = discount;

    return { basePrice, discount, insurance: insuranceAmount, serviceFee, deliveryFee, deposit, total, savedAmount };
  }, [rentalDays, equipment, selectedInsurance, deliveryOption, promoApplied, promoDiscount]);

  const steps: { id: BookingStep; label: string; icon: React.ReactNode }[] = [
    { id: 'dates', label: 'Select Dates', icon: <Calendar className="w-5 h-5" /> },
    { id: 'options', label: 'Options', icon: <Shield className="w-5 h-5" /> },
    { id: 'payment', label: 'Payment', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'confirmation', label: 'Confirm', icon: <CheckCircle className="w-5 h-5" /> },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  // Calendar generation
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [currentMonth]);

  const isDateDisabled = (date: Date) => {
    return date < today;
  };

  const isDateInRange = (date: Date) => {
    if (!selectedStart || !selectedEnd) return false;
    return date > selectedStart && date < selectedEnd;
  };

  const isDateSelected = (date: Date) => {
    if (selectedStart && date.toDateString() === selectedStart.toDateString()) return true;
    if (selectedEnd && date.toDateString() === selectedEnd.toDateString()) return true;
    return false;
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;

    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(date);
      setSelectedEnd(null);
    } else {
      if (date < selectedStart) {
        setSelectedStart(date);
      } else {
        const daysDiff = Math.ceil((date.getTime() - selectedStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        if (daysDiff >= equipment.min_rental_days && daysDiff <= equipment.max_rental_days) {
          setSelectedEnd(date);
        }
      }
    }
  };

  const applyPromoCode = () => {
    // Demo promo codes
    const promoCodes: Record<string, number> = {
      'FIRST10': 0.10,
      'SUMMER20': 0.20,
      'WEEKEND15': 0.15,
    };

    const discount = promoCodes[promoCode.toUpperCase()];
    if (discount) {
      setPromoDiscount(discount);
      setPromoApplied(true);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'dates':
        return selectedStart && selectedEnd && rentalDays >= equipment.min_rental_days;
      case 'options':
        return deliveryOption === 'pickup' || (deliveryOption === 'delivery' && deliveryAddress.trim());
      case 'payment':
        return agreeToTerms;
      default:
        return true;
    }
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const handleComplete = async () => {
    if (!selectedStart || !selectedEnd) return;

    setIsProcessing(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const booking: BookingDetails = {
      equipmentId: equipment.id,
      startDate: selectedStart,
      endDate: selectedEnd,
      totalDays: rentalDays,
      basePrice: pricing.basePrice,
      discount: pricing.discount,
      insurance: selectedInsurance,
      serviceFee: pricing.serviceFee,
      deposit: pricing.deposit,
      total: pricing.total,
      delivery: deliveryOption === 'delivery',
      deliveryAddress: deliveryOption === 'delivery' ? deliveryAddress : undefined,
      notes: notes || undefined,
      promoCode: promoApplied ? promoCode : undefined,
    };

    setIsProcessing(false);
    setCurrentStep('confirmation');
    onComplete(booking);
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={equipment.images[0]}
              alt={equipment.title}
              className="w-14 h-14 rounded-xl object-cover"
            />
            <div>
              <h2 className="font-semibold text-gray-900">{equipment.title}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                {equipment.rating.toFixed(1)} • {equipment.total_reviews} reviews
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center gap-2 ${
                    index <= currentStepIndex ? 'text-teal-600' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index < currentStepIndex
                        ? 'bg-teal-500 text-white'
                        : index === currentStepIndex
                        ? 'bg-teal-100 text-teal-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {index < currentStepIndex ? <CheckCircle className="w-5 h-5" /> : step.icon}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 sm:w-24 h-0.5 mx-2 ${
                      index < currentStepIndex ? 'bg-teal-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Date Selection */}
          {currentStep === 'dates' && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Calendar */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Rental Dates</h3>
                
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                      className="p-1 hover:bg-gray-200 rounded-lg"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h4 className="font-semibold">
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h4>
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                      className="p-1 hover:bg-gray-200 rounded-lg"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-1 px-2 py-2 bg-gray-50">
                    {dayNames.map((day) => (
                      <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1 p-2">
                    {daysInMonth.map((date, index) => {
                      if (!date) {
                        return <div key={`empty-${index}`} className="aspect-square" />;
                      }

                      const disabled = isDateDisabled(date);
                      const selected = isDateSelected(date);
                      const inRange = isDateInRange(date);
                      const isToday = date.toDateString() === today.toDateString();

                      return (
                        <button
                          key={date.toISOString()}
                          onClick={() => handleDateClick(date)}
                          disabled={disabled}
                          className={`
                            aspect-square flex items-center justify-center rounded-lg text-sm font-medium
                            transition-all duration-200
                            ${disabled ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
                            ${selected ? 'bg-teal-500 text-white shadow-lg' : ''}
                            ${inRange && !selected ? 'bg-teal-100 text-teal-700' : ''}
                            ${!disabled && !selected && !inRange ? 'hover:bg-gray-100 text-gray-900' : ''}
                            ${isToday && !selected ? 'ring-2 ring-teal-500 ring-offset-1' : ''}
                          `}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-teal-500" />
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-teal-100" />
                    <span>In range</span>
                  </div>
                </div>
              </div>

              {/* Date Summary */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rental Summary</h3>
                
                <div className="space-y-4">
                  {/* Selected Dates */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wide">Start Date</label>
                        <p className="font-semibold text-gray-900 mt-1">
                          {selectedStart?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || '—'}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wide">End Date</label>
                        <p className="font-semibold text-gray-900 mt-1">
                          {selectedEnd?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || '—'}
                        </p>
                      </div>
                    </div>
                    {rentalDays > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Duration</span>
                          <span className="font-semibold text-gray-900">{rentalDays} day{rentalDays > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rental Requirements */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-800">Rental Requirements</p>
                        <ul className="mt-2 text-blue-700 space-y-1">
                          <li>• Minimum rental: {equipment.min_rental_days} day{equipment.min_rental_days > 1 ? 's' : ''}</li>
                          <li>• Maximum rental: {equipment.max_rental_days} days</li>
                          <li>• Deposit required: ${equipment.deposit_amount}</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Quick Price Preview */}
                  {rentalDays > 0 && (
                    <div className="bg-teal-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-teal-700">${equipment.daily_rate}/day × {rentalDays} days</p>
                          {pricing.savedAmount > 0 && (
                            <p className="text-xs text-green-600 mt-1">
                              <Gift className="w-3 h-3 inline mr-1" />
                              You save ${pricing.savedAmount.toFixed(2)} with duration discount!
                            </p>
                          )}
                        </div>
                        <p className="text-2xl font-bold text-teal-700">${pricing.basePrice.toLocaleString()}</p>
                      </div>
                    </div>
                  )}

                  {/* Smart Scheduler */}
                  <button
                    onClick={() => setShowSmartScheduler(true)}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    Use Smart Scheduler
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Options */}
          {currentStep === 'options' && (
            <div className="space-y-6">
              {/* Insurance Plans */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-teal-500" />
                  Protection Plans
                </h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  {insurancePlans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedInsurance(selectedInsurance?.id === plan.id ? null : plan)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedInsurance?.id === plan.id
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">{plan.name}</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedInsurance?.id === plan.id ? 'border-teal-500 bg-teal-500' : 'border-gray-300'
                        }`}>
                          {selectedInsurance?.id === plan.id && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                      <p className="text-teal-600 font-semibold mb-2">
                        +{(plan.rate * 100).toFixed(0)}% of rental
                      </p>
                      <ul className="space-y-1">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="text-xs text-gray-600 flex items-center gap-1">
                            <Check className="w-3 h-3 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Options */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-teal-500" />
                  Delivery Options
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setDeliveryOption('pickup')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      deliveryOption === 'pickup'
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        deliveryOption === 'pickup' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Self Pickup</p>
                        <p className="text-sm text-gray-500">Free • {equipment.location}</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setDeliveryOption('delivery')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      deliveryOption === 'delivery'
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        deliveryOption === 'delivery' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Delivery</p>
                        <p className="text-sm text-gray-500">+$50 • Direct to your location</p>
                      </div>
                    </div>
                  </button>
                </div>

                {deliveryOption === 'delivery' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter your delivery address"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                )}
              </div>

              {/* Promo Code */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-teal-500" />
                  Promo Code
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code"
                    disabled={promoApplied}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                  />
                  <button
                    onClick={applyPromoCode}
                    disabled={promoApplied || !promoCode.trim()}
                    className="px-6 py-3 bg-teal-500 text-white font-medium rounded-xl hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {promoApplied ? 'Applied!' : 'Apply'}
                  </button>
                </div>
                {promoApplied && (
                  <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {(promoDiscount * 100).toFixed(0)}% discount applied!
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-500" />
                  Special Requests (Optional)
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requirements or notes for the owner..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {currentStep === 'payment' && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Price Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Breakdown</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">${equipment.daily_rate}/day × {rentalDays} days</span>
                    <span className="font-medium">${(equipment.daily_rate * rentalDays).toLocaleString()}</span>
                  </div>
                  
                  {pricing.savedAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Duration discount</span>
                      <span>-${pricing.savedAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {selectedInsurance && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{selectedInsurance.name}</span>
                      <span className="font-medium">${pricing.insurance.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {deliveryOption === 'delivery' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery fee</span>
                      <span className="font-medium">$50.00</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service fee (12%)</span>
                    <span className="font-medium">${pricing.serviceFee.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Refundable deposit</span>
                    <span className="font-medium">${pricing.deposit.toFixed(2)}</span>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-teal-600">${pricing.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiry</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 mt-6">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="w-4 h-4 text-teal-500 rounded mt-1"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the <a href="#" className="text-teal-600 hover:underline">Terms of Service</a> and{' '}
                      <a href="#" className="text-teal-600 hover:underline">Rental Agreement</a>. I understand that the deposit
                      is refundable upon safe return of the equipment.
                    </label>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-4">
                    <Lock className="w-4 h-4" />
                    Your payment is secure and encrypted
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 'confirmation' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
              <p className="text-gray-600 mb-6">
                Your booking reference is <span className="font-mono font-bold">ISK-{Date.now().toString().slice(-8)}</span>
              </p>
              
              <div className="bg-gray-50 rounded-xl p-6 max-w-md mx-auto text-left">
                <h3 className="font-semibold text-gray-900 mb-4">What's Next?</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <p className="text-sm text-gray-600">Confirmation email sent to your inbox</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <p className="text-sm text-gray-600">Owner will confirm within 2 hours</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <p className="text-sm text-gray-600">
                      {deliveryOption === 'delivery' 
                        ? 'Equipment will be delivered to your address'
                        : 'Pick up at the scheduled time'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          {currentStep !== 'confirmation' && (
            <>
              <button
                onClick={currentStep === 'dates' ? onClose : handleBack}
                className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                {currentStep === 'dates' ? 'Cancel' : 'Back'}
              </button>
              
              <button
                onClick={currentStep === 'payment' ? handleComplete : handleNext}
                disabled={!canProceed() || isProcessing}
                className="px-8 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : currentStep === 'payment' ? (
                  <>
                    <Lock className="w-4 h-4" />
                    Complete Booking
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          )}
          
          {currentStep === 'confirmation' && (
            <div className="w-full flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {}}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                View My Bookings
              </button>
            </div>
          )}
        </div>
      </div>

      {showSmartScheduler && (
        <SmartScheduler
          equipmentId={equipment.id}
          equipmentTitle={equipment.title}
          dailyRate={equipment.daily_rate}
          onSchedule={(startDate, endDate) => {
            setSelectedStart(startDate);
            setSelectedEnd(endDate);
            setShowSmartScheduler(false);
            setCurrentStep('options');
          }}
          onClose={() => setShowSmartScheduler(false)}
        />
      )}
    </div>
  );
}
