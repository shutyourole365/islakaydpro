import { ArrowLeft, BookOpen, Users, TrendingUp, Award, Download, Star } from 'lucide-react';
import { Button } from '../ui/Button';

interface HostResourcesProps {
  onBack: () => void;
}

export default function HostResources({ onBack }: HostResourcesProps) {
  const resources = [
    {
      category: 'Getting Started',
      icon: <BookOpen className="w-6 h-6" />,
      items: [
        {
          title: 'Complete Hosting Guide',
          description: 'Step-by-step guide to listing your first equipment',
          type: 'Guide',
          duration: '15 min read'
        },
        {
          title: 'Equipment Photography Tips',
          description: 'Professional photos that attract more renters',
          type: 'Video',
          duration: '8 min watch'
        },
        {
          title: 'Pricing Your Equipment',
          description: 'How to set competitive rates and maximize income',
          type: 'Article',
          duration: '10 min read'
        }
      ]
    },
    {
      category: 'Maximizing Income',
      icon: <TrendingUp className="w-6 h-6" />,
      items: [
        {
          title: 'Seasonal Pricing Strategies',
          description: 'Adjust rates for peak demand periods',
          type: 'Guide',
          duration: '12 min read'
        },
        {
          title: 'Marketing Your Listings',
          description: 'Tips to increase visibility and bookings',
          type: 'Video',
          duration: '15 min watch'
        },
        {
          title: 'Long-term Rental Programs',
          description: 'Attract construction companies for extended rentals',
          type: 'Article',
          duration: '8 min read'
        }
      ]
    },
    {
      category: 'Safety & Maintenance',
      icon: <Award className="w-6 h-6" />,
      items: [
        {
          title: 'Equipment Safety Checklist',
          description: 'Ensure your equipment meets safety standards',
          type: 'Checklist',
          duration: '5 min read'
        },
        {
          title: 'Maintenance Best Practices',
          description: 'Keep equipment in top condition',
          type: 'Guide',
          duration: '20 min read'
        },
        {
          title: 'Insurance Coverage Guide',
          description: 'Understanding your protection options',
          type: 'Article',
          duration: '10 min read'
        }
      ]
    }
  ];

  const successStories = [
    {
      name: 'Mike Johnson',
      location: 'Brisbane, QLD',
      equipment: 'Construction Equipment',
      earnings: '$52,000 AUD',
      period: 'Last 12 months',
      quote: 'Islakayd turned my idle equipment into a steady income stream. The platform is incredibly easy to use.',
      rating: 5
    },
    {
      name: 'Sarah Chen',
      location: 'Sydney, NSW',
      equipment: 'Power Tools',
      earnings: '$32,000 AUD',
      period: 'Last 12 months',
      quote: 'The support team is amazing, and the renter verification gives me peace of mind.',
      rating: 5
    },
    {
      name: 'David Rodriguez',
      location: 'Melbourne, VIC',
      equipment: 'Heavy Machinery',
      earnings: '$78,000 AUD',
      period: 'Last 12 months',
      quote: 'Started with one excavator, now have a fleet. Islakayd scales with your business.',
      rating: 5
    }
  ];

  const tools = [
    {
      name: 'Host Dashboard',
      description: 'Manage listings, bookings, and earnings all in one place',
      features: ['Real-time analytics', 'Booking management', 'Earnings tracking', 'Performance insights']
    },
    {
      name: 'Pricing Calculator',
      description: 'Optimize your rates based on market data and demand',
      features: ['Market comparisons', 'Seasonal adjustments', 'Competitive analysis', 'Revenue projections']
    },
    {
      name: 'Maintenance Tracker',
      description: 'Keep track of equipment maintenance and service history',
      features: ['Service reminders', 'Cost tracking', 'Documentation storage', 'Compliance reports']
    },
    {
      name: 'Marketing Tools',
      description: 'Promote your listings and attract more renters',
      features: ['Listing optimization', 'Photo enhancement', 'SEO suggestions', 'Promotion scheduling']
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
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-8 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Host Resources
              </h1>
              <p className="text-xl md:text-2xl text-purple-100 mb-8">
                Everything you need to succeed as an equipment owner on Islakayd
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-white text-purple-600 hover:bg-gray-50">
                  Start Hosting
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                  View Dashboard
                </Button>
              </div>
            </div>
          </div>

          <div className="px-8 py-16">
            <div className="max-w-4xl mx-auto">
              {/* Resources by Category */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Learning Resources</h2>
                <div className="space-y-8">
                  {resources.map((category, index) => (
                    <div key={index}>
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                          {category.icon}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">{category.category}</h3>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        {category.items.map((item, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-purple-600">{item.type}</span>
                              <span className="text-sm text-gray-500">{item.duration}</span>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-2">{item.title}</h4>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Success Stories */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Success Stories</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {successStories.map((story, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <Users className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{story.name}</h3>
                          <p className="text-sm text-gray-500">{story.location}</p>
                        </div>
                      </div>
                      <p className="text-sm text-purple-600 font-medium mb-2">{story.equipment}</p>
                      <div className="mb-3">
                        <div className="text-2xl font-bold text-green-600">${story.earnings}</div>
                        <div className="text-sm text-gray-500">{story.period}</div>
                      </div>
                      <div className="flex items-center mb-3">
                        {[...Array(story.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 italic">"{story.quote}"</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Host Tools */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Host Tools & Features</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {tools.map((tool, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">{tool.name}</h3>
                      <p className="text-gray-600 mb-4">{tool.description}</p>
                      <ul className="space-y-2">
                        {tool.features.map((feature, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center">
                            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Downloadable Resources */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Downloadable Resources</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                    <Download className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <h4 className="font-medium text-gray-900 mb-2">Hosting Checklist</h4>
                    <p className="text-sm text-gray-600 mb-3">Complete guide for new hosts</p>
                    <Button variant="outline" size="sm" className="w-full">
                      Download PDF
                    </Button>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                    <Download className="w-8 h-8 text-green-600 mx-auto mb-3" />
                    <h4 className="font-medium text-gray-900 mb-2">Pricing Guide</h4>
                    <p className="text-sm text-gray-600 mb-3">Market rates and strategies</p>
                    <Button variant="outline" size="sm" className="w-full">
                      Download PDF
                    </Button>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                    <Download className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                    <h4 className="font-medium text-gray-900 mb-2">Safety Standards</h4>
                    <p className="text-sm text-gray-600 mb-3">Equipment safety requirements</p>
                    <Button variant="outline" size="sm" className="w-full">
                      Download PDF
                    </Button>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                    <Download className="w-8 h-8 text-red-600 mx-auto mb-3" />
                    <h4 className="font-medium text-gray-900 mb-2">Tax Guide</h4>
                    <p className="text-sm text-gray-600 mb-3">Tax implications for hosts</p>
                    <Button variant="outline" size="sm" className="w-full">
                      Download PDF
                    </Button>
                  </div>
                </div>
              </div>

              {/* Community & Support */}
              <div className="bg-purple-50 rounded-lg p-8">
                <div className="text-center mb-6">
                  <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Join the Host Community</h2>
                  <p className="text-gray-600 mb-6">
                    Connect with other successful hosts, share tips, and get exclusive access to new features.
                  </p>
                </div>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">10,000+</div>
                    <div className="text-gray-600">Active Hosts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">$50M+</div>
                    <div className="text-gray-600">Host Earnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">4.9/5</div>
                    <div className="text-gray-600">Host Satisfaction</div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Join Host Community
                  </Button>
                  <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white">
                    Contact Host Support
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