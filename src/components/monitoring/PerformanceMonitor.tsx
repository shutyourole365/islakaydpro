import { useEffect, useState } from 'react';
import { Activity, Zap, Clock, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

interface PerformanceMonitorProps {
  onClose: () => void;
}

export default function PerformanceMonitor({ onClose }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Collect Web Vitals metrics
    const collectMetrics = () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        const fcp = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
        const lcp = 0; // Would need web-vitals library for accurate LCP
        const ttfb = navigation?.responseStart - navigation?.requestStart || 0;

        setMetrics({
          fcp,
          lcp,
          fid: 0, // Would need web-vitals library
          cls: 0, // Would need web-vitals library
          ttfb,
        });
        setIsLoading(false);
      }
    };

    // Wait for page to fully load
    if (document.readyState === 'complete') {
      collectMetrics();
    } else {
      window.addEventListener('load', collectMetrics);
      return () => window.removeEventListener('load', collectMetrics);
    }
  }, []);

  const getMetricStatus = (value: number, good: number, needsWork: number): 'good' | 'warning' | 'poor' => {
    if (value <= good) return 'good';
    if (value <= needsWork) return 'warning';
    return 'poor';
  };

  const metricConfigs = [
    { key: 'fcp', name: 'First Contentful Paint', good: 1800, needsWork: 3000, unit: 'ms', icon: Zap },
    { key: 'lcp', name: 'Largest Contentful Paint', good: 2500, needsWork: 4000, unit: 'ms', icon: TrendingUp },
    { key: 'fid', name: 'First Input Delay', good: 100, needsWork: 300, unit: 'ms', icon: Clock },
    { key: 'cls', name: 'Cumulative Layout Shift', good: 0.1, needsWork: 0.25, unit: '', icon: Activity },
    { key: 'ttfb', name: 'Time to First Byte', good: 800, needsWork: 1800, unit: 'ms', icon: Zap },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-violet-500 to-purple-500">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Performance Monitor</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {metricConfigs.map(({ key, name, good, needsWork, unit, icon: Icon }) => {
                  const value = metrics?.[key as keyof PerformanceMetrics] || 0;
                  const status = getMetricStatus(value, good, needsWork);
                  
                  return (
                    <div
                      key={key}
                      className={`p-4 rounded-xl border-2 ${
                        status === 'good'
                          ? 'border-green-200 bg-green-50'
                          : status === 'warning'
                          ? 'border-yellow-200 bg-yellow-50'
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-5 h-5 ${
                          status === 'good'
                            ? 'text-green-600'
                            : status === 'warning'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`} />
                        <h3 className="font-semibold text-gray-900 text-sm">{name}</h3>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-bold ${
                          status === 'good'
                            ? 'text-green-600'
                            : status === 'warning'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {value.toFixed(0)}
                        </span>
                        <span className="text-gray-500 text-sm">{unit}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        {status === 'good' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                        )}
                        <span className="text-xs text-gray-600">
                          Target: &lt;{good}{unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Web Vitals Score
                </h3>
                <p className="text-sm text-blue-700">
                  Core Web Vitals are metrics that measure real-world user experience.
                  Good scores lead to better SEO rankings and user satisfaction.
                </p>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {metricConfigs.filter(({ key }) => {
                        const value = metrics?.[key as keyof PerformanceMetrics] || 0;
                        return getMetricStatus(value, metricConfigs.find(c => c.key === key)!.good, metricConfigs.find(c => c.key === key)!.needsWork) === 'good';
                      }).length}
                    </div>
                    <div className="text-xs text-gray-600">Good</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {metricConfigs.filter(({ key }) => {
                        const value = metrics?.[key as keyof PerformanceMetrics] || 0;
                        return getMetricStatus(value, metricConfigs.find(c => c.key === key)!.good, metricConfigs.find(c => c.key === key)!.needsWork) === 'warning';
                      }).length}
                    </div>
                    <div className="text-xs text-gray-600">Needs Work</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {metricConfigs.filter(({ key }) => {
                        const value = metrics?.[key as keyof PerformanceMetrics] || 0;
                        return getMetricStatus(value, metricConfigs.find(c => c.key === key)!.good, metricConfigs.find(c => c.key === key)!.needsWork) === 'poor';
                      }).length}
                    </div>
                    <div className="text-xs text-gray-600">Poor</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  💡 For detailed analytics, check your deployment platform dashboard
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
