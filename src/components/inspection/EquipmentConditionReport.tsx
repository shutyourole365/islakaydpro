import { useState } from 'react';
import {
  ClipboardCheck,
  Camera,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronRight,
  ChevronDown,
  Trash2,
  Save,
  Clock,
  FileText,
  Gauge,
  Droplets,
  Wrench,
  Shield,
  Eye,
  Download,
  Share2,
  PenLine,
} from 'lucide-react';

type ConditionRating = 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
type ReportType = 'pre_rental' | 'post_rental' | 'maintenance' | 'inspection';

interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  condition: ConditionRating | null;
  notes: string;
  photos: string[];
  required: boolean;
}

interface ConditionReport {
  id: string;
  type: ReportType;
  equipmentId: string;
  equipmentName: string;
  bookingId?: string;
  inspectorId: string;
  inspectorName: string;
  date: Date;
  mileage?: number;
  fuelLevel?: number;
  hoursUsed?: number;
  overallCondition: ConditionRating | null;
  checklist: ChecklistItem[];
  generalNotes: string;
  signatures: {
    inspector?: string;
    renter?: string;
    owner?: string;
  };
  status: 'draft' | 'pending_signature' | 'completed';
}

interface EquipmentConditionReportProps {
  equipmentId: string;
  equipmentName: string;
  bookingId?: string;
  reportType: ReportType;
  previousReport?: ConditionReport;
  onSubmit: (report: ConditionReport) => void;
  onSaveDraft?: (report: ConditionReport) => void;
  className?: string;
}

const conditionOptions: { value: ConditionRating; label: string; color: string; icon: typeof CheckCircle }[] = [
  { value: 'excellent', label: 'Excellent', color: 'text-green-600 bg-green-100', icon: CheckCircle },
  { value: 'good', label: 'Good', color: 'text-blue-600 bg-blue-100', icon: CheckCircle },
  { value: 'fair', label: 'Fair', color: 'text-amber-600 bg-amber-100', icon: AlertTriangle },
  { value: 'poor', label: 'Poor', color: 'text-orange-600 bg-orange-100', icon: AlertTriangle },
  { value: 'damaged', label: 'Damaged', color: 'text-red-600 bg-red-100', icon: XCircle },
];

const defaultChecklist: Omit<ChecklistItem, 'condition' | 'notes' | 'photos'>[] = [
  { id: '1', category: 'Exterior', item: 'Body/Frame Condition', required: true },
  { id: '2', category: 'Exterior', item: 'Paint Condition', required: false },
  { id: '3', category: 'Exterior', item: 'Tires/Tracks Condition', required: true },
  { id: '4', category: 'Exterior', item: 'Lights & Signals', required: true },
  { id: '5', category: 'Exterior', item: 'Mirrors & Glass', required: true },
  { id: '6', category: 'Controls', item: 'Steering/Controls', required: true },
  { id: '7', category: 'Controls', item: 'Brakes', required: true },
  { id: '8', category: 'Controls', item: 'Instruments & Gauges', required: true },
  { id: '9', category: 'Controls', item: 'Safety Switches', required: true },
  { id: '10', category: 'Engine', item: 'Engine Operation', required: true },
  { id: '11', category: 'Engine', item: 'Fluid Levels', required: true },
  { id: '12', category: 'Engine', item: 'Leaks (Oil/Hydraulic)', required: true },
  { id: '13', category: 'Hydraulics', item: 'Hydraulic System', required: true },
  { id: '14', category: 'Hydraulics', item: 'Cylinders & Hoses', required: true },
  { id: '15', category: 'Safety', item: 'Safety Equipment', required: true },
  { id: '16', category: 'Safety', item: 'Emergency Shutoff', required: true },
  { id: '17', category: 'Accessories', item: 'Attachments/Tools', required: false },
  { id: '18', category: 'Accessories', item: 'Manuals/Documentation', required: false },
];

