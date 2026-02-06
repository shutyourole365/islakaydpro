import { useState, useMemo } from 'react';
import {
  Leaf,
  TreeDeciduous,
  Droplets,
  Factory,
  TrendingDown,
  BarChart3,
  Share2,
  Download,
  ChevronDown,
  Award,
  Car,
  Battery,
  Sun,
  Wind,
  Recycle,
  Target,
  Sparkles,
} from 'lucide-react';

interface CarbonData {
  co2Emissions: number; // kg CO2
  fuelUsed: number; // liters
  hoursOperated: number;
  distanceTraveled?: number; // km
  equipmentType: string;
}

interface CarbonSavings {
  vsOwnership: number;
  vsOlderModel: number;
  fromSharedUse: number;
  total: number;
}

interface ImpactEquivalent {
  icon: typeof TreeDeciduous;
  label: string;
  value: string;
  description: string;
}

interface RentalCarbonData {
  bookingId: string;
  equipmentName: string;
  startDate: Date;
  endDate: Date;
  carbonData: CarbonData;
  savings: CarbonSavings;
}

interface CarbonFootprintCalculatorProps {
  rentals?: RentalCarbonData[];
  equipmentType?: string;
  estimatedHours?: number;
  onCalculate?: (result: CarbonData) => void;
  className?: string;
}

// Emission factors (kg CO2 per unit)
const emissionFactors: Record<string, { perHour: number; perLiter: number; name: string }> = {
  excavator: { perHour: 25, perLiter: 2.68, name: 'Excavator' },
  bulldozer: { perHour: 35, perLiter: 2.68, name: 'Bulldozer' },
  crane: { perHour: 20, perLiter: 2.68, name: 'Crane' },
  loader: { perHour: 18, perLiter: 2.68, name: 'Loader' },
  forklift: { perHour: 8, perLiter: 2.68, name: 'Forklift' },
  generator: { perHour: 15, perLiter: 2.68, name: 'Generator' },
  compressor: { perHour: 5, perLiter: 2.68, name: 'Compressor' },
  truck: { perHour: 12, perLiter: 2.68, name: 'Truck' },
  concrete_mixer: { perHour: 10, perLiter: 2.68, name: 'Concrete Mixer' },
  default: { perHour: 15, perLiter: 2.68, name: 'Equipment' },
};

// Demo rental history
const demoRentals: RentalCarbonData[] = [
  {
    bookingId: 'BK-001',
    equipmentName: 'CAT 320 Excavator',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    carbonData: {
      co2Emissions: 875,
      fuelUsed: 326,
      hoursOperated: 35,
      equipmentType: 'excavator',
    },
    savings: {
      vsOwnership: 150,
      vsOlderModel: 220,
      fromSharedUse: 95,
      total: 465,
    },
  },
  {
    bookingId: 'BK-002',
    equipmentName: 'Komatsu D65 Bulldozer',
    startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    carbonData: {
      co2Emissions: 525,
      fuelUsed: 196,
      hoursOperated: 15,
      equipmentType: 'bulldozer',
    },
    savings: {
      vsOwnership: 85,
      vsOlderModel: 130,
      fromSharedUse: 55,
      total: 270,
    },
  },
  {
    bookingId: 'BK-003',
    equipmentName: 'Toyota 8FGU25 Forklift',
    startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
    carbonData: {
      co2Emissions: 160,
      fuelUsed: 60,
      hoursOperated: 20,
      equipmentType: 'forklift',
    },
    savings: {
      vsOwnership: 40,
      vsOlderModel: 55,
      fromSharedUse: 30,
      total: 125,
    },
  },
];

