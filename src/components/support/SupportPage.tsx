import React, { useState } from 'react';
import {
  ArrowLeft, Mail, Phone, MessageCircle, HelpCircle, BookOpen, Shield,
  ChevronDown, ChevronUp, Search, ExternalLink, Clock, MapPin
} from 'lucide-react';

interface SupportPageProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
}

const faqs = [
  {
    question: 'How do I rent equipment on Islakayd?',
    answer: 'Browse our marketplace, select the equipment you need, choose your rental dates, and complete the booking. You can pay securely through our platform and arrange pickup or delivery with the equipment owner.',
  },
  {
    question: 'What happens if the equipment is damaged during my rental?',
    answer: 'All rentals include basic protection. If damage occurs, report it immediately through the app. Our damage assessment team will review the case. You may be responsible for repair costs depending on the circumstances and your insurance coverage.',
  },
  {
    question: 'How do I cancel a booking?',
    answer: 'Go to your Dashboard, find the booking, and click Cancel. Refund amounts depend on how far in advance you cancel. See our Cancellation Policy for full details on refund windows.',
  },
  {
    question: 'How do I list my equipment for rent?',
    answer: 'Click "List Equipment" from the navigation menu. Add photos, a description, set your daily rate, and define availability. Once submitted, your listing goes live and renters can start booking.',
  },
  {
    question: 'Is my payment information secure?',
    answer: 'Yes. All payments are processed through Stripe, a PCI-compliant payment processor. We never store your full credit card details on our servers.',
  },
  {
    question: 'What if the equipment is not as described in the listing?',
    answer: 'If the equipment significantly differs from the listing, you can report it within 24 hours of pickup. You may be eligible for a full refund under our Refund Policy.',
  },
  {
    question: 'How do I contact an equipment owner?',
    answer: 'Once you have an active booking or inquiry, you can message the owner directly through our in-app messaging system from the equipment detail page or your dashboard.',
  },
  {
    question: 'What are the service fees?',
    answer: 'Renters pay a service fee of 10-15% on top of the rental price. Equipment owners pay a 5% platform fee on each completed booking. These fees help maintain the platform, provide insurance coverage, and offer customer support.',
  },
];

const SupportPage: React.FC<SupportPageProps> = ({ onBack, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredFaqs = searchQuery
    ? faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
            <HelpCircle className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">How can we help?</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions or get in touch with our team.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: Mail,
              title: 'Email Support',
              description: 'Get a response within 24 hours',
              action: 'support@islakayd.com',
              href: 'mailto:support@islakayd.com',
            },
            {
              icon: Phone,
              title: 'Phone Support',
              description: 'Mon-Fri, 9 AM - 6 PM EST',
              action: '1-800-ISLAKAYD',
              href: 'tel:1-800-475-2529',
            },
            {
              icon: MessageCircle,
              title: 'Live Chat',
              description: 'Chat with our team in real time',
              action: 'Start Chat',
              href: '#',
            },
          ].map((channel) => (
            <a
              key={channel.title}
              href={channel.href}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:border-teal-300 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
                <channel.icon className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{channel.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{channel.description}</p>
              <span className="text-sm font-medium text-teal-600 flex items-center gap-1">
                {channel.action}
                <ExternalLink className="w-3.5 h-3.5" />
              </span>
            </a>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {[
            { icon: BookOpen, label: 'Terms of Service', page: 'terms' },
            { icon: Shield, label: 'Privacy Policy', page: 'privacy' },
            { icon: Clock, label: 'Cancellation Policy', page: 'cancellation' },
            { icon: MapPin, label: 'Refund Policy', page: 'refund' },
          ].map((link) => (
            <button
              key={link.page}
              onClick={() => onNavigate(link.page)}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:border-teal-300 hover:shadow-sm transition-all text-left flex items-center gap-3"
            >
              <link.icon className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">{link.label}</span>
            </button>
          ))}
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-3">
            {filteredFaqs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No results found for "{searchQuery}". Try a different search or contact us directly.
              </div>
            )}
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-5 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Still need help?</h2>
          <p className="text-gray-600 mb-6">
            Our support team is here for you. Reach out and we will get back to you as soon as possible.
          </p>
          <a
            href="mailto:support@islakayd.com"
            className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            <Mail className="w-5 h-5" />
            Email Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
