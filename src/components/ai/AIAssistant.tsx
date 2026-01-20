import { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
  Mic,
  Paperclip,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Minimize2,
  Maximize2,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hi! I'm Kayd, your AI equipment assistant. I can help you find the perfect equipment for your project, compare prices, check availability, and answer any questions. What are you looking to rent today?",
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateResponse = async (userMessage: string) => {
    setIsTyping(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const responses: Record<string, { content: string; suggestions?: string[] }> = {
      excavator: {
        content:
          "Great choice! I found 24 excavators available in your area. Based on your needs, I'd recommend the CAT 320 for general construction work - it's available starting at $350/day with excellent reviews (4.9 stars from 156 rentals). Would you like me to show you the top options or help narrow down based on specific requirements like dig depth or weight capacity?",
        suggestions: [
          'Show me the top 5 options',
          'I need one for a specific dig depth',
          'What about mini excavators?',
          'Compare prices',
        ],
      },
      wedding: {
        content:
          "Congratulations on the upcoming wedding! For a typical wedding setup, you might need:\n\n1. **Tents & Canopies** - Starting at $200/day\n2. **Tables & Chairs** - $50-150/day per set\n3. **Lighting & Decor** - $100-300/day\n4. **Sound System** - $150-400/day\n5. **Dance Floor** - $200-500/day\n\nI can create a complete package estimate based on your guest count. How many people are you expecting?",
        suggestions: [
          '100-150 guests',
          'Show me tent options',
          'I need sound equipment',
          'What about photography gear?',
        ],
      },
      camera: {
        content:
          "I'd love to help you find the perfect camera rental! Here's a quick price comparison for popular options:\n\n| Camera | Daily Rate | Rating |\n|--------|-----------|--------|\n| Sony A7IV | $75/day | 4.9 |\n| Canon R5 | $85/day | 4.8 |\n| RED Komodo | $250/day | 4.9 |\n| Blackmagic 6K | $125/day | 4.7 |\n\nWhat type of project is this for? I can recommend the best option based on your needs.",
        suggestions: [
          'For a short film',
          'Real estate photography',
          'I need video capability',
          'Show me lens packages',
        ],
      },
      default: {
        content:
          "I can definitely help you with that! To give you the best recommendations, could you tell me a bit more about your project? For example:\n\n- What type of work are you doing?\n- How long do you need the equipment?\n- Do you have a budget range in mind?\n\nThis will help me find exactly what you need.",
        suggestions: [
          'Construction project',
          'Home renovation',
          'Photography/Video',
          'Event setup',
        ],
      },
    };

    const lowerMessage = userMessage.toLowerCase();
    let response = responses.default;

    if (lowerMessage.includes('excavator')) {
      response = responses.excavator;
    } else if (lowerMessage.includes('wedding') || lowerMessage.includes('event')) {
      response = responses.wedding;
    } else if (
      lowerMessage.includes('camera') ||
      lowerMessage.includes('photo') ||
      lowerMessage.includes('video')
    ) {
      response = responses.camera;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      suggestions: response.suggestions,
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsTyping(false);
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
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                  </div>
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mt-2 ml-1">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
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
                  <div className="flex items-center gap-1">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
                    <span className="text-sm text-gray-500">Kayd is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 rounded-2xl p-2">
              <button className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Kayd anything about equipment..."
                className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none text-sm"
              />
              <button className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <Mic className="w-5 h-5" />
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-center text-gray-400 mt-3">
              Kayd AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
