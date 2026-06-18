import { ShieldCheck, Star, Zap } from 'lucide-react';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from '../ui/BrandIcons';
import LogoPro from '../branding/LogoPro';

const socialLinks = [
  { Icon: Facebook, url: import.meta.env.VITE_FACEBOOK_URL, label: 'Facebook' },
  { Icon: Twitter, url: import.meta.env.VITE_TWITTER_URL, label: 'Twitter' },
  { Icon: Instagram, url: import.meta.env.VITE_INSTAGRAM_URL, label: 'Instagram' },
  { Icon: Linkedin, url: import.meta.env.VITE_LINKEDIN_URL, label: 'LinkedIn' },
  { Icon: Youtube, url: import.meta.env.VITE_YOUTUBE_URL, label: 'YouTube' },
].filter(s => s.url);

const trustBadges = [
  { Icon: ShieldCheck, label: 'Verified owners & renters' },
  { Icon: Star, label: 'Reviewed by real customers' },
  { Icon: Zap, label: 'Instant booking available' },
];

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const footerLinks = {
    'Rent Equipment': [
      { label: 'Browse All', page: 'browse' },
      { label: 'Wanted Requests', page: 'requests' },
      { label: 'Construction', page: 'browse' },
      { label: 'Power Tools', page: 'browse' },
      { label: 'Photography', page: 'browse' },
      { label: 'Events', page: 'browse' },
    ],
    'List Equipment': [
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

  const legalLinks = [
    { label: 'Terms of Service', page: 'terms' },
    { label: 'Privacy Policy', page: 'privacy' },
    { label: 'Cookie Policy', page: 'cookies' },
    { label: 'Refund Policy', page: 'refund' },
    { label: 'Accessibility', page: 'accessibility' },
  ];

  return (
    <footer className="relative bg-gray-950 text-gray-300">
      <div className="h-1 w-full bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust strip */}
        <div className="py-6 border-b border-gray-800/80 flex flex-wrap items-center justify-center md:justify-between gap-4">
          {trustBadges.map(({ Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-gray-400">
              <span className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-teal-400" />
              </span>
              {label}
            </div>
          ))}
        </div>

        <div className="py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-8 lg:mb-0">
            <button onClick={() => onNavigate?.('home')} aria-label="Go to home page" className="inline-block mb-6">
              <LogoPro variant="light" size="md" showText={true} />
            </button>
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
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-teal-500 hover:text-white transition-all duration-300"
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
                      onClick={() => onNavigate?.(link.page)}
                      className="text-sm text-gray-400 hover:text-teal-400 transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="py-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              {legalLinks.map(({ label, page }) => (
                <button
                  key={label}
                  onClick={() => onNavigate?.(page)}
                  className="text-gray-400 hover:text-teal-400 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <select
                aria-label="Language"
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-teal-500"
              >
                <option>English (AU)</option>
                <option>English (US)</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
              <select
                aria-label="Currency"
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-teal-500"
              >
                <option>AUD $</option>
                <option>USD $</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>NZD $</option>
              </select>
            </div>
          </div>
          <p className="text-center text-gray-500 text-sm mt-6">
            © {new Date().getFullYear()} Islakayd Pty Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
