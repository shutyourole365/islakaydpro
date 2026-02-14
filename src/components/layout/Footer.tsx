import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import LogoPro from '../branding/LogoPro';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const handleLinkClick = (label: string) => {
    switch (label) {
      case 'Browse All':
        onNavigate?.('browse');
        break;
      case 'Start Listing':
        onNavigate?.('list-equipment');
        break;
      case 'Help Center':
      case 'Contact Us':
        onNavigate?.('support');
        break;
      case 'Trust & Verification':
        onNavigate?.('trust-score');
        break;
      case 'Cancellation Policy':
        onNavigate?.('cancellation');
        break;
      case 'Safety':
        onNavigate?.('security');
        break;
      default:
        break;
    }
  };

  const footerLinks = {
    'Rent Equipment': [
      'Browse All',
      'Construction',
      'Power Tools',
      'Photography',
      'Events',
      'Vehicles',
    ],
    'List Equipment': [
      'Start Listing',
      'Pricing Calculator',
      'Insurance Options',
      'Host Resources',
      'Host Community',
    ],
    Company: [
      'About Us',
      'Careers',
      'Press',
      'Blog',
      'Partnerships',
      'Investors',
    ],
    Support: [
      'Help Center',
      'Safety',
      'Trust & Verification',
      'Contact Us',
      'Cancellation Policy',
    ],
  };

  const navigableLinks = new Set([
    'Browse All', 'Start Listing', 'Help Center', 'Contact Us',
    'Trust & Verification', 'Cancellation Policy', 'Safety',
  ]);

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-8 lg:mb-0">
            <button onClick={() => onNavigate?.('home')} className="inline-block mb-6">
              <LogoPro variant="light" size="md" showText={true} />
            </button>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              The world's most advanced equipment rental marketplace. Rent anything, anywhere, powered by AI.
            </p>
            <div className="flex items-center gap-4">
              {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-teal-500 hover:text-white transition-all duration-300"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    {navigableLinks.has(link) ? (
                      <button
                        onClick={() => handleLinkClick(link)}
                        className="text-sm text-gray-400 hover:text-teal-400 transition-colors"
                      >
                        {link}
                      </button>
                    ) : (
                      <span className="text-sm text-gray-400 hover:text-teal-400 transition-colors cursor-default">
                        {link}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="py-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              {[
                { label: 'Terms of Service', page: 'terms' },
                { label: 'Privacy Policy', page: 'privacy' },
                { label: 'Cookie Policy', page: 'cookies' },
                { label: 'Cancellation Policy', page: 'cancellation' },
                { label: 'Refund Policy', page: 'refund' },
                { label: 'Support', page: 'support' },
              ].map((item) => (
                <button
                  key={item.page}
                  onClick={() => onNavigate?.(item.page)}
                  className="text-gray-400 hover:text-teal-400 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-teal-500">
                <option>English (US)</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
              <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-teal-500">
                <option>USD $</option>
                <option>EUR</option>
                <option>GBP</option>
              </select>
            </div>
          </div>
          <p className="text-center text-gray-500 text-sm mt-6">
            2026 Islakayd, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
