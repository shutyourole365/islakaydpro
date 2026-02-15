import { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Camera,
  FileText,
  Clock,
  Wrench,
  Shield,
  Car,
  Zap,
  Droplets,
  Gauge,
} from 'lucide-react';
import type { Equipment, InspectionReport } from '../../types';

interface EquipmentInspectionProps {
  equipment: Equipment;
  onInspectionComplete?: (report: InspectionReport) => void;
  className?: string;
}

interface InspectionItem {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: typeof CheckCircle;
  required: boolean;
  status: 'pending' | 'pass' | 'fail' | 'na';
  notes?: string;
  photos?: string[];
}

interface InspectionCategory {
  id: string;
  title: string;
  icon: typeof Shield;
  items: InspectionItem[];
}

export default function EquipmentInspection({
  equipment,
  onInspectionComplete,
  className = ''
}: EquipmentInspectionProps) {
  const [categories, setCategories] = useState<InspectionCategory[]>([]);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'pending' | 'pass' | 'fail'>('pending');

  useEffect(() => {
    // Initialize inspection checklist based on equipment type
    const initializeChecklist = () => {
      const baseCategories: InspectionCategory[] = [
        {
          id: 'safety',
          title: 'Safety & Security',
          icon: Shield,
          items: [
            {
              id: 'emergency-stop',
              category: 'safety',
              title: 'Emergency Stop Mechanism',
              description: 'Emergency stop button or switch is present and functional',
              icon: AlertTriangle,
              required: true,
              status: 'pending',
            },
            {
              id: 'safety-guards',
              category: 'safety',
              title: 'Safety Guards & Shields',
              description: 'All moving parts are properly guarded',
              icon: Shield,
              required: true,
              status: 'pending',
            },
            {
              id: 'warning-labels',
              category: 'safety',
              title: 'Warning Labels & Signs',
              description: 'Appropriate warning labels are present and legible',
              icon: AlertTriangle,
              required: true,
              status: 'pending',
            },
          ],
        },
        {
          id: 'mechanical',
          title: 'Mechanical Condition',
          icon: Wrench,
          items: [
            {
              id: 'engine-start',
              category: 'mechanical',
              title: 'Engine Starting System',
              description: 'Engine starts reliably without issues',
              icon: Zap,
              required: true,
              status: 'pending',
            },
            {
              id: 'fluids-check',
              category: 'mechanical',
              title: 'Fluid Levels',
              description: 'Oil, coolant, hydraulic fluids at proper levels',
              icon: Droplets,
              required: true,
              status: 'pending',
            },
            {
              id: 'belt-hoses',
              category: 'mechanical',
              title: 'Belts & Hoses',
              description: 'No visible cracks, wear, or leaks in belts and hoses',
              icon: Gauge,
              required: true,
              status: 'pending',
            },
            {
              id: 'controls-function',
              category: 'mechanical',
              title: 'Controls & Levers',
              description: 'All controls operate smoothly and correctly',
              icon: Wrench,
              required: true,
              status: 'pending',
            },
          ],
        },
        {
          id: 'structural',
          title: 'Structural Integrity',
          icon: Car,
          items: [
            {
              id: 'body-condition',
              category: 'structural',
              title: 'Body & Frame',
              description: 'No dents, cracks, or structural damage',
              icon: Car,
              required: true,
              status: 'pending',
            },
            {
              id: 'tires-wheels',
              category: 'structural',
              title: 'Tires & Wheels',
              description: 'Tires properly inflated, no damage to wheels',
              icon: Car,
              required: true,
              status: 'pending',
            },
            {
              id: 'attachments',
              category: 'structural',
              title: 'Attachments & Accessories',
              description: 'All attachments secure and functional',
              icon: Wrench,
              required: false,
              status: 'pending',
            },
          ],
        },
        {
          id: 'electrical',
          title: 'Electrical Systems',
          icon: Zap,
          items: [
            {
              id: 'lights-function',
              category: 'electrical',
              title: 'Lights & Signals',
              description: 'All lights, indicators, and signals working',
              icon: Zap,
              required: true,
              status: 'pending',
            },
            {
              id: 'battery-condition',
              category: 'electrical',
              title: 'Battery & Charging',
              description: 'Battery terminals clean, charging system functional',
              icon: Zap,
              required: true,
              status: 'pending',
            },
            {
              id: 'wiring-harness',
              category: 'electrical',
              title: 'Wiring & Connections',
              description: 'No exposed wires, loose connections, or corrosion',
              icon: Zap,
              required: false,
              status: 'pending',
            },
          ],
        },
        {
          id: 'documentation',
          title: 'Documentation & Records',
          icon: FileText,
          items: [
            {
              id: 'maintenance-records',
              category: 'documentation',
              title: 'Maintenance Records',
              description: 'Up-to-date maintenance and service records available',
              icon: FileText,
              required: true,
              status: 'pending',
            },
            {
              id: 'operating-manual',
              category: 'documentation',
              title: 'Operating Manual',
              description: 'Equipment operating manual present and accessible',
              icon: FileText,
              required: true,
              status: 'pending',
            },
            {
              id: 'inspection-history',
              category: 'documentation',
              title: 'Previous Inspections',
              description: 'Records of previous inspections and repairs',
              icon: Clock,
              required: false,
              status: 'pending',
            },
          ],
        },
      ];

      setCategories(baseCategories);
    };

    initializeChecklist();
  }, [equipment]);

  const updateItemStatus = (categoryId: string, itemId: string, status: InspectionItem['status'], notes?: string) => {
    setCategories(prev =>
      prev.map(category =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.map(item =>
                item.id === itemId
                  ? { ...item, status, notes }
                  : item
              ),
            }
          : category
      )
    );
  };

  const getCategoryStatus = (category: InspectionCategory) => {
    const items = category.items;
    const passed = items.filter(item => item.status === 'pass').length;
    const failed = items.filter(item => item.status === 'fail').length;
    const pending = items.filter(item => item.status === 'pending').length;

    if (pending > 0) return 'pending';
    if (failed > 0) return 'fail';
    if (passed === items.length) return 'pass';
    return 'pending';
  };

  const getOverallProgress = () => {
    const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
    const completedItems = categories.reduce((sum, cat) =>
      sum + cat.items.filter(item => item.status !== 'pending').length, 0
    );
    return Math.round((completedItems / totalItems) * 100);
  };

  const canSubmitInspection = () => {
    return categories.every(category =>
      category.items.every(item =>
        !item.required || (item.status === 'pass' || item.status === 'fail' || item.status === 'na')
      )
    );
  };

  const handleSubmitInspection = async () => {
    if (!canSubmitInspection()) return;

    setIsSubmitting(true);

    try {
      // Calculate overall status
      const hasFailures = categories.some(category =>
        category.items.some(item => item.status === 'fail')
      );
      const overallStatus = hasFailures ? 'fail' : 'pass';

      const report: InspectionReport = {
        id: `inspection-${Date.now()}`,
        equipment_id: equipment.id,
        inspector_id: 'current-user', // Would be actual user ID
        inspection_date: new Date().toISOString(),
        status: overallStatus,
        categories: categories.map(category => ({
          id: category.id,
          title: category.title,
          status: getCategoryStatus(category),
          items: category.items.map(item => ({
            id: item.id,
            title: item.title,
            status: item.status,
            notes: item.notes,
            photos: item.photos,
          })),
        })),
        notes: '',
        next_inspection_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
      };

      onInspectionComplete?.(report);
      setOverallStatus(overallStatus);

      // Show success message
      alert(`Inspection completed with status: ${overallStatus.toUpperCase()}`);

    } catch (error) {
      console.error('Failed to submit inspection:', error);
      alert('Failed to submit inspection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = getOverallProgress();
  const currentCategoryData = categories[currentCategory];

  return (
    <div className={className}>
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Equipment Inspection</h2>
            <p className="text-gray-600">{equipment.name} - Pre-rental Safety Check</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{progress}%</div>
            <div className="text-sm text-gray-600">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Category Navigation */}
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const status = getCategoryStatus(category);
            return (
              <button
                key={category.id}
                onClick={() => setCurrentCategory(index)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  index === currentCategory
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.title}
                <span className={`ml-2 w-2 h-2 rounded-full ${
                  status === 'pass' ? 'bg-green-500' :
                  status === 'fail' ? 'bg-red-500' :
                  'bg-gray-400'
                }`}></span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Category Inspection */}
      {currentCategoryData && (
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <currentCategoryData.icon className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{currentCategoryData.title}</h3>
                <p className="text-sm text-gray-600">
                  {currentCategoryData.items.filter(item => item.status !== 'pending').length} of {currentCategoryData.items.length} items checked
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {currentCategoryData.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <Icon className={`w-6 h-6 ${
                          item.status === 'pass' ? 'text-green-600' :
                          item.status === 'fail' ? 'text-red-600' :
                          'text-gray-400'
                        }`} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900">{item.title}</h4>
                          {item.required && (
                            <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
                              Required
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-4">{item.description}</p>

                        {/* Status Buttons */}
                        <div className="flex items-center gap-2 mb-4">
                          <button
                            onClick={() => updateItemStatus(item.category, item.id, 'pass')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              item.status === 'pass'
                                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700'
                            }`}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Pass
                          </button>

                          <button
                            onClick={() => updateItemStatus(item.category, item.id, 'fail')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              item.status === 'fail'
                                ? 'bg-red-100 text-red-700 border-2 border-red-300'
                                : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700'
                            }`}
                          >
                            <XCircle className="w-4 h-4" />
                            Fail
                          </button>

                          {!item.required && (
                            <button
                              onClick={() => updateItemStatus(item.category, item.id, 'na')}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                item.status === 'na'
                                  ? 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              N/A
                            </button>
                          )}
                        </div>

                        {/* Notes */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes (Optional)
                          </label>
                          <textarea
                            value={item.notes || ''}
                            onChange={(e) => updateItemStatus(item.category, item.id, item.status, e.target.value)}
                            placeholder="Add any observations or notes..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={2}
                          />
                        </div>

                        {/* Photo Upload */}
                        <div>
                          <button className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                            <Camera className="w-4 h-4" />
                            Add Photo
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Navigation & Submit */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setCurrentCategory(Math.max(0, currentCategory - 1))}
          disabled={currentCategory === 0}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {currentCategory + 1} of {categories.length}
          </span>

          {currentCategory < categories.length - 1 ? (
            <button
              onClick={() => setCurrentCategory(currentCategory + 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmitInspection}
              disabled={!canSubmitInspection() || isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? 'Submitting...' : 'Complete Inspection'}
            </button>
          )}
        </div>
      </div>

      {/* Overall Status */}
      {overallStatus !== 'pending' && (
        <div className={`mt-6 p-4 rounded-lg ${
          overallStatus === 'pass'
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {overallStatus === 'pass' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <span className={`font-medium ${
              overallStatus === 'pass' ? 'text-green-800' : 'text-red-800'
            }`}>
              Inspection {overallStatus === 'pass' ? 'Passed' : 'Failed'}
            </span>
          </div>
          <p className={`text-sm mt-1 ${
            overallStatus === 'pass' ? 'text-green-700' : 'text-red-700'
          }`}>
            {overallStatus === 'pass'
              ? 'Equipment is safe for rental. All required checks passed.'
              : 'Equipment requires attention before rental. Please address failed items.'
            }
          </p>
        </div>
      )}
    </div>
  );
}