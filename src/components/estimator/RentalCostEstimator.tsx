import { useState, useMemo } from 'react';
import { ArrowLeft, Calculator, Calendar, DollarSign, Shield, Truck, Percent, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface RentalCostEstimatorProps {
  onBack: () => void;
}

interface CostBreakdown {
  baseCost: number;
  durationDiscount: number;
  insuranceCost: number;
  deliveryCost: number;
  serviceFee: number;
  depositAmount: number;
  tax: number;
  total: number;
}

const equipmentOptions = [
  { id: 'excavator', name: 'CAT 320 Excavator', dailyRate: 450, weeklyRate: 2800, monthlyRate: 9500, deposit: 2000 },
  { id: 'camera', name: 'Sony A7IV Camera Kit', dailyRate: 125, weeklyRate: 700, monthlyRate: 2200, deposit: 500 },
  { id: 'tools', name: 'DeWalt Power Tool Kit', dailyRate: 75, weeklyRate: 400, monthlyRate: 1200, deposit: 300 },
  { id: 'dj', name: 'Premium DJ Package', dailyRate: 295, weeklyRate: 1500, monthlyRate: 4500, deposit: 1000 },
  { id: 'tractor', name: 'John Deere 1025R', dailyRate: 225, weeklyRate: 1200, monthlyRate: 3800, deposit: 1500 },
  { id: 'tent', name: 'Wedding Tent Package', dailyRate: 495, weeklyRate: 2500, monthlyRate: null, deposit: 800 },
  { id: 'drone', name: 'DJI Mavic 3 Pro Kit', dailyRate: 150, weeklyRate: 800, monthlyRate: 2400, deposit: 600 },
  { id: 'pressure', name: 'Commercial Pressure Washer', dailyRate: 95, weeklyRate: 450, monthlyRate: 1400, deposit: 250 },
];

const insurancePlans = [
  { id: 'none', name: 'No Insurance', rate: 0, description: 'Full liability on renter' },
  { id: 'basic', name: 'Basic Coverage', rate: 0.08, description: 'Covers accidental damage up to $5,000' },
  { id: 'premium', name: 'Premium Coverage', rate: 0.15, description: 'Full coverage including theft, up to $25,000' },
  { id: 'enterprise', name: 'Enterprise Coverage', rate: 0.22, description: 'Unlimited coverage with zero deductible' },
];

export default function RentalCostEstimator({ onBack }: RentalCostEstimatorProps) {
  const [selectedEquipment, setSelectedEquipment] = useState(equipmentOptions[0]);
  const [rentalDays, setRentalDays] = useState(3);
  const [insurancePlan, setInsurancePlan] = useState(insurancePlans[1]);
  const [needsDelivery, setNeedsDelivery] = useState(false);
  const [deliveryDistance, setDeliveryDistance] = useState(10);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [showDetails, setShowDetails] = useState(true);

  const costBreakdown = useMemo<CostBreakdown>(() => {
    let baseCost: number;
    let durationDiscount = 0;

    if (rentalDays >= 30 && selectedEquipment.monthlyRate) {
      const fullMonths = Math.floor(rentalDays / 30);
      const remainingDays = rentalDays % 30;
      baseCost = fullMonths * selectedEquipment.monthlyRate + remainingDays * selectedEquipment.dailyRate;
      durationDiscount = rentalDays * selectedEquipment.dailyRate - baseCost;
    } else if (rentalDays >= 7) {
      const fullWeeks = Math.floor(rentalDays / 7);
      const remainingDays = rentalDays % 7;
      baseCost = fullWeeks * selectedEquipment.weeklyRate + remainingDays * selectedEquipment.dailyRate;
      durationDiscount = rentalDays * selectedEquipment.dailyRate - baseCost;
    } else {
      baseCost = rentalDays * selectedEquipment.dailyRate;
    }

    const insuranceCost = baseCost * insurancePlan.rate;
    const deliveryCost = needsDelivery ? 50 + deliveryDistance * 2.5 : 0;
    const serviceFee = baseCost * 0.12;
    const promoDiscount = promoApplied ? baseCost * 0.1 : 0;
    const subtotal = baseCost + insuranceCost + deliveryCost + serviceFee - promoDiscount;
    const tax = subtotal * 0.0875;
    const total = subtotal + tax;

    return {
      baseCost,
      durationDiscount,
      insuranceCost,
      deliveryCost,
      serviceFee,
      depositAmount: selectedEquipment.deposit,
      tax,
      total,
    };
  }, [selectedEquipment, rentalDays, insurancePlan, needsDelivery, deliveryDistance, promoApplied]);

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === 'save10' || promoCode.toLowerCase() === 'welcome') {
      setPromoApplied(true);
    } else {
      alert('Invalid promo code. Try "SAVE10" or "WELCOME".');
    }
  };

  const effectiveDailyRate = costBreakdown.baseCost / rentalDays;
  const savingsPercent = ((selectedEquipment.dailyRate - effectiveDailyRate) / selectedEquipment.dailyRate) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors" aria-label="Go back">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rental Cost Estimator</h1>
            <p className="text-gray-500 mt-1">Calculate your total rental cost with detailed breakdowns</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-3 space-y-6">
            {/* Equipment Selection */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-teal-600" /> Select Equipment
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {equipmentOptions.map((eq) => (
                  <button
                    key={eq.id}
                    onClick={() => setSelectedEquipment(eq)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      selectedEquipment.id === eq.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium text-sm">{eq.name}</p>
                    <p className="text-teal-600 font-bold text-sm mt-1">${eq.dailyRate}/day</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Rental Duration */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" /> Rental Duration
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Number of Days</label>
                    <span className="text-2xl font-bold text-teal-600">{rentalDays}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="90"
                    value={rentalDays}
                    onChange={(e) => setRentalDays(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1 day</span>
                    <span>1 week</span>
                    <span>1 month</span>
                    <span>3 months</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {[1, 3, 7, 14, 30].map((days) => (
                    <button
                      key={days}
                      onClick={() => setRentalDays(days)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        rentalDays === days ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {days}d
                    </button>
                  ))}
                </div>
                {savingsPercent > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                    <Percent className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-green-700">
                      You save <strong>{savingsPercent.toFixed(0)}%</strong> with {rentalDays >= 30 ? 'monthly' : 'weekly'} pricing!
                      Effective rate: <strong>${effectiveDailyRate.toFixed(0)}/day</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Insurance & Extras */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-600" /> Insurance & Extras
              </h3>
              <div className="space-y-3 mb-6">
                {insurancePlans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setInsurancePlan(plan)}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                      insurancePlan.id === plan.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-sm">{plan.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{plan.description}</p>
                    </div>
                    <span className="text-sm font-bold text-teal-600 whitespace-nowrap ml-4">
                      {plan.rate === 0 ? 'Free' : `+${(plan.rate * 100).toFixed(0)}%`}
                    </span>
                  </button>
                ))}
              </div>

              {/* Delivery */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-teal-600" />
                    <span className="font-medium text-sm">Delivery Service</span>
                  </div>
                  <button
                    onClick={() => setNeedsDelivery(!needsDelivery)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      needsDelivery ? 'bg-teal-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        needsDelivery ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
                {needsDelivery && (
                  <div className="ml-7">
                    <label className="text-sm text-gray-600">Distance: {deliveryDistance} miles</label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={deliveryDistance}
                      onChange={(e) => setDeliveryDistance(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500 mt-1"
                    />
                    <p className="text-xs text-gray-400 mt-1">$50 base + $2.50/mile</p>
                  </div>
                )}
              </div>
            </div>

            {/* Promo Code */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Percent className="w-5 h-5 text-teal-600" /> Promo Code
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value);
                    setPromoApplied(false);
                  }}
                  placeholder="Enter promo code..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <button
                  onClick={handleApplyPromo}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors"
                >
                  Apply
                </button>
              </div>
              {promoApplied && (
                <p className="text-sm text-green-600 mt-2">10% discount applied!</p>
              )}
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <Info className="w-3 h-3" /> Try "SAVE10" or "WELCOME" for demo
              </p>
            </div>
          </div>

          {/* Cost Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-teal-600" /> Cost Summary
              </h3>

              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{selectedEquipment.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{rentalDays} day{rentalDays > 1 ? 's' : ''} rental</span>
                  <span className="font-medium">${costBreakdown.baseCost.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 mb-3"
              >
                {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {showDetails ? 'Hide' : 'Show'} details
              </button>

              {showDetails && (
                <div className="space-y-2 border-t border-gray-100 pt-3">
                  {costBreakdown.durationDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Duration discount</span>
                      <span className="text-green-600 font-medium">-${costBreakdown.durationDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Insurance ({insurancePlan.name})</span>
                    <span className="font-medium">${costBreakdown.insuranceCost.toFixed(2)}</span>
                  </div>
                  {needsDelivery && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Delivery ({deliveryDistance} mi)</span>
                      <span className="font-medium">${costBreakdown.deliveryCost.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Service fee (12%)</span>
                    <span className="font-medium">${costBreakdown.serviceFee.toFixed(2)}</span>
                  </div>
                  {promoApplied && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Promo discount (10%)</span>
                      <span className="text-green-600 font-medium">-${(costBreakdown.baseCost * 0.1).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax (8.75%)</span>
                    <span className="font-medium">${costBreakdown.tax.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="border-t-2 border-gray-200 mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-bold text-teal-600">${costBreakdown.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>Refundable deposit</span>
                  <span>${costBreakdown.depositAmount.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Effective daily rate: ${effectiveDailyRate.toFixed(2)}/day
                </p>
              </div>

              <button className="w-full mt-6 py-3 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600 transition-colors">
                Book Now - ${costBreakdown.total.toFixed(2)}
              </button>
              <p className="text-xs text-center text-gray-400 mt-2">Free cancellation within 24 hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