export default function CarbonFootprintCalculator({
  rentals = demoRentals,
  equipmentType,
  estimatedHours,
  onCalculate,
  className = '',
}: CarbonFootprintCalculatorProps) {
  const [selectedEquipment, setSelectedEquipment] = useState(equipmentType || 'excavator');
  const [hours, setHours] = useState(estimatedHours || 8);
  const [showCalculator, setShowCalculator] = useState(!rentals.length);
  const [activeView, setActiveView] = useState<'overview' | 'history' | 'tips'>('overview');

  // Calculate totals
  const totals = useMemo(() => {
    return rentals.reduce(
      (acc, rental) => ({
        co2Emissions: acc.co2Emissions + rental.carbonData.co2Emissions,
        fuelUsed: acc.fuelUsed + rental.carbonData.fuelUsed,
        hoursOperated: acc.hoursOperated + rental.carbonData.hoursOperated,
        totalSavings: acc.totalSavings + rental.savings.total,
      }),
      { co2Emissions: 0, fuelUsed: 0, hoursOperated: 0, totalSavings: 0 }
    );
  }, [rentals]);

  // Calculate estimate for new rental
  const estimate = useMemo(() => {
    const factor = emissionFactors[selectedEquipment] || emissionFactors.default;
    const co2 = factor.perHour * hours;
    const fuel = co2 / factor.perLiter;
    return {
      co2Emissions: Math.round(co2),
      fuelUsed: Math.round(fuel),
      hoursOperated: hours,
      equipmentType: selectedEquipment,
    };
  }, [selectedEquipment, hours]);

  // Impact equivalents
  const getImpactEquivalents = (co2Kg: number): ImpactEquivalent[] => {
    return [
      {
        icon: TreeDeciduous,
        label: 'Trees needed to offset',
        value: Math.round(co2Kg / 21).toString(),
        description: 'Trees needed to absorb CO2 in one year',
      },
      {
        icon: Car,
        label: 'Equivalent car miles',
        value: Math.round(co2Kg / 0.404).toLocaleString(),
        description: 'Miles driven in an average car',
      },
      {
        icon: Droplets,
        label: 'Gallons of gasoline',
        value: Math.round(co2Kg / 8.887).toString(),
        description: 'Equivalent gasoline burned',
      },
      {
        icon: Battery,
        label: 'Smartphone charges',
        value: Math.round(co2Kg * 121).toLocaleString(),
        description: 'Full smartphone battery charges',
      },
    ];
  };

  const ecoTips = [
    {
      icon: Sun,
      title: 'Choose newer equipment',
      description: 'Newer models are up to 25% more fuel efficient',
    },
    {
      icon: Target,
      title: 'Plan efficient routes',
      description: 'Reduce transport emissions by optimizing delivery',
    },
    {
      icon: Recycle,
      title: 'Rent instead of own',
      description: 'Sharing equipment reduces total manufacturing impact',
    },
    {
      icon: Battery,
      title: 'Consider electric options',
      description: 'Electric equipment produces zero direct emissions',
    },
    {
      icon: Wind,
      title: 'Regular maintenance',
      description: 'Well-maintained equipment runs more efficiently',
    },
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Carbon Footprint</h2>
              <p className="text-white/70 text-sm">Track your environmental impact</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Factory className="w-4 h-4" />
              <span className="text-xs uppercase">Total CO2</span>
            </div>
            <p className="text-2xl font-bold">{totals.co2Emissions.toLocaleString()} kg</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-green-300" />
              <span className="text-xs uppercase">Saved</span>
            </div>
            <p className="text-2xl font-bold text-green-300">
              {totals.totalSavings.toLocaleString()} kg
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TreeDeciduous className="w-4 h-4" />
              <span className="text-xs uppercase">Trees to Offset</span>
            </div>
            <p className="text-2xl font-bold">
              {Math.round(totals.co2Emissions / 21)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b dark:border-gray-700">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'history', label: 'History', icon: Factory },
          { id: 'tips', label: 'Eco Tips', icon: Leaf },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as typeof activeView)}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeView === tab.id
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 dark:text-gray-400'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-medium text-sm">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* Impact Equivalents */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Your Impact Explained
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {getImpactEquivalents(totals.co2Emissions).map((item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <item.icon className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {item.label}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {item.value}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Savings Breakdown */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  Your Carbon Savings
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-green-700 dark:text-green-300">
                    vs. Equipment Ownership
                  </span>
                  <span className="font-medium text-green-900 dark:text-green-100">
                    {rentals.reduce((sum, r) => sum + r.savings.vsOwnership, 0)} kg CO2
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-700 dark:text-green-300">
                    vs. Older Equipment
                  </span>
                  <span className="font-medium text-green-900 dark:text-green-100">
                    {rentals.reduce((sum, r) => sum + r.savings.vsOlderModel, 0)} kg CO2
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-700 dark:text-green-300">
                    From Shared Use
                  </span>
                  <span className="font-medium text-green-900 dark:text-green-100">
                    {rentals.reduce((sum, r) => sum + r.savings.fromSharedUse, 0)} kg CO2
                  </span>
                </div>
                <div className="pt-3 border-t border-green-200 dark:border-green-800 flex justify-between items-center">
                  <span className="font-semibold text-green-900 dark:text-green-100">
                    Total Savings
                  </span>
                  <span className="font-bold text-xl text-green-600">
                    {totals.totalSavings} kg CO2
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Calculator */}
            <div>
              <button
                onClick={() => setShowCalculator(!showCalculator)}
                className="w-full flex items-center justify-between py-3 text-gray-600 dark:text-gray-400"
              >
                <span className="font-medium">Estimate New Rental</span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${showCalculator ? 'rotate-180' : ''}`}
                />
              </button>

              {showCalculator && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-4">
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Equipment Type
                    </label>
                    <select
                      value={selectedEquipment}
                      onChange={(e) => setSelectedEquipment(e.target.value)}
                      className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                    >
                      {Object.entries(emissionFactors).map(([key, value]) => (
                        key !== 'default' && (
                          <option key={key} value={key}>
                            {value.name}
                          </option>
                        )
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Estimated Hours of Use: {hours}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={hours}
                      onChange={(e) => setHours(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>1 hour</span>
                      <span>100 hours</span>
                    </div>
                  </div>

                  {/* Estimate Result */}
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Estimated Emissions
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {estimate.co2Emissions} kg CO2
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      ~{estimate.fuelUsed} liters of fuel
                    </p>
                  </div>

                  <button
                    onClick={() => onCalculate?.(estimate)}
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                  >
                    Use This Estimate
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeView === 'history' && (
          <div className="space-y-4">
            {rentals.map((rental) => (
              <div
                key={rental.bookingId}
                className="p-4 border dark:border-gray-700 rounded-xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {rental.equipmentName}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {rental.startDate.toLocaleDateString()} -{' '}
                      {rental.endDate.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {rental.carbonData.co2Emissions} kg
                    </p>
                    <p className="text-sm text-green-600">
                      -{rental.savings.total} kg saved
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Hours</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {rental.carbonData.hoursOperated}
                    </p>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Fuel</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {rental.carbonData.fuelUsed}L
                    </p>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">kg/hr</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {Math.round(rental.carbonData.co2Emissions / rental.carbonData.hoursOperated)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {rentals.length === 0 && (
              <div className="text-center py-8">
                <Leaf className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  No rental history yet
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tips Tab */}
        {activeView === 'tips' && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  Eco-Friendly Renting
                </h3>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                By renting equipment instead of owning, you're already making an eco-conscious
                choice. Here are more ways to reduce your impact:
              </p>
            </div>

            {ecoTips.map((tip, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 border dark:border-gray-700 rounded-xl"
              >
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <tip.icon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {tip.title}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {tip.description}
                  </p>
                </div>
              </div>
            ))}

            {/* Carbon Offset CTA */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <TreeDeciduous className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Offset Your Carbon
                </h3>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                Want to go carbon neutral? Offset your {totals.co2Emissions} kg CO2 emissions by
                supporting verified reforestation projects.
              </p>
              <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                Learn About Carbon Offsets
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
