import { ArrowLeft, Handshake, Building, Truck, Shield, Wrench, Users } from 'lucide-react';
import { Button } from '../ui/Button';

interface PartnershipsProps {
  onBack: () => void;
}

export default function Partnerships({ onBack }: PartnershipsProps) {
  const partnerTypes = [
    {
      icon: <Building className="w-8 h-8" />,
      title: 'Equipment Manufacturers',
      description: 'Partner with leading manufacturers to bring verified, high-quality equipment to our marketplace.',
      benefits: ['Priority listing placement', 'Co-marketing opportunities', 'Technical support integration', 'Data insights sharing']
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Insurance Providers',
      description: 'Work with insurance companies to offer comprehensive coverage options for equipment owners and renters.',
      benefits: ['Integrated insurance quotes', 'Automated policy management', 'Claims processing support', 'Risk assessment tools']
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: 'Logistics Companies',
      description: 'Collaborate with transportation providers to ensure seamless equipment delivery and pickup.',
      benefits: ['Real-time tracking integration', 'Competitive shipping rates', 'Nationwide coverage', 'White-glove service options']
    },
    {
      icon: <Wrench className="w-8 h-8" />,
      title: 'Service Providers',
      description: 'Connect with maintenance and repair services to keep equipment in top condition.',
      benefits: ['Maintenance scheduling', 'Emergency repair coordination', 'Quality assurance programs', 'Discounted service rates']
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Industry Associations',
      description: 'Partner with trade associations to expand our reach and credibility in specific equipment sectors.',
      benefits: ['Member-exclusive benefits', 'Industry event sponsorships', 'Certification programs', 'Regulatory compliance support']
    }
  ];

  const currentPartners = [
    {
      name: 'Caterpillar Inc.',
      type: 'Equipment Manufacturer',
      logo: '/api/placeholder/120/60',
      description: 'Global leader in construction and mining equipment'
    },
    {
      name: 'John Deere',
      type: 'Equipment Manufacturer',
      logo: '/api/placeholder/120/60',
      description: 'Agricultural and construction machinery manufacturer'
    },
    {
      name: 'Allstate Insurance',
      type: 'Insurance Provider',
      logo: '/api/placeholder/120/60',
      description: 'Comprehensive equipment insurance solutions'
    },
    {
      name: 'FedEx Freight',
      type: 'Logistics Partner',
      logo: '/api/placeholder/120/60',
      description: 'Nationwide equipment transportation services'
    },
    {
      name: 'Construction Industry Institute',
      type: 'Industry Association',
      logo: '/api/placeholder/120/60',
      description: 'Advancing the construction industry through research'
    },
    {
      name: 'Associated Equipment Distributors',
      type: 'Industry Association',
      logo: '/api/placeholder/120/60',
      description: 'Leading association for equipment dealers'
    }
  ];

  const partnershipLevels = [
    {
      level: 'Strategic Partner',
      requirements: 'Major industry player with significant market presence',
      benefits: ['Co-branding opportunities', 'Joint marketing campaigns', 'API integration priority', 'Executive relationship management']
    },
    {
      level: 'Technology Partner',
      requirements: 'Companies providing complementary technology solutions',
      benefits: ['Technical integration support', 'Joint product development', 'Shared engineering resources', 'Beta access to new features']
    },
    {
      level: 'Channel Partner',
      requirements: 'Companies that can expand our market reach',
      benefits: ['Referral commissions', 'Co-selling opportunities', 'Marketing development funds', 'Partner portal access']
    },
    {
      level: 'Solution Partner',
      requirements: 'Specialized service providers in equipment ecosystem',
      benefits: ['Service integration', 'Preferred provider status', 'Joint customer support', 'Performance incentives']
    }
  ];

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
          <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white px-8 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Partnership Program
              </h1>
              <p className="text-xl md:text-2xl text-teal-100 mb-8">
                Join forces with Islakayd to revolutionize the equipment rental industry
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-white text-teal-600 hover:bg-gray-50">
                  Become a Partner
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-teal-600">
                  View Partner Portal
                </Button>
              </div>
            </div>
          </div>

          <div className="px-8 py-16">
            <div className="max-w-4xl mx-auto">
              {/* Partnership Types */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Partnership Opportunities</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {partnerTypes.map((type, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        {type.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{type.title}</h3>
                      <p className="text-gray-600 mb-4">{type.description}</p>
                      <ul className="space-y-1">
                        {type.benefits.map((benefit, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Partnership Levels */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Partnership Levels</h2>
                <div className="space-y-6">
                  {partnershipLevels.map((level, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">{level.level}</h3>
                        <span className="text-sm text-gray-500 mt-1 md:mt-0">{level.requirements}</span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Benefits:</h4>
                          <ul className="space-y-1">
                            {level.benefits.map((benefit, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-center">
                                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></div>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex items-center justify-center md:justify-end">
                          <Button variant="outline" className="w-full md:w-auto">
                            Learn More
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Partners */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Partners</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentPartners.map((partner, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className="w-20 h-10 mx-auto mb-4 object-contain"
                      />
                      <h3 className="font-semibold text-gray-900 mb-1">{partner.name}</h3>
                      <p className="text-sm text-blue-600 mb-2">{partner.type}</p>
                      <p className="text-sm text-gray-600">{partner.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Partnership Process */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Partnership Process</h2>
                <div className="grid md:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 font-bold text-lg">
                      1
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Initial Contact</h3>
                    <p className="text-sm text-gray-600">Reach out to discuss partnership opportunities and mutual benefits.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 font-bold text-lg">
                      2
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Partnership Assessment</h3>
                    <p className="text-sm text-gray-600">We evaluate alignment, technical compatibility, and strategic fit.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 font-bold text-lg">
                      3
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Integration Planning</h3>
                    <p className="text-sm text-gray-600">Develop detailed integration plan and timeline for partnership launch.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 font-bold text-lg">
                      4
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Launch & Scale</h3>
                    <p className="text-sm text-gray-600">Execute partnership launch and continuously optimize for mutual success.</p>
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <div className="bg-teal-50 rounded-lg p-8 text-center">
                <Handshake className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Partner?</h2>
                <p className="text-gray-600 mb-6">
                  Join our growing network of partners and help shape the future of equipment rental.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-teal-600 hover:bg-teal-700">
                    Start Partnership Application
                  </Button>
                  <Button variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white">
                    Schedule a Call
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Contact: partnerships@islakayd.com | +1 (555) 123-4567
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}