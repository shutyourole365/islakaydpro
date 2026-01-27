import { useState } from 'react';
import {
  Crown,
  Check,
  Star,
  Zap,
  Shield,
  Gift,
  Percent,
  Clock,
  HeadphonesIcon,
  Truck,
  Award,
  ChevronRight,
  Sparkles,
  XCircle,
  CreditCard,
  Calendar,
} from 'lucide-react';

interface SubscriptionPlansProps {
  currentPlan?: string;
  onSelect?: (plan: SubscriptionPlan) => void;
  onClose?: () => void;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'free' | 'pro' | 'business' | 'enterprise';
  monthlyPrice: number;
  yearlyPrice: number;
  features: PlanFeature[];
  limits: PlanLimits;
  badge?: string;
  popular?: boolean;
}

interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

interface PlanLimits {
  monthlyBookings: number | 'unlimited';
  listings: number | 'unlimited';
  savedSearches: number | 'unlimited';
  messageThreads: number | 'unlimited';
  discountPercent: number;
  prioritySupport: boolean;
  freeDelivery: boolean;
  insuranceDiscount: number;
}

export default function SubscriptionPlans({
  currentPlan = 'free',
  onSelect,
  onClose,
}: SubscriptionPlansProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      tier: 'free',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        { text: 'Browse all equipment', included: true },
        { text: 'Basic search filters', included: true },
        { text: 'Standard support', included: true },
        { text: 'Up to 3 active bookings', included: true },
        { text: 'Priority booking access', included: false },
        { text: 'Rental discounts', included: false },
        { text: 'Free delivery', included: false },
        { text: 'Insurance discounts', included: false },
      ],
      limits: {
        monthlyBookings: 3,
        listings: 2,
        savedSearches: 5,
        messageThreads: 10,
        discountPercent: 0,
        prioritySupport: false,
        freeDelivery: false,
        insuranceDiscount: 0,
      },
    },
    {
      id: 'pro',
      name: 'Pro',
      tier: 'pro',
      monthlyPrice: 19.99,
      yearlyPrice: 179.99,
      popular: true,
      badge: 'Most Popular',
      features: [
        { text: 'Everything in Free', included: true },
        { text: 'Unlimited bookings', included: true, highlight: true },
        { text: '10% off all rentals', included: true, highlight: true },
        { text: 'Priority customer support', included: true },
        { text: 'Early access to new listings', included: true },
        { text: 'Up to 10 equipment listings', included: true },
        { text: 'Free delivery on orders $100+', included: true },
        { text: 'Basic insurance discount (5%)', included: true },
      ],
      limits: {
        monthlyBookings: 'unlimited',
        listings: 10,
        savedSearches: 50,
        messageThreads: 'unlimited',
        discountPercent: 10,
        prioritySupport: true,
        freeDelivery: true,
        insuranceDiscount: 5,
      },
    },
    {
      id: 'business',
      name: 'Business',
      tier: 'business',
      monthlyPrice: 49.99,
      yearlyPrice: 479.99,
      badge: 'Best Value',
      features: [
        { text: 'Everything in Pro', included: true },
        { text: '20% off all rentals', included: true, highlight: true },
        { text: 'Unlimited equipment listings', included: true, highlight: true },
        { text: 'Dedicated account manager', included: true },
        { text: 'API access', included: true },
        { text: 'Team accounts (up to 5)', included: true },
        { text: 'Free delivery on all orders', included: true },
        { text: 'Premium insurance discount (15%)', included: true, highlight: true },
      ],
      limits: {
        monthlyBookings: 'unlimited',
        listings: 'unlimited',
        savedSearches: 'unlimited',
        messageThreads: 'unlimited',
        discountPercent: 20,
        prioritySupport: true,
        freeDelivery: true,
        insuranceDiscount: 15,
      },
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      tier: 'enterprise',
      monthlyPrice: 199.99,
      yearlyPrice: 1919.99,
      features: [
        { text: 'Everything in Business', included: true },
        { text: 'Custom pricing & terms', included: true, highlight: true },
        { text: 'Unlimited team members', included: true },
        { text: 'White-label options', included: true },
        { text: 'Custom integrations', included: true },
        { text: '24/7 phone support', included: true, highlight: true },
        { text: 'SLA guarantee', included: true },
        { text: 'Quarterly business reviews', included: true },
      ],
      limits: {
        monthlyBookings: 'unlimited',
        listings: 'unlimited',
        savedSearches: 'unlimited',
        messageThreads: 'unlimited',
        discountPercent: 25,
        prioritySupport: true,
        freeDelivery: true,
        insuranceDiscount: 20,
      },
    },
  ];

  const getPrice = (plan: SubscriptionPlan) => {
    return billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const getMonthlyEquivalent = (plan: SubscriptionPlan) => {
    return billingCycle === 'yearly' ? plan.yearlyPrice / 12 : plan.monthlyPrice;
  };

  const getSavings = (plan: SubscriptionPlan) => {
    if (plan.monthlyPrice === 0) return 0;
    const yearlyTotal = plan.yearlyPrice;
    const monthlyTotal = plan.monthlyPrice * 12;
    return Math.round(((monthlyTotal - yearlyTotal) / monthlyTotal) * 100);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'from-gray-400 to-gray-500';
      case 'pro': return 'from-blue-500 to-cyan-500';
      case 'business': return 'from-purple-500 to-pink-500';
      case 'enterprise': return 'from-amber-500 to-orange-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'free': return <Star className="w-5 h-5" />;
      case 'pro': return <Zap className="w-5 h-5" />;
      case 'business': return <Crown className="w-5 h-5" />;
      case 'enterprise': return <Award className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  const handleSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan.id);
    if (onSelect) {
      onSelect(plan);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-violet-600 to-purple-600 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Membership Plans</h2>
              <p className="text-sm text-white/80">Unlock exclusive benefits</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 bg-white/10 rounded-xl p-2">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-white text-purple-600'
                : 'text-white/80'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              billingCycle === 'yearly'
                ? 'bg-white text-purple-600'
                : 'text-white/80'
            }`}
          >
            Yearly
            <span className="ml-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
              Save 25%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="p-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const isSelected = selectedPlan === plan.id;
            const savings = getSavings(plan);

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-6 transition-all ${
                  plan.popular
                    ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                    : isSelected
                    ? 'border-purple-500'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {plan.badge}
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getTierColor(plan.tier)} text-white flex items-center justify-center mb-4`}>
                  {getTierIcon(plan.tier)}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                
                <div className="mb-4">
                  {plan.monthlyPrice === 0 ? (
                    <div className="text-3xl font-bold text-gray-900">Free</div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">
                          ${getMonthlyEquivalent(plan).toFixed(2)}
                        </span>
                        <span className="text-gray-500">/mo</span>
                      </div>
                      {billingCycle === 'yearly' && savings > 0 && (
                        <p className="text-sm text-green-600 font-medium">
                          Save {savings}% with yearly billing
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Key Limits */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <div className="font-semibold text-gray-900">
                      {plan.limits.monthlyBookings === 'unlimited' ? '∞' : plan.limits.monthlyBookings}
                    </div>
                    <div className="text-xs text-gray-500">Bookings/mo</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <div className="font-semibold text-gray-900">
                      {plan.limits.discountPercent}%
                    </div>
                    <div className="text-xs text-gray-500">Discount</div>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {plan.features.slice(0, 5).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      {feature.included ? (
                        <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                          feature.highlight ? 'text-purple-500' : 'text-green-500'
                        }`} />
                      ) : (
                        <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-300" />
                      )}
                      <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelect(plan)}
                  disabled={isCurrent}
                  className={`w-full py-3 rounded-xl font-medium transition-all ${
                    isCurrent
                      ? 'bg-gray-100 text-gray-500 cursor-default'
                      : plan.popular
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : 
                   plan.monthlyPrice === 0 ? 'Get Started' : 
                   plan.id === 'enterprise' ? 'Contact Sales' : 'Upgrade'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Benefits Overview */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-500" />
            Member Benefits
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Percent className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Up to 25% Off</p>
                <p className="text-sm text-gray-600">On all rentals</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Truck className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Free Delivery</p>
                <p className="text-sm text-gray-600">On qualifying orders</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Shield className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Insurance Savings</p>
                <p className="text-sm text-gray-600">Up to 20% off coverage</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <HeadphonesIcon className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Priority Support</p>
                <p className="text-sm text-gray-600">Fast response times</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Questions? Check our{' '}
            <a href="#" className="text-purple-600 font-medium hover:underline">
              Membership FAQ
            </a>
            {' '}or{' '}
            <a href="#" className="text-purple-600 font-medium hover:underline">
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
