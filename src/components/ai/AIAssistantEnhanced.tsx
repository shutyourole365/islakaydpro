import { useState, useRef, useEffect, useCallback } from 'react';
import { sendMessage as sendAIMessage } from '../../services/ai';
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
  Wrench,
  Camera,
  Truck,
  PartyPopper,
  ImageIcon,
  Clock,
  Zap,
  Volume2,
  VolumeX,
  Settings,
  Loader2,
  CheckCircle2,
  TrendingUp,
  Star,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  metadata?: {
    type?: 'search' | 'booking' | 'info' | 'recommendation' | 'alert' | 'success';
    equipmentIds?: string[];
    imageUrl?: string;
    isVoice?: boolean;
    processingTime?: number;
  };
}

interface ConversationContext {
  topic?: string;
  equipmentType?: string;
  location?: string;
  budget?: { min: number; max: number };
  dates?: { start: string; end: string };
  preferences?: string[];
}

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  query: string;
  color: string;
}

const quickActions: QuickAction[] = [
  { icon: <Wrench className="w-4 h-4" />, label: 'Power Tools', query: 'Show me available power tools', color: 'bg-orange-500' },
  { icon: <Camera className="w-4 h-4" />, label: 'Cameras', query: 'I need to rent a camera', color: 'bg-blue-500' },
  { icon: <Truck className="w-4 h-4" />, label: 'Heavy Equipment', query: 'Find me an excavator or bulldozer', color: 'bg-amber-500' },
  { icon: <PartyPopper className="w-4 h-4" />, label: 'Events', query: 'What equipment do I need for a wedding?', color: 'bg-pink-500' },
];

