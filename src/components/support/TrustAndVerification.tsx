import { ArrowLeft, Shield, CheckCircle, Star, Users, Lock, Eye } from 'lucide-react';
import { Button } from '../ui/Button';

interface TrustAndVerificationProps {
  onBack: () => void;
}

export default function TrustAndVerification({ onBack }: TrustAndVerificationProps) {
  const trustFeatures = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Identity Verification',
      description: 'All users undergo thorough identity verification to ensure legitimacy and build trust.',
      details: ['Government ID verification', 'Address confirmation', 'Phone number validation', 'Email verification']
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: 'Review System',
      description: 'Comprehensive rating and review system helps users make informed decisions.',
      details: ['5-star rating system', 'Detailed written reviews', 'Photo verification of reviews', 'Review response system']
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: 'Equipment Verification',
      description: 'All equipment listings are verified for quality, safety, and authenticity.',
      details: ['Professional inspections', 'Maintenance records review', 'Safety compliance checks', 'Photo verification']
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: 'Secure Payments',
      description: 'Bank-level security protects all transactions and financial information.',
      details: ['256-bit SSL encryption', 'PCI DSS compliance', 'Fraud detection systems', 'Secure payment processing']
    }
  ];

  const verificationLevels = [
    {
      level: 'Basic',
      requirements: ['Email verification', 'Phone number confirmation'],
      benefits: ['Access to basic features', 'Standard support', 'Community access'],
      badge: 'Bronze'
    },
    {
      level: 'Verified',
      requirements: ['Government ID verification', 'Address confirmation', 'Profile completion'],
      benefits: ['Priority customer support', 'Higher visibility in searches', 'Insurance discounts', 'Advanced features access'],
      badge: 'Silver'
    },
    {
      level: 'Trusted',
      requirements: ['Background check', 'Equipment verification', 'Positive review history', 'Account age (6+ months)'],
      benefits: ['Top search placement', 'Premium support', 'Enhanced insurance rates', 'Exclusive features', 'Partner program access'],
      badge: 'Gold'
    }
  ];

  const trustIndicators = [
    {
      indicator: 'Verified Badge',
      description: 'Users who have completed identity verification',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />
    },
    {
      indicator: 'Response Rate',
      description: 'How quickly owners respond to inquiries',
      icon: <Users className="w-5 h-5 text-blue-600" />
    },
    {
      indicator: 'Review Score',
      description: 'Average rating from previous transactions',
      icon: <Star className="w-5 h-5 text-yellow-600" />
    },
    {
      indicator: 'Account Age',
      description: 'How long the user has been on the platform',
      icon: <Shield className="w-5 h-5 text-purple-600" />
    },
    {
      indicator: 'Equipment Verified',
      description: 'Equipment that has passed professional inspection',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />
    },
    {
      indicator: 'Insurance Coverage',
      description: 'Transactions protected by comprehensive insurance',
      icon: <Lock className="w-5 h-5 text-blue-600" />
    }
  ];

  const disputeResolution = [
    {
      step: '1',
      title: 'Report Issue',
      description: 'Submit a detailed report through our dispute resolution system within 48 hours of incident.'
    },
    {
      step: '2',
      title: 'Investigation',
      description: 'Our team reviews all evidence, including photos, communications, and transaction details.'
    },
    {
      step: '3',
      title: 'Mediation',
      description: 'We facilitate communication between parties to reach a fair resolution.'
    },
    {
      step: '4',
      title: 'Resolution',
      description: 'Final decision with clear next steps, including refunds, repairs, or other remedies.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Islakayd
        </Button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-green-600 to-green-800 text-white px-8 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Trust & Verification
              </h1>
              <p className="text-xl md:text-2xl text-green-100 mb-8">
                Building trust through transparency, verification, and protection for all users
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-white text-green-600 hover:bg-gray-50">
                  Get Verified
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                  Learn More
                </Button>
              </div>
            </div>
          </div>

          <div className="px-8 py-16">
            <div className="max-w-4xl mx-auto">
              {/* Trust Features */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Trust & Safety Features</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  {trustFeatures.map((feature, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                          {feature.icon}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-4">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.details.map((detail, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verification Levels */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Verification Levels</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {verificationLevels.map((level, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="text-center mb-4">
                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                          level.badge === 'Bronze' ? 'bg-orange-100 text-orange-800' :
                          level.badge === 'Silver' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {level.badge} Badge
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">{level.level}</h3>
                      </div>
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
                        <ul className="space-y-1">
                          {level.requirements.map((req, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-center">
                              <CheckCircle className="w-3 h-3 text-green-600 mr-2 flex-shrink-0" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Benefits:</h4>
                        <ul className="space-y-1">
                          {level.benefits.map((benefit, idx) => (
                            <li key={idx} className="text-sm text-gray-600">• {benefit}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Trust Indicators</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trustIndicators.map((indicator, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 flex items-center">
                      <div className="mr-3">
                        {indicator.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{indicator.indicator}</h4>
                        <p className="text-sm text-gray-600">{indicator.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dispute Resolution */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Dispute Resolution Process</h2>
                <div className="grid md:grid-cols-4 gap-6">
                  {disputeResolution.map((step, index) => (
                    <div key={index} className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 font-bold">
                        {step.step}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Stats */}
              <div className="bg-green-50 rounded-lg p-8 mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Trust by the Numbers</h2>
                <div className="grid md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
                    <div className="text-gray-600">Positive Reviews</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
                    <div className="text-gray-600">Support Available</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-2">$10M+</div>
                    <div className="text-gray-600">Insurance Coverage</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-2">99.9%</div>
                    <div className="text-gray-600">Uptime</div>
                  </div>
                </div>
              </div>

              {/* Get Verified CTA */}
              <div className="bg-blue-50 rounded-lg p-8 text-center">
                <Eye className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Verified Today</h2>
                <p className="text-gray-600 mb-6">
                  Join thousands of verified users and build trust in our community. Verification takes just a few minutes and unlocks premium features.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Start Verification
                  </Button>
                  <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                    Learn About Verification
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Verification helps protect both renters and owners. All information is encrypted and secure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}