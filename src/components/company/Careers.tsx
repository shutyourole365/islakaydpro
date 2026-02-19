import { ArrowLeft, MapPin, Clock, DollarSign, Users, Zap, Heart } from 'lucide-react';
import { Button } from '../ui/Button';

interface CareersProps {
  onBack: () => void;
}

export default function Careers({ onBack }: CareersProps) {
  const openPositions = [
    {
      title: 'Senior Frontend Engineer',
      department: 'Engineering',
      location: 'Remote / Sydney',
      type: 'Full-time',
      salary: '$140K - $180K AUD',
      description: 'Build the next generation of our React-based marketplace platform. Work with TypeScript, modern tooling, and cutting-edge web technologies.'
    },
    {
      title: 'Product Manager',
      department: 'Product',
      location: 'Melbourne / Remote',
      type: 'Full-time',
      salary: '$130K - $160K AUD',
      description: 'Drive product strategy for our equipment rental marketplace. Work closely with engineering, design, and business teams to deliver exceptional user experiences.'
    },
    {
      title: 'Customer Success Manager',
      department: 'Operations',
      location: 'Remote',
      type: 'Full-time',
      salary: '$80K - $100K AUD',
      description: 'Help our users succeed on the platform. Provide exceptional support, gather feedback, and ensure our community has the best possible experience.'
    },
    {
      title: 'Data Scientist',
      department: 'Engineering',
      location: 'Remote / Brisbane',
      type: 'Full-time',
      salary: '$150K - $190K AUD',
      description: 'Build machine learning models to improve our marketplace matching, pricing recommendations, and fraud detection systems.'
    },
    {
      title: 'Marketing Manager',
      department: 'Marketing',
      location: 'Sydney / Remote',
      type: 'Full-time',
      salary: '$95K - $120K AUD',
      description: 'Grow our user base through innovative marketing campaigns, content creation, and community building initiatives.'
    },
    {
      title: 'Operations Analyst',
      department: 'Operations',
      location: 'Remote',
      type: 'Full-time',
      salary: '$75K - $95K AUD',
      description: 'Analyze platform performance, optimize processes, and support our growing operations team with data-driven insights.'
    }
  ];

  const benefits = [
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: 'Competitive Salary',
      description: 'Market-leading compensation with equity packages for all full-time roles.'
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Health & Superannuation',
      description: 'Private health insurance and superannuation contributions above the minimum requirement.'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Flexible Hours',
      description: 'Work when you\'re most productive. We trust our team to manage their own schedules.'
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Remote First',
      description: 'Work from anywhere with a great internet connection. Regular virtual team events.'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Learning Budget',
      description: '$3,000 AUD annual budget for conferences, courses, and professional development.'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Latest Tech',
      description: 'Access to cutting-edge tools, cloud credits, and the best equipment for your role.'
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
                Join Our Mission
              </h1>
              <p className="text-xl md:text-2xl text-green-100 mb-8">
                Help us build the world's most advanced equipment rental marketplace. We're looking for passionate people who want to make a difference.
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 inline-block">
                <div className="text-2xl font-bold">50+ Team Members</div>
                <div className="text-green-100">Across 12 countries</div>
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div className="px-8 py-16">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
                <p className="text-xl text-gray-600">
                  The principles that guide everything we do at Islakayd.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-16">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">People First</h3>
                  <p className="text-gray-600">
                    We put our users and team members at the center of everything we do. Their success is our success.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Innovation</h3>
                  <p className="text-gray-600">
                    We embrace new ideas and technologies to solve complex problems and create better experiences.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Integrity</h3>
                  <p className="text-gray-600">
                    We act with honesty, transparency, and accountability in all our interactions and decisions.
                  </p>
                </div>
              </div>

              {/* Benefits Section */}
              <div className="bg-gray-50 rounded-lg p-8 mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Join Islakayd?</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          {benefit.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{benefit.title}</h3>
                      </div>
                      <p className="text-gray-600 text-sm">{benefit.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Open Positions */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Open Positions</h2>
                <div className="space-y-6">
                  {openPositions.map((position, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">{position.title}</h3>
                          <p className="text-blue-600 font-medium">{position.department}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                            <MapPin className="w-4 h-4 mr-1" />
                            {position.location}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                            <Clock className="w-4 h-4 mr-1" />
                            {position.type}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {position.salary}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{position.description}</p>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Apply Now
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Culture Section */}
              <div className="bg-blue-50 rounded-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Culture</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">How We Work</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Async-first communication with flexible hours</li>
                      <li>• Quarterly company retreats and team events</li>
                      <li>• Open feedback culture with regular 1:1s</li>
                      <li>• Cross-functional collaboration and knowledge sharing</li>
                      <li>• Focus on work-life balance and mental health</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">What We Believe</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Everyone deserves access to the tools they need</li>
                      <li>• Technology can solve real-world problems</li>
                      <li>• Small teams can achieve big things</li>
                      <li>• Continuous learning drives innovation</li>
                      <li>• Community and collaboration create success</li>
                    </ul>
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