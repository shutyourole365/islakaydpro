import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar,
  Clock,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  Settings,
  Filter,
  Download,
} from 'lucide-react';
import type { Equipment } from '../../types';
import { getEquipment } from '../../services/database';
import { useAuth } from '../../contexts/AuthContext';

interface MaintenanceSchedulerProps {
  equipment?: Equipment[];
  className?: string;
}

interface MaintenanceTask {
  id: string;
  equipmentId: string;
  equipmentName: string;
  title: string;
  description: string;
  type: 'preventive' | 'corrective' | 'inspection' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'scheduled' | 'overdue' | 'completed' | 'cancelled';
  scheduledDate: Date;
  completedDate?: Date;
  estimatedDuration: number; // hours
  assignedTo?: string;
  cost?: number;
  notes?: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    interval: number;
    endDate?: Date;
  };
}

export default function MaintenanceScheduler({ equipment: propEquipment, className = '' }: MaintenanceSchedulerProps) {
  const { user } = useAuth();
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'kanban'>('list');

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        const equipmentData = propEquipment || (await getEquipment({ ownerId: user.id })).data;

        // Generate maintenance tasks based on equipment
        const tasks = generateMaintenanceTasks(equipmentData);
        setMaintenanceTasks(tasks);
      } catch (error) {
        console.error('Failed to load maintenance data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, propEquipment, generateMaintenanceTasks]);

  const generateMaintenanceTasks = useCallback((equipmentList: Equipment[]): MaintenanceTask[] => {
    const tasks: MaintenanceTask[] = [];
    const now = new Date();

    equipmentList.forEach((eq) => {
      // Basic maintenance schedule based on equipment type
      const baseTasks = getBaseMaintenanceTasks(eq);

      baseTasks.forEach((task, index) => {
        const taskId = `${eq.id}-${task.type}-${index}`;
        const scheduledDate = new Date(now);

        // Schedule based on frequency
        switch (task.frequency) {
          case 'daily':
            scheduledDate.setDate(now.getDate() + 1);
            break;
          case 'weekly':
            scheduledDate.setDate(now.getDate() + 7);
            break;
          case 'monthly':
            scheduledDate.setMonth(now.getMonth() + 1);
            break;
          case 'quarterly':
            scheduledDate.setMonth(now.getMonth() + 3);
            break;
          case 'yearly':
            scheduledDate.setFullYear(now.getFullYear() + 1);
            break;
        }

        // Check if task is overdue
        const isOverdue = scheduledDate < now && task.status !== 'completed';

        tasks.push({
          id: taskId,
          equipmentId: eq.id,
          equipmentName: eq.name,
          title: task.title,
          description: task.description,
          type: task.type,
          priority: task.priority,
          status: isOverdue ? 'overdue' : 'scheduled',
          scheduledDate,
          estimatedDuration: task.duration,
          cost: task.cost,
          recurring: {
            frequency: task.frequency,
            interval: 1,
          },
        });
      });
    });

    return tasks.sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
  }, []);

  const getBaseMaintenanceTasks = (eq: Equipment) => {
    const tasks = [];

    // Common tasks for all equipment
    tasks.push({
      title: 'Visual Inspection',
      description: 'Complete visual inspection of equipment condition',
      type: 'inspection' as const,
      priority: 'medium' as const,
      frequency: 'weekly' as const,
      duration: 0.5,
      cost: 0,
      status: 'scheduled' as const,
    });

    // Equipment-specific tasks
    const category = eq.category?.name?.toLowerCase() || '';

    if (category.includes('construction') || category.includes('heavy')) {
      tasks.push(
        {
          title: 'Hydraulic System Check',
          description: 'Inspect hydraulic fluid levels and system pressure',
          type: 'preventive' as const,
          priority: 'high' as const,
          frequency: 'monthly' as const,
          duration: 2,
          cost: 150,
          status: 'scheduled' as const,
        },
        {
          title: 'Engine Oil Change',
          description: 'Change engine oil and replace oil filter',
          type: 'preventive' as const,
          priority: 'high' as const,
          frequency: 'quarterly' as const,
          duration: 3,
          cost: 200,
          status: 'scheduled' as const,
        }
      );
    }

    if (category.includes('lawn') || category.includes('garden')) {
      tasks.push(
        {
          title: 'Blade Sharpening',
          description: 'Sharpen or replace mower blades',
          type: 'preventive' as const,
          priority: 'medium' as const,
          frequency: 'monthly' as const,
          duration: 1,
          cost: 50,
          status: 'scheduled' as const,
        }
      );
    }

    return tasks;
  };

  const filteredTasks = useMemo(() => {
    return maintenanceTasks.filter(task => {
      if (filterStatus !== 'all' && task.status !== filterStatus) return false;
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
      return true;
    });
  }, [maintenanceTasks, filterStatus, filterPriority]);

  const upcomingTasks = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return maintenanceTasks
      .filter(task =>
        task.status === 'scheduled' &&
        task.scheduledDate >= now &&
        task.scheduledDate <= nextWeek
      )
      .slice(0, 5);
  }, [maintenanceTasks]);

  const overdueTasks = useMemo(() => {
    const now = new Date();
    return maintenanceTasks.filter(task =>
      task.status === 'overdue' || task.scheduledDate < now
    );
  }, [maintenanceTasks]);

  const handleTaskStatusUpdate = (taskId: string, newStatus: MaintenanceTask['status']) => {
    setMaintenanceTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? {
              ...task,
              status: newStatus,
              completedDate: newStatus === 'completed' ? new Date() : undefined
            }
          : task
      )
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'preventive': return Wrench;
      case 'corrective': return AlertTriangle;
      case 'inspection': return CheckCircle;
      case 'emergency': return AlertTriangle;
      default: return Wrench;
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Maintenance Scheduler</h2>
            <p className="text-gray-600">Keep your equipment running smoothly</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTaskForm(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Download className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-800">Overdue</span>
            </div>
            <div className="text-2xl font-bold text-red-900">{overdueTasks.length}</div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">This Week</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{upcomingTasks.length}</div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Completed</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {maintenanceTasks.filter(t => t.status === 'completed').length}
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Total Tasks</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">{maintenanceTasks.length}</div>
          </div>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="overdue">Overdue</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {(['list', 'calendar', 'kanban'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const TypeIcon = getTypeIcon(task.type);
            return (
              <div
                key={task.id}
                className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-lg ${getPriorityColor(task.priority)}`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{task.title}</h3>
                        <p className="text-sm text-gray-600">{task.equipmentName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-3">{task.description}</p>

                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{task.scheduledDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{task.estimatedDuration}h estimated</span>
                      </div>
                      {task.cost && task.cost > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-green-600">${task.cost}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {task.status === 'scheduled' && (
                        <button
                          onClick={() => handleTaskStatusUpdate(task.id, 'completed')}
                          className="flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark Complete
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedTask(task)}
                        className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>

                      <button className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors text-sm">
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4" />
            <p>Calendar view coming soon!</p>
            <p className="text-sm">View your maintenance schedule in calendar format.</p>
          </div>
        </div>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {(['scheduled', 'overdue', 'completed', 'cancelled'] as const).map((status) => (
            <div key={status} className="bg-gray-50 rounded-lg p-4">
              <h3 className={`font-medium mb-4 capitalize ${getStatusColor(status)} px-2 py-1 rounded`}>
                {status} ({maintenanceTasks.filter(t => t.status === status).length})
              </h3>
              <div className="space-y-3">
                {maintenanceTasks
                  .filter(task => task.status === status)
                  .slice(0, 5)
                  .map((task) => (
                    <div key={task.id} className="bg-white p-3 rounded border border-gray-200">
                      <h4 className="font-medium text-sm text-gray-900 mb-1">{task.title}</h4>
                      <p className="text-xs text-gray-600 mb-2">{task.equipmentName}</p>
                      <div className="text-xs text-gray-500">
                        {task.scheduledDate.toLocaleDateString()}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance tasks found</h3>
          <p className="text-gray-600">Try adjusting your filters or add a new maintenance task.</p>
        </div>
      )}
    </div>
  );
}