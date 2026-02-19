import { ArrowLeft, Shield, Calculator, CheckCircle, TrendingUp } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState } from 'react';

interface InsuranceQuote {
  id: string;
  equipmentType: string;
  coverage: 'basic' | 'standard' | 'premium';
  dailyRate: number;
  monthlyRate: number;
  deductible: number;
  coverageAmount: number;
  riskScore: number;
  factors: string[];
}

interface AIInsuranceProps {
  onBack: () => void;
  equipment?: {
    id: string;
    title: string;
    category: string;
    dailyRate: number;
    value: number;
  };
}

export default function AIInsurance({ onBack, equipment }: AIInsuranceProps) {
  const [selectedCoverage, setSelectedCoverage] = useState<'basic' | 'standard' | 'premium'>('standard');
  const [riskAssessment, setRiskAssessment] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [quote, setQuote] = useState<InsuranceQuote | null>(null);
  const [showQuote, setShowQuote] = useState(false);

  const demoEquipment = equipment || {
    id: 'demo-1',
    title: 'CAT 320 Excavator',
    category: 'Construction',
    dailyRate: 450,
    value: 250000
  };

  const coverageOptions = [
    {
      type: 'basic' as const,
      name: 'Basic Coverage',
      description: 'Essential protection for standard equipment use',
      features: ['Theft Protection', 'Accidental Damage', 'Basic Liability'],
      riskMultiplier: 1.2,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      type: 'standard' as const,
      name: 'Standard Coverage',
      description: 'Comprehensive protection for most rental scenarios',
      features: ['Theft Protection', 'Accidental Damage', 'Extended Liability', 'Weather Protection', '24/7 Support'],
      riskMultiplier: 1.5,
      color: 'from-green-500 to-emerald-500'
    },
    {
      type: 'premium' as const,
      name: 'Premium Coverage',
      description: 'Maximum protection with advanced AI monitoring',
      features: ['Theft Protection', 'Accidental Damage', 'Extended Liability', 'Weather Protection', '24/7 Support', 'GPS Tracking', 'Usage Monitoring', 'Priority Claims'],
      riskMultiplier: 2.0,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const riskFactors = [
    { factor: 'Equipment Age', impact: 'low', description: 'Well-maintained equipment reduces risk' },
    { factor: 'Operator Experience', impact: 'medium', description: 'Experienced operators lower accident rates' },
    { factor: 'Usage Hours', impact: 'high', description: 'High usage increases wear and tear risk' },
    { factor: 'Location', impact: 'medium', description: 'Urban vs rural operation affects risk' },
    { factor: 'Weather Conditions', impact: 'high', description: 'Adverse weather increases accident risk' },
    { factor: 'Maintenance History', impact: 'low', description: 'Regular maintenance reduces breakdown risk' }
  ];

  const calculateRisk = async () => {
    setIsCalculating(true);

    // Simulate AI risk assessment
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate risk score based on various factors
    const baseRisk = Math.random() * 30 + 20; // 20-50 base risk
    const equipmentFactor = demoEquipment.category === 'Construction' ? 1.2 : 1.0;
    const valueFactor = Math.min(demoEquipment.value / 100000, 2); // Higher value = higher risk
    const finalRisk = Math.round(baseRisk * equipmentFactor * valueFactor);

    setRiskAssessment(finalRisk);

    // Generate quote based on risk and coverage
    const selectedOption = coverageOptions.find(opt => opt.type === selectedCoverage);
    if (selectedOption) {
      const baseRate = (demoEquipment.dailyRate * 0.15) * selectedOption.riskMultiplier;
      const riskAdjustment = finalRisk / 100; // Risk score as percentage
      const adjustedRate = baseRate * (1 + riskAdjustment);

      const newQuote: InsuranceQuote = {
        id: `quote-${Date.now()}`,
        equipmentType: demoEquipment.category,
        coverage: selectedCoverage,
        dailyRate: Math.round(adjustedRate * 100) / 100,
        monthlyRate: Math.round(adjustedRate * 30 * 100) / 100,
        deductible: selectedCoverage === 'basic' ? 2000 : selectedCoverage === 'standard' ? 1000 : 500,
        coverageAmount: demoEquipment.value,
        riskScore: finalRisk,
        factors: riskFactors.map(f => f.factor)
      };

      setQuote(newQuote);
      setShowQuote(true);
    }

    setIsCalculating(false);
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600 bg-green-100';
    if (score < 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRiskLabel = (score: number) => {
    if (score < 30) return 'Low Risk';
    if (score < 50) return 'Medium Risk';
    return 'High Risk';
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
          Back to Features
        </Button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold">AI-Powered Insurance</h1>
                <p className="text-blue-100">Dynamic quotes based on real-time risk assessment</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Equipment Summary */}
            <div className="mb-8 bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Equipment Details</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900">{demoEquipment.title}</h3>
                  <p className="text-gray-600">{demoEquipment.category} Equipment</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Daily Rate: ${demoEquipment.dailyRate} | Value: ${demoEquipment.value.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Risk Assessment</span>
                      {riskAssessment > 0 && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(riskAssessment)}`}>
                          {getRiskLabel(riskAssessment)}
                        </span>
                      )}
                    </div>
                    {riskAssessment > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            riskAssessment < 30 ? 'bg-green-500' :
                            riskAssessment < 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(riskAssessment * 2, 100)}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Coverage Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Coverage Level</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {coverageOptions.map((option) => (
                  <div
                    key={option.type}
                    onClick={() => setSelectedCoverage(option.type)}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedCoverage === option.type
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${option.color} flex items-center justify-center mb-4`}>
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{option.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{option.description}</p>
                    <ul className="space-y-1">
                      {option.features.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Factors */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">AI Risk Assessment Factors</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {riskFactors.map((factor, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{factor.factor}</h4>
                      <p className="text-sm text-gray-600">{factor.description}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      factor.impact === 'low' ? 'bg-green-100 text-green-800' :
                      factor.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {factor.impact} impact
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculate Button */}
            <div className="text-center mb-8">
              <Button
                onClick={calculateRisk}
                disabled={isCalculating}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
              >
                {isCalculating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Analyzing Risk Factors...
                  </>
                ) : (
                  <>
                    <Calculator className="w-5 h-5 mr-2" />
                    Get AI Insurance Quote
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Our AI analyzes 50+ risk factors in real-time
              </p>
            </div>

            {/* Quote Display */}
            {showQuote && quote && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-8 h-8 text-green-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-green-900 mb-4">Your AI-Generated Insurance Quote</h3>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Coverage Details</h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Coverage Level:</span> {quote.coverage.charAt(0).toUpperCase() + quote.coverage.slice(1)}</p>
                          <p><span className="font-medium">Equipment Type:</span> {quote.equipmentType}</p>
                          <p><span className="font-medium">Coverage Amount:</span> ${quote.coverageAmount.toLocaleString()}</p>
                          <p><span className="font-medium">Deductible:</span> ${quote.deductible}</p>
                          <p><span className="font-medium">Risk Score:</span> {quote.riskScore}/100</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Premium Rates</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Daily Rate:</span>
                            <span className="font-semibold text-lg">${quote.dailyRate}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Monthly Rate:</span>
                            <span className="font-semibold text-lg">${quote.monthlyRate}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">AI Risk Analysis</h4>
                      <p className="text-sm text-gray-600">
                        Based on your equipment profile and usage patterns, our AI calculated a risk score of {quote.riskScore}.
                        This score considers equipment value, category, maintenance history, and market conditions.
                      </p>
                    </div>

                    <div className="flex gap-4 justify-center">
                      <Button variant="outline" onClick={() => setShowQuote(false)}>
                        Recalculate
                      </Button>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Shield className="w-5 h-5 mr-2" />
                        Purchase Coverage
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Benefits */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">AI Insurance Benefits</h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Dynamic pricing based on real-time risk assessment</li>
                    <li>• Instant quotes with no paperwork or waiting periods</li>
                    <li>• Coverage adjusts automatically as conditions change</li>
                    <li>• 24/7 AI monitoring and instant claims processing</li>
                    <li>• Up to 40% savings compared to traditional insurance</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}