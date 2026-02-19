import { ArrowLeft, Calculator, TrendingUp, Shield, Clock, CheckCircle, DollarSign } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState } from 'react';

interface EquipmentFinancingProps {
  onBack: () => void;
}

export default function EquipmentFinancing({ onBack }: EquipmentFinancingProps) {
  const [loanAmount, setLoanAmount] = useState(50000);
  const [loanTerm, setLoanTerm] = useState(60);
  const [interestRate, setInterestRate] = useState(7.5);

  const calculateMonthlyPayment = () => {
    const principal = loanAmount;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm;

    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
                          (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    return monthlyPayment.toFixed(2);
  };

  const calculateTotalCost = () => {
    return (parseFloat(calculateMonthlyPayment()) * loanTerm).toFixed(2);
  };

  const calculateTotalInterest = () => {
    return (parseFloat(calculateTotalCost()) - loanAmount).toFixed(2);
  };

  const financingOptions = [
    {
      name: 'Standard Equipment Loan',
      rate: 7.5,
      term: '3-7 years',
      features: ['Fixed rates', 'Flexible terms', 'Quick approval', 'Equipment insurance included'],
      minAmount: 10000,
      maxAmount: 500000,
      popular: false
    },
    {
      name: 'Premium Equipment Financing',
      rate: 6.25,
      term: '1-10 years',
      features: ['Lower rates', 'Extended terms', 'Priority support', 'Maintenance coverage', 'Equipment upgrade options'],
      minAmount: 25000,
      maxAmount: 1000000,
      popular: true
    },
    {
      name: 'Lease-to-Own',
      rate: 8.5,
      term: '2-5 years',
      features: ['Lower monthly payments', 'Ownership at end', 'Tax advantages', 'Flexible end options'],
      minAmount: 15000,
      maxAmount: 300000,
      popular: false
    }
  ];

  const benefits = [
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: 'Preserve Cash Flow',
      description: 'Keep working capital available for operations while acquiring essential equipment.'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Tax Advantages',
      description: 'Interest payments and depreciation can provide significant tax benefits.'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Equipment Protection',
      description: 'Comprehensive insurance and maintenance coverage included in most plans.'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Quick Approval',
      description: 'Streamlined application process with decisions in as little as 24 hours.'
    }
  ];

  const requirements = [
    'Business registration (ABN/ACN)',
    'Financial statements (last 2 years)',
    'Tax returns (last 2 years)',
    'Equipment quote or invoice',
    'Personal guarantee (if required)',
    'Bank statements (3-6 months)'
  ];

  const testimonials = [
    {
      name: 'Sarah Mitchell',
      company: 'Mitchell Construction',
      quote: 'The equipment financing helped us expand our fleet without draining our cash reserves. The process was smooth and the rates competitive.',
      rating: 5
    },
    {
      name: 'David Chen',
      company: 'Chen Earthmoving',
      quote: 'We financed three excavators through Islakayd. The monthly payments fit perfectly with our cash flow, and we\'ve seen great ROI.',
      rating: 5
    },
    {
      name: 'Lisa Rodriguez',
      company: 'Rodriguez Landscaping',
      quote: 'The lease-to-own option allowed us to upgrade our equipment while keeping costs predictable. Highly recommend!',
      rating: 5
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
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6">
                <Calculator className="w-8 h-8" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Equipment Financing
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8">
                Get the equipment you need with flexible financing options
              </p>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold mb-2">Up to $1M</div>
                  <div className="text-blue-100">Financing Available</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">6.25%</div>
                  <div className="text-blue-100">Starting Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">24hrs</div>
                  <div className="text-blue-100">Approval Time</div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-16">
            <div className="max-w-4xl mx-auto">
              {/* Loan Calculator */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Loan Calculator</h2>
                <div className="bg-gray-50 rounded-lg p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Loan Amount: ${loanAmount.toLocaleString()}
                        </label>
                        <input
                          type="range"
                          min="10000"
                          max="500000"
                          step="5000"
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>$10K</span>
                          <span>$500K</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Loan Term: {loanTerm} months
                        </label>
                        <input
                          type="range"
                          min="12"
                          max="120"
                          step="12"
                          value={loanTerm}
                          onChange={(e) => setLoanTerm(Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>1 year</span>
                          <span>10 years</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Interest Rate: {interestRate}%
                        </label>
                        <input
                          type="range"
                          min="5"
                          max="15"
                          step="0.25"
                          value={interestRate}
                          onChange={(e) => setInterestRate(Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>5%</span>
                          <span>15%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monthly Payment:</span>
                          <span className="text-2xl font-bold text-blue-600">${calculateMonthlyPayment()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Cost:</span>
                          <span className="text-lg font-semibold">${calculateTotalCost()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Interest:</span>
                          <span className="text-lg font-semibold">${calculateTotalInterest()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Loan Amount:</span>
                          <span className="text-lg font-semibold">${loanAmount.toLocaleString()}</span>
                        </div>
                      </div>
                      <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700">
                        Apply for Financing
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financing Options */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Financing Options</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {financingOptions.map((option, index) => (
                    <div
                      key={index}
                      className={`relative bg-white rounded-lg border-2 p-6 ${
                        option.popular ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      {option.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-blue-500 text-white px-3 py-1 text-xs rounded-full">
                            Most Popular
                          </span>
                        </div>
                      )}
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{option.name}</h3>
                      <div className="text-3xl font-bold text-blue-600 mb-2">{option.rate}%</div>
                      <div className="text-gray-600 mb-4">APR • {option.term}</div>
                      <ul className="space-y-2 mb-6">
                        {option.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <div className="text-sm text-gray-500 mb-4">
                        ${option.minAmount.toLocaleString()} - ${option.maxAmount.toLocaleString()}
                      </div>
                      <Button
                        className={`w-full ${option.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                        variant={option.popular ? 'primary' : 'outline'}
                      >
                        Get Started
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose Equipment Financing?</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                        {benefit.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                        <p className="text-gray-600">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Application Requirements</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {requirements.map((requirement, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{requirement}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 text-center">
                    <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-3">
                      Start Application
                    </Button>
                  </div>
                </div>
              </div>

              {/* Testimonials */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What Our Customers Say</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
                      <div className="flex mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <span key={i} className="text-yellow-400">★</span>
                        ))}
                      </div>
                      <p className="text-gray-600 mb-4 italic">"{testimonial.quote}"</p>
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-500">{testimonial.company}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
                <p className="text-gray-600 mb-6">
                  Apply for equipment financing today and get the tools you need to grow your business.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-3">
                    Apply Now
                  </Button>
                  <Button variant="outline" className="px-8 py-3">
                    Speak to Advisor
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