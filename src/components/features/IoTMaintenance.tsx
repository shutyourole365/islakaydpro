import { ArrowLeft, AlertTriangle, Cpu, Gauge, TrendingUp, Wrench } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState } from 'react';

interface IoTMaintenanceProps {
  onBack: () => void;
}

export default function IoTMaintenance({ onBack }: IoTMaintenanceProps) {
  const [selectedEquipment, setSelectedEquipment] = useState('excavator');

  const equipmentData = {
    excavator: {
      name: 'CAT 320 Excavator',
      status: 'Healthy',
      uptime: 98.5,
      nextService: '45 days',
      alerts: 2,
      sensors: 24,
      efficiency: 92
    },
    tractor: {
      name: 'John Deere 8R',
      status: 'Warning',
      uptime: 94.2,
      nextService: '12 days',
      alerts: 5,
      sensors: 18,
      efficiency: 87
    },
    generator: {
      name: 'Cummins 50kW',
      status: 'Critical',
      uptime: 87.3,
      nextService: '3 days',
      alerts: 8,
      sensors: 12,
      efficiency: 78
    }
  };

  const sensorReadings = [
    {
      sensor: 'Engine Oil Pressure',
      value: '45 PSI',
      status: 'Normal',
      trend: 'stable',
      lastUpdate: '2 min ago'
    },
    {
      sensor: 'Hydraulic Fluid Temp',
      value: '68°C',
      status: 'Warning',
      trend: 'rising',
      lastUpdate: '1 min ago'
    },
    {
      sensor: 'Fuel Consumption',
      value: '12.5 L/hr',
      status: 'Normal',
      trend: 'stable',
      lastUpdate: '30 sec ago'
    },
    {
      sensor: 'Battery Voltage',
      value: '13.8V',
      status: 'Normal',
      trend: 'stable',
      lastUpdate: '45 sec ago'
    },
    {
      sensor: 'Transmission Temp',
      value: '72°C',
      status: 'Critical',
      trend: 'rising',
      lastUpdate: '1 min ago'
    },
    {
      sensor: 'Air Filter Pressure',
      value: '2.1 kPa',
      status: 'Warning',
      trend: 'rising',
      lastUpdate: '3 min ago'
    }
  ];

  const maintenanceSchedule = [
    {
      type: 'Preventive',
      description: 'Oil and filter change',
      dueDate: '2024-02-15',
      priority: 'Medium',
      estimatedCost: 450,
      status: 'Scheduled'
    },
    {
      type: 'Predictive',
      description: 'Hydraulic system inspection',
      dueDate: '2024-02-08',
      priority: 'High',
      estimatedCost: 280,
      status: 'Overdue'
    },
    {
      type: 'Corrective',
      description: 'Replace air filter',
      dueDate: '2024-01-30',
      priority: 'High',
      estimatedCost: 120,
      status: 'Urgent'
    },
    {
      type: 'Preventive',
      description: 'Transmission fluid change',
      dueDate: '2024-03-01',
      priority: 'Low',
      estimatedCost: 350,
      status: 'Planned'
    }
  ];

  const performanceMetrics = [
    { metric: 'Fuel Efficiency', value: 92, unit: '%', trend: 'up', change: '+5%' },
    { metric: 'Engine Performance', value: 88, unit: '%', trend: 'up', change: '+3%' },
    { metric: 'Hydraulic Efficiency', value: 85, unit: '%', trend: 'down', change: '-2%' },
    { metric: 'Overall Uptime', value: 96, unit: '%', trend: 'up', change: '+8%' }
  ];

  const alerts = [
    {
      level: 'Critical',
      message: 'Transmission temperature exceeding safe limits',
      equipment: 'CAT 320 Excavator',
      time: '5 min ago',
      action: 'Reduce load immediately'
    },
    {
      level: 'Warning',
      message: 'Hydraulic fluid temperature rising',
      equipment: 'CAT 320 Excavator',
      time: '12 min ago',
      action: 'Monitor closely'
    },
    {
      level: 'Warning',
      message: 'Air filter pressure drop detected',
      equipment: 'John Deere 8R',
      time: '1 hour ago',
      action: 'Schedule inspection'
    },
    {
      level: 'Info',
      message: 'Regular maintenance due in 45 days',
      equipment: 'CAT 320 Excavator',
      time: '2 hours ago',
      action: 'Plan service appointment'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy': return 'text-green-600 bg-green-100';
      case 'Warning': return 'text-yellow-600 bg-yellow-100';
      case 'Critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'border-red-500 bg-red-50';
      case 'Warning': return 'border-yellow-500 bg-yellow-50';
      case 'Info': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Islakayd
        </Button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6">
                <Cpu className="w-8 h-8" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                IoT Predictive Maintenance
              </h1>
              <p className="text-xl md:text-2xl text-purple-100 mb-8">
                AI-powered equipment monitoring for maximum uptime and efficiency
              </p>
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold mb-2">96%</div>
                  <div className="text-purple-100">Avg Uptime</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">85%</div>
                  <div className="text-purple-100">Cost Savings</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">24/7</div>
                  <div className="text-purple-100">Monitoring</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">AI</div>
                  <div className="text-purple-100">Powered</div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-16">
            <div className="max-w-4xl mx-auto">
              {/* Equipment Selector */}
              <div className="mb-8 flex justify-center">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {Object.entries(equipmentData).map(([key, data]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedEquipment(key)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedEquipment === key
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {data.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Equipment Overview */}
              <div className="mb-12">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {equipmentData[selectedEquipment as keyof typeof equipmentData].name}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(equipmentData[selectedEquipment as keyof typeof equipmentData].status)}`}>
                      {equipmentData[selectedEquipment as keyof typeof equipmentData].status}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {equipmentData[selectedEquipment as keyof typeof equipmentData].uptime}%
                      </div>
                      <div className="text-sm text-gray-600">Uptime</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {equipmentData[selectedEquipment as keyof typeof equipmentData].nextService}
                      </div>
                      <div className="text-sm text-gray-600">Next Service</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600 mb-2">
                        {equipmentData[selectedEquipment as keyof typeof equipmentData].alerts}
                      </div>
                      <div className="text-sm text-gray-600">Active Alerts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {equipmentData[selectedEquipment as keyof typeof equipmentData].sensors}
                      </div>
                      <div className="text-sm text-gray-600">Sensors</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Performance Metrics</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {performanceMetrics.map((metric, index) => (
                    <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{metric.metric}</h3>
                        <div className={`flex items-center gap-1 text-sm ${
                          metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <TrendingUp className={`w-4 h-4 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                          {metric.change}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-3xl font-bold text-blue-600">
                          {metric.value}{metric.unit}
                        </div>
                        <div className="w-16 h-16 relative">
                          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#E5E7EB"
                              strokeWidth="2"
                            />
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#3B82F6"
                              strokeWidth="2"
                              strokeDasharray={`${metric.value}, 100`}
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sensor Readings */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Real-time Sensor Data</h2>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Live Readings</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {sensorReadings.map((sensor, index) => (
                      <div key={index} className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Gauge className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{sensor.sensor}</div>
                            <div className="text-sm text-gray-500">{sensor.lastUpdate}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">{sensor.value}</div>
                          <div className={`text-sm ${
                            sensor.status === 'Normal' ? 'text-green-600' :
                            sensor.status === 'Warning' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {sensor.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Maintenance Schedule */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Maintenance Schedule</h2>
                <div className="space-y-4">
                  {maintenanceSchedule.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Wrench className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{item.description}</div>
                            <div className="text-sm text-gray-500">{item.type} Maintenance</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${getPriorityColor(item.priority)}`}>
                            {item.priority} Priority
                          </div>
                          <div className="text-sm text-gray-500">{item.status}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Due: {new Date(item.dueDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          Est. Cost: ${item.estimatedCost}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Alerts */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Active Alerts</h2>
                <div className="space-y-4">
                  {alerts.map((alert, index) => (
                    <div key={index} className={`border-l-4 p-4 rounded-r-lg ${getAlertColor(alert.level)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            alert.level === 'Critical' ? 'bg-red-500' :
                            alert.level === 'Warning' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}>
                            <AlertTriangle className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{alert.message}</div>
                            <div className="text-sm text-gray-600">{alert.equipment} • {alert.time}</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          {alert.action}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Section */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Upgrade to IoT Maintenance</h2>
                <p className="text-gray-600 mb-6">
                  Install sensors on your equipment and get predictive maintenance powered by AI.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-purple-600 hover:bg-purple-700 px-8 py-3">
                    Get Started
                  </Button>
                  <Button variant="outline" className="px-8 py-3">
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}