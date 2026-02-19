import { useState } from 'react';
import { Zap, Calendar, CreditCard, Check, Clock, MapPin, DollarSign } from 'lucide-react';
import type { Equipment } from '../../types';

interface QuickBookProps {
  equipment: Equipment;
  lastBookingDates?: {
    startDate: string;
    endDate: string;
  };
  savedPaymentMethod?: {
    type: 'card' | 'paypal';
    last4?: string;
    email?: string;
  };
  onConfirm: (bookingData: {
    equipmentId: string;
    startDate: string;
    endDate: string;
    paymentMethod: string;
  }) => void;
  onClose: () => void;
}

export default function QuickBook({
  equipment,
  lastBookingDates,
  savedPaymentMethod,
  onConfirm,
  onClose,
}: QuickBookProps) {
  const [startDate, setStartDate] = useState(
    lastBookingDates?.startDate || ''
  );
  const [endDate, setEndDate] = useState(
    lastBookingDates?.endDate || ''
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const days = calculateDays();
  const subtotal = days * equipment.daily_rate;
  const serviceFee = subtotal * 0.12;
  const total = subtotal + serviceFee + equipment.deposit_amount;

  const handleQuickBook = async () => {
    setIsProcessing(true);
    
    // Simulate booking process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onConfirm({
      equipmentId: equipment.id,
      startDate,
      endDate,
      paymentMethod: savedPaymentMethod?.type || 'card',
    });
    
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-500 to-emerald-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Quick Book</h2>
              <p className="text-white/90 text-sm">
                Book again in seconds with saved details
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Equipment Card */}
          <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl">
            <img
              src={equipment.images[0]}
              alt={equipment.title}
              className="w-24 h-24 rounded-xl object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                {equipment.title}
              </h3>
              <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                <MapPin className="w-4 h-4" />
                {equipment.location}
              </p>
              <p className="text-teal-600 font-semibold">
                ${equipment.daily_rate}/day
              </p>
            </div>
          </div>

          {/* Quick Features */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
              <Check className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs text-green-600">Verified Owner</p>
                <p className="text-sm font-semibold text-gray-900">Trusted</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-blue-600">Response Time</p>
                <p className="text-sm font-semibold text-gray-900">&lt; 2 hours</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl border border-purple-100">
              <Zap className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-xs text-purple-600">Instant Book</p>
                <p className="text-sm font-semibold text-gray-900">Enabled</p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Rental Dates
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
            {days > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                {days} day{days > 1 ? 's' : ''} rental
              </p>
            )}
          </div>

          {/* Payment Method */}
          {savedPaymentMethod && (
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment Method
                </label>
                <span className="text-xs text-teal-600 font-medium">Saved</span>
              </div>
              <div className="flex items-center gap-3">
                {savedPaymentMethod.type === 'card' && (
                  <>
                    <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                      VISA
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        •••• •••• •••• {savedPaymentMethod.last4}
                      </p>
                      <p className="text-xs text-gray-500">Primary card</p>
                    </div>
                  </>
                )}
                {savedPaymentMethod.type === 'paypal' && (
                  <>
                    <div className="w-12 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                      PP
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {savedPaymentMethod.email}
                      </p>
                      <p className="text-xs text-gray-500">PayPal</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          {days > 0 && (
            <div className="space-y-3 p-4 bg-teal-50 rounded-2xl border border-teal-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">
                  ${equipment.daily_rate} x {days} days
                </span>
                <span className="font-medium text-gray-900">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Service fee (12%)</span>
                <span className="font-medium text-gray-900">
                  ${serviceFee.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Refundable deposit</span>
                <span className="font-medium text-gray-900">
                  ${equipment.deposit_amount.toFixed(2)}
                </span>
              </div>
              <div className="pt-3 border-t border-teal-200 flex justify-between">
                <span className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Total
                </span>
                <span className="text-2xl font-bold text-teal-600">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Benefits */}
          <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              Quick Book Benefits
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <span>Instant confirmation - no waiting for approval</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <span>Saved payment details - secure and fast checkout</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <span>Free cancellation up to 48 hours before pickup</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleQuickBook}
            disabled={!startDate || !endDate || days === 0 || isProcessing}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Confirm & Book Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
