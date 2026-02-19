import { ArrowLeft, TrendingUp, DollarSign, Users, Globe, Award, Download } from 'lucide-react';
import { Button } from '../ui/Button';

interface InvestorsProps {
  onBack: () => void;
}

export default function Investors({ onBack }: InvestorsProps) {
  const metrics = [
    {
      icon: <Users className="w-8 h-8" />,
      value: '500K+',
      label: 'Active Users',
      change: '+45%'
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      value: '$50M',
      label: 'Series B Funding',
      change: '2024'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      value: '150+',
      label: 'Countries Served',
      change: '+25%'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      value: '300%',
      label: 'YoY Growth',
      change: 'Q4 2024'
    }
  ];

  const investors = [
    {
      name: 'Andreessen Horowitz',
      type: 'Lead Investor',
      logo: '/api/placeholder/120/60',
      description: 'Leading venture capital firm focused on bold entrepreneurs'
    },
    {
      name: 'Sequoia Capital',
      type: 'Strategic Investor',
      logo: '/api/placeholder/120/60',
      description: 'World-renowned VC firm backing the next generation of technology leaders'
    },
    {
      name: 'Index Ventures',
      type: 'Growth Investor',
      logo: '/api/placeholder/120/60',
      description: 'International VC firm investing in transformative technology companies'
    },
    {
      name: 'GV (Google Ventures)',
      type: 'Strategic Investor',
      logo: '/api/placeholder/120/60',
      description: 'Google\'s venture capital arm investing in bold new companies'
    },
    {
      name: 'Lightspeed Venture Partners',
      type: 'Growth Investor',
      logo: '/api/placeholder/120/60',
      description: 'Global venture capital firm partnering with exceptional entrepreneurs'
    },
    {
      name: 'Bessemer Venture Partners',
      type: 'Strategic Investor',
      logo: '/api/placeholder/120/60',
      description: 'Century-old firm investing in transformative technology companies'
    }
  ];

  const milestones = [
    {
      year: '2024',
      quarter: 'Q1',
      title: 'Series B Funding',
      description: '$50M raised at $500M valuation',
      impact: 'Accelerated international expansion and product development'
    },
    {
      year: '2023',
      quarter: 'Q4',
      title: '500K Active Users',
      description: 'Reached major user milestone',
      impact: 'Established market leadership in equipment rental'
    },
    {
      year: '2023',
      quarter: 'Q3',
      title: 'Global Expansion',
      description: 'Launched in 50+ new countries',
      impact: 'Tripled international revenue within 6 months'
    },
    {
      year: '2023',
      quarter: 'Q2',
      title: 'AI Integration',
      description: 'Launched AI-powered matching system',
      impact: '40% increase in booking conversion rates'
    },
    {
      year: '2023',
      quarter: 'Q1',
      title: 'Series A Funding',
      description: '$25M raised at $200M valuation',
      impact: 'Funded major product and team expansion'
    },
    {
      year: '2022',
      quarter: 'Q4',
      title: 'Platform Launch',
      description: 'Public beta launch in North America',
      impact: '10K users in first month, 95% retention rate'
    }
  ];

  const documents = [
    {
      name: 'Series B Pitch Deck',
      type: 'PDF',
      size: '8.5 MB',
      date: 'March 2024'
    },
    {
      name: 'Annual Report 2023',
      type: 'PDF',
      size: '12.3 MB',
      date: 'December 2023'
    },
    {
      name: 'Financial Projections',
      type: 'PDF',
      size: '4.2 MB',
      date: 'February 2024'
    },
    {
      name: 'Company Overview',
      type: 'PDF',
      size: '6.1 MB',
      date: 'January 2024'
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
          <div className="bg-gradient-to-r from-green-600 to-green-800 text-white px-8 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Investor Relations
              </h1>
              <p className="text-xl md:text-2xl text-green-100 mb-8">
                Building the world's most advanced equipment rental marketplace
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {metrics.map((metric, index) => (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                      {metric.icon}
                    </div>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className="text-sm text-green-100">{metric.label}</div>
                    <div className="text-xs text-green-200">{metric.change}</div>
                  </div>
                ))}
              </div>
              <Button className="bg-white text-green-600 hover:bg-gray-50">
                Download Investor Kit
              </Button>
            </div>
          </div>

          <div className="px-8 py-16">
            <div className="max-w-4xl mx-auto">
              {/* Company Overview */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Company Overview</h2>
                <div className="prose prose-lg max-w-none text-gray-600">
                  <p className="mb-4">
                    Islakayd is revolutionizing the $100B+ equipment rental industry by connecting equipment owners with renters through a trusted, transparent, and efficient marketplace. Founded in 2020, we've grown from a startup to a global platform serving over 500,000 users across 150+ countries.
                  </p>
                  <p className="mb-4">
                    Our mission is to democratize access to equipment by leveraging technology to create a marketplace that's more efficient, transparent, and accessible than traditional rental companies. We've raised $75M in funding from world-class investors and are backed by a team of experienced entrepreneurs and engineers.
                  </p>
                  <p>
                    With our AI-powered matching system, comprehensive insurance coverage, and global logistics network, we're positioned to capture significant market share in this fragmented industry.
                  </p>
                </div>
              </div>

              {/* Market Opportunity */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Market Opportunity</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Total Addressable Market</h3>
                    <div className="text-3xl font-bold text-blue-600 mb-2">$100B+</div>
                    <p className="text-gray-600 mb-4">Global equipment rental market size</p>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Construction equipment: $45B</li>
                      <li>• Industrial machinery: $30B</li>
                      <li>• Agricultural equipment: $15B</li>
                      <li>• Other specialty equipment: $10B</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Serviceable Addressable Market</h3>
                    <div className="text-3xl font-bold text-green-600 mb-2">$25B</div>
                    <p className="text-gray-600 mb-4">Online equipment rental opportunity</p>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Currently 90% offline transactions</li>
                      <li>• Growing digital adoption</li>
                      <li>• International expansion potential</li>
                      <li>• B2B and B2C segments</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Investors */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Investors</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {investors.map((investor, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                      <img
                        src={investor.logo}
                        alt={investor.name}
                        className="w-24 h-12 mx-auto mb-4 object-contain"
                      />
                      <h3 className="font-semibold text-gray-900 mb-1">{investor.name}</h3>
                      <p className="text-sm text-blue-600 mb-2">{investor.type}</p>
                      <p className="text-sm text-gray-600">{investor.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Key Milestones</h2>
                <div className="space-y-6">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div className="flex items-center">
                          <div className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mr-4">
                            {milestone.year} {milestone.quarter}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">{milestone.title}</h3>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-2">{milestone.description}</p>
                      <p className="text-sm text-green-600 font-medium">{milestone.impact}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Investor Documents</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {documents.map((doc, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <Download className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{doc.name}</h4>
                          <p className="text-sm text-gray-500">{doc.type} • {doc.size} • {doc.date}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="bg-green-50 rounded-lg p-8 text-center">
                <Award className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Invest in the Future</h2>
                <p className="text-gray-600 mb-6">
                  Join our world-class investor syndicate and be part of transforming the equipment rental industry.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-green-600 hover:bg-green-700">
                    Schedule Investor Meeting
                  </Button>
                  <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                    Join Investor Mailing List
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Contact: investors@islakayd.com | +1 (555) 123-4567
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}