import { ArrowLeft, Shield, CheckCircle, AlertTriangle, FileText, Phone } from 'lucide-react';
import { Button } from '../ui/Button';

interface InsuranceOptionsProps {
  onBack: () => void;
}

export default function InsuranceOptions({ onBack }: InsuranceOptionsProps) {
  const insurancePlans = [
    {
      name: 'Basic Coverage',
      price: '5% of rental cost',
      description: 'Essential protection for most rental situations',
      coverage: [
        'Equipment damage up to $10,000',
        'Theft protection',
        'Basic liability coverage',
        '24/7 claims support'
      ],
      recommended: false
    },
    {
      name: 'Standard Coverage',
      price: '8% of rental cost',
      description: 'Comprehensive protection for professional use',
      coverage: [
        'Equipment damage up to $50,000',
        'Theft protection with GPS tracking',
        'Extended liability coverage',
        'Wear and tear protection',
        'Emergency repair coordination',
        'Priority claims processing'
      ],
      recommended: true
    },
    {
      name: 'Premium Coverage',
      price: '12% of rental cost',
      description: 'Maximum protection for high-value equipment',
      coverage: [
        'Equipment damage up to $100,000+',
        'Comprehensive theft protection',
        'Full liability coverage',
        'Wear and tear protection',
        'Emergency repair coordination',
        'Dedicated claims manager',
        'Equipment replacement guarantee',
        'Business interruption coverage'
      ],
      recommended: false
    }
  ];

  const coverageDetails = [
    {
      category: 'Equipment Damage',
      description: 'Protection against accidental damage, collision, or mechanical failure',
      included: ['Basic', 'Standard', 'Premium'],
      limit: 'Up to equipment value'
    },
    {
      category: 'Theft Protection',
      description: 'Coverage for stolen equipment with GPS tracking assistance',
      included: ['Basic', 'Standard', 'Premium'],
      limit: 'Up to equipment value'
    },
    {
      category: 'Liability Coverage',
      description: 'Third-party injury or property damage caused by equipment use',
      included: ['Basic', 'Standard', 'Premium'],
      limit: '$1M - $5M depending on plan'
    },
    {
      category: 'Wear & Tear',
      description: 'Normal usage wear, not covered under basic plans',
      included: ['Standard', 'Premium'],
      limit: 'Up to 50% of repair costs'
    },
    {
      category: 'Emergency Services',
      description: 'Towing, emergency repairs, and equipment replacement',
      included: ['Standard', 'Premium'],
      limit: 'Up to $2,500 per incident'
    }
  ];

  const claimsProcess = [
    {
      step: '1',
      title: 'Report Incident',
      description: 'Contact our claims team immediately at 1-800-CLAIMS or through the app',
      time: 'Within 24 hours'
    },
    {
      step: '2',
      title: 'Document Damage',
      description: 'Take photos, gather witness information, and complete incident report',
      time: 'Same day'
    },
    {
      step: '3',
      title: 'Claims Review',
      description: 'Our team reviews the claim and coordinates with all parties',
      time: '1-3 business days'
    },
    {
      step: '4',
      title: 'Resolution',
      description: 'Payment processed or repair coordination begins',
      time: '5-10 business days'
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
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Insurance Options
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8">
                Comprehensive protection for peace of mind when renting equipment
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-white text-blue-600 hover:bg-gray-50">
                  Get a Quote
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  File a Claim
                </Button>
              </div>
            </div>
          </div>

          <div className="px-8 py-16">
            <div className="max-w-4xl mx-auto">
              {/* Insurance Plans */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Choose Your Coverage</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {insurancePlans.map((plan, index) => (
                    <div key={index} className={`bg-white border-2 rounded-lg p-6 ${plan.recommended ? 'border-blue-500' : 'border-gray-200'}`}>
                      {plan.recommended && (
                        <div className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full inline-block mb-4">
                          RECOMMENDED
                        </div>
                      )}
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-blue-600 font-medium text-lg mb-3">{plan.price}</p>
                      <p className="text-gray-600 mb-4">{plan.description}</p>
                      <ul className="space-y-2 mb-6">
                        {plan.coverage.map((item, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <Button className={`w-full ${plan.recommended ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'}`}>
                        Select Plan
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coverage Details */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Coverage Details</h2>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Coverage Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Included In
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Limits
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {coverageDetails.map((coverage, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{coverage.category}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-gray-600">{coverage.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-wrap gap-1">
                                {coverage.included.map((plan) => (
                                  <span key={plan} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                    {plan}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                              {coverage.limit}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Claims Process */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Claims Process</h2>
                <div className="grid md:grid-cols-4 gap-6">
                  {claimsProcess.map((step, index) => (
                    <div key={index} className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 font-bold">
                        {step.step}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{step.description}</p>
                      <p className="text-xs text-blue-600 font-medium">{step.time}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Important Information */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Important Information</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3" />
                      <h3 className="text-lg font-semibold text-gray-900">What&apos;s Not Covered</h3>
                    </div>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full mr-2"></div>
                        Intentional damage or misuse
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full mr-2"></div>
                        Normal wear and tear (except Premium plan)
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full mr-2"></div>
                        Pre-existing damage
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full mr-2"></div>
                        Operator injury or illness
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full mr-2"></div>
                        Theft without proper security
                      </li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <Shield className="w-6 h-6 text-green-600 mr-3" />
                      <h3 className="text-lg font-semibold text-gray-900">Getting the Best Rates</h3>
                    </div>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Complete equipment inspection before use
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Follow all safety guidelines
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Secure equipment properly when not in use
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Report incidents immediately
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Maintain good rental history
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-blue-50 rounded-lg p-8 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Need Help with Insurance?</h2>
                <p className="text-gray-600 mb-6">
                  Our insurance specialists are here to help you choose the right coverage and file claims when needed.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center justify-center">
                    <Phone className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-gray-700">1-800-CLAIMS (252467)</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-gray-700">claims@islakayd.com</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-gray-700">24/7 Claims Support</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Get Insurance Quote
                  </Button>
                  <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                    File a Claim
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}