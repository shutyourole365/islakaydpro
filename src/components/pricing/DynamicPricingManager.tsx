import { useState, useEffect } from 'react';
import { Plus, TrendingUp, DollarSign, Activity, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/Toast';
import { supabase } from '../../lib/supabase';
import {
  getDynamicPrices,
  getPricingRules,
  getPricingMetrics,
  createDynamicPrice,
  deleteDynamicPrice,
  createPricingRule,
  deletePricingRule,
  calculateOptimalPrice,
  type DynamicPrice,
  type PricingRule,
  type PricingMetrics,
} from '../../services/dynamicPricingService';

export default function DynamicPricingManager() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [equipment, setEquipment] = useState<any[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [dynamicPrices, setDynamicPrices] = useState<DynamicPrice[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [metrics, setMetrics] = useState<PricingMetrics | null>(null);
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [priceForm, setPriceForm] = useState({
    priceMultiplier: 1.0,
    minDailyRate: 0,
    maxDailyRate: 0,
    effectiveFrom: '',
    reason: '',
  });
  const [ruleForm, setRuleForm] = useState({
    ruleType: 'seasonal' as const,
    priceMultiplier: 1.0,
  });

  useEffect(() => {
    if (!user?.id) return;
    loadEquipment();
  }, [user?.id]);

  useEffect(() => {
    if (!selectedEquipment) return;
    loadPricingData();
  }, [selectedEquipment]);

  const loadEquipment = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('owner_id', user.id);

      if (error) throw error;

      setEquipment(data || []);
      if (data && data.length > 0) {
        setSelectedEquipment(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load equipment:', err);
      showError('Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  const loadPricingData = async () => {
    if (!selectedEquipment) return;
    try {
      setLoading(true);
      const [prices, rules, metricsData] = await Promise.all([
        getDynamicPrices(selectedEquipment),
        getPricingRules(selectedEquipment),
        getPricingMetrics(selectedEquipment),
      ]);

      setDynamicPrices(prices);
      setPricingRules(rules);
      setMetrics(metricsData);
    } catch (err) {
      console.error('Failed to load pricing data:', err);
      showError('Failed to load pricing data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment) return;

    try {
      const equip = equipment.find(e => e.id === selectedEquipment);
      if (!equip) return;

      await createDynamicPrice(selectedEquipment, {
        baseDailyRate: equip.daily_rate,
        priceMultiplier: priceForm.priceMultiplier,
        minDailyRate: priceForm.minDailyRate,
        maxDailyRate: priceForm.maxDailyRate,
        effectiveFrom: priceForm.effectiveFrom,
        effectiveUntil: null,
        reason: priceForm.reason,
        demandLevel: 'medium',
      });

      success('Dynamic price created');
      setShowPriceForm(false);
      setPriceForm({
        priceMultiplier: 1.0,
        minDailyRate: 0,
        maxDailyRate: 0,
        effectiveFrom: '',
        reason: '',
      });
      loadPricingData();
    } catch (err) {
      console.error('Failed to create price:', err);
      showError('Failed to create dynamic price');
    }
  };

  const handleDeletePrice = async (priceId: string) => {
    if (!confirm('Delete this dynamic price?')) return;

    try {
      await deleteDynamicPrice(priceId);
      success('Dynamic price deleted');
      loadPricingData();
    } catch (err) {
      console.error('Failed to delete price:', err);
      showError('Failed to delete dynamic price');
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment) return;

    try {
      await createPricingRule(selectedEquipment, {
        ruleType: ruleForm.ruleType,
        condition: {},
        priceMultiplier: ruleForm.priceMultiplier,
        enabled: true,
      });

      success('Pricing rule created');
      setShowRuleForm(false);
      setRuleForm({ ruleType: 'seasonal', priceMultiplier: 1.0 });
      loadPricingData();
    } catch (err) {
      console.error('Failed to create rule:', err);
      showError('Failed to create pricing rule');
    }
  };

  const handleApplyOptimalPrice = async () => {
    if (!selectedEquipment) return;

    try {
      const optimalPrice = await calculateOptimalPrice(selectedEquipment);
      const equip = equipment.find(e => e.id === selectedEquipment);
      if (!equip) return;

      const multiplier = optimalPrice / equip.daily_rate;

      await createDynamicPrice(selectedEquipment, {
        baseDailyRate: equip.daily_rate,
        priceMultiplier: multiplier,
        minDailyRate: Math.round(equip.daily_rate * 0.8 * 100) / 100,
        maxDailyRate: Math.round(optimalPrice * 100) / 100,
        effectiveFrom: new Date().toISOString(),
        effectiveUntil: null,
        reason: 'AI-recommended optimal price based on demand',
        demandLevel: 'high',
      });

      success(`Optimal price applied: $${optimalPrice}/day`);
      loadPricingData();
    } catch (err) {
      console.error('Failed to apply optimal price:', err);
      showError('Failed to apply optimal price');
    }
  };

  if (loading && equipment.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
      </div>
    );
  }

  const currentEquip = equipment.find(e => e.id === selectedEquipment);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Dynamic Pricing</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Optimize prices based on demand, seasonality, and market conditions
        </p>
      </div>

      {/* Equipment Selector */}
      {equipment.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Select Equipment
          </label>
          <select
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {equipment.map(eq => (
              <option key={eq.id} value={eq.id}>
                {eq.name} - ${eq.daily_rate}/day
              </option>
            ))}
          </select>
        </div>
      )}

      {currentEquip && metrics && (
        <>
          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {metrics.occupancyRate}%
                  </p>
                </div>
                <Activity className="w-8 h-8 text-teal-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Revenue (30 days)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    ${metrics.totalRevenueLast30Days}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Daily Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    ${metrics.averageDailyRate}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Recommended Multiplier</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {metrics.recommendedPriceMultiplier.toFixed(2)}x
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Recommendation Box */}
          {metrics.recommendedPriceMultiplier !== 1.0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900 dark:text-yellow-200">Price Optimization Opportunity</p>
                  <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                    Based on your occupancy rate of {metrics.occupancyRate}%, we recommend adjusting your price to{' '}
                    <span className="font-semibold">
                      ${Math.round(currentEquip.daily_rate * metrics.recommendedPriceMultiplier * 100) / 100}/day
                    </span>
                  </p>
                  <button
                    onClick={handleApplyOptimalPrice}
                    className="mt-3 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition text-sm font-medium"
                  >
                    Apply Recommended Price
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Prices Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Price Adjustments</h3>
              <button
                onClick={() => setShowPriceForm(!showPriceForm)}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
                Add Price
              </button>
            </div>

            {showPriceForm && (
              <form
                onSubmit={handleCreatePrice}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Price Multiplier
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="2.0"
                    value={priceForm.priceMultiplier}
                    onChange={(e) => setPriceForm({ ...priceForm, priceMultiplier: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    New price: ${Math.round(currentEquip.daily_rate * priceForm.priceMultiplier * 100) / 100}/day
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Min Daily Rate
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={priceForm.minDailyRate}
                      onChange={(e) => setPriceForm({ ...priceForm, minDailyRate: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Max Daily Rate
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={priceForm.maxDailyRate}
                      onChange={(e) => setPriceForm({ ...priceForm, maxDailyRate: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Effective From
                  </label>
                  <input
                    type="date"
                    value={priceForm.effectiveFrom}
                    onChange={(e) => setPriceForm({ ...priceForm, effectiveFrom: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Reason
                  </label>
                  <input
                    type="text"
                    value={priceForm.reason}
                    onChange={(e) => setPriceForm({ ...priceForm, reason: e.target.value })}
                    placeholder="e.g., Holiday season demand"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition"
                  >
                    Add Price
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPriceForm(false)}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {dynamicPrices.length === 0 ? (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                No dynamic prices yet. Add one to start optimizing!
              </div>
            ) : (
              <div className="space-y-3">
                {dynamicPrices.map(price => (
                  <div
                    key={price.id}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {price.priceMultiplier.toFixed(2)}x multiplier
                          </h4>
                          <span className="text-xs px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded">
                            {price.demandLevel}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{price.reason}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Range: ${price.minDailyRate} - ${price.maxDailyRate}
                        </p>
                        <p className="text-xs text-gray-500">
                          Effective: {new Date(price.effectiveFrom).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeletePrice(price.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {equipment.length === 0 && (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          No equipment found. Create equipment to set up dynamic pricing.
        </div>
      )}
    </div>
  );
}