export default function EquipmentConditionReport({
  equipmentId,
  equipmentName,
  bookingId,
  reportType,
  previousReport,
  onSubmit,
  onSaveDraft,
  className = '',
}: EquipmentConditionReportProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    defaultChecklist.map(item => ({
      ...item,
      condition: null,
      notes: '',
      photos: [],
    }))
  );
  const [generalNotes, setGeneralNotes] = useState('');
  const [mileage, setMileage] = useState<number | undefined>();
  const [fuelLevel, setFuelLevel] = useState<number>(100);
  const [hoursUsed, setHoursUsed] = useState<number | undefined>();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Exterior']));
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showSignature, setShowSignature] = useState(false);

  const categories = [...new Set(checklist.map(item => item.category))];

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const updateItemCondition = (itemId: string, condition: ConditionRating) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, condition } : item
      )
    );
  };

  const updateItemNotes = (itemId: string, notes: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, notes } : item
      )
    );
  };

  const addPhoto = (itemId: string, photoUrl: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, photos: [...item.photos, photoUrl] }
          : item
      )
    );
  };

  const removePhoto = (itemId: string, photoIndex: number) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, photos: item.photos.filter((_, i) => i !== photoIndex) }
          : item
      )
    );
  };

  const getCompletionStats = () => {
    const required = checklist.filter(item => item.required);
    const completed = required.filter(item => item.condition !== null);
    return { completed: completed.length, total: required.length };
  };

  const calculateOverallCondition = (): ConditionRating | null => {
    const rated = checklist.filter(item => item.condition !== null);
    if (rated.length === 0) return null;

    const scores = { excellent: 5, good: 4, fair: 3, poor: 2, damaged: 1 };
    const avgScore =
      rated.reduce((sum, item) => sum + scores[item.condition!], 0) / rated.length;

    if (avgScore >= 4.5) return 'excellent';
    if (avgScore >= 3.5) return 'good';
    if (avgScore >= 2.5) return 'fair';
    if (avgScore >= 1.5) return 'poor';
    return 'damaged';
  };

  const stats = getCompletionStats();
  const overallCondition = calculateOverallCondition();
  const conditionInfo = overallCondition
    ? conditionOptions.find(c => c.value === overallCondition)
    : null;

  const handleSubmit = () => {
    const report: ConditionReport = {
      id: `RPT-${Date.now()}`,
      type: reportType,
      equipmentId,
      equipmentName,
      bookingId,
      inspectorId: 'current-user',
      inspectorName: 'Current User',
      date: new Date(),
      mileage,
      fuelLevel,
      hoursUsed,
      overallCondition,
      checklist,
      generalNotes,
      signatures: {},
      status: 'pending_signature',
    };
    onSubmit(report);
  };

  const handleSaveDraft = () => {
    const report: ConditionReport = {
      id: `RPT-DRAFT-${Date.now()}`,
      type: reportType,
      equipmentId,
      equipmentName,
      bookingId,
      inspectorId: 'current-user',
      inspectorName: 'Current User',
      date: new Date(),
      mileage,
      fuelLevel,
      hoursUsed,
      overallCondition,
      checklist,
      generalNotes,
      signatures: {},
      status: 'draft',
    };
    onSaveDraft?.(report);
  };

  const reportTypeLabels = {
    pre_rental: 'Pre-Rental Inspection',
    post_rental: 'Post-Rental Inspection',
    maintenance: 'Maintenance Check',
    inspection: 'General Inspection',
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {reportTypeLabels[reportType]}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {equipmentName}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Download className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Inspection Progress
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {stats.completed}/{stats.total} required items
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(stats.completed / stats.total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Overall Condition Badge */}
      {overallCondition && conditionInfo && (
        <div className={`mx-6 mt-4 p-4 rounded-xl ${conditionInfo.color.split(' ')[1]}`}>
          <div className="flex items-center gap-3">
            <conditionInfo.icon className={`w-6 h-6 ${conditionInfo.color.split(' ')[0]}`} />
            <div>
              <p className={`font-semibold ${conditionInfo.color.split(' ')[0]}`}>
                Overall Condition: {conditionInfo.label}
              </p>
              <p className="text-sm opacity-80">
                Based on {checklist.filter(i => i.condition).length} inspected items
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Equipment Metrics */}
      <div className="p-6 border-b dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Equipment Metrics
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
              <Gauge className="w-4 h-4 inline mr-1" />
              Mileage/Odometer
            </label>
            <input
              type="number"
              value={mileage || ''}
              onChange={(e) => setMileage(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Enter reading"
              className="w-full p-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
              <Droplets className="w-4 h-4 inline mr-1" />
              Fuel Level
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={fuelLevel}
                onChange={(e) => setFuelLevel(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                {fuelLevel}%
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
              <Clock className="w-4 h-4 inline mr-1" />
              Hours Used
            </label>
            <input
              type="number"
              value={hoursUsed || ''}
              onChange={(e) => setHoursUsed(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Enter hours"
              className="w-full p-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Previous Report Comparison */}
      {previousReport && (
        <div className="mx-6 mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900 dark:text-blue-100">
              Previous Report Available
            </span>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Compare with {reportTypeLabels[previousReport.type]} from{' '}
            {previousReport.date.toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Checklist */}
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Inspection Checklist
        </h3>
        <div className="space-y-4">
          {categories.map(category => {
            const categoryItems = checklist.filter(item => item.category === category);
            const isExpanded = expandedCategories.has(category);
            const completedInCategory = categoryItems.filter(i => i.condition !== null).length;

            return (
              <div
                key={category}
                className="border dark:border-gray-700 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center gap-3">
                    {category === 'Exterior' && <Eye className="w-5 h-5 text-gray-500" />}
                    {category === 'Controls' && <Wrench className="w-5 h-5 text-gray-500" />}
                    {category === 'Engine' && <Gauge className="w-5 h-5 text-gray-500" />}
                    {category === 'Hydraulics' && <Droplets className="w-5 h-5 text-gray-500" />}
                    {category === 'Safety' && <Shield className="w-5 h-5 text-gray-500" />}
                    {category === 'Accessories' && <FileText className="w-5 h-5 text-gray-500" />}
                    <span className="font-medium text-gray-900 dark:text-white">{category}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({completedInCategory}/{categoryItems.length})
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-4 space-y-4">
                    {categoryItems.map(item => {
                      const isSelected = selectedItem === item.id;
                      const currentCondition = conditionOptions.find(
                        c => c.value === item.condition
                      );

                      return (
                        <div
                          key={item.id}
                          className={`border dark:border-gray-700 rounded-lg overflow-hidden ${
                            isSelected ? 'ring-2 ring-blue-500' : ''
                          }`}
                        >
                          <div
                            onClick={() => setSelectedItem(isSelected ? null : item.id)}
                            className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          >
                            <div className="flex items-center gap-3">
                              {item.condition && currentCondition ? (
                                <currentCondition.icon
                                  className={`w-5 h-5 ${currentCondition.color.split(' ')[0]}`}
                                />
                              ) : (
                                <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full" />
                              )}
                              <span className="text-gray-900 dark:text-white">
                                {item.item}
                                {item.required && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </span>
                            </div>
                            {item.condition && currentCondition && (
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${currentCondition.color}`}
                              >
                                {currentCondition.label}
                              </span>
                            )}
                          </div>

                          {isSelected && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/30 border-t dark:border-gray-700">
                              {/* Condition Buttons */}
                              <div className="flex flex-wrap gap-2 mb-4">
                                {conditionOptions.map(option => (
                                  <button
                                    key={option.value}
                                    onClick={() => updateItemCondition(item.id, option.value)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                      item.condition === option.value
                                        ? option.color
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>

                              {/* Notes */}
                              <textarea
                                value={item.notes}
                                onChange={(e) => updateItemNotes(item.id, e.target.value)}
                                placeholder="Add notes about this item..."
                                className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white mb-3"
                                rows={2}
                              />

                              {/* Photos */}
                              <div className="flex flex-wrap gap-2">
                                {item.photos.map((photo, index) => (
                                  <div key={index} className="relative group">
                                    <img
                                      src={photo}
                                      alt={`Photo ${index + 1}`}
                                      className="w-16 h-16 object-cover rounded-lg"
                                    />
                                    <button
                                      onClick={() => removePhoto(item.id, index)}
                                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={() => {
                                    // Simulate photo capture
                                    addPhoto(
                                      item.id,
                                      `https://images.unsplash.com/photo-1580901368919-7738efb0f87e?w=100&t=${Date.now()}`
                                    );
                                  }}
                                  className="w-16 h-16 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500"
                                >
                                  <Camera className="w-6 h-6" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* General Notes */}
      <div className="px-6 pb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          General Notes
        </h3>
        <textarea
          value={generalNotes}
          onChange={(e) => setGeneralNotes(e.target.value)}
          placeholder="Add any additional observations or notes about the equipment..."
          className="w-full p-4 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 dark:text-white"
          rows={4}
        />
      </div>

      {/* Actions */}
      <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-700">
        <div className="flex gap-3">
          {onSaveDraft && (
            <button
              onClick={handleSaveDraft}
              className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Draft
            </button>
          )}
          <button
            onClick={() => setShowSignature(true)}
            disabled={stats.completed < stats.total}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <PenLine className="w-5 h-5" />
            Sign & Submit
          </button>
        </div>
        {stats.completed < stats.total && (
          <p className="text-sm text-amber-600 text-center mt-3">
            Please complete all required items ({stats.total - stats.completed} remaining)
          </p>
        )}
      </div>

      {/* Signature Modal */}
      {showSignature && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Sign Report
            </h3>
            <div className="h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center mb-4">
              <p className="text-gray-400">Draw signature here</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSignature(false)}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSignature(false);
                  handleSubmit();
                }}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
