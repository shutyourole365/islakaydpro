import { ArrowLeft, Mic, MicOff, Volume2, VolumeX, MessageCircle, Send, Bot, User, Settings, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState, useEffect, useRef, useCallback } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface VoiceAIAssistantProps {
  onBack: () => void;
  userId?: string;
}

export default function VoiceAIAssistant({ onBack }: VoiceAIAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m Kayd, your AI equipment assistant. I can help you find equipment, answer questions about rentals, and provide recommendations. What can I help you with today?',
      timestamp: new Date(),
      suggestions: [
        'Find excavators near me',
        'What\'s the best camera for weddings?',
        'How much does it cost to rent a generator?',
        'Show me equipment maintenance tips'
      ]
    }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock AI responses based on keywords
  const getAIResponse = (userMessage: string): { response: string; suggestions: string[] } => {
    const message = userMessage.toLowerCase();

    if (message.includes('excavator') || message.includes('dig') || message.includes('construction')) {
      return {
        response: 'I can help you find excavators! We have several CAT models available. The CAT 320 is our most popular - it\'s well-maintained with GPS navigation and costs $450/day. Would you like me to show you available units in your area?',
        suggestions: [
          'Show me CAT excavators',
          'What\'s the rental process?',
          'Do you offer delivery?',
          'Tell me about maintenance'
        ]
      };
    }

    if (message.includes('camera') || message.includes('photography') || message.includes('photo')) {
      return {
        response: 'For photography equipment, we have professional DSLRs and mirrorless cameras. The Sony A7R IV is excellent for weddings and costs $95/day. It comes with multiple lenses and accessories. When do you need it?',
        suggestions: [
          'Show me wedding cameras',
          'What lenses are included?',
          'Compare camera options',
          'Photography tips'
        ]
      };
    }

    if (message.includes('generator') || message.includes('power') || message.includes('electric')) {
      return {
        response: 'We have various generators for different needs. Our Honda EU3000is portable generator is perfect for small jobs at $85/day. For larger construction sites, we have industrial diesel generators starting at $225/day. What power requirements do you have?',
        suggestions: [
          'Show me portable generators',
          'Industrial generator options',
          'Fuel efficiency comparison',
          'Noise level information'
        ]
      };
    }

    if (message.includes('cost') || message.includes('price') || message.includes('rent') || message.includes('how much')) {
      return {
        response: 'Equipment rental costs vary by type and duration. Most equipment starts at $50-100/day with discounts for weekly/monthly rentals. We also offer insurance and delivery services. Would you like a specific quote?',
        suggestions: [
          'Get a quote',
          'View pricing calculator',
          'See discount options',
          'Insurance information'
        ]
      };
    }

    if (message.includes('maintenance') || message.includes('repair') || message.includes('service')) {
      return {
        response: 'All our equipment undergoes regular maintenance and safety inspections. We provide maintenance records and can arrange servicing. For tips: always check fluid levels, clean after use, and store properly. Need specific maintenance advice?',
        suggestions: [
          'Equipment care tips',
          'Maintenance schedules',
          'Common issues',
          'Service booking'
        ]
      };
    }

    if (message.includes('delivery') || message.includes('pickup') || message.includes('transport')) {
      return {
        response: 'We offer delivery and pickup services for most equipment. Delivery is $50-150 depending on distance and equipment size. We can schedule same-day delivery in most areas. Would you like to arrange delivery?',
        suggestions: [
          'Schedule delivery',
          'View delivery zones',
          'Pickup options',
          'Delivery pricing'
        ]
      };
    }

    // Default response
    return {
      response: 'I\'m here to help with all your equipment rental needs! I can assist with finding equipment, pricing information, booking processes, maintenance tips, and more. What specific equipment or service are you interested in?',
      suggestions: [
        'Browse equipment categories',
        'Get rental advice',
        'Ask about availability',
        'Equipment recommendations'
      ]
    };
  };

  // Auto-scroll to bottom of messages

  const startListening = () => {
    if (speechRecognition && !isListening) {
      speechRecognition.start();
    }
  };

  const stopListening = () => {
    if (speechRecognition && isListening) {
      speechRecognition.stop();
    }
  };

  const speakText = (text: string) => {
    if (speechSynthesis && voiceEnabled && !isSpeaking) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsTyping(true);

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Get AI response
    const aiResponse = getAIResponse(messageText);
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponse.response,
      timestamp: new Date(),
      suggestions: aiResponse.suggestions
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);

    // Speak the response if voice is enabled
    if (voiceEnabled) {
      speakText(aiResponse.response);
    }
  }, [voiceEnabled]);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as Window & { webkitSpeechRecognition?: any; SpeechRecognition?: any }).webkitSpeechRecognition || (window as Window & { webkitSpeechRecognition?: any; SpeechRecognition?: any }).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: Event & { results: SpeechRecognitionResultList }) => {
        const transcript = event.results[0][0].transcript;
        handleSendMessage(transcript);
      };

      setSpeechRecognition(recognition);
    }

    if ('speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, [handleSendMessage]);

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (isSpeaking) {
      speechSynthesis?.cancel();
      setIsSpeaking(false);
    }
  };

  const clearConversation = () => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m Kayd, your AI equipment assistant. I can help you find equipment, answer questions about rentals, and provide recommendations. What can I help you with today?',
      timestamp: new Date(),
      suggestions: [
        'Find excavators near me',
        'What\'s the best camera for weddings?',
        'How much does it cost to rent a generator?',
        'Show me equipment maintenance tips'
      ]
    }]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold">Voice AI Assistant</h1>
                <p className="text-blue-100">Kayd - Your intelligent equipment companion</p>
              </div>
            </div>

            {/* Voice Controls */}
            <div className="flex justify-center gap-4">
              <Button
                onClick={isListening ? stopListening : startListening}
                className={`flex items-center gap-2 ${
                  isListening
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                    : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isListening ? 'Listening...' : 'Voice Input'}
              </Button>

              <Button
                onClick={toggleVoice}
                variant="outline"
                className="flex items-center gap-2 bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                {voiceEnabled ? 'Voice On' : 'Voice Off'}
              </Button>

              <Button
                onClick={clearConversation}
                variant="outline"
                className="flex items-center gap-2 bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                <MessageCircle className="w-4 h-4" />
                Clear Chat
              </Button>
            </div>
          </div>

          <div className="p-8">
            {/* Messages */}
            <div className="h-96 overflow-y-auto mb-6 p-4 bg-gray-50 rounded-lg">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.role === 'assistant' ? (
                        <Bot className="w-4 h-4 text-blue-600" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                      <span className="text-xs opacity-70">
                        {message.role === 'assistant' ? 'Kayd' : 'You'}
                      </span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-50 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="mb-4 flex justify-start">
                  <div className="bg-white text-gray-900 border border-gray-200 px-4 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-blue-600" />
                      <span className="text-xs opacity-70">Kayd</span>
                    </div>
                    <div className="flex gap-1 mt-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages[messages.length - 1]?.suggestions && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">Suggested questions:</p>
                <div className="flex flex-wrap gap-2">
                  {messages[messages.length - 1].suggestions?.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-2 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(currentInput)}
                placeholder="Ask me anything about equipment..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button
                onClick={() => handleSendMessage(currentInput)}
                disabled={!currentInput.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Voice Status */}
            {isListening && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Listening... Speak now</span>
                </div>
              </div>
            )}

            {isSpeaking && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Speaking response...</span>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Mic className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Voice Commands</h3>
                <p className="text-sm text-gray-600">Speak naturally to interact with Kayd</p>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Smart Responses</h3>
                <p className="text-sm text-gray-600">AI-powered answers about equipment and rentals</p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Settings className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">24/7 Available</h3>
                <p className="text-sm text-gray-600">Always ready to help with your equipment needs</p>
              </div>
            </div>

            {/* Capabilities */}
            <div className="mt-8 bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What Kayd Can Help With:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Equipment recommendations and comparisons</li>
                  <li>• Pricing information and quotes</li>
                  <li>• Availability checking and booking</li>
                  <li>• Maintenance tips and troubleshooting</li>
                </ul>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Delivery and pickup scheduling</li>
                  <li>• Insurance and safety information</li>
                  <li>• Equipment specifications and features</li>
                  <li>• Local equipment supplier connections</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
