import { useState } from 'react';
import { Sparkles, TrendingUp, Calendar, CheckCircle, Loader2 } from 'lucide-react';
import type { Equipment } from '../../types';

interface SmartPricingProps {
  equipment: Equipment;
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

export default function SmartPricingEngine({ equipment, onPriceChange }: SmartPricingProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState<PriceSuggestion | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Simulate AI-powered pricing analysis
  const analyzePricing = async () => {
    setIsAnalyzing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock market analysis based on equipment data
    const baseRate = equipment.daily_rate || 50;
    const categoryMultiplier = getCategoryMultiplier(equipment.category?.slug || 'other');
    const conditionMultiplier = getConditionMultiplier(equipment.condition || 'good');
    const seasonalMultiplier = getSeasonalMultiplier();
    
    const optimizedDaily = Math.round(baseRate * categoryMultiplier * conditionMultiplier * seasonalMultiplier);
    const optimizedWeekly = Math.round(optimizedDaily * 6); // ~15% discount
    const optimizedMonthly = Math.round(optimizedDaily * 22); // ~27% discount
    
    const newSuggestion: PriceSuggestion = {
      dailyRate: optimizedDaily,
      weeklyRate: optimizedWeekly,
      monthlyRate: optimizedMonthly,
      confidence: 0.87,
      reasoning: [
        `Based on ${Math.floor(Math.random() * 50 + 20)} similar listings in your area`,
        `${equipment.condition === 'excellent' ? 'Premium condition justifies higher pricing' : 'Competitive pricing for condition level'}`,
        `Current demand is ${getDemandText()} in your market`,
        seasonalMultiplier > 1 ? 'Peak season pricing applied (+15%)' : 'Standard seasonal rate',
      ],
      demandLevel: getDemandLevel(),
      seasonalAdjustment: Math.round((seasonalMultiplier - 1) * 100),
      competitorComparison: optimizedDaily > baseRate ? 'above' : optimizedDaily < baseRate ? 'below' : 'average',
    };
    
    const newMarketData: MarketData = {
      averagePrice: Math.round(optimizedDaily * 0.95),
      minPrice: Math.round(optimizedDaily * 0.6),
      maxPrice: Math.round(optimizedDaily * 1.4),
      totalListings: Math.floor(Math.random() * 100 + 30),
      demandScore: Math.random() * 40 + 60,
    };
    
    setSuggestion(newSuggestion);
    setMarketData(newMarketData);
    setIsAnalyzing(false);
    
    if (onPriceChange) {
      onPriceChange(newSuggestion);
    }
  };

  const getCategoryMultiplier = (category: string): number => {
    const multipliers: Record<string, number> = {
      'construction': 1.2,
      'photography': 1.15,
      'audio-video': 1.1,
      'vehicles': 1.25,
      'power-tools': 1.0,
      'landscaping': 0.95,
      'events': 1.05,
      'cleaning': 0.9,
    };
    return multipliers[category] || 1.0;
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

  const getDemandLevel = (): 'low' | 'medium' | 'high' | 'very-high' => {
    const rand = Math.random();
    if (rand > 0.8) return 'very-high';
    if (rand > 0.5) return 'high';
    if (rand > 0.2) return 'medium';
    return 'low';
  };

  const getDemandText = (): string => {
    const level = getDemandLevel();
    return {
      'low': 'low',
      'medium': 'moderate',
      'high': 'high',
      'very-high': 'very high',
    }[level];
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
