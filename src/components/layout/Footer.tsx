import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import Logo from '../ui/Logo';

const socialLinks = [
  { Icon: Facebook, url: import.meta.env.VITE_FACEBOOK_URL, label: 'Facebook' },
  { Icon: Twitter, url: import.meta.env.VITE_TWITTER_URL, label: 'Twitter' },
  { Icon: Instagram, url: import.meta.env.VITE_INSTAGRAM_URL, label: 'Instagram' },
  { Icon: Linkedin, url: import.meta.env.VITE_LINKEDIN_URL, label: 'LinkedIn' },
  { Icon: Youtube, url: import.meta.env.VITE_YOUTUBE_URL, label: 'YouTube' },
].filter(s => s.url);

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const footerLinks = {
    'Rent Equipment': [
      { label: 'Browse All', page: 'browse' },
      { label: 'Construction', page: 'browse', category: 'construction' },
      { label: 'Power Tools', page: 'browse', category: 'power-tools' },
      { label: 'Photography', page: 'browse', category: 'photography' },
      { label: 'Events', page: 'browse', category: 'events' },
      { label: 'Vehicles', page: 'browse', category: 'vehicles' },
    ],
    'List Equipment': [
      { label: 'Why list your gear', page: 'owners' },
      { label: 'Start Listing', page: 'list-equipment' },
      { label: 'Pricing Calculator', page: 'pricing-calculator' },
      { label: 'Insurance Options', page: 'insurance' },
      { label: 'Host Resources', page: 'host-resources' },
      { label: 'Host Community', page: 'host-community' },
    ],
    Company: [
      { label: 'About Us', page: 'about' },
      { label: 'Careers', page: 'careers' },
      { label: 'Press', page: 'press' },
      { label: 'Blog', page: 'blog' },
      { label: 'Partnerships', page: 'partnerships' },
      { label: 'Investors', page: 'investors' },
    ],
    Support: [
      { label: 'Help Center', page: 'help' },
      { label: 'Safety', page: 'safety' },
      { label: 'Trust & Verification', page: 'trust' },
      { label: 'Contact Us', page: 'contact' },
      { label: 'Cancellation Policy', page: 'cancellation' },
    ],
  };

  return (
    <footer className="bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-gray-300 border-t border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 animate-fade-in">
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-8 lg:mb-0">
            <a href="/" className="inline-block mb-6">
              <Logo size="md" inverse />
            </a>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              The world's most advanced equipment rental marketplace. Rent anything, anywhere, powered by AI.
            </p>
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-4">
                {socialLinks.map(({ Icon, url, label }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center text-gray-400 hover:from-teal-500 hover:to-cyan-500 hover:text-white transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl hover:shadow-teal-500/30"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <button

                      onClick={() => {
                        if (link.page) {
                          onNavigate?.(link.page);
                        }
                      }}
                      className="text-sm text-gray-400 hover:text-teal-400 transition-all duration-300 text-left hover:translate-x-1"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="py-8 border-t border-gray-800/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <button

                onClick={() => onNavigate?.('terms')}
                className="text-gray-400 hover:text-teal-400 transition-all duration-300 hover:translate-y-[-2px]"
              >
                Terms of Service
              </button>
              <button

                onClick={() => onNavigate?.('privacy')}
                className="text-gray-400 hover:text-teal-400 transition-all duration-300 hover:translate-y-[-2px]"
              >
                Privacy Policy
              </button>
              <button

                onClick={() => onNavigate?.('cookies')}
                className="text-gray-400 hover:text-teal-400 transition-all duration-300 hover:translate-y-[-2px]"
              >
                Cookie Policy
              </button>
              <button

                onClick={() => onNavigate?.('refund')}
                className="text-gray-400 hover:text-teal-400 transition-all duration-300 hover:translate-y-[-2px]"
              >
                Refund Policy
              </button>
              <button

                onClick={() => onNavigate?.('accessibility')}
                className="text-gray-400 hover:text-teal-400 transition-all duration-300 hover:translate-y-[-2px]"
              >
                Accessibility
              </button>
            </div>
            <div className="flex items-center gap-4">
              <select className="bg-gray-800/80 border border-gray-700/60 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 transition-all duration-300">
                <option>English (AU)</option>
                <option>English (US)</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
              <select className="bg-gray-800/80 border border-gray-700/60 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 transition-all duration-300">
                <option>AUD $</option>
                <option>USD $</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>NZD $</option>
              </select>
            </div>
          </div>
          <p className="text-center text-gray-500 text-sm mt-6">
            2024 Islakayd Pty Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
