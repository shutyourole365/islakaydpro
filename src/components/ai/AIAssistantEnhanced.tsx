import { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Mic,
  MicOff,
  Paperclip,
  ThumbsUp,
  ThumbsDown,
  Minimize2,
  Maximize2,
  Search,
  Calendar,
  DollarSign,
  HelpCircle,
  Wrench,
  Camera,
  Truck,
  PartyPopper,
  MapPin,
  Zap,
  Shield,
  ArrowRight,
  History,
  Bookmark,
  Copy,
  Settings,
} from 'lucide-react';
import type { Equipment, Category } from '../../types';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actions?: MessageAction[];
  metadata?: {
    type?: 'search' | 'booking' | 'info' | 'recommendation' | 'comparison' | 'error';
    equipmentIds?: string[];
    isTyping?: boolean;
  };
}

interface MessageAction {
  label: string;
  icon?: React.ReactNode;
  action: () => void;
  variant?: 'primary' | 'secondary';
}

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  description: string;
  query: string;
  color: string;
}

interface ConversationHistory {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  messageCount: number;
}

interface AIAssistantEnhancedProps {
  equipment?: Equipment[];
  categories?: Category[];
  onNavigate?: (page: string) => void;
  onEquipmentSelect?: (equipment: Equipment) => void;
  onBookingStart?: (equipmentId: string) => void;
}

const quickActions: QuickAction[] = [
  {
    icon: <Wrench className="w-5 h-5" />,
    label: 'Power Tools',
    description: 'Find drills, saws & more',
    query: 'Show me available power tools for a weekend project',
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: <Camera className="w-5 h-5" />,
    label: 'Photography',
    description: 'Cameras & accessories',
    query: 'I need professional camera equipment for a photoshoot',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: <Truck className="w-5 h-5" />,
    label: 'Heavy Equipment',
    description: 'Excavators & machinery',
    query: 'Find me an excavator or bulldozer for construction',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <PartyPopper className="w-5 h-5" />,
    label: 'Events',
    description: 'Tents, sound & more',
    query: 'What equipment do I need for a 100-person outdoor wedding?',
    color: 'from-green-500 to-emerald-500',
  },
];

const contextualPrompts = [
  { icon: <Search className="w-4 h-4" />, text: 'Search equipment' },
  { icon: <Calendar className="w-4 h-4" />, text: 'Check availability' },
  { icon: <DollarSign className="w-4 h-4" />, text: 'Compare prices' },
  { icon: <HelpCircle className="w-4 h-4" />, text: 'Get recommendations' },
];

