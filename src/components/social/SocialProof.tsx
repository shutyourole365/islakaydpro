import { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  MapPin,
  Clock,
  Star,
  ShoppingBag,
  Eye,
  MessageCircle,
  Zap,
  Award,
} from 'lucide-react';

interface SocialProofProps {
  equipmentId?: string;
  className?: string;
}

interface LiveActivity {
  id: string;
  type: 'booking' | 'viewing' | 'inquiry' | 'review' | 'saved';
  user: string;
  location: string;
  timeAgo: string;
  equipment?: string;
  message?: string;
}

export default function SocialProof({ equipmentId, className = '' }: SocialProofProps) {
  const [activities, setActivities] = useState<LiveActivity[]>([]);
  const [currentActivity, setCurrentActivity] = useState<LiveActivity | null>(null);
  const [stats, setStats] = useState({
    viewingNow: 12,
    bookedToday: 47,
    bookedThisWeek: 234,
    averageRating: 4.8,
  });
  const [showNotification, setShowNotification] = useState(false);

  // Sample activities - in production, these would come from real-time database
  const sampleActivities: LiveActivity[] = [
    { id: '1', type: 'booking', user: 'Michael R.', location: 'Los Angeles, CA', timeAgo: '2 min ago', equipment: 'CAT Excavator' },
    { id: '2', type: 'viewing', user: 'Sarah K.', location: 'San Francisco, CA', timeAgo: 'Just now', equipment: 'Sony Camera Kit' },
    { id: '3', type: 'inquiry', user: 'James T.', location: 'Austin, TX', timeAgo: '5 min ago', equipment: 'DeWalt Tool Set' },
    { id: '4', type: 'review', user: 'Emily D.', location: 'Miami, FL', timeAgo: '8 min ago', message: 'Left a 5-star review' },
    { id: '5', type: 'saved', user: 'David M.', location: 'Seattle, WA', timeAgo: '3 min ago', equipment: 'DJ Equipment Package' },
    { id: '6', type: 'booking', user: 'Lisa W.', location: 'Denver, CO', timeAgo: '12 min ago', equipment: 'John Deere Tractor' },
    { id: '7', type: 'viewing', user: 'Chris P.', location: 'Nashville, TN', timeAgo: 'Just now', equipment: 'Wedding Tent Package' },
    { id: '8', type: 'booking', user: 'Anna S.', location: 'Phoenix, AZ', timeAgo: '7 min ago', equipment: 'Pressure Washer' },
  ];

  useEffect(() => {
    setActivities(sampleActivities);

    // Rotate through activities
    let index = 0;
    const interval = setInterval(() => {
      setCurrentActivity(sampleActivities[index]);
      setShowNotification(true);
      
      setTimeout(() => setShowNotification(false), 4000);
      
      index = (index + 1) % sampleActivities.length;
    }, 8000);

    // Update stats periodically
    const statsInterval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        viewingNow: prev.viewingNow + Math.floor(Math.random() * 3) - 1,
        bookedToday: prev.bookedToday + (Math.random() > 0.7 ? 1 : 0),
      }));
    }, 15000);

    return () => {
      clearInterval(interval);
      clearInterval(statsInterval);
    };
  }, []);

  const getActivityIcon = (type: LiveActivity['type']) => {
    switch (type) {
      case 'booking': return <ShoppingBag className="w-4 h-4" />;
      case 'viewing': return <Eye className="w-4 h-4" />;
      case 'inquiry': return <MessageCircle className="w-4 h-4" />;
      case 'review': return <Star className="w-4 h-4" />;
      case 'saved': return <Award className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: LiveActivity['type']) => {
    switch (type) {
      case 'booking': return 'bg-green-500';
      case 'viewing': return 'bg-blue-500';
      case 'inquiry': return 'bg-purple-500';
      case 'review': return 'bg-amber-500';
      case 'saved': return 'bg-pink-500';
    }
  };

  const getActivityText = (activity: LiveActivity) => {
    switch (activity.type) {
      case 'booking': return `just booked ${activity.equipment}`;
      case 'viewing': return `is viewing ${activity.equipment}`;
      case 'inquiry': return `asked about ${activity.equipment}`;
      case 'review': return activity.message;
      case 'saved': return `saved ${activity.equipment}`;
    }
  };

  return (
    <div className={className}>
      {/* Stats Bar */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-2 px-4 rounded-xl mb-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <Users className="w-4 h-4" />
              <strong>{stats.viewingNow}</strong> viewing now
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <strong>{stats.bookedToday}</strong> booked today
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>{stats.averageRating} avg rating</span>
          </div>
        </div>
      </div>

      {/* Live Activity Notification */}
      {showNotification && currentActivity && (
        <div className="fixed bottom-24 left-6 z-50 animate-in slide-in-from-left duration-300">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-4 max-w-sm">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 ${getActivityColor(currentActivity.type)} rounded-full flex items-center justify-center text-white`}>
                {getActivityIcon(currentActivity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <strong>{currentActivity.user}</strong>{' '}
                  <span className="text-gray-600">{getActivityText(currentActivity)}</span>
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                  <MapPin className="w-3 h-3" />
                  {currentActivity.location}
                  <span>•</span>
                  <Clock className="w-3 h-3" />
                  {currentActivity.timeAgo}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Urgency Indicators */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm font-medium">
          <Zap className="w-4 h-4" />
          High demand - book now!
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
          <Clock className="w-4 h-4" />
          Only 3 available this week
        </span>
      </div>

      {/* Recent Activity Feed (Optional) */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live Activity
        </h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {activities.slice(0, 4).map((activity) => (
            <div key={activity.id} className="flex items-center gap-2 text-sm">
              <div className={`w-6 h-6 ${getActivityColor(activity.type)} rounded-full flex items-center justify-center text-white text-xs`}>
                {getActivityIcon(activity.type)}
              </div>
              <span className="text-gray-600 truncate flex-1">
                <strong className="text-gray-900">{activity.user}</strong>{' '}
                {getActivityText(activity)}
              </span>
              <span className="text-xs text-gray-400">{activity.timeAgo}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
