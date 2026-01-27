import { useState, useEffect } from 'react';
import {
  Package,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Wrench,
  BarChart3,
  Filter,
  Search,
  Plus,
  MoreVertical,
  Eye,
  Edit3,
  Trash2,
  PauseCircle,
  PlayCircle,
  Settings,
  Download,
  RefreshCw,
} from 'lucide-react';

interface FleetManagerProps {
  ownerId: string;
  onClose?: () => void;
}

interface FleetEquipment {
  id: string;
  title: string;
  category: string;
  status: 'available' | 'rented' | 'maintenance' | 'inactive';
  location: string;
  dailyRate: number;
  totalEarnings: number;
  bookingsThisMonth: number;
  utilizationRate: number;
  nextBooking?: {
    date: Date;
    renter: string;
  };
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  condition: 'excellent' | 'good' | 'fair' | 'needs_attention';
  imageUrl: string;
}

interface FleetStats {
  totalEquipment: number;
  activeListings: number;
  currentlyRented: number;
  inMaintenance: number;
  totalRevenue: number;
  revenueGrowth: number;
  averageUtilization: number;
  upcomingBookings: number;
  alerts: FleetAlert[];
}

interface FleetAlert {
  id: string;
  type: 'maintenance' | 'booking' | 'performance' | 'urgent';
  message: string;
  equipmentId: string;
  equipmentTitle: string;
  date: Date;
}

