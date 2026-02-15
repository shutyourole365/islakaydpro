import { ArrowLeft, Calendar, ExternalLink, Download } from 'lucide-react';
import { Button } from '../ui/Button';

interface PressProps {
  onBack: () => void;
}

export default function Press({ onBack }: PressProps) {
  const pressReleases = [
    {
      title: 'Islakayd Raises $50M Series B to Expand Global Equipment Rental Marketplace',
      date: 'March 15, 2024',
      summary: 'Leading equipment rental platform secures major funding to accelerate international expansion and product innovation.',
      link: '#'
    },
    {
      title: 'Islakayd Launches AI-Powered Equipment Matching Technology',
      date: 'January 22, 2024',
      summary: 'New machine learning algorithms help renters find the perfect equipment and owners maximize rental income.',
      link: '#'
    },
    {
      title: 'Islakayd Reaches 500,000 Active Users Milestone',
      date: 'November 8, 2023',
      summary: 'Platform celebrates rapid growth with users in over 150 countries sharing and renting equipment.',
      link: '#'
    },
    {
      title: 'Islakayd Partners with Major Construction Equipment Manufacturers',
      date: 'September 14, 2023',
      summary: 'Strategic partnerships enhance equipment verification and expand marketplace offerings.',
      link: '#'
    },
    {
      title: 'Islakayd Introduces Comprehensive Insurance Coverage',
      date: 'July 3, 2023',
      summary: 'New insurance options provide peace of mind for both equipment owners and renters.',
      link: '#'
    },
    {
      title: 'Islakayd Launches Mobile App for iOS and Android',
      date: 'April 18, 2023',
      summary: 'Mobile-first experience makes equipment rental accessible anywhere, anytime.',
      link: '#'
    }
  ];

  const mediaKit = [
    {
      name: 'Company Logo (PNG)',
      size: '2.3 MB',
      type: 'Logo'
    },
    {
      name: 'Brand Guidelines (PDF)',
      size: '5.1 MB',
      type: 'Guidelines'
    },
    {
      name: 'High-Resolution Photos (ZIP)',
      size: '45.8 MB',
      type: 'Photos'
    },
    {
      name: 'Product Screenshots (ZIP)',
      size: '12.4 MB',
      type: 'Screenshots'
    },
    {
      name: 'CEO Headshot (JPG)',
      size: '8.2 MB',
      type: 'Headshot'
    },
    {
      name: 'Company Factsheet (PDF)',
      size: '1.8 MB',
      type: 'Factsheet'
    }
  ];

  const coverage = [
    {
      publication: 'TechCrunch',
      title: 'How Islakayd is Democratizing Equipment Access',
      date: 'February 28, 2024',
      link: '#'
    },
    {
      publication: 'Forbes',
      title: 'The Sharing Economy Comes to Heavy Equipment',
      date: 'January 15, 2024',
      link: '#'
    },
    {
      publication: 'The Wall Street Journal',
      title: 'Startup Aims to Disrupt $100B Equipment Rental Market',
      date: 'December 5, 2023',
      link: '#'
    },
    {
      publication: 'Bloomberg',
      title: 'Islakayd\'s Growth Signals New Era in Equipment Sharing',
      date: 'October 22, 2023',
      link: '#'
    },
    {
      publication: 'Reuters',
      title: 'Equipment Rental Platform Raises $50M in Series B',
      date: 'March 16, 2024',
      link: '#'
    },
    {
      publication: 'CNBC',
      title: 'How AI is Transforming the Equipment Rental Industry',
      date: 'February 10, 2024',
      link: '#'
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
                Press Center
              </h1>
              <p className="text-xl md:text-2xl text-purple-100 mb-8">
                Latest news, press releases, and media resources about Islakayd
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-white text-purple-600 hover:bg-gray-50">
                  Download Media Kit
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                  Contact Press Team
                </Button>
              </div>
            </div>
          </div>

          <div className="px-8 py-16">
            <div className="max-w-4xl mx-auto">
              {/* Press Releases */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Press Releases</h2>
                <div className="space-y-6">
                  {pressReleases.map((release, index) => (
                    <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                          {release.title}
                        </h3>
                        <span className="text-sm text-gray-500 flex items-center ml-4">
                          <Calendar className="w-4 h-4 mr-1" />
                          {release.date}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{release.summary}</p>
                      <Button variant="ghost" className="p-0 h-auto text-blue-600 hover:text-blue-800">
                        Read Full Release
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Media Coverage */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Recent Coverage</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {coverage.map((article, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-600">{article.publication}</span>
                        <span className="text-sm text-gray-500">{article.date}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 hover:text-blue-600 cursor-pointer">
                        {article.title}
                      </h3>
                      <Button variant="ghost" className="p-0 h-auto text-blue-600 hover:text-blue-800">
                        Read Article
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Media Kit */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Media Kit</h2>
                <p className="text-gray-600 mb-6">
                  Download our complete media kit including logos, photos, brand guidelines, and company information.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mediaKit.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-600">{item.type}</span>
                        <span className="text-sm text-gray-500">{item.size}</span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-3">{item.name}</h4>
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-blue-50 rounded-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Press Contact</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Media Inquiries</h3>
                    <div className="space-y-2 text-gray-600">
                      <p><strong>Email:</strong> press@islakayd.com</p>
                      <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                      <p><strong>Response Time:</strong> Within 24 hours</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Press Team</h3>
                    <div className="space-y-2 text-gray-600">
                      <p><strong>Director of Communications:</strong> Jennifer Walsh</p>
                      <p><strong>PR Manager:</strong> Michael Torres</p>
                      <p><strong>Media Relations:</strong> Sarah Kim</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-gray-600 mb-4">
                    For urgent media inquiries outside business hours, please call our 24/7 press line at +1 (555) 123-4568.
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Send Press Inquiry
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