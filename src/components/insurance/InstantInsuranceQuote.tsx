import { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle2,
  ChevronRight,
  XCircle,
  Sparkles,
  Zap,
  Award,
  Clock,
  Wrench,
  Heart,
  Star,
} from 'lucide-react';

interface InstantInsuranceQuoteProps {
  equipmentId: string;
  equipmentTitle: string;
  equipmentValue: number;
  rentalDays: number;
  dailyRate: number;
  onSelect?: (plan: InsurancePlan) => void;
  onClose: () => void;
}

interface InsurancePlan {
  id: string;
  name: string;
  tier: 'basic' | 'standard' | 'premium' | 'elite';
  dailyRate: number;
  totalCost: number;
  deductible: number;
  coverageAmount: number;
  coveragePercentage: number;
  features: string[];
  exclusions: string[];
  claimProcess: string;
  recommended?: boolean;
  popular?: boolean;
}

interface QuoteFactors {
  equipmentCategory: string;
  riskScore: number;
  marketRate: number;
  seasonalAdjustment: number;
}

export default function InstantInsuranceQuote({
  equipmentId: _equipmentId,
  equipmentTitle: _equipmentTitle,
  equipmentValue,
  rentalDays,
  dailyRate,
  onSelect,
  onClose,
}: InstantInsuranceQuoteProps) {
  // equipmentId and equipmentTitle reserved for future API integration
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<InsurancePlan | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [factors, setFactors] = useState<QuoteFactors | null>(null);

  useEffect(() => {
    generateQuotes();
  }, []);

  const generateQuotes = async () => {
    setLoading(true);

    // Simulate AI quote generation
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Calculate risk factors
    const riskFactors: QuoteFactors = {
      equipmentCategory: 'Heavy Equipment',
      riskScore: 0.7,
      marketRate: 0.02,
      seasonalAdjustment: 1.0,
    };
    setFactors(riskFactors);

    // Generate plans based on equipment value
    const baseDailyRate = equipmentValue * 0.001;

    const generatedPlans: InsurancePlan[] = [
      {
        id: 'basic',
        name: 'Basic Protection',
        tier: 'basic',
        dailyRate: Math.round(baseDailyRate * 0.5 * 100) / 100,
        totalCost: Math.round(baseDailyRate * 0.5 * rentalDays * 100) / 100,
        deductible: equipmentValue * 0.2,
        coverageAmount: equipmentValue * 0.5,
        coveragePercentage: 50,
        features: [
          'Accidental damage coverage',
          'Fire and theft protection',
          '24/7 claims hotline',
        ],
        exclusions: [
          'Intentional damage',
          'Normal wear and tear',
          'Operator negligence',
        ],
        claimProcess: 'File claim within 24 hours. 5-7 day processing.',
      },
      {
        id: 'standard',
        name: 'Standard Coverage',
        tier: 'standard',
        dailyRate: Math.round(baseDailyRate * 100) / 100,
        totalCost: Math.round(baseDailyRate * rentalDays * 100) / 100,
        deductible: equipmentValue * 0.1,
        coverageAmount: equipmentValue * 0.8,
        coveragePercentage: 80,
        features: [
          'All Basic Protection features',
          'Mechanical breakdown coverage',
          'Lost rental income reimbursement',
          'Towing and recovery',
        ],
        exclusions: [
          'Intentional damage',
          'Cosmetic-only damage',
        ],
        claimProcess: 'File claim within 48 hours. 3-5 day processing.',
        popular: true,
      },
      {
        id: 'premium',
        name: 'Premium Protection',
        tier: 'premium',
        dailyRate: Math.round(baseDailyRate * 1.5 * 100) / 100,
        totalCost: Math.round(baseDailyRate * 1.5 * rentalDays * 100) / 100,
        deductible: equipmentValue * 0.05,
        coverageAmount: equipmentValue,
        coveragePercentage: 100,
        features: [
          'All Standard Coverage features',
          'Zero deductible option',
          'Replacement equipment guarantee',
          'Personal liability coverage ($100K)',
          'Priority claims processing',
        ],
        exclusions: [
          'Intentional damage',
        ],
        claimProcess: 'File claim within 72 hours. 1-3 day processing.',
        recommended: true,
      },
      {
        id: 'elite',
        name: 'Elite Complete',
        tier: 'elite',
        dailyRate: Math.round(baseDailyRate * 2.5 * 100) / 100,
        totalCost: Math.round(baseDailyRate * 2.5 * rentalDays * 100) / 100,
        deductible: 0,
        coverageAmount: equipmentValue * 1.2,
        coveragePercentage: 120,
        features: [
          'All Premium Protection features',
          'Zero deductible guaranteed',
          'Damage forgiveness (1 claim)',
          'Personal liability coverage ($500K)',
          'Emergency equipment replacement',
          'Concierge claims service',
          'Rental extension coverage',
        ],
        exclusions: [],
        claimProcess: 'Instant approval for claims under $5K. Same-day processing.',
      },
    ];

    setPlans(generatedPlans);
    setLoading(false);
  };

  const handleSelect = (plan: InsurancePlan) => {
    setSelectedPlan(plan);
  };

  const handleConfirm = () => {
    if (selectedPlan && onSelect) {
      onSelect(selectedPlan);
    }
    onClose();
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'from-gray-400 to-gray-500';
      case 'standard': return 'from-blue-400 to-blue-500';
      case 'premium': return 'from-purple-400 to-purple-500';
      case 'elite': return 'from-amber-400 to-amber-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'basic': return <Shield className="w-5 h-5" />;
      case 'standard': return <CheckCircle2 className="w-5 h-5" />;
      case 'premium': return <Star className="w-5 h-5" />;
      case 'elite': return <Award className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-3xl text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Instant Insurance Quote</h2>
                <p className="text-sm text-white/80">Powered by AI underwriting</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 bg-white/10 rounded-xl p-4">
            <div>
              <div className="text-sm text-white/70">Equipment Value</div>
              <div className="text-xl font-bold">${equipmentValue.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-white/70">Rental Period</div>
              <div className="text-xl font-bold">{rentalDays} days</div>
            </div>
            <div>
              <div className="text-sm text-white/70">Rental Cost</div>
              <div className="text-xl font-bold">${(dailyRate * rentalDays).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Generating Your Quotes...
              </h3>
              <p className="text-gray-600">
                Our AI is analyzing risk factors and market rates
              </p>
            </div>
          ) : (
            <>
              {/* Risk Analysis */}
              {factors && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    <span className="font-medium text-indigo-900">AI Risk Analysis</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Category</span>
                      <p className="font-medium text-gray-900">{factors.equipmentCategory}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Risk Score</span>
                      <p className="font-medium text-gray-900">{(factors.riskScore * 10).toFixed(1)}/10</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Market Rate</span>
                      <p className="font-medium text-gray-900">{(factors.marketRate * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Seasonal Factor</span>
                      <p className="font-medium text-gray-900">{factors.seasonalAdjustment}x</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Plans Grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => handleSelect(plan)}
                    className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedPlan?.id === plan.id
                        ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                        : 'border-gray-200 hover:border-indigo-200 hover:shadow'
                    }`}
                  >
                    {plan.recommended && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Recommended
                      </div>
                    )}
                    {plan.popular && !plan.recommended && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                        Most Popular
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getTierColor(plan.tier)} text-white flex items-center justify-center mb-2`}>
                          {getTierIcon(plan.tier)}
                        </div>
                        <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{plan.tier} tier</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          ${plan.totalCost.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${plan.dailyRate}/day
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Coverage</span>
                        <span className="font-medium text-gray-900">
                          {plan.coveragePercentage}% (${plan.coverageAmount.toLocaleString()})
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Deductible</span>
                        <span className="font-medium text-gray-900">
                          {plan.deductible === 0 ? 'None' : `$${plan.deductible.toLocaleString()}`}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                      <ul className="space-y-2">
                        {plan.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600">{feature}</span>
                          </li>
                        ))}
                        {plan.features.length > 3 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDetails(showDetails === plan.id ? null : plan.id);
                            }}
                            className="text-sm text-indigo-600 font-medium flex items-center gap-1"
                          >
                            +{plan.features.length - 3} more features
                            <ChevronRight className={`w-4 h-4 transition-transform ${
                              showDetails === plan.id ? 'rotate-90' : ''
                            }`} />
                          </button>
                        )}
                      </ul>
                    </div>

                    {/* Expanded Details */}
                    {showDetails === plan.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">All Features</h4>
                          <ul className="space-y-1">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-600">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {plan.exclusions.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Exclusions</h4>
                            <ul className="space-y-1">
                              {plan.exclusions.map((exclusion, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                  <span className="text-gray-500">{exclusion}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Claims Process</h4>
                          <p className="text-sm text-gray-600">{plan.claimProcess}</p>
                        </div>
                      </div>
                    )}

                    {selectedPlan?.id === plan.id && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Benefits */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Why Get Insurance?</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-xs text-gray-600">Financial Protection</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-xs text-gray-600">Fast Claims</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-xs text-gray-600">Peace of Mind</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-amber-600" />
                    </div>
                    <p className="text-xs text-gray-600">Breakdown Coverage</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-4 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Skip Insurance
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!selectedPlan}
                  className="flex-1 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {selectedPlan ? (
                    <>
                      Add {selectedPlan.name} - ${selectedPlan.totalCost.toFixed(2)}
                    </>
                  ) : (
                    'Select a Plan'
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <span>Underwritten by Islakayd Insurance Partners</span>
            <span>•</span>
            <a href="#" className="hover:text-indigo-500">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </div>
  );
}
