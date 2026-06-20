import { ArrowRight, Package, DollarSign, Shield, Users } from 'lucide-react';

interface CTASectionProps {
  onGetStarted: () => void;
  onLearnMore?: () => void;
}

export default function CTASection({ onGetStarted, onLearnMore }: CTASectionProps) {
  const ownerBenefits = [
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: 'Earn Extra Income',
      description: 'Turn idle equipment into a revenue stream. Owners earn an average of $2,400/month.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Protected Rentals',
      description: 'Every rental includes up to $50,000 in protection coverage for your equipment.',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Verified Renters',
      description: 'All renters are identity-verified with background checks and reviews.',
    },
  ];

  return (
    <section className="py-28 bg-white dark:bg-gray-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-500/20 rounded-full text-sm font-semibold mb-6">
              <Package className="w-4 h-4" />
              List Your Equipment
            </span>
            <h2 className="text-4xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 leading-[1.05] text-balance">
              Turn your equipment into a <span className="text-gradient-animated">business</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 text-pretty">
              Join thousands of equipment owners who are earning money by sharing their
              tools when they're not in use. Set your own prices, availability, and rules.
            </p>

            <div className="space-y-6 mb-10">
              {ownerBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/40 dark:to-emerald-900/40 flex items-center justify-center text-teal-600 dark:text-teal-400 flex-shrink-0">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">{benefit.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <button
                onClick={onGetStarted}
                className="btn-primary px-8 py-4 text-base"
               >
                Start Listing Today
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => onLearnMore?.()}
                className="flex items-center gap-2 px-8 py-4 text-gray-700 dark:text-gray-200 font-semibold hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-300 to-emerald-300 rounded-[2rem] blur-3xl opacity-30 dark:opacity-20" />
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2rem] p-8 overflow-hidden ring-1 ring-white/10 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-[80px]" />

              <div className="relative">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Earnings Calculator
                </h3>
                <p className="text-gray-400 mb-8">
                  See how much you could earn with your equipment
                </p>

                <div className="space-y-6">
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-400">Equipment Type</span>
                      <select className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500">
                        <option>Power Tools</option>
                        <option>Construction</option>
                        <option>Photography</option>
                        <option>Vehicles</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Avg. Daily Rate</span>
                      <span className="text-2xl font-bold text-white">$75</span>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">Estimated Monthly Earnings</span>
                    </div>
                    <div className="text-4xl font-bold text-teal-400">
                      $1,500 - $3,000
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Based on 20-40 rental days per month
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white/5 rounded-xl">
                      <div className="text-2xl font-bold text-white">0%</div>
                      <div className="text-xs text-gray-500">Listing Fee</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-xl">
                      <div className="text-2xl font-bold text-white">10%</div>
                      <div className="text-xs text-gray-500">Service Fee</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-xl">
                      <div className="text-2xl font-bold text-white">$50K</div>
                      <div className="text-xs text-gray-500">Protection</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
