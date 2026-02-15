import { ArrowLeft, Users, Target, Award, Globe } from 'lucide-react';
import { Button } from '../ui/Button';

interface AboutUsProps {
  onBack: () => void;
}

export default function AboutUs({ onBack }: AboutUsProps) {
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
                Revolutionizing Equipment Rental
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8">
                Connecting equipment owners with renters worldwide through the world's most advanced rental marketplace
              </p>
              <div className="flex flex-wrap justify-center gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold">500K+</div>
                  <div className="text-blue-100">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">50K+</div>
                  <div className="text-blue-100">Equipment Listings</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">150+</div>
                  <div className="text-blue-100">Countries Served</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mission Section */}
          <div className="px-8 py-16">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
                <p className="text-xl text-gray-600">
                  To democratize access to equipment by connecting owners with renters through a trusted, transparent, and efficient marketplace.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-16">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Community First</h3>
                  <p className="text-gray-600">
                    Building a global community of equipment owners and renters who trust and support each other.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Innovation Driven</h3>
                  <p className="text-gray-600">
                    Leveraging cutting-edge technology to create the most efficient and user-friendly rental experience.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Assured</h3>
                  <p className="text-gray-600">
                    Ensuring every rental meets our high standards for safety, reliability, and customer satisfaction.
                  </p>
                </div>
              </div>

              {/* Story Section */}
              <div className="bg-gray-50 rounded-lg p-8 mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
                <div className="prose prose-lg max-w-none text-gray-600">
                  <p className="mb-4">
                    Islakayd was born from a simple observation: millions of people own valuable equipment that sits unused most of the time, while others struggle to access the tools they need for their projects.
                  </p>
                  <p className="mb-4">
                    Founded in 2020 by a team of engineers and entrepreneurs, we set out to create a platform that would revolutionize the equipment rental industry. We believed that by leveraging technology, we could create a marketplace that was more efficient, transparent, and accessible than traditional rental companies.
                  </p>
                  <p className="mb-4">
                    Today, Islakayd connects equipment owners with renters in over 150 countries, offering everything from construction machinery to specialized tools. Our platform features real-time booking, secure payments, comprehensive insurance, and a user-friendly interface that makes renting equipment as simple as booking a hotel room.
                  </p>
                  <p>
                    We're just getting started. Our vision is to become the world's most trusted equipment rental marketplace, empowering people and businesses to accomplish more through better access to tools and equipment.
                  </p>
                </div>
              </div>

              {/* Team Section */}
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Leadership Team</h2>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">Sarah Johnson</h3>
                    <p className="text-blue-600 mb-2">CEO & Co-Founder</p>
                    <p className="text-gray-600 text-sm">
                      Former VP of Engineering at Airbnb, passionate about building marketplaces that connect people.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">Michael Chen</h3>
                    <p className="text-blue-600 mb-2">CTO & Co-Founder</p>
                    <p className="text-gray-600 text-sm">
                      Ex-Google engineer with expertise in scalable systems and machine learning.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">Emma Rodriguez</h3>
                    <p className="text-blue-600 mb-2">Head of Operations</p>
                    <p className="text-gray-600 text-sm">
                      Operations expert with 10+ years in the sharing economy and equipment rental industry.
                    </p>
                  </div>
                </div>
              </div>

              {/* Global Presence */}
              <div className="bg-blue-50 rounded-lg p-8">
                <div className="flex items-center justify-center mb-6">
                  <Globe className="w-12 h-12 text-blue-600 mr-4" />
                  <h2 className="text-3xl font-bold text-gray-900">Global Presence</h2>
                </div>
                <p className="text-center text-gray-600 mb-6">
                  Islakayd operates in over 150 countries and supports multiple languages to serve our diverse global community.
                </p>
                <div className="grid md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">North America</div>
                    <div className="text-gray-600">USA, Canada, Mexico</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">Europe</div>
                    <div className="text-gray-600">UK, Germany, France, Spain</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">Asia Pacific</div>
                    <div className="text-gray-600">Australia, Japan, Singapore</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">Rest of World</div>
                    <div className="text-gray-600">Brazil, UAE, South Africa</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}