import { Search, Calendar, Truck, Star, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: <Search className="w-8 h-8" />,
      title: 'Search & Discover',
      description:
        'Use our AI-powered search to find exactly what you need. Filter by category, location, price, and availability.',
      features: ['Smart recommendations', 'Real-time availability', 'Price comparison'],
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Book Instantly',
      description:
        'Select your dates, review the terms, and book with confidence. Secure payment processing and instant confirmation.',
      features: ['Instant booking', 'Secure payments', 'Flexible cancellation'],
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: 'Pick Up or Deliver',
      description:
        'Coordinate pickup from the owner or choose delivery to your location. Track your equipment in real-time.',
      features: ['Delivery options', 'GPS tracking', 'Digital agreements'],
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: 'Use & Return',
      description:
        'Get your project done with quality equipment. Return when done and leave a review to help the community.',
      features: ['24/7 support', 'Easy returns', 'Review system'],
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-surface-subtle to-surface dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold mb-4 border border-primary-100 dark:border-primary-800">
            Simple Process
          </span>
          <h2 className="font-display text-4xl font-bold text-ink dark:text-white mb-4">
            How IslaKayd Works
          </h2>
          <p className="text-xl text-ink-muted dark:text-gray-400 max-w-2xl mx-auto">
            Renting equipment has never been easier. Get started in minutes with our
            streamlined process.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full z-10">
                  <div className="flex items-center">
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-primary-200 dark:from-primary-700 to-transparent" />
                    <ArrowRight className="w-5 h-5 text-primary-300 dark:text-primary-600 -ml-2" />
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-soft border border-surface-strong dark:border-gray-700 hover:shadow-soft-lg hover:border-primary-200 dark:hover:border-primary-700 transition-all duration-300 h-full">
                <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center text-white mb-5 shadow-glow group-hover:scale-105 transition-transform duration-300">
                  {step.icon}
                </div>

                <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 font-bold text-xs mb-4 border border-primary-100 dark:border-primary-800">
                  {index + 1}
                </div>

                <h3 className="text-xl font-semibold text-ink dark:text-white mb-3">{step.title}</h3>
                <p className="text-ink-subtle dark:text-gray-400 mb-6 leading-relaxed">{step.description}</p>

                <ul className="space-y-2">
                  {step.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2 text-sm text-ink-subtle dark:text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-primary-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 px-8 py-4 bg-ink dark:bg-white text-white dark:text-ink font-semibold rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-elevated"
          >
            Start Renting Today
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
