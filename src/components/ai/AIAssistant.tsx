import { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Mic,
  Paperclip,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
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
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  metadata?: {
    type?: 'search' | 'booking' | 'info' | 'recommendation';
    equipmentIds?: string[];
  };
}

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  query: string;
}

const quickActions: QuickAction[] = [
  { icon: <Wrench className="w-4 h-4" />, label: 'Power Tools', query: 'Show me available power tools' },
  { icon: <Camera className="w-4 h-4" />, label: 'Cameras', query: 'I need to rent a camera' },
  { icon: <Truck className="w-4 h-4" />, label: 'Heavy Equipment', query: 'Find me an excavator or bulldozer' },
  { icon: <PartyPopper className="w-4 h-4" />, label: 'Events', query: 'What equipment do I need for a wedding?' },
];

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "👋 Hi! I'm **Kayd**, your AI equipment assistant. I can help you:\n\n• 🔍 Find the perfect equipment for your project\n• 💰 Compare prices and get the best deals\n• 📅 Check availability and make reservations\n• ❓ Answer any questions about rentals\n\nWhat are you looking to rent today?",
      timestamp: new Date(),
      suggestions: [
        'Find me an excavator',
        'What equipment do I need for a wedding?',
        'Compare camera rental prices',
        'Show me available power tools',
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

  const getContextualResponses = useCallback((userMessage: string): { content: string; suggestions: string[]; type: string } => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Price/cost related
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much') || lowerMessage.includes('expensive') || lowerMessage.includes('cheap') || lowerMessage.includes('budget')) {
      return {
        content: "💰 **Equipment Pricing Guide**\n\nPrices vary by equipment type and rental duration:\n\n**Power Tools**: $25-100/day\n**Photography Gear**: $50-250/day\n**Heavy Equipment**: $200-800/day\n**Event Supplies**: $100-500/day\n\n💡 **Pro tip**: Weekly and monthly rentals often include significant discounts (up to 30% off daily rates)!\n\nWhat's your budget range? I can find the best options for you.",
        suggestions: ['Under $100/day', '$100-300/day', 'Show me weekly deals', 'Premium equipment'],
        type: 'info'
      };
    }

    // Availability related
    if (lowerMessage.includes('available') || lowerMessage.includes('when') || lowerMessage.includes('book') || lowerMessage.includes('reserve')) {
      return {
        content: "📅 **Checking Availability**\n\nMost equipment on Islakayd can be booked with just 24-hour notice! Here's how it works:\n\n1. Select your dates\n2. Equipment owner confirms (usually within 2 hours)\n3. Pick up or get delivery\n\nTo check specific availability, tell me:\n• What equipment you need\n• Your preferred dates\n• Your location",
        suggestions: ['Check excavator availability', 'Book for this weekend', 'Need equipment tomorrow', 'How does delivery work?'],
        type: 'booking'
      };
    }

    // Delivery related
    if (lowerMessage.includes('delivery') || lowerMessage.includes('deliver') || lowerMessage.includes('pickup') || lowerMessage.includes('pick up')) {
      return {
        content: "🚚 **Delivery & Pickup Options**\n\nWe offer flexible options:\n\n**Owner Delivery** - Many owners offer delivery for a small fee\n**Self Pickup** - Meet at the owner's location\n**Courier Partners** - For smaller items\n\n📍 Delivery typically costs $25-150 depending on distance and equipment size.\n\nWould you like me to filter by equipment with free delivery?",
        suggestions: ['Show free delivery options', 'Equipment near me', 'Self pickup only', 'How far will they deliver?'],
        type: 'info'
      };
    }

    // Construction/renovation
    if (lowerMessage.includes('construct') || lowerMessage.includes('build') || lowerMessage.includes('renovation') || lowerMessage.includes('remodel') || lowerMessage.includes('home improvement')) {
      return {
        content: "🏗️ **Construction & Renovation Equipment**\n\nHere's what most projects need:\n\n**Demolition**\n• Hammer drills, jackhammers\n• Demolition saws\n\n**Building**\n• Concrete mixers, vibrators\n• Scaffolding, ladders\n\n**Finishing**\n• Sanders, planers\n• Paint sprayers\n\n**Safety**\n• PPE equipment\n\nWhat type of project are you working on?",
        suggestions: ['Kitchen remodel', 'Bathroom renovation', 'Deck building', 'Full home renovation'],
        type: 'recommendation'
      };
    }

    // Tools/power tools
    if (lowerMessage.includes('tool') || lowerMessage.includes('drill') || lowerMessage.includes('saw') || lowerMessage.includes('power')) {
      return {
        content: "🔧 **Power Tools Available**\n\nI found 50+ power tools near you! Here are the most popular:\n\n⭐ **DeWalt 20V Combo Kit** - $75/day (4.9 rating)\n⭐ **Milwaukee M18 Impact Driver** - $35/day (4.8 rating)\n⭐ **Makita Circular Saw** - $40/day (4.7 rating)\n⭐ **Bosch Rotary Hammer** - $55/day (4.9 rating)\n\nAll include batteries, chargers, and carrying cases. What specific tools do you need?",
        suggestions: ['Drilling & driving', 'Cutting tools', 'Sanders & grinders', 'Full tool kit'],
        type: 'search'
      };
    }

    // Camera/photography
    if (lowerMessage.includes('camera') || lowerMessage.includes('photo') || lowerMessage.includes('video') || lowerMessage.includes('film') || lowerMessage.includes('shoot')) {
      return {
        content: "📸 **Camera & Video Equipment**\n\nTop rentals for your shoot:\n\n**Mirrorless Cameras**\n• Sony A7IV Kit - $125/day\n• Canon R5 - $150/day\n• Fuji X-T5 - $85/day\n\n**Cinema Cameras**\n• RED Komodo - $350/day\n• Blackmagic 6K Pro - $175/day\n\n**Accessories**\n• Lenses, tripods, lighting\n• Gimbals and stabilizers\n\nWhat's the project? I'll recommend the perfect setup!",
        suggestions: ['Wedding photography', 'Short film', 'Real estate', 'YouTube/content creation'],
        type: 'search'
      };
    }

    // Wedding/event
    if (lowerMessage.includes('wedding') || lowerMessage.includes('party') || lowerMessage.includes('event') || lowerMessage.includes('celebration')) {
      return {
        content: "🎉 **Event Equipment Packages**\n\nEverything you need for an amazing event:\n\n**Tents & Structures**\n• 20x30 Party Tent - $300/day\n• Clear Top Marquee - $500/day\n\n**Furniture**\n• Tables (rounds, rectangles)\n• Chairs (chiavari, folding)\n\n**Atmosphere**\n• String lights, uplighting\n• Sound systems, DJ gear\n• Dance floors\n\nHow many guests are you expecting? I'll build a custom package!",
        suggestions: ['50-100 guests', '100-200 guests', '200+ guests', 'Show me tent options'],
        type: 'recommendation'
      };
    }

    // Excavator/heavy equipment
    if (lowerMessage.includes('excavator') || lowerMessage.includes('bulldozer') || lowerMessage.includes('backhoe') || lowerMessage.includes('heavy')) {
      return {
        content: "🚜 **Heavy Equipment Rentals**\n\nI found 24 excavators and heavy equipment nearby:\n\n**Excavators**\n• Mini (1-3 ton) - $250/day\n• Medium (6-10 ton) - $400/day\n• Large (20+ ton) - $650/day\n\n**Also Available**\n• Backhoe loaders\n• Skid steers\n• Bulldozers\n\n✅ All come with operator manuals\n✅ Delivery available\n\nWhat size do you need for your project?",
        suggestions: ['Mini excavator for landscaping', 'Medium for foundations', 'Need an operator too', 'Compare all options'],
        type: 'search'
      };
    }

    // Help/how to
    if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('work') || lowerMessage.includes('explain')) {
      return {
        content: "📚 **How Islakayd Works**\n\n**For Renters:**\n1. 🔍 Search for equipment\n2. 📅 Select your dates\n3. 📱 Book instantly or request\n4. 🚗 Pick up or get delivery\n5. ⭐ Return & leave a review\n\n**Protection Included:**\n• Verified owners\n• Damage protection options\n• 24/7 support\n• Secure payments\n\nWhat would you like to know more about?",
        suggestions: ['How to book equipment', 'What if something breaks?', 'Cancellation policy', 'How to list my equipment'],
        type: 'info'
      };
    }

    // Default response
    return {
      content: "I'd love to help you find the perfect equipment! 🎯\n\nTo give you personalized recommendations, tell me:\n\n• **What** - Type of equipment or project\n• **When** - Your rental dates\n• **Where** - Your location\n• **Budget** - Price range (optional)\n\nOr try one of the quick options below!",
      suggestions: ['Browse all equipment', 'Construction tools', 'Photography gear', 'Event supplies'],
      type: 'info'
    };
  }, []);

  const simulateResponse = async (userMessage: string) => {
    setIsTyping(true);
    setShowQuickActions(false);

    // Simulate realistic typing delay
    const responseDelay = 800 + Math.random() * 1200;
    await new Promise((resolve) => setTimeout(resolve, responseDelay));

    const response = getContextualResponses(userMessage);

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      suggestions: response.suggestions,
      metadata: { type: response.type as 'search' | 'booking' | 'info' | 'recommendation' },
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsTyping(false);
  };

  const handleFeedback = (messageId: string, isPositive: boolean) => {
    setFeedbackGiven((prev) => new Set([...prev, messageId]));
    // In production, this would send feedback to the server
    console.log(`Feedback for message ${messageId}: ${isPositive ? 'positive' : 'negative'}`);
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

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 group ${isOpen ? 'hidden' : ''}`}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
          <div className="relative w-16 h-16 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xs text-white font-bold">1</span>
          </div>
        </div>
        <div className="absolute bottom-full right-0 mb-3 px-4 py-2 bg-gray-900 text-white text-sm rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Ask Kayd AI
          <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
        </div>
      </button>

      {isOpen && (
        <div
          className={`fixed z-50 bg-white shadow-2xl flex flex-col transition-all duration-300 ${
            isExpanded
              ? 'inset-4 rounded-3xl'
              : 'bottom-6 right-6 w-[420px] h-[640px] rounded-3xl'
          }`}
        >
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-t-3xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2">
                  Kayd AI
                  <Sparkles className="w-4 h-4" />
                </h3>
                <p className="text-sm text-white/80">Your equipment assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                {isExpanded ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-gray-200'
                      : 'bg-gradient-to-br from-teal-500 to-emerald-500'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] ${
                    message.role === 'user' ? 'text-right' : ''
                  }`}
                >
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-teal-500 text-white rounded-tr-sm'
                        : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-line prose prose-sm max-w-none">
                      {message.content.split('\n').map((line, i) => {
                        // Handle bold text, escape HTML to prevent XSS
                        const escapeHtml = (text: string) =>
                          text.replace(/[&<>"']/g, (m) => ({
                            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
                          }[m]));
                        const boldParsed = escapeHtml(line).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        return (
                          <span key={i} dangerouslySetInnerHTML={{ __html: boldParsed }} className="block" />
                        );
                      })}
                    </div>
                  </div>
                  {message.role === 'assistant' && !feedbackGiven.has(message.id) && (
                    <div className="flex items-center gap-2 mt-2 ml-1">
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
                      <button 
                        onClick={() => simulateResponse(messages[messages.length - 2]?.content || '')}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Regenerate response"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {message.role === 'assistant' && feedbackGiven.has(message.id) && (
                    <p className="text-xs text-gray-400 mt-2 ml-1">Thanks for your feedback!</p>
                  )}
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

            {/* Quick Actions for first-time users */}
            {showQuickActions && messages.length === 1 && (
              <div className="space-y-3">
                <p className="text-xs text-gray-400 text-center">Quick Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(action.query)}
                      className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-teal-300 hover:bg-teal-50 transition-colors text-left"
                    >
                      <span className="text-teal-500">{action.icon}</span>
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-100">
            {/* Context hints */}
            <div className="flex items-center justify-center gap-4 mb-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Search className="w-3 h-3" />
                Search
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Book
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                Prices
              </span>
              <span className="flex items-center gap-1">
                <HelpCircle className="w-3 h-3" />
                Help
              </span>
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
                placeholder="Ask Kayd anything about equipment..."
                className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none text-sm"
              />
              <button 
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title="Voice input"
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="p-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-center text-gray-400 mt-3">
              Powered by AI • <span className="text-teal-500 cursor-pointer hover:underline">Privacy Policy</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
