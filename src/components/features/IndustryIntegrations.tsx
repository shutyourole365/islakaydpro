import { ArrowLeft, Building, Wrench, Zap, Cloud, Link, CheckCircle, AlertCircle, Settings, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState } from 'react';

interface IndustryIntegrationsProps {
  onBack: () => void;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'available' | 'coming-soon';
  category: 'construction' | 'project-management' | 'equipment' | 'analytics';
  features: string[];
}

export default function IndustryIntegrations({ onBack }: IndustryIntegrationsProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'construction' | 'project-management' | 'equipment' | 'analytics'>('all');

  const integrations: Integration[] = [
    {
      id: 'bim-360',
      name: 'Autodesk BIM 360',
      description: 'Seamlessly integrate with BIM 360 for construction project management and equipment scheduling',
      icon: <Building className="w-8 h-8" />,
      status: 'connected',
      category: 'construction',
      features: [
        'Real-time project scheduling',
        'Equipment utilization tracking',
        'Cost analysis integration',
        'Quality control workflows'
      ]
    },
    {
      id: 'procore',
      name: 'Procore',
      description: 'Connect with Procore for comprehensive construction management and equipment coordination',
      icon: <Wrench className="w-8 h-8" />,
      status: 'connected',
      category: 'project-management',
      features: [
        'Project timeline synchronization',
        'Equipment booking integration',
        'Resource allocation',
        'Compliance tracking'
      ]
    },
    {
      id: 'trimble',
      name: 'Trimble Connect',
      description: 'Integrate with Trimble for advanced construction technology and equipment positioning',
      icon: <Zap className="w-8 h-8" />,
      status: 'available',
      category: 'construction',
      features: [
        'GPS equipment tracking',
        'Site layout optimization',
        'Progress monitoring',
        'Safety zone management'
      ]
    },
    {
      id: 'bluebeam',
      name: 'Bluebeam Revu',
      description: 'Connect with Bluebeam for PDF collaboration and markup integration with equipment data',
      icon: <Cloud className="w-8 h-8" />,
      status: 'available',
      category: 'construction',
      features: [
        'Document markup integration',
        'Equipment specification linking',
        'Change order management',
        'Quality assurance workflows'
      ]
    },
    {
      id: 'rhino',
      name: 'Rhinoceros 3D',
      description: 'Integrate with Rhino for 3D modeling and equipment visualization in design projects',
      icon: <Settings className="w-8 h-8" />,
      status: 'coming-soon',
      category: 'construction',
      features: [
        '3D equipment modeling',
        'Design validation',
        'Prototyping support',
        'Manufacturing integration'
      ]
    },
    {
      id: 'asana',
      name: 'Asana',
      description: 'Connect with Asana for project management and equipment scheduling coordination',
      icon: <CheckCircle className="w-8 h-8" />,
      status: 'available',
      category: 'project-management',
      features: [
        'Task automation',
        'Equipment booking workflows',
        'Team coordination',
        'Progress tracking'
      ]
    },
    {
      id: 'monday',
      name: 'Monday.com',
      description: 'Integrate with Monday.com for customizable workflows and equipment management',
      icon: <Link className="w-8 h-8" />,
      status: 'coming-soon',
      category: 'project-management',
      features: [
        'Custom dashboard creation',
        'Equipment inventory tracking',
        'Automated notifications',
        'Reporting integration'
      ]
    },
    {
      id: 'tableau',
      name: 'Tableau',
      description: 'Connect with Tableau for advanced analytics and equipment performance insights',
      icon: <AlertCircle className="w-8 h-8" />,
      status: 'available',
      category: 'analytics',
      features: [
        'Equipment utilization analytics',
        'Cost optimization insights',
        'Predictive maintenance',
        'Performance dashboards'
      ]
    },
    {
      id: 'power-bi',
      name: 'Power BI',
      description: 'Integrate with Microsoft Power BI for comprehensive business intelligence and equipment metrics',
      icon: <ExternalLink className="w-8 h-8" />,
      status: 'coming-soon',
      category: 'analytics',
      features: [
        'Real-time equipment metrics',
        'Financial reporting',
        'Operational efficiency',
        'Custom visualizations'
      ]
    }
  ];

  const filteredIntegrations = selectedCategory === 'all'
    ? integrations
    : integrations.filter(integration => integration.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 border-green-200';
      case 'available': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'coming-soon': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4" />;
      case 'available': return <Link className="w-4 h-4" />;
      case 'coming-soon': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Features
        </Button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Building className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold">Industry Software Connections</h1>
                <p className="text-blue-100">Seamlessly integrate with leading construction and project management platforms</p>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap justify-center">
              {[
                { id: 'all', label: 'All Integrations' },
                { id: 'construction', label: 'Construction' },
                { id: 'project-management', label: 'Project Management' },
                { id: 'equipment', label: 'Equipment' },
                { id: 'analytics', label: 'Analytics' }
              ].map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id as any)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-white text-blue-600'
                      : 'bg-blue-500/20 text-blue-100 hover:bg-blue-500/30'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Integration Grid */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIntegrations.map(integration => (
                <div key={integration.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        {integration.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(integration.status)}`}>
                          {getStatusIcon(integration.status)}
                          {integration.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">{integration.description}</p>

                  <div className="space-y-2 mb-4">
                    <h4 className="font-medium text-gray-900 text-sm">Key Features:</h4>
                    <ul className="space-y-1">
                      {integration.features.map((feature, index) => (
                        <li key={index} className="text-gray-600 text-sm flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    className="w-full"
                    variant={integration.status === 'connected' ? 'secondary' : 'primary'}
                    disabled={integration.status === 'coming-soon'}
                  >
                    {integration.status === 'connected' ? 'Manage Integration' :
                     integration.status === 'available' ? 'Connect Now' :
                     'Coming Soon'}
                  </Button>
                </div>
              ))}
            </div>

            {/* Integration Benefits */}
            <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Industry Integration Matters</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Streamlined Workflows</h3>
                  <p className="text-gray-600 text-sm">Eliminate manual data entry and reduce errors with automated synchronization</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Real-time Updates</h3>
                  <p className="text-gray-600 text-sm">Get instant notifications and updates across all connected platforms</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Building className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Enhanced Collaboration</h3>
                  <p className="text-gray-600 text-sm">Improve team coordination with unified project and equipment data</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Settings className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Data-Driven Decisions</h3>
                  <p className="text-gray-600 text-sm">Make informed decisions with comprehensive analytics and reporting</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );}