export default function FleetManager({ ownerId, onClose }: FleetManagerProps) {
  const [equipment, setEquipment] = useState<FleetEquipment[]>([]);
  const [stats, setStats] = useState<FleetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'rented' | 'maintenance'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<FleetEquipment | null>(null);
  const [showActions, setShowActions] = useState<string | null>(null);

  useEffect(() => {
    loadFleetData();
  }, [ownerId]);

  const loadFleetData = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockEquipment: FleetEquipment[] = [
      {
        id: '1',
        title: 'CAT 320 Excavator',
        category: 'Heavy Equipment',
        status: 'rented',
        location: 'Los Angeles, CA',
        dailyRate: 450,
        totalEarnings: 12500,
        bookingsThisMonth: 4,
        utilizationRate: 85,
        nextBooking: { date: new Date('2026-02-01'), renter: 'ABC Construction' },
        lastMaintenance: new Date('2026-01-15'),
        nextMaintenance: new Date('2026-02-15'),
        condition: 'excellent',
        imageUrl: 'https://images.pexels.com/photos/2058128/pexels-photo-2058128.jpeg',
      },
      {
        id: '2',
        title: 'Sony A7IV Camera Kit',
        category: 'Photography',
        status: 'available',
        location: 'San Francisco, CA',
        dailyRate: 125,
        totalEarnings: 4200,
        bookingsThisMonth: 8,
        utilizationRate: 72,
        lastMaintenance: new Date('2026-01-20'),
        condition: 'excellent',
        imageUrl: 'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg',
      },
      {
        id: '3',
        title: 'DeWalt Power Tool Set',
        category: 'Power Tools',
        status: 'maintenance',
        location: 'Austin, TX',
        dailyRate: 75,
        totalEarnings: 2800,
        bookingsThisMonth: 6,
        utilizationRate: 65,
        lastMaintenance: new Date('2026-01-25'),
        nextMaintenance: new Date('2026-01-28'),
        condition: 'needs_attention',
        imageUrl: 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg',
      },
      {
        id: '4',
        title: 'DJ Equipment Package',
        category: 'Audio',
        status: 'rented',
        location: 'Miami, FL',
        dailyRate: 295,
        totalEarnings: 8900,
        bookingsThisMonth: 5,
        utilizationRate: 78,
        nextBooking: { date: new Date('2026-02-03'), renter: 'Party Planners Inc' },
        condition: 'good',
        imageUrl: 'https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg',
      },
      {
        id: '5',
        title: 'John Deere Tractor',
        category: 'Landscaping',
        status: 'available',
        location: 'Denver, CO',
        dailyRate: 225,
        totalEarnings: 5600,
        bookingsThisMonth: 3,
        utilizationRate: 55,
        nextMaintenance: new Date('2026-02-10'),
        condition: 'good',
        imageUrl: 'https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg',
      },
    ];

    const mockStats: FleetStats = {
      totalEquipment: 5,
      activeListings: 4,
      currentlyRented: 2,
      inMaintenance: 1,
      totalRevenue: 34000,
      revenueGrowth: 23,
      averageUtilization: 71,
      upcomingBookings: 8,
      alerts: [
        { id: 'a1', type: 'maintenance', message: 'Maintenance due soon', equipmentId: '3', equipmentTitle: 'DeWalt Power Tool Set', date: new Date('2026-01-28') },
        { id: 'a2', type: 'booking', message: 'New booking request', equipmentId: '2', equipmentTitle: 'Sony A7IV Camera Kit', date: new Date() },
        { id: 'a3', type: 'performance', message: 'Low utilization - consider price adjustment', equipmentId: '5', equipmentTitle: 'John Deere Tractor', date: new Date() },
      ],
    };

    setEquipment(mockEquipment);
    setStats(mockStats);
    setLoading(false);
  };

  const getStatusColor = (status: FleetEquipment['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700';
      case 'rented': return 'bg-blue-100 text-blue-700';
      case 'maintenance': return 'bg-amber-100 text-amber-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
    }
  };

  const getConditionColor = (condition: FleetEquipment['condition']) => {
    switch (condition) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-amber-600';
      case 'needs_attention': return 'text-red-600';
    }
  };

  const filteredEquipment = equipment.filter(e => {
    const matchesFilter = filter === 'all' || e.status === filter;
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         e.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const toggleEquipmentStatus = (id: string) => {
    setEquipment(prev => prev.map(e => {
      if (e.id === id) {
        return {
          ...e,
          status: e.status === 'inactive' ? 'available' : 'inactive'
        };
      }
      return e;
    }));
    setShowActions(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading fleet data...</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Fleet Manager</h2>
              <p className="text-sm text-white/80">{stats.totalEquipment} equipment items</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={loadFleetData}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold">${(stats.totalRevenue / 1000).toFixed(1)}k</div>
            <div className="text-sm text-white/70">Total Revenue</div>
            <div className="text-xs text-green-300 mt-1">+{stats.revenueGrowth}% this month</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold">{stats.averageUtilization}%</div>
            <div className="text-sm text-white/70">Avg Utilization</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold">{stats.currentlyRented}</div>
            <div className="text-sm text-white/70">Currently Rented</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold">{stats.upcomingBookings}</div>
            <div className="text-sm text-white/70">Upcoming Bookings</div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {stats.alerts.length > 0 && (
        <div className="p-4 bg-amber-50 border-b border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-amber-800">{stats.alerts.length} Alerts</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {stats.alerts.map(alert => (
              <div
                key={alert.id}
                className="flex-shrink-0 px-3 py-2 bg-white rounded-lg border border-amber-200 text-sm"
              >
                <span className="font-medium text-gray-900">{alert.equipmentTitle}</span>
                <span className="text-gray-500 ml-2">{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search equipment..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
            {(['all', 'available', 'rented', 'maintenance'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
            <Plus className="w-5 h-5" />
            Add Equipment
          </button>
        </div>
      </div>

      {/* Equipment List */}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        <div className="space-y-3">
          {filteredEquipment.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-20 h-20 rounded-xl object-cover"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 truncate">{item.title}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  {item.location}
                  <span className="text-gray-300">•</span>
                  {item.category}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-gray-600">
                    <DollarSign className="w-4 h-4 inline" />
                    ${item.dailyRate}/day
                  </span>
                  <span className={`${getConditionColor(item.condition)}`}>
                    {item.condition.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  ${item.totalEarnings.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">total earnings</div>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${item.utilizationRate}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{item.utilizationRate}%</span>
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowActions(showActions === item.id ? null : item.id)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>

                {showActions === item.id && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-10">
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Edit3 className="w-4 h-4" />
                      Edit Listing
                    </button>
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <BarChart3 className="w-4 h-4" />
                      View Analytics
                    </button>
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Wrench className="w-4 h-4" />
                      Schedule Maintenance
                    </button>
                    <hr className="my-2" />
                    <button
                      onClick={() => toggleEquipmentStatus(item.id)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50"
                    >
                      {item.status === 'inactive' ? (
                        <>
                          <PlayCircle className="w-4 h-4" />
                          Activate Listing
                        </>
                      ) : (
                        <>
                          <PauseCircle className="w-4 h-4" />
                          Pause Listing
                        </>
                      )}
                    </button>
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                      Delete Listing
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
