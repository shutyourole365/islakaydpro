import { useState } from 'react';
import { Shield, Check, AlertCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface InsurancePlan {
  id: string;
  name: string;
  price: number;
  priceType: 'percentage' | 'flat';
  coverage: string;
  deductible: number;
  features: string[];
  recommended?: boolean;
}

interface InsuranceOptionsProps {
  dailyRate: number;
  rentalDays: number;
  selectedPlan: string | null;
  onSelectPlan: (planId: string | null) => void;
  className?: string;
}

const insurancePlans: InsurancePlan[] = [
  {
    id: 'basic',
    name: 'Basic Protection',
    price: 5,
    priceType: 'percentage',
    coverage: '$5,000',
    deductible: 500,
    features: [
      'Accidental damage coverage',
      'Theft protection',
      '24/7 support hotline',
    ],
  },
  {
    id: 'standard',
    name: 'Standard Protection',
    price: 10,
    priceType: 'percentage',
    coverage: '$15,000',
    deductible: 250,
    features: [
      'All Basic Protection features',
      'Equipment breakdown coverage',
      'Liability protection up to $50,000',
      'Roadside assistance',
    ],
    recommended: true,
  },
  {
    id: 'premium',
    name: 'Premium Protection',
    price: 15,
    priceType: 'percentage',
    coverage: '$50,000',
    deductible: 0,
    features: [
      'All Standard Protection features',
      'Zero deductible',
      'Full replacement guarantee',
      'Lost income coverage',
      'Extended liability up to $100,000',
      'Priority claims processing',
    ],
  },
];

export default function InsuranceOptions({
  dailyRate,
  rentalDays,
  selectedPlan,
  onSelectPlan,
  className = '',
}: InsuranceOptionsProps) {
  const [expandedPlan, setExpandedPlan] = useState<string | null>('standard');
  const [showInfo, setShowInfo] = useState(false);

  const rentalTotal = dailyRate * rentalDays;

  const calculatePlanPrice = (plan: InsurancePlan) => {
    if (plan.priceType === 'percentage') {
      return Math.round(rentalTotal * (plan.price / 100));
    }
    return plan.price * rentalDays;
  };

  const toggleExpand = (planId: string) => {
    setExpandedPlan(expandedPlan === planId ? null : planId);
  };

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-500" />
            <h3 className="font-semibold text-gray-900">Protection Plans</h3>
          </div>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Info className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {showInfo && (
          <div className="mt-3 p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
            <p>
              Protection plans cover accidental damage, theft, and more. Choose a plan
              that fits your needs for peace of mind during your rental.
            </p>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <button
          onClick={() => onSelectPlan(null)}
          className={`
            w-full p-4 rounded-xl border-2 transition-all text-left
            ${!selectedPlan
              ? 'border-gray-300 bg-gray-50'
              : 'border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${!selectedPlan ? 'border-gray-400 bg-gray-400' : 'border-gray-300'}
                `}
              >
                {!selectedPlan && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="font-medium text-gray-700">No Protection</span>
            </div>
            <span className="text-gray-500">$0</span>
          </div>
          <p className="ml-8 mt-1 text-sm text-gray-500">
            You will be responsible for any damage or loss
          </p>
        </button>

        {insurancePlans.map((plan) => {
          const planPrice = calculatePlanPrice(plan);
          const isSelected = selectedPlan === plan.id;
          const isExpanded = expandedPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`
                rounded-xl border-2 transition-all overflow-hidden
                ${isSelected
                  ? 'border-teal-500 bg-teal-50/50'
                  : 'border-gray-200 hover:border-gray-300'
                }
                ${plan.recommended && !isSelected ? 'ring-2 ring-teal-200' : ''}
              `}
            >
              <button
                onClick={() => onSelectPlan(plan.id)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                        w-5 h-5 rounded-full border-2 flex items-center justify-center
                        ${isSelected ? 'border-teal-500 bg-teal-500' : 'border-gray-300'}
                      `}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{plan.name}</span>
                        {plan.recommended && (
                          <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Coverage up to {plan.coverage}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${planPrice.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {plan.price}% of rental
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => toggleExpand(plan.id)}
                className="w-full px-4 py-2 border-t border-gray-100 flex items-center justify-center gap-1 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
              >
                {isExpanded ? 'Hide details' : 'Show details'}
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Deductible</span>
                      <span className="font-medium text-gray-900">
                        {plan.deductible === 0 ? 'None' : `$${plan.deductible}`}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-sm font-medium text-gray-700 mb-2">Includes:</p>
                      <ul className="space-y-1.5">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                            <Check className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-amber-50 border-t border-amber-100">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            Protection plans are optional but recommended. Without protection, you may be
            liable for repair or replacement costs up to the full value of the equipment.
          </p>
        </div>
      </div>
    </div>
  );
}
