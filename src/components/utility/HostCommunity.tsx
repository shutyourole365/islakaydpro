import { ArrowLeft, Users, MessageCircle, Calendar, Award, TrendingUp, Heart, Share2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface HostCommunityProps {
  onBack: () => void;
}

export default function HostCommunity({ onBack }: HostCommunityProps) {
  const communityFeatures = [
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: 'Discussion Forums',
      description: 'Connect with other hosts to share experiences and get advice',
      stats: '50K+ posts',
      color: 'blue'
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Virtual Events',
      description: 'Attend webinars, workshops, and networking sessions',
      stats: 'Monthly events',
      color: 'green'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Recognition Program',
      description: 'Get recognized for outstanding hosting performance',
      stats: 'Top 10% hosts',
      color: 'purple'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Success Insights',
      description: 'Learn from top performers and industry experts',
      stats: 'Data-driven tips',
      color: 'orange'
    }
  ];

  const forumCategories = [
    {
      name: 'General Discussion',
      description: 'Share experiences and ask questions about hosting',
      posts: 12543,
      active: '2 hours ago'
    },
    {
      name: 'Equipment Maintenance',
      description: 'Tips for keeping equipment in top condition',
      posts: 8765,
      active: '1 hour ago'
    },
    {
      name: 'Pricing Strategies',
      description: 'Discuss optimal pricing and revenue optimization',
      posts: 6543,
      active: '30 min ago'
    },
    {
      name: 'Marketing & Promotion',
      description: 'Share successful marketing tactics and campaigns',
      posts: 4321,
      active: '15 min ago'
    },
    {
      name: 'Legal & Insurance',
      description: 'Questions about regulations and coverage',
      posts: 3456,
      active: '3 hours ago'
    },
    {
      name: 'Success Stories',
      description: 'Share your hosting achievements and milestones',
      posts: 2345,
      active: '1 hour ago'
    }
  ];

  const upcomingEvents = [
    {
      title: 'Q4 Revenue Optimization Workshop',
      date: 'December 15, 2024',
      time: '2:00 PM EST',
      type: 'Workshop',
      attendees: 234,
      description: 'Learn advanced strategies to maximize rental income this quarter'
    },
    {
      title: 'Host Recognition Awards',
      date: 'December 20, 2024',
      time: '6:00 PM EST',
      type: 'Awards Ceremony',
      attendees: 150,
      description: 'Celebrating our top hosts and their outstanding achievements'
    },
    {
      title: 'Equipment Photography Masterclass',
      date: 'January 5, 2025',
      time: '1:00 PM EST',
      type: 'Masterclass',
      attendees: 89,
      description: 'Professional photography techniques for better listings'
    },
    {
      title: 'Networking Mixer: West Coast',
      date: 'January 12, 2025',
      time: '5:00 PM PST',
      type: 'Networking',
      attendees: 67,
      description: 'Connect with hosts in your region and build relationships'
    }
  ];

  const topContributors = [
    {
      name: 'Mike Johnson',
      location: 'Austin, TX',
      posts: 234,
      reputation: 4850,
      badge: 'Community Leader',
      avatar: '/api/placeholder/40/40'
    },
    {
      name: 'Sarah Chen',
      location: 'Seattle, WA',
      posts: 198,
      reputation: 4320,
      badge: 'Expert Host',
      avatar: '/api/placeholder/40/40'
    },
    {
      name: 'David Rodriguez',
      location: 'Miami, FL',
      posts: 176,
      reputation: 3980,
      badge: 'Top Contributor',
      avatar: '/api/placeholder/40/40'
    },
    {
      name: 'Lisa Thompson',
      location: 'Denver, CO',
      posts: 152,
      reputation: 3650,
      badge: 'Knowledge Sharer',
      avatar: '/api/placeholder/40/40'
    },
    {
      name: 'Robert Kim',
      location: 'Phoenix, AZ',
      posts: 143,
      reputation: 3420,
      badge: 'Community Helper',
      avatar: '/api/placeholder/40/40'
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
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white px-8 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Host Community
              </h1>
              <p className="text-xl md:text-2xl text-indigo-100 mb-8">
                Connect, learn, and grow with fellow equipment owners
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-white text-indigo-600 hover:bg-gray-50">
                  Join Community
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-600">
                  Browse Forums
                </Button>
              </div>
            </div>
          </div>

          <div className="px-8 py-16">
            <div className="max-w-4xl mx-auto">
              {/* Community Features */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Community Features</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {communityFeatures.map((feature, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                      <div className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center mx-auto mb-4`}>
                        <div className={`text-${feature.color}-600`}>
                          {feature.icon}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{feature.description}</p>
                      <div className={`text-${feature.color}-600 font-medium`}>{feature.stats}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Forum Categories */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Discussion Forums</h2>
                <div className="space-y-4">
                  {forumCategories.map((category, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                        <div className="text-sm text-gray-500">
                          {category.posts.toLocaleString()} posts • Active {category.active}
                        </div>
                      </div>
                      <p className="text-gray-600">{category.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Upcoming Events</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          event.type === 'Workshop' ? 'bg-blue-100 text-blue-800' :
                          event.type === 'Awards Ceremony' ? 'bg-purple-100 text-purple-800' :
                          event.type === 'Masterclass' ? 'bg-green-100 text-green-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {event.type}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {event.attendees}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                      <div className="text-sm text-gray-600 mb-3">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {event.date} at {event.time}
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{event.description}</p>
                      <Button variant="outline" className="w-full">
                        Register for Event
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Contributors */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Top Contributors</h2>
                <div className="space-y-4">
                  {topContributors.map((contributor, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img
                            src={contributor.avatar}
                            alt={contributor.name}
                            className="w-10 h-10 rounded-full mr-4"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900">{contributor.name}</h3>
                            <p className="text-sm text-gray-500">{contributor.location}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                            contributor.badge === 'Community Leader' ? 'bg-purple-100 text-purple-800' :
                            contributor.badge === 'Expert Host' ? 'bg-blue-100 text-blue-800' :
                            contributor.badge === 'Top Contributor' ? 'bg-green-100 text-green-800' :
                            contributor.badge === 'Knowledge Sharer' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {contributor.badge}
                          </div>
                          <div className="text-sm text-gray-500">
                            {contributor.posts} posts • {contributor.reputation} rep
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Community Guidelines */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Community Guidelines</h2>
                <div className="bg-blue-50 rounded-lg p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Heart className="w-5 h-5 text-red-600 mr-2" />
                        Do's
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></div>
                          Share your experiences and insights
                        </li>
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></div>
                          Ask questions and seek advice
                        </li>
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></div>
                          Help fellow hosts when you can
                        </li>
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></div>
                          Respect different opinions and experiences
                        </li>
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></div>
                          Follow equipment safety best practices
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Share2 className="w-5 h-5 text-red-600 mr-2" />
                        Don'ts
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></div>
                          Share personal or sensitive information
                        </li>
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></div>
                          Post spam or promotional content
                        </li>
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></div>
                          Engage in disrespectful behavior
                        </li>
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></div>
                          Discuss illegal activities
                        </li>
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></div>
                          Violate platform terms of service
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Join Community CTA */}
              <div className="bg-indigo-50 rounded-lg p-8 text-center">
                <Users className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Join the Community?</h2>
                <p className="text-gray-600 mb-6">
                  Connect with thousands of successful hosts, share your experiences, and grow your rental business together.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    Join Host Community
                  </Button>
                  <Button variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white">
                    View Community Guidelines
                  </Button>
                </div>
                <div className="mt-6 grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-indigo-600">15,000+</div>
                    <div className="text-gray-600">Community Members</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-indigo-600">50K+</div>
                    <div className="text-gray-600">Monthly Posts</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-indigo-600">4.9/5</div>
                    <div className="text-gray-600">Member Satisfaction</div>
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