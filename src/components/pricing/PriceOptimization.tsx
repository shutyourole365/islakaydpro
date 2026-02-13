import { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Brain,
  DollarSign,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import type { Equipment } from '../../types';
import { getEquipment, getBookings } from '../../services/database';
import { useAuth } from '../../contexts/AuthContext';

interface PriceOptimizationProps {
  equipment: Equipment;
  className?: string;
}

interface PriceRecommendation {
  currentPrice: number;
  recommendedPrice: number;
  confidence: number;
  reasoning: string[];
  potentialRevenue: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface MarketData {
  averagePrice: number;
  demandLevel: 'low' | 'medium' | 'high';
  seasonalMultiplier: number;
  competitorPrices: number[];
}

export default function PriceOptimization({ equipment, className = '' }: PriceOptimizationProps) {
  const { user } = useAuth();
  const [recommendation, setRecommendation] = useState<PriceRecommendation | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const analyzePricing = async () => {
      if (!user || !equipment) return;

      try {
        // Get market data and booking history
        const [allEquipment, bookings] = await Promise.all([
          getEquipment({ categoryId: equipment.category_id }),
          getBookings({ equipmentId: equipment.id }),
        ]);

        // Calculate market data
        const categoryEquipment = allEquipment.data.filter(eq => eq.id !== equipment.id);
        const competitorPrices = categoryEquipment.map(eq => eq.daily_rate);
        const averagePrice = competitorPrices.reduce((sum, price) => sum + price, 0) / competitorPrices.length;

        // Analyze booking patterns
        const recentBookings = bookings.filter(booking => {
          const bookingDate = new Date(booking.created_at);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return bookingDate > thirtyDaysAgo;
        });

        const demandLevel = recentBookings.length > 10 ? 'high' :
                           recentBookings.length > 5 ? 'medium' : 'low';

        // Seasonal analysis (simplified)
        const currentMonth = new Date().getMonth();
        const seasonalMultiplier = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].includes(currentMonth) ? 1.1 : 0.9;

        setMarketData({
          averagePrice,
          demandLevel,
          seasonalMultiplier,
          competitorPrices,
        });

        // Generate AI recommendation
        const currentPrice = equipment.daily_rate;
        let recommendedPrice = currentPrice;
        let confidence = 0.7;
        const reasoning: string[] = [];

        // Demand-based pricing
        if (demandLevel === 'high') {
          recommendedPrice *= 1.15;
          reasoning.push('High demand detected - consider price increase');
        } else if (demandLevel === 'low') {
          recommendedPrice *= 0.9;
          reasoning.push('Low demand - consider competitive pricing');
        }

        // Market comparison
        if (currentPrice < averagePrice * 0.8) {
          recommendedPrice = averagePrice * 0.9;
          reasoning.push('Price significantly below market average');
          confidence += 0.1;
        } else if (currentPrice > averagePrice * 1.2) {
          recommendedPrice = averagePrice * 1.1;
          reasoning.push('Price above market average - may reduce bookings');
          confidence -= 0.1;
        }

        // Seasonal adjustment
        recommendedPrice *= seasonalMultiplier;
        if (seasonalMultiplier > 1) {
          reasoning.push('Peak season - higher prices justified');
        } else {
          reasoning.push('Off-season - consider competitive pricing');
        }

        // Equipment condition factor
        if (equipment.condition === 'excellent') {
          recommendedPrice *= 1.1;
          reasoning.push('Excellent condition justifies premium pricing');
        }

        // Calculate potential revenue impact
        const avgBookingsPerMonth = bookings.length / 3; // Assuming 3 months of data
        const currentRevenue = avgBookingsPerMonth * currentPrice * 7; // 7 days average rental
        const newRevenue = avgBookingsPerMonth * recommendedPrice * 7;
        const potentialRevenue = newRevenue - currentRevenue;

        // Risk assessment
        const priceChangePercent = Math.abs((recommendedPrice - currentPrice) / currentPrice);
        const riskLevel = priceChangePercent > 0.2 ? 'high' :
                         priceChangePercent > 0.1 ? 'medium' : 'low';

        if (riskLevel === 'high') {
          reasoning.push('High risk adjustment - monitor closely');
          confidence -= 0.2;
        }

        setRecommendation({
          currentPrice,
          recommendedPrice: Math.round(recommendedPrice),
          confidence: Math.max(0.1, Math.min(1, confidence)),
          reasoning,
          potentialRevenue: Math.round(potentialRevenue),
          riskLevel,
        });
      } catch (error) {
        console.error('Failed to analyze pricing:', error);
      } finally {
        setLoading(false);
      }
    };

    analyzePricing();
  }, [user, equipment]);

  const handleApplyRecommendation = () => {
    // In a real app, this would update the equipment price
    setApplied(true);
    // Simulate API call
    setTimeout(() => {
      alert('Price optimization applied successfully!');
    }, 1000);
  };

  const priceChange = useMemo(() => {
    if (!recommendation) return 0;
    return ((recommendation.recommendedPrice - recommendation.currentPrice) / recommendation.currentPrice) * 100;
  }, [recommendation]);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!recommendation || !marketData) {
    return (
      <div className={`bg-white rounded-xl p-6 border border-gray-100 ${className}`}>
        <div className="text-center text-gray-500">
          <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Unable to generate price recommendations at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl p-6 border border-gray-100 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Price Optimization</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            recommendation.confidence > 0.8 ? 'bg-green-100 text-green-700' :
            recommendation.confidence > 0.6 ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {Math.round(recommendation.confidence * 100)}% confidence
          </div>
        </div>
      </div>

      {/* Current vs Recommended Price */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Current Price</p>
          <p className="text-2xl font-bold text-gray-900">${recommendation.currentPrice}</p>
          <p className="text-xs text-gray-500">per day</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Recommended Price</p>
          <p className="text-2xl font-bold text-purple-900">${recommendation.recommendedPrice}</p>
          <p className="text-xs text-gray-500">per day</p>
        </div>
      </div>

      {/* Price Change Indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {priceChange >= 0 ? (
          <TrendingUp className="w-5 h-5 text-green-600" />
        ) : (
          <TrendingDown className="w-5 h-5 text-red-600" />
        )}
        <span className={`text-lg font-semibold ${
          priceChange >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(1)}% change
        </span>
      </div>

      {/* Market Insights */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Market Insights</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-600">Market Average</p>
              <p className="text-sm font-medium">${marketData.averagePrice.toFixed(0)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-600">Demand Level</p>
              <p className={`text-sm font-medium capitalize ${
                marketData.demandLevel === 'high' ? 'text-green-600' :
                marketData.demandLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {marketData.demandLevel}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Reasoning */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">AI Analysis</h4>
        <ul className="space-y-2">
          {recommendation.reasoning.map((reason, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              {reason}
            </li>
          ))}
        </ul>
      </div>

      {/* Risk Assessment */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          {recommendation.riskLevel === 'low' ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : recommendation.riskLevel === 'medium' ? (
            <Clock className="w-4 h-4 text-yellow-500" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-500" />
          )}
          <span className="text-sm font-medium text-gray-900">Risk Assessment</span>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          {recommendation.riskLevel === 'low' && 'Low risk adjustment with high confidence.'}
          {recommendation.riskLevel === 'medium' && 'Moderate risk - monitor performance closely.'}
          {recommendation.riskLevel === 'high' && 'High risk adjustment - consider gradual implementation.'}
        </p>
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            Potential revenue impact: <span className={`font-medium ${
              recommendation.potentialRevenue >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {recommendation.potentialRevenue >= 0 ? '+' : ''}${recommendation.potentialRevenue}/month
            </span>
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleApplyRecommendation}
        disabled={applied}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          applied
            ? 'bg-green-100 text-green-700 cursor-not-allowed'
            : 'bg-purple-600 text-white hover:bg-purple-700'
        }`}
      >
        {applied ? (
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Price Optimized
          </div>
        ) : (
          'Apply AI Recommendation'
        )}
      </button>
    </div>
  );
}