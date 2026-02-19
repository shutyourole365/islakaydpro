import { ArrowLeft, Lock, FileCheck, Clock, Shield, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState } from 'react';

interface SmartContractsProps {
  onBack: () => void;
}

export default function SmartContracts({ onBack }: SmartContractsProps) {
  const [selectedContract, setSelectedContract] = useState('');

  const contractTypes = [
    {
      id: 'rental',
      title: 'Equipment Rental Agreement',
      description: 'Automated rental contracts with smart escrow and dispute resolution',
      features: [
        'Automatic payment release upon equipment return',
        'GPS tracking integration',
        'Damage assessment automation',
        'Instant dispute resolution'
      ],
      status: 'active'
    },
    {
      id: 'maintenance',
      title: 'Maintenance Warranty',
      description: 'Blockchain-verified maintenance records and warranty claims',
      features: [
        'Immutable service history',
        'Automated warranty validation',
        'Transparent parts tracking',
        'Instant claims processing'
      ],
      status: 'active'
    },
    {
      id: 'insurance',
      title: 'Smart Insurance Claims',
      description: 'Automated insurance processing with blockchain verification',
      features: [
        'Instant claim validation',
        'Automated payout distribution',
        'Fraud prevention algorithms',
        'Transparent claim history'
      ],
      status: 'coming-soon'
    }
  ];

  const contractStages = [
    {
      stage: 'Agreement',
      description: 'Parties agree to terms and conditions',
      status: 'completed',
      icon: <FileCheck className="w-5 h-5" />
    },
    {
      stage: 'Escrow',
      description: 'Funds held securely in smart contract',
      status: 'active',
      icon: <Lock className="w-5 h-5" />
    },
    {
      stage: 'Execution',
      description: 'Contract conditions monitored automatically',
      status: 'pending',
      icon: <Clock className="w-5 h-5" />
    },
    {
      stage: 'Completion',
      description: 'Automatic settlement and fund release',
      status: 'pending',
      icon: <CheckCircle className="w-5 h-5" />
    }
  ];

  const benefits = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Trust & Security',
      description: 'Immutable contracts eliminate fraud and ensure fair transactions for all parties.'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Instant Execution',
      description: 'Automated processes reduce settlement time from days to minutes.'
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: 'Transparent Records',
      description: 'Every transaction and condition is permanently recorded and verifiable.'
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'Smart Escrow',
      description: 'Funds are held securely until all contract conditions are met.'
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
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6">
                <Lock className="w-8 h-8" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Blockchain Smart Contracts
              </h1>
              <p className="text-xl md:text-2xl text-purple-100 mb-8">
                Revolutionary trust and automation for equipment rentals using blockchain technology
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Shield className="w-4 h-4" />
                  <span>100% Secure</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Clock className="w-4 h-4" />
                  <span>Instant Settlement</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <CheckCircle className="w-4 h-4" />
                  <span>Immutable Records</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-16">
            <div className="max-w-4xl mx-auto">
              {/* Contract Types */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Smart Contract Solutions</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {contractTypes.map((contract) => (
                    <div
                      key={contract.id}
                      className={`bg-white border-2 rounded-lg p-6 hover:shadow-md transition-all cursor-pointer ${
                        selectedContract === contract.id
                          ? 'border-purple-500 shadow-lg'
                          : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedContract(contract.id)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{contract.title}</h3>
                        {contract.status === 'coming-soon' && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-4">{contract.description}</p>
                      <ul className="space-y-2">
                        {contract.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contract Execution Flow */}
              {selectedContract && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How Smart Contracts Work</h2>
                  <div className="bg-gray-50 rounded-lg p-8">
                    <div className="grid md:grid-cols-4 gap-6">
                      {contractStages.map((stage, index) => (
                        <div key={index} className="text-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                            stage.status === 'completed'
                              ? 'bg-green-500 text-white'
                              : stage.status === 'active'
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-300 text-gray-600'
                          }`}>
                            {stage.icon}
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2">{stage.stage}</h3>
                          <p className="text-sm text-gray-600">{stage.description}</p>
                          {index < contractStages.length - 1 && (
                            <div className="hidden md:block absolute top-6 left-full w-full h-0.5 bg-gray-300 -ml-6 mt-6"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Benefits */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose Blockchain Contracts?</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
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

              {/* Security Features */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Enterprise-Grade Security</h2>
                <div className="bg-gray-50 rounded-lg p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Cryptographic Protection</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          End-to-end encryption
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Multi-signature validation
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Zero-knowledge proofs
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Quantum-resistant algorithms
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Automated Compliance</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Real-time regulatory compliance
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Automated audit trails
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Instant dispute resolution
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Transparent fee structures
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready for Trustless Transactions?</h2>
                <p className="text-gray-600 mb-6">
                  Experience the future of equipment rentals with blockchain-powered smart contracts.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-purple-600 hover:bg-purple-700 px-8 py-3">
                    Create Smart Contract
                  </Button>
                  <Button variant="outline" className="px-8 py-3">
                    Learn More
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