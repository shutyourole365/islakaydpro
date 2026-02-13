import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  MessageCircle,
  Share2,
  Heart,
  Star,
  UserPlus,
  TrendingUp,
  Award,
  MessageSquare,
  Send,
} from 'lucide-react';
import type { Equipment, CommunityPost } from '../../types';

interface SocialCommunityProps {
  equipment?: Equipment;
  className?: string;
}

interface CommunityMember {
  id: string;
  name: string;
  avatar: string;
  role: 'owner' | 'renter' | 'enthusiast';
  joinDate: string;
  equipmentCount: number;
  rating: number;
  badges: string[];
}

interface Post extends CommunityPost {
  author: CommunityMember;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  timeAgo: string;
}

export default function SocialCommunity({ equipment, className = '' }: SocialCommunityProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'members' | 'discussions'>('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');

  useEffect(() => {
    const loadCommunityData = async () => {
      try {
        // Mock data - in real app, this would come from API
        const mockMembers: CommunityMember[] = [
          {
            id: '1',
            name: 'Sarah Johnson',
            avatar: '👩‍🔧',
            role: 'owner',
            joinDate: '2023-01-15',
            equipmentCount: 12,
            rating: 4.9,
            badges: ['Top Owner', 'Verified', '5-Star Service'],
          },
          {
            id: '2',
            name: 'Mike Chen',
            avatar: '👨‍💼',
            role: 'renter',
            joinDate: '2023-03-20',
            equipmentCount: 0,
            rating: 4.7,
            badges: ['Frequent Renter', 'Quick Booker'],
          },
          {
            id: '3',
            name: 'Emma Rodriguez',
            avatar: '👩‍🚀',
            role: 'enthusiast',
            joinDate: '2023-02-10',
            equipmentCount: 3,
            rating: 4.8,
            badges: ['Equipment Expert', 'Community Helper'],
          },
        ];

        const mockPosts: Post[] = [
          {
            id: '1',
            author: mockMembers[0],
            content: 'Just added a brand new excavator to my fleet! Perfect condition, ready for heavy-duty projects. DM me for bookings! 🏗️',
            equipment_id: equipment?.id,
            images: ['/excavator.jpg'],
            type: 'equipment_share',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            likes: 24,
            comments: 8,
            shares: 3,
            isLiked: false,
            isBookmarked: false,
            timeAgo: '2h ago',
          },
          {
            id: '2',
            author: mockMembers[1],
            content: 'Looking for recommendations on the best bulldozer for land clearing. Any suggestions from experienced owners?',
            equipment_id: null,
            images: [],
            type: 'question',
            created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
            likes: 12,
            comments: 15,
            shares: 1,
            isLiked: false,
            isBookmarked: false,
            timeAgo: '4h ago',
          },
          {
            id: '3',
            author: mockMembers[2],
            content: 'Safety tip: Always check hydraulic fluid levels before operating heavy machinery. Saved me from a potential breakdown today! 🔧',
            equipment_id: null,
            images: [],
            type: 'tip',
            created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
            likes: 31,
            comments: 5,
            shares: 7,
            isLiked: true,
            isBookmarked: true,
            timeAgo: '6h ago',
          },
        ];

        setMembers(mockMembers);
        setPosts(mockPosts);
      } catch (error) {
        console.error('Failed to load community data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCommunityData();
  }, [equipment]);

  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(post =>
      post.id === postId
        ? {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const handleBookmarkPost = (postId: string) => {
    setPosts(prev => prev.map(post =>
      post.id === postId
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
  };

  const handleCreatePost = () => {
    if (!newPost.trim()) return;

    const newPostObj: Post = {
      id: Date.now().toString(),
      author: members[0], // Current user
      content: newPost,
      equipment_id: selectedEquipment || null,
      images: [],
      type: 'general',
      created_at: new Date().toISOString(),
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      isBookmarked: false,
      timeAgo: 'Just now',
    };

    setPosts(prev => [newPostObj, ...prev]);
    setNewPost('');
    setSelectedEquipment('');
  };

  const topContributors = useMemo(() =>
    members.sort((a, b) => b.equipmentCount - a.equipmentCount).slice(0, 3),
    [members]
  );

  const trendingTopics = [
    { topic: '#ExcavatorTips', posts: 45 },
    { topic: '#SafetyFirst', posts: 32 },
    { topic: '#EquipmentMaintenance', posts: 28 },
    { topic: '#RentalHacks', posts: 21 },
  ];

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Equipment Community</h2>
            <p className="text-blue-100">Connect with owners, share tips, and discover equipment</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{members.length}</div>
              <div className="text-sm text-blue-100">Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{posts.length}</div>
              <div className="text-sm text-blue-100">Posts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { id: 'feed', label: 'Community Feed', icon: MessageCircle },
          { id: 'members', label: 'Members', icon: Users },
          { id: 'discussions', label: 'Discussions', icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Community Feed Tab */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          {/* Create Post */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="flex gap-4">
              <div className="text-2xl">{members[0]?.avatar}</div>
              <div className="flex-1">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share your equipment experience, ask questions, or post tips..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedEquipment}
                      onChange={(e) => setSelectedEquipment(e.target.value)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">General Post</option>
                      {equipment && <option value={equipment.id}>{equipment.name}</option>}
                    </select>
                  </div>
                  <button
                    onClick={handleCreatePost}
                    disabled={!newPost.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex gap-4">
                  <div className="text-2xl">{post.author.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">{post.author.name}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{post.timeAgo}</span>
                      {post.author.badges.includes('Verified') && (
                        <Award className="w-4 h-4 text-blue-500" />
                      )}
                    </div>

                    <p className="text-gray-900 mb-4">{post.content}</p>

                    {post.images && post.images.length > 0 && (
                      <div className="mb-4">
                        <img
                          src={post.images[0]}
                          alt="Post content"
                          className="w-full max-w-md rounded-lg"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLikePost(post.id)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                            post.isLiked
                              ? 'bg-red-100 text-red-600'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                          <span className="text-sm">{post.likes}</span>
                        </button>

                        <button className="flex items-center gap-1 px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">{post.comments}</span>
                        </button>

                        <button className="flex items-center gap-1 px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <Share2 className="w-4 h-4" />
                          <span className="text-sm">{post.shares}</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleBookmarkPost(post.id)}
                        className={`p-1 rounded-lg transition-colors ${
                          post.isBookmarked
                            ? 'text-blue-600 bg-blue-100'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <div key={member.id} className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl">{member.avatar}</div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{member.role}</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Equipment:</span>
                  <span className="font-medium">{member.equipmentCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Rating:</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{member.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Joined:</span>
                  <span className="font-medium">{new Date(member.joinDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {member.badges.map((badge, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <UserPlus className="w-4 h-4" />
                Connect
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Discussions Tab */}
      {activeTab === 'discussions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hot Discussions</h3>
              <div className="space-y-4">
                {[
                  {
                    title: 'Best practices for equipment maintenance?',
                    author: 'Sarah Johnson',
                    replies: 23,
                    lastActivity: '2h ago',
                    trending: true,
                  },
                  {
                    title: 'How to choose the right excavator size?',
                    author: 'Mike Chen',
                    replies: 18,
                    lastActivity: '4h ago',
                    trending: false,
                  },
                  {
                    title: 'Safety protocols for heavy machinery operation',
                    author: 'Emma Rodriguez',
                    replies: 31,
                    lastActivity: '6h ago',
                    trending: true,
                  },
                ].map((discussion, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{discussion.title}</h4>
                      <p className="text-sm text-gray-600">by {discussion.author} • {discussion.lastActivity}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {discussion.trending && (
                        <TrendingUp className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm text-gray-600">{discussion.replies} replies</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Contributors */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Contributors</h3>
              <div className="space-y-3">
                {topContributors.map((member, index) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="text-lg font-bold text-gray-400">#{index + 1}</div>
                    <div className="text-xl">{member.avatar}</div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.equipmentCount} equipment</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Topics */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending Topics</h3>
              <div className="space-y-2">
                {trendingTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                      {topic.topic}
                    </span>
                    <span className="text-sm text-gray-500">{topic.posts}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}