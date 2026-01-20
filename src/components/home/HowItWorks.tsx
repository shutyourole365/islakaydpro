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
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-full text-sm font-medium mb-4">
            Simple Process
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How Islakayd Works</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Renting equipment has never been easier. Get started in minutes with our
            streamlined process.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full">
                  <div className="flex items-center">
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-teal-200 to-transparent" />
                    <ArrowRight className="w-5 h-5 text-teal-300 -ml-2" />
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-teal-100 transition-all duration-300 h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white mb-6">
                  {step.icon}
                </div>

                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-50 text-teal-600 font-bold text-sm mb-4">
                  {index + 1}
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 mb-6">{step.description}</p>

                <ul className="space-y-2">
                  {step.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center gap-2 text-sm text-gray-500"
                    >
                      <CheckCircle2 className="w-4 h-4 text-teal-500" />
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
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors"
          >
            Start Renting Today
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
