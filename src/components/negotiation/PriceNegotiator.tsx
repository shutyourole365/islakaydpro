import { useState, useEffect } from 'react';
import {
  MessageSquare,
  DollarSign,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Sparkles,
  ThumbsUp,
} from 'lucide-react';

interface PriceNegotiatorProps {
  equipmentId: string;
  equipmentTitle: string;
  originalDailyRate: number;
  ownerId: string;
  ownerName: string;
  rentalDays: number;
  onAccepted: (finalPrice: number) => void;
  onRejected: () => void;
  onClose: () => void;
}

interface NegotiationMessage {
  id: string;
  sender: 'renter' | 'owner' | 'system';
  message: string;
  offer?: number;
  timestamp: Date;
}

interface NegotiationSuggestion {
  discount: number;
  reason: string;
  likelihood: 'high' | 'medium' | 'low';
}

export default function PriceNegotiator({
  equipmentTitle,
  originalDailyRate,
  ownerName,
  rentalDays,
  onAccepted,
  onClose,
}: PriceNegotiatorProps) {
  const [messages, setMessages] = useState<NegotiationMessage[]>([]);
  const [currentOffer, setCurrentOffer] = useState(originalDailyRate * rentalDays);
  const [customOffer, setCustomOffer] = useState('');
  const [status, setStatus] = useState<'active' | 'accepted' | 'rejected' | 'expired'>('active');
  const [isOwnerTyping, setIsOwnerTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<NegotiationSuggestion[]>([]);
  const [roundCount, setRoundCount] = useState(0);

  const originalTotal = originalDailyRate * rentalDays;
  const discountPercent = Math.round((1 - currentOffer / originalTotal) * 100);

  useEffect(() => {
    // Initial system message
    setMessages([
      {
        id: '1',
        sender: 'system',
        message: `Negotiation started for ${equipmentTitle}. Original price: $${originalTotal.toLocaleString()} for ${rentalDays} days.`,
        timestamp: new Date(),
      },
    ]);

    // Generate AI suggestions
    generateSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateSuggestions = () => {
    const suggestions: NegotiationSuggestion[] = [
      {
        discount: 10,
        reason: 'First-time renter discount',
        likelihood: 'high',
      },
      {
        discount: 15,
        reason: `${rentalDays}+ day bulk booking`,
        likelihood: rentalDays >= 7 ? 'high' : 'medium',
      },
      {
        discount: 20,
        reason: 'Off-peak season offer',
        likelihood: 'medium',
      },
      {
        discount: 25,
        reason: 'Repeat customer loyalty',
        likelihood: 'low',
      },
    ];
    setSuggestions(suggestions);
  };

  const sendOffer = (offerAmount: number) => {
    if (offerAmount <= 0 || offerAmount >= originalTotal) return;

    const discountRequested = Math.round((1 - offerAmount / originalTotal) * 100);
    
    const newMessage: NegotiationMessage = {
      id: Date.now().toString(),
      sender: 'renter',
      message: `I'd like to offer $${offerAmount.toLocaleString()} (${discountRequested}% off) for the ${rentalDays}-day rental.`,
      offer: offerAmount,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setRoundCount(prev => prev + 1);
    simulateOwnerResponse(offerAmount, discountRequested);
    setCustomOffer('');
  };

  const simulateOwnerResponse = async (offerAmount: number, discountPercent: number) => {
    setIsOwnerTyping(true);
    
    // Simulate response time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
    setIsOwnerTyping(false);

    let response: NegotiationMessage;
    const counterOffer = calculateCounterOffer(offerAmount, discountPercent);

    if (discountPercent <= 5) {
      // Accept small discounts immediately
      response = {
        id: Date.now().toString(),
        sender: 'owner',
        message: `Deal! I can accept $${offerAmount.toLocaleString()} for the rental. Let's finalize this!`,
        offer: offerAmount,
        timestamp: new Date(),
      };
      setCurrentOffer(offerAmount);
      setStatus('accepted');
    } else if (discountPercent <= 15 && roundCount >= 2) {
      // Accept moderate discounts after negotiation
      response = {
        id: Date.now().toString(),
        sender: 'owner',
        message: `You drive a hard bargain! Alright, $${offerAmount.toLocaleString()} it is. We have a deal!`,
        offer: offerAmount,
        timestamp: new Date(),
      };
      setCurrentOffer(offerAmount);
      setStatus('accepted');
    } else if (discountPercent > 30) {
      // Reject very high discount requests
      response = {
        id: Date.now().toString(),
        sender: 'owner',
        message: `I appreciate the offer, but ${discountPercent}% off is too steep. My best counter is $${counterOffer.toLocaleString()} - that's the lowest I can go.`,
        offer: counterOffer,
        timestamp: new Date(),
      };
      setCurrentOffer(counterOffer);
    } else {
      // Counter offer
      response = {
        id: Date.now().toString(),
        sender: 'owner',
        message: `Thanks for the offer! I can meet you halfway at $${counterOffer.toLocaleString()}. That's ${Math.round((1 - counterOffer / originalTotal) * 100)}% off.`,
        offer: counterOffer,
        timestamp: new Date(),
      };
      setCurrentOffer(counterOffer);
    }

    setMessages(prev => [...prev, response]);
  };

  const calculateCounterOffer = (_offer: number, requestedDiscount: number) => {
    // Owner counters with roughly half the requested discount
    const counterDiscount = Math.min(requestedDiscount * 0.6, 20);
    return Math.round(originalTotal * (1 - counterDiscount / 100));
  };

  const acceptCurrentOffer = () => {
    setStatus('accepted');
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'system',
        message: `🎉 Deal confirmed! Final price: $${currentOffer.toLocaleString()} (${discountPercent}% savings)`,
        timestamp: new Date(),
      },
    ]);
    setTimeout(() => onAccepted(currentOffer), 1500);
  };

  const getLikelihoodColor = (likelihood: NegotiationSuggestion['likelihood']) => {
    switch (likelihood) {
      case 'high': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      case 'low': return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-lg w-full">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Price Negotiation</h3>
              <p className="text-sm text-white/80">with {ownerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Price Summary */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-xs text-white/70">Original Price</p>
            <p className="text-lg font-bold line-through opacity-60">${originalTotal.toLocaleString()}</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3">
            <p className="text-xs text-white/70">Current Offer</p>
            <p className="text-lg font-bold">${currentOffer.toLocaleString()}</p>
            {discountPercent > 0 && (
              <span className="text-xs bg-green-400/30 px-2 py-0.5 rounded-full">
                -{discountPercent}% off
              </span>
            )}
          </div>
        </div>
      </div>

      {/* AI Suggestions */}
      {status === 'active' && suggestions.length > 0 && (
        <div className="p-4 bg-violet-50 border-b border-violet-100">
          <div className="flex items-center gap-2 mb-2 text-sm text-violet-700">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">AI Negotiation Tips</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => sendOffer(Math.round(originalTotal * (1 - suggestion.discount / 100)))}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm transition-colors ${getLikelihoodColor(suggestion.likelihood)} hover:opacity-80`}
              >
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  <span>{suggestion.discount}% off</span>
                </div>
                <p className="text-xs opacity-75 mt-0.5">{suggestion.reason}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="p-4 max-h-64 overflow-y-auto space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'renter' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                msg.sender === 'renter'
                  ? 'bg-violet-600 text-white rounded-tr-sm'
                  : msg.sender === 'owner'
                  ? 'bg-gray-100 text-gray-800 rounded-tl-sm'
                  : 'bg-amber-50 text-amber-800 text-center w-full text-sm'
              }`}
            >
              <p className="text-sm">{msg.message}</p>
              {msg.offer && msg.sender !== 'system' && (
                <p className="text-xs mt-1 opacity-75">
                  Offer: ${msg.offer.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        ))}
        
        {isOwnerTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-100">
        {status === 'active' && (
          <>
            <div className="flex gap-2 mb-3">
              <div className="flex-1 relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={customOffer}
                  onChange={(e) => setCustomOffer(e.target.value)}
                  placeholder="Your offer..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-violet-500"
                />
              </div>
              <button
                onClick={() => sendOffer(Number(customOffer))}
                disabled={!customOffer || Number(customOffer) <= 0}
                className="px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>

            {currentOffer < originalTotal && (
              <button
                onClick={acceptCurrentOffer}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <ThumbsUp className="w-5 h-5" />
                Accept ${currentOffer.toLocaleString()} ({discountPercent}% off)
              </button>
            )}
          </>
        )}

        {status === 'accepted' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <p className="font-semibold text-gray-900 text-lg">Deal Confirmed!</p>
            <p className="text-gray-500">You saved ${(originalTotal - currentOffer).toLocaleString()}</p>
          </div>
        )}

        {status === 'rejected' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <p className="font-semibold text-gray-900 text-lg">Negotiation Ended</p>
            <p className="text-gray-500">Try again with a different offer</p>
          </div>
        )}
      </div>
    </div>
  );
}
