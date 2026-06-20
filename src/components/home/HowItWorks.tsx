import { Search, Calendar, Truck, Star, ArrowRight, CheckCircle2 } from 'lucide-react';

interface HowItWorksProps {
  onGetStarted?: () => void;
}

export default function HowItWorks({ onGetStarted }: HowItWorksProps) {
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
    <section id="how-it-works" className="py-28 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 text-teal-700 dark:text-teal-300 ring-1 ring-inset ring-teal-500/20 rounded-full text-sm font-semibold mb-5">
            Simple Process
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-5 text-balance">
            How Islakayd <span className="text-gradient-animated">Works</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-pretty">
            Renting equipment has never been easier. Get started in minutes with our
            streamlined process.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full z-0">
                  <div className="flex items-center">
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-teal-300 to-transparent dark:from-teal-700" />
                    <ArrowRight className="w-5 h-5 text-teal-400 dark:text-teal-600 -ml-2" />
                  </div>
                </div>
              )}

              <div className="relative z-10 bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-soft border border-gray-100 dark:border-gray-700 hover:shadow-brand-lg hover:border-teal-200 dark:hover:border-teal-800/60 hover:-translate-y-2 transition-all duration-300 h-full">
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-500 flex items-center justify-center text-white mb-6 shadow-brand group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                  <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-7 h-7 rounded-full bg-white dark:bg-gray-800 text-teal-600 dark:text-teal-400 font-bold text-sm ring-2 ring-teal-500/30 shadow-sm">
                    {index + 1}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{step.description}</p>

                <ul className="space-y-2">
                  {step.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
                    >
                      <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button
            onClick={() => onGetStarted?.()}
            className="btn-primary px-8 py-4 text-base"
          >
            Start Renting Today
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
