import { ArrowLeft, Search, MessageCircle, FileText, Phone, Mail, Clock } from 'lucide-react';
import { Button } from '../ui/Button';

interface HelpCenterProps {
  onBack: () => void;
}

export default function HelpCenter({ onBack }: HelpCenterProps) {
  const categories = [
    {
      title: 'Getting Started',
      description: 'New to Islakayd? Learn the basics of renting and listing equipment.',
      articles: ['How to create an account', 'Verifying your identity', 'Understanding fees', 'Platform tour']
    },
    {
      title: 'Renting Equipment',
      description: 'Everything you need to know about finding and booking equipment.',
      articles: ['How to search for equipment', 'Booking process', 'Payment methods', 'Cancellation policy']
    },
    {
      title: 'Listing Equipment',
      description: 'Tips and guides for equipment owners looking to rent out their gear.',
      articles: ['Creating your first listing', 'Setting competitive prices', 'Equipment photography', 'Managing bookings']
    },
    {
      title: 'Safety & Insurance',
      description: 'Important information about equipment safety and insurance coverage.',
      articles: ['Equipment safety guidelines', 'Insurance coverage options', 'Damage reporting', 'Claims process']
    },
    {
      title: 'Payments & Billing',
      description: 'Understanding payments, fees, and how to manage your account.',
      articles: ['Payment processing', 'Fee structure', 'Refunds and disputes', 'Billing history']
    },
    {
      title: 'Account & Profile',
      description: 'Manage your account settings, profile, and preferences.',
      articles: ['Profile settings', 'Notification preferences', 'Privacy settings', 'Account security']
    }
  ];

  const popularArticles = [
    'How to book equipment on Islakayd',
    'Understanding our insurance coverage',
    'What fees does Islakayd charge?',
    'How to list my equipment for rent',
    'What happens if equipment gets damaged?',
    'How do I contact the equipment owner?',
    'Changing or canceling a booking',
    'Getting verified on Islakayd'
  ];

  const contactOptions = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      availability: '24/7 available',
      action: 'Start Chat'
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email Support',
      description: 'Send us a detailed message about your issue',
      availability: 'Response within 24 hours',
      action: 'Send Email'
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Phone Support',
      description: 'Speak directly with a support specialist',
      availability: 'Mon-Fri, 9AM-6PM EST',
      action: 'Call Now'
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Help Articles',
      description: 'Browse our comprehensive knowledge base',
      availability: 'Always available',
      action: 'Browse Articles'
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
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Help Center
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8">
                Find answers to your questions and get the help you need
              </p>
              <div className="max-w-md mx-auto relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for help..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="px-8 py-16">
            <div className="max-w-4xl mx-auto">
              {/* Popular Articles */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Popular Articles</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {popularArticles.map((article, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 cursor-pointer transition-colors">
                      <h3 className="font-medium text-gray-900 hover:text-blue-600">{article}</h3>
                    </div>
                  ))}
                </div>
              </div>

              {/* Help Categories */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Browse by Category</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{category.title}</h3>
                      <p className="text-gray-600 mb-4">{category.description}</p>
                      <ul className="space-y-2">
                        {category.articles.map((article, idx) => (
                          <li key={idx} className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                            {article}
                          </li>
                        ))}
                      </ul>
                      <Button variant="ghost" className="mt-4 p-0 h-auto text-blue-600 hover:text-blue-800">
                        View all articles →
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Options */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Contact Support</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {contactOptions.map((option, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        {option.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
                      <p className="text-gray-600 mb-3">{option.description}</p>
                      <p className="text-sm text-green-600 mb-4">{option.availability}</p>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        {option.action}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Support Hours */}
              <div className="bg-blue-50 rounded-lg p-8">
                <div className="text-center mb-6">
                  <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Support Hours</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
                    <p className="text-gray-600">24 hours a day, 7 days a week</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
                    <p className="text-gray-600">Monday - Friday, 9:00 AM - 6:00 PM EST</p>
                    <p className="text-sm text-gray-500">Response within 24 hours</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
                    <p className="text-gray-600">Monday - Friday, 9:00 AM - 6:00 PM EST</p>
                    <p className="text-sm text-gray-500">For urgent issues only</p>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <p className="text-gray-600 mb-4">
                    Can't find what you're looking for? Our support team is here to help.
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Contact Support
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