export default function AIAssistantEnhanced({
  equipment = [],
  categories: _categories = [],
  onNavigate,
  onEquipmentSelect: _onEquipmentSelect,
  onBookingStart: _onBookingStart,
}: AIAssistantEnhancedProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set());
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [savedResponses, setSavedResponses] = useState<Set<string>>(new Set());
  
  const [conversationHistory] = useState<ConversationHistory[]>([
    {
      id: '1',
      title: 'Excavator rental inquiry',
      preview: 'Looking for a 20-ton excavator...',
      timestamp: new Date(Date.now() - 86400000),
      messageCount: 8,
    },
    {
      id: '2',
      title: 'Wedding equipment package',
      preview: 'Need tents and sound system...',
      timestamp: new Date(Date.now() - 172800000),
      messageCount: 12,
    },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "👋 Hi! I'm **Kayd**, your AI-powered equipment assistant. I can help you:\n\n• 🔍 Find the perfect equipment for any project\n• 💰 Compare prices and get the best deals\n• 📅 Check availability and make reservations\n• 🎯 Get personalized recommendations\n• ❓ Answer any questions about rentals\n\nHow can I help you today?",
      timestamp: new Date(),
      suggestions: [
        'Find equipment near me',
        'Compare excavator prices',
        'What do I need for a party?',
        'Show trending rentals',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Enhanced AI response generator with context awareness
  const generateAIResponse = useCallback((userMessage: string): { 
    content: string; 
    suggestions: string[]; 
    type: 'search' | 'booking' | 'info' | 'recommendation' | 'comparison' | 'error';
    actions?: MessageAction[];
  } => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Price/cost related
    if (lowerMessage.match(/price|cost|how much|expensive|cheap|budget|afford/)) {
      return {
        content: `💰 **Smart Pricing Guide**

Based on current market rates, here's what you can expect:

| Category | Daily Rate | Weekly Savings |
|----------|-----------|----------------|
| Power Tools | $25-100 | Up to 25% off |
| Photography | $50-250 | Up to 30% off |
| Heavy Equipment | $200-800 | Up to 35% off |
| Event Supplies | $100-500 | Package deals |

💡 **Pro Tips:**
• Book for 7+ days for best rates
• Bundle equipment for extra discounts
• Check for seasonal promotions

What's your budget range? I'll find the perfect options!`,
        suggestions: ['Under $100/day', '$100-300/day', 'Show weekly deals', 'Compare similar items'],
        type: 'info',
        actions: [
          { label: 'Browse by Price', icon: <DollarSign className="w-4 h-4" />, action: () => onNavigate?.('browse'), variant: 'primary' },
        ],
      };
    }

    // Location-based queries
    if (lowerMessage.match(/near me|nearby|location|local|close|distance/)) {
      return {
        content: `📍 **Finding Equipment Near You**

I can help you find equipment close to your location! Here's what's available nearby:

🎯 **Popular in Your Area:**
• ${equipment[0]?.title || 'CAT 320 Excavator'} - 2.3 miles
• ${equipment[1]?.title || 'Sony A7IV Camera Kit'} - 3.1 miles
• ${equipment[2]?.title || 'DeWalt Power Tool Set'} - 4.5 miles

🚚 **Delivery Options:**
• Free pickup available
• Delivery starting at $25
• Same-day available for some items

Would you like me to show these on a map?`,
        suggestions: ['Show on map', 'Filter by distance', 'Free delivery only', 'Available today'],
        type: 'search',
        actions: [
          { label: 'View Map', icon: <MapPin className="w-4 h-4" />, action: () => {}, variant: 'primary' },
          { label: 'Enable Location', icon: <Zap className="w-4 h-4" />, action: () => {}, variant: 'secondary' },
        ],
      };
    }

    // Booking/availability
    if (lowerMessage.match(/available|book|reserve|when|schedule|dates/)) {
      return {
        content: `📅 **Checking Availability**

Great! Let me help you book the perfect equipment.

**Quick Booking Process:**
1. Select your dates 📆
2. Choose equipment 🔧
3. Confirm & pay securely 💳
4. Pickup or delivery 🚚

**This Week's Availability:**
• Most equipment: ✅ Available
• Heavy machinery: 📋 2-3 day notice
• Premium packages: 🌟 Reserve early

What dates are you looking at?`,
        suggestions: ['Book for this weekend', 'Next week availability', 'Custom dates', 'See calendar'],
        type: 'booking',
        actions: [
          { label: 'Open Calendar', icon: <Calendar className="w-4 h-4" />, action: () => {}, variant: 'primary' },
        ],
      };
    }

    // Construction/tools
    if (lowerMessage.match(/excavator|bulldozer|backhoe|construction|heavy|dig/)) {
      const heavyEquipment = equipment.filter(e => 
        e.title.toLowerCase().includes('excavator') || 
        e.title.toLowerCase().includes('bulldozer') ||
        e.daily_rate > 200
      );
      
      return {
        content: `🚜 **Heavy Equipment Available**

I found ${heavyEquipment.length || 5} options for your project:

**Top Picks:**
${heavyEquipment.slice(0, 3).map(e => 
  `• **${e.title}** - $${e.daily_rate}/day ⭐ ${e.rating}`
).join('\n') || `• **CAT 320 Excavator** - $450/day ⭐ 4.9
• **John Deere Backhoe** - $380/day ⭐ 4.8
• **Bobcat Skid Steer** - $295/day ⭐ 4.7`}

✅ All include safety equipment
✅ Operator training available
✅ Delivery to job site

What size project are you working on?`,
        suggestions: ['Mini excavator', 'Full-size machines', 'Need an operator', 'Compare all'],
        type: 'search',
        actions: [
          { label: 'View All', icon: <ArrowRight className="w-4 h-4" />, action: () => onNavigate?.('browse'), variant: 'primary' },
        ],
      };
    }

    // Photography/camera
    if (lowerMessage.match(/camera|photo|video|film|shoot|lens|drone/)) {
      return {
        content: `📸 **Photography & Video Gear**

Perfect for your shoot! Here's what's trending:

**Cameras:**
• Sony A7IV Full Kit - $125/day
• Canon R5 Pro Package - $150/day
• RED Komodo Cinema - $350/day

**Accessories:**
• Premium lens kits available
• Lighting packages from $50/day
• Gimbals & stabilizers

**Drones:**
• DJI Mavic 3 Pro - $150/day
• Phantom 4 RTK - $275/day

What type of shoot are you planning?`,
        suggestions: ['Wedding photos', 'Commercial video', 'Real estate tour', 'Social content'],
        type: 'search',
      };
    }

    // Events/party/wedding
    if (lowerMessage.match(/wedding|party|event|celebration|tent|dj|sound/)) {
      return {
        content: `🎉 **Event Equipment Packages**

Let's make your event unforgettable! 

**Popular Packages:**

🎪 **Tent & Shelter**
• 20x40 Frame Tent (80 guests) - $495/day
• Clear Top Marquee - $750/day

🔊 **Sound & Entertainment**
• DJ Package - $295/day
• Premium PA System - $175/day

💡 **Lighting & Decor**
• String light package - $85/day
• Uplighting (10 units) - $150/day

📦 **Complete Wedding Package**
Starting at $1,200/day - includes tent, tables, chairs, lighting!

How many guests are you expecting?`,
        suggestions: ['50-100 guests', '100-200 guests', '200+ guests', 'Custom package'],
        type: 'recommendation',
      };
    }

    // Help/how-to
    if (lowerMessage.match(/help|how|work|explain|what is|guide|tutorial/)) {
      return {
        content: `📚 **How Islakayd Works**

It's super easy to rent equipment!

**For Renters:**
1. 🔍 **Search** - Find what you need
2. 📅 **Book** - Select dates & reserve
3. 💳 **Pay** - Secure checkout
4. 🚗 **Pickup** - Or get delivery
5. ⭐ **Return** - Drop off & review

**Your Protection:**
• ✅ Verified equipment owners
• 🛡️ Damage protection available
• 📞 24/7 customer support
• 💰 Secure payments

**Popular Features:**
• Instant booking on many items
• Price match guarantee
• Flexible cancellation

What would you like to know more about?`,
        suggestions: ['How to book', 'Payment options', 'Cancellation policy', 'List my equipment'],
        type: 'info',
      };
    }

    // Default contextual response
    return {
      content: `I'd love to help you find the perfect equipment! 🎯

To give you personalized recommendations, tell me:

• **What** - Type of equipment or project
• **When** - Your rental dates
• **Where** - Your location
• **Budget** - Price range (optional)

Or try one of the quick actions below to get started!`,
      suggestions: ['Browse all equipment', 'Construction tools', 'Photography gear', 'Event supplies'],
      type: 'info',
    };
  }, [equipment, onNavigate]);

  const simulateResponse = async (userMessage: string) => {
    setIsTyping(true);
    setShowQuickActions(false);

    // Simulate realistic typing delay
    const responseDelay = 800 + Math.random() * 1200;
    await new Promise((resolve) => setTimeout(resolve, responseDelay));

    const response = generateAIResponse(userMessage);

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      suggestions: response.suggestions,
      actions: response.actions,
      metadata: { type: response.type },
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsTyping(false);
  };

  const handleFeedback = (messageId: string, isPositive: boolean) => {
    setFeedbackGiven((prev) => new Set([...prev, messageId]));
    // In production, send feedback to analytics
    console.log(`Feedback for ${messageId}: ${isPositive ? 'positive' : 'negative'}`);
  };

  const handleSaveResponse = (messageId: string) => {
    setSavedResponses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const handleCopyResponse = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content.replace(/\*\*/g, '').replace(/[•#]/g, '-'));
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = input;
    setInput('');
    simulateResponse(messageToSend);
  };

  const handleSuggestionClick = (suggestion: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: suggestion,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    simulateResponse(suggestion);
  };

  const handleQuickAction = (query: string) => {
    handleSuggestionClick(query);
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    // In production, integrate with Web Speech API
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 group ${isOpen ? 'hidden' : ''}`}
      >
        <div className="relative">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity animate-pulse" />
          
          {/* Main Button */}
          <div className="relative w-16 h-16 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110">
            <Bot className="w-8 h-8 text-white" />
            <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-amber-400 animate-bounce" />
          </div>
          
          {/* Notification Badge */}
          <div className="absolute -top-1 -left-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xs text-white font-bold">AI</span>
          </div>
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-3 px-4 py-2 bg-gray-900 text-white text-sm rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Ask Kayd AI
          </span>
          <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
        </div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-white shadow-2xl flex flex-col transition-all duration-300 ${
            isExpanded
              ? 'inset-4 rounded-3xl'
              : 'bottom-6 right-6 w-[420px] h-[680px] rounded-3xl'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-t-3xl">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2">
                  Kayd AI
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">Pro</span>
                </h3>
                <p className="text-sm text-white/80 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Online • Typically replies instantly
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                title="History"
              >
                <History className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="absolute top-16 right-4 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-10 p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sound effects</span>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`w-10 h-6 rounded-full transition-colors ${soundEnabled ? 'bg-teal-500' : 'bg-gray-200'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${soundEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Voice responses</span>
                  <button
                    onClick={() => setIsSpeaking(!isSpeaking)}
                    className={`w-10 h-6 rounded-full transition-colors ${isSpeaking ? 'bg-teal-500' : 'bg-gray-200'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${isSpeaking ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="w-full mt-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Close
              </button>
            </div>
          )}

          {/* History Panel */}
          {showHistory && (
            <div className="absolute top-16 left-4 right-4 bg-white rounded-xl shadow-xl border border-gray-100 z-10 p-4 max-h-64 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Recent Conversations</h4>
                <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {conversationHistory.map((conv) => (
                  <button
                    key={conv.id}
                    className="w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 text-sm">{conv.title}</span>
                      <span className="text-xs text-gray-400">{conv.messageCount} msgs</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 truncate">{conv.preview}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-gray-700 to-gray-900'
                      : 'bg-gradient-to-br from-teal-500 to-emerald-500'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className={`max-w-[85%] ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-teal-500 to-emerald-500 text-white rounded-tr-sm'
                        : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-line prose prose-sm max-w-none">
                      {message.content.split('\n').map((line, i) => {
                        const boldParsed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        return (
                          <span key={i} dangerouslySetInnerHTML={{ __html: boldParsed }} className="block" />
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Message Actions */}
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-1 mt-2 ml-1">
                      <span className="text-xs text-gray-400 mr-2">{formatTime(message.timestamp)}</span>
                      {!feedbackGiven.has(message.id) ? (
                        <>
                          <button
                            onClick={() => handleFeedback(message.id, true)}
                            className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                            title="Helpful"
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleFeedback(message.id, false)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                            title="Not helpful"
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">Thanks!</span>
                      )}
                      <button
                        onClick={() => handleCopyResponse(message.content)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copy"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSaveResponse(message.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          savedResponses.has(message.id)
                            ? 'text-amber-500 bg-amber-50'
                            : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
                        }`}
                        title="Save"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {message.actions.map((action, index) => (
                        <button
                          key={index}
                          onClick={action.action}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            action.variant === 'primary'
                              ? 'bg-teal-500 text-white hover:bg-teal-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {action.icon}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-teal-300 hover:bg-teal-50 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-teal-500 to-emerald-500">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="px-4 py-3 bg-gray-100 rounded-2xl rounded-tl-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-gray-500">Kayd is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions for new conversations */}
            {showQuickActions && messages.length === 1 && (
              <div className="space-y-4">
                <p className="text-xs text-gray-400 text-center">Quick Actions</p>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.query)}
                      className="group relative p-4 bg-white border border-gray-200 rounded-xl hover:border-teal-300 hover:shadow-lg transition-all text-left overflow-hidden"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-2`}>
                        {action.icon}
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm">{action.label}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-100">
            {/* Context Hints */}
            <div className="flex items-center justify-center gap-3 mb-3 flex-wrap">
              {contextualPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(prompt.text)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                  {prompt.icon}
                  {prompt.text}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-gray-50 rounded-2xl p-2">
              <button
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title="Attach image"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask Kayd anything..."
                className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none text-sm"
              />
              <button
                onClick={toggleVoiceInput}
                className={`p-2 rounded-xl transition-colors ${
                  isListening
                    ? 'bg-red-100 text-red-500'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title="Voice input"
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="p-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Your data is secure
              </span>
              <span>Powered by AI</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
