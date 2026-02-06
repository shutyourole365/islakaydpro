import { useState, useEffect } from 'react';
import {
  Zap,
  CheckCircle,
  Clock,
  Calendar,
  CreditCard,
  Shield,
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
  Star,
  MapPin,
  Truck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface Equipment {
  id: string;
  title: string;
  daily_rate: number;
  image_url: string;
  owner: {
    name: string;
    avatar?: string;
    rating: number;
  };
  location: string;
  instant_book: boolean;
}

interface SavedPaymentMethod {
  id: string;
  type: 'card' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  isDefault: boolean;
}

interface QuickRentProps {
  equipment: Equipment;
  userTrustScore: number;
  savedPaymentMethods: SavedPaymentMethod[];
  onRent: (data: QuickRentData) => Promise<void>;
  onClose: () => void;
  className?: string;
}

export interface QuickRentData {
  equipmentId: string;
  startDate: Date;
  endDate: Date;
  paymentMethodId: string;
  deliveryOption: 'pickup' | 'delivery';
  totalAmount: number;
}

const quickRentDurations = [
  { days: 1, label: '1 Day', discount: 0 },
  { days: 3, label: '3 Days', discount: 5 },
  { days: 7, label: '1 Week', discount: 10 },
  { days: 14, label: '2 Weeks', discount: 15 },
];

export default function QuickRent({
  equipment,
  userTrustScore,
  savedPaymentMethods,
  onRent,
  onClose,
  className = '',
}: QuickRentProps) {
  const [selectedDuration, setSelectedDuration] = useState(quickRentDurations[0]);
  const [selectedPayment, setSelectedPayment] = useState(
    savedPaymentMethods.find((p) => p.isDefault)?.id || savedPaymentMethods[0]?.id
  );
  const [deliveryOption, setDeliveryOption] = useState<'pickup' | 'delivery'>('pickup');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Check eligibility
  useEffect(() => {
    // User must have trust score >= 80 and saved payment method
    const eligible = userTrustScore >= 80 && savedPaymentMethods.length > 0 && equipment.instant_book;
    setIsEligible(eligible);
  }, [userTrustScore, savedPaymentMethods, equipment.instant_book]);

  // Calculate pricing
  const basePrice = equipment.daily_rate * selectedDuration.days;
  const discount = basePrice * (selectedDuration.discount / 100);
  const deliveryFee = deliveryOption === 'delivery' ? 49 : 0;
  const serviceFee = Math.round((basePrice - discount) * 0.08);
  const totalAmount = basePrice - discount + serviceFee + deliveryFee;

  // Start date is today, end date based on duration
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + selectedDuration.days);

  // Handle quick rent
  const handleQuickRent = async () => {
    if (!selectedPayment) return;

    setShowConfirmation(true);
    setCountdown(3);

    // Countdown
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          processRent();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const processRent = async () => {
    setIsProcessing(true);

    try {
      await onRent({
        equipmentId: equipment.id,
        startDate,
        endDate,
        paymentMethodId: selectedPayment!,
        deliveryOption,
        totalAmount,
      });
    } catch (error) {
      console.error('Quick rent failed:', error);
      setShowConfirmation(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelQuickRent = () => {
    setShowConfirmation(false);
    setCountdown(3);
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'apple_pay':
        return '🍎';
      case 'google_pay':
        return '🟢';
      default:
        return '💳';
    }
  };

  if (!isEligible) {
    return (
      <div className={`fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 ${className}`}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Quick Rent Not Available
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {userTrustScore < 80 
                ? `Your trust score (${userTrustScore}) needs to be 80+ to use Quick Rent.`
                : savedPaymentMethods.length === 0
                ? 'Add a payment method to use Quick Rent.'
                : 'This equipment doesn\'t support instant booking.'}
            </p>

            {/* Requirements */}
            <div className="text-left space-y-3 mb-6">
              <div className={`flex items-center gap-3 p-3 rounded-lg ${
                userTrustScore >= 80 ? 'bg-green-50' : 'bg-gray-50'
              }`}>
                {userTrustScore >= 80 ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                )}
                <span className="text-sm">Trust Score 80+ (yours: {userTrustScore})</span>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-lg ${
                savedPaymentMethods.length > 0 ? 'bg-green-50' : 'bg-gray-50'
              }`}>
                {savedPaymentMethods.length > 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                )}
                <span className="text-sm">Saved payment method</span>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-lg ${
                equipment.instant_book ? 'bg-green-50' : 'bg-gray-50'
              }`}>
                {equipment.instant_book ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                )}
                <span className="text-sm">Equipment allows instant booking</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg overflow-hidden">
        {!showConfirmation ? (
          <>
            {/* Header */}
            <div className="relative p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-6 h-6 text-yellow-300" />
                <h2 className="text-xl font-bold">Quick Rent</h2>
              </div>
              <p className="text-emerald-100 text-sm">One-tap rental for trusted users</p>
            </div>

            {/* Equipment Info */}
            <div className="p-4 border-b dark:border-gray-700">
              <div className="flex gap-4">
                <img
                  src={equipment.image_url}
                  alt={equipment.title}
                  className="w-20 h-20 object-cover rounded-xl"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{equipment.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>{equipment.owner.rating.toFixed(1)}</span>
                    <span>•</span>
                    <span>{equipment.owner.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{equipment.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Duration Selection */}
            <div className="p-4 border-b dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Duration
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {quickRentDurations.map((duration) => (
                  <button
                    key={duration.days}
                    onClick={() => setSelectedDuration(duration)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      selectedDuration.days === duration.days
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="block font-semibold text-gray-900 dark:text-white">
                      {duration.label}
                    </span>
                    {duration.discount > 0 && (
                      <span className="text-xs text-emerald-600">-{duration.discount}%</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-3 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>
                  {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Delivery Option */}
            <div className="p-4 border-b dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Delivery Option
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDeliveryOption('pickup')}
                  className={`p-3 rounded-xl border-2 flex items-center gap-3 ${
                    deliveryOption === 'pickup'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <div className="text-left">
                    <span className="block font-medium text-gray-900 dark:text-white">Pickup</span>
                    <span className="text-xs text-gray-500">Free</span>
                  </div>
                </button>
                <button
                  onClick={() => setDeliveryOption('delivery')}
                  className={`p-3 rounded-xl border-2 flex items-center gap-3 ${
                    deliveryOption === 'delivery'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <Truck className="w-5 h-5 text-gray-600" />
                  <div className="text-left">
                    <span className="block font-medium text-gray-900 dark:text-white">Delivery</span>
                    <span className="text-xs text-gray-500">+$49</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div className="p-4 border-b dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Payment Method
              </h4>
              <div className="space-y-2">
                {savedPaymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 ${
                      selectedPayment === method.id
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <span className="text-2xl">{getPaymentIcon(method.type)}</span>
                    <div className="flex-1 text-left">
                      <span className="block font-medium text-gray-900 dark:text-white">
                        {method.type === 'card'
                          ? `${method.brand} •••• ${method.last4}`
                          : method.type === 'apple_pay'
                          ? 'Apple Pay'
                          : 'Google Pay'}
                      </span>
                      {method.isDefault && (
                        <span className="text-xs text-emerald-600">Default</span>
                      )}
                    </div>
                    {selectedPayment === method.id && (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    ${equipment.daily_rate} × {selectedDuration.days} days
                  </span>
                  <span className="text-gray-900 dark:text-white">${basePrice}</span>
                </div>
                {selectedDuration.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Duration discount ({selectedDuration.discount}%)</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Service fee</span>
                  <span className="text-gray-900 dark:text-white">${serviceFee}</span>
                </div>
                {deliveryOption === 'delivery' && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivery fee</span>
                    <span className="text-gray-900 dark:text-white">${deliveryFee}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t dark:border-gray-600 font-semibold">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-gray-900 dark:text-white">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Quick Rent Button */}
            <div className="p-4">
              <button
                onClick={handleQuickRent}
                disabled={!selectedPayment}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <Zap className="w-6 h-6 group-hover:animate-pulse" />
                Quick Rent Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
                <Shield className="w-4 h-4" />
                <span>Protected by Islakayd Guarantee</span>
              </div>
            </div>
          </>
        ) : (
          /* Confirmation Screen */
          <div className="p-8 text-center">
            {isProcessing ? (
              <>
                <div className="w-20 h-20 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
                  <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Processing Rental...
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Please wait while we confirm your booking
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 relative">
                  <Zap className="w-10 h-10 text-emerald-600" />
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold animate-pulse">
                    {countdown}
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Confirming in {countdown}...
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  ${totalAmount.toFixed(2)} will be charged to your payment method
                </p>

                <button
                  onClick={cancelQuickRent}
                  className="px-8 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
