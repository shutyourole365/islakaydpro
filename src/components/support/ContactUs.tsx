import { ArrowLeft, Mail, Phone, MapPin, MessageCircle, Clock, Send } from 'lucide-react';
import { Button } from '../ui/Button';

interface ContactUsProps {
  onBack: () => void;
}

export default function ContactUs({ onBack }: ContactUsProps) {
  const contactMethods = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      availability: '24/7 available',
      action: 'Start Chat',
      response: 'Instant'
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email Support',
      description: 'Send us a detailed message about your issue',
      availability: 'Mon-Fri, 9AM-6PM AEST',
      action: 'Send Email',
      response: 'Within 24 hours'
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Phone Support',
      description: 'Speak directly with a support specialist',
      availability: 'Mon-Fri, 9AM-6PM AEST',
      action: 'Call Now',
      response: 'Immediate'
    }
  ];

  const departments = [
    {
      name: 'General Support',
      email: 'support@islakayd.com',
      description: 'Questions about using the platform, bookings, or listings'
    },
    {
      name: 'Technical Issues',
      email: 'tech@islakayd.com',
      description: 'Website bugs, app problems, or technical difficulties'
    },
    {
      name: 'Billing & Payments',
      email: 'billing@islakayd.com',
      description: 'Payment issues, refunds, billing inquiries'
    },
    {
      name: 'Safety & Trust',
      email: 'safety@islakayd.com',
      description: 'Safety concerns, disputes, verification issues'
    },
    {
      name: 'Partnerships',
      email: 'partnerships@islakayd.com',
      description: 'Business partnerships, integrations, collaborations'
    },
    {
      name: 'Press & Media',
      email: 'press@islakayd.com',
      description: 'Media inquiries, press releases, interviews'
    }
  ];

  const offices = [
    {
      city: 'Sydney, NSW',
      address: 'Level 25, 123 Pitt Street\nSydney, NSW 2000',
      phone: '+61 2 1234 5678',
      type: 'Headquarters'
    },
    {
      city: 'Melbourne, VIC',
      address: 'Level 15, 456 Collins Street\nMelbourne, VIC 3000',
      phone: '+61 3 9876 5432',
      type: 'Operations Center'
    },
    {
      city: 'Brisbane, QLD',
      address: 'Level 10, 789 Queen Street\nBrisbane, QLD 4000',
      phone: '+61 7 5555 1234',
      type: 'Regional Office'
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
                Contact Us
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8">
                We're here to help. Get in touch with our team through your preferred method.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-blue-100">Live Chat Support</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl font-bold">1 Hour</div>
                  <div className="text-blue-100">Average Response</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl font-bold">150+</div>
                  <div className="text-blue-100">Countries Served</div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-16">
            <div className="max-w-4xl mx-auto">
              {/* Contact Methods */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How Can We Help?</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {contactMethods.map((method, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        {method.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.title}</h3>
                      <p className="text-gray-600 mb-3">{method.description}</p>
                      <p className="text-sm text-green-600 mb-2">{method.availability}</p>
                      <p className="text-sm text-gray-500 mb-4">Response: {method.response}</p>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        {method.action}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Form */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Send Us a Message</h2>
                <div className="bg-gray-50 rounded-lg p-8">
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option>General Inquiry</option>
                        <option>Technical Support</option>
                        <option>Billing Question</option>
                        <option>Safety Concern</option>
                        <option>Partnership Opportunity</option>
                        <option>Press Inquiry</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Please describe your question or issue in detail..."
                        required
                      ></textarea>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="newsletter"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="newsletter" className="ml-2 text-sm text-gray-600">
                        Subscribe to our newsletter for updates and tips
                      </label>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </div>
              </div>

              {/* Department Contacts */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Department Contacts</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {departments.map((dept, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{dept.name}</h3>
                      <p className="text-blue-600 font-medium mb-1">{dept.email}</p>
                      <p className="text-gray-600 text-sm">{dept.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Office Locations */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Offices</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {offices.map((office, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center mb-3">
                        <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">{office.city}</h3>
                      </div>
                      <p className="text-sm text-blue-600 font-medium mb-2">{office.type}</p>
                      <p className="text-gray-600 text-sm mb-3 whitespace-pre-line">{office.address}</p>
                      <p className="text-gray-600 text-sm">
                        <Phone className="w-4 h-4 inline mr-1" />
                        {office.phone}
                      </p>
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
                    <p className="text-sm text-green-600">Always available</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Email & Phone</h3>
                    <p className="text-gray-600">Monday - Friday</p>
                    <p className="text-gray-600">9:00 AM - 6:00 PM EST</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Emergency Support</h3>
                    <p className="text-gray-600">Critical issues only</p>
                    <p className="text-sm text-red-600">24/7 for safety concerns</p>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <p className="text-gray-600 mb-4">
                    Need urgent help? Our emergency line is available 24/7 for safety and security issues.
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Emergency Support: 1-800-ISLAKAYD
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