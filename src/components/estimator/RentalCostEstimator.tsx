import { useMemo, useState } from 'react';
import { ArrowLeft, Calculator, ChevronDown, ChevronUp, Truck, Tag } from 'lucide-react';

interface EquipmentOption {
  id: string;
  name: string;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  deposit: number;
}

interface InsurancePlan {
  id: string;
  name: string;
  description: string;
  dailyCost: number;
}

interface Props {
  onBack: () => void;
}

const EQUIPMENT: EquipmentOption[] = [
  { id: 'eq1', name: 'CAT 320 Excavator', dailyRate: 450, weeklyRate: 2700, monthlyRate: 9000, deposit: 1000 },
  { id: 'eq2', name: 'Sony A7IV Camera Kit', dailyRate: 120, weeklyRate: 720, monthlyRate: 2400, deposit: 500 },
  { id: 'eq3', name: 'DeWalt Power Tool Kit', dailyRate: 60, weeklyRate: 360, monthlyRate: 1200, deposit: 200 },
  { id: 'eq4', name: 'Premium DJ Package', dailyRate: 320, weeklyRate: 1900, monthlyRate: 6200, deposit: 800 },
];

const INSURANCE: InsurancePlan[] = [
  { id: 'none', name: 'No Insurance', description: 'Self-insured by renter.', dailyCost: 0 },
  { id: 'basic', name: 'Basic Coverage', description: 'Full liability for damages up to $5,000.', dailyCost: 15 },
  { id: 'premium', name: 'Premium Coverage', description: 'Full coverage including theft, vandalism, and damage.', dailyCost: 35 },
  { id: 'enterprise', name: 'Enterprise Coverage', description: 'Unlimited coverage with 24/7 replacement support.', dailyCost: 75 },
];

const PROMO_CODES: Record<string, number> = {
  SAVE10: 10,
  WELCOME: 10,
};

export default function RentalCostEstimator({ onBack }: Props) {
  const [equipmentId, setEquipmentId] = useState<string>(EQUIPMENT[0].id);
  const [days, setDays] = useState(3);
  const [insuranceId, setInsuranceId] = useState<string>('basic');
  const [delivery, setDelivery] = useState(false);
  const [distance, setDistance] = useState(10);
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(true);

  const equipment = useMemo(
    () => EQUIPMENT.find((e) => e.id === equipmentId) ?? EQUIPMENT[0],
    [equipmentId]
  );
  const insurance = useMemo(
    () => INSURANCE.find((i) => i.id === insuranceId) ?? INSURANCE[0],
    [insuranceId]
  );

  const pricing = useMemo(() => {
    let base = equipment.dailyRate * days;
    let discountLabel = '';
    if (days >= 30) {
      base = (equipment.monthlyRate / 30) * days;
      discountLabel = 'monthly';
    } else if (days >= 7) {
      base = (equipment.weeklyRate / 7) * days;
      discountLabel = 'weekly';
    }
    const listPrice = equipment.dailyRate * days;
    const savings = Math.max(0, listPrice - base);

    const insuranceCost = insurance.dailyCost * days;
    const deliveryCost = delivery ? 50 + distance * 2.5 : 0;
    const subtotal = base + insuranceCost + deliveryCost;
    const serviceFee = subtotal * 0.1;
    const tax = (subtotal + serviceFee) * 0.08;

    let promoDiscount = 0;
    if (appliedPromo) {
      promoDiscount = subtotal * (appliedPromo / 100);
    }

    const total = subtotal + serviceFee + tax - promoDiscount;
    const effectiveDaily = days > 0 ? total / days : 0;

    return { base, listPrice, savings, insuranceCost, deliveryCost, subtotal, serviceFee, tax, promoDiscount, total, effectiveDaily, discountLabel };
  }, [equipment, days, insurance, delivery, distance, appliedPromo]);

  function applyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setAppliedPromo(PROMO_CODES[code]);
    } else {
      window.alert('Invalid promo code. Try SAVE10 or WELCOME.');
    }
  }

  function handlePromoChange(value: string) {
    setPromoInput(value);
    if (appliedPromo !== null) {
      setAppliedPromo(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            aria-label="Go back"
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rental Cost Estimator</h1>
            <p className="text-sm text-gray-500">
              Calculate your total rental cost including insurance, delivery, and taxes.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Equipment</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {EQUIPMENT.map((eq) => {
                  const isSelected = eq.id === equipment.id;
                  return (
                    <button
                      key={eq.id}
                      type="button"
                      onClick={() => setEquipmentId(eq.id)}
                      className={`text-left rounded-xl border p-4 transition-colors ${
                        isSelected ? 'border-teal-500 ring-2 ring-teal-100' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">{eq.name}</p>
                      <p className="text-sm text-gray-500">${eq.dailyRate}/day</p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Rental Duration</h2>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Number of days</span>
                <span className="text-2xl font-bold text-gray-900">{days}</span>
              </div>
              <input
                type="range"
                min={1}
                max={60}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {[1, 3, 7, 14, 30].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDays(d)}
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      days === d ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
              {pricing.savings > 0 && (
                <p className="mt-3 text-sm text-green-700">
                  You save <strong>${pricing.savings.toFixed(2)}</strong> with {pricing.discountLabel} rate
                </p>
              )}
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Insurance & Extras</h2>
              <div className="space-y-2 mb-4">
                {INSURANCE.map((plan) => {
                  const isSelected = plan.id === insurance.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setInsuranceId(plan.id)}
                      className={`w-full text-left rounded-xl border p-4 transition-colors ${
                        isSelected ? 'border-teal-500 ring-2 ring-teal-100' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900">{plan.name}</p>
                          <p className="text-sm text-gray-600">{plan.description}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                          {plan.dailyCost > 0 ? `$${plan.dailyCost}/day` : 'Free'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-teal-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Delivery Service</p>
                    <p className="text-xs text-gray-500">$50 base + $2.50/mile</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDelivery(!delivery)}
                  aria-pressed={delivery}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    delivery ? 'bg-teal-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      delivery ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>
              {delivery && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Distance: {distance} miles</p>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={distance}
                    onChange={(e) => setDistance(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Promo Code</h2>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => handlePromoChange(e.target.value)}
                    placeholder="Enter promo code"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={applyPromo}
                  className="px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700"
                >
                  Apply
                </button>
              </div>
              {appliedPromo !== null && (
                <p className="mt-3 text-sm text-green-700">
                  {appliedPromo}% discount applied
                </p>
              )}
            </section>
          </div>

          <aside className="bg-white rounded-2xl border border-gray-100 p-6 h-fit sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-teal-600" />
                <h2 className="text-lg font-semibold text-gray-900">Cost Summary</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
              >
                {showDetails ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    Hide details
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    Show details
                  </>
                )}
              </button>
            </div>

            {showDetails && (
              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div className="flex justify-between">
                  <span>Base rental ({days}d)</span>
                  <span>${pricing.base.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Insurance</span>
                  <span>${pricing.insuranceCost.toFixed(2)}</span>
                </div>
                {delivery && (
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>${pricing.deliveryCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>${pricing.serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${pricing.tax.toFixed(2)}</span>
                </div>
                {pricing.promoDiscount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Promo discount</span>
                    <span>-${pricing.promoDiscount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-gray-100 pt-3 flex justify-between text-lg font-bold text-gray-900">
              <span>Total</span>
              <span>${pricing.total.toFixed(2)}</span>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              Refundable deposit: ${equipment.deposit.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">
              Effective daily rate: ${pricing.effectiveDaily.toFixed(2)}
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
