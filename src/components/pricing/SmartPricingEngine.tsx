import { useState } from 'react';
import { Sparkles, TrendingUp, Calendar, CheckCircle, Loader2 } from 'lucide-react';
import type { Equipment } from '../../types';

interface SmartPricingProps {
  equipment: Equipment;
  allEquipment?: Equipment[];
  onPriceChange?: (prices: PriceSuggestion) => void;
}

interface PriceSuggestion {
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  confidence: number;
  reasoning: string[];
  demandLevel: 'low' | 'medium' | 'high' | 'very-high';
  seasonalAdjustment: number;
  competitorComparison: 'below' | 'average' | 'above';
}

interface MarketData {
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  totalListings: number;
  demandScore: number;
}

export default function SmartPricingEngine({ equipment, allEquipment = [], onPriceChange }: SmartPricingProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState<PriceSuggestion | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Compute real market data from existing equipment listings
  const computeMarketData = (): MarketData => {
    const sameCat = allEquipment.filter(
      e => e.id !== equipment.id && e.category?.slug === equipment.category?.slug && e.daily_rate > 0
    );
    if (sameCat.length === 0) {
      const base = equipment.daily_rate || 50;
      return { averagePrice: base, minPrice: Math.round(base * 0.6), maxPrice: Math.round(base * 1.5), totalListings: 0, demandScore: 70 };
    }
    const rates = sameCat.map(e => e.daily_rate).sort((a, b) => a - b);
    const avg = Math.round(rates.reduce((s, r) => s + r, 0) / rates.length);
    const totalBookings = sameCat.reduce((s, e) => s + (e.total_bookings || 0), 0);
    const avgBookings = sameCat.length > 0 ? totalBookings / sameCat.length : 0;
    const demandScore = Math.min(100, Math.round(50 + avgBookings * 0.5));
    return {
      averagePrice: avg,
      minPrice: rates[0],
      maxPrice: rates[rates.length - 1],
      totalListings: sameCat.length,
      demandScore,
    };
  };

  const analyzePricing = async () => {
    setIsAnalyzing(true);
    // Brief delay for UX
    await new Promise(resolve => setTimeout(resolve, 800));

    const market = computeMarketData();
    const conditionMultiplier = getConditionMultiplier(equipment.condition || 'good');
    const seasonalMultiplier = getSeasonalMultiplier();

    // Use real market average as the base, adjusted for condition and season
    const baseForCalc = market.averagePrice > 0 ? market.averagePrice : (equipment.daily_rate || 50);
    const optimizedDaily = Math.round(baseForCalc * conditionMultiplier * seasonalMultiplier);
    const optimizedWeekly = Math.round(optimizedDaily * 6);
    const optimizedMonthly = Math.round(optimizedDaily * 22);

    const demandLevel: 'low' | 'medium' | 'high' | 'very-high' =
      market.demandScore >= 85 ? 'very-high' :
      market.demandScore >= 70 ? 'high' :
      market.demandScore >= 50 ? 'medium' : 'low';

    const demandText = { low: 'low', medium: 'moderate', high: 'high', 'very-high': 'very high' }[demandLevel];
    const confidence = market.totalListings >= 10 ? 0.92 : market.totalListings >= 3 ? 0.80 : 0.65;

    const newSuggestion: PriceSuggestion = {
      dailyRate: optimizedDaily,
      weeklyRate: optimizedWeekly,
      monthlyRate: optimizedMonthly,
      confidence,
      reasoning: [
        market.totalListings > 0
          ? `Based on ${market.totalListings} similar ${equipment.category?.name || 'equipment'} listings (avg $${market.averagePrice}/day)`
          : 'No comparable listings found — using your current rate as baseline',
        equipment.condition === 'excellent' ? 'Excellent condition commands a premium (+15%)' : `${equipment.condition || 'Good'} condition pricing applied`,
        `Demand is ${demandText} in this category`,
        seasonalMultiplier > 1 ? `Peak season adjustment applied (+${Math.round((seasonalMultiplier - 1) * 100)}%)` : 'Standard seasonal rate',
      ],
      demandLevel,
      seasonalAdjustment: Math.round((seasonalMultiplier - 1) * 100),
      competitorComparison:
        optimizedDaily > market.averagePrice * 1.05 ? 'above' :
        optimizedDaily < market.averagePrice * 0.95 ? 'below' : 'average',
    };

    setSuggestion(newSuggestion);
    setMarketData(market);
    setIsAnalyzing(false);

    if (onPriceChange) {
      onPriceChange(newSuggestion);
    }
  };

  const getConditionMultiplier = (condition: string): number => {
    const multipliers: Record<string, number> = {
      'excellent': 1.15,
      'good': 1.0,
      'fair': 0.85,
      'poor': 0.7,
    };
    return multipliers[condition] || 1.0;
  };

  const getSeasonalMultiplier = (): number => {
    const month = new Date().getMonth();
    // Peak season: March-August
    if (month >= 2 && month <= 7) return 1.15;
    // Holiday season: November-December
    if (month >= 10) return 1.1;
    return 1.0;
  };

  const getDemandColor = (level: string): string => {
    return {
      'low': 'text-gray-500 bg-gray-100',
      'medium': 'text-yellow-600 bg-yellow-100',
      'high': 'text-orange-600 bg-orange-100',
      'very-high': 'text-red-600 bg-red-100',
    }[level] || 'text-gray-500 bg-gray-100';
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Smart Pricing</h3>
            <p className="text-sm text-gray-500">Optimize your rental rates</p>
          </div>
        </div>
        
        <button
          onClick={analyzePricing}
          disabled={isAnalyzing}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
         >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4" />
              Analyze Market
            </>
          )}
        </button>
      </div>

      {suggestion && (
        <div className="space-y-4">
          {/* Price Suggestions */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-purple-100">
              <div className="text-sm text-gray-500 mb-1">Daily Rate</div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">${suggestion.dailyRate}</span>
                <span className="text-sm text-gray-400">/day</span>
              </div>
              {suggestion.dailyRate !== equipment.daily_rate && (
                <div className={`text-xs mt-1 ${suggestion.dailyRate > (equipment.daily_rate || 0) ? 'text-green-600' : 'text-red-600'}`}>
                  {suggestion.dailyRate > (equipment.daily_rate || 0) ? '↑' : '↓'} ${Math.abs(suggestion.dailyRate - (equipment.daily_rate || 0))} suggested
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-purple-100">
              <div className="text-sm text-gray-500 mb-1">Weekly Rate</div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">${suggestion.weeklyRate}</span>
                <span className="text-sm text-gray-400">/week</span>
              </div>
              <div className="text-xs text-green-600 mt-1">15% discount applied</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-purple-100">
              <div className="text-sm text-gray-500 mb-1">Monthly Rate</div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">${suggestion.monthlyRate}</span>
                <span className="text-sm text-gray-400">/mo</span>
              </div>
              <div className="text-xs text-green-600 mt-1">27% discount applied</div>
            </div>
          </div>

          {/* Confidence & Demand */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600">
                {Math.round(suggestion.confidence * 100)}% confidence
              </span>
            </div>
            
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDemandColor(suggestion.demandLevel)}`}>
              {suggestion.demandLevel.replace('-', ' ')} demand
            </div>
            
            {suggestion.seasonalAdjustment !== 0 && (
              <div className="flex items-center gap-1 text-sm text-amber-600">
                <Calendar className="w-4 h-4" />
                {suggestion.seasonalAdjustment > 0 ? '+' : ''}{suggestion.seasonalAdjustment}% seasonal
              </div>
            )}
          </div>

          {/* Reasoning */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            {showDetails ? 'Hide' : 'Show'} analysis details
          </button>
          
          {showDetails && (
            <div className="bg-white rounded-xl p-4 border border-purple-100 space-y-2">
              {suggestion.reasoning.map((reason, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-purple-500">•</span>
                  {reason}
                </div>
              ))}
            </div>
          )}

          {/* Market Comparison */}
          {marketData && (
            <div className="bg-white rounded-xl p-4 border border-purple-100">
              <div className="text-sm font-medium text-gray-700 mb-3">Market Comparison</div>
              <div className="relative h-2 bg-gray-200 rounded-full">
                <div 
                  className="absolute h-full bg-gradient-to-r from-green-400 to-teal-500 rounded-full"
                  style={{ 
                    left: `${((marketData.minPrice) / marketData.maxPrice) * 100}%`,
                    width: `${((marketData.averagePrice - marketData.minPrice) / marketData.maxPrice) * 100}%`
                  }}
                />
                <div 
                  className="absolute w-3 h-3 bg-purple-600 rounded-full -top-0.5 transform -translate-x-1/2 border-2 border-white shadow"
                  style={{ left: `${(suggestion.dailyRate / marketData.maxPrice) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>${marketData.minPrice}</span>
                <span>Avg: ${marketData.averagePrice}</span>
                <span>${marketData.maxPrice}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {!suggestion && !isAnalyzing && (
        <div className="text-center py-8 text-gray-500">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Click "Analyze Market" to get AI-powered pricing suggestions</p>
        </div>
      )}
    </div>
  );
}
