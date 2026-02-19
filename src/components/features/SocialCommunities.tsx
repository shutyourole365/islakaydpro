import { ArrowLeft, Users, MessageCircle, Heart, Share2, UserPlus, Search, MapPin, Star, MessageSquare, Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState } from 'react';

interface CommunityPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role: 'owner' | 'renter' | 'expert';
    rating: number;
  };
  content: string;
  images?: string[];
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  category: string;
  equipment?: {
    id: string;
    title: string;
    category: string;
  };
  location?: string;
  tags: string[];
}

interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  members: number;
  category: string;
  avatar: string;
  lastActivity: Date;
  isJoined: boolean;
}

interface SocialCommunitiesProps {
  onBack: () => void;
  userId?: string;
}

export default function SocialCommunities({ onBack }: SocialCommunitiesProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'groups' | 'messages'>('feed');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock community data
  const communityPosts: CommunityPost[] = [
    {
      id: '1',
      author: {
        id: 'user1',
        name: 'Mike Chen',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        role: 'owner',
        rating: 4.9
      },
      content: 'Just finished a great project with my CAT excavator! The new hydraulic system is incredible. Anyone else using CAT equipment for residential work?',
      images: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop'],
      timestamp: new Date('2026-01-15T10:30:00'),
      likes: 24,
      comments: 8,
      shares: 3,
      category: 'Construction',
      equipment: {
        id: 'equip1',
        title: 'CAT 320 Excavator',
        category: 'Construction'
      },
      location: 'Los Angeles, CA',
      tags: ['CAT', 'excavator', 'construction', 'hydraulics']
    },
    {
      id: '2',
      author: {
        id: 'user2',
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        role: 'renter',
        rating: 4.7
      },
      content: 'Looking for recommendations on camera equipment for wedding photography. Currently using a Sony A7R but considering upgrading. Budget around $5k.',
      timestamp: new Date('2026-01-15T09:15:00'),
      likes: 12,
      comments: 15,
      shares: 2,
      category: 'Photography',
      tags: ['wedding', 'photography', 'Sony', 'recommendations']
    },
    {
      id: '3',
      author: {
        id: 'user3',
        name: 'David Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        role: 'expert',
        rating: 5.0
      },
      content: 'Pro tip: Always check the maintenance history before renting power tools. I just saved a client $200 by catching a faulty DeWalt drill before it caused damage. Safety first! 🔧',
      timestamp: new Date('2026-01-15T08:45:00'),
      likes: 67,
      comments: 23,
      shares: 12,
      category: 'Power Tools',
      tags: ['safety', 'maintenance', 'DeWalt', 'tips']
    }
  ];

  const communityGroups: CommunityGroup[] = [
    {
      id: '1',
      name: 'Construction Equipment Owners',
      description: 'Network with fellow construction equipment owners, share maintenance tips, and discuss industry trends.',
      members: 2847,
      category: 'Construction',
      avatar: '🏗️',
      lastActivity: new Date('2026-01-15T11:00:00'),
      isJoined: true
    },
    {
      id: '2',
      name: 'Photography Gear Talk',
      description: 'Discuss camera equipment, lenses, lighting, and photography techniques with fellow creatives.',
      members: 1923,
      category: 'Photography',
      avatar: '📷',
      lastActivity: new Date('2026-01-15T10:30:00'),
      isJoined: false
    },
    {
      id: '3',
      name: 'Power Tool Enthusiasts',
      description: 'Share experiences with power tools, maintenance advice, and project showcases.',
      members: 1543,
      category: 'Power Tools',
      avatar: '🔧',
      lastActivity: new Date('2026-01-15T09:45:00'),
      isJoined: true
    },
    {
      id: '4',
      name: 'Equipment Rental Best Practices',
      description: 'Learn from experienced renters and owners about getting the most from your rentals.',
      members: 3217,
      category: 'General',
      avatar: '💡',
      lastActivity: new Date('2026-01-15T08:20:00'),
      isJoined: false
    }
  ];

  const categories = ['all', 'Construction', 'Photography', 'Power Tools', 'Audio & Video', 'Landscaping', 'Events'];

  const filteredPosts = communityPosts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const filteredGroups = communityGroups.filter(group => {
    const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-blue-100 text-blue-800';
      case 'renter': return 'bg-green-100 text-green-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Features
        </Button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold">Social Communities</h1>
                <p className="text-purple-100">Connect, share, and learn with fellow equipment enthusiasts</p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center gap-2">
              {[
                { key: 'feed', label: 'Community Feed', icon: MessageCircle },
                { key: 'groups', label: 'Groups', icon: Users },
                { key: 'messages', label: 'Messages', icon: Send }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as 'feed' | 'groups' | 'messages')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-white text-purple-600'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            {/* Search and Filters */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search posts, groups, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Community Feed */}
            {activeTab === 'feed' && (
              <div className="space-y-6">
                {filteredPosts.map((post) => (
                  <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    {/* Post Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(post.author.role)}`}>
                            {post.author.role}
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{post.author.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{formatTimeAgo(post.timestamp)}</span>
                          {post.location && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {post.location}
                              </div>
                            </>
                          )}
                          <span>•</span>
                          <span className="text-purple-600 font-medium">{post.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="mb-4">
                      <p className="text-gray-900 mb-3">{post.content}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Equipment Reference */}
                      {post.equipment && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-600">
                            Related equipment: <span className="font-medium text-gray-900">{post.equipment.title}</span>
                          </p>
                        </div>
                      )}

                      {/* Images */}
                      {post.images && post.images.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {post.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Post image ${index + 1}`}
                              className="rounded-lg w-full h-48 object-cover"
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-6">
                        <button className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
                          <Heart className="w-5 h-5" />
                          <span className="text-sm">{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                          <MessageSquare className="w-5 h-5" />
                          <span className="text-sm">{post.comments}</span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                          <Share2 className="w-5 h-5" />
                          <span className="text-sm">{post.shares}</span>
                        </button>
                      </div>

                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Groups */}
            {activeTab === 'groups' && (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredGroups.map((group) => (
                  <div key={group.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                        {group.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{group.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{group.members.toLocaleString()} members</span>
                          <span>•</span>
                          <span>{group.category}</span>
                          <span>•</span>
                          <span>Active {formatTimeAgo(group.lastActivity)}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      className={`w-full ${group.isJoined ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-purple-600 hover:bg-purple-700'}`}
                      variant={group.isJoined ? 'outline' : 'primary'}
                    >
                      {group.isJoined ? (
                        <>
                          <Users className="w-4 h-4 mr-2" />
                          Joined
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Join Group
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Messages */}
            {activeTab === 'messages' && (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Direct Messages</h3>
                <p className="text-gray-600 mb-6">Connect directly with other community members</p>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Send className="w-4 h-4 mr-2" />
                  Start a Conversation
                </Button>
              </div>
            )}

            {/* Community Stats */}
            <div className="mt-12 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Community Stats</h2>
                <p className="text-gray-600">Growing stronger together</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">12.5K</div>
                  <div className="text-sm text-gray-600">Active Members</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">8.3K</div>
                  <div className="text-sm text-gray-600">Posts This Month</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">156</div>
                  <div className="text-sm text-gray-600">Active Groups</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">4.8</div>
                  <div className="text-sm text-gray-600">Avg Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}