export default function AIAssistantEnhanced() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "👋 Hi! I'm **Kayd**, your AI equipment assistant powered by advanced language models. I can:\n\n• 🔍 Find equipment with natural language\n• 🎤 Understand voice commands\n• 📸 Analyze images to identify equipment\n• 💰 Compare prices across listings\n• 📅 Check real-time availability\n• 🤖 Learn your preferences\n\nHow can I help you today?",
      timestamp: new Date(),
      suggestions: [
        'Find construction equipment near me',
        'Compare camera rental prices',
        'What do I need for a home renovation?',
        'Show trending equipment this week',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [context, setContext] = useState<ConversationContext>({});
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

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

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakResponse = useCallback((text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;

    const cleanText = text.replace(/\*\*/g, '').replace(/[#*_]/g, '');
    
    window.speechSynthesis.cancel();
    synthesisRef.current = new SpeechSynthesisUtterance(cleanText);
    synthesisRef.current.rate = 1;
    synthesisRef.current.pitch = 1;
    
    synthesisRef.current.onstart = () => setIsSpeaking(true);
    synthesisRef.current.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(synthesisRef.current);
  }, [voiceEnabled]);

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!uploadedImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: '📸 [Uploaded an image for analysis]',
      timestamp: new Date(),
      metadata: { imageUrl: uploadedImage },
    };

    setMessages(prev => [...prev, userMessage]);
    setUploadedImage(null);
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const responseMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: "🔍 **Image Analysis Complete**\n\nI can see this appears to be construction/power equipment. Based on my analysis:\n\n**Identified Equipment:**\n• Type: Power Tool / Heavy Equipment\n• Condition: Appears to be in good condition\n• Category: Construction\n\n**Similar Rentals Available:**\n• DeWalt 20V Combo Kit - $75/day\n• Milwaukee M18 Impact - $45/day\n• Makita Circular Saw - $35/day\n\nWould you like me to find exact matches or similar equipment near you?",
      timestamp: new Date(),
      suggestions: ['Find exact match', 'Show similar equipment', 'Get price comparison', 'Search by brand'],
      metadata: { type: 'recommendation', processingTime: 2000 },
    };

    setMessages(prev => [...prev, responseMessage]);
    setIsTyping(false);
  };

  const getContextualResponses = useCallback((userMessage: string): { content: string; suggestions: string[]; type: string } => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('excavator') || lowerMessage.includes('bulldozer')) {
      setContext(prev => ({ ...prev, equipmentType: 'heavy', topic: 'construction' }));
    }
    if (lowerMessage.includes('camera') || lowerMessage.includes('photo')) {
      setContext(prev => ({ ...prev, equipmentType: 'camera', topic: 'photography' }));
    }

    if (lowerMessage.includes('trending') || lowerMessage.includes('popular') || lowerMessage.includes('hot')) {
      return {
        content: "📈 **Trending This Week**\n\nHere's what's hot on Islakayd:\n\n🔥 **#1** Mini Excavator (32% more rentals)\n🔥 **#2** DJI Mavic 3 Drone (28% more rentals)\n🔥 **#3** Sony A7IV Camera (25% more rentals)\n🔥 **#4** DeWalt 20V Combo Kit (22% more rentals)\n🔥 **#5** Party Tent 20x40 (wedding season!)\n\n**Rising Categories:**\n• Landscaping equipment +45%\n• Event supplies +38%\n• Photography gear +32%\n\nWant me to show details on any of these?",
        suggestions: ['Show mini excavators', 'View drone options', 'Camera rental deals', 'Event equipment'],
        type: 'recommendation'
      };
    }

    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('what should')) {
      if (context.topic === 'construction') {
        return {
          content: "🏗️ **Smart Recommendation**\n\nBased on your interest in construction equipment, here's what I suggest:\n\n**Essential Package:**\n1. Mini Excavator (1-3 ton) - $250/day\n2. Skid Steer Loader - $200/day\n3. Concrete Mixer - $50/day\n\n**Add-ons:**\n• Safety equipment (PPE) - $25/day\n• Generator - $75/day\n\n**💡 Pro Tip:** Rent weekly for 30% savings!\n\nTotal estimate: ~$500/day or $2,800/week\n\nWant me to check availability?",
          suggestions: ['Check availability', 'Get weekly rate', 'Add safety equipment', 'View alternatives'],
          type: 'recommendation'
        };
      }
    }

    if (lowerMessage.includes('near me') || lowerMessage.includes('nearby') || lowerMessage.includes('my area')) {
      return {
        content: "📍 **Equipment Near You**\n\nI've found 47 listings within 10 miles:\n\n**Top Rated Nearby:**\n⭐ 4.9 - CAT 320 Excavator (2.3 mi) - $450/day\n⭐ 4.9 - Sony A7IV Kit (1.8 mi) - $125/day\n⭐ 4.8 - DeWalt Power Tools (0.8 mi) - $75/day\n⭐ 4.8 - DJ Equipment (3.1 mi) - $295/day\n\n**Available Today:**\n✅ 12 power tools\n✅ 8 cameras\n✅ 5 heavy equipment\n✅ 15 event supplies\n\nWould you like me to filter by category or price?",
        suggestions: ['Filter by category', 'Cheapest first', 'Available today', 'Show on map'],
        type: 'search'
      };
    }

    if (lowerMessage.includes('compare') || lowerMessage.includes('price') || lowerMessage.includes('cheapest') || lowerMessage.includes('best deal')) {
      return {
        content: "💰 **Price Comparison Tool**\n\nI'll help you find the best deals! Here's a sample comparison:\n\n**Excavator Rentals (20 ton class):**\n\n| Owner | Daily | Weekly | Rating |\n|-------|-------|--------|--------|\n| Heavy Equip LLC | $450 | $2,800 | ⭐4.9 |\n| ProRent Co | $425 | $2,650 | ⭐4.7 |\n| BuildRight | $475 | $2,900 | ⭐4.8 |\n\n**Best Value:** ProRent Co saves you $25/day\n**Best Rated:** Heavy Equip LLC (47 reviews)\n\n💡 **Kayd's Pick:** Heavy Equip LLC - worth $25 extra for reliability\n\nWhich would you like to book?",
        suggestions: ['Book Heavy Equip LLC', 'Book ProRent Co', 'See more options', 'Check availability'],
        type: 'info'
      };
    }

    if (lowerMessage.includes('book') || lowerMessage.includes('reserve') || lowerMessage.includes('rent')) {
      return {
        content: "📅 **Let's Book Your Rental**\n\nI'll help you complete your booking! Just tell me:\n\n**1. Equipment** - What do you need?\n**2. Dates** - When do you need it?\n**3. Location** - Where should we look?\n\nOr if you've already browsed:\n• Say the equipment name\n• I'll check availability\n• Guide you through checkout\n\n💡 **Quick Book:** Reply with something like:\n*\"Book the CAT excavator for next Monday to Friday\"*",
        suggestions: ['Book excavator', 'Check camera availability', 'Reserve power tools', 'See my saved items'],
        type: 'booking'
      };
    }

    if (lowerMessage.includes('weather') || lowerMessage.includes('rain') || lowerMessage.includes('outdoor')) {
      return {
        content: "🌤️ **Weather-Smart Recommendations**\n\nI see you're planning outdoor work! Here's what I suggest:\n\n**Rainy Day Essentials:**\n• Covered trailer - keeps equipment dry\n• Tarps & covers - $15/day\n• Indoor lighting kit - $45/day\n\n**All-Weather Equipment:**\n• Waterproof power tools available\n• Enclosed cab excavators\n• Climate-controlled storage trailers\n\n**Forecast for your area:**\n☀️ Mon-Wed: Clear (great for rentals!)\n🌧️ Thu-Fri: Rain expected\n\nShall I find weather-appropriate equipment?",
        suggestions: ['Show weatherproof tools', 'Find covered equipment', 'Indoor alternatives', 'Check forecast'],
        type: 'info'
      };
    }

    return {
      content: "I'd love to help you find the perfect equipment! 🎯\n\nTo give you personalized recommendations, tell me:\n\n• **What** - Type of equipment or project\n• **When** - Your rental dates\n• **Where** - Your location\n• **Budget** - Price range (optional)\n\nOr try:\n• 📸 Upload an image of equipment you need\n• 🎤 Use voice to describe your project\n• 💡 Ask for trending equipment\n\nI'm here to help!",
      suggestions: ['Browse trending', 'Equipment near me', 'Compare prices', 'Voice search'],
      type: 'info'
    };
  }, [context]);

  const simulateResponse = useCallback(async (userMessage: string) => {
    setIsTyping(true);
    setShowQuickActions(false);

    const startTime = Date.now();

    try {
      // Build conversation history for context
      const conversationHistory = messages
        .filter(m => m.id !== '1' && m.role !== 'system')
        .slice(-6)
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

      // Add current message
      conversationHistory.push({
        role: 'user' as const,
        content: userMessage,
      });

      // Call real AI service
      const response = await sendAIMessage(conversationHistory);
      const processingTime = Date.now() - startTime;

      const newMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions,
        metadata: { 
          type: 'recommendation',
          processingTime,
        },
      };

      setMessages((prev) => [...prev, newMessage]);

      if (voiceEnabled) {
        speakResponse(response.content);
      }
    } catch (error) {
      console.error('AI service error:', error);
      
      // Fallback to local responses
      const response = getContextualResponses(userMessage);
      const processingTime = Date.now() - startTime;

      const newMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.content + "\n\n_(Using offline mode)_",
        timestamp: new Date(),
        suggestions: response.suggestions,
        metadata: { 
          type: response.type as 'search' | 'alert' | 'success' | 'booking' | 'info' | 'recommendation',
          processingTime,
        },
      };

      setMessages((prev) => [...prev, newMessage]);

      if (voiceEnabled) {
        speakResponse(response.content);
      }
    } finally {
      setIsTyping(false);
    }
  }, [messages, getContextualResponses, voiceEnabled, speakResponse]);

  const handleFeedback = (messageId: string, isPositive: boolean) => {
    setFeedbackGiven((prev) => new Set([...prev, messageId]));
    console.log(`Feedback for message ${messageId}: ${isPositive ? 'positive' : 'negative'}`);
  };

  const handleSend = useCallback(() => {
    if (!input.trim() && !uploadedImage) return;

    if (uploadedImage) {
      analyzeImage();
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      metadata: { isVoice: isListening },
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = input;
    setInput('');
    simulateResponse(messageToSend);
  }, [input, uploadedImage, isListening, simulateResponse]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: suggestion,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    simulateResponse(suggestion);
  }, [simulateResponse]);

  const clearConversation = () => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: "👋 Conversation cleared! How can I help you?",
      timestamp: new Date(),
      suggestions: ['Find equipment', 'Check prices', 'Book a rental', 'Get recommendations'],
    }]);
    setContext({});
    setShowQuickActions(true);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 group ${isOpen ? 'hidden' : ''}`}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity animate-pulse" />
          <div className="relative w-16 h-16 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110">
            <Bot className="w-8 h-8 text-white" />
            <Sparkles className="w-4 h-4 text-white absolute -top-1 -right-1 animate-bounce" />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xs text-white font-bold">AI</span>
          </div>
        </div>
      </button>

      {isOpen && (
        <div
          className={`fixed z-50 bg-white shadow-2xl flex flex-col transition-all duration-300 ${
            isExpanded ? 'inset-4 rounded-3xl' : 'bottom-6 right-6 w-[420px] h-[680px] rounded-3xl'
          }`}
        >
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-t-3xl">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2">
                  Kayd AI
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">Pro</span>
                </h3>
                <p className="text-sm text-white/80 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Powered by Advanced AI
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowSettings(!showSettings)} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
                <Settings className="w-5 h-5" />
              </button>
              <button onClick={() => setIsExpanded(!isExpanded)} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
                {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
              <button onClick={() => setIsOpen(false)} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {showSettings && (
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium">Voice Responses</span>
                </div>
                <button onClick={() => setVoiceEnabled(!voiceEnabled)} className={`w-12 h-6 rounded-full transition-colors ${voiceEnabled ? 'bg-teal-500' : 'bg-gray-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${voiceEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <button onClick={clearConversation} className="mt-3 w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                Clear Conversation
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${message.role === 'user' ? 'bg-gray-200' : 'bg-gradient-to-br from-teal-500 to-emerald-500'}`}>
                  {message.role === 'user' ? (
                    message.metadata?.isVoice ? <Mic className="w-4 h-4 text-gray-600" /> : <User className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className={`max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                  {message.metadata?.imageUrl && (
                    <img src={message.metadata.imageUrl} alt="Uploaded" className="w-32 h-32 object-cover rounded-xl mb-2" />
                  )}
                  <div className={`px-4 py-3 rounded-2xl ${message.role === 'user' ? 'bg-teal-500 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
                    <div className="text-sm whitespace-pre-line">
                      {message.content.split('\n').map((line, i) => {
                        const boldParsed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        return <span key={i} dangerouslySetInnerHTML={{ __html: boldParsed }} className="block" />;
                      })}
                    </div>
                  </div>
                  
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mt-2 ml-1">
                      {!feedbackGiven.has(message.id) ? (
                        <>
                          <button onClick={() => handleFeedback(message.id, true)} className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600"><ThumbsUp className="w-4 h-4" /></button>
                          <button onClick={() => handleFeedback(message.id, false)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"><ThumbsDown className="w-4 h-4" /></button>
                          {isSpeaking ? (
                            <button onClick={stopSpeaking} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><VolumeX className="w-4 h-4" /></button>
                          ) : (
                            <button onClick={() => speakResponse(message.content)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><Volume2 className="w-4 h-4" /></button>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Thanks!</span>
                      )}
                      {message.metadata?.processingTime && (
                        <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {message.metadata.processingTime}ms</span>
                      )}
                    </div>
                  )}

                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {message.suggestions.map((suggestion, index) => (
                        <button key={index} onClick={() => handleSuggestionClick(suggestion)} className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-teal-300 hover:bg-teal-50">
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
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-teal-500 to-emerald-500">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="px-4 py-3 bg-gray-100 rounded-2xl rounded-tl-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-teal-500 animate-spin" />
                    <span className="text-sm text-gray-500">Kayd is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {showQuickActions && messages.length === 1 && (
              <div className="space-y-3">
                <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3" /> Quick Actions
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, index) => (
                    <button key={index} onClick={() => handleSuggestionClick(action.query)} className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-teal-300 hover:bg-teal-50 text-left">
                      <span className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center text-white`}>{action.icon}</span>
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {uploadedImage && (
            <div className="px-4 pb-2">
              <div className="relative inline-block">
                <img src={uploadedImage} alt="Upload preview" className="w-20 h-20 object-cover rounded-xl" />
                <button onClick={() => setUploadedImage(null)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center justify-center gap-4 mb-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Search className="w-3 h-3" /> Search</span>
              <span className="flex items-center gap-1"><Mic className="w-3 h-3" /> Voice</span>
              <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Image</span>
              <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Trending</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-2xl p-2">
              <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={isListening ? 'Listening...' : 'Ask Kayd anything...'}
                className={`flex-1 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none text-sm ${isListening ? 'text-teal-600' : ''}`}
              />
              <button onClick={toggleVoiceInput} className={`p-2 rounded-xl ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button onClick={handleSend} disabled={(!input.trim() && !uploadedImage) || isTyping} className="p-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white disabled:opacity-50">
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-center text-gray-400 mt-3 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" /> Powered by Advanced AI • <Star className="w-3 h-3" /> Pro Features
            </p>
          </div>
        </div>
      )}
    </>
  );
}

// SpeechRecognition types for voice input
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}
