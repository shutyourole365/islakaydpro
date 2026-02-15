import { useState } from 'react';
import { ChevronDown, ChevronRight, Search, MessageSquare, Phone, Mail } from 'lucide-react';
import { Button } from '../ui/AccessibleComponents';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How do I create an account?",
    answer: "Click the 'Sign Up' button in the top right corner. Fill in your details, verify your email, and complete your profile with ID verification for full access."
  },
  {
    question: "How do I list my equipment for rent?",
    answer: "Go to your dashboard and click 'List Equipment'. Fill in the details, upload photos, set pricing, and submit. Your listing will be reviewed before going live."
  },
  {
    question: "How does payment work?",
    answer: "Payments are processed securely through Stripe. Renters pay the full amount upfront. Owners receive payment after the rental period, minus our service fee."
  },
  {
    question: "What if equipment gets damaged?",
    answer: "All rentals include damage protection. Use our damage report wizard to document any issues. Claims are processed within 5-7 business days."
  },
  {
    question: "How do I cancel a booking?",
    answer: "Go to 'My Bookings' in your dashboard, select the booking, and click 'Cancel'. Refund amounts depend on timing - check our cancellation policy."
  },
  {
    question: "Is my equipment insured?",
    answer: "We offer optional insurance coverage. You can also use your own insurance. We recommend having adequate coverage for high-value equipment."
  }
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions and get the help you need.
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <MessageSquare className="w-12 h-12 text-teal-500 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-gray-600 text-sm mb-4">
              Get instant help from our support team
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Start Chat
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <Mail className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
            <p className="text-gray-600 text-sm mb-4">
              Send us a detailed message
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Send Email
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <Phone className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
            <p className="text-gray-600 text-sm mb-4">
              Speak with an expert
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Call Now
            </Button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>

          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {expandedFAQ === index ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </button>

                {expandedFAQ === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No results found for "{searchQuery}"</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="mt-4"
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="mb-6 opacity-90">
            Our support team is here to help you with any questions or issues you might have.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg">
              Contact Support
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-teal-500">
              View All Guides
            </Button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-teal-500 hover:text-teal-600">Creating Your Account</a></li>
              <li><a href="#" className="text-teal-500 hover:text-teal-600">Listing Your First Equipment</a></li>
              <li><a href="#" className="text-teal-500 hover:text-teal-600">Finding and Booking Equipment</a></li>
              <li><a href="#" className="text-teal-500 hover:text-teal-600">Payment and Billing</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Safety & Security</h3>
            <ul className="space-y-2">
              <li><a href="/policies/DMCA_POLICY.md" className="text-teal-500 hover:text-teal-600">DMCA Policy</a></li>
              <li><a href="/policies/ACCEPTABLE_USE_POLICY.md" className="text-teal-500 hover:text-teal-600">Acceptable Use Policy</a></li>
              <li><a href="/policies/PRIVACY_POLICY.md" className="text-teal-500 hover:text-teal-600">Privacy & Security</a></li>
              <li><a href="/policies/CANCELLATION_POLICY.md" className="text-teal-500 hover:text-teal-600">Cancellation Policy</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}