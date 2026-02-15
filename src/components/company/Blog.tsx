import { ArrowLeft, Calendar, User, Clock, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface BlogProps {
  onBack: () => void;
}

export default function Blog({ onBack }: BlogProps) {
  const featuredPost = {
    title: 'The Future of Equipment Rental: How AI is Transforming the Industry',
    excerpt: 'Discover how artificial intelligence is revolutionizing equipment rental, from smart matching algorithms to predictive maintenance and automated pricing.',
    author: 'Dr. Sarah Johnson',
    date: 'March 20, 2024',
    readTime: '8 min read',
    category: 'Technology',
    image: '/api/placeholder/800/400'
  };

  const blogPosts = [
    {
      title: 'Top 10 Equipment Categories for Rental Success',
      excerpt: 'Learn which types of equipment generate the highest rental income and demand in our marketplace.',
      author: 'Michael Chen',
      date: 'March 15, 2024',
      readTime: '6 min read',
      category: 'Business',
      image: '/api/placeholder/400/250'
    },
    {
      title: 'Safety First: Essential Equipment Maintenance Tips',
      excerpt: 'Protect your rental equipment and ensure renter safety with these comprehensive maintenance guidelines.',
      author: 'Emma Rodriguez',
      date: 'March 10, 2024',
      readTime: '5 min read',
      category: 'Safety',
      image: '/api/placeholder/400/250'
    },
    {
      title: 'From Hobby to Business: Scaling Your Equipment Rental Operation',
      excerpt: 'Real stories from equipment owners who turned their rentals into successful full-time businesses.',
      author: 'David Park',
      date: 'March 5, 2024',
      readTime: '7 min read',
      category: 'Success Stories',
      image: '/api/placeholder/400/250'
    },
    {
      title: 'Understanding Equipment Insurance: What You Need to Know',
      excerpt: 'A comprehensive guide to equipment insurance options and how to choose the right coverage.',
      author: 'Lisa Thompson',
      date: 'February 28, 2024',
      readTime: '4 min read',
      category: 'Insurance',
      image: '/api/placeholder/400/250'
    },
    {
      title: 'Seasonal Trends in Equipment Rental Demand',
      excerpt: 'Maximize your rental income by understanding seasonal patterns and peak demand periods.',
      author: 'Robert Kim',
      date: 'February 20, 2024',
      readTime: '6 min read',
      category: 'Market Insights',
      image: '/api/placeholder/400/250'
    },
    {
      title: 'The Rise of Eco-Friendly Equipment Rentals',
      excerpt: 'How sustainable equipment options are changing the rental landscape and attracting eco-conscious renters.',
      author: 'Anna Green',
      date: 'February 15, 2024',
      readTime: '5 min read',
      category: 'Sustainability',
      image: '/api/placeholder/400/250'
    }
  ];

  const categories = [
    'All Posts',
    'Technology',
    'Business',
    'Safety',
    'Success Stories',
    'Insurance',
    'Market Insights',
    'Sustainability'
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
                Islakayd Blog
              </h1>
              <p className="text-xl md:text-2xl text-indigo-100 mb-8">
                Insights, tips, and stories from the world of equipment rental
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {categories.slice(1).map((category) => (
                  <Button
                    key={category}
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-indigo-600"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="px-8 py-16">
            <div className="max-w-4xl mx-auto">
              {/* Featured Post */}
              <div className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Article</h2>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-1/2">
                      <img
                        src={featuredPost.image}
                        alt={featuredPost.title}
                        className="w-full h-64 md:h-full object-cover"
                      />
                    </div>
                    <div className="md:w-1/2 p-8">
                      <div className="flex items-center mb-4">
                        <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                          {featuredPost.category}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        {featuredPost.title}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 mb-6">
                        <User className="w-4 h-4 mr-1" />
                        <span className="mr-4">{featuredPost.author}</span>
                        <Calendar className="w-4 h-4 mr-1" />
                        <span className="mr-4">{featuredPost.date}</span>
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{featuredPost.readTime}</span>
                      </div>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Read Full Article
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blog Posts Grid */}
              <div className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Latest Posts</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {blogPosts.map((post, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <div className="flex items-center mb-3">
                          <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">
                            {post.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 hover:text-blue-600 cursor-pointer">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 mb-4">
                          <User className="w-3 h-3 mr-1" />
                          <span className="mr-3">{post.author}</span>
                          <Calendar className="w-3 h-3 mr-1" />
                          <span className="mr-3">{post.date}</span>
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{post.readTime}</span>
                        </div>
                        <Button variant="ghost" className="p-0 h-auto text-blue-600 hover:text-blue-800">
                          Read More
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="bg-blue-50 rounded-lg p-8 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Stay Updated</h2>
                <p className="text-gray-600 mb-6">
                  Get the latest insights and tips delivered to your inbox every week.
                </p>
                <div className="max-w-md mx-auto flex gap-4">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Subscribe
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  No spam, unsubscribe at any time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}