import { ArrowLeft, Brain, Zap, TrendingUp, Users, Shield, Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState } from 'react';

interface AIMatchingProps {
  onBack: () => void;
}

export default function AIMatching({ onBack }: AIMatchingProps) {
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [projectType, setProjectType] = useState('');
  const [budget, setBudget] = useState('');

  const equipmentTypes = [
    'Excavator', 'Bulldozer', 'Crane', 'Forklift', 'Generator',
    'Air Compressor', 'Concrete Mixer', 'Welding Equipment', 'Power Tools'
  ];

  const projectTypes = [
    'Construction', 'Demolition', 'Landscaping', 'Mining', 'Events',
    'Agriculture', 'Manufacturing', 'Maintenance', 'Emergency Response'
  ];

  const budgetRanges = [
    'Under $500/day', '$500-$1,000/day', '$1,000-$2,000/day',
    '$2,000-$5,000/day', '$5,000+/day', 'Flexible'
  ];

  const aiRecommendations = [
    {
      equipment: 'CAT 320 Excavator',
      match: 98,
      reasoning: 'Perfect for your construction project. High power-to-weight ratio, excellent fuel efficiency.',
      dailyRate: 450,
      availability: 'Available now',
      owner: 'Heavy Equipment Pro',
      rating: 4.9
    },
    {
      equipment: 'John Deere 850K Dozer',
      match: 95,
      reasoning: 'Superior blade control and GPS accuracy for precise grading work.',
      dailyRate: 380,
      availability: 'Available in 2 days',
      owner: 'Construction Masters',
      rating: 4.8
    },
    {
      equipment: 'Liebherr LTM 1100 Crane',
      match: 92,
      reasoning: 'Maximum lifting capacity meets your project requirements with excellent reach.',
      dailyRate: 650,
      availability: 'Available now',
      owner: 'Crane Specialists',
      rating: 4.9
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
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6">
                <Brain className="w-8 h-8" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                AI Equipment Matching
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8">
                Let our advanced AI find the perfect equipment for your project in seconds
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Zap className="w-4 h-4" />
                  <span>Instant Matching</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <TrendingUp className="w-4 h-4" />
                  <span>98% Accuracy</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Users className="w-4 h-4" />
                  <span>50K+ Equipment Database</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-16">
            <div className="max-w-4xl mx-auto">
              {/* AI Matching Form */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Find Your Perfect Equipment</h2>
                <div className="bg-gray-50 rounded-lg p-8">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        What equipment do you need?
                      </label>
                      <select
                        value={selectedEquipment}
                        onChange={(e) => setSelectedEquipment(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select equipment type</option>
                        {equipmentTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project type
                      </label>
                      <select
                        value={projectType}
                        onChange={(e) => setProjectType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select project type</option>
                        {projectTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Daily budget
                      </label>
                      <select
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select budget range</option>
                        {budgetRanges.map(range => (
                          <option key={range} value={range}>{range}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
                      disabled={!selectedEquipment || !projectType || !budget}
                    >
                      <Brain className="w-5 h-5 mr-2" />
                      Find Matches with AI
                    </Button>
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              {(selectedEquipment || projectType || budget) && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">AI Recommendations</h2>
                  <div className="space-y-6">
                    {aiRecommendations.map((rec, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{rec.equipment}</h3>
                            <div className="flex items-center gap-4 mb-3">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm font-medium">{rec.rating}</span>
                              </div>
                              <span className="text-sm text-green-600 font-medium">{rec.availability}</span>
                              <span className="text-sm text-gray-500">by {rec.owner}</span>
                            </div>
                            <p className="text-gray-600 mb-4">{rec.reasoning}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">${rec.dailyRate}</div>
                            <div className="text-sm text-gray-500">per day</div>
                            <div className="mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                              {rec.match}% Match
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Shield className="w-4 h-4" />
                              <span>Verified Owner</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>500+ Rentals</span>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              Book Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* How It Works */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How AI Matching Works</h2>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Brain className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Analysis</h3>
                    <p className="text-gray-600">
                      Our AI analyzes your project requirements, budget, and timeline to understand your exact needs.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Perfect Matching</h3>
                    <p className="text-gray-600">
                      Advanced algorithms match you with equipment that meets your specifications and preferences.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Results</h3>
                    <p className="text-gray-600">
                      Get personalized recommendations in seconds, complete with pricing and availability.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Experience AI Matching?</h2>
                <p className="text-gray-600 mb-6">
                  Join thousands of users who have found their perfect equipment with our AI technology.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-3">
                  Start AI Matching Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}