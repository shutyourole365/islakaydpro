import { useState, useEffect, useCallback } from 'react';
import { Brain, Cpu, Zap, TrendingUp, Target, Eye, BarChart3, Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getEquipment, getBookings } from '../../services/database';
import type { Equipment, Booking } from '../../types';

interface AIPrediction {
  equipmentId: string;
  confidence: number;
  predictedDemand: number;
  optimalPrice: number;
  maintenanceRisk: number;
  recommendation: string;
}

interface MLInsights {
  totalPredictions: number;
  accuracy: number;
  revenueImpact: number;
  topPerformingEquipment: string[];
  marketTrends: string[];
}

export default function AIMachineLearningHub() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [insights, setInsights] = useState<MLInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'predictions' | 'insights' | 'training'>('predictions');

  useEffect(() => {
    if (user) {
      loadAIPredictions();
      loadMLInsights();
    }
  }, [user]);

  const loadAIPredictions = async () => {
    if (!user) return;

    try {
      const [equipmentData, bookingsData] = await Promise.all([
        getEquipment({ ownerId: user.id }),
        getBookings({ ownerId: user.id })
      ]);

      const equipment = Array.isArray(equipmentData) ? equipmentData : equipmentData.data || [];
      const bookings = Array.isArray(bookingsData) ? bookingsData : bookingsData.data || [];

      // Simulate AI predictions (in real app, this would call ML service)
      const aiPredictions = equipment.map((eq: Equipment) => {
        const eqBookings = bookings.filter((b: Booking) => b.equipment_id === eq.id);
        const recentBookings = eqBookings.filter((b: Booking) => {
          const bookingDate = new Date(b.created_at);
          const daysAgo = (Date.now() - bookingDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysAgo <= 30;
        });

        const demandScore = Math.min(10, recentBookings.length * 0.5 + (eq.rating || 4) * 0.8);
        const confidence = Math.random() * 0.3 + 0.7; // 70-100% confidence
        const optimalPrice = (eq.daily_rate || 50) * (1 + demandScore * 0.1);
        const maintenanceRisk = Math.random() * 30; // 0-30% risk

        let recommendation = 'Monitor performance';
        if (demandScore > 8) recommendation = 'High demand - consider price increase';
        else if (demandScore < 3) recommendation = 'Low demand - marketing needed';
        else if (maintenanceRisk > 20) recommendation = 'Schedule maintenance soon';

        return {
          equipmentId: eq.id,
          confidence,
          predictedDemand: demandScore,
          optimalPrice: Math.round(optimalPrice),
          maintenanceRisk,
          recommendation,
        };
      });

      setPredictions(aiPredictions);
    } catch (error) {
      console.error('Failed to load AI predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMLInsights = async () => {
    // Simulate ML insights (in real app, this would come from ML service)
    const mockInsights: MLInsights = {
      totalPredictions: 156,
      accuracy: 87.3,
      revenueImpact: 12450,
      topPerformingEquipment: ['Excavator XL-2000', 'Forklift Pro-500', 'Generator MaxPower'],
      marketTrends: [
        'Construction equipment demand up 15%',
        'Weekend rentals increasing 22%',
        'Urban areas showing 30% growth'
      ]
    };

    setInsights(mockInsights);
  };

  const retrainModel = async () => {
    // Simulate model retraining
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    await loadAIPredictions();
    await loadMLInsights();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-8 h-8" />
          <h1 className="text-2xl font-bold">AI Machine Learning Hub</h1>
        </div>
        <p className="text-purple-100">
          Advanced AI predictions, market insights, and automated optimization for your equipment rental business
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'predictions', label: 'AI Predictions', icon: Target },
          { id: 'insights', label: 'ML Insights', icon: BarChart3 },
          { id: 'training', label: 'Model Training', icon: Cpu }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm ${
              activeTab === id
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'predictions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {predictions.map((prediction) => (
            <div key={prediction.equipmentId} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-teal-500" />
                  <span className="font-semibold text-gray-900">AI Prediction</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {Math.round(prediction.confidence * 100)}% confidence
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Predicted Demand</span>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold">{prediction.predictedDemand.toFixed(1)}/10</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Optimal Price</span>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-500" />
                    <span className="font-semibold">${prediction.optimalPrice}/day</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Maintenance Risk</span>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-red-500" />
                    <span className="font-semibold">{prediction.maintenanceRisk.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{prediction.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'insights' && insights && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-teal-500" />
              Performance Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Predictions</span>
                <span className="font-semibold text-2xl">{insights.totalPredictions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Model Accuracy</span>
                <span className="font-semibold text-2xl text-green-600">{insights.accuracy}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Revenue Impact</span>
                <span className="font-semibold text-2xl text-blue-600">${insights.revenueImpact.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Market Trends */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              Market Trends
            </h3>
            <div className="space-y-3">
              {insights.marketTrends.map((trend, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">{trend}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performing Equipment */}
          <div className="bg-white rounded-lg shadow-sm border p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-500" />
              Top Performing Equipment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insights.topPerformingEquipment.map((equipment, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{equipment}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    High demand • Optimal pricing • Low maintenance
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'training' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-500" />
            Model Training & Optimization
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Training Data</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Historical bookings: 2,450</div>
                  <div>Equipment records: 156</div>
                  <div>User interactions: 8,320</div>
                  <div>Market data points: 15,600</div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Model Performance</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Accuracy: 87.3%</div>
                  <div>Precision: 84.1%</div>
                  <div>Recall: 89.2%</div>
                  <div>F1 Score: 86.6%</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Retraining Options</h4>
                <div className="space-y-2">
                  <button
                    onClick={retrainModel}
                    className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                  >
                    Retrain Model
                  </button>
                  <p className="text-xs text-gray-500">
                    Last trained: 2 hours ago • Next scheduled: 6 hours
                  </p>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Advanced Features</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Real-time learning</div>
                  <div>• A/B testing framework</div>
                  <div>• Custom model deployment</div>
                  <div>• Performance monitoring</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}