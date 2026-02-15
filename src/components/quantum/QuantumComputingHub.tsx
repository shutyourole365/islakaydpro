import { useState, useEffect, useRef, useCallback } from 'react';
import { Cpu, Zap, TrendingUp, BarChart3, Play, Pause, RotateCcw, Settings, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getEquipment, getBookings } from '../../services/database';
import type { Equipment, Booking } from '../../types';

interface QuantumOptimization {
  id: string;
  type: 'pricing' | 'routing' | 'scheduling' | 'inventory' | 'maintenance';
  status: 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  parameters: Record<string, any>;
  results: QuantumResult;
  qubits: number;
  executionTime: number;
}

interface QuantumResult {
  optimalSolution: any;
  confidence: number;
  improvement: number;
  constraints: string[];
  visualizations: {
    chart: string;
    heatmap: string;
    network: string;
  };
}

interface QuantumSimulation {
  id: string;
  name: string;
  description: string;
  type: 'market' | 'demand' | 'supply' | 'pricing' | 'competition';
  parameters: Record<string, any>;
  results: SimulationResult[];
  status: 'idle' | 'running' | 'completed';
  progress: number;
}

interface SimulationResult {
  timestamp: Date;
  variables: Record<string, number>;
  metrics: Record<string, number>;
  predictions: Record<string, number>;
}

export default function QuantumComputingHub() {
  const { user } = useAuth();
  const [optimizations, setOptimizations] = useState<QuantumOptimization[]>([]);
  const [simulations, setSimulations] = useState<QuantumSimulation[]>([]);
  const [activeOptimization, setActiveOptimization] = useState<QuantumOptimization | null>(null);
  const [activeSimulation, setActiveSimulation] = useState<QuantumSimulation | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'optimizations' | 'simulations' | 'analytics'>('optimizations');
  const [quantumResources, setQuantumResources] = useState({
    qubits: 1024,
    available: 512,
    processingPower: 95,
    accuracy: 99.7
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (user) {
      loadData();
      initializeQuantumResources();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [equipmentData, bookingsData] = await Promise.all([
        getEquipment({ ownerId: user.id }),
        getBookings({ renterId: user.id })
      ]);

      setEquipment(Array.isArray(equipmentData) ? equipmentData : equipmentData.data || []);
      setBookings(Array.isArray(bookingsData) ? bookingsData : bookingsData.data || []);

      // Initialize mock quantum optimizations
      const mockOptimizations: QuantumOptimization[] = [
        {
          id: 'opt-1',
          type: 'pricing',
          status: 'completed',
          startTime: new Date(Date.now() - 3600000),
          endTime: new Date(Date.now() - 3000000),
          parameters: { equipment: 'all', timeframe: '30d', constraints: ['profit_margin', 'competition'] },
          results: {
            optimalSolution: { priceIncrease: 12.5, confidence: 94.2 },
            confidence: 94.2,
            improvement: 15.3,
            constraints: ['Maintain 20% profit margin', 'Stay competitive'],
            visualizations: {
              chart: 'price_optimization_chart.png',
              heatmap: 'pricing_heatmap.png',
              network: 'pricing_network.png'
            }
          },
          qubits: 256,
          executionTime: 600000
        },
        {
          id: 'opt-2',
          type: 'routing',
          status: 'running',
          startTime: new Date(),
          parameters: { locations: 15, vehicles: 5, constraints: ['time_windows', 'capacity'] },
          results: {
            optimalSolution: null,
            confidence: 0,
            improvement: 0,
            constraints: [],
            visualizations: {
              chart: '',
              heatmap: '',
              network: ''
            }
          },
          qubits: 512,
          executionTime: 0
        }
      ];

      setOptimizations(mockOptimizations);

      // Initialize mock quantum simulations
      const mockSimulations: QuantumSimulation[] = [
        {
          id: 'sim-1',
          name: 'Market Demand Forecast',
          description: 'Predict equipment rental demand using quantum algorithms',
          type: 'demand',
          parameters: { horizon: '90d', factors: ['seasonality', 'economic_indicators', 'competition'] },
          results: [],
          status: 'completed',
          progress: 100
        },
        {
          id: 'sim-2',
          name: 'Dynamic Pricing Model',
          description: 'Optimize pricing strategy with real-time market data',
          type: 'pricing',
          parameters: { elasticity: 1.2, competitors: 8, demand_sensitivity: 0.8 },
          results: [],
          status: 'running',
          progress: 67
        }
      ];

      setSimulations(mockSimulations);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeQuantumResources = () => {
    // Simulate quantum resource monitoring
    const updateResources = () => {
      setQuantumResources(prev => ({
        ...prev,
        available: Math.max(0, prev.available + (Math.random() - 0.5) * 50),
        processingPower: 90 + Math.random() * 10,
        accuracy: 99.5 + Math.random() * 0.5
      }));
    };

    const interval = setInterval(updateResources, 5000);
    return () => clearInterval(interval);
  };

  const startOptimization = (type: QuantumOptimization['type']) => {
    const newOptimization: QuantumOptimization = {
      id: `opt-${Date.now()}`,
      type,
      status: 'running',
      startTime: new Date(),
      parameters: getDefaultParameters(type),
      results: {
        optimalSolution: null,
        confidence: 0,
        improvement: 0,
        constraints: [],
        visualizations: {
          chart: '',
          heatmap: '',
          network: ''
        }
      },
      qubits: type === 'routing' ? 512 : type === 'scheduling' ? 256 : 128,
      executionTime: 0
    };

    setOptimizations(prev => [newOptimization, ...prev]);
    setActiveOptimization(newOptimization);

    // Simulate optimization process
    simulateOptimization(newOptimization.id);
  };

  const getDefaultParameters = (type: QuantumOptimization['type']) => {
    switch (type) {
      case 'pricing':
        return { equipment: 'all', timeframe: '30d', constraints: ['profit_margin', 'competition'] };
      case 'routing':
        return { locations: equipment.length, vehicles: Math.ceil(equipment.length / 3), constraints: ['time_windows', 'capacity'] };
      case 'scheduling':
        return { bookings: bookings.length, resources: equipment.length, constraints: ['availability', 'maintenance'] };
      case 'inventory':
        return { items: equipment.length, turnover: 30, constraints: ['storage', 'demand'] };
      case 'maintenance':
        return { equipment: equipment.length, schedule: 'predictive', constraints: ['downtime', 'cost'] };
      default:
        return {};
    }
  };

  const simulateOptimization = (optimizationId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;

      if (progress >= 100) {
        clearInterval(interval);
        completeOptimization(optimizationId);
      }

      // Update progress (simulated)
      setOptimizations(prev => prev.map(opt =>
        opt.id === optimizationId
          ? { ...opt, executionTime: Date.now() - opt.startTime.getTime() }
          : opt
      ));
    }, 1000);
  };

  const completeOptimization = (optimizationId: string) => {
    setOptimizations(prev => prev.map(opt => {
      if (opt.id === optimizationId) {
        const improvement = 10 + Math.random() * 20;
        const confidence = 85 + Math.random() * 10;

        return {
          ...opt,
          status: 'completed',
          endTime: new Date(),
          results: {
            ...opt.results,
            optimalSolution: generateOptimalSolution(opt.type),
            confidence,
            improvement,
            constraints: generateConstraints(opt.type),
            visualizations: {
              chart: `${opt.type}_chart.png`,
              heatmap: `${opt.type}_heatmap.png`,
              network: `${opt.type}_network.png`
            }
          }
        };
      }
      return opt;
    }));
  };

  const generateOptimalSolution = (type: QuantumOptimization['type']) => {
    switch (type) {
      case 'pricing':
        return { priceIncrease: 8 + Math.random() * 15, strategy: 'dynamic' };
      case 'routing':
        return { routes: Math.ceil(equipment.length / 3), efficiency: 85 + Math.random() * 10 };
      case 'scheduling':
        return { utilization: 75 + Math.random() * 15, conflicts: 0 };
      case 'inventory':
        return { turnover: 25 + Math.random() * 10, stockouts: 0 };
      case 'maintenance':
        return { predictive_accuracy: 92 + Math.random() * 5, cost_savings: 20 + Math.random() * 15 };
      default:
        return {};
    }
  };

  const generateConstraints = (type: QuantumOptimization['type']) => {
    const constraints = {
      pricing: ['Maintain profit margins', 'Stay competitive', 'Consider demand elasticity'],
      routing: ['Respect time windows', 'Vehicle capacity limits', 'Driver availability'],
      scheduling: ['Equipment availability', 'Maintenance windows', 'Booking conflicts'],
      inventory: ['Storage capacity', 'Lead times', 'Demand variability'],
      maintenance: ['Minimize downtime', 'Cost optimization', 'Safety requirements']
    };
    return constraints[type] || [];
  };

  const startSimulation = (simulation: QuantumSimulation) => {
    setActiveSimulation(simulation);
    setSimulations(prev => prev.map(sim =>
      sim.id === simulation.id ? { ...sim, status: 'running' } : sim
    ));

    // Simulate simulation progress
    let progress = simulation.progress;
    const interval = setInterval(() => {
      progress += Math.random() * 5;

      if (progress >= 100) {
        clearInterval(interval);
        setSimulations(prev => prev.map(sim =>
          sim.id === simulation.id ? { ...sim, status: 'completed', progress: 100 } : sim
        ));
        setActiveSimulation(null);
      } else {
        setSimulations(prev => prev.map(sim =>
          sim.id === simulation.id ? { ...sim, progress } : sim
        ));
      }
    }, 2000);
  };

  const exportResults = (optimization: QuantumOptimization) => {
    const data = {
      optimization,
      timestamp: new Date().toISOString(),
      exportFormat: 'json'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quantum-optimization-${optimization.type}-${optimization.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Cpu className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Quantum Computing Hub</h1>
        </div>
        <p className="text-purple-100">
          Advanced quantum algorithms for equipment rental optimization and predictive analytics
        </p>
      </div>

      {/* Quantum Resources */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <Cpu className="w-6 h-6 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Qubits</p>
              <p className="text-2xl font-bold">{quantumResources.available}/{quantumResources.qubits}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600">Processing Power</p>
              <p className="text-2xl font-bold">{quantumResources.processingPower.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Accuracy</p>
              <p className="text-2xl font-bold">{quantumResources.accuracy.toFixed(2)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold">{optimizations.filter(o => o.status === 'running').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'optimizations', label: 'Quantum Optimizations', icon: Cpu },
          { id: 'simulations', label: 'Quantum Simulations', icon: Play },
          { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart3 }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm ${
              activeTab === id
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'optimizations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Optimization Types */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Start Optimization</h3>
            <div className="space-y-3">
              {[
                { type: 'pricing', label: 'Dynamic Pricing', description: 'Optimize rental prices using quantum algorithms' },
                { type: 'routing', label: 'Route Optimization', description: 'Find optimal delivery and pickup routes' },
                { type: 'scheduling', label: 'Schedule Optimization', description: 'Optimize equipment booking schedules' },
                { type: 'inventory', label: 'Inventory Management', description: 'Optimize stock levels and turnover' },
                { type: 'maintenance', label: 'Predictive Maintenance', description: 'Schedule maintenance using quantum predictions' }
              ].map(({ type, label, description }) => (
                <button
                  key={type}
                  onClick={() => startOptimization(type as QuantumOptimization['type'])}
                  className="w-full p-4 border rounded-lg text-left hover:bg-gray-50 transition-colors"
                >
                  <h4 className="font-medium">{label}</h4>
                  <p className="text-sm text-gray-600 mt-1">{description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Active Optimizations */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Optimization Jobs</h3>
            <div className="space-y-4">
              {optimizations.map(optimization => (
                <div key={optimization.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        optimization.status === 'running' ? 'bg-blue-500 animate-pulse' :
                        optimization.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <h4 className="font-medium capitalize">{optimization.type} Optimization</h4>
                        <p className="text-sm text-gray-600">
                          Started {optimization.startTime.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {optimization.status === 'completed' && (
                        <button
                          onClick={() => exportResults(optimization)}
                          className="p-2 text-gray-600 hover:text-gray-800"
                          title="Export Results"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setActiveOptimization(optimization)}
                        className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
                      >
                        View
                      </button>
                    </div>
                  </div>

                  {optimization.status === 'running' && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{Math.floor((Date.now() - optimization.startTime.getTime()) / 10000)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (Date.now() - optimization.startTime.getTime()) / 10000)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {optimization.status === 'completed' && optimization.results.improvement > 0 && (
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-green-600">+{optimization.results.improvement.toFixed(1)}% improvement</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4 text-blue-500" />
                        <span>{optimization.results.confidence.toFixed(1)}% confidence</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'simulations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {simulations.map(simulation => (
              <div key={simulation.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <Play className="w-6 h-6 mb-2" />
                  <h3 className="font-bold">{simulation.name}</h3>
                </div>

                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-4">{simulation.description}</p>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{simulation.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${simulation.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <button
                    onClick={() => startSimulation(simulation)}
                    disabled={simulation.status === 'running'}
                    className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
                  >
                    {simulation.status === 'running' ? 'Running...' : 'Start Simulation'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Active Simulation Details */}
          {activeSimulation && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">{activeSimulation.name}</h3>
                  <p className="text-sm text-gray-600">{activeSimulation.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    activeSimulation.status === 'running' ? 'bg-blue-500 animate-pulse' : 'bg-green-500'
                  }`}></div>
                  <span className="text-sm text-gray-600 capitalize">{activeSimulation.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Parameters</h4>
                  <div className="space-y-2">
                    {Object.entries(activeSimulation.parameters).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm text-gray-600 capitalize">{key.replace('_', ' ')}</span>
                        <span className="text-sm font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Simulation Progress</h4>
                  <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {activeSimulation.progress}%
                      </div>
                      <p className="text-sm text-gray-600">Complete</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Quantum Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Optimization Success Rate</span>
                <span className="font-bold text-green-600">94.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Improvement</span>
                <span className="font-bold text-blue-600">+17.3%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Processing Speed</span>
                <span className="font-bold text-purple-600">2.1x Faster</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cost Efficiency</span>
                <span className="font-bold text-green-600">68% Savings</span>
              </div>
            </div>
          </div>

          {/* Quantum Circuit Visualization */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Quantum Circuit</h3>
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
              <div className="text-center">
                <Cpu className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Quantum Circuit Visualization</p>
                <p className="text-sm text-gray-500 mt-1">Real-time quantum computation display</p>
              </div>
            </div>
          </div>

          {/* Recent Optimizations */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Optimization Results</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Improvement</th>
                    <th className="text-left py-2">Confidence</th>
                    <th className="text-left py-2">Execution Time</th>
                    <th className="text-left py-2">Qubits Used</th>
                  </tr>
                </thead>
                <tbody>
                  {optimizations.filter(o => o.status === 'completed').map(optimization => (
                    <tr key={optimization.id} className="border-b">
                      <td className="py-2 capitalize">{optimization.type}</td>
                      <td className="py-2 text-green-600">+{optimization.results.improvement.toFixed(1)}%</td>
                      <td className="py-2">{optimization.results.confidence.toFixed(1)}%</td>
                      <td className="py-2">{(optimization.executionTime / 1000).toFixed(1)}s</td>
                      <td className="py-2">{optimization.qubits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Active Optimization Details Modal */}
      {activeOptimization && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold capitalize">{activeOptimization.type} Optimization Results</h2>
                <button
                  onClick={() => setActiveOptimization(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-3">Optimization Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status</span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        activeOptimization.status === 'completed' ? 'bg-green-100 text-green-800' :
                        activeOptimization.status === 'running' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {activeOptimization.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Improvement</span>
                      <span className="font-medium text-green-600">
                        +{activeOptimization.results.improvement.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Confidence</span>
                      <span className="font-medium">{activeOptimization.results.confidence.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Qubits Used</span>
                      <span className="font-medium">{activeOptimization.qubits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Execution Time</span>
                      <span className="font-medium">{(activeOptimization.executionTime / 1000).toFixed(1)}s</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Constraints</h3>
                  <ul className="space-y-1">
                    {activeOptimization.results.constraints.map((constraint, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                        {constraint}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {activeOptimization.status === 'completed' && (
                <div>
                  <h3 className="font-semibold mb-3">Optimal Solution</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm text-gray-800">
                      {JSON.stringify(activeOptimization.results.optimalSolution, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}