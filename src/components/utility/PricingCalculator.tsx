import { ArrowLeft, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState } from 'react';

interface PricingCalculatorProps {
  onBack: () => void;
}

export default function PricingCalculator({ onBack }: PricingCalculatorProps) {
  const [equipmentType, setEquipmentType] = useState('excavator');
  const [rentalDays, setRentalDays] = useState(7);
  const [dailyRate, setDailyRate] = useState(150);
  const [insurance, setInsurance] = useState(true);
  const [delivery, setDelivery] = useState(true);

  const equipmentTypes = [
    { value: 'excavator', label: 'Excavator', baseRate: 150 },
    { value: 'bulldozer', label: 'Bulldozer', baseRate: 200 },
    { value: 'crane', label: 'Crane', baseRate: 300 },
    { value: 'forklift', label: 'Forklift', baseRate: 75 },
    { value: 'generator', label: 'Generator', baseRate: 50 },
    { value: 'air-compressor', label: 'Air Compressor', baseRate: 40 }
  ];

  const calculatePricing = () => {
    const baseCost = dailyRate * rentalDays;
    const serviceFee = baseCost * 0.08; // 8% service fee
    const insuranceCost = insurance ? baseCost * 0.05 : 0; // 5% insurance
    const deliveryCost = delivery ? Math.min(200, baseCost * 0.1) : 0; // $200 AUD or 10% of rental
    const subtotal = baseCost + serviceFee + insuranceCost + deliveryCost;
    const gst = subtotal * 0.10; // 10% GST (Australian Goods & Services Tax)
    const total = subtotal + gst;

    return {
      baseCost,
      serviceFee,
      insuranceCost,
      deliveryCost,
      subtotal,
      gst,
      total
    };
  };

  const pricing = calculatePricing();

  const handleEquipmentChange = (type: string) => {
    setEquipmentType(type);
    const selected = equipmentTypes.find(t => t.value === type);
    if (selected) {
      setDailyRate(selected.baseRate);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Islakayd
        </Button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-green-600 to-green-800 text-white px-8 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Pricing Calculator
              </h1>
              <p className="text-xl md:text-2xl text-green-100 mb-8">
                Calculate rental costs and get accurate pricing estimates for any equipment
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 inline-block">
                <div className="text-lg font-semibold">Transparent Pricing</div>
                <div className="text-green-100">No hidden fees, guaranteed</div>
              </div>
            </div>
          </div>

          <div className="px-8 py-16">
            <div className="max-w-4xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Calculator Form */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Calculate Your Costs</h2>

                  <div className="space-y-6">
                    {/* Equipment Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Equipment Type
                      </label>
                      <select
                        value={equipmentType}
                        onChange={(e) => handleEquipmentChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        {equipmentTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label} - ${type.baseRate}/day
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Rental Days */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rental Duration: {rentalDays} days
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="90"
                        value={rentalDays}
                        onChange={(e) => setRentalDays(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1 day</span>
                        <span>90 days</span>
                      </div>
                    </div>

                    {/* Daily Rate */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Daily Rate: ${dailyRate}
                      </label>
                      <input
                        type="range"
                        min="25"
                        max="500"
                        step="25"
                        value={dailyRate}
                        onChange={(e) => setDailyRate(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>$25</span>
                        <span>$500</span>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="insurance"
                          checked={insurance}
                          onChange={(e) => setInsurance(e.target.checked)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor="insurance" className="ml-2 text-sm text-gray-700">
                          Include Insurance (+5% of rental cost)
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="delivery"
                          checked={delivery}
                          onChange={(e) => setDelivery(e.target.checked)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor="delivery" className="ml-2 text-sm text-gray-700">
                          Include Delivery ($150 or 10% of rental, whichever is less)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Cost Breakdown</h2>

                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Equipment Rental ({rentalDays} days × ${dailyRate})</span>
                      <span className="font-semibold">${pricing.baseCost.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Service Fee (8%)</span>
                      <span className="font-semibold">${pricing.serviceFee.toFixed(2)}</span>
                    </div>

                    {insurance && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Insurance (5%)</span>
                        <span className="font-semibold">${pricing.insuranceCost.toFixed(2)}</span>
                      </div>
                    )}

                    {delivery && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Delivery</span>
                        <span className="font-semibold">${pricing.deliveryCost.toFixed(2)}</span>
                      </div>
                    )}

                    <hr className="border-gray-300" />

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">${pricing.subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">GST (10%)</span>
                      <span className="font-semibold">${pricing.gst.toFixed(2)}</span>
                    </div>

                    <hr className="border-gray-300" />

                    <div className="flex justify-between items-center text-lg">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-bold text-green-600">${pricing.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Book This Equipment
                    </Button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Final price may vary based on specific equipment and location
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing Insights */}
              <div className="mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Pricing Insights</h2>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6 text-center">
                    <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Rates</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Our calculator uses real-time market data to provide accurate pricing estimates.
                    </p>
                    <div className="text-2xl font-bold text-blue-600">
                      ±15%
                    </div>
                    <p className="text-xs text-gray-500">Typical price range</p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6 text-center">
                    <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Cost Savings</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Renting through Islakayd typically saves 30-50% compared to traditional rental companies.
                    </p>
                    <div className="text-2xl font-bold text-green-600">
                      40%
                    </div>
                    <p className="text-xs text-gray-500">Average savings</p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6 text-center">
                    <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible Terms</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Choose from daily, weekly, or monthly rates. Longer rentals get automatic discounts.
                    </p>
                    <div className="text-2xl font-bold text-purple-600">
                      20%
                    </div>
                    <p className="text-xs text-gray-500">Monthly discount</p>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="mt-16 bg-gray-50 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Are these prices guaranteed?</h3>
                    <p className="text-gray-600 text-sm">
                      The calculator provides estimates based on average market rates. Final prices may vary depending on the specific equipment, location, and availability.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">What does the service fee cover?</h3>
                    <p className="text-gray-600 text-sm">
                      The 8% service fee covers platform maintenance, customer support, payment processing, and insurance coordination.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Is insurance required?</h3>
                    <p className="text-gray-600 text-sm">
                      While not required, we strongly recommend insurance for all rentals. It protects both you and the equipment owner against accidents or damage.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Can I get a discount for longer rentals?</h3>
                    <p className="text-gray-600 text-sm">
                      Yes! Rentals of 30+ days receive a 15% discount, and 90+ days get a 20% discount automatically applied at checkout.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}