import { useState } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  Check, 
  Lock,
  Calendar,
  DollarSign,
  AlertCircle,
  Star
} from 'lucide-react';

interface MultiPaymentSystemProps {
  bookingId: string;
  totalAmount: number;
  depositAmount: number;
  onPaymentComplete: (paymentData: PaymentData) => Promise<void>;
  onClose: () => void;
}

interface PaymentData {
  method: 'card' | 'apple-pay' | 'google-pay' | 'paypal' | 'crypto' | 'installments';
  amount: number;
  installmentPlan?: {
    frequency: 'weekly' | 'biweekly' | 'monthly';
    payments: number;
    amountPerPayment: number;
  };
}

export default function MultiPaymentSystem({
  bookingId,
  totalAmount,
  depositAmount,
  onPaymentComplete,
  onClose,
}: MultiPaymentSystemProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentData['method']>('card');
  const [useInstallments, setUseInstallments] = useState(false);
  const [installmentFrequency, setInstallmentFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('monthly');
  const [numPayments, setNumPayments] = useState(3);
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedCards] = useState([
    { id: '1', last4: '4242', brand: 'Visa', expiry: '12/25' },
    { id: '2', last4: '5555', brand: 'Mastercard', expiry: '06/26' },
  ]);
  const [selectedCard, setSelectedCard] = useState(savedCards[0].id);
  
  // Debug: Track payment processing and keep setSavedCards for future features
  if (import.meta.env.DEV) {
    console.log('MultiPaymentSystem: Processing booking', bookingId);
    // setSavedCards will be used when implementing card management features
  }

  const paymentMethods = [
    {
      id: 'card' as const,
      name: 'Credit/Debit Card',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'Visa, Mastercard, Amex',
      fee: 0,
      available: true,
    },
    {
      id: 'apple-pay' as const,
      name: 'Apple Pay',
      icon: <Smartphone className="w-6 h-6" />,
      description: 'Fast & secure',
      fee: 0,
      available: true,
    },
    {
      id: 'google-pay' as const,
      name: 'Google Pay',
      icon: <Wallet className="w-6 h-6" />,
      description: 'One-tap payment',
      fee: 0,
      available: true,
    },
    {
      id: 'paypal' as const,
      name: 'PayPal',
      icon: <DollarSign className="w-6 h-6" />,
      description: 'Buyer protection',
      fee: 2.5,
      available: true,
    },
    {
      id: 'crypto' as const,
      name: 'Cryptocurrency',
      icon: <Star className="w-6 h-6" />,
      description: 'Bitcoin, Ethereum',
      fee: 0,
      available: totalAmount >= 100,
    },
    {
      id: 'installments' as const,
      name: 'Pay in Installments',
      icon: <Calendar className="w-6 h-6" />,
      description: 'Split into payments',
      fee: 0,
      available: totalAmount >= 500,
    },
  ];

  const calculateInstallmentAmount = () => {
    return totalAmount / numPayments;
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const paymentData: PaymentData = {
        method: selectedMethod,
        amount: totalAmount,
        ...(useInstallments && {
          installmentPlan: {
            frequency: installmentFrequency,
            payments: numPayments,
            amountPerPayment: calculateInstallmentAmount(),
          },
        }),
      };

      await onPaymentComplete(paymentData);
      onClose();
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-teal-500 to-emerald-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Secure Payment</h2>
                <p className="text-teal-100 text-sm">Choose your payment method</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Payment Summary */}
          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Rental Total</span>
                <span>${(totalAmount - depositAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Security Deposit</span>
                <span>${depositAmount.toFixed(2)}</span>
              </div>
              {selectedMethod === 'paypal' && (
                <div className="flex justify-between text-amber-700">
                  <span>PayPal Fee (2.5%)</span>
                  <span>${(totalAmount * 0.025).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold text-lg text-gray-900">
                <span>Total Due Now</span>
                <span>
                  ${(selectedMethod === 'paypal' 
                    ? totalAmount * 1.025 
                    : totalAmount
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Select Payment Method</h3>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => {
                    if (method.available) {
                      setSelectedMethod(method.id);
                      setUseInstallments(method.id === 'installments');
                    }
                  }}
                  disabled={!method.available}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedMethod === method.id
                      ? 'border-teal-500 bg-teal-50'
                      : method.available
                      ? 'border-gray-200 hover:border-gray-300'
                      : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`${
                      selectedMethod === method.id ? 'text-teal-600' : 'text-gray-600'
                    }`}>
                      {method.icon}
                    </div>
                    {selectedMethod === method.id && (
                      <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <p className={`font-semibold mb-1 ${
                    selectedMethod === method.id ? 'text-teal-900' : 'text-gray-900'
                  }`}>
                    {method.name}
                  </p>
                  <p className="text-sm text-gray-600">{method.description}</p>
                  {method.fee > 0 && (
                    <p className="text-xs text-amber-600 mt-1">+{method.fee}% fee</p>
                  )}
                  {!method.available && (
                    <p className="text-xs text-gray-500 mt-1">Not available for this amount</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Installment Plan */}
          {selectedMethod === 'installments' && (
            <div className="p-5 bg-violet-50 rounded-2xl border-2 border-violet-200 space-y-4">
              <h3 className="font-bold text-violet-900">Configure Payment Plan</h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Frequency
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['weekly', 'biweekly', 'monthly'] as const).map((freq) => (
                    <button
                      key={freq}
                      onClick={() => setInstallmentFrequency(freq)}
                      className={`py-2 px-3 rounded-lg font-medium capitalize transition-colors ${
                        installmentFrequency === freq
                          ? 'bg-violet-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Payments: {numPayments}
                </label>
                <input
                  type="range"
                  min="2"
                  max="12"
                  value={numPayments}
                  onChange={(e) => setNumPayments(parseInt(e.target.value))}
                  className="w-full accent-violet-600"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>2 payments</span>
                  <span>12 payments</span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl">
                <p className="text-sm text-gray-600 mb-2">Your payment plan:</p>
                <p className="text-2xl font-bold text-violet-600">
                  ${calculateInstallmentAmount().toFixed(2)}
                  <span className="text-sm font-normal text-gray-600">
                    {' '}× {numPayments} {installmentFrequency} payments
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Saved Cards (if card selected) */}
          {selectedMethod === 'card' && savedCards.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Saved Cards</h3>
              <div className="space-y-2">
                {savedCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => setSelectedCard(card.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      selectedCard === card.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className={`w-6 h-6 ${
                          selectedCard === card.id ? 'text-teal-600' : 'text-gray-600'
                        }`} />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {card.brand} •••• {card.last4}
                          </p>
                          <p className="text-sm text-gray-600">Expires {card.expiry}</p>
                        </div>
                      </div>
                      {selectedCard === card.id && (
                        <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
                
                <button className="w-full p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors text-gray-600 font-medium">
                  + Add New Card
                </button>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="p-4 bg-blue-50 rounded-xl flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">🔒 Secure Payment</p>
              <p>Your payment information is encrypted and secure. We never store your full card details.</p>
            </div>
          </div>

          {/* Auto-Billing Notice */}
          <div className="p-4 bg-amber-50 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">⚠️ Auto-Billing for Overdue/Damage</p>
              <p>
                If equipment is returned late or damaged, additional charges will be automatically billed to this payment method. 
                You'll receive an invoice before any charges are applied.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Pay ${(selectedMethod === 'paypal' ? totalAmount * 1.025 : totalAmount).toFixed(2)}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
