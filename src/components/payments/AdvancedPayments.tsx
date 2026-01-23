import { useState } from 'react';
import {
  CreditCard,
  Smartphone,
  Wallet,
  Shield,
  Check,
  ChevronRight,
  Lock,
  AlertCircle,
  CheckCircle2,
  Bitcoin,

  Globe,
  Zap,
  RefreshCw,
  Building2,
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'apple_pay' | 'google_pay' | 'crypto' | 'bank' | 'paypal';
  name: string;
  icon: React.ReactNode;
  description: string;
  isAvailable: boolean;
  fee?: number;
  processingTime?: string;
}

interface CryptoWallet {
  name: string;
  symbol: string;
  icon: string;
  address?: string;
  balance?: number;
}

interface AdvancedPaymentsProps {
  amount: number;
  onPaymentComplete: (method: string, transactionId: string) => void;
  onCancel: () => void;
}

export default function AdvancedPayments({ amount, onPaymentComplete, onCancel }: AdvancedPaymentsProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'select' | 'details' | 'confirm' | 'success'>('select');
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'apple_pay',
      type: 'apple_pay',
      name: 'Apple Pay',
      icon: <Smartphone className="w-6 h-6" />,
      description: 'Fast, secure checkout with Face ID or Touch ID',
      isAvailable: true,
      fee: 0,
      processingTime: 'Instant',
    },
    {
      id: 'google_pay',
      type: 'google_pay',
      name: 'Google Pay',
      icon: <Wallet className="w-6 h-6" />,
      description: 'Pay securely with your Google account',
      isAvailable: true,
      fee: 0,
      processingTime: 'Instant',
    },
    {
      id: 'crypto',
      type: 'crypto',
      name: 'Cryptocurrency',
      icon: <Bitcoin className="w-6 h-6" />,
      description: 'Pay with BTC, ETH, USDC, or other cryptos',
      isAvailable: true,
      fee: 1,
      processingTime: '10-30 min',
    },
    {
      id: 'card',
      type: 'card',
      name: 'Credit/Debit Card',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'Visa, Mastercard, Amex, Discover',
      isAvailable: true,
      fee: 2.9,
      processingTime: 'Instant',
    },
    {
      id: 'bank',
      type: 'bank',
      name: 'Bank Transfer (ACH)',
      icon: <Building2 className="w-6 h-6" />,
      description: 'Direct bank transfer - lowest fees',
      isAvailable: true,
      fee: 0.5,
      processingTime: '1-3 days',
    },
    {
      id: 'paypal',
      type: 'paypal',
      name: 'PayPal',
      icon: <Globe className="w-6 h-6" />,
      description: 'Pay with your PayPal balance or linked cards',
      isAvailable: true,
      fee: 2.5,
      processingTime: 'Instant',
    },
  ];

  const cryptoWallets: CryptoWallet[] = [
    { name: 'Bitcoin', symbol: 'BTC', icon: '₿', balance: 0.0234 },
    { name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', balance: 1.25 },
    { name: 'USD Coin', symbol: 'USDC', icon: '$', balance: 500 },
    { name: 'Solana', symbol: 'SOL', icon: '◎', balance: 15.5 },
    { name: 'Polygon', symbol: 'MATIC', icon: '⬡', balance: 245 },
  ];

  const calculateFee = (method: PaymentMethod) => {
    if (!method.fee) return 0;
    return (amount * method.fee) / 100;
  };

  const getTotalAmount = (method: PaymentMethod) => {
    return amount + calculateFee(method);
  };

  const handleSelectMethod = (methodId: string) => {
    setSelectedMethod(methodId);
    setError(null);
    
    const method = paymentMethods.find(m => m.id === methodId);
    if (method?.type === 'crypto') {
      setStep('details');
    } else if (method?.type === 'card') {
      setStep('details');
    } else {
      setStep('confirm');
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2500));

      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      setStep('success');
      setTimeout(() => {
        onPaymentComplete(selectedMethod || 'unknown', transactionId);
      }, 2000);
    } catch {
      setError('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const renderMethodSelection = () => (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h3>
      
      {paymentMethods.map((method) => (
        <button
          key={method.id}
          onClick={() => handleSelectMethod(method.id)}
          disabled={!method.isAvailable}
          className={`w-full p-4 rounded-xl border-2 transition-all ${
            selectedMethod === method.id
              ? 'border-teal-500 bg-teal-50'
              : 'border-gray-200 hover:border-gray-300'
          } ${!method.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                method.type === 'apple_pay' ? 'bg-black text-white' :
                method.type === 'google_pay' ? 'bg-white border border-gray-200' :
                method.type === 'crypto' ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white' :
                method.type === 'paypal' ? 'bg-blue-600 text-white' :
                'bg-gray-100 text-gray-600'
              }`}>
                {method.icon}
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">{method.name}</p>
                <p className="text-sm text-gray-500">{method.description}</p>
              </div>
            </div>
            <div className="text-right">
              {method.fee === 0 ? (
                <span className="text-sm text-green-600 font-medium">No fee</span>
              ) : (
                <span className="text-sm text-gray-500">{method.fee}% fee</span>
              )}
              <p className="text-xs text-gray-400">{method.processingTime}</p>
            </div>
          </div>
        </button>
      ))}

      <div className="flex items-center gap-2 mt-6 p-3 bg-green-50 rounded-xl">
        <Shield className="w-5 h-5 text-green-600" />
        <span className="text-sm text-green-700">
          All payments are secured with 256-bit encryption
        </span>
      </div>
    </div>
  );

  const renderCryptoDetails = () => (
    <div className="space-y-4">
      <button onClick={() => setStep('select')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <ChevronRight className="w-4 h-4 rotate-180" />
        Back
      </button>

      <h3 className="text-lg font-semibold text-gray-900">Select Cryptocurrency</h3>
      
      <div className="space-y-2">
        {cryptoWallets.map((crypto) => (
          <button
            key={crypto.symbol}
            onClick={() => {
              setSelectedCrypto(crypto.symbol);
              setStep('confirm');
            }}
            className={`w-full p-4 rounded-xl border-2 transition-all ${
              selectedCrypto === crypto.symbol
                ? 'border-teal-500 bg-teal-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-lg">
                  {crypto.icon}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{crypto.name}</p>
                  <p className="text-sm text-gray-500">{crypto.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{crypto.balance} {crypto.symbol}</p>
                <p className="text-xs text-gray-400">Available balance</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="p-4 bg-amber-50 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Network Fees Apply</p>
            <p className="text-sm text-amber-700">
              Crypto payments include network transaction fees. Final amount may vary slightly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCardDetails = () => (
    <div className="space-y-4">
      <button onClick={() => setStep('select')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <ChevronRight className="w-4 h-4 rotate-180" />
        Back
      </button>

      <h3 className="text-lg font-semibold text-gray-900">Card Details</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
          <div className="relative">
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
            />
            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
            <input
              type="text"
              placeholder="MM/YY"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
            <div className="relative">
              <input
                type="text"
                placeholder="123"
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              />
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
          <input
            type="text"
            placeholder="John Doe"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-teal-500" />
          <span className="text-sm text-gray-600">Save card for future payments</span>
        </label>
      </div>

      <button
        onClick={() => setStep('confirm')}
        className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
      >
        Continue to Review
      </button>
    </div>
  );

  const renderConfirmation = () => {
    const method = paymentMethods.find(m => m.id === selectedMethod);
    if (!method) return null;

    return (
      <div className="space-y-4">
        <button onClick={() => setStep(selectedMethod === 'crypto' ? 'details' : 'select')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back
        </button>

        <h3 className="text-lg font-semibold text-gray-900">Confirm Payment</h3>

        <div className="p-4 bg-gray-50 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Payment Method</span>
            <div className="flex items-center gap-2">
              {method.icon}
              <span className="font-medium">{method.name}</span>
              {selectedCrypto && <span className="text-sm text-gray-500">({selectedCrypto})</span>}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">${amount.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Processing Fee ({method.fee || 0}%)</span>
            <span className="font-medium">${calculateFee(method).toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-lg font-bold text-teal-600">${getTotalAmount(method).toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
          <Zap className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-blue-700">
            Processing time: {method.processingTime}
          </span>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              Pay ${getTotalAmount(method).toFixed(2)}
            </>
          )}
        </button>

        <p className="text-xs text-center text-gray-500">
          By confirming, you agree to our Terms of Service and authorize this payment
        </p>
      </div>
    );
  };

  const renderSuccess = () => (
    <div className="text-center py-8 space-y-4">
      <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900">Payment Successful!</h3>
      <p className="text-gray-600">
        Your payment of ${amount.toFixed(2)} has been processed successfully.
      </p>
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <Check className="w-4 h-4 text-green-500" />
        Confirmation email sent
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-teal-500 to-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Secure Checkout</h2>
              <p className="text-white/80 text-sm">Amount: ${amount.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full">
              <Lock className="w-4 h-4 text-white" />
              <span className="text-sm text-white">Encrypted</span>
            </div>
          </div>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {step === 'select' && renderMethodSelection()}
          {step === 'details' && selectedMethod === 'crypto' && renderCryptoDetails()}
          {step === 'details' && selectedMethod === 'card' && renderCardDetails()}
          {step === 'confirm' && renderConfirmation()}
          {step === 'success' && renderSuccess()}
        </div>

        {step !== 'success' && (
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={onCancel}
              className="w-full py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="px-6 pb-6 pt-2 flex items-center justify-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" /> PCI Compliant
          </span>
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3" /> SSL Secured
          </span>
          <span className="flex items-center gap-1">
            <Check className="w-3 h-3" /> Verified
          </span>
        </div>
      </div>
    </div>
  );
}
