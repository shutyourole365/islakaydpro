/**
 * SEO Metadata Utility
 * Dynamically updates page title and meta tags for each route
 */

interface PageMeta {
  title: string;
  description: string;
  keywords?: string;
}

const pageMeta: Record<string, PageMeta> = {
  home: {
    title: 'Islakayd - AI-Powered Equipment Rental Marketplace',
    description: 'Rent any equipment, anywhere, anytime. From power tools to construction machinery — find, compare, and book with AI-powered precision. Verified owners, instant quotes, 24/7 support.',
    keywords: 'equipment rental, tool rental, construction equipment, camera rental, power tools, heavy machinery, rental marketplace',
  },
  browse: {
    title: 'Browse Equipment | Islakayd',
    description: 'Browse thousands of equipment listings — power tools, cameras, construction machinery, event supplies, and more. Filter by category, price, location, and availability.',
    keywords: 'rent equipment, browse tools, equipment listings, rental search',
  },
  dashboard: {
    title: 'Dashboard | Islakayd',
    description: 'Manage your rentals, bookings, messages, and account settings from your Islakayd dashboard.',
  },
  'list-equipment': {
    title: 'List Your Equipment | Islakayd',
    description: 'Earn money by listing your equipment on Islakayd. Reach thousands of renters, set your own prices, and manage bookings effortlessly.',
    keywords: 'list equipment, rent out tools, equipment sharing, earn money renting',
  },
  analytics: {
    title: 'Analytics | Islakayd',
    description: 'Track your rental performance, revenue, bookings, and customer insights with real-time analytics.',
  },
  subscription: {
    title: 'Pricing Plans | Islakayd',
    description: 'Choose the right Islakayd plan for your rental business. Free, Pro, and Enterprise tiers with features for every scale.',
    keywords: 'rental marketplace pricing, equipment listing plans, subscription',
  },
  about: {
    title: 'About Us | Islakayd',
    description: 'Learn about Islakayd — the AI-powered equipment rental marketplace connecting owners and renters worldwide.',
  },
  help: {
    title: 'Help Center | Islakayd',
    description: 'Get help with booking, payments, equipment listings, and account management. FAQs, guides, and 24/7 AI support.',
  },
  contact: {
    title: 'Contact Us | Islakayd',
    description: 'Get in touch with the Islakayd team. We\'re here to help with questions about rentals, partnerships, and support.',
  },
  safety: {
    title: 'Safety Center | Islakayd',
    description: 'Your safety is our priority. Learn about verified owners, insurance options, secure payments, and our trust policies.',
  },
  terms: {
    title: 'Terms of Service | Islakayd',
    description: 'Read the Islakayd Terms of Service governing use of our equipment rental marketplace platform.',
  },
  privacy: {
    title: 'Privacy Policy | Islakayd',
    description: 'Understand how Islakayd collects, uses, and protects your personal information.',
  },
  careers: {
    title: 'Careers | Islakayd',
    description: 'Join the Islakayd team. We\'re building the future of equipment rental with AI and cutting-edge technology.',
  },
  blog: {
    title: 'Blog | Islakayd',
    description: 'Tips, guides, and industry insights for equipment renters and owners. Stay updated with the Islakayd blog.',
  },
  'pricing-calculator': {
    title: 'Pricing Calculator | Islakayd',
    description: 'Estimate your rental costs with our pricing calculator. Compare daily, weekly, and monthly rates for any equipment.',
  },
  'equipment-health': {
    title: 'Equipment Health Score | Islakayd',
    description: 'Monitor equipment condition and maintenance status with AI-powered health scoring.',
  },
  'cost-estimator': {
    title: 'Rental Cost Estimator | Islakayd',
    description: 'Calculate total rental costs including delivery, insurance, and deposits before you book.',
  },
  'seasonal-deals': {
    title: 'Seasonal Deals | Islakayd',
    description: 'Save on equipment rentals with seasonal promotions and special offers from verified owners.',
  },
};

/**
 * Update the document title and meta description for the current page.
 * Call this when the page/route changes.
 */
export function updatePageMeta(page: string): void {
  const meta = pageMeta[page] || pageMeta.home;

  document.title = meta.title;

  // Update meta description
  let descTag = document.querySelector('meta[name="description"]');
  if (descTag) {
    descTag.setAttribute('content', meta.description);
  }

  // Update meta keywords if available
  if (meta.keywords) {
    let keywordsTag = document.querySelector('meta[name="keywords"]');
    if (keywordsTag) {
      keywordsTag.setAttribute('content', meta.keywords);
    }
  }

  // Update OG tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', meta.title);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', meta.description);

  // Update Twitter tags
  const twTitle = document.querySelector('meta[property="twitter:title"]');
  if (twTitle) twTitle.setAttribute('content', meta.title);

  const twDesc = document.querySelector('meta[property="twitter:description"]');
  if (twDesc) twDesc.setAttribute('content', meta.description);
}
