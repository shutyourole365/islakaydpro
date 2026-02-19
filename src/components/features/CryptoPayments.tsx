import { ArrowLeft, Bitcoin, DollarSign, CreditCard, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState } from 'react';

interface CryptoPaymentsProps {
  onBack: () => void;
  amount?: number;
  currency?: 'AUD' | 'USD';
}

export default function CryptoPayments({ onBack, amount = 2500, currency = 'AUD' }: CryptoPaymentsProps) {
  const [selectedCrypto, setSelectedCrypto] = useState<string>('btc');
  const [paymentStep, setPaymentStep] = useState<'select' | 'confirm' | 'processing' | 'complete'>('select');
  const [walletAddress, setWalletAddress] = useState('');

  const cryptoOptions = [
    {
      id: 'btc',
      name: 'Bitcoin',
      symbol: 'BTC',
      icon: '₿',
      rate: 0.000034,
      network: 'Bitcoin',
      processingTime: '10-60 min',
      fee: 0.001
    },
    {
      id: 'eth',
      name: 'Ethereum',
      symbol: 'ETH',
      icon: 'Ξ',
      rate: 0.00052,
      network: 'Ethereum',
      processingTime: '2-5 min',
      fee: 0.0001
    },
    {
      id: 'usdc',
      name: 'USD Coin',
      symbol: 'USDC',
      icon: '$',
      rate: 1.0,
      network: 'Ethereum/Polygon',
      processingTime: '1-3 min',
      fee: 0.00005
    },
    {
      id: 'matic',
      name: 'Polygon',
      symbol: 'MATIC',
      icon: '⬡',
      rate: 1.8,
      network: 'Polygon',
      processingTime: '30 sec - 2 min',
      fee: 0.00001
    }
  ];

  const selectedOption = cryptoOptions.find(opt => opt.id === selectedCrypto);
  const cryptoAmount = selectedOption ? (amount * selectedOption.rate).toFixed(6) : '0';

  const handlePayment = () => {
    setPaymentStep('confirm');
    // Simulate wallet address generation
    setWalletAddress('bc1q' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
  };

  const confirmPayment = () => {
    setPaymentStep('processing');
    // Simulate payment processing
    setTimeout(() => {
      setPaymentStep('complete');
    }, 3000);
  };

  const resetPayment = () => {
    setPaymentStep('select');
    setSelectedCrypto('btc');
    setWalletAddress('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Payment
        </Button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Bitcoin className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold">Cryptocurrency Payment</h1>
                <p className="text-orange-100">Fast, secure crypto payments worldwide</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Payment Summary */}
            <div className="mb-8 bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Summary</h2>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600">Equipment Rental</p>
                  <p className="text-sm text-gray-500">CAT 320 Excavator - 5 days</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {currency} ${amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">≈ ${cryptoAmount} {selectedOption?.symbol}</p>
                </div>
              </div>
            </div>

            {paymentStep === 'select' && (
              <>
                {/* Crypto Selection */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Cryptocurrency</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {cryptoOptions.map((crypto) => (
                      <div
                        key={crypto.id}
                        onClick={() => setSelectedCrypto(crypto.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedCrypto === crypto.id
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                            {crypto.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{crypto.name}</h3>
                            <p className="text-sm text-gray-600">{crypto.symbol}</p>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>Network: {crypto.network}</p>
                          <p>Processing: {crypto.processingTime}</p>
                          <p>Fee: {crypto.fee} {crypto.symbol}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Button */}
                <div className="text-center">
                  <Button
                    onClick={handlePayment}
                    className="bg-orange-600 hover:bg-orange-700 px-8 py-3 text-lg"
                  >
                    <Bitcoin className="w-5 h-5 mr-2" />
                    Pay with {selectedOption?.name}
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    You'll receive payment instructions in the next step
                  </p>
                </div>
              </>
            )}

            {paymentStep === 'confirm' && selectedOption && (
              <>
                {/* Payment Confirmation */}
                <div className="mb-8">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-blue-900 mb-2">Payment Instructions</h3>
                        <p className="text-blue-800 text-sm mb-3">
                          Send exactly <strong>{cryptoAmount} {selectedOption.symbol}</strong> to the address below.
                          Do not send more or less, as this may result in lost funds.
                        </p>
                        <div className="bg-white p-3 rounded border font-mono text-sm break-all">
                          {walletAddress}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Payment Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount ({currency}):</span>
                        <span className="font-semibold">${amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Crypto Amount:</span>
                        <span className="font-semibold">{cryptoAmount} {selectedOption.symbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Network Fee:</span>
                        <span className="font-semibold">{selectedOption.fee} {selectedOption.symbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Processing Time:</span>
                        <span className="font-semibold">{selectedOption.processingTime}</span>
                      </div>
                      <hr className="my-3" />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total to Send:</span>
                        <span>{(parseFloat(cryptoAmount) + selectedOption.fee).toFixed(6)} {selectedOption.symbol}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button onClick={() => setPaymentStep('select')} variant="outline">
                    Back
                  </Button>
                  <Button onClick={confirmPayment} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    I've Sent the Payment
                  </Button>
                </div>
              </>
            )}

            {paymentStep === 'processing' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment</h3>
                <p className="text-gray-600 mb-4">
                  We're confirming your {selectedOption?.name} transaction on the blockchain...
                </p>
                <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-gray-600">
                    Transaction ID: <span className="font-mono">0x{Date.now().toString(16)}...</span>
                  </p>
                </div>
              </div>
            )}

            {paymentStep === 'complete' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h3>
                <p className="text-gray-600 mb-6">
                  Your crypto payment has been confirmed. Your equipment rental is now active.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto mb-6">
                  <p className="text-sm text-green-800">
                    ✅ Transaction confirmed on {selectedOption?.network}<br/>
                    ✅ Equipment access granted<br/>
                    ✅ Confirmation email sent
                  </p>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button onClick={resetPayment} variant="outline">
                    Make Another Payment
                  </Button>
                  <Button onClick={onBack} className="bg-green-600 hover:bg-green-700">
                    View Equipment
                  </Button>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-2">Security & Support</h3>
                  <ul className="text-yellow-800 text-sm space-y-1">
                    <li>• All transactions are secured with blockchain technology</li>
                    <li>• No payment information is stored on our servers</li>
                    <li>• 24/7 support available for payment issues</li>
                    <li>• Instant refunds for confirmed transactions</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Alternative Payment Options */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 mb-4">Prefer traditional payment methods?</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button variant="outline" size="sm">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Credit Card
                </Button>
                <Button variant="outline" size="sm">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Bank Transfer
                </Button>
                <Button variant="outline" size="sm">
                  PayPal
